# Plite onFocus during selection writes

Status: executed; waiting on your commit of the working tree on next
Page: https://claude.ai/artifact/CLKTDEqDSiwgxbnCejDSr2
Playbook: bug-fix

## Brief

### What will change?

The editor now tells your app when it gets focus, even while it is placing the cursor. An editor you just left no longer grabs focus back when its cursor moves. The tags field opens its menu on focus, and its tests passed five times in a row with no waits.

### What could go wrong?

If your code moves the cursor while the editor has no focus, the page cursor now waits until the editor gets focus, and the page does not scroll to it. The tags tests pass with no waits only when you commit this together with the blur session's fix. Two bold-text browser tests fail on next with or without this.

## Teach

The editor tells the app when it gets focus, the same way a plain text box does. It also keeps its own note of whether it has focus.

Until now, both stopped while the editor was placing the cursor. That window stays open for a few frames after each keystroke or cursor change. A real focus that landed in it went unheard. The app missed it, and the editor's note said it had no focus while it did. The tags field worked around this by listening one step earlier.

Now the app hears that focus first, like with a plain text box. The editor also notes the focus inside that window. One exception stays. Right after a click outside, the editor still skips its own note for a moment, though the app hears the focus.

After each change, the editor also puts its cursor on the page. In Chrome, putting the cursor inside an editor focuses it. So when that happened just after you left the editor, it pulled focus right back. In the tags field, Escape closed the menu, then the editor took focus back and the menu reopened. Now the editor puts its cursor on the page only while it has focus, and does it again when focus returns.

## Main changes

- `applyEditableFocus` calls the `onFocus` prop before Plite's own gates. It no longer returns early while `isUpdatingSelection` is set, so a focus during a selection write sets `IS_FOCUSED` and the editor's focused state. The outside-press settle window still skips that bookkeeping.
- The commit-driven DOM selection export in `useEditableRootSelectionExport` skips while `ReactEditor.isFocused(editor)` is false. The deferred `syncProgrammaticFocusSelection` that `handleFocus` schedules does the same. Neither writes the page selection into a blurred editable.
- Four React contracts that set a selection now focus the editor and wait 20 ms first. Three of them need focus to see the export or the scroll. The fourth checks that a remote selection does not scroll, which would pass without proving anything on an unfocused editor.
- The tags field opens its menu from `onFocus` instead of `onFocusCapture`. Its close cases no longer pause before Escape, mod+Enter or the outside click.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Focus while the cursor is being placed | The editor records it as focused | Keep ignoring it, so the editor can think it has no focus while it does | ignore focus | small |
| Focus right after a click outside | The app hears it, and the editor's own note still skips it | Note it too, or hide it from the app as before | record settle | small |
| Cursor moves while the editor has no focus | Show them on the page once the editor gets focus (look) | Show them right away, which pulls focus back into the editor in Chrome | export unfocused | big |
| Release note for the tags field | None, since the field works the same | Add a component changelog note | add entry | detail |

## Close

Landed, all left in the working tree on next except what your 09:19 commit already took. Commit 6fa1169c5e holds the editable's focus gate in plitejs, two jsdom tests and the tags field's switch to `onFocus`. The working tree adds the export and focus-sync guards in plitejs, two jsdom tests for them, the focus step in four React contracts, the removed pauses in the field's browser spec, the plitejs changeset and the rebuilt registry output.

One reversal. The first round left the export guard to the session "Stop Plite dropping blurs during selection writes", and this page said so. That session reverted its guard because it broke three React contracts, and handed the call back. I took it. Plite now writes the page selection only into a focused editor. It is a look-level default with its own row above. Fixing it turned up a second writer, the deferred focus sync, which got the same guard. `applyEditableBlur` and the mutation-controller guard stay that session's work.

Proof and its limits:

- Round 1, red then green: both `onFocus` tests failed with 0 calls before the fix and pass after.
- Round 2, red then green: without the guards, both new blur tests fail. With only the export guard, the blur-right-after-focus test still fails. With both guards, the editable behavior file passes 37 of 37.
- An Escape probe against this checkout's dev-source server showed the cause. Before the guard, the export refocused the editor about 10 ms after the blur and the menu reopened. With it, the menu stays closed in two runs.
- On the final bytes, the plitejs React suite passes 1,447 of 1,447 in 94 files with no uncaught error. Typecheck and lint pass, and lint changed no bytes. The field's unit spec passes 19 of 19.
- On the final bytes, the select-editor browser spec passes 14 of 14 in each of five warm runs against the dev-source server. The tree includes the blur session's uncommitted hunks, so this proof holds only when both changes land together. The outside click needs the blur fix, and Escape and mod+Enter need this one. Another session's `wrap-nodes.ts` edit landed two seconds into the fifth run, and no file of this task changed during the runs.
- In a worktree at 6fa1169c5e with every focus and blur hunk, the Plite focus-blur browser file passes 6 of 6 in each of five runs. With it, eleven other focus-related Plite browser files pass in one run, 315 tests across 20 batches. I left out two richtext cases because they fail on next with or without this fix.

Counts: 15 items, 7 asks, 2 constraints and 6 gates. 14 done, 0 partial, 0 skipped, 0 blocked, 1 open (the commit is yours).

## Open work

- Two richtext browser cases fail on next whether or not this fix is in: keeps selected bold as the active mark after deleting its text, and keeps empty paragraph styling after the selection leaves and returns. Tracked in the tags subject's Open work. owner: zbeyens. stop: both pass on next.
- Two paths can still miss a real focus: the outside-press settle window skips the editor's own focus note, and a focus on the editor root while a nested editable holds the selection skips `onFocus` and the note. I did not reproduce either as a user bug. Tracked in the tags subject's Open work. owner: zbeyens. stop: each is reproduced and fixed or judged intended, or 2026-11-30.
- The tags plan's reflect backlog item 4 would teach `onFocusCapture` for copied voids, which this fix makes unnecessary. Tracked in the tags subject's Open work. owner: zbeyens. stop: the owner takes item 4 without that part, or drops it.
