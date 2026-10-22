---
review_scopes: [suggestions, authored]
review_basis: [2026-10-12-suggestions-complete]
work_kind: implementation
review_commit: 51f3a53b665263bd0b0ae81b99978f542eede86f
review_inputs: [packages/plitejs/test/authored-plugin.test.ts, packages/plitejs/src/authored/changes.ts, packages/plitejs/src/authored/ledger/cards.ts, packages/plitejs/src/authored/ledger/book.ts, packages/plitejs/src/authored/tree/record.ts, packages/plitejs/src/authored/tree/resolve.ts]
---

# One card for lines suggested one at a time

Status: executed
Playbook: verdict

**Pursue, and build it here. The card fold is wrong, not the recorder. A change ends at its outermost insertion or deletion around its last occurrence, and both the kernel's fold and the review ledger's card sequence compare that end with the next change, which also joins when it starts inside that end.** The recorder already marks every text inside an inserted line with the line's change, and it has to, because the resolver keeps text that carries no insertion of its own when the line is rejected (`docs/plans/artifacts/2026-10-17-card-own-split/probe-semantics-a1.log`). In that stored shape, three adjacent lines that one author added, or struck, as three changes show as three cards before anyone types (`probe-canonical-a1.log`, `head-probe-gestures-a1.log`). `groupAuthoredChanges` in `packages/plitejs/src/authored/changes.ts` compares a change's last occurrence in document order, which for a whole line is its text, and text never touches the next block. The finding's fixture marked only the paragraph element, a shape the recorder never writes, so its split seemed to need typing. This continues the `suggestions` scope's open Pursue, `2026-10-12-suggestions-complete`; suggested task t_9ced9eec asked the question.

## Brief

### What will change?

Neighboring lines you add or strike one at a time now share one card, and so does an edit inside a line you then strike. It's on next, uncommitted, proven by tests and a Chromium drive.

### What could go wrong?

Another person's typing inside your line still splits your card. Two cases still keep two cards. One is a line plus typing that opens the next line. The other is an edit inside a struck line, then the next struck.

## Teach

Suggesting mode stores every edit as a pending change, and the review sidebar gathers one person's changes that sit next to each other into one card. A card takes its name from its oldest change, and Plate colors it from that name.

When you add or strike a whole line, the mark goes on the line and on every piece of its text. Grouping checked only the change's last mark, which is text, and text never counts as touching the next line. So three lines added one at a time showed as three cards.

Now a change whose last mark lies in a line it added or struck ends with that line, so a change on the next line touches it. A later change of yours inside that line joins its card too. The fix belongs in grouping, not in how typing is recorded, because typed text must carry the line's mark, or rejecting the line would leave it behind.

## Main changes

- `blockOccurrencesOf` in `packages/plitejs/src/authored/changes.ts` also returns where each change ends in the block. That is its last occurrence, or the outermost insertion or deletion of that change at or around it, because an element ends after its content. The ledger's `startsAfter` in `packages/plitejs/src/authored/ledger/cards.ts` reads that end through `BlockChanges.ends` in `ledger/book.ts`, from the slot that holds the change last.
- `continues` in `changes.ts` joins a change to the next one of the same author when they touch, or when the next one starts inside the first one's inserted or deleted block. The kernel's `groupAuthoredChanges` and the ledger's `startsAfter` both fold with it. Both still compare only the change before, so a sync still rechecks only entries near a changed block.
- `groupAuthoredChanges` derives each change's end from the change's own occurrence list, not from the block walk, so the slow ledger law still checks the ledger against an independent fold.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Another person's typing inside your suggested line | Your card still splits around it, as before, and a follow-up task covers it (look) | Fix it in this run | foreign | small |
| A suggested line and typing that opens the next line | Two cards, as before (look) | One card | follow-on | small |
| An edit inside a struck line, then striking the next line | Two cards, as before, and the follow-up task covers it (look) | One card | reach | small |
| Where the verdict is recorded | In this plan, under the suggestions review that is still open | A new review question for card grouping | scope | detail |
| Review of the change | Two independent code reviewers | A full panel | panel | detail |
| Who writes the code | I wrote it, since the fix is shorter than its brief | Hand it to Codex | codex | detail |
| The suggestions page | A new page at https://claude.ai/artifact/Aq92ZtchKMEwkei3qT937r, because https://claude.ai/artifact/NKfmSN3HXP15YCC757xRc5 no longer opens (look) | No published page for the subject | nopage | detail |

## Evidence

