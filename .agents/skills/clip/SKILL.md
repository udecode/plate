---
name: clip
description: Record, check and render demo clips or stacked before-and-after images/clips for chat, team posts, social posts, or bug repros. Use before recording any app clip or attaching before/after screenshots.
---

# Clip

`scripts/clip.ts` (in `<skill dir>`) records 60 fps demos with a 60 Hz drawn cursor and checks each take before rendering.

## Set up

Requires Bun and ffmpeg. If `<skill dir>/scripts/node_modules` is missing, run `bun install --cwd <skill dir>/scripts` (and `bunx --cwd <skill dir>/scripts playwright-core install chromium` if Chromium fails to launch).

## Record a clip

1. Write a Bun scene in the run folder:

   ```ts
   import { openClip } from '<skill dir>/scripts/clip.ts'

   const clip = await openClip('http://localhost:3000/editor')
   // Setup through clip.page stays out of the clip.
   await clip.place(700, 500)
   await clip.film(process.argv[2])
   clip.beat('Draw a note')
   await clip.click(clip.page.getByRole('button', { name: 'Note' }))
   await clip.drag([300, 200], [470, 310])
   await clip.wait(800)
   console.log(JSON.stringify(await clip.finish({ x: 200, y: 100, w: 600, h: 400 })))
   ```

2. Run `bun <scene>.ts <take dir>` (writes `clip.webm`, `trail.json`, `take.json`).
3. Run `bun <skill dir>/scripts/clip.ts review <take dir>` and fix findings.
4. Run `bun <skill dir>/scripts/clip.ts render <take dir> <out.mp4> --tag <tag> --title "<title>"` (one-word tag + lowercase headline, e.g. `board / a whiteboard inside your doc`). Writes stills to `<take dir>/stills/` and metrics to `signals.json`.
5. Inspect every still before sharing. Clips stay local unless the project's chat rule specifies a preview/post flow.

## Before and after

Show behavioral changes as one side-by-side clip; show static visual changes as one paired image (never two separate files).

- **Clip:** Run the same scene with `openClip(url, { shape: 'pair' })`, no crop, identical captions, and `read(1500)` after static results against old and new code (keep content at top of page and park cursor beside the first target with `place`). Review both takes, run `bun <skill dir>/scripts/clip.ts render <after take> <out.mp4> --before <before take> --tag <tag> --title "<title>"`, and inspect `<after take>/stills-compare/`.
- **Image:** Capture equal-size stills and run `bun <skill dir>/scripts/clip.ts pair <before.png> <after.png> <out.png> --scale <dpr>` (add bar flags for demos). Inspect before sending.

## Bug clip

Evidence clips keep real time (no still-frame cuts):

1. Open with `openClip(url, { shape: 'repro' })` (optional `size`), caption each reproduction step with Mac keycaps (`[Shift] [Enter]`), end on the broken state with `read(2000)`, and crop around the editor + controls.
2. If a reference site exists, record the same scene there with identical crop and captions.
3. Review, then render with `bun <skill dir>/scripts/clip.ts render <beta take> <out.mp4> --route <path> --build <commit>` (add `--before <ref take> --names <ref>,beta` for a reference). Inspect stills. Chromium only; Safari/Firefox/phone bugs need a manual recording.

## Method

- Drive motion only via `glide`, `drag`, `dragDrop`, `over`, `press`, `click`, `write`, `keyDown`/`keyUp` (use `page.mouse`/`page.keyboard.type` only for setup before `film()`).
- Call `beat()` at each action start; show keyboard shortcuts as `[Key]`.
- Keep clips snappy (~14 s for 4 beats), light mode unless testing dark mode, zero artificial polish (no zoom/wallpaper/blur/music). Use `read(ms)` (~1 s label, 2-3 s toast) to preserve readable holds; render trims other dead air automatically.
- Shapes: default is X 2:3 (`540x654` page); `{ shape: 'wide' }` (`1100x720`) for desktop chat (or set `{ "shape": "wide" }` in `.agents/clip.json` for projects not posting to X); `{ shape: 'pair' }` for before/after.
- Pass `{ storageState: '<file>' }` for signed-in pages, `stroke` for pen easing, `{ cursor: false }` for keyboard-only clips.

## Review and fix

Fix findings before sharing: `FAIL` blocks output (fix scene and re-record); `FIXED` means render auto-corrected something (fix scene for next take); apply helpful `TRY` items and note skipped ones. Inspect stills for accuracy, spelling, occlusion, and framing (do not move the cursor off the result; it auto-fades).

## Changing a rule

Owner's latest word wins. Edit the source repo (`scripts/clip.ts`) with the date and owner quote in a comment, run `bun scripts/rules.ts` to regenerate `<!-- rules -->` below, update `scripts/clip.test.ts`, and run `bun test` in `scripts/` (restart bots reading `CLIP` limits). Encode second-time corrections as checks, not prose.

## Rules

