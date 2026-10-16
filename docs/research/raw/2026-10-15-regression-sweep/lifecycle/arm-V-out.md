# Round 2 for natamox

**How checks were kept or dropped:** a check, or one of its browsers, comes out of round 2 only when four things all hold:

- A test that exists and isn't skipped covers the whole check.
- That test runs in a required gate (`pnpm check` or `plite CI`).
- The test's body hash still matches the hash last read against the check.
- The gate runs the engine for that browser.

Playwright Chromium counts for Chrome/Mac, and Playwright Firefox counts for Firefox/Mac. Playwright WebKit doesn't count for Safari/Mac or Safari/iPhone. A round 1 pass with no test covering it stays in round 2.

## Checks to run in round 2

| Check | Browsers | Why it stays |
|---|---|---|
| SWEEP-BASIC-002 | Chrome/Mac, Safari/Mac, Firefox/Mac, Safari/iPhone | Its `covered-by` points at the BASIC-001 test. That test doesn't merge paragraphs or delete at a collapsed caret. Confirms the plate#5201 fix. |
| SWEEP-BASIC-003 | all four | The undo test's body changed (`b2038ad1` → `b2038ad9`), and nobody has read the new body against this check. Confirms plate#5202. |
| SWEEP-BASIC-004 | all four | Passed in round 1, but no test covers it. |
| SWEEP-MARKDOWN-001 | all four | Its test was deleted after round 1. Confirms plate#5203. |
| SWEEP-MARKDOWN-002 | all four | Its test runs only in the manual suite, outside every required gate. Confirms plate#5204. |
| SWEEP-TABLE-001 | Safari/Mac, Firefox/Mac, Safari/iPhone | The gate runs Chromium only. Safari/Mac confirms plate#5206. |
| SWEEP-TABLE-002 | Safari/Mac, Safari/iPhone | The gate runs Chromium and Firefox only. Safari/iPhone confirms plate#5207. |
| SWEEP-TABLE-003 | all four | The row-removal test's body changed (`18be4c05` → `18be4c99`), and nobody has read it against this check. Confirms plate#5208. |
| SWEEP-TABLE-004 | all four | Its test is skipped. Confirms plate#5209. |
| SWEEP-DND-001 | all four | A person has to inspect the native drag image, so no test can cover it. `moveBlocks.test.ts` checks only the final order. plate#5210 has no recorded fix, so Safari/Mac and Safari/iPhone recheck a bug that is still open. |
| SWEEP-DND-002 | all four | Same reason as DND-001. plate#5211 has no recorded fix. |
| SWEEP-DND-003 | all four | Blocked in round 1, so it has never run. Run it only after the nested-list sample loads (see the pages below). |
| SWEEP-MENTION-001 | Safari/Mac, Safari/iPhone | The gate's WebKit run isn't Safari. Confirms plate#5212. |
| SWEEP-MENTION-002 | all four | Passed in round 1, but no test covers it. `insertMention.test.ts` only inserts a mention; it doesn't delete one. |

Estimated hand time: 108 minutes (each check's minutes times the browsers kept). The TABLE checks wait until the table reference is chosen, and DND-003 waits for the nested-list fix.

## Round 1 checks left out

| Check | Browsers left out | Reason |
|---|---|---|
| SWEEP-BASIC-001 | all four | `deleteFragment.test.ts` runs in `plite CI`, isn't skipped, still hashes `a17c09e2`, and covers the whole sequence: document, marks and caret. The bug was in the deletion code, not the browser, so this unit test stands in for every browser. |
| SWEEP-MARKDOWN-003 | all four | `inlineCode.test.ts` runs in `plite CI`, isn't skipped, still hashes `e509bc73`, and covers the whole result. |
| SWEEP-TABLE-001 | Chrome/Mac | `table-navigation.spec.ts` runs in `pnpm check` on Chromium, covers the sequence and still hashes `f6810d2c`. |
| SWEEP-TABLE-002 | Chrome/Mac, Firefox/Mac | `table-resize.spec.ts` runs in `pnpm check` on Chromium and Firefox, covers the drag and the column widths, and still hashes `07ad93e4`. |
| SWEEP-MENTION-001 | Chrome/Mac, Firefox/Mac | `mention-selection.spec.ts` runs in `pnpm check` on Chromium and Firefox, covers the sequence and still hashes `3ad06e27`. |

## Pages that need attention before round 2

| Page | What it needs |
|---|---|
| https://beta.platejs.org/docs/table | Choose the reference: https://platejs.org/docs/table or https://platejs.org/examples/table. TABLE-001 to TABLE-004 can't be compared until that's decided. |
| https://beta.platejs.org/docs/dnd | Fix the nested-list drag sample's loading error, then confirm it opens with `Packing` (children `Tent` and `Stove`) followed by `Travel`. Until then DND-003 stays blocked. |
| https://beta.platejs.org/docs/emoji | Added after round 1 and has no hand checks yet. Write its checks under new `SWEEP-EMOJI-*` ids before round 2. |
exit=0