Model: claude-opus-5-5 at xhigh, in the worktree `focused-gauss-3a9d96` at `51f3a53b66`.

This plan retains `2026-10-12-suggestions-complete`: it builds one card-grouping gap under that open Pursue and reopens none of its decisions. It retains `docs/plans/2026-10-17-card-grouping.md`, whose line-break rule in `touches` it leaves unchanged.

### Requirements

- A card is the adjacent pending changes of one author, named by its oldest change, so every peer and reload names it alike (`docs/vision/plite.md`, the Authored changes paragraph).
- Text or a line break written inside one's own pending insertion becomes part of it, so rejecting the insertion removes it (the same paragraph).
- The ledger's card sequence equals the kernel's, checked by `packages/plitejs/test/authored-tree-recording-laws.slow.ts`.
- A card start depends only on the entry before it, so a sync rechecks only entries near a changed block (`syncCards` and `startsAfter` in `packages/plitejs/src/authored/ledger/cards.ts`).

### Findings

- The finding's probes reproduce at HEAD: typing inside the second of three lines splits the card and renames its far part (`docs/plans/artifacts/2026-10-17-card-own-split/head-probe-card-a1.log`, `head-probe-kernel-a1.log`). Their fixture marks only each paragraph element.
- The recorder writes an inserted line's mark on the line and on its text, for `nodes.insert`, and typed text inside one's own line joins the text's leaf (`probe-recorded-a1.log`, `probe-canonical-a1.log`).
- In that shape, three adjacent own inserted lines with three changes give three cards before any typing. So do two own inserted lines with an own struck line between them, and three own struck lines, each made by recorded gestures (`probe-canonical-a1.log`, `head-probe-gestures-a1.log`).
- Text inside an inserted element that carries no insertion of its own survives rejecting that element: on the finding's fixture, rejecting the second line's change keeps "Line 1" and removes only the typed letter (`probe-semantics-a1.log`). Leaving typed text unmarked would keep it after its line is rejected. The same probe's third case failed on its own edit offset, so it shows nothing.
- Bolding text inside one's own inserted line changes the text's property and writes no change of its own (`head-probe-nested-a2.log`), so a second change of the same author inside one's own line does not come from formatting.
- Another author's typing inside one's own inserted line splits one's card around it, at HEAD too (`head-probe-card-a1.log`, cases E and F).

### Lanes

1. Keep the current design. Rejected: adjacent own block changes break the Plite card law.
2. The recorder leaves text typed inside one's own inserted line unmarked, as the task first asked. Rejected: the recorder's stored shape already marks that text and merges typed letters into it, so the split happens without typing, and unmarked text survives rejecting its line.
3. Fold each change against its outermost covering occurrence, scanning the change's occurrences on every comparison. Rejected: the ledger's comparison then costs a walk over the change's occurrences in its last block, where reading the end that the block walk already found costs nothing.
4. Card reach: a card keeps the farthest end of all its members, so a nested change cannot cut it. Rejected for this run: a card start would depend on every earlier member, so a sync stops being local, as `docs/plans/2026-10-17-card-grouping.md` lane 4 found.
5. Chosen: the block walk records each change's end for the ledger, the kernel derives the same end from the change's occurrences, and both fold with `continues`.

Proof limits: the regression test and probes run in Plite; Chromium hand drive and the suggestions specs cover the page.

### Dependents

- `suggestions`, through `useSuggestionGroups` in `packages/platejs/src/react/features/suggestion/useSuggestion.ts` and the copied `apps/www/src/registry/components/editor/discussion.tsx`: both read `groups` and `groupOf`, whose shapes stay the same; they show fewer cards for adjacent own block changes.

## Steps

