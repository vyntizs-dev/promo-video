#!/usr/bin/env python3
"""Cut the music bed to the beat grid and write the SFX cues into the composition.

Usage:  python3 build_audio.py [track] [--config audio.config.json] [--html index.html] [--root .]

Reads audio.config.json (see references/audio.md for the schema):
  * bpm / marks          -> the grid (B = 60/bpm; marks are in beats, e.g. C2 = 8)
  * tracks[track]        -> source file, its measured drop downbeat (s) and its bpm
  * drop_mark/stop_mark  -> the track's drop lands on drop_mark; dry music stops on stop_mark,
                            then the last beat echoes out on the grid (set stop_mark null to play
                            through with a fade to END)
  * cues                 -> SFX clips; "at" is an expression over B, END, the marks and any
                            "for" loop variables, so the sound design moves with the grid

Writes <root>/assets/music/bed.wav, rewrites the <audio> elements between
<!-- AUDIO:BEGIN --> and <!-- AUDIO:END --> in the HTML (allocating tracks so clips never
overlap), and updates `const B = ...; /* AUTO:BEAT */` if that marker exists.
Requires ffmpeg.
"""
import argparse
import itertools
import json
import math
import re
import subprocess
from pathlib import Path


def evaluate(expr, names):
    # Config is authored by the project owner; expressions are plain arithmetic over grid names.
    return float(eval(str(expr), {"__builtins__": {}, "min": min, "max": max, "math": math}, names))


def build_bed(root, cfg, track_name, names):
    t = cfg["tracks"][track_name]
    B, END = names["B"], names["END"]
    drop_at = names[cfg.get("drop_mark", "C2")]
    stop_mark = cfg.get("stop_mark", "C5")
    stop_at = names[stop_mark] if stop_mark else None
    tempo = cfg["bpm"] / t["bpm"]  # atempo factor that puts this track on the grid
    drop = t["drop"] / tempo
    start = drop - drop_at
    if start < 0:
        raise SystemExit(f"track drop at {t['drop']}s is too early to land on {drop_at:.3f}s")
    stretch = f"atempo={tempo:.6f}," if abs(tempo - 1) > 1e-4 else ""
    ms = lambda x: int(round(x * 1000))

    if stop_at is None:
        graph = (
            f"[0:a]{stretch}atrim={start:.4f}:{start + END:.4f},asetpts=PTS-STARTPTS,"
            f"afade=t=in:st=0:d=0.015,afade=t=out:st={END - 0.6:.4f}:d=0.6[out]"
        )
    else:
        echo = cfg.get("echo", {})
        gains = echo.get("gains", [0.5, 0.3, 0.17, 0.09])
        lows = echo.get("lowpass", [3200, 1900, 1100, 700])
        reps = min(echo.get("repeats", len(gains)), len(gains), len(lows))
        parts = [
            f"[0:a]{stretch}asplit=2[m1][m2]",
            f"[m1]atrim={start:.4f}:{start + stop_at:.4f},asetpts=PTS-STARTPTS,"
            f"afade=t=in:st=0:d=0.015,afade=t=out:st={stop_at - 0.012:.4f}:d=0.012[dry]",
        ]
        mix = ["[dry]"]
        if reps:
            parts.append(
                f"[m2]atrim={start + stop_at - B:.4f}:{start + stop_at:.4f},asetpts=PTS-STARTPTS,"
                f"afade=t=out:st={B - 0.02:.4f}:d=0.02,asplit={reps}" + "".join(f"[e{i}]" for i in range(reps))
            )
            for i in range(reps):
                d = ms(stop_at + i * B)
                parts.append(f"[e{i}]volume={gains[i]},lowpass=f={lows[i]},adelay={d}|{d}[f{i}]")
                mix.append(f"[f{i}]")
        parts.append(f"{''.join(mix)}amix=inputs={len(mix)}:normalize=0:duration=longest,atrim=0:{END},apad=whole_dur={END}[out]")
        graph = ";".join(parts)

    out = root / "assets/music/bed.wav"
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(root / t["src"]), "-filter_complex", graph,
         "-map", "[out]", "-ar", "48000", "-ac", "2", str(out)],
        check=True,
    )
    return out, start, tempo


