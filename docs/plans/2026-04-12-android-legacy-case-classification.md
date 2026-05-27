---
date: 2026-04-12
topic: slate-v2-android-legacy-case-classification
---

# Android Legacy Case Classification

> Historical batch note. The live classification read is now folded into
> [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md).

## Purpose

Classify the old legacy `android-tests` manual cases against the current
`slate-v2` proof stack so the remaining Android work is finite.

Legacy source:

- [android-tests.tsx](/Users/zbeyens/git/slate/site/examples/ts/android-tests.tsx)

Current proof owners:

- [2026-04-11-slate-v2-ime-mobile-browser-file-ledger.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-ime-mobile-browser-file-ledger.md)
- [android-tests.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/android-tests.tsx)
- packaged Android proof commands in [package.json](/Users/zbeyens/git/slate-v2/package.json)

## Matrix

| Legacy case | Legacy intent | Current read | Classification | Current proof / gap |
| --- | --- | --- | --- | --- |
| `split-join` | enter/backspace around formatting boundaries | direct Android proof row is now green, and the matching desktop Chromium row is also green after routing plain structural `Enter` / `Backspace` through editor-owned keydown ops | `directly-proved` | [android-split-join.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/android-split-join.tsx), [android-split-join.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/android-split-join.test.ts), `pnpm proof:appium:android:split-join:local`, [2026-04-12-structured-enter-and-backspace-need-editor-owned-keydown-paths.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-12-structured-enter-and-backspace-need-editor-owned-keydown-paths.md) |
| `insert` | tap typing, glide typing, voice input, any IME words | ordinary insertion intent is covered by the green placeholder / no-FEFF / inline-edge / void-edge rows, but real keyboard-feature behavior is still outside the local transport | `partially-covered / tooling-blocked remainder` | direct green rows: placeholder, no-FEFF placeholder, inline-edge, void-edge; glide and voice still need external or alternate-transport evidence |
| `special` | cursor-in-word enter, repeated space/backspace, punctuation/caps edge | the structural subcases are green on both Chromium and direct Android: mid-word Enter splits `it is` into `i` / `t is`, repeated space/backspace in `mid|dle` restores the original text, and direct typed punctuation/caps text preserves `It me. No.` as expected. Only true keyboard-feature behavior like autocaps/autocorrect remains outside this row | `directly-proved` | [android-special-structural.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/android-special-structural.tsx), [android-special-structural.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/android-special-structural.test.ts), direct Android Appium evidence from the same surface |
| `empty` | type into empty doc, add/remove lines, backspace over everything | direct Chromium and Android rows are green once the proof waits briefly after each structural `Enter` for selection sync before follow-up typing | `directly-proved` | [android-empty-rebuild.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/android-empty-rebuild.tsx), [android-empty-rebuild.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/android-empty-rebuild.test.ts), `pnpm proof:appium:android:empty-rebuild:local`, [2026-04-12-structural-break-proof-rows-need-selection-sync-before-follow-up-typing.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-12-structural-break-proof-rows-need-selection-sync-before-follow-up-typing.md) |
| `remove` | selection deletion across anchor/focus and full backspace cleanup | direct proof row is now green on both Chromium and Android Appium once the row uses model-owned selection prep, moves the cursor to the end after the initial range delete, and gives the Android delete lane enough time between key presses to settle | `directly-proved` | [android-remove-range.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/android-remove-range.tsx), [android-remove-range.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/android-remove-range.test.ts), `pnpm proof:appium:android:remove-range:local`, [2026-04-12-remove-range-row-points-at-expanded-multiblock-delete-not-another-android-quirk.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-12-remove-range-row-points-at-expanded-multiblock-delete-not-another-android-quirk.md), [2026-04-12-android-expanded-delete-still-has-a-noncancelable-dom-delete-shape.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-12-android-expanded-delete-still-has-a-noncancelable-dom-delete-shape.md) |
| `autocorrect` | Android keyboard autocorrect and cursor placement after correction | the current Appium + Chrome emulator stack can show keyboard state and switch to `NATIVE_APP`, but it exposes zero Gboard candidate nodes and hardware keycodes only yield literal `cant ` insertion | `tooling-blocked` | direct probe evidence: `keyboardShown: true`, `contexts: [\"NATIVE_APP\", \"CHROMIUM\"]`, `gboardElementCount: 0`, `suggestionElementCount: 0`, keycodes produce literal `cant ` with plain `beforeinput:insertText` events; see [2026-04-12-appium-android-chrome-can-show-keyboard-state-without-exposing-gboard-candidates.md](/Users/zbeyens/git/plate-2/docs/solutions/integration-issues/2026-04-12-appium-android-chrome-can-show-keyboard-state-without-exposing-gboard-candidates.md) |

## Current Hard Read

What is already real:

- Android placeholder and no-FEFF placeholder typing
- Android inline-edge typing
- Android void-edge typing
- Android route/setup proof through Appium

What still needs named work:

1. external or alternate-transport evidence for Android autocorrect
2. external or alternate-transport evidence for glide typing
3. external or alternate-transport evidence for voice input

## Next Batch Order

1. external Android keyboard-feature evidence path
   reason:
   local Appium + Chrome proof can show keyboard state but cannot see or accept
   Gboard candidates
2. broader iOS evidence path
   reason:
   the other remaining mobile row is also tooling-blocked
3. verdict and file-family reclose
   reason:
   local structural/browser rows are already exhausted
