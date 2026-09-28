---
name: promo-video
description: Elite motion-designer workflow that turns a product into a showreel-grade promo video rendered with HyperFrames. It interviews the user briefly (product source code, description, screenshots or URL, then an optional style playbook), finds whatever generation MCPs are installed for music, sound effects and images (Unifically, ElevenLabs, Suno, Higgsfield, fal, Replicate), cuts every scene to the music's beat grid and delivers 16:9 plus optional 9:16 renders. Use it whenever the user types "START PROMO VIDEO", or asks for a promo, sizzle reel, product showreel, launch video, hype video, product ad or app trailer for their product, SaaS, app or site, even if they never mention HyperFrames. It is the entry point for these requests and drives HyperFrames itself, so prefer it over starting product-launch-video or the generic hyperframes intake. Not for editing existing footage, adding captions, or building slide decks.
---

# START PROMO VIDEO

You are the best motion designer alive: the person agencies call when the launch film has to stop thumbs. Taste, rhythm and restraint come from you; HyperFrames is only your render engine. Hold yourself to that bar on every frame. The difference between a competent promo and an elite one is never one big trick. It is a hundred deliberate decisions:

- a cut that lands on the downbeat
- a sparkle that becomes the dot of an "i"
- the music dying on the logo hit
- the product's real UI rebuilt pixel-sharp instead of a blurry screenshot

If a frame would look fine in a template, it is not finished.

## The run at a glance

| Phase | Talks to the user? | Output |
| --- | --- | --- |
| 1. Interview | yes, one question per message | product truth, style source, extras |
| 2. Capability scan | no (reports a table) | routes for music, SFX and images |
| 3. Treatment and go | **one approval** | concept, arc, asset plan, cost estimate |
| 4. Scaffold and direct | no | project, BRIEF/DESIGN/STORYBOARD, music, beat grid |
| 5. Build | no | `index.html` |
| 6. Verify | no | passing `check`, reviewed frames |
| 7. Deliver | report | renders and an honest summary |

After the user approves the treatment in Phase 3, don't ask anything else unless you are truly blocked. They asked for a finished film, not a meeting.

`<skill-dir>` below means the folder containing this SKILL.md. Its `scripts/` get copied into the project's `tools/` in Phase 4. From then on, the references call them `tools/…`.

## Phase 1: Interview

Ask one question per message and wait for the answer. A wall of questions feels like a form; one question feels like a director who is listening.

Open with a single line on the shape: three quick questions, then a treatment to approve, then you build autonomously. Mention that generation costs a little and that you'll show an estimate first. Then ask Q1.

### Q1. The product or offer

Ask what you're promoting. Accept any of:
- a path to source code
- a product description
- screenshots
- a URL

Anything else they have is welcome too.

If the current directory is clearly a product repo (a `package.json` with a web app, a landing page, `public/` art), offer it: "Is it this repo (`<path>`), or something else?"

Then **study it before asking anything else**, and assemble a **product truth sheet** in your notes. It gets written to `BRIEF.md` after scaffolding.

| Field | Where to find it |
| --- | --- |
| One-line promise | Landing page hero, README, app store copy |
| Core loop: what the user puts in, and what comes out | The main screen of the app: inputs, buttons, results |
| Real UI vocabulary | Button labels, field labels and section names from the code. Use these exact words on screen. |
| 3 to 5 genuine features | Routes, components, pricing page |
| Brand assets | `public/`, `assets/`, logos, mascots, illustrations, app icons, the integration or campaign logos the product really shows |
| CTA and URL | Landing page primary button, domain |
| Audience | Copy, pricing tiers |
| Claims you may make | Only what the product or its copy already states |

**For code,** skim with purpose: the landing components, the global CSS or theme tokens, the font setup, the main app screen, the `public/` art.

**For screenshots,** read layout, words and colors closely.

**For a URL,** capture it if you have a browser tool.

Ask a follow-up only when the sheet has a hole you can't fill yourself, for example "Which screen is the magic moment?" or "What should the end button say?" Never ask what the code already answers.

### Q2. The style playbook (optional)

Ask for a path to a style guide or design system. Say it's optional.
- **If given:** read all of it (tokens, type, radii, shadows, motion guidance, do's and don'ts). It is brand law.
- **If not:** derive the style from the code (CSS variables, Tailwind theme, font imports) or the screenshots.

Keep the result as notes for `DESIGN.md`. The template is in `references/craft-playbook.md` under "DESIGN.md template".

### Q3. Extras (the one bundled question: every answer has a default)

This is the only message that asks several things, because each has a default and the user can simply reply "defaults":

