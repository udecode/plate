---
review_scopes: [link]
verdict: stop
review_basis: [2026-10-12-link-review]
work_kind: implementation
review_commit: f512cc3bedded49babda0d760059f00b02070d96
review_inputs: [apps/www/src/registry/components/editor/link.tsx, apps/www/tests/browser/regressions/edit-link.spec.ts, apps/www/tests/browser/link-floating-toolbar.spec.ts, apps/www/tests/browser/link-url-policy.spec.ts, apps/www/src/registry/components/editor/link-toolbar.spec.ts, apps/www/src/registry/components/editor/link.lifecycle.spec.tsx, apps/www/next.config.ts, docs/plans/topics/link.md]
review_upstreams: []
---

# Link toolbar: fill the edit form, come back after Enter, open the right link

Status: building: the landing, then the triage records and comments
Topic: link
Playbook: bug-fix

The babysit run for udecode/plate#5238, Dylan Schiemann's PR, taken as `triage fix #5228` with the PR's diff as the candidate fix. The claim holds plate#5228 and plate#5314. Both live in the copied link toolbar, so this is a redesign run, and the audit of the 5228 cause found a third bug in the same toolbar.

## Brief

### What will change?

Edit link shows the link's text, the toolbar comes back after Enter, and Open link follows the caret. The toolbar comes back when a selection collapses after the link shortcut, and leaving the form closes it. Dylan fixed the first.

### What could go wrong?

33 more stale reads in 18 other copied files stay unfixed. Leaving the form drops its draft. As on next, the link shortcut over a selection inside a link blocks Insert link and hides the formatting toolbar.

## Teach

The link toolbar floats over a link while the caret is in it. Its Edit link button swaps in a form with the address and the text to display.

The www app builds with the React Compiler, which remembers what a component worked out. When a component reads editor state while it draws instead of subscribing to it, the compiler keeps the first answer for as long as the component stays on screen. The toolbar never leaves the screen. So the form kept the empty text from the toolbar's first draw, Open link kept the first link it saw, and the toolbar kept its first answer to whether the selection was collapsed. Saving with Enter also closed the toolbar, and nothing opened it again, because the caret never left the link.

Now each of those reads subscribes to the editor or runs when the form opens, and Enter after an edit shows the toolbar again, as Escape already did.

## Expected results

Each row is one case on the www dev server in Plite mode. "next" is f512cc3bed, "PR" is Dylan's commit on top of it, and "run" is this checkout. Rows of a kind the claim holds count as P1.

