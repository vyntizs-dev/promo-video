# Example: slideshows.gg showreel

The composition that shipped as the slideshows.gg 15-second promo. It's a **pattern library**: read it for how things are built, not for its content. Its assets (fonts, images, music, SFX) are not included, so it won't render as-is.

| File | What to learn from it |
| --- | --- |
| `index.html` | 6 scenes in one standalone composition. It shows: grid constants (`B`, `C1..C5`); the clock-driven procedural layer (`frame(t)`: typing, spinners, particles, orbit, grain); rebuilt product UI (a composer, a TikTok phone); all five transitions (zoom-through, drop flash, velocity-matched whip, cloud wipe, implode bloom); the HUD ticker; and the `AUDIO` markers. |
| `audio.config.json` | The full sound design as grid expressions, with two music beds on one grid (the second is time-stretched). `scripts/build_audio.py` reproduces the shipped bed bit-exactly. |
| `portrait-9x16-overrides.css` | The CSS block that re-lays out every scene for 1080×1920 Stories while keeping the timeline. |
| `DESIGN.md`, `STORYBOARD.md` | The design spec and scene plan written before the build. |

Scene times match the final 128.95 BPM grid in `audio.config.json`.