- [x] Reproduce the split at HEAD on the finding's fixture, the recorder's stored shape and recorded gestures. Proof: `docs/plans/artifacts/2026-10-17-card-own-split/head-probe-card-a1.log`, `docs/plans/artifacts/2026-10-17-card-own-split/head-probe-gestures-a1.log`
- [x] Prove the new test fails at HEAD in a detached worktree. Proof: `docs/plans/artifacts/2026-10-17-card-own-split/base-red-final-a1.log`
- [x] Record each change's end in `blockOccurrencesOf`, and fold on it in `groupAuthoredChanges` and `startsAfter`. The kernel derives the same end from the change's own occurrences, and both folds use `continues`. Proof: `docs/plans/artifacts/2026-10-17-card-own-split/probe-kernel-final-a2.log`, `docs/plans/artifacts/2026-10-17-card-own-split/fix3-plugin-a1.log`, `docs/plans/artifacts/2026-10-17-card-own-split/fix-typecheck-a2.log`, `docs/plans/artifacts/2026-10-17-card-own-split/fix-storage-alone-a2.log`
- [x] Show the end rule's two branches are needed by mutation. The final rule has a third branch, the containment in `continues`, and each of the three is needed. Proof: `docs/plans/artifacts/2026-10-17-card-own-split/mutate/mutate/control-1-a4.log`, `docs/plans/artifacts/2026-10-17-card-own-split/mutate/mutate/continues-is-touches-a1.log`, `docs/plans/artifacts/2026-10-17-card-own-split/mutate/mutate/walk-end-is-last-occurrence-a1.log`, `docs/plans/artifacts/2026-10-17-card-own-split/mutate/mutate/ledger-reads-last-occurrence-a2.log`
- [x] Compare the old and new folds over the ledger law's generated documents, and classify every difference. None differs. Proof: `docs/plans/artifacts/2026-10-17-card-own-split/differential-a5.log`
- [x] Run the slow recording laws, which check the ledger's cards against the kernel's. They stop on the hides check at base and on the fix alike, so the differential run, which counts that check, holds the card comparison. Proof: `docs/plans/artifacts/2026-10-17-card-own-split/fix-ledger-law-a3.log`, `docs/plans/artifacts/2026-10-17-card-own-split/base-ledger-law-a1.log`, `docs/plans/artifacts/2026-10-17-card-own-split/differential-a5.log`
- [x] State the rule in `docs/vision/plite.md` and the unreleased changeset. Proof: `docs/vision/plite.md`, `.changeset/plite-authored-review-cards.md`
- [x] Review the diff with two independent code reviewers. Proof: `docs/plans/artifacts/2026-10-17-card-own-split/review/quality/reply.md`, `docs/plans/artifacts/2026-10-17-card-own-split/review/bugs/reply.md`, `docs/plans/artifacts/2026-10-17-card-own-split/review/comments-reply.md`
- [x] Run the writing passes and the lint fix. Proof: `docs/plans/artifacts/2026-10-17-card-own-split/lint-task-a2.log`
- [x] Hand drive `/docs/suggestion` and run the suggestions specs. Proof: `docs/plans/artifacts/2026-10-17-card-own-split/hand-drive-check-a4.log`, `docs/plans/artifacts/2026-10-17-card-own-split/drive-final-a1.json`, `docs/plans/artifacts/2026-10-17-card-own-split/www-chromium-a2.log`, `docs/plans/artifacts/2026-10-17-card-own-split/www-firefox-a2.log`, `docs/plans/artifacts/2026-10-17-card-own-split/www-webkit-a2.log`, `docs/plans/artifacts/2026-10-17-card-own-split/plite-chromium-a2.log`, `docs/plans/artifacts/2026-10-17-card-own-split/HEAD-www-webkit-a1.log`, `docs/plans/artifacts/2026-10-17-card-own-split/51f3a53b665263bd0b0ae81b99978f542eede86f-www-webkit-a1.log`

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Base control | `docs/plans/artifacts/2026-10-17-card-own-split/base-red-final-a1.log` |
| Mutation | `docs/plans/artifacts/2026-10-17-card-own-split/mutate-run-4.log`, three of three caught |
| Differential | `docs/plans/artifacts/2026-10-17-card-own-split/differential-a5.log`, 2982 documents, none differs |
| Slow laws | `docs/plans/artifacts/2026-10-17-card-own-split/fix-ledger-law-a3.log` against `docs/plans/artifacts/2026-10-17-card-own-split/base-ledger-law-a1.log`, the same hides failure at base |
| Code review | `docs/plans/artifacts/2026-10-17-card-own-split/review/quality/reply.md`, `docs/plans/artifacts/2026-10-17-card-own-split/review/bugs/reply.md` |
| Hand drive | `docs/plans/artifacts/2026-10-17-card-own-split/hand-drive-check-a4.log`, `docs/plans/artifacts/2026-10-17-card-own-split/drive-final-a1.json` |
| Playtest | `docs/plans/artifacts/2026-10-17-card-own-split/www-chromium-a2.log`, `docs/plans/artifacts/2026-10-17-card-own-split/www-firefox-a2.log`, `docs/plans/artifacts/2026-10-17-card-own-split/www-webkit-a2.log`, `docs/plans/artifacts/2026-10-17-card-own-split/plite-chromium-a2.log`, the one WebKit failure the same at HEAD and base (`docs/plans/artifacts/2026-10-17-card-own-split/HEAD-www-webkit-a1.log`, `docs/plans/artifacts/2026-10-17-card-own-split/51f3a53b665263bd0b0ae81b99978f542eede86f-www-webkit-a1.log`) |
| Writing passes | `docs/plans/artifacts/2026-10-17-card-own-split/review/comments-reply.md` and the writing rows of the decision log |
| Lint | `docs/plans/artifacts/2026-10-17-card-own-split/lint-task-a2.log` |