| Row | Priority | Case | Expected | next | PR | run |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | P1 | plate#5228: Playground, click React, then Edit link | URL field shows `https://reactjs.org`, Text to display shows `React` | fails, empty text | passes | passes |
| R2 | P1 | plate#5228: rename to `QA23 Link`, Enter, click away, reopen Edit link | Text to display shows `QA23 Link` | not reached | passes | passes |
| R3 | P1 | plate#5228: change only the URL to `https://react.dev`, Enter | the link keeps `QA23 Link` with the new URL | not reached | passes | passes |
| R4 | P1 | plate#5228: R1 to R3 in Firefox, the reporter's browser | as R1 to R3 | not run | not run | passes |
| R5 | P1 | plate#5314: `/docs/link`, Edit link on `hyperlinks`, URL `https://example.com/qa`, Enter | URL saved, editor focused, toolbar with Edit link visible | fails | fails | passes |
| R6 | P1 | plate#5314: then ArrowLeft inside the link | the toolbar stays | not reached | not reached | passes |
| R7 | P1 | plate#5314: R5 and R6 in WebKit | as R5 and R6 | not run | not run | passes |
| R8 | P2 | Playground, click React, then click Explore the documentation | Open link points at `/docs` | fails, keeps `https://reactjs.org` | fails | passes |
| R9 | P2 | Escape in Edit link | back to the toolbar | passes | pending | passes |
| R10 | P2 | Enter in the insert form | the link is inserted and the form hides | passes | pending | passes |
| R11 | P2 | Two editors on one page, the link shortcut in one | only that editor's insert form opens | passes | pending | passes |
| R12 | P2 | Edit link on a link whose text equals its URL | the store's text is empty, which the field shows as R1 does | passes | pending | passes |
| R13 | P1 | plate#5314 kind: Playground, click React, Shift+ArrowRight, the link shortcut, ArrowLeft | toolbar with Edit link visible | not run | not run | passes |
| R14 | P2 | Playground, click React, Edit link, type `Draft` in Text to display, Shift+Tab twice, then Edit link | the form goes back to the toolbar when focus leaves it, and reopens with `React` | not run | not run | passes in Chromium and Firefox, skipped in WebKit |
| R15 | P2 | A selection inside a link, the link shortcut, a caret in plain text, the link shortcut | the first shortcut changes nothing and stops the browser's default, and the second opens the insert form | fails, no form opens | fails | fails, as on next |
| R16 | P2 | Edit link, type `Draft`, blur the field so nothing has focus, focus the editor, the link shortcut | the form stays while nothing has focus, closes when the editor takes focus, and the shortcut reopens it with `Example` | fails, stays open | fails | passes |
| R17 | P1 | plate#5314 kind: Playground, click React, Edit link, click React again | toolbar with Edit link visible | fails, toolbar hidden | fails | passes |
| R18 | P2 | A selection from inside a link into the text after it, the link shortcut | the shortcut changes nothing and the key goes on to the editor's key handlers and the browser, as on next | passes | passes | passes |
| R19 | P2 | Edit link, blur the field so nothing has focus, then focus enters an iframe | back to the toolbar | fails, hides the toolbar | fails | passes |
| R20 | P2 | Escape on the link toolbar with no form open | the toolbar hides | passes | passes | passes |
| R21 | P2 | An editor in an open shadow root: Edit link, type `Draft`, blur the field so nothing has focus, focus it again | the form opens and keeps `Draft` | passes | passes | passes |
| R22 | P2 | An editor in an open shadow root: Edit link, type `Draft`, Shift+Tab from the URL field into the editor, then Edit link | back to the toolbar, and the form reopens with the link's text | fails, stays open | fails | passes |
| R23 | P2 | An editor and an iframe in one open shadow root: Edit link, blur the field so nothing has focus, then focus enters the iframe | back to the toolbar | fails, stays open | fails | passes |
| R24 | P2 | Edit link, type `Draft`, then focus moves from the field to a button on the page | back to the toolbar | fails, stays open | fails | passes |
| R25 | P1 | macOS with the link shortcut set to `ctrl+k`: select `xam` in `Example`, the link shortcut | the text stays `Example` | passes | passes | passes |

The link area has no generated check, so specs stand in for it: `apps/www/tests/browser/regressions/edit-link.spec.ts` for R1 to R8, R13, R14 and R17, `link-floating-toolbar.spec.ts` for R9, `link-url-policy.spec.ts` for R10, `link.lifecycle.spec.tsx` for R5, R11, R16 and R18 to R25, and `link-toolbar.spec.ts` for R12. No route here mounts the toolbar in a shadow root, so R21 and R22 also ran in Chromium on a scratch page that does, and that page is not committed. R21's bun case hands the document the focusin a browser sends it, whose target is the shadow host, so it fails on a focus listener on the document. Plite reads the platform once per window, and the suite's earlier tests read it as not Apple, so R25 ran as a scratch bun probe alone in its own process. In the suite, the case where the shortcut over a selection inside a link stops the browser's default and never reaches the editor's key handlers guards it. With the shortcut set to `ctrl+k` on macOS, R18's selection reaches Plite's `ctrl+k` delete, on next as on this tree. R15 fails as on next and stays open. The next and PR results for R16 to R19 are inferred from the code, which takes the same path there as on round 3's reviewed tree, where they ran red. R20's next and PR results are inferred from next's Escape handler, which hides the toolbar when no edit form is open, and R20 ran red on round 3's first `closeForm`. The next results for R21 and R22 ran in Chromium, R23's is inferred from next's iframe check, which reads only the document's focused element, and R24's from next, which has no focus exit. The PR results for R21 to R24 are inferred from the PR, which changes none of those paths. The bun specs gate landing, and the browser specs do not. happy-dom gives the selection no rect, so the floating toolbar is always hidden there. The bun specs check what mounts and what the store holds, and only the browser specs check what shows. For browser rows, "passes" in the run column means five warm runs of `edit-link.spec.ts` with no retries in each of Chromium, Firefox and WebKit, plus one run of the other link browser specs in each engine, on the final bytes. For the other rows it means bun. WebKit skips R14, as Open work says. R11 covers the insert form. Each way out of an edit form clears the draft and shows the toolbar again: Enter, Escape, a click outside, focus moving from the form to another element, the editor taking focus, and focus entering an iframe. The same exits hide the insert form. A blur to nothing keeps the form until one of them happens, so focus that later reaches another control or a second editor on the page leaves it open. R13 failed only when both the `editOpen` read and the shortcut's caret check went back; the caret check is gone now, so R13 guards the `editOpen` read alone.