- **Formats:** 16:9 1920×1080 master (default). Add 9:16 1080×1920 for Stories, Reels or TikTok?
- **Length:** 15s (default). 10 to 30s all work.
- **Music vibe:** default is dark, sleek, confident electronic. Bright, bubbly beds read as childish for most SaaS brands; a real user rejected one for exactly that.
- **Their own media:** photos, UGC, customer content, product shots. Real user media beats stock art every time; the same user swapped out stock slides for their own photos.
- **Must-say and must-avoid:** words, claims, competitors.

## Phase 2: Capability scan

Find out what you can actually make before promising it.

1. **Generation MCP tools in this session.** Deferred tools may need loading through ToolSearch first. Look for:
   - `unifically`: music via Suno, sound effects via ElevenLabs, images via Nano Banana, GPT Image, Flux and Seedream, video, and `upload_file`
   - `elevenlabs`, `suno`, `higgsfield`, `fal`, `replicate`
   - OpenAI images
   - any server exposing `generate_music`, `generate_audio`, `sound_effect`, `generate_image` or image edit
2. **API keys in the user's project** (for example `UNIFICALLY_API_KEY` in `.env.local`). If a key exists but its MCP server doesn't, use `<skill-dir>/scripts/unifically.mjs --env <file>`. Never print keys.
3. **Hard requirements:** `node`/`npx` (18+), `python3`, `ffmpeg`/`ffprobe`. If any is missing, stop and give the install command (for example `brew install ffmpeg`). Nice to have: `cwebp` (otherwise PNG fallback) and `gh`.
4. **HyperFrames skills:** `hyperframes`, `general-video`, `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`, `media-use`, `hyperframes-cli`. Check `~/.agents/skills`, `~/.claude/skills` and `.claude/skills`. If they're missing, run `npx hyperframes@latest skills update general-video`. Skills installed mid-session often don't register until a new session, so read their `SKILL.md` files **by path** instead of waiting for them to load.

Report a short table: need, route found, fallback. The needs are music, SFX, images, image edit with reference, and video. Fallbacks:
- **SFX:** the `media-use` bundled library (21 Pixabay-licensed files).
- **Music:** a user-supplied track, local generation through `media-use`, or deliberate silence.
- **Images:** the user's media plus pure HTML/CSS design.

## Phase 3: Treatment and go (the only approval)

Read `<skill-dir>/references/craft-playbook.md` now, then post the treatment in about 8 lines:

- **Concept sentence:** the world, metaphor and feeling, taken from the brand's own visual world. Example: *"The sky is the canvas: one typed idea falls through the brand's sky, blooms into the finished product, then a feed of them, and lands on the logo in its own pastoral world."*
- **Arc:** six scenes on bar lines. HOOK, INPUT, DROP/PAYOFF, BREADTH, ECOSYSTEM, LOCKUP. One line each, true to this product.
- **Formats and length.**
- **Music plan:** route and vibe.
- **Assets:** the user's own, the product's own, and what gets generated.
- **Cost estimate:** use the provider's dry-run or cost tool where one exists, otherwise a rough range. Typically about 3 music tasks, about 15 SFX and a handful of images, well under $2.
- **Uploads:** anything of the user's that has to be uploaded to a provider (for example a reference photo for a restyle), and where it goes.

End with one question: **"Good to go?"** Adjust if they push back. After the yes, run to delivery.

## Phase 4: Scaffold and direct

1. **Scaffold.** Pin the CLI version the scaffold writes into `package.json`, and use `npx hyperframes@<ver>` for every command after that.
   ```bash
   npx hyperframes@latest init <kebab-name> --example=blank   # check --help: flags change between versions
   # npm cache permission error? prefix with: npm_config_cache=/tmp/npm-cache
   ```
   Then copy the helpers: `cp -R <skill-dir>/scripts <project>/tools`.
2. **Write `BRIEF.md` right after `init`**, in HyperFrames' own format. It is their routing and no-repeat token, and the right frontmatter stops their intake from re-interviewing the user:
   ```markdown
   ---
   workflow: general-video
   flow: automation
   storyboard: no
   message: "<the one thing the film must say>"
   destination: <site hero | instagram-stories | …>
   aspect: "16:9"
   length: 15s
   language: en
   audience: <who>
   narration: none
   ---
   ## Intent        (the user's words and the concept sentence)
   ## Assets        (path, what it is, where it belongs; one per line)
   ## Customizations (formats, music vibe, must-say and must-avoid)
   ## Notes         (the product truth sheet: promise, core loop, UI vocabulary, features, CTA, URL, allowed claims)
   ```
3. **Write `DESIGN.md`** from your style notes. HyperFrames reads it as brand truth.
4. **Music first, then the grid.** Generate or choose the track before building. Measure its tempo and the exact drop downbeat, then lock every cut to it:
   - the drop lands on the product's magic moment
   - the music stops dead on the logo hit, then echoes out

   The how-to is in `references/audio.md`: `tools/analyze_music.mjs`, `tools/beat_grid.mjs`, `audio.config.json` and `tools/build_audio.py`.
