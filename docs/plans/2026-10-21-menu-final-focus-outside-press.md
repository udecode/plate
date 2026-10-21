# Keep focus where an outside click puts it when a dropdown closes

Status: done: merged into next as c2246af03c
Topic: ui
Playbook: bug-fix

## Brief

### What will change?

The PR keeps the toolbar, but it also pulls focus back into the editor after any outside click. My commits move the fix into both dropdown adapters, which refocus the editor only when the menu or its toolbar closed it.
### What could go wrong?

On the floating toolbar, a Bold press while a menu is open still does nothing, as on next. The toolbar also hides while the second click on More is held, then returns, as with the PR's own fix.

## Teach

A toolbar dropdown hands focus back when it closes. Unless the chosen item says otherwise, the menu's fallback puts focus back in the editor. The PR runs that fallback for every close, so a click on a heading while More is open pulls focus back into the editor.

Each adapter now notes the last press or key while its menu is open, with a window listener, because the floating toolbar removes the menu before Radix reports an outside press. A left press in the menu, its button or its toolbar, or any key but Tab, means the menu closed itself, so the fallback runs. Tab, a right-click outside the menu, or any other press on a non-modal menu leaves focus where the user put it.

The fallback also skips a close once another element already holds focus, such as the font size box after a click in it, or Turn into opening from the press that closed More.

## Public API

More formatting keeps its menu-wide editor refocus and drops three item props that did the same thing.

```tsx before
// apps/www/src/registry/components/editor/more-toolbar-button.tsx
<DropdownMenuItem
  finalFocus={() => editor.api.dom.focus()}
  onSelect={() => {
    editor.plugin(ScriptPlugin).update.toggle('sup');
  }}
>
```

```tsx after
// apps/www/src/registry/components/editor/more-toolbar-button.tsx
<DropdownMenuItem
  onSelect={() => {
    editor.plugin(ScriptPlugin).update.toggle('sup');
  }}
>
```

## Layer and owner

| Delta | Responsibility | Decision |
| --- | --- | --- |
| changed | Menu focus | Item-scoped `finalFocus` in the Base and Radix adapters; only a successful closing selection arms it, and `false` suppresses it. Content-level `onFinalFocus` is the fallback for a close the menu owns: a left press in the menu, on its trigger or in the trigger's toolbar, any key but Tab, or a left press outside a modal menu. Tab, a right-click outside the menu, a press outside a non-modal menu, or focus already on another element leaves focus where the user put it. Both adapters take the close record and the window capture listeners that write it while the content is open from `menu-close-focus.tsx`. The listeners exist because the floating toolbar can unmount the menu before the library reports the press. |

## Main changes

- `apps/www/src/registry/components/editor/menu-close-focus.tsx` is new, and the dropdown menu installs it beside its adapter. It holds the close record, the window listeners that write it and the moved-focus check, so the Base and Radix adapters share one copy.
- `apps/www/src/registry/bases/radix/dropdown-menu.tsx` wraps `DropdownMenu` to hold one close record per menu, with its `modal` flag and its trigger's ref. The record is the next close's focus intent: an item's `finalFocus`, `false` to leave focus where it is, or nothing to run the fallback. While the content is open, window capture listeners for `pointerdown` and `keydown` write it from each gesture, and an item selection that closes the menu writes its own intent. `onCloseAutoFocus` reads and resets the record, then runs the item's intent, suppresses focus restore, or runs the fallback. It also suppresses the fallback when an element other than the page body, the trigger or the menu already holds focus.
- `apps/www/src/registry/bases/base/dropdown-menu.tsx` shares the same record and listeners. Its `finalFocus` function returns `false` after a user close or an item intent, because a function there skips Base UI's own moved-focus check. Base keeps a closing popup mounted while it animates out, so a press in that window does not overwrite the record, and a parent that reopens the menu in that window clears it. The adapter turns off the content's exit animation, as the Radix adapter already does on `next`, so that window lasts one frame. Focus in a submenu counts as inside the menu, because the content tracks focus through React's focus events, which bubble out of the submenu's portal.
- Both adapters' triggers and contents combine a ref from a parent with their own. A tooltip or popover anchor that wraps the trigger still gets the button, as on `next`.
- Content rendered under shadcn's own root, without the adapter's `DropdownMenu`, keeps its own record. Item intents still win there, and every other close runs the fallback, as it does today.
- `apps/www/scripts/registry-create-install-e2e.mts` checks More formatting on both installed variants. A click on blank page space leaves focus on the page body, and a second click on the fixed toolbar's button focuses the editor. On the floating toolbar, two clicks on More keep the toolbar and the selected word, and Bold then marks that word. Escape on More and a Bold press while More is open keep the toolbar and the selection. On the fixed toolbar, Turn into pressed while More is open keeps focus in its menu, and a click in the font size box while Turn into is open keeps focus in the box. The page uses Playwright's Desktop Chrome descriptor, as the browser specs do, because Plite reads headless Chromium's own `HeadlessChrome` user agent as WebKit and clears the selection on blur.

