# Verification and gotchas

The QA loop, and every trap that cost a revision in a real build. Read this before `check` goes red. Better still, read it before you write the HTML.

## The loop

1. `npx hyperframes@<ver> lint`: structural issues, run after every big edit.
2. `npx hyperframes@<ver> check`: **the gate**. It covers lint, runtime errors, layout (overlap, occlusion, overflow) and WCAG contrast. It fails on persistent findings.
3. `npx hyperframes@<ver> snapshot --at t1,t2,… --no-end --describe false --timeout 15000`. It writes PNGs plus `snapshots/contact-sheet*.jpg`.
   - Shoot every scene midpoint, every transition peak, and 0.2s before each cut.
   - Use `--zoom "x,y,w,h" --zoom-scale 1` for type details, such as the alignment of a sparkle over a letter.
4. **Animation map.** It needs a one-time helper bootstrap:
   ```bash
   HYPERFRAMES_SKILL_BOOTSTRAP_DEPS=1 HYPERFRAMES_SKILL_PKG_VERSION=<ver> \
     node <hyperframes-animation skill>/scripts/animation-map.mjs . --out .hyperframes/anim-map
   ```
   Look at `deadZones` (it should be empty), `paced-fast` flags (make sure they're intentional) and `overlapping_gsap_tweens`.
5. Render, then QC the MP4 itself with `tools/review_strip.sh` and `tools/audio_qc.sh`. The render is the truth; a snapshot is not.

Batch visual checks into contact sheets at phase boundaries. Every image you view costs context.

## Gotchas that bit a real build

**Timeline and GSAP**
- **`fromTo` renders its from-state at build time** (`immediateRender`). A ripple ring authored as `fromTo({opacity: 0.95}, …)` at the drop was visible from frame 0. For anything that must stay hidden until its tween, add `immediateRender: false` and let the CSS hold the hidden state.
- **Several `fromTo` calls on one element** need a baseline. Either add `tl.set(el, {...}, 0)` or put `immediateRender: false` on every later call. Lint flags `gsap_repeated_fromto_without_baseline`.
- **Overlapping tweens on the same property** jitter. For example, a chip's entrance scale overlapping a pop on the next beat. Pop a child layer instead, or shorten one of the tweens.
- **Don't set a CSS `transform` on elements GSAP animates.** Wrap them in a static scale div when a layout needs scaling (the 9:16 phone, for example).
- **Inline elements can't transform.** A `<span>` ticker strip never moved. Use `display: block`, or stack absolute items and switch them by opacity.

**Standalone multi-scene structure**
- `.scene` divs don't take `class="clip"`. Only the root carries `data-composition-id`, `data-start` and `data-duration`.
- Scenes 2 and later start at `opacity: 0` in CSS and are revealed with `tl.set` at the transitions.
- **Leftover overlays.** A wipe or overlay that doesn't fully leave the frame haunts every later scene. Compute its travel from the far edge of its last child (see the craft playbook), and snapshot the scene *after* the wipe.
- **Plates with hard edges.** A generated plate that touches its image border shows a vertical seam when it's partly on screen. Feather it (`alpha_from_black.sh` does this).

**Contrast and layout checks**
- **Off-screen text still counts.** Swipe panels clipped by a phone screen get measured against whatever is behind them. Keep only the visible panel at opacity 1.
- **Text over photos:** add platform-style scrims (a top gradient at 0.55, a bottom one at 0.5), use pure white, and set weight 700 on small text. Bold text of 18.66px or more counts as "large" (a 3:1 minimum).
- **Rotated or 3D-tilted cards** produce false `content_overlap` between wrapped words, because the axis-aligned boxes of rotated lines overlap. Put `data-layout-allow-overlap` on **the flagged elements themselves**; a wrapper attribute isn't enough.
- **Intentional crossfade layers** (a ticker mid-swap, stacked states) warn as overlaps. That's fine, as long as they're warnings rather than errors.
- **Light text on the brand's saturated blue** is borderline. Big captions on white mist in ink are safer than white on sky.

**Audio**
- Every `<audio>` needs an `id`, or it is silently dropped from the mix.
- Clips on one `data-track-index` can't overlap. Allocate tracks greedily (`build_audio.py` does).
- Keep every clip inside the composition: `start + dur ≤ END`.
- Never put `crossorigin` on media.

**Environment**
- `npx` cache permission errors (`EACCES`/`EEXIST`): prefix commands with `npm_config_cache=/tmp/npm-cache`.
- Flags change between CLI versions (`add` rejected `--non-interactive` in 0.8.79). Check `--help` before scripting a command.
- Pinning: the scaffold writes `hyperframes@<ver>` into `package.json`. Use that version everywhere, so lint, check and render agree.

## Final QC numbers to report

- The container: resolution, fps, codec, duration and size (`ffprobe`).
- Integrated loudness and peak.
- The drop and stop alignment, in ms.
- The number of unique frames (`ffmpeg -i f.mp4 -vf mpdecimate -f null -`) to prove the frame rate is real and not duplicated.