## Open work

- Another author's typing inside one's own suggested line still splits one's card around it, and so does an edit inside one's own struck line followed by striking the next line, as at base. Both need a card to keep its farthest member's end, which makes a card start depend on every earlier member. Suggested task t_72e8736d holds both. owner: zbeyens, who starts or drops that task. stop: t_72e8736d lands or is dropped.
- The ledger law never builds adjacent own whole-line changes, and the plugin tests read only the ledger, so no suite test reaches the kernel's new end. A probe on the final bytes shows the kernel and the ledger agree on six such cases (`docs/plans/artifacts/2026-10-17-card-own-split/probe-kernel-final-a2.log`). Suggested task t_17ead528 widens the law's generator. owner: zbeyens, who starts or drops that task. stop: t_17ead528 lands or is dropped.
- In WebKit, the playground image test's click on a paragraph lands on a Preview button and then on the sticky site header, and times out, at HEAD and at base too. Suggested task t_095b0272 holds it. owner: zbeyens, who starts or drops that task. stop: t_095b0272 lands or is dropped.
- On a loaded host the authored suite's large-document tests run past their 5 s limit, at base too. Suggested task t_0a13d914 holds them. owner: zbeyens, who starts or drops that task. stop: t_0a13d914 lands or is dropped.

## Close

The patch `docs/plans/artifacts/chips/t_9ced9eec.patch` landed on next, uncommitted. One author's neighboring whole-line insertions and deletions share one card, and so does a change that starts inside one's own inserted or struck line. `blockOccurrencesOf` records where each change ends, the ledger's `startsAfter` reads that end, the kernel derives the same end from the change's occurrences, and both folds join with `continues`.

Reversals and deviations come first.

1. The first build regressed. Its fold compared only each change's end, so a Backspace, a bolding or a replacement inside one's own line, made before striking that line, got its own card where base kept one. The bug reviewer found it (`docs/plans/artifacts/2026-10-17-card-own-split/review/bugs/reply.md`). `continues` now also joins a change that starts inside the previous change's inserted or deleted block. The new struck-line test fails on the reviewed tree and passes at base and on the final tree (`docs/plans/artifacts/2026-10-17-card-own-split/prev-red-struck-deletion-a1.log`, `docs/plans/artifacts/2026-10-17-card-own-split/base-struck-deletion-a1.log`).
2. The plan had the kernel read the end through `AuthoredChangeIndex.ends`. The quality reviewer showed that this put test-only data in every production index and made the oracle read the walk it checks (`docs/plans/artifacts/2026-10-17-card-own-split/review/quality/reply.md`). The index is back to base, and the kernel derives the end itself.
3. The mutation step named two branches. The final rule has three, and each is needed.
4. The adjacent-lines test lost its typing step, and the Brief lost its claim that typing moved a card's color. At base the cards split before any typing, and a color moved only on the finding's fixture, which marks only the paragraph element.

Proof, from each row's scope:

