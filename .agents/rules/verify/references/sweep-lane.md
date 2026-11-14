# Sweep lane

You are one lane of a sweep agent pass over beta. Your lane brief names your rows, the run directory, your clip names and your budget. You test each row as a real user would and write one record per row. You test; you never fix. Skip poteto-mode's planning ceremony, because this is a read-only test drive with no plan, code or review.

## Hard limits

- Never edit the repository, GitHub, a chat or any record outside the run directory. Never comment, label, close or land anything. Reading an issue with `gh issue view <number> --repo <owner/repo> --comments` is allowed.
- Use only the built-in browser tools (`mcp__Claude_Browser__*`) and headless shell commands. Never use Claude in Chrome, computer use, `open -a` or `osascript`, because they take over the owner's desktop.
- Write every file in the run directory through the shell, for example with a heredoc. The desktop app refuses Edit and Write there.
- Stop driving 52 minutes after you start, and finish your records by 60. Run `date -u +%Y-%m-%dT%H:%M:%SZ` at the start and between rows. A row you did not reach gets the result `untested`.
- Keep one tab. Create it with `tabs_create`, keep its `tabId`, and pass that `tabId` on every browser call. A call without it acts on the front tab, which may be another lane's. Never touch a tab you did not create. Load the reference page in the same tab by navigating. When `tabs_create` fails at the pane's tab limit, test headless meanwhile and retry every 3 minutes.
- Make your first call on the tab `resize_window` with its `tabId`, width 1280 and height 800. Apply it again when a screenshot looks narrow.

## Read first

Read these whole files before your first row:

- `.agents/pstack/rules/browser.md`, for typing key by key, frames, stalls and the clipboard.
- `.agents/rules/verify/references/sweep.md`, its A session and The six moves.
- Each scenario catalog that a row's context names.

## Each row

1. Read the row's context. Start from what earlier records did not try, and rerun each earlier find that the context does not list as fixed.
2. Use the page end to end as a user would, not one poke per control:
   - Write a little first: a heading, a few sentences, a list. Fix typos on the way with Backspace, a double-click or triple-click and retyping, and Shift+Arrow selections. Mix shortcuts and toolbar buttons. Undo several steps and redo them.
   - Use each feature as a whole flow: insert it, edit it, change its settings, close it, keep typing without clicking, then undo the whole chain.
   - Reach each result by another route: shortcut, toolbar, slash menu, block menu, context menu, autoformat.
   - Work at the edges: the start and end of a block, an empty block, beside a void, table, image or inline element, selections across blocks and marks, Cmd+A.
   - Change the conditions: after scrolling, in a window 360 pixels wide, and switching between the page's editors.
3. Apply the six moves to every control you meet.
4. After each step, read back the state, not only a screenshot: the editor's DOM text, `document.getSelection()`, `document.activeElement`, the active marks, and `read_console_messages` with `onlyErrors`.

On every page where they apply, also check:

- Typing after a non-text action. After every drop, menu item, dialog submit, picker choice, void selection and Escape, type a letter, Backspace, Enter, Cmd+Z and a letter, without clicking.
- Undo and redo after each kind of edit, and that undo puts the caret back where the edit happened.
- Floating toolbars, popovers, menus and calendars sit beside what they belong to, stay inside the window at its edges and at 360 pixels, and never open at the top left.
- Uncaught errors after each step.
- Caret and selection paint after toolbar and menu actions: a stale highlight, a highlight lost while a popover has focus, a caret drawn away from where typing lands.
- Inline voids such as mentions, dates and inline equations: arrow across them, type right before and after them, click them and type, Option+Backspace across them.

A session row compares beta with its reference page and covers the behavior both share. A difference that is a feature only beta has is not a find; note a problem in such a feature as its own find and say it is beta only. A row without a reference tests the whole page. Use the row's whole budget. When you finish early, go over the row again with flows you have not tried, such as longer writing, other routes or features combined.

When you hit a known issue that the row's context lists, add one line to `notes` that names it instead of a find, unless the page shows a clearly different failure.

A recheck row names an issue. Read it with `gh issue view`, comments included. Replay its exact steps on beta and judge whether the page does what the row's Confirm line says. Then spend the rest of the row's budget on the six moves around the same feature. When the issue names a browser other than Chromium, say what Chromium shows and put the named browser in `hand`.

## This browser's limits

- Type key by key with the `computer` action `key`, one space-separated token per character, such as `h e l l o space w o r l d`. Send a shifted character as itself, such as `*`, `#` or `A`. The `type` action inserts the whole string with no key events.
- There is no native clipboard, so Cmd+C and Cmd+V fire no copy or paste event. A page's own copy button can still write to the clipboard of the machine you run on, so never click one. There is no OS input method. `left_click_drag` releases at once and may fire no HTML5 drag events. Put these checks in `hand`. A drag that does nothing on beta and on the reference alike is this limit, not a find.
- Count frames once per tab, and again before you judge anything visual, with this in `javascript_tool`: `await Promise.race([new Promise(r=>{let n=0;const t=performance.now();(function f(){n++;performance.now()-t<1000?requestAnimationFrame(f):r(n)})()}), new Promise(r=>setTimeout(()=>r(0),3000))])`. Below 30 the pane is hidden. A claim that depends on frames, such as virtualization, lazy loading, a floating element's position, an animation or speed, then needs a headless replay, as Clips says. A floating element that fails to appear on beta and on the reference alike is the hidden pane, not a find.
- A page stuck on its first loading frame after `navigate` is a browser stall. Retry it in a fresh tab before you record anything.
- Below 768 pixels wide the tab sends an Android user agent, and shortcuts such as Cmd+Z stop working and stay broken after you widen it. After a narrow check, resize to 1280 by 800 and reload before you test keys again. Never record a shortcut failure you have not reproduced on a fresh load at desktop width.
- Use `javascript_tool` to read state only. Never click, type, select or change the page with it.
- The site flips its theme when you press D while focus is outside an editor, and the theme is stored once for every lane's tab. Before you type letters, check that `document.activeElement.closest('[contenteditable=true]')` finds the editor; when it does not, press Escape and click back into the text. Never click the site's theme button or change its storage. When beta turns dark mid-row, note the time in `notes` and keep testing; the lead restores it.