## Main changes

- The Text to display field moves into `FloatingLinkTextInput`, which reads the store's text when the form mounts, as `FloatingLinkUrlInput` already reads the URL (Dylan Schiemann's commit). The toolbar's own render read, `const { text } = store.get()`, compiled into a cache keyed on `store` alone, so the field mounted with the toolbar's first, empty text. Before 5b0d5fb2be a ref callback refilled the field from a fresh read on every open, which hid the cached read (plate#5228).
- `submit` ends with the new `api.closeForm()`, which clears the draft and, after an edit, shows the toolbar again. The selected-link effect reruns only when the link under the caret changes, so after Enter nothing reopened it (plate#5314, from 98184323b5).
- The toolbar shows while `selectedLinkKey`, the subscribed key of the link under a collapsed caret, names a link. It used to read `editor.read.selection.isCollapsed()` while it rendered, which the compiler cached on `editor.read`. After the link shortcut over a selection inside a link, a collapse left the toolbar hidden.
- An open form closes through `api.closeForm()` on Escape, on a click outside, when focus moves from it to another element, when focus enters an iframe, and when the editor takes focus, which the link plugin's `focus` handler sees. The form's own blur keeps it when focus goes nowhere, such as after a click on its padding. No exit listens on the document, and the iframe check looks inside shadow roots for the focused element, so the exits work for an editor in a shadow root. A click outside used to hide the whole toolbar with the caret still in the link. With the form open and the editor focused, the shortcut used to reset the store under the draft the field still showed and leave focus in the editor, where Enter split the paragraph. `closeForm` returns false and changes nothing when no form is open, and it writes the store once. Escape on the toolbar alone still hides it, as on next, and the editor taking focus right after an exit leaves the toolbar shown.
- `LinkOpenButton` subscribes to the link under the caret with `useEditorSelector` instead of reading it while it renders. The compiler cached the render read on `editor` alone and dropped the unused `useEditorSelection()` result, so Open link kept the first link's address while the caret moved straight into another link. It started at 0231a088c4, which removed the `eslint-disable` line that made the compiler skip the component.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Toolbar design | Keep its open and edit states and fix each case | Rebuild it so the caret alone decides when it shows | redesign link toolbar | small |
| Toolbar after Enter on an edit | It comes back, as after Escape and on platejs.org | It stays closed until the caret leaves the link | close after save | small |
| Open link bug | Fixed in this run, since it is the same toolbar and the same cause | Leave it for a later task | split open link | detail |
| Other stale reads the audit found | Listed for a later run, since each needs its own repro | Fix them here | fix all stale reads | small |
| Dylan's PR | Land his commit with his credit, then close the PR with a link to the landed commit | Merge his PR as it is | merge PR | detail |
| Test route for the empty text | The Playground the reporter used | The home page Dylan's test used | home page test | detail |
| Focus leaving the open form | It closes the form and drops the draft once focus moves from the form to another element or the editor takes focus, as Escape and a click outside do; a blur to nothing keeps it, and focus that later reaches another control or a second editor leaves it open | It keeps the form open and refocuses it on the next link shortcut | keep form on blur | small |
| The link shortcut over a selection that touches a link | It behaves as on next. Inside one link it takes the key and starts an edit mode with no form, which keeps Insert link closed until the caret enters a link. Over a selection that leaves the link the key goes on to the editor and the browser. This run's version also let the key through to the editor over a selection inside one link, where next takes it, so with the shortcut set to Control+K on macOS, Plite deleted that selection, and the run reverted it. On next, Plite deletes a selection that leaves the link the same way | It opens Edit link for that link | edit link on selection | small |
| A click outside an open edit form | It goes back to the toolbar, as Escape does, and the caret decides what shows next | It hides the toolbar, as on next | hide on click outside | small |

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's transcript; the recall and audit readers ran gpt-6.1-sol at medium through `cross.mjs --reach`.

### Requirements

- The package has no floating store for link editing; the copied [link.tsx](../../apps/www/src/registry/components/editor/link.tsx) owns show, hide and submit ([link subject](topics/link.md), Layer and owner).
- Edit link fills both fields from the link under the caret, and a URL-only edit keeps the link's text (plate#5228).
- After Enter saves an edit, the caret stays in the link and the toolbar shows again, as after Escape (plate#5314).
- A link whose text equals its URL leaves Text to display empty, as `link-toolbar.spec.ts` pins.
- One editor's toolbar never opens in another editor on the page, as `link.lifecycle.spec.tsx` pins.

### What the code does

- [next.config.ts](../../apps/www/next.config.ts) sets `reactCompiler: true`, and no registry file opts out with `'use no memo'`.
- At f512cc3bed the compiled toolbar caches `store.get()` on `store`, so its text read keeps the first render's empty text for as long as the toolbar stays mounted. The text field took its `defaultValue` from that read.
- The compiler caches each `editor.read.*` call on its receiver, even inside a `useMemo` whose dependency list names the selection. The probe in the run directory compiles a sample of each shape.
- `submit` calls `api.hide()` after an edit, and the selected-link effect reruns only when `selectedLinkKey` changes, so nothing shows the toolbar again while the caret stays in the same link.
- `LinkOpenButton` read the link under the caret while it rendered and discarded the `useEditorSelection()` result, so the compiled button cached the link on `editor` alone.
- The toolbar's `editOpen` read `editor.read.selection.isCollapsed()` while it rendered, and the compiler cached it on `[editor.read, mode, open, readOnly]`. The selected-link effect's `show('edit')` changes only `isEditing`, so after the link shortcut over a selection and a collapse, none of those keys changed (plan panel round 1, all three seats).
- `triggerEdit` resets the store with one `store.set`, so an open form's inputs never remount and keep the `defaultValue` they mounted with. The editor's focus handler now ends an open form before the shortcut can reset it. The edit mode the shortcut starts over a selection inside a link never shows its inputs, because the collapse that would show them runs `show('edit')` first and brings back the toolbar (R13).
- An unhandled Mod+K goes to the browser, and Firefox focuses its search bar on it, as all three round 2 seats report; no drive here pressed it in Firefox.
- `triggerEdit` took the link above an expanded selection and set mode `edit` with `isEditing`, but the toolbar shows only while `selectedLinkKey` names a link, and the selected-link effect ends edit mode only when that key changes. A click outside any link keeps the key null, so the mode stayed, and `triggerInsert` returns early while any mode is set. The lead's browser probe before round 2 found it. At 1fb72c5810, which added the shortcut, the selected-link effect reran on every selection change and ended that mode; 98184323b5 keyed it on the link under the caret, so it introduced this bug too.
- A form's own blur handler misses a blur with no next element, such as a click on the form's padding, so the editor could later take focus with the form open (plan panel round 3, the gpt-6-astra and gpt-6.1-sol probes on the compiled component). The link plugin's `focus` handler closes the form when the editor takes focus.
- A capture `focusin` listener on the document, round 3's fix for that blur, sees the shadow host as the target when the editor sits in a shadow root, and it never sees focus move between two elements of one shadow root. Opening Edit link from its button there closed the form at once (diff panel round 1, all three seats; the lead's Chromium run on a scratch page that mounts the toolbar in a shadow root).
- In Chromium the editor taking focus also ends the form on the tree panel round 3 reviewed, which has no editor focus exit, on the Playground, the link demo and the scratch shadow-root page, so no browser case here tells the two apart. The bun case for R16 does, with the `focus` handler removed.
- The link shortcut opens no form in an editor inside a shadow root, on next as on this run's tree (the lead's Chromium run on the scratch page).
- On round 1's reviewed tree, the Chromium shadow-root cases all failed while opening Edit link, before their refocus and Shift+Tab steps, so that run shows the opening defect red and not the two later steps (diff panel round 2, gpt-6-astra and gpt-6.1-sol).
- With the link shortcut set to `ctrl+k` on macOS, round 4's `mod+k` handler stopped the browser's default and reported the key unhandled, so Plite ran its Apple `ctrl+k` delete and `Example` became `Eple` (diff panel round 2, gpt-6-astra; the lead's bun probe in a macOS window, red on that tree and green on next, the PR's head and this tree).
- The selected-link effect is the suspect for the editor's focus ending the form in Chromium: a brief change of the link under the caret runs `show('edit')`, which ends the form, and so would a remote edit that gives the link a new key (diff panel round 2, opus, unverified).
- `nodes.above` over a range starts at the common ancestor of its ends, so a selection that leaves a link has no link above it (plan panel round 3, opus and gpt-6-astra).

### Lanes

1. **Keep the open and edit states and fix each case. Wins.** Six small changes pass R1 to R14 and R16 to R25, though WebKit skips R14. R15 fails as on next.
2. **Show the toolbar whenever the caret is in a link, with a dismissed-link state for Escape and click-away. Loses.** The toolbar already has that state without a name, mode `''` with the caret in a link, and plate#5314 was `submit` landing in it. Naming the state deletes the effect that shows the toolbar, but it passes no row the first lane fails.
3. **Opt the toolbar out of the compiler with `'use no memo'`. Loses.** It hides every stale read in the file instead of fixing it, and the compiled cache keys would still be wrong in any app that copies the file into a compiled build.

### Dependents

- `distribution`, `editing`, `persistence` and `react`: unaffected, because the change stays in the copied registry file and changes no package source.
- `ui`: `apps/www/src/registry/components/editor/fixed-toolbar.tsx`, `apps/www/src/registry/components/editor/floating-toolbar.tsx` and `apps/www/src/registry/components/editor/plugins-static.ts` are unaffected, because the change adds no export to `link.tsx` and changes no exported signature.

### History

- This review supersedes [2026-10-12-link-review](2026-10-12-link-review.md) as the scope's head, because it judges a question that review did not, whether the toolbar's open and edit states need a redesign. That review's contract stands, and the copied toolbar still owns show, hide and submit.
- This review retains [2026-10-12-link-toolbar-draft](2026-10-12-link-toolbar-draft.md), because `submit` still turns the typed draft into an address the same way; only its last line, which hid the toolbar after an edit, changes.

## Steps

- [x] 1. Take Dylan's commit as the candidate for plate#5228 and prove it on the reporter's route. Proof: R1 fails on next, where R2 and R3 are not reached, and R1 to R3 pass on the PR in Chromium.
- [x] 2. Show the toolbar again after Enter saves an edit. Proof: R5 and R6 fail on the PR and pass with the change in Chromium.
- [x] 3. Audit render-time reads of editor and plugin state in the copied registry UI, and fix the confirmed one in the link toolbar. Proof: R8 fails before the change and passes after it in Chromium; the compiled output of `link.tsx` shows each cache key.
- [x] 4. Run the panel on this plan and settle its findings. Proof: each round's critical findings are applied with a test red on that round's tree and green after, the lead reverted its R15 fix after diff round 2, and R15 stays open as on next, and round 3's fixes get a diff round once built.
- [x] 5. Run the writing passes and the diff rounds on round 3's, round 4's and round 5's fixes, regenerate the registry output and update the registry changelog entry.
- [x] 6. Run R1 to R25 in Chromium, Firefox and WebKit, five warm runs of `edit-link.spec.ts` in each, and the hand drive. Proof: one log per engine and run, and the `hand-drive.mjs check` log.
- [ ] 7. Land through `land.mjs` with a `Co-authored-by: Dylan Schiemann` line and no GitHub closing keyword in the message, record plate#5228 and plate#5314 as fixed, post their comments, run `pnpm triage labels` and close udecode/plate#5238 with the landed commit.

## Open work

- The render-read audit lists 33 candidates outside the link toolbar in 18 files, in comments, discussion, footnotes, tables, lists, the table of contents, the AI preview and the static renderers. Each needs its compiled cache keys checked and a browser case that shows a stale value before a fix. owner: zbeyens. stop: the first candidate that shows a stale value in a browser.
- No check refuses a render-time read of editor or plugin state in copied UI, and the bun specs run without the compiler. Four link bugs came from such reads, and each would have failed such a check once 0231a088c4 removed the `eslint-disable` lines. owner: zbeyens. stop: the owner takes or drops its suggested task.
- Six findings of the thermo review on round 4's diff wait for a refactor of the link toolbar: one mode field, one floating hook, a rewrite of the shortcut's trigger, one input component, deleting `reset` and a toolbar derived from the store. owner: zbeyens. stop: a link toolbar refactor task.
- The link area has no generated check, so its specs stand in for one, and five warm runs replace its seed rounds. owner: zbeyens. stop: copied registry UI gets a generated check.
- The link shortcut opens no form in an editor mounted in a shadow root, on next as in this run, and no route here mounts one. owner: zbeyens. stop: a report of the link shortcut in a shadow-root editor.
- The link shortcut over a selection inside a link starts an edit mode with no form, as on next. Until Escape or the caret entering a link ends it, Insert link and the fixed toolbar's Link button do nothing and the formatting toolbar stays hidden (R15; traced by diff round 3, not run). With the shortcut set to `ctrl+k` on macOS, a selection that runs from a link into the text after it reaches Plite's `ctrl+k` delete, as on next (the lead's probe), and so does one made while that mode holds (traced). This run's fix let the key through to the editor, and the run reverted it. owner: zbeyens. stop: its suggested task, or a report of the formatting toolbar or Insert link not showing.
- In WebKit, which leaves buttons out of the Tab order by default, Shift+Tab from the link form's URL field focuses the editor. The caret then jumps from the link to the audio block at `[20,0]`, so the toolbar has no link to show, and `edit-link.spec.ts` skips R14 there. The lead's WebKit probe saw the same jump on next, without binding the served bytes to next, and a Tab forward into the editor keeps the caret in place. Playwright's WebKit is not Safari. owner: zbeyens. stop: a Safari report of the caret jumping on Shift+Tab.
- The home page AI menu case in `link-floating-toolbar.spec.ts` failed in Firefox twice, each time right after five Firefox runs of `edit-link.spec.ts`, while it waited 8 s for the editor's first paragraph. It passed alone and in its own batch on this tree and on next's `link.tsx`, so the run cannot tie it to either. owner: zbeyens. stop: its next failure outside a long run.
- R25 runs only as a scratch probe in its own process, because Plite caches the platform per window. A fresh window realm, as `hotkeys.spec.ts` uses, might run it in the suite; the lead's try with a happy-dom iframe realm threw. owner: zbeyens. stop: a committed macOS case for the link toolbar.
- After a blur to nothing, focus that reaches another control or a second editor leaves the form open, and the iframe check neither enters closed shadow roots nor sees focus leave an editor that sits in an iframe. owner: zbeyens. stop: a report of a link form left open after focus moved on.
- Only a scratch Chromium page, not committed, drives the shadow-root exits in a browser. owner: zbeyens. stop: the next shadow-root report against the link toolbar.
- The selected-link effect may end an open form when the link under the caret changes key, such as after a remote edit, which drops the draft (unverified). owner: zbeyens. stop: a report of a link draft lost while collaborating.
- Two other copied components read the document's focused element without looking inside shadow roots: `discussion.tsx` at line 1241 and `insert-toolbar-button.tsx` at lines 80, 290 and 326. Neither was driven in a shadow root here. owner: zbeyens. stop: a shadow-root report against either.
- Plite takes happy-dom for WebKit, because `NON_BROWSER_DOM_USER_AGENT_RE` in `packages/plitejs/src/dom/utils/environment.ts` matches jsdom and not happy-dom, so the bun shadow-root cases stub `execCommand`. owner: zbeyens. stop: the next Plite test that needs the stub.
- `LinkElement` and the static link read the plugin's allowed schemes while they render, so a runtime change of allowed schemes keeps a mounted link's old address, as the 2026-10-11 URL-policy review found. owner: zbeyens. stop: an app that changes allowed schemes at runtime.
