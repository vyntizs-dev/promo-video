# slideshows.gg showreel: design spec

Source of truth: the FintechX stylebook at `/Users/fast/fintechx-design-analysis` (STYLE-HANDOFF.md, TOKENS.css) as implemented by the slideshows.gg app (`~/Desktop/gen-saas/src/app/globals.css`).

## Concept

The sky is the canvas. One typed idea falls through the slideshows.gg sky, blooms into a finished TikTok slideshow, then a feed of them, and lands on the brand in its own pastoral world.

## Palette (strict)

| Token | Hex | Use |
| --- | --- | --- |
| ink | `#1D1D1D` | headlines, UI text |
| ink-2 | `#4D585F` | secondary text, labels |
| surface | `#EDF1F4` | skeletons, inputs |
| shell | `#DDE5ED` | rings, borders |
| canvas | `#F7F9FC` | input fill |
| quiet | `#BABABA` | hints |
| brand | `#3B82F6` to `#406AE4` (110deg) | glossy CTA, active chips, spark |
| brand-soft | `#E8F0FE` | mention chips, promo badge |
| positive | `#10B981` | ready state |
| ink gloss | `#323232` to `#000` (135deg) | dark pills |

Light canvas. Sky photography carries the color; UI is white with shell rings.

## Type

- Display: Bricolage Grotesque 600, tight tracking (about -0.03em at display sizes).
- UI and body: Inter 500/600/700.
- Readouts and chrome: Geist Mono 500, uppercase, tracked.
- All fonts are local `@font-face` files in `assets/fonts`.

## Surfaces

- Radii 10 / 20 / 30 / pill. Composer and cards radius 28 to 36 at video scale.
- Shell ring: `0 0 0 6px rgb(221 229 237 / 70%)` (4px on web, scaled for video).
- Glossy pill: `inset 4px 4px 8px rgb(255 255 255 / 30%), inset -4px -4px 8px rgb(255 255 255 / 30%), 0 12px 24px rgb(58 119 229 / 50%)`.
- Pastoral layering: sky, clouds, panel or object, foreground grass hills, white mist fade.

## Motion

- Reveals 450 to 700ms with rise and blur clearing; 40 to 100ms staggers.
- Every scene cut sits on a bar line of the 130.5 BPM music bed (beat 0.4594s, bar 1.8376s).
- Transitions: zoom through, flash on the drop, whip pan, cloud wipe (the signature), orbit implode into the lockup.

## Do

- Keep copy real: the app's own UI words (Text on the slide, Image prompt, Generate, Start for free).
- Keep one accent family (brand blue) per frame.

## Don't

- No em dashes in on-screen copy.
- No invented stats, reviews or partner claims.
- No dark full-screen canvases; make light cinematic with grain, glow and depth.