## Dark mode

Check dark mode once per session row, headless, never in the built-in browser. Record a replay with `theme: 'dark'`, as Clips says, whose steps bring the states that matter on screen: menus, popovers, toolbars, the selection, placeholders, toggles and comment or suggestion highlights. Inside a step, `await page.screenshot({ path: '<run dir>/clips/<lane>-<row number>-dark-<state>.png' })` saves a still. Check that the result's `shownTheme` says `dark`, and read every still. When a value is in doubt, read the computed colors in a step and compare text with background. For a row with a reference, shoot the same states there too. A dark difference is a find when something is unreadable, invisible or clearly worse than the reference. Write what you checked in `dark`.

## Before you record a find

Reproduce it once in a fresh tab: close your tab, create a new one and navigate. For a row with a reference, run the same steps there. Only then record it.

## Clips

Every find needs a clip. Replay the find's steps headless with `record` from `tooling/scripts/sweep-clip.mjs`, in the same checkout as this file. Write the replay as `<run dir>/clips/<lane>-<row number>-<slug>.mjs` and run it with `node`:

```js
import { record } from '<checkout>/tooling/scripts/sweep-clip.mjs';

const result = await record({
  url: '<beta address of the row>',
  out: '<run dir>/clips/<lane>-<row number>-<slug>.webm',
  theme: 'light',
  width: 1280,
  height: 800,
  steps: [
    ['1. Click the second table cell', (page) => page.locator('td').nth(1).click()],
    ['2. Type abc key by key', (page) => page.keyboard.type('abc', { delay: 120 })],
    ['3. Press Tab', (page) => page.keyboard.press('Tab')],
  ],
});
console.log(JSON.stringify(result, null, 2));
```

Caption each step in the records' language. `record` shows each caption on the page and saves one `.webm`. It returns `shownTheme`, `pageErrors` and `consoleErrors`, and judges none of them. A step that throws still saves the clip up to that step, and then `record` throws with the step's caption; fix the steps and record again. Look at a frame from the clip's middle before you cite it, for example with `ffmpeg -ss <seconds> -i <clip> -frames:v 1 <png>`.

The replay only records a find you already made in the built-in browser. When it does not show the find, the find has no clip: put what you saw and its steps in `hand` for a person instead. When the find shows only in the replay, such as a frame claim while the pane is hidden, record it with `replayOnly: true`, and a person confirms it.

## Records

Write one record per row at the path the brief gives, as JSON:

```json
{
  "id": "<the row's id>",
  "result": "found",
  "start": "2026-11-14T09:30:00Z",
  "end": "2026-11-14T09:52:00Z",
  "steps": ["Wrote three paragraphs and a list, then undid and redid each edit"],
  "finds": [
    {
      "title": "Tab in a table cell types a tab character instead of moving to the next cell",
      "repro": ["Click the second cell", "Type abc", "Press Tab"],
      "expected": "The caret moves to the third cell, as on the reference",
      "actual": "A tab character is inserted after abc",
      "reference": "The reference moves to the third cell",
      "cause": "Guess: no Tab handler runs; the console shows no error",
      "clips": ["clips/L1-2-tab-in-cell.webm"]
    }
  ],
  "notes": ["Known issue from the context: merged cells scramble the row"],
  "dark": "Checked the toolbar, the cell menu and the selection in dark; nothing unreadable",
  "hand": ["Paste of a table from another app"]
}
```

- `result` for a session row is `clean` with no finds, `found` with one or more, `blocked` or `untested`. For a recheck row it is `fixed`, `still` or `changed` with one or more finds, `blocked` or `untested`. `blocked` and `untested` need `notes` that say why.
- `start` and `end` are when you started and finished the row, as `date -u` prints them.
- `steps` names two to five flows and moves you ran, so the next tester can start elsewhere.
- Each find has `title`, `repro`, `expected`, `actual` and `clips`, and may have `reference`, `cause` and `replayOnly`. A clip path is relative to the run directory, and each find needs at least one `.webm` or `.mp4`. Put stills beside the clip in `clips`. Mark a guess in `cause` as a guess, and leave `cause` out when you did not look.
- `notes`, `dark` and `hand` are optional. `hand` lists what is left for a person, such as paste, an input method, a file picker, a native drag, frames below 30 or a browser other than Chromium.

Write every text field in the language the brief names.

Before you finish, run `node <checkout>/tooling/scripts/sweep-pass.mjs collect --dir <run dir>` and fix every problem line that names one of your records. Lines about rows other lanes have not recorded yet are expected, and `collect` writes nothing while any problem remains.

## Finish

Close your tab with `tabs_close`, unless `tabs_context` shows it is the last tab in the pane. Your final message gives each row's result and its record path, in under 200 words.
