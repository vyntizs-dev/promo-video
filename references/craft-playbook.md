# Craft playbook

What made a 15-second promo read as elite, broken into reusable recipes. Values are from a shipped 1920×1080 build at 128.95 BPM (beat `B` = 0.4653s, bar = 4B). Scale them to your grid and canvas; don't copy them blindly.

## Contents

- [DESIGN.md template](#designmd-template)
- [The 15-second arc](#the-15-second-arc)
- [Scene recipes](#scene-recipes)
- [Transitions and their math](#transitions-and-their-math)
- [Persistent layers](#persistent-layers)
- [The clock pattern](#the-clock-pattern)
- [Type and scale for video](#type-and-scale-for-video)
- [Motion vocabulary](#motion-vocabulary)
- [The elite detail pass](#the-elite-detail-pass)

## DESIGN.md template

```markdown
# <product> promo: design spec
Source of truth: <style playbook path, or the files you derived it from>

## Concept
<one sentence: world, metaphor, feeling>

## Palette (strict)
| Token | Hex | Use |
| ink | #... | headlines, UI text |
| ink-2 | #... | secondary text |
| surface / shell / canvas | #... | cards, rings, inputs |
| brand | #... to #... (angle) | CTA, active chips, accents |
| positive | #... | ready or success states |

## Type
Display: <family weight, tracking>. UI: <family weights>. Readouts: <mono>. All fonts are local @font-face files.

## Surfaces
Radii, rings, glossy or flat buttons, shadows (scaled up for video), scenery layering.

## Motion
Reveal durations, stagger, blur use, grid and BPM, transition set.

## Do / Don't
Copy rules (e.g. banned punctuation), claims policy, colors never to use.
```

The brand's hex values and fonts are law. Their *application* adapts to video: a 1px web border is invisible, so use 3 to 6px rings. Decorative glow should sit at 15 to 25% opacity, not 5%. Every font size roughly doubles.

## The 15-second arc

Six scenes, seven bars plus the lockup tail. The drop sits on bar 2, where the product does its magic.

| # | Scene | Bars | Seconds @129 BPM | Job |
| --- | --- | --- | --- | --- |
| 1 | HOOK | 1 | 0 to 1.86 | Stop the thumb. Kinetic question or promise in the brand's world. |
| 2 | INPUT | 1 | 1.86 to 3.72 | The user's action, rebuilt in the product's real UI: typing, uploading, picking. Ends on the press. |
| 3 | DROP/PAYOFF | 2 | 3.72 to 7.44 | Music drops on the release. The product's output bursts out and resolves beat by beat. |
| 4 | BREADTH | 2 | 7.44 to 11.17 | "It does more": a fixed anchor (a phone, a card) while the options cycle on the beat, stacking the message. |
| 5 | ECOSYSTEM | 1 | 11.17 to 13.03 | Integrations, campaigns, platforms orbiting the product. Only the ones that are real. |
| 6 | LOCKUP | tail | 13.03 to 15 | Music stops dead. Logo, tagline, CTA pill, URL in the hero world. Hold. |

Rhythm label: `HIT / BUILD / DROP+FLASH / FLIGHT / WHIP / STACCATO / WIPE / ORBIT / IMPLODE+STOP / HOLD`.

Other lengths:
- **10s:** merge BREADTH into PAYOFF and drop ECOSYSTEM.
- **30s:** give PAYOFF and BREADTH 4 bars each and add a second feature scene.

## Scene recipes

Each recipe lists its layers, then its moves (tweens are `from → to, duration, ease`), then its SFX.

### 1. HOOK: burst out of the world, kinetic question

**Layers**
- Sky or brand-world background under a slow camera push-in: scale 1.16 → 1, 2s, power2.out.
- Drifting cloud plates for parallax.
- A radial white glow behind the type.
- A bottom mist gradient.

**Cold open.** Frame 0 is full white.
- The white fades out: 0.34s, power2.in.
- A huge cloud plate scales 1.25 → 3.6 and rises −320px while its opacity falls to 0 (0.85s, power1.in).
- Two side puffs fly outward and scale up.

It reads as the camera bursting out of a cloud.

**Type.** Three words, three *different* entrances, on the beat:
- **Slam:** scale 1.7 → 1, blur 18 → 0px, 0.45s, power4.out.
- **Side snap:** x +240 → 0, blur, 0.4s, expo.out.
- **Rise and rotate:** y 150 → 0, rotation 7 → 0, 0.55s, circ.out. Lands on beat 2.

**Signature.** A glossy brand sparkle pops in (back.out(3)) as the dot of the "i". Use the dotless `ı` (U+0131) in a relative span, with the SVG absolutely positioned inside it.

**SFX:** cloud whoosh at 0, two soft swishes on the first two words, a glass shimmer on the sparkle.

### 2. INPUT: the product's own composer

**Layers.** Rebuild the real input card at video scale from the product's components and tokens: card radius about 36, a 6 to 8px pale ring, a large soft shadow. Float it in the brand world on a slow push: scale 1 → 1.035 and rotationX 8° → 2° with `transformPerspective: 1800`.

**Moves**
- **Rows reveal:** y 18, blur 6 → 0, stagger 0.055.
- **Typing:** a proxy maps time to `str.slice(0, floor(p*len))`. The caret is solid while typing and blinks at 0.5s after. The active input gets a brand ring (border plus a 7px 16% glow).
- **Reference chip:** a thumbnail pops in (back.out(2.2)), then an `@img1` mention chip, then the second field types fast.
- **Cursor:** a custom SVG pointer decelerates in from off-frame (0.5s, power3.out) and lands a few px off-center of the button.
- **Hover:** brightness 1.12.
- **Press:** the button and cursor scale to 0.92 together (power2.in).
- **Release on the drop:** back.out(3), two ripple rings (scale 0.4 → 3.4 / 4.2), and the scene burns (brightness 1.9) into the flash.

**SFX:** a zoom swoosh into the scene, a typing burst, taps on the chip pops, a click on the press, a riser that ends exactly on the drop.

### 3. DROP/PAYOFF: output bursts out and develops on the beat

**Layers**
- Blurred sky.
- A 3D stage with `perspective: 2400px` holding a `preserve-3d` world of N output cards. In 16:9, use a fanned row at x offsets ±420/±840 with z −130·|i|, rotationY −10·offset and a small rotationZ. In 9:16, use a 3 + 2 grid.
- A status pill.
- A particle layer.

**Burst.** Each card flies from the button's screen position: x/y offset to the origin, z −520, scale 0.12, rotationZ ±22° → its slot (0.9s, expo.out). It is staggered by distance to the origin. Its blur of 16 → 0 rides the same ease.

**Particles.** 32 brand-colored sparkle SVGs on a pure ballistic formula of `(t - drop)`: seeded velocity, drag (1 − 0.3T) and gravity 1500. They fade over the last 45% of their flight.

**Develop per beat.** Each card starts as a skeleton: a gradient, a traveling sheen and a spinner with "Generating". On beat k:
1. A white card flash: 0.95 → 0, 0.42s.
2. The image swaps in, scaling 1.14 → 1.
3. The caption's words pop in (stagger 0.03, back.out(2)).
4. The index chip pops.

A pill counts "Generating 1/5" to "5/5". Its bar steps in scaleX, then flips to a green check and "ready".

**Camera.** The world drifts: rotationX 9 → 3, rotationY 5 → −5, z −160 → 30, across the whole scene (sine.inOut).

**SFX:** a sub-hit on the drop, a glass shimmer, a card-shuffle flutter, a camera shutter on every develop beat, a low synth ping on "ready".

### 4. BREADTH: fixed anchor, cycling options

**Anchor.** A phone (or card) pinned on one side with a gentle 3D drift: rotationY 18 → 8. Rebuild the real destination UI: the platform's chrome, scrims, caption, dots.

**Stacked message.**
- On beat 0, line 1 slams in, and the phone re-types its caption.
- On beat 2, line 2 side-snaps in and line 1 dims to 0.26 opacity.
- On beat 6, line 3 rises and line 2 dims.

For example: "Your copy." / "Your style." / "Every slide." This makes the message readable as one sentence at the end.

**Cycle on beats 2 to 5.** Hard-cut the same content through its variants (for example, the same photo restyled). Each cut gets:
- a scale punch, 1.08 → 1
- a 0.7 white flash on the screen
- the matching chip activating: a gradient background layer switched by opacity, with the text color set

**Swipes on half-beats 6, 6.5 and 7.** The content strip moves one panel per swipe (0.2s, power3.inOut) and the dots advance. Only the on-screen panel is visible; set the others to opacity 0, otherwise contrast and occlusion checks flag the text clipped off-screen.

**SFX:** a whip whoosh in, a tap when the chips appear, a flick on each cut and each swipe.

### 5. ECOSYSTEM: orbit, tethers, implode

**Layers**
- A hub object (the brand's 3D icon) with a breathing bloom behind it.
- N logo tiles on an ellipse (rx 640, ry 250 in 16:9; about 400 × 290 in 9:16). They are positioned per frame by the clock: angle = base + 0.32·t. Depth scale is 0.8 + 0.26·(1+sin a)/2, and z-index follows the sign of sin(a).
- Dashed SVG tether lines drawn out from the hub to each tile (ease-out over 0.4s, staggered). Their dashoffset flows with t.
- A caption waterfalls in word by word.

**Implode into the lockup.** In the last 0.3s the orbit radius collapses on a cubic curve, the tiles shrink and fade, and the hub swells to 1.32. A white bloom (a radial circle scaled from 0 to about 10) covers the frame on the cut.

**SFX:** a cloud whoosh (the wipe in), taps on the tile pops, a riser ending on the hit, a reverse-feel swoosh into the implode.

### 6. LOCKUP: music stops, the brand holds

**Layers.** The brand's hero world (for example, meadow plus hill cutouts rising from the corners, y +440 → 0 at 0.95s power3.out) with a white mist at the bottom and a white glow behind the lockup. Side puffs part outward as the bloom fades.

**Moves**
- The mascot or logo springs in: scale 0 → 1, rotation −70 → 0, back.out(2.2). A small star glint follows.
- The wordmark letters rise out of an overflow mask: yPercent 115 → 0, stagger 0.032, expo.out.
- The tagline blurs in: 10 → 0px.
- The CTA pill (glossy brand gradient plus an arrow disc) and the URL pill pop in (back.out(1.9)).
- One shine sweep crosses the CTA and finishes before the last frames. Then hold.

**Audio.** Dry music cut on the hit. The last beat echoes out (4 repeats, lowpassed, decaying). Add a sub boom, a dark pad tail, a shimmer on the mascot, a tap on the CTA and a soft ping on the shine.

## Transitions and their math

Use a different transition for every cut, and make the brand's signature one the centerpiece. Outgoing scene content must be fully visible when the transition starts; the transition *is* the exit.

**Zoom through** (HOOK → INPUT):
- **Outgoing:** scale 1 → 1.55, blur 0 → 18px, 0.3s power3.in, ending on the cut. Set its transform-origin to the last word.
- **Incoming:** scale 0.72 → 1, blur 16 → 0, 0.62s expo.out, starting 0.06s before the cut. Hide the old scene 0.08s after the cut.

**Flash on the drop** (INPUT → PAYOFF): a full-frame radial white centered on the pressed button rises 0 → 0.96 over 0.07s, then fades to 0 over 0.55s. Swap the scenes under its peak.

**Velocity-matched whip** (PAYOFF → BREADTH):
- **Exit:** power3.in over D_out px in T_out.
- **Enter:** power3.out from D_in in T_in.
- **Matching:** power3 edge velocity is 3·D/T, so D_in = D_out·T_in/T_out. For example, −820px in 0.24s pairs with +1435px in 0.42s. Put blur on the wrapper: 26px peak.

**Brand wipe** (BREADTH → ECOSYSTEM), for example a cloud bank. Build a wide container with three parts:
- a soft-edged white core, with a 12% feather on each side
- alpha cloud plates overlapping both of its edges
- extra puffs for a lumpy silhouette

The math, in container coordinates, with frame width W and a white span [a, b]:
- The frame is fully covered when x ∈ [W − b, −a]. The span b − a must exceed W by a margin.
- Travel from x_start (just off one side) to x_end, where the **far edge of the last cloud** has fully left the frame. Get this wrong and a cloud stays on screen for the rest of the film, which happened once in a 9:16 cut.
- Pick the ease (power2.inOut) and duration, invert the ease to find the time fraction where x hits the middle of the coverage window, then start at `cut − fraction·duration`.
- Swap scenes at the cut.

**Implode bloom** (ECOSYSTEM → LOCKUP): the circle's solid radius (70% of its radius times the scale) must exceed the distance from its center to the farthest frame corner by the time of the swap. End at scale ≥ corner distance / (0.7·r), about 9.5 for a 16:9 center, about 10.5 for 9:16. Swap about 0.012s after the cut.

## Persistent layers

- **HUD chrome.** A brand pill (logo plus wordmark) on one side and a scene ticker on the other (`01 / IDEA`, a mono number plus a label). Build the ticker as stacked, absolutely positioned items switched by opacity and y. A scrolling inline strip can't transform. Hide the HUD on the lockup, under the bloom.
- **Grain.** An SVG `feTurbulence` noise tile at about 0.13 opacity, `mix-blend-mode: overlay`, jittered with seeded offsets at 24 steps per second. On light canvases it kills banding and the "blank slide" feel.
- **Vignette.** A radial of brand-tinted ink at 16% on the edges.

## The clock pattern

Drive every procedural effect from **one** tween: `tl.fromTo(clock, {t:0}, {t:END, duration:END, ease:"none", onUpdate: () => frame(clock.t)}, 0)`. Inside `frame(t)`, compute, as pure functions of `t`:
- typing text and caret visibility
- spinners and sheens
- counters
- particles
- orbits and tethers
- grain

This is seek-safe in both directions, and GSAP never fights you for those properties. Use GSAP tweens for everything else, and never let both touch the same property of the same element.

Grid constants live at the top: `const B = <beat>; const C1 = 4*B, C2 = 8*B, ...`. Within a scene, express times as `Ck + f*(Ck+1 − Ck)` so a new tempo rescales everything.

## Type and scale for video

- **Headlines:** 128 to 260px at 1920 wide, tracked −0.035em.
- **UI text:** 26 to 36px. Labels at least 20px.
- **9:16 viewed on phones:** keep body text at 28px or more.
- **Wordmark:** 176 to 184px.
- Bold (700) for anything under 24px that sits on photos. Text over photos gets a platform-style scrim.

## Motion vocabulary

- **Entrances:** power4.out (slam), expo.out (snap), circ.out (heavy rise), back.out(2 to 3) (pops only).
- **Repositioning:** sine.inOut or power1.inOut.
- **Exits into a cut:** power3.in.
- Use at least three eases per scene, vary the direction, and offset the first move 0.1 to 0.3s after the cut.
- Blur only what travels fast or slams, and land it sharp before anyone needs to read it.

## The elite detail pass

Before calling it done, check each one:

- [ ] Every cut sits on a bar line. The drop lands on the product's magic moment. The music stops on the logo hit.
- [ ] Each scene has one signature move you could describe in a sentence.
- [ ] The UI is rebuilt from the real product, with the real labels, at video scale.
- [ ] Every scene has three or more depth layers and ambient drift. Nothing sits dead-still except the final hold.
- [ ] No two consecutive transitions are the same. The brand's signature transition appears once.
- [ ] One hero accent color per frame. Neutrals are tinted toward the brand.
- [ ] Every meaningful visual event has a sound. The SFX match the music's attitude.
- [ ] The copy follows the brand rules. There are no invented claims.
- [ ] The final frames are clean: no half-finished shine, no stray overlay.
- [ ] Every text frame passes contrast (the `check` gate).