## Decisions

- The fix lives in the two adapters, not in each copied menu. Five dropdown menus share the fallback: More formatting, Turn into, font color, table cell and table borders. The adapters already own the menu's focus lifecycle.
- The adapter reads the gesture from the page, not from the library's close callbacks. On the floating toolbar, an outside press unmounts the menu before Radix's outside-press listener runs, so `onInteractOutside` never fires.
- A left press anywhere in the trigger's own toolbar counts as the menu's close. Otherwise a Bold press while Turn into is open would hide the floating toolbar, which next does not do.
- The fallback never takes focus back from an element that already holds it. On next, pressing Turn into while More is open opens Turn into with focus inside it, and it still does. On Radix, a control that takes focus only on click, after the menu's close, gets it after the fallback runs.
- Any key but Tab counts as the menu's close, so Escape runs the fallback on both adapters. Tab leaves focus where it lands: on Base UI it moves focus out of the menu, and Shift+Tab lands on the trigger, which the fallback would otherwise leave for the editor. On Base UI, Escape in a submenu still closes only that submenu.
- On Base UI, the content tracks whether focus is inside it through React's focus events, not the popup's DOM. A submenu renders in its own portal, so a DOM check would treat a click on a submenu item, such as in the table menu, as focus already moved, and the editor would not get focus back.
- A left press outside a modal menu only dismisses it, so the fallback still runs, as on next. On Radix the page under the menu takes no pointer events.
- Callers get no new prop and no close reason. Passing the reason to `onFinalFocus` lost, because every caller would repeat the same outside check.
- Checking `document.activeElement` in More's fallback lost. A click on non-focusable text leaves focus on `body`, so the check cannot tell it from a trigger close, and the other four menus would keep the bug.
- Running the fallback early, in a layout effect, so that a Bold press while a menu is open acts, lost for this PR. The adapter cannot tell a real unmount from React's StrictMode replay there. The lost press is the floating toolbar's to fix, and a follow-up task covers it.

## Law text

`docs/vision/plate.md`, in the copied-controls rule:

> A copied dropdown item owns the final focus intent of its selection, the menu content keeps only the fallback, and cancellation or explicit focus suppression wins. A dropdown runs the fallback only for a close the menu or its toolbar owns. After the user presses outside a non-modal menu, right-clicks outside any menu, or moves focus out, focus stays where the user put it.

`docs/plans/topics/ui.md` takes the Menu focus row above at the close, with the gesture list. Its adapter bullet under Main changes reads: the Base and Radix `dropdown-menu.tsx` adapters own the menu focus lifecycle through item-scoped `finalFocus` and a close record. The shared `menu-close-focus.tsx` holds that record and the window listeners that write it while the menu is open.

## On top of the PR

- Kept: More's `onFinalFocus` fallback, the changelog entry, and the browser spec's route and its trigger-close check.
- Changed: both dropdown adapters skip the fallback after an outside click, a right-click, Tab or a focus move. They share that code through a new installed file, `menu-close-focus.tsx`. The PR's fallback also pulled focus back into the editor when Turn into opened from the press that closed More, which closed Turn into at once. The browser spec gains an outside-click phase that runs first, an Escape phase, a native selection check, a Bold check over the whole document, a Bold press while Turn into or More is open, an outside press on the fixed toolbar's More and Turn into, a Turn into press while More is open on both toolbars, a script that moves focus out of More, and a press in the fixed toolbar's font size box while Turn into is open. The installed-app check covers More on the fixed and floating toolbars, plus Escape and a Bold press while More is open on the floating toolbar, and a Turn into press while More is open and the font size box while Turn into is open on the fixed toolbar.
- Dropped: More's three item `finalFocus` props, which repeat the fallback.

## Open work

