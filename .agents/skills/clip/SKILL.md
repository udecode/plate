---
name: clip
description: Record, check and render demo clips or stacked before-and-after images/clips for chat, team posts, social posts, or bug repros. Use before recording any app clip or attaching before/after screenshots.
---

# Clip

One recorder makes every demo clip, `scripts/clip.ts` in this skill's folder, written `<skill dir>` below. It draws a cursor that lands like a hand, sends pointer input on a steady 60 Hz clock, films at 60 fps, and reviews each take before it renders.

## Set up

The recorder runs on Bun and ffmpeg. The first time, and whenever `<skill dir>/scripts/node_modules` is missing, run `bun install --cwd <skill dir>/scripts`, then `bunx --cwd <skill dir>/scripts playwright-core install chromium` if Chromium will not launch.

## Record a clip

1. Write a scene, a Bun script that opens the page, sets it up, films the gesture and finishes. Keep it with the work it shows, such as the run's own folder.

   ```ts
   import { openClip } from '<skill dir>/scripts/clip.ts'

   const clip = await openClip('http://localhost:3000/editor')
   // Setup happens here, through clip.page, and stays out of the clip.
   await clip.place(700, 500)
   await clip.film(process.argv[2])
   clip.beat('Draw a note')
   await clip.click(clip.page.getByRole('button', { name: 'Note' }))
   await clip.drag([300, 200], [470, 310])
   await clip.wait(800)
   console.log(JSON.stringify(await clip.finish({ x: 200, y: 100, w: 600, h: 400 })))
   ```

2. Run `bun <scene>.ts <take dir>`. It writes `clip.webm`, `trail.json` and `take.json` there.
3. Run `bun <skill dir>/scripts/clip.ts review <take dir>` and fix it as Review and fix says.
4. Run `bun <skill dir>/scripts/clip.ts render <take dir> <out.mp4> --tag <tag> --title "<title>"`. The title bar is the clip's headline, a one-word area tag and what you do in a few lowercase words, such as `board / a whiteboard inside your doc`. It refuses a take with a FAIL, cuts it, adds the bars, encodes at 60 fps, reviews the file, and writes one still at the end of each caption into `<take dir>/stills/`, printing a `STILL` line for each. Its `SIGNALS` line, saved as `<take dir>/signals.json`, gives the clip's length, when something first moves, the share of time something moves, how much of the frame the result changes, and the page text's size on a phone.
5. Read every still before the clip goes anywhere.

A clip shown in a Claude session stays local. A clip an agent makes for a team chat goes out the way that project's chat rule says. Where that rule names a preview route, the clip goes to the owner first as a preview and posts only once the owner approves it there, never straight to a channel.

## Before and after

A change to how something a reader already saw behaves, such as a control, a menu or a gesture that went wrong, shows as one clip made from a take of the old code and a take of the new. A change to how something looks at rest, such as copy, a style or a layout, shows as one image with the old still stacked above the new. Neither goes out as two separate files. A feature with nothing before it gets a plain clip or still.

For a clip:

1. Run the same scene twice, opening with `openClip(url, { shape: 'pair' })` and finishing with no crop, once against the code before the change, such as a worktree at the parent commit or the deployed site, and once against the change. The pair shape films a 612 by 530 page, so the two takes sit side by side in a clip 1920 px wide for the team chat, as tall as what they show. Give both takes the same captions at the same actions, such as `Export it as Markdown`, because render lines the takes up by their captions. Keep the scene in the top of that page, because the replay trims the blank margin both takes leave. The cursor counts as content, so park it with `place` beside the first thing it clicks, or its path keeps blank page in the crop. A take where nothing moves after its result holds it with `read(1500)`, so the viewer can read it.
2. Review both takes, then run `bun <skill dir>/scripts/clip.ts render <after take> <out.mp4> --before <before take>`, with the same bar flags as a plain clip. It refuses two takes whose frames differ in size, whose captions differ in number, or that end every step the same. The clip plays both from its first frame, the old take left in a red BEFORE card and the new take right in a green AFTER card, in step and trimmed to the page area either take uses, so the reader never waits through the old behavior to see the new. Its FIXED line gives the arrangement, the replay's zoom and the page text size a phone shows in it.
3. Read its stills in `<after take>/stills-compare/`.

For an image, take both stills at one size and density, then run `bun <skill dir>/scripts/clip.ts pair <before.png> <after.png> <out.png> --scale <pixels per CSS px>`, with the bar flags when the image goes out as a demo. It crops both to the area where they differ and puts them side by side when both fit the page's width or each is taller than wide, such as two phone screens, and stacked otherwise, each in its card. Read the image before you send it.

## Bug clip

A bug clip shows a bug for an issue. It is evidence, so render keeps its real time, because a pause can be the bug and the issue's timestamps must match the clip.

1. Write the scene as for any clip, opening with `openClip(url, { shape: 'repro' })`, or `{ shape: 'repro', size: { width, height } }` when the bug needs a narrow or tall window. Caption each step as the issue's Reproduction steps word it, with its keys as keycaps, such as `[Shift] [Enter] then type def`. End on the wrong state with `read(2000)` under a caption that says what went wrong, such as `Only "ch" keeps the yellow mark`. Crop to the editor and whatever the steps click, with room under the editor.
2. When the page has a reference page, such as its twin on slatejs.org or platejs.org, film the same scene there with the same crop size and the same captions.
3. Review each take, then run `bun <skill dir>/scripts/clip.ts render <beta take> <out.mp4> --route <path> --build <commit>`. For a reference, add `--before <reference take> --names <reference site>,beta`. The clip then plays the reference take whole in a gray card named for its site, then the beta take whole in a red `beta` card beside or under it while the reference holds its result, then both together.
4. Read its stills in `<beta take>/stills/`, or `stills-compare/` for a reference.

