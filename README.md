# Promo Video

**Type `START PROMO VIDEO`, answer a few questions, get a showreel-grade promo for your product.**

An installable agent skill that turns your agent into a senior motion designer. It studies your product (source code, a description, screenshots or a URL), picks up your brand's style, generates music, sound effects and missing art with whatever generation tools you have installed, cuts every scene to the beat, and renders the film with [HyperFrames](https://github.com/heygen-com/hyperframes) (HTML-to-video).

[Install](#install) · [Use it](#use-it) · [What you get](#what-you-get) · [How it works](#how-it-works) · [Requirements](#requirements)

## Install

```bash
npx skills add vyntizs-dev/promo-video
```

Choose your agent in the installer. To install globally for a specific agent:

```bash
# Claude Code
npx skills add vyntizs-dev/promo-video -g -a claude-code

# Codex
npx skills add vyntizs-dev/promo-video -g -a codex
```

<details>
<summary>Manual installation</summary>

Copy this repository into a folder named `promo-video` in your agent's skills directory. Keep `SKILL.md`, `references/`, `scripts/` and `examples/` together.

- **Claude Code:** `~/.claude/skills/promo-video/` for personal use, or `.claude/skills/promo-video/` for a project.
- **Codex:** `~/.codex/skills/promo-video/`.
- **Other compatible agents:** their documented skill directory.

Start a new agent session afterwards so the skill is picked up.

</details>

## Use it

Type this in your agent:

```text
START PROMO VIDEO
```

The agent asks one question at a time.

1. **Your product.** Point it at source code (`~/code/my-app`), paste a description, drop screenshots, or give a URL. It studies the input and only asks follow-ups when something is genuinely missing.
2. **Your style playbook (optional).** A path to a style guide or design system. Without one, it pulls the style from your code (CSS tokens, fonts, assets) or your screenshots.
3. **Extras**, all with defaults:
   - format (16:9 master, plus an optional 9:16 for Stories, Reels and TikTok)
   - length (15s)
   - music vibe
   - your own photos or UGC to feature
   - words to use and to avoid

Then it checks which generation tools you have, confirms it has everything, and builds the film without further questions.

You can also just ask naturally. These trigger it too:

> Make a 15 second promo video for my SaaS. The code is in ~/Desktop/my-app and the brand guide is in ~/Desktop/brand.

> I need a hype trailer for our app launch. Here are 6 screenshots. Dark, sleek vibe, and give me a 9:16 version for TikTok.

## What you get

A HyperFrames project folder containing:

| File | What it is |
| --- | --- |
| `renders/<name>.mp4` | The film: 1920×1080 at 60fps with H.264 video and AAC audio, plus 1080×1920 if you asked for vertical |
| `index.html` | The composition. Every scene, transition and cue, editable. |
| `BRIEF.md` | The product truth sheet: promise, core loop, real UI words, CTA |
| `DESIGN.md` | Palette, type, surfaces, motion rules and copy rules |
| `STORYBOARD.md` | Scene by scene: timing, signature move and sound cues |
| `audio.config.json` | Beat grid, music sources and the whole sound design as grid expressions |
| `assets/` | Fonts, music, SFX, generated plates and your media |

The agent also reports what it generated, roughly what it cost, anything it uploaded, and anything it couldn't verify. It can't hear audio, so it measures instead: loudness, peaks, and whether the drop and the logo hit land on the cut.

### Re-editing later

- **Swap the music:** measure the new track with `tools/beat_grid.mjs`, add it to `audio.config.json`, then run `python3 tools/build_audio.py <track>` from the project folder. The skill copies its scripts into the project's `tools/`. The bed re-cuts to the grid and every SFX cue moves with it.
- **Change a scene:** edit `index.html`, run `npx hyperframes check`, then re-render.

## How it works

1. **Interview.** One question at a time: product, style, extras.
2. **Capability scan.**
   - Finds generation MCP servers (Unifically, ElevenLabs, Suno, Higgsfield, fal, Replicate and more), API keys and local tools (`ffmpeg`, `node`, `python3`).
   - Picks a route for music, SFX and images.
   - Falls back to the HyperFrames bundled SFX library and pure HTML/CSS design.
3. **Readiness gate.** A short summary. It only stops if something critical is missing.
4. **Direction.**
   - A one-sentence concept drawn from your brand's own visual world.
   - A six-scene arc: HOOK, INPUT, DROP/PAYOFF, BREADTH, ECOSYSTEM, LOCKUP.
   - Music chosen first. The agent measures a precise beat grid, the drop lands on your product's magic moment, and the music stops dead on the logo hit.
5. **Build** in HyperFrames.
   - Your real UI is rebuilt in HTML with your real labels.
   - Each scene gets a signature move and a different transition, with your brand's signature transition once.
   - Grain, depth layers and sound under every meaningful event.
6. **Verify.**
   - `hyperframes check` (runtime, layout, WCAG contrast).
   - Contact sheets and an animation map.
   - QC on the rendered file itself.
7. **Deliver** the renders, with an honest report.

It started as a real production for [slideshows.gg](https://slideshows.gg), a 15-second reel that shipped. Its full source and sound design are in [`examples/slideshows-gg/`](examples/slideshows-gg/), as a pattern library rather than a template.

## Requirements

- **An agent that runs shell commands**, such as Claude Code or Codex.
- **Node.js 20+ and `npx`.** HyperFrames runs through `npx hyperframes@latest`. The skill installs HyperFrames' own authoring skills if they're missing.
- **ffmpeg / ffprobe.** Needed for the music cut, audio QC and image prep. `brew install ffmpeg`.
- **Python 3.9+.** Needed for `scripts/build_audio.py`, which uses the standard library only.
- **Optional:**
  - A generation provider for music, SFX and images: an installed MCP server such as [Unifically](https://unifically.com), or an API key it can use through `scripts/unifically.mjs`. Without one, the film uses the bundled SFX library and no generated music, unless you supply a track.
  - `cwebp`, for alpha WebP plates. Without it the scripts fall back to PNG.

Generation is billed by your provider. A full film is typically well under $2: a few music candidates, about 15 sound effects and a handful of images.

## Bundled scripts

These live in `scripts/` here. The skill copies them into each project's `tools/`.


| Script | Use |
| --- | --- |
| `scripts/analyze_music.mjs <file>` | Rough BPM plus a per-second energy map, for picking a track with a clean build into a hard drop |
| `scripts/beat_grid.mjs <file> <start> <end> [bpm or beat s]` | Precise beat grid from high-frequency transients. Residuals are in ms. |
| `scripts/build_audio.py [track] --root <project>` | Cuts the bed to the grid (drop on the payoff, echo-out after the logo hit) and writes the SFX cues into the composition |
| `scripts/normalize_sfx.sh <dir>` | Peak-normalizes SFX to −1 dBFS WAV |
| `scripts/alpha_from_black.sh <in> <out.webp>` | Turns a "subject on black" plate (clouds, smoke, glow) into feathered alpha |
| `scripts/unifically.mjs dry\|run\|get\|wait ...` | REST fallback for Unifically when its MCP server isn't installed |
| `scripts/review_strip.sh <mp4> <out.jpg> [times]` | Contact strip from the rendered video |
| `scripts/audio_qc.sh <mp4> [drop] [stop]` | Loudness, true peak, unique frame count and hit alignment |

## License

MIT