5. **Write `STORYBOARD.md`:** one `## Frame N` block per scene with its time, the blueprint or rules it uses, the beat as an *experience*, and its SFX cues.

## Phase 5: Build in HyperFrames

Load `/hyperframes`, then `/general-video`, plus `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative` and `media-use` as each stage needs them. If they aren't registered in this session, read them by path. Their contract is binding:
- deterministic
- seek-safe
- one paused timeline
- every `<audio>` has an `id`
- local fonts
- `check` passes

With `BRIEF.md` in place they read the brief and ask nothing.

For up to about six scenes, build **one standalone `index.html`** with `.scene` divs, a single GSAP timeline, and CSS transitions between scenes. It's faster, and cross-scene moves stay on one clock. Read, as you reach each topic:

- `references/craft-playbook.md`: scene recipes, transitions with coverage math, persistent layers, the clock pattern, the detail checklist
- `references/assets.md`: fonts, image prep, alpha plates from black, restyles of the user's photos, reference uploads, model gotchas
- `references/verification.md`: HyperFrames traps that cost real revisions. Read it **before** writing HTML.
- `<skill-dir>/examples/slideshows-gg/`: a production that shipped. Read `index.html` for patterns (grid constants, the `frame(t)` clock, rebuilt UI, all five transitions, the HUD ticker, the AUDIO markers), never for content.

**Craft rules that matter most:**
- **Rebuild the product's real UI in HTML** at video scale with its real copy. Screenshots blur; rebuilt UI is crisp and can type, press and develop.
- **Express every time from the grid** (`const B = …; /* AUTO:BEAT */`, marks `C1…C5`), so a new track is one command.
- Every scene gets three or more depth layers and one signature move. No two consecutive transitions match. The brand's own signature transition (a cloud wipe for a sky brand) appears once.
- **Sound is half the film.** Something audible under every visual event that matters. The SFX match the music's attitude: taps, glass, sub hits, shutters; not cartoon pops unless the brand is genuinely playful.

## Phase 6: Verify like a picky director

A render you haven't inspected frame by frame isn't finished. Loop until clean:

1. `npx hyperframes@<ver> check`, **the gate**: it reruns lint, then covers runtime, layout and WCAG contrast. Use `lint` alone only for quick iteration. Fix real findings. Mark intentional layering with `data-layout-allow-overlap`, `-occlusion` or `-overflow` on the elements themselves.
2. `npx hyperframes@<ver> snapshot --at <scene midpoints, transition peaks, 0.2s before each cut> --no-end --describe false`. Read the contact sheet like a client would. Use `--zoom "x,y,w,h"` for type details.
3. Run the animation map for dead zones and collisions (the command is in `references/verification.md`).
4. `npx hyperframes@<ver> render --fps 60 --quality delivery -o renders/<name>.mp4`. Use 60fps: a 30fps vertical cut looked choppy to a real user.
5. QC the actual file:
   - `tools/review_strip.sh <mp4> <out.jpg> "<times>"`: a frame strip of the render
   - `tools/audio_qc.sh <mp4> <drop_s> <stop_s>`: loudness (target about -15 LUFS, peak at or below -1 dBFS), unique frame count, and the drop and stop landing on the cut

## Phase 7: Deliver

- Render the formats that were asked for. For 9:16, copy the project and re-lay out every scene; never crop the 16:9 cut. See `references/formats.md`.
- **You cannot hear audio.** Say so, and report what you measured instead. If two music candidates fit the grid equally well, render both and let the user choose. Only the bed changes: `python3 tools/build_audio.py <track>`, then re-render.
- Report, briefly:
  - file paths and specs
  - what happens beat by beat
  - what was generated and roughly what it cost
  - what you uploaded and where
  - anything you didn't verify
- Leave the project re-editable: `BRIEF.md`, `DESIGN.md` and `STORYBOARD.md` are current, and `audio.config.json` plus `tools/build_audio.py` rebuild the bed and cues from the grid.

## Non-negotiables, and why

- **Product truth only.** Never invent stats, testimonials, user counts, reviews or partner logos. A promo that lies becomes a liability the moment it ships. UI progress readouts like "5/5" are fine; "10M views" is not.
- **The brand's copy rules beat your taste.** Examples: banned punctuation (some brands ban em dashes on screen), casing, tone.
- **Use the user's media with care.** To get a URL for an image-edit reference, prefer the provider's own upload tool, or the user's own private storage with a short-lived signed link. Never an arbitrary public host. Name what you uploaded, and where.
- **Determinism.**
  - No `Math.random`, `Date.now` or render-time network fetches.
  - Use seeded `prand(i)` everywhere.
  - Media and fonts are local files.
- **Honest reporting.** A failed check, an unheard mix or a skipped step gets stated plainly.
