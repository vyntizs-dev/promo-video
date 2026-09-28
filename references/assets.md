# Assets: sourcing, generation, preparation

In order of preference:

1. **The user's own media.** Real UGC, product shots and customer content beat everything. In testing, a user swapped out the site's stock art for their own photos because "some are really not that good".
2. **The product's own art.** Look in `public/`, `assets/` and the landing page images: mascots, 3D icons, hero scenery, partner and app logos the product really uses.
3. **Rebuilt UI in HTML and CSS.** Composers, cards, phones, pills. Pixel-sharp at any scale.
4. **Generated plates**, for atmosphere and missing pieces only. Generated images must never pose as proof: no fake screenshots of results, no fake customers.

## Fonts

Download the brand's fonts as local `woff2` and declare `@font-face` with `font-display: block`. Fontsource on jsDelivr works for Google fonts:

```bash
curl -sfL -o assets/fonts/<family>-latin-600-normal.woff2 \
  "https://cdn.jsdelivr.net/fontsource/fonts/<family>@latest/latin-600-normal.woff2"
```

The Latin subset includes U+0131 (dotless ı), which the sparkle-as-i-dot trick needs.

## Images for slides, cards and phones

- Convert to about 720px-wide JPG (`ffmpeg -i in -vf scale=720:-2 -q:v 3 out.jpg`). They display at 300 to 420px, so anything bigger just slows the render.
- Keep 9:16 images for card and phone surfaces, and crop with `object-fit: cover` plus `object-position` so the faces stay in frame.

## Generated atmosphere plates: objects on black, then alpha

Image models can't reliably produce transparency. Generate the subject **isolated on pure black**, then key the luminance into alpha:

- Prompt: "A wide dense bank of soft fluffy bright white cumulus clouds … isolated on a pure solid black background, volumetric soft lighting, soft feathered edges, no sky, no horizon, no blue, pure black negative space".
- Run `tools/alpha_from_black.sh in.jpg out.webp [width]`. It:
  1. Builds alpha from luminance with a curve that crushes the black floor.
  2. Lifts the color toward white (`val*0.28 + 255*0.72`), so the semi-transparent edges don't show dark fringes on light backgrounds.
  3. Feathers the left, right and bottom edges. Plates that touch the image border otherwise show a hard vertical seam when they're only partly on screen.
  4. Writes WebP with alpha, or PNG when `cwebp` is missing.

This works for clouds, smoke, mist, light leaks and glows. Use the plates for fly-throughs, wipes and parallax.

## Restyles of the user's photo (for a "styles" beat)

To show one piece of content in several styles, edit the user's own image with a reference-capable model (Nano Banana Pro, GPT Image). For example: "Redraw this exact photo as official Grand Theft Auto VI loading screen key art … Keep the same person, same pose, same framing, same object. Vertical 9:16 full-bleed, no text, no logos". Or "… as a Minecraft in-game screenshot, blocky voxel …". Consistency across styles is what sells the beat.

**Getting a URL for the reference image.** Try these in order:

1. **The provider's upload tool:** for example `mcp__unifically__upload_file`, if present.
2. **The user's own private storage with a short-lived signed URL.** For example, their app's Supabase bucket, the same way their product hands references to providers.
3. **Ask the user.** Never push their photos to a random public host.

Tell the user what you uploaded, and where.

## Model gotchas seen in practice

- **Nano Banana Pro via Unifically:**
  - It rejects `seed` (`Extra inputs are not permitted`).
  - Aspect ratios are only `1:1, 16:9, 9:16, 4:3, 3:4, auto`, so no 21:9.
  - `resolution: "2K"` is plenty.
- **Unifically REST:**
  - Task results come as `data.output.image_url` or `audio_url`. Suno returns `audio_url1` and `audio_url2`.
  - A `dry_run: true` POST returns the price and spends nothing.
- **Read the provider's model docs page before the first call of a session.** Parameters change, and a wrong one is a paid failure.

## Logos and icons

- Use the logos the product really shows (its integrations or campaigns). Put them in white rounded tiles, scaled to 104% inside the tile so their own transparent corners don't show.
- The product's mascot or 3D icon is the lockup's hero. Save its first full reveal for the end, and let it appear small in the HUD before that.
