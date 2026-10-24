# Keep framed recordings equal to what the editor showed beside pending joins

Status: building: the land, then the close once the joined-line-end plan lands
Topic: authored
Playbook: bug-fix

## Brief

### What will change?

For your ledger-law task, deletes next to a pending join no longer save marks that give a different document once accepted. The ledger law now passes at seeds 5 and 1936384615, and a pinned test holds seed 1144417495's history.

### What could go wrong?

A Suggesting delete from a title across a split line now records, where next did nothing. Typing at the end of a joined line still fails as on next, until the joined-line-end plan lands.

## Teach

A review document keeps every pending suggestion as marks on one stored tree. You edit a preview where everything is accepted, and a recorder turns each edit back into marks. A test law checks that accepting everything gives what the preview showed.

Two deletes next to a pending join broke that law. Deleting from a title down into a quote, past a line split off the title, kept the deleted line as the line the page must have, so the joined text landed in it. Deleting into a line that holds another author's pending move settled the join before anyone decided that move.

Now the recorder no longer keeps a deleted line that a join would land in, and the second join waits until the move is decided. Typing at the end of a line a join pulls up needs a new map from the preview to the stored tree, so it has its own plan.

## Main changes

- Completion keeps a struck element as the line its root or container needs only when no pending join past it would land in it (`packages/plitejs/src/authored/tree/record-completion.ts`).
- An accepted join whose target the decision removes reads the pending content that target holds, so an Editing join into a line holding another author's pending move stays pending until that move is decided (`packages/plitejs/src/authored/tree/resolve.ts`).

## Steps

- [x] Reproduce each finding on next and find its cause. Proof: the base logs of seed 5, seed 1936384615 and the PR 5218 probe, and the seed 1144417495 test red at HEAD.
- [x] Fix the causes in completion and in the join's landing, with one law example or test each that fails with only its own fix reverted. Proof: the control logs. The fix in the stored-to-accepted map for finding 4 was reverted after two panel rounds and moved to `docs/plans/2026-10-24-authored-joined-line-end.md`.
- [x] Run the recording laws at their seeds, the plitejs suite, typecheck, lint and the decision-order check at three bounds against next. Proof: the final logs on the reverted bytes.
- [x] Writing passes, a push panel on the diff, and one land.mjs run. Proof: the panel's critical findings settled as the Panel review rule says, and land.mjs pushes next.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| How to fix the failures | Fix each where it starts, in completion and the join's landing (look) | Redesign how recording fills lines beside pending changes | redesign | small |
| Speed check | No benchmark lane, since each fix adds work only where an edit meets a pending join and the law timings match next (safe) | Run the authored benchmark lane | benchmark | detail |
| A Suggesting delete from a title across a split line | It records now, where next left the document unchanged (look) | Keep it doing nothing, as before | ignore title deletes | small |
| Typing at the end of a joined line | Land the other fixes now and fix this one in its own plan, because two ways of matching lines by shape broke other edits (look) | Hold this land until that plan is built too | hold the land | small |
| Enter beside the empty line the page adds after a pending join | Leave it to its own task, since next fails it the same way and fixing it overturns an existing test (answer) | Fix it in this change, which means picking which empty line Enter keeps and rewriting the test that drops a filled line | fix filler here | small |

## Open work

- Enter beside an empty line a root adds after a pending join, in the first line, the joined line or a line after it, writes nothing and drops the caret, or loses that line once everything is accepted, as on next. Finding 4's own documents show it with no decision made. owner: zbeyens; stop: t_9cb6f7a6 lands or is dropped; tracked: the suggested-task ledger.
