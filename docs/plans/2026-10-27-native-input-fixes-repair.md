# Native input fixes repair

Status: executed
Page: https://claude.ai/artifact/VLctpPuSpQycrRofH2iciv
Playbook: babysit

## Brief

### What will change?

Three beta fixes land together: undo inside a text field in the editor, the Android caret handle after a tap, and Safari's heading shortcuts. On top of them, the repair fixes two problems the review found.

### What could go wrong?

Undo in a text field now uses the browser's own undo, so it can act differently per browser. The Android check ran on a phone browser built on Chrome's engine, not Chrome itself.

## Teach

The editor decides, for each key press or input event, whether it handles the event itself or lets the browser do it. Undo and redo always went to the editor's history. So pressing undo in a text box inside the editor, such as a name field in an embedded block, undid the editor instead of the text box.

The pull request hands undo in a text box to the browser. A finger tap past the end of a line now places the caret the browser's way, so Android shows its handle. Safari's Command+Option digit keys now match by the physical key.

On top of that, the text-box rule now applies only to text boxes the editor knows as its own controls, so every path makes the same call. And the digit fallback only runs for shortcuts that ask for Command and Option, so a plain digit shortcut cannot fire on the heading keys.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Review findings | Fix the two real ones on the branch, then merge | Merge as is and fix later | merge as is | small |
| Text boxes in an editor shown inside a frame | Keep editor undo there, as before | Give those text boxes their own undo too | frame field undo | detail |
| Where the editor decides undo ownership | Leave the three checks the pull request added | Route all undo through one decision first | one history owner | detail |
| Android proof | Accept the phone run and the emulated touch test | Run Chrome on an Android emulator before merging | chrome device proof | small |

## On top of the PR

- Kept
  - The text-field undo rule, the tap rule and the digit fallback, with their browser tests.
- Changed
  - The text-field undo rule applies only when the field is one of the editor's internal controls, on both the key press and the input event paths.
  - The Command+Option digit fallback moved out of the shared key matcher into the path that checks modifiers, so shortcuts with `ignoreModifiers` match as before.
  - The beforeinput text-field test now uses fields from the editor's own window and covers a field the editor does not own.
- Dropped
  - The cross-window test, which passed `internalTarget: true` for elements that production never marks internal.
  - The AltGr hotkey case, which caught nothing the `mod+alt+8` case misses.

## Main changes

- `classifyKeyboardIntent` and `classifyBeforeInputIntent` in `packages/plitejs/src/react/editable/input-controller.ts` leave undo to a text field only when `isInteractiveInternalTarget` holds, so the intent never says `internal-control` while the decision says the target is not internal.
- `matchCommandOptionDigit` in `packages/plitejs/src/dom/utils/hotkey-match.ts` runs only from `matchHotkey`'s modifier-checked path.

## Demo

No before and after clips were captured. Each step names a flow that the browser tests or the hand drive checked.

1. Open `/examples/plite/editable-voids`, type in a void's Name field, then press Cmd+Z. The field undoes its own text, and the void stays.
2. Open `/examples/plite/embeds`, edit the video URL, then press Cmd+Z and Cmd+Shift+Z. The URL field undoes and redoes its own text.
3. On an Android phone, open `/examples/plite/plaintext` and tap past the end of the line. The caret handle shows at the end of the line.
4. In Safari, open `/docs/basic-blocks`, put the caret in a paragraph and press Cmd+Option+1. The paragraph becomes a heading.

## Verification

- The repair adds three unit cases, and all three pass with it. Two fail on the PR's code with their own assertions, the Command+Option case for a shortcut that ignores modifiers and the undo case for a text field the editor does not own. The third keeps the PR's behavior for the editor's own fields. `pnpm check --affected` passes all 29 steps, lint finds no errors, and the Plite typecheck passes 13 of 13 tasks with nothing cached.
- The managed Chromium suite for the changed examples passes 90 cases and skips 2, and the emulated mobile project passes 15, the tap case included. Two throwaway probes, not committed, showed that the embed's URL field keeps its own undo and redo, and that four undo presses in a void's Name field never reach the editor.
- A desktop hand drive covered the void field, the embed URL, a click past the end of a plain text line and Cmd+Option+1 on a paragraph. Proof stops short of Android Chrome, since the tap fix ran only on Via with WebView 147 and in the emulated mobile project. It also stops short of Safari's real key event, which only the unit case covers, because the built-in browser sends the digit itself.

## Open work

- Keydown checks the undo keys again instead of reading the input decision. owner: zbeyens; tracked: this plan and the Defaults word "one history owner"; stop: the next change to undo routing in Plite's input controller.
- Four checks for "is this a native control" use three different rules, and only some work across windows. owner: zbeyens; tracked: this plan; stop: the next fix to any of them.
- The tap rule sits inside a long mousedown handler and guesses text blocks from the page structure. owner: zbeyens; tracked: this plan; stop: the next change to Plite's mousedown handling.
- Plate's paragraph shortcut `mod+shift+0` never matches on a US layout, where the key reads `)`. owner: zbeyens; tracked: this plan; stop: the next audit of Plate's shortcuts.
- Android Chrome itself has not run the tap fix. owner: zbeyens; tracked: the Defaults word "chrome device proof"; stop: before Plite v2 ships.

## Close

Reversals and deviations come first.

- The repair dropped the PR's cross-window unit test and its AltGr hotkey case. The first passed `internalTarget: true` for fields that production never marks internal. The second caught nothing the `mod+alt+8` case misses.
- Text boxes in an editor shown inside a frame keep editor undo, as they did before the PR, under the Defaults word "frame field undo".

Next gets the PR's three fixes and this repair once the PR merges. The repair limits text-field undo to the editor's own controls on both the keydown and the input-event paths. It also moves the Cmd+Option digit fallback into the match that checks modifiers.

The panel's three seats raised no critical finding, six warnings and six nits, and several name the same issue. The repair fixes the two issues that two or more seats raised, the digit fallback and the cross-window mismatch. A four-press browser probe dismissed the repeated-undo warning. The rest went to Open work or to the limits in Verification. The code-quality review raised seven findings. The repair fixed three, and Open work lists the other four in three items.

The run had one user ask, "babysit https://github.com/udecode/plate/pull/5318", and it is done. The proof and its limits are in Verification.