- The final test file fails at base with three one-change cards, and its struck-line test passes there (`docs/plans/artifacts/2026-10-17-card-own-split/base-red-final-a1.log`).
- On the frozen final tree 2e20ea8033, 49 of 49 plugin tests pass and the plitejs typecheck exits 0 (`docs/plans/artifacts/2026-10-17-card-own-split/fix3-plugin-a1.log`, `docs/plans/artifacts/2026-10-17-card-own-split/fix-typecheck-a2.log`).
- The authored partition fails only the nested-proposals storage test's 5 s timeout, at load average 65, which base hits too, and that test passes alone on the final bytes (`docs/plans/artifacts/2026-10-17-card-own-split/fix-authored-partition-a3.log`, `docs/plans/artifacts/2026-10-17-card-own-split/base-authored-partition-a1.log`, `docs/plans/artifacts/2026-10-17-card-own-split/fix-storage-alone-a2.log`). At load average 4.7 the whole partition passes, 645 tests on the fix and 643 at base (`docs/plans/artifacts/2026-10-17-card-own-split/fix-authored-partition-quiet-a1.log`, `docs/plans/artifacts/2026-10-17-card-own-split/base-authored-partition-quiet-a1.log`).
- Reducing `continues` to `touches`, dropping the walk's insertion-or-deletion end, and reading each change's last occurrence in the ledger each fail a named test (`docs/plans/artifacts/2026-10-17-card-own-split/mutate-run-4.log`).
- Over 2982 generated documents with 269 same-author neighbor pairs, the ledger's cards equal the kernel's and none differs from the base fold (`docs/plans/artifacts/2026-10-17-card-own-split/differential-a5.log`). So the law exercises none of the changed cases.
- On six cases the fix changes or must keep, among them three stored own lines with typing in the first, the kernel's cards equal the ledger's, and the base fold differs on the three the fix changed (`docs/plans/artifacts/2026-10-17-card-own-split/probe-kernel-final-a2.log`).
- The slow ledger law stops on the same two hides assertions at base and on the fix (`docs/plans/artifacts/2026-10-17-card-own-split/fix-ledger-law-a3.log`, `docs/plans/artifacts/2026-10-17-card-own-split/base-ledger-law-a1.log`).
- On `/docs/suggestion` in the built-in Chromium at 1280 by 900, a Backspace inside a line, that line struck, then three lines above it struck, gave one card of five changes named by the oldest (`docs/plans/artifacts/2026-10-17-card-own-split/drive-final-a1.json`, `docs/plans/artifacts/2026-10-17-card-own-split/drive-final-card-a1.jpg`).
- The suggestions specs pass on the final bytes in Chromium, 112 tests, and Firefox, 111 with 1 skipped, and the plite suite passes 39 in Chromium. WebKit passes 110 and fails one, "deletes the playground image and resolves it with Reject", because a Preview popover button catches the click. That test fails the same way at HEAD and at base (`docs/plans/artifacts/2026-10-17-card-own-split/www-chromium-a2.log`, `docs/plans/artifacts/2026-10-17-card-own-split/www-firefox-a2.log`, `docs/plans/artifacts/2026-10-17-card-own-split/www-webkit-a2.log`, `docs/plans/artifacts/2026-10-17-card-own-split/plite-chromium-a2.log`, `docs/plans/artifacts/2026-10-17-card-own-split/HEAD-www-webkit-a1.log`, `docs/plans/artifacts/2026-10-17-card-own-split/51f3a53b665263bd0b0ae81b99978f542eede86f-www-webkit-a1.log`).

The proof stops short in three places. The kernel's new end has no suite test, only the probe, the hand drive ran in Chromium only, and nothing here covers a second author.

All 10 steps are done.

Open work is the four suggested tasks above. The slow law's hides failure predates this run and belongs to suggested task t_cbe5346a.

### Attention

reviewed by gpt-6.1-sol @xhigh, on the plan, log and authored files frozen at f2b3ac8fa4 (`docs/plans/artifacts/2026-10-17-card-own-split/trail/answer.md`). It found no critical finding, six warnings and two nits.

1. The log said case Q was folded into t_72e8736d before any ledger row did. The ledger now holds that fold.
2. The plan named t_095b0272 before it was offered, and blamed the wrong click. The task is now offered, and the plan names the paragraph click that a Preview button and the site header catch.
3. The Brief says the change is on next before the landing ran. Kept as written, because the patch carries the plan, so the Brief and the Close describe the state at hand-back, which comes after the landing.
4. No test reaches the kernel's new end. A probe on the final bytes now shows the kernel and the ledger agree on six cases, and the plan no longer says the plugin tests check the kernel.
5. The end rule was too wide for a change whose last part lies outside its whole block. The Vision sentence and the Teach now name that condition.
6. The log lacked the deferral of the storage row. A row now records it, and a rerun on a quiet host shows the whole partition passes on both trees.
7. The semantics probe's third case failed on its own edit. The log marks that probe partial, and the plan says so.
8. One log row overstated the reproduction. A correction row narrows it to the cases that split into one card per change.

### Review inputs

The files this plan's `review_inputs` names, which its review and proof read:

- `packages/plitejs/test/authored-plugin.test.ts`
- `packages/plitejs/src/authored/changes.ts`
- `packages/plitejs/src/authored/ledger/cards.ts`
- `packages/plitejs/src/authored/ledger/book.ts`
- `packages/plitejs/src/authored/tree/record.ts`
- `packages/plitejs/src/authored/tree/resolve.ts`
