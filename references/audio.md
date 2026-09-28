# Audio: music, grid, bed and sound design

Sound carries the rhythm of a promo; the edit follows the music, never the other way round. The pipeline is:

1. Pick the vibe.
2. Generate several candidates.
3. Choose one by structure.
4. Measure a precise beat grid.
5. Cut the bed to the grid.
6. Generate and level the SFX.
7. Write the cues from the grid.
8. Verify in the rendered file.

## Contents

- [Vibe and prompts](#vibe-and-prompts)
- [Choosing a candidate](#choosing-a-candidate)
- [Precise beat grid](#precise-beat-grid)
- [The bed and the echo-out](#the-bed-and-the-echo-out)
- [Sound design palette](#sound-design-palette)
- [Levels](#levels)
- [Verify in the render](#verify-in-the-render)

## Vibe and prompts

Ask for the vibe in the interview. If the user skips it, default to **dark, sleek and confident**. In testing, a user rejected a bright uplifting melodic-house bed with plucky synths as "childish/playful" for a SaaS reel. The darker, more unique beds landed.

Suno through Unifically (`suno-ai/music`, `mv: chirp-hawk`, `custom: true`, `make_instrumental: true`) works well with a structure prompt plus tags:

```
prompt: "[Instrumental]\n[Intro: tense filtered build, 4 bars]\n[Drop: hard, dark, rolling bass]\n[Break]\n[Drop 2]\n[Outro: final hit]"
```

Tags that produced keepers:

- **dark minimal tech house:** fashion runway, sleek and hypnotic, gritty rolling bassline, tight punchy kick, metallic percussion, filtered tension build then hard drop, confident, cinematic, 130 bpm, instrumental
- **dark cinematic bass house:** distorted 808 bass, hard hitting drums, tense string stabs, sleek luxury fashion ad, aggressive but polished, big drop, 128 bpm, instrumental

Negative tags: `vocals, singing, happy, cute, cheerful, ukulele, whistle, childish, bright plucks, eurodance, lo-fi`.

- Ask for a BPM near 128 to 130: 4 beats is about 1.86s, which is exactly right for 1-bar scenes.
- Fire 2 or 3 prompts at once. Each Suno task returns 2 clips, so you get 4 to 6 candidates. They cost cents.
- Songs run 2 to 3 minutes, so you are choosing a *section*, not a song.

## Choosing a candidate

`node tools/analyze_music.mjs <file>` prints a rough BPM and a per-second energy map written as `second:full/sub`. You want this shape:

```
... 10/1  9/0  9/0  8/0 | 19/15 19/16 20/16 ...
    filtered build, no sub  | hard drop, sustained for 10+ seconds
```

- The pre-drop seconds should have almost no sub (`/0` or `/1`). That is a filter build, perfect under the HOOK and INPUT scenes.
- The drop should be a clean step to high full and sub energy that sustains through PAYOFF, BREADTH and ECOSYSTEM (about 9.3s at 129 BPM).
- Reject candidates with patchy energy after the drop, or where no clean build precedes it.

You cannot listen, so choose by structure and genre fit, and say so. If two candidates are close, keep both; they can share one grid if you time-stretch one of them.

## Precise beat grid

`node tools/beat_grid.mjs <file> <start> <end> [approx]` (approx is a BPM such as `129` or a beat period in seconds such as `0.465`; pick a window of 8 to 15 s right after the drop) fits a half-beat grid to **high-frequency transient onsets** (kick and clap clicks above 3 kHz) across a window after the drop. It prints the beat period, BPM and a `t0` on the grid, plus residuals in ms, which should be single digits.

Why not the low end? Low-passed energy envelopes peak about 100ms after the audible kick attack, because the sub rises slowly. A grid fitted to them puts every visual hit a few frames late. The click transient is where the ear places the beat.

The drop downbeat is the first on-grid onset where the energy steps up. Cross-check it against `analyze_music.mjs`.

To share one grid across two tracks, time-stretch the second one with `atempo = target_bpm / its_bpm`. `tools/build_audio.py` does this. A stretch under about 1% is inaudible.

## The bed and the echo-out

`tools/build_audio.py` reads `audio.config.json` in the project root:

```json
{
  "bpm": 128.95,
  "end": 15.0,
  "marks": { "C1": 4, "C2": 8, "C3": 16, "C4": 24, "C5": 28 },
  "drop_mark": "C2",
  "stop_mark": "C5",
  "echo": { "repeats": 4, "gains": [0.5, 0.3, 0.17, 0.09], "lowpass": [3200, 1900, 1100, 700] },
  "bed_volume": 0.9,
  "sfx_dir": "assets/sfx",
  "tracks": {
    "main": { "src": "assets/music/src/main.mp3", "drop": 34.162, "bpm": 128.95 }
  },
  "cues": [
    { "name": "drop", "file": "subhit", "at": "C2", "dur": 2.5, "vol": 0.55 },
    { "name": "shut", "file": "shutter", "at": "C2 + k*B", "for": { "k": [1, 2, 3, 4, 5] }, "dur": 0.44, "vol": 0.28 }
  ]
}
```

`python3 tools/build_audio.py [track] [--html index.html] [--root .] [--cues-only]` (run it from the project root):

- **Cuts the bed.** The track's drop lands on `drop_mark`, and the dry music ends on `stop_mark` with 12ms fades.
- **Echoes out.** The last beat before `stop_mark` repeats on the grid, darker and quieter each time. This makes the hit feel intentional rather than truncated.
- **Writes the cues.** It rewrites the `<audio>` elements between `<!-- AUDIO:BEGIN -->` and `<!-- AUDIO:END -->` in the HTML. Tracks are allocated greedily so no two clips overlap on one track, and every clip gets an `id`.
- **Updates the beat constant.** It rewrites `const B = …; /* AUTO:BEAT */` in the script.

Cue `at` values are expressions over `B`, `END`, the marks and any `for` variables, so the whole sound design moves with the grid.

## Sound design palette

Generate custom SFX (for example ElevenLabs `sound-effect` through Unifically: `text`, `duration`, `prompt_influence` 0.6 to 0.8). Name effects concretely:

| Role | Prompt that worked |
| --- | --- |
| Open / wipe | airy cinematic whoosh flying fast through clouds, soft wind swell rushing past camera |
| Word slams | short fast clean swish whoosh, modern UI transition, crisp air |
| Zoom into scene | big whooshing camera swoop pass-by, deep and airy |
| Build | short rising whoosh riser, reverse cymbal swell, ends abruptly (2s, placed to end on the drop) |
| Typing | fast crisp mechanical keyboard typing, close mic, short burst |
| Pops and chips | tight tactile low UI tap, soft rubbery click, premium hardware button, dry |
| Press | satisfying premium UI button click, soft glassy tap, close mic |
| Drop hit | massive cinematic sub drop impact with a metallic transient and a long dark reverb tail |
| Sparkle | subtle airy glass shimmer swell, cinematic, clean, expensive, no chimes melody |
| Develop / capture | modern smartphone camera shutter click, crisp |
| Cards burst | stack of glossy photo cards fanning out quickly |
| Swipes | quick phone screen swipe flick, photo card sliding fast |
| Success | deep soft synth ping with short reverb, sleek modern UI confirmation, not cute |
| Logo hit | deep cinematic sub bass boom impact with airy reverb tail |
| Lockup tail | dark cinematic sustained synth pad swell with a long reverb tail |

Avoid "cute": bubbly pops, fairy-dust sparkles and melodic chimes read as childish next to a dark bed.

Without a generator, use the HyperFrames `media-use` bundled library (whoosh, pop, click, chime, riser, impact-bass, glitch, typing and more). Its manifest gives the durations: a riser of `d` seconds starts at `hit − d`.

## Levels

- Run `tools/normalize_sfx.sh <dir>` to peak-normalize every SFX to −1 dBFS WAV (48 kHz stereo). Generated files arrive anywhere from −13 to 0 dBFS, and normalizing makes `data-volume` meaningful.
- **Starting volumes:**
  - bed: 0.9
  - hits: 0.5 to 0.6
  - whooshes: 0.4 to 0.6
  - taps and clicks: 0.3 to 0.55
  - shutters and flicks: 0.28 to 0.4
  - shimmer and pings: 0.32 to 0.45
  - pad tail: 0.45
- **Mix target:** about −15 LUFS integrated, true peak at or below −1 dBFS.

## Verify in the render

`tools/audio_qc.sh <mp4> <drop_time> <stop_time>` prints integrated loudness and peak, plus a 10ms sub-energy trace around both marks. The drop should jump within one frame of `drop_time`, and the boom should arrive right at `stop_time`. Report the numbers. Don't claim the mix "sounds" good.
