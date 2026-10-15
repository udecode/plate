# Test index

This is the present inventory. Body hashes identify test bodies, excluding titles.

For existing tests, the gate column names the actual execution route. For the deleted test, it records the former route; that route no longer runs the test. `none` in the engines column denotes a unit test.

The browser gates use Playwright engines. They do not run installed Safari or Safari on an iPhone. Playwright WebKit is not Safari.

| Path | Title | Tags in title | Layer | Gate | Gate engines | Skipped | Status | Body hash now | Body scope and review status |
|---|---|---|---|---|---|---|---|---|---|---|
| `packages/plite/src/transforms/deleteFragment.test.ts` | `[plate#5201] replacing a selected bold run clears its stored mark` | `[plate#5201]` | unit | plite CI | none | no | present | `a17c09e2` | Covers the whole BASIC-001 sequence, document, marks and caret. Does not merge paragraphs or perform deletion at a collapsed caret. |
| `packages/plite/src/history/undo.test.ts` | `[plate#5202] undoing bold insertion restores text selection and stored marks` | `[plate#5202]` | unit | plite CI | none | no | present | `b2038ad9` | Body changed after the last comparison with BASIC-003. Nobody has read the new body against that check. |
| `packages/plite/src/markdown/headingShortcut.test.ts` | `[plate#5203] two hashes and a space produce one level-two heading` | `[plate#5203]` | unit | plite CI | none | no | deleted | absent; last body was `c38d104a` | The test was deleted after round 1. |
| `packages/plite/src/markdown/link.manual.test.ts` | `[plate#5204] escaped URL parentheses decode into one link` | `[plate#5204]` | unit | manual | none | no | present | `d4a7610b` | Covers the whole MARKDOWN-002 document transformation. Runs only when a person invokes the manual suite. |
| `packages/plite/src/markdown/inlineCode.test.ts` | `[plate#5205] inline code preserves literal asterisks and surrounding plain text` | `[plate#5205]` | unit | plite CI | none | no | present | `e509bc73` | Covers the whole MARKDOWN-003 result, including literal content, spaces, marks and block count. Body remains as last reviewed. |
| `apps/www/e2e/table-navigation.spec.ts` | `[plate#5206] Arrow Down exits the final table cell into the following paragraph` | `[plate#5206]` | browser | pnpm check | chromium | no | present | `f6810d2c` | Exercises the TABLE-001 sequence and assertions in Chromium only. |
| `apps/www/e2e/table-resize.spec.ts` | `[plate#5207] dragging an internal divider preserves total width and ends on release` | `[plate#5207]` | browser | pnpm check | chromium, firefox | no | present | `07ad93e4` | Exercises the TABLE-002 drag and dimensions on desktop engines. No Safari or iPhone execution. |
| `packages/table/src/transforms/removeRow.test.ts` | `[plate#5208] removing a row beneath a spanning cell preserves content and relocates selection` | `[plate#5208]` | unit | pnpm check | none | no | present | `18be4c99` | Body changed after the last comparison with TABLE-003. Nobody has read the new body against that check. |
| `packages/table/src/transforms/removeTable.test.ts` | `[plate#5209] deleting the only table creates a paragraph ready for insertion` | `[plate#5209]` | unit | pnpm check | none | yes | present | `29cf5d16` | Covers the whole TABLE-004 transform sequence, but the test is skipped. |
| `apps/www/e2e/mention-selection.spec.ts` | `[plate#5212] activating a mention suggestion preserves focus for following text` | `[plate#5212]` | browser | pnpm check | chromium, firefox, webkit | no | present | `3ad06e27` | Exercises the MENTION-001 sequence in the three listed engines. No Safari or iPhone execution. |
| `packages/dnd/src/transforms/moveBlocks.test.ts` | `[plate#5210] moving one paragraph preserves its text and final order` | `[plate#5210]` | unit | pnpm check | none | no | present | `4be17f38` | Checks document order after a transform. Does not inspect a native drag image. No check names this test. |
| `packages/mention/src/transforms/insertMention.test.ts` | `[plate#5188] inserting a mention after plain text preserves the prefix` | `[plate#5188]` | unit | pnpm check | none | no | present | `5cf28049` | Checks insertion only. Does not delete a mention or type replacement text. No check names this test. |

Both `pnpm check` and `plite CI` are required on every pull request. Manual tests are outside those gates.
