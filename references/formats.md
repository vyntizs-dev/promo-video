# Formats: the 16:9 master and 9:16 vertical cuts

Build the 16:9 master first. For vertical, **copy the project** into `<name>-9x16/` and re-lay out every scene; a crop of the master is not acceptable. The timeline, grid and audio stay identical, so only the layout changes. Keeping the portrait layout in one override block at the end of the `<style>` tag, plus a few geometry constants in the script, makes the diff reviewable.

## Delivery specs

| Destination | Canvas | FPS | Notes |
| --- | --- | --- | --- |
| Site hero or showcase | 1920×1080 | 60 | H.264 High, yuv420p, AAC. Autoplay muted loop: the lockup-to-opening transition is a white flash, so it loops cleanly. |
| Instagram Stories and Reels, TikTok, Shorts | 1080×1920 | 60 | H.264 High, AAC, faststart, 15s fits one Story. Upload the file itself, not a screen recording. |
| X, LinkedIn feed | 1080×1350 (4:5) or 1920×1080 | 30 to 60 | Put the lockup in the center band. |

Use 60fps for everything with fast motion. A 30fps vertical render looked choppy to the user on a phone. Confirm the result with the unique-frame count (see verification).

## The vertical safe zone (1080×1920)

Keep all text, UI and the CTA inside **y 250 to 1600**:
- The top 250px sits under the platform's progress bar, avatar and name.
- The bottom 320px sits under the reply bar and caption.

The side margins are at least 54px.

## Re-layout checklist (what changed in a shipped 9:16 cut)

- **Canvas.** Update the viewport meta, the `html`, `body` and `#root` sizes, and the root's `data-width`/`data-height`.
- **HOOK.** The headline breaks onto two lines. Use a `flex-basis:100%` line-break span between words, rather than relying on wrap, at a bigger font (about 262px). Re-place the cloud plates for the tall frame.
- **Composer.** Use full width (960px) with bigger UI text (34 to 38px). Give fields fixed heights, so the button center is a known constant for the cursor target, ripples, flash center and particle origin. Let the prompt wrap to two lines.
- **Output cards.** Change the wide fan to a 3 + 2 grid (300×533 cards) in the tilted 3D world. The status pill sits under the grid, still above y 1600.
- **Anchor scene.** The phone goes on top, in a static 0.86 scale wrapper, with the stacked lines and chips centered below.
- **Orbit.** Make it rounder (rx 400, ry 290), centered around y 840, with the caption on two lines below.
- **Lockup.** Stack it vertically: mascot, wordmark, tagline, then the CTA and URL pills side by side, all over the sky. Put the meadow and hills in the bottom 40%.
- **Transitions.** Rescale the whip distances to the width (D_out about 560, D_in about 980 for the same timing). **Recompute the brand wipe's travel** for the new width and height. A cloud left on screen washed out the last two scenes of a 9:16 cut until its end x was extended. Recompute the bloom radius for the farther corners.
- **HUD.** It sits at y about 246, just under the platform header, a little larger (74px pills).

Re-run `check` and snapshots on the vertical cut, because it produces its own contrast and overlap findings.
