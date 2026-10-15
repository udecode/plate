# Round 2: hands-on pass for natamox

## Checks to run in round 2

Run each check in all four targets it names: Chrome on Mac, Safari on Mac, Firefox on Mac and Safari on iPhone. Each check starts from its own restored starting state.

| Check | Page | Min | Why it stays |
|---|---|---|---|
| SWEEP-BASIC-002 | plite/basic | 2 | The test listed for it, `deleteFragment.test.ts`, does not merge paragraphs or delete at a collapsed caret, and this check does both. |
| SWEEP-BASIC-003 | plite/basic | 2 | The body of `undo.test.ts` changed after it was last read against this check. The record has `b2038ad1` and the test is now `b2038ad9`. Nobody has read the new body against the check. |
| SWEEP-BASIC-004 | plite/basic | 1 | No test covers it. |
| SWEEP-MARKDOWN-001 | plite/markdown | 1 | `headingShortcut.test.ts` was deleted after round 1, so no test guards the plate#5203 fix. |
| SWEEP-MARKDOWN-002 | plite/markdown | 2 | `link.manual.test.ts` runs only in the manual suite. It is not in plite CI or `pnpm check`. |
| SWEEP-TABLE-001 | docs/table | 2 | This check depends on the browser, and its test runs in Chromium only. Safari on Mac, where the round 1 find was, has no test. Neither do Firefox and iPhone. Wait until the table reference is settled (see below). |
| SWEEP-TABLE-002 | docs/table | 3 | This check depends on the browser, and its test runs in Chromium and Firefox only. Safari on iPhone, where the find was, has no test. Neither does Safari on Mac. Wait until the table reference is settled. |
| SWEEP-TABLE-003 | docs/table | 3 | The body of `removeRow.test.ts` changed after it was last read against this check. The record has `18be4c05` and the test is now `18be4c99`. Nobody has read the new body against the check. Wait until the table reference is settled. |
| SWEEP-TABLE-004 | docs/table | 2 | `removeTable.test.ts` is skipped, so CI does not run it. Wait until the table reference is settled. |
| SWEEP-DND-001 | docs/dnd | 3 | Only a person can check it, because it needs a look at the native drag image. `moveBlocks.test.ts` checks block order only, and no check names it. |
| SWEEP-DND-002 | docs/dnd | 3 | Only a person can check it, because it needs a look at the native drag image. plate#5211 has no fix recorded. |
| SWEEP-DND-003 | docs/dnd | 3 | It was blocked in all four browsers in round 1, and no test covers it. It can run only after the nested-list sample loads (see below). |
| SWEEP-MENTION-001 | docs/mention | 2 | This check depends on the browser, and its test runs in Playwright Chromium, Firefox and WebKit. Playwright WebKit is not Safari, so neither Safari target has a test, and both round 1 finds were in Safari. |
| SWEEP-MENTION-002 | docs/mention | 1 | No test covers it. `insertMention.test.ts` checks inserting a mention, not deleting one. |

That comes to 30 minutes per target, or about 120 minutes across the four. The emoji checks will add to that once they are written.

## Round 1 checks left out

| Check | Reason |
|---|---|
| SWEEP-BASIC-001 | `packages/plite/src/transforms/deleteFragment.test.ts` (`[plate#5201] replacing a selected bold run clears its stored mark`) covers the whole check: the document, the marks and the caret. It is a unit test in plite CI, which runs on every pull request, and it is not skipped. Its body is still `a17c09e2`, the hash that was read against the check. The bug showed in all four browsers, so a unit test can catch it. |
| SWEEP-MARKDOWN-003 | `packages/plite/src/markdown/inlineCode.test.ts` (`[plate#5205] inline code preserves literal asterisks and surrounding plain text`) covers the whole result: the literal content, the spaces, the marks and the block count. It is a unit test in plite CI and it is not skipped. Its body is still `e509bc73`, the hash that was read against the check. The bug showed in all four browsers. |

## Pages to fix before round 2

- **https://beta.platejs.org/docs/table**: the reference page is not settled. The team has to choose between https://platejs.org/docs/table and https://platejs.org/examples/table. SWEEP-TABLE-001 to 004 wait for that choice. If the team picks the standalone example, update the Reference line in those four checks.
- **https://beta.platejs.org/docs/emoji**: this page is new since round 1. Its reference, https://platejs.org/docs/emoji, is settled, but no hand checks exist for it. Write its checks, with new SWEEP-EMOJI-### ids, before round 2.
- **https://beta.platejs.org/docs/dnd**: the reference is settled, but the nested-list drag sample returned a loading error in round 1. Confirm it loads before round 2. If it still fails, SWEEP-DND-003 stays blocked.

These calls come from `test-index.md` only. None of the test paths in the index exist in this snapshot, so I could not read the test bodies.
exit=0