The recorder drives Chromium only. A bug that shows only in Safari, Firefox or on a phone gets a person's recording.

## Method

These are the parts no check can see.

- Move only through the clip, with `glide`, `drag`, `dragDrop`, `over`, `press`, `click` and `write`. `drag` holds the button down, which draws or selects. `dragDrop(from, to)` drags a text selection or a draggable element and drops it at `to` through Chrome's own drag and drop, so drop handlers see a real drop. It throws when nothing at `from` starts a drag, such as a press outside the selection. Playwright's `page.mouse` waits until each move is handled, so a stroke grows in uneven jumps on a smooth video. `page.mouse` and `page.keyboard.type` are for setup before `film()`. During the clip, type with `write` and press keys with `page.keyboard.press`. Hold a modifier through a drag with `keyDown` and `keyUp`, such as Shift for a circle, because a key held with `page.keyboard.down` never reaches the clip's mouse events.
- Call `beat()` as each action starts. Its caption says what you do in a few words, such as `Draw a note`. A keyboard clip shows its keys, such as `[N] [Enter]`, because the video cannot.
- Show the feature where a reader meets it, inside the page or document around it, and crop to the feature and that context.
- Keep it drafty, snappy and straight to the point. Open on the action and end on the result. Add no zoom, frame, wallpaper, motion blur or music. The owner turned down Screen Studio polish and called about 14 s for four beats the pace (2026-11-18), then found long pauses lose the viewer (2026-11-19). Render cuts every still stretch on its own, so a `wait` only paces an action. Where a viewer must read something that just appeared, such as a toast or a label, hold with `read(ms)`, about 1 s for a label and 2 to 3 s for a toast, and render keeps that hold whole.
- Film light mode unless the change is about dark mode. A clip films a 540 by 654 page, which X's 2:3 shape leaves after the bars, so lay the scene out for a narrow page and stack the steps down the frame. `{ shape: 'wide' }` films a 1100 by 720 desktop page, for a clip that answers a question in chat, and `{ shape: 'pair' }` films each take of a before-and-after clip.
- A page behind a sign-in opens with `{ storageState: '<file>' }`, the Playwright storage state the project's own login helper saves.
- Ease a pen stroke with `stroke`, which starts already moving, because the `minimumJerk` curve dwells at the start and pools ink in a blob.
- A clip with no mouse, such as a keyboard clip, opens with `{ cursor: false }`, so no idle cursor sits on the page.
- A demo is one clip for the team chat and for X, so the same file can go out on X later (owner, 2026-11-20). Its title bar repeats the message in chat, and is its headline on X. A before-and-after clip rarely goes to X, so it films for the chat instead, 1920 px wide and no taller than 16:9 (owner, 2026-11-25).
- A project whose clips never go to X puts `{ "shape": "wide" }` in `.agents/clip.json` at its root, and every clip it films is a desktop clip unless its scene names a shape. `openClip` reads the nearest such file above the scene's folder, then above the working folder. Ellie sets it, because its demos go to Lincoln and the team, not to X (owner, 2026-11-24).

## Review and fix

Every take goes through review before anyone sees it, and you fix what it finds without asking.

- `FAIL` lines break a rule. Fix the scene and record again. Never send or show a clip with a FAIL. Each line names its fix.
- `FIXED` lines are what render corrected on its own, such as a caption's capital or a crop's odd side. Fix the scene too, so the next take is clean.
- `TRY` lines would make the clip better. Apply each one that does, and say which you skipped and why.
- Then judge the stills for what no check sees. The frame shows what its caption says, typed text is complete and spelled right, nothing covers the feature, such as a style panel or an open menu, and the page around the feature reads. The cursor fades on its own once it rests, so end on the result without moving it away.
- Report in a line or two what you fixed and what you would still change. When a rule makes a clip worse, say so and propose the change.

## When the owner changes a rule

The owner's latest word wins over this skill and the code. Change this skill's source repository, never an installed copy, in the same turn:

1. Change the code that enforces it: a value in `CLIP`, a check in `scripts/clip.ts` (`checkTrail`, `checkCaption`, `checkTitle`, `checkPair`, `reviewTake`, `reviewFile`), or the `Clip` method that does the motion. A rule that no code can hold goes in Method above.
2. Put the date and the owner's words in a comment beside the change, such as `(the owner, 2026-11-19)`.
3. Run `bun scripts/rules.ts`. It rewrites the rule list below from `RULES` in `scripts/clip.ts`.
4. Add or change the test in `scripts/clip.test.ts`, then run `bun test` in `scripts/`. `rules.test.ts` fails while this list and the code disagree.
5. A bot that reads `CLIP`'s length and size limits into its own media rules needs a restart after a change to them.

When the owner corrects the same thing a second time, make it a check that fails on the take they corrected, rather than another line in Method.

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