- A press on another floating toolbar button while one of its menus is open does nothing, though the toolbar and the selection stay. That holds for Bold on both adapters and, on Base UI, for Turn into while More is open, where next also hid the toolbar. Base UI closes More from a document capture listener, so the toolbar loses its overlay hold before the pressed button reports its own. The same teardown hides the floating toolbar while the second click on More is held down. The toolbar unmounts when More closes with focus still in the menu, and it stays hidden until the mouse button comes up. It then returns with the same selection. The PR's own fix does the same in every probe run (`probe-blink-3667-a1.log`, `probe-blink-author-3669-a1.log`). Owner: zbeyens. Tracked in the suggested-task ledger as t_71cfe0f3. Stop: a suggested task that keeps the floating toolbar mounted through its own presses and until a menu's close focus settles, after which the adapters can drop their window listeners. Dropping them also closes two gaps the listeners leave: on Base UI, a press or a reopen in the frame before a closed menu unmounts goes unrecorded, and a left press in any other open menu counts as this menu's own close.
- From a source read, a menu rendered into another document, such as an iframe, never sends focus back to the editor, even after a close it owns. The adapters read the module's document and listen on its window. Nothing in the repository renders these menus across documents. Owner: zbeyens. Tracked in the suggested-task ledger as t_8e3579a4. Stop: a suggested task that reads the trigger's own document.
- Plite reads headless Chromium's `HeadlessChrome` user agent as WebKit and clears the selection on blur, so the installed-app check needs Playwright's Desktop Chrome descriptor. Owner: zbeyens. Tracked in the suggested-task ledger as t_6c9b77eb. Stop: a suggested task that fixes the check in Plite and drops the descriptor.
- The context-menu adapters still run their fallback after every close. Owner: zbeyens. Tracked in the suggested-task ledger as t_f3cc801d. Stop: a suggested task that has both context-menu adapters use `menu-close-focus.tsx`.
- The browser spec and the installed-app check each script the same menu focus steps, and the browser spec repeats its setup in every case. Owner: zbeyens. Tracked in the suggested-task ledger as t_9dc999e9. Stop: a suggested task that shares those scenarios between the two.
- Under Playwright's WebKit, a menu on the floating toolbar never opens, with next's adapters, the PR's or these, so the WebKit run proves only the fixed toolbar. The likely cause, not yet proven, is Plite clearing the selection when the editor blurs on WebKit. Owner: zbeyens. Tracked in the suggested-task ledger as t_477a6b45. Stop: a suggested task that checks it in Safari and fixes it.

## Verification

- The browser spec passed five times warm on Chromium with no retries after the last menu edit, once more on a fresh merge of next, and failed with the PR's own adapters. On WebKit its four fixed-toolbar cases pass and its five floating-toolbar cases fail when the menu should open, as with next's adapters, so the floating-toolbar path, plate#5209's own, is proven on Chromium alone.
- The adapter unit cases pass for both Radix and Base UI, with the copied shadcn menu mocked. They are the only proof of Base UI's Tab, right-click and table submenu cases, and a case for each parent ref failed before the fix. The installed-app check builds editor-basic and editor-ai on both variants and runs its gesture steps on editor-ai alone. `pnpm check --affected` passed on the merged tree.
- A hand drive on the site covered every page the change shows. On the floating toolbar, the second click on More hides the toolbar while the button is held, and the toolbar comes back with the selection, as it does with the PR's own fix. The last drive read focus, selection, menus and marks only, because the browser pane was hidden and drew almost no frames.

## Steps