<!-- rules: written by `bun scripts/rules.ts` -->
- Film and render at 60 fps, and keep each filmed frame once and in order under the bars, captions and cards. (`reviewFile`, `renderClip` in `scripts/clip.ts`)
- A clip runs at most 20 s and 8 MB. An X clip aims for 16 s or less. (`reviewTake`, `reviewFile` in `scripts/clip.ts`)
- The first caption shows within 0.8 s, so the clip opens on the action. (`reviewTake` in `scripts/clip.ts`)
- Each caption stays up at least 1.2 s. (`reviewTake` in `scripts/clip.ts`)
- Nothing on screen sits still for more than 0.4 s, or 0.6 s at the end. Render cuts the extra still frames on its own, but never takes a caption under 1.2 s and never cuts a hold the scene marks with `read(ms)`. (`squeezePlan`, `renderTake` in `scripts/clip.ts`)
- A caption is white text on black, so it never reads as page text: in a footer under an X clip, and in the head above any other clip. Keys show as white keycaps in it. (`captionHtml`, `renderClip` in `scripts/clip.ts`)
- A caption is a short sentence of at most 6 words with no closing period. It starts with a capital, unless it starts with a [Key]. It speaks to a viewer on a Mac in Chrome, in Mac keys, and names no platform or browser (the owner, 2026-11-23). Render fixes the capital and the period on its own. (`checkCaption`, `fixCaption` in `scripts/clip.ts`)
- A caption switches on as its action starts and off as the next one starts, with no fade. (`captionOverlay` in `scripts/clip.ts`)
- The drawn cursor shrinks toward its tip and fades out over 0.15 s once it has rested 0.5 s with no button down, and grows back as it moves, so a scene never moves it off the result. A cursor `place` parks stays hidden until it first moves. (`drawCursor`, `Clip` in `scripts/clip.ts`)
- While a button is down, the drawn cursor stays within 0.5 px of the pointer and never turns back on its own. (`checkTrail` in `scripts/clip.ts`)
- The drawn cursor jumps at most 2 px at a press, and turns back at most 3 times on free moves. (`checkTrail` in `scripts/clip.ts`)
- While a button is down, the pointer moves every frame, at most 25 ms apart at the 90th percentile, so a stroke grows smoothly. (`checkTrail` in `scripts/clip.ts`)
- A title bar holds a one-word lowercase tag and a lowercase title of at most 6 words, on one line at 36 px, shrunk as far as the line needs to fit. Under 24 px, a phone shows it under 14 pt, so render suggests a shorter title. (`checkTitle`, `renderClip`, `renderTake` in `scripts/clip.ts`)
- A crop has even sides inside the viewport. Render rounds and clamps it on its own. (`fitCrop` in `scripts/clip.ts`)
- A clip films X's shape, a page 540 by 654 px at 2× pixels, so with its 80 px title bar and 76 px caption footer the clip is 2:3, unless it opens with `{ shape: 'wide' }` or the nearest `.agents/clip.json` above the scene or the working folder names `"shape": "wide"`, which films 1100 by 720 px at 2× pixels for a desktop chat, under a pair clip's black head with no footer. An X clip's page text shows at 9 pt or more in a phone's feed, which shows a clip about 312 pt wide. (`openClip`, `projectShape`, `reviewTake` in `scripts/clip.ts`)
- Render refuses an X-shape or a before-and-after clip without a title bar, so the clip a team chat gets is the one X can post and a before-and-after clip names what it shows. (`checkBar` in `scripts/clip.ts`)
- A change to how something a reader already saw behaves shows as one clip made from a take before the change and a take after it, which caption the same beats. Both film `{ shape: 'pair' }`, a page 612 by 530 px at 3× pixels with no crop, and play side by side from the first frame, before left of after, both playing each step at the same moment, on a page 1280 px wide and as tall as the cards with 16 px around them, rendered at 1.5×, so the clip is 1920 px wide and at most 16:9, because such a clip goes to a team chat and rarely to X. It has no footer: one 66 px black head on top holds the tag and title at 14 px in gray, and under them each step's caption in white at 20 px, both left-aligned. Each copy is a card under a 28 px band that names its side, red before and green after, with a 2 px border of the same color and 4 px corners. A bug clip's two takes film the same repro window instead, and sit in two cards as large as 960 by 1080 px allows, in columns or in rows, one above the other, whichever shows them larger, columns on a tie, on a page just large enough for the cards and at least 480 px wide. The reference take plays whole in its card while the beta card waits empty, then holds its last frame while the beta take plays whole in its own, and then both replay. The replay trims the page margin that both takes leave blank in every frame, keeps 16 px of page around what is left, and zooms both copies as far as the page allows, never past their own pixels, so a pair copy zooms up to 2× and a bug clip's never past 1×, on the page's own color. Each take holds its result 0.4 s at most, unless the scene marks a longer `read(ms)`, and the replay ends holding both results for 1.2 s. Render refuses two takes that end every step the same, and the whole clip keeps the length and size limits. (`checkPair`, `renderCompare`, `alignBeats`, `pageColor`, `contentBox`, `cardLayout`, `pairLayout`, `reproLayout`, `renderReplay`, `squeezePlan` in `scripts/clip.ts`)
- A bug clip for an issue films with `{ shape: 'repro' }`, a 760 by 560 px window at 2× pixels unless `size` names the window the bug needs. Render keeps its real time and cuts nothing, because a pause can be the bug. It has a pair clip's black head and no footer, and the head's first line names the browser, the route and the build instead of a title. It ends holding the wrong state at least 2 s, and runs at most 60 s and 100 MB. A bug with a reference page shows as the before-and-after clip of a take on the reference page and a take on beta, each band naming its site, the reference gray and beta red. (`openClip`, `reviewTake`, `pageClip`, `renderClip`, `renderCompare` in `scripts/clip.ts`)
- A change to how something looks at rest, such as copy or a style, shows as one image, the still before the change beside the still after it when both fit the page's width or each is taller than wide, and above it otherwise, both cropped to the area where they differ, each in a clip's card, under a 44 px black head whose title is white at 16 px. It refuses two stills of different sizes or two that show the same thing. (`renderPair`, `changedBox` in `scripts/clip.ts`)
<!-- /rules -->
