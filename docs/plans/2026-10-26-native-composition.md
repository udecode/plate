# Keep composed text where the input method put it

Status: partial: the Android pair, the engine specs and the real Safari repros wait
Topic: native
Playbook: bug-fix

The native domain run for t_1d843b2a: plate#5242 (P0), plate#5240, plate#5244 and plate#5245, plus the question of how a command reaches a stored point inside struck text. dylans holds plate#5224 with udecode/plate#5239, so this run leaves it alone.

## Brief

### What will change?

In Safari, confirming a pinyin word with Return no longer splits the line before the word. The caret stays after the word, and one undo removes it. That fixes the split in the issue's first Safari case.

### What could go wrong?

We only replayed Safari's key order in WebKit, never real Safari, so the first case's page crash stays open. A Korean Return that Safari passes on still breaks the line before the syllable there, as before.

## Teach

With a pinyin keyboard, the input method holds your letters in a draft until you confirm a word. Plite leaves keys alone while it knows a draft is open, so the input method can use them.

Safari closes the draft first and only then sends the key that confirmed it, such as Return. By then Plite thinks typing is plain again. It runs that Return as a real one and splits the line before the confirmed word lands, and one undo then leaves the word behind.

Browsers mark a key the input method took with the key code 229. Plite now treats such a key as part of the composition. It runs none of its key commands for it and leaves the caret where the input method put it. The app's own key handler still sees it, so Plate's table can still collapse a cell selection first. A second Return is a plain key, so it still splits the line.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Keys the input method took | Plite skips them, and the app's key handler still sees them, as before | Hide them from the app's handler too, which stops Plate's table from collapsing a cell selection before a composition | hide IME keys | small |
| Which keys count | Keys Safari sends under their own name with code 229 | Also the Unidentified and Process keys Android and Windows send, which changes Android's key path with no device run | all IME keys | detail |
| Order of work | Land the Safari Return fix now, then the struck-text question | Hold it until the whole native run lands | one landing | detail |
| A browser test that passed before the fix | Drop it, since it catches nothing | Keep it as extra coverage | keep 5244 test | detail |
| The native page | A new page, since the old one no longer opens | Go back to the old page link | old native page | detail |

## Main changes

- The keydown kernel classifies a key named other than Unidentified or Process with keyCode 229 as composition, as it does a key pressed while composing, so it flushes no pending text, imports no selection and maps the key to no command (`packages/plitejs/src/react/editable/input-controller.ts`).
- The keydown strategy still runs the Editable's `onKeyDown` for such a key, then returns without `preventDefault()` before Plite's own key commands (`packages/plitejs/src/react/editable/keyboard-input-strategy.ts`).

## Native behavior and proof

| Delta | Behavior | What changes | Proof surface |
| --- | --- | --- | --- |
| added | The key that confirms a Safari composition | Stays with the input method: no line split, the confirmed text stays in its line with the caret after it, and one undo removes it (the split in plate#5242 repro 1) | the richtext browser test and a probe that replays Safari's order, in WebKit and Chromium; real Safari unproven |

## Steps

- [x] 1. Keep the key that confirms a Safari composition with the input method. Proof: the richtext browser test "keeps a composed word in its line when Safari sends the confirming Return after compositionend" fails at base and with either half of the fix removed, and passes with the fix in WebKit and Chromium, five warm runs each; the Safari-order probe keeps the word in its line, the caret after it and one undo empties the line, and a passed-on Korean Return ends with the same blocks as at base in both engines.
- [x] 2. Decide how composed text reaches a stored point inside struck text, then send the desktop commit through the insert-text command and drop the bridge from the authority audit. Proof: `apps/www/tests/browser/authored-review.spec.ts` "IME composition inside struck text splits the deletion" in Chromium, Firefox and WebKit. Built in 2026-10-26-native-ime-composition-commit.md, where the case passes five warm runs per engine at 4e4605a28f.
- [ ] 3. Reproduce plate#5244's composition over a selection and plate#5245's lost mark on the Android emulator, then fix them at their owner. Proof: the device lane in `apps/plite/playwright.device.config.ts`.
- [ ] 4. Add the engine composition spec each kind's M4 miss calls for.

## Close

What landed. In Safari, the key that confirms a composition, such as Return, stays with the input method, so the line no longer splits before a confirmed pinyin word (21799cc1c7). Step 2 landed through 2026-10-26-native-ime-composition-commit.md, which has its own Close.

Proof and its limits, each from its decision-log row:

- The richtext browser test "keeps a composed word in its line when Safari sends the confirming Return after compositionend" fails at base and with either half of the fix removed, and passes with the fix in WebKit and Chromium, five warm runs each.
- The Safari-order probe replays Safari's events in WebKit. No real Safari ran, so plate#5242's page crash and its repros 2 to 4 stay open.
- The struck-text case passes five warm runs per engine at 4e4605a28f, where Firefox and WebKit draw the preedit with the test helper, not a real input method.

Counts. 4 steps, 2 done. Steps 3 and 4 wait for the Android emulator lane and the engine specs.

## Open work

- plate#5242's page crash in repro 1, and repros 2 to 4, where the word joins the line above or vanishes after a Space or click confirm. Replaying Safari's order in WebKit shows no crash and keeps the word, so the cause needs real Safari. owner: natamox, who reproduced them by hand. stop: a real Safari run with this fix.
- A Korean Return that Safari passes on after `compositionend` breaks the line before the syllable when WebKit replays Safari's order, both with this fix and before it. Chromium breaks the line after the syllable, but one undo then removes the syllable and keeps the break, also as before. The cause is not traced yet. owner: zbeyens. stop: a real Safari Korean Return that breaks the line before the syllable.
- A key the input method took inside a nested editable or an internal control still reaches Plite's projected command path, which checks no composition, as on base (`packages/plitejs/src/react/editable/keyboard-input-strategy.ts:495`). owner: zbeyens. stop: a nested-editable composition case that splits or deletes.
- plate#5240, pinyin on iOS inside an editable void. No iOS lane runs on this host. owner: Verify. stop: an iOS device or simulator run.
