# Sweep round 2: checks for natamox

I applied the playbook's Cards-due rules by hand to `round-1.md` and `test-index.md`, because `tooling/scripts/sweep-due.mjs` doesn't exist yet. `docs/sweep/` doesn't exist in the snapshot either, so the round 1 record is the only card source.

On Safari: the playbook says Safari and iPhone "map to no gate today". I read that as meaning a browser card that lists Safari or iPhone can't meet rule 2. The index also says Playwright WebKit is not Safari. The other reading would drop TABLE-002 and MENTION-001, even though both of their round 1 finds were Safari-only or iPhone-only and no gated test runs on those targets.

## Round 2 checks

Run every card on Chrome/Mac, Safari/Mac, Firefox/Mac and Safari/iPhone. Order: page health first, then the due cards.

| Order | Check | Page | Layer | Min | Why it is due |
|---|---|---|---|---|---|
| 0 | Page health | all six scoped pages | — | — | Run `sweep-health.mjs` once in Chromium, Firefox and WebKit, and open each P1 page once on the iPhone. This check never leaves the round. |
| 1 | SWEEP-BASIC-002 | plite/basic | unit | 2 | Its `covered-by` test (`deleteFragment.test.ts`, `a17c09e2`) "does not merge paragraphs or perform deletion at a collapsed caret". This card is a collapsed backward delete that merges two paragraphs, so that test doesn't check the whole card. |
| 2 | SWEEP-BASIC-003 | plite/basic | unit | 2 | The hash doesn't match: the card has `b2038ad1` and `undo.test.ts` is now `b2038ad9`. No one has read the new body against the card, and no proof-worktree run has failed at the parent of plate#5202. |
| 3 | SWEEP-BASIC-004 | plite/basic | unit | 1 | `covered-by: none`. |
| 4 | SWEEP-MARKDOWN-001 | plite/markdown | unit | 1 | The covering test `headingShortcut.test.ts` was deleted after round 1. The fix for plate#5203 now has no test. |
| 5 | SWEEP-MARKDOWN-002 | plite/markdown | unit | 2 | `link.manual.test.ts` runs only in the `manual` gate. |
| 6 | SWEEP-TABLE-001 | docs/table | browser | 2 | `table-navigation.spec.ts` is gated in Chromium only. Firefox has no gated run, and Safari/Mac (where the plate#5206 find was) and iPhone have no gate. |
| 7 | SWEEP-TABLE-002 | docs/table | browser | 3 | Gated in Chromium and Firefox, but the plate#5207 find was on Safari/iPhone, which has no gate. |
| 8 | SWEEP-TABLE-003 | docs/table | unit | 3 | The hash doesn't match: the card has `18be4c05` and `removeRow.test.ts` is now `18be4c99`. No one has read the new body. |
| 9 | SWEEP-TABLE-004 | docs/table | unit | 2 | `removeTable.test.ts` is skipped. |
| 10 | SWEEP-DND-001 | docs/dnd | human | 3 | Human cards never leave. The plate#5210 finds on Safari/Mac and iPhone have no `fixed-by`. `moveBlocks.test.ts` checks block order only, not the drag image. |
| 11 | SWEEP-DND-002 | docs/dnd | human | 3 | Human cards never leave. The plate#5211 finds have no fix. |
| 12 | SWEEP-DND-003 | docs/dnd | browser | 3 | Blocked in all four browsers in round 1, and `covered-by: none`. Fix the nested-list sample first (see below). |
| 13 | SWEEP-MENTION-001 | docs/mention | browser | 2 | `mention-selection.spec.ts` gates Chromium, Firefox and WebKit. WebKit is not Safari, and the plate#5212 finds were on Safari/Mac and iPhone. |
| 14 | SWEEP-MENTION-002 | docs/mention | unit | 1 | `covered-by: none`. `insertMention.test.ts` doesn't delete a mention, and no card names it. |

Budget: 30 card-minutes per browser, so 120 minutes across the four targets, plus page health. New emoji cards come after that, up to five (P2 cap).

## Round 1 checks left out

| Check | Reason |
|---|---|
| SWEEP-BASIC-001 | `packages/plite/src/transforms/deleteFragment.test.ts` "[plate#5201] replacing a selected bold run clears its stored mark" exists, isn't skipped and runs in plite CI. The card is unit layer, the body hash `a17c09e2` matches, and the index says it covers the whole sequence (document, marks and caret). |
| SWEEP-MARKDOWN-003 | `packages/plite/src/markdown/inlineCode.test.ts` "[plate#5205] inline code preserves literal asterisks and surrounding plain text" exists, isn't skipped and runs in plite CI. The card is unit layer, the body hash `e509bc73` matches, and the test covers the whole result. |

## Pages that need attention before round 2

| Page | What's needed |
|---|---|
| https://beta.platejs.org/docs/table | The reference is unsettled: `platejs.org/docs/table` or `platejs.org/examples/table`. Pick one before the round, or the round stays open. All four TABLE cards cite `docs/table` as their reference. If the pick changes any card's `expect`, that card needs a new id, and the old card names its replacement. |
| https://beta.platejs.org/docs/dnd | The nested-list drag sample returned a loading error, which blocked DND-003 in every browser. Make it load before the round, or DND-003 blocks again. |
| https://beta.platejs.org/docs/emoji | New since round 1, with a settled reference and no cards. Run `prep` on it to get up to five cards (P2 cap), each with one box per browser. |
| https://beta.platejs.org/examples/plite/basic and https://beta.platejs.org/examples/plite/markdown | Neither `basic` nor `markdown` is a path in `plite-example-registry.ts`; the nearest are `richtext`, `markdown-shortcuts` and `markdown-preview`. Their reference is `platejs.org/examples/plite/…`, while P1's reference is `slatejs.org/examples/<path>`. Confirm the URLs and their P1/P3 classification before the round. Page health will show whether the URLs still load. |
exit=0