- [x] Write the adapter cases, the browser cases and the installed-app check, and see them fail on the PR's adapters. Proof: `dropdown-menu-focus.spec.tsx` fails its outside-press, right-click, Tab and focus-move cases for both providers, the browser spec fails both fixed-toolbar outside-press cases, both Turn into cases, the focus-out case and the font size case, and the installed-app check fails its outside-click step.
- [x] Record the closing gesture in both adapters and delete More's three item intents. Proof: `dropdown-menu-focus.spec.tsx` and `mark-toolbar-button.spec.tsx` pass.
- [x] Move the shared close-focus code into `menu-close-focus.tsx`, and pass a parent's ref through both triggers and both contents. Proof: the ref cases fail before the fix, and `dropdown-menu-focus.spec.tsx` passes after it.
- [x] Write the law text into `docs/vision/plate.md` and update the changelog entry. Proof: `plan-page.mjs --check` and the changelog generator's `--check` exit 0.
- [x] Regenerate the registry. Proof: `pnpm --filter www build:registry` exits 0.
- [x] Prove it on the site's Radix adapter and on both installed variants. Proof: the browser spec five times warm with no retries on Chromium and once on WebKit, one red run with the PR's adapters, `pnpm --filter www test:create-install editor-basic editor-ai`, `pnpm check --affected`, and a hand drive on the site.
- [x] Run `best-api repair` on the menu focus rule. Proof: its report names no artifact left teaching the old fallback, apart from the context-menu adapters, which a follow-up task covers.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Left press outside a modal menu | Focus goes back to the editor, as it does today | Focus goes to the menu button | modal trigger | small |
| Where the fix lives | Both dropdown adapters, for every toolbar menu | Only More formatting, with a focus check | local guard | big |
| Press outside a non-modal toolbar menu: More formatting, Turn into, table and table borders | Focus stays where the user put it | Focus goes back to the editor, as on next | outside refocus | big |
| Menu content used with shadcn's own root | Works as it does today, refocusing the editor on every close no item handles | Throws until wrapped in the adapter's own menu root | require root | small |
| Escape on More formatting | Focus goes back to the editor and the toolbar stays, as on the other four toolbar menus | Focus stays on the page and the toolbar hides, as on next | escape native | small |
| Tab out of a Base UI toolbar menu | Focus stays where Tab put it, on the trigger after Shift+Tab | Focus goes back to the editor, as Turn into, font color and the table menus do on next | tab refocus | small |
| Right-click outside the menu, a toolbar button included | Focus stays where the right-click put it | Focus goes back to the editor, as font color does on next | right click refocus | small |
| Pressing another button in the menu's toolbar | Counts as the menu's close, so the editor, the toolbar and the selection stay; on the floating toolbar a Bold press, and on Base UI a Turn into press, still does nothing, as on next, and a follow-up task covers it | Leaves focus where it is, and the floating toolbar hides | toolbar leaves | big |
| A gesture that did not close the menu, then a close with no gesture, such as a refused close | Focus follows that gesture: it stays after an outside press or a right-click, and the item's own intent runs after an item | The record expires at the end of each gesture, so that close refocuses the editor | expire record | small |
| Escape in a Base UI submenu | Closes only the submenu, as Base UI does | Closes the whole menu, as Radix does | escape closes root | small |
| Base UI menu closing animation | Off, as the Radix adapter already has it on next, so a click right after a close keeps its focus | Keep Base's fade-out, and a click during it loses focus to the editor | base fade | small |
| Floating toolbar hiding while the second click on More is held | Merge with the limit stated, as the PR's own fix behaves, and fix the toolbar in a suggested task (look) | Fix the floating toolbar in this PR before the merge | fix flicker | big |
| The ui page's old link, https://claude.ai/artifact/WEzA582D2wBjBdtc7jZgRT, no longer opens | Keep the new page, https://claude.ai/artifact/FqHGvHTUYHBCAy72HTj23W, as the subject's page | Drop the new page and keep the subject without a published page | drop ui page | small |

## Close

Reversals first. The first design read the reason a menu closed from the menu library, and it failed, because the floating toolbar removes an open menu on an outside press before Radix sees the press. The adapters record the last press or key from the page instead. A prototype then showed that the PR, and the first prototype, closed Turn into at once when it opened from the press that closed More, so the fallback now skips a close once another element holds focus. The thermos bug reviewer found that both triggers and the Base UI content dropped a ref from a parent, which `next` passes through. The fix and a case for each ref landed with the move into `menu-close-focus.tsx`. One slip: the plan's Verification changed while the thermos reviewers read it, and the decision log records it.

What landed, in PR 5230 on top of the author's commit, merged into `next` as c2246af03c:

- `menu-close-focus.tsx`, which the dropdown menu installs, holds the close record, the window listeners that write it while the menu is open, and the moved-focus check. Both dropdown adapters use it.
- Both adapters run the fallback only after a close the menu or its toolbar owns, and pass a parent's ref through their triggers and contents.
- More formatting drops its three item `finalFocus` props. The browser spec, the adapter cases and the installed-app check cover the new gestures.
- The law text in `docs/vision/plate.md` and the changelog entry, with the registry output regenerated on a fresh merge of `next`. `docs/plans/topics/ui.md` now holds the Menu focus row and the adapter bullet.

Proof and its limits:

- The browser spec passed five times warm on Chromium after the last menu edit and once more on the merged tree, and it failed with the PR's own adapters. WebKit proves only the fixed-toolbar cases.
- The adapter cases pass for both providers, and they alone prove Base UI's Tab, right-click and submenu cases. The installed-app check passed on both variants, and `pnpm check --affected` passed on the merged tree.
- The last hand drive read focus, selection, menus and marks only, because the browser pane was hidden. The floating toolbar's position and flicker rest on the Chromium spec.

Counts: one owner ask, "babysit merge", is done for this PR. Every gate closed: proof, the writing passes, the panel and thermos reviews, `best-api repair`, the last check and delivery. Six suggested tasks hold the open work above.