def expand_cues(cfg, names):
    cues = []
    for c in cfg.get("cues", []):
        loops = c.get("for") or {}
        keys = list(loops)
        combos = list(itertools.product(*[loops[k] for k in keys])) or [()]
        for combo in combos:
            local = dict(names, **dict(zip(keys, combo)))
            suffix = "".join(f"{v}" for v in combo)
            start = evaluate(c["at"], local)
            dur = min(float(c["dur"]), names["END"] - start)
            if dur <= 0:
                continue
            cues.append({"name": f"{c['name']}{suffix}", "file": c["file"], "start": start, "dur": dur, "vol": c.get("vol", 0.4)})
    return sorted(cues, key=lambda x: x["start"])


def write_html(html_path, cfg, cues, names):
    sfx_dir = cfg.get("sfx_dir", "assets/sfx").rstrip("/")
    ext = cfg.get("sfx_ext", ".wav")
    lines = [
        f'      <audio id="a-bed" src="assets/music/bed.wav" data-start="0" data-duration="{names["END"]:g}" '
        f'data-track-index="10" data-volume="{cfg.get("bed_volume", 0.9)}"></audio>'
    ]
    track_end = []
    for c in cues:
        slot = next((i for i, end in enumerate(track_end) if end <= c["start"] + 1e-6), None)
        if slot is None:
            track_end.append(0.0)
            slot = len(track_end) - 1
        track_end[slot] = c["start"] + c["dur"]
        lines.append(
            f'      <audio id="a-{c["name"]}" src="{sfx_dir}/{c["file"]}{ext}" data-start="{c["start"]:.3f}" '
            f'data-duration="{c["dur"]:.3f}" data-track-index="{11 + slot}" data-volume="{c["vol"]}"></audio>'
        )
    html = html_path.read_text()
    if "<!-- AUDIO:BEGIN" not in html or "<!-- AUDIO:END -->" not in html:
        raise SystemExit(f"{html_path} needs <!-- AUDIO:BEGIN --> and <!-- AUDIO:END --> markers inside the root")
    html = re.sub(
        r"(<!-- AUDIO:BEGIN[^>]*-->\n?).*?(\s*<!-- AUDIO:END -->)",
        lambda m: m.group(1).rstrip("\n") + "\n" + "\n".join(lines) + m.group(2),
        html,
        flags=re.S,
    )
    html = re.sub(r"const B = [0-9.]+; /\* AUTO:BEAT \*/", f"const B = {names['B']:.5f}; /* AUTO:BEAT */", html)
    html_path.write_text(html)
    return len(track_end)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("track", nargs="?")
    ap.add_argument("--root", default=".")
    ap.add_argument("--config", default="audio.config.json")
    ap.add_argument("--html", default="index.html")
    ap.add_argument("--cues-only", action="store_true", help="rewrite the cues without rebuilding the bed")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    cfg = json.loads((root / args.config).read_text())
    B = 60 / cfg["bpm"]
    names = {"B": B, "END": float(cfg.get("end", 15.0))}
    names.update({k: v * B for k, v in cfg.get("marks", {}).items()})

    track = args.track or next(iter(cfg["tracks"]))
    if not args.cues_only:
        out, start, tempo = build_bed(root, cfg, track, names)
        print(f"bed: {out}  (source {track} from {start:.3f}s, atempo {tempo:.4f})")
    cues = expand_cues(cfg, names)
    tracks = write_html(root / args.html, cfg, cues, names)
    marks = "  ".join(f"{k}={names[k]:.3f}" for k in cfg.get("marks", {}))
    print(f"B={B:.5f}  {marks}  cues={len(cues)} on {tracks} tracks")


if __name__ == "__main__":
    main()
