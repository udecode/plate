---
review_scopes: [suggestions, authored]
review_basis: [2026-10-12-suggestions-complete]
work_kind: implementation
review_commit: 4f880fc5702db166a0e92e8f8b15d5ab9fa26b0c
review_inputs: [packages/plitejs/test/authored-plugin.test.ts, packages/plitejs/src/authored/ledger/cards.ts, docs/editor-behavior/scenarios/suggestions.md, docs/plans/2026-09-14-suggestion-grouping-regression.md]
---

# One card for a gesture across a line break

Status: executed: uncommitted on next, waiting on your commit
Playbook: verdict

**Pursue, and build it here. A deletion that crosses a line break and the join it leaves form one card, and a gesture may grow an adjacent older deletion of the same author.** Plite's law already says a card is one author's adjacent pending changes (`docs/vision/plite.md`), and `docs/editor-behavior/scenarios/suggestions.md` S16 holds `/docs/suggestion` to it. Two defects broke that law. `touches` in `packages/plitejs/src/authored/changes.ts`, which both the kernel's `groupAuthoredChanges` and the ledger's `startsAfter` use, never joined changes across a block edge, even when the edge is a pending join or split. So the struck `sentence.` and its join sat in one card and the struck text opening the next line in another. Separately, Enter right after one's own typing minted a new change while the text typed after it continued the insertion, so the insertion enclosed the split and the card split there. The S16 tester also flagged that the older "redundant phrase" card grew; that growth is the designed outcome. `ownDeleteNear` extends an adjacent own deletion on purpose, because the 2026-09-14 Google Docs probes showed one suggestion growing across Backspaces and history detours (`docs/plans/2026-09-14-suggestion-grouping-regression.md`). A reviewer who read the card before it grew gets `stale` when deciding, so nothing is decided by surprise. This continues the `suggestions` scope's open Pursue, `2026-10-12-suggestions-complete`, whose first job is `/docs/suggestion`; suggested task t_cb70bf20 asked the question.

## Brief

### What will change?

Deleting across two lines now gives one review card. So does pressing Enter at either end of your typing, and pressing Enter again on the blank line that first Enter left. The Plite law now says so.

### What could go wrong?

A deletion next to your older deletion joins its card, so one Reject undoes both, as in Google Docs. Around an Enter inside a link, cards still split as before; a follow-up task covers it.

## Demo

1. Open `/docs/suggestion` on the www dev server, in Suggestion mode. Select from `sentence.` on line 1 through `out of the` on line 2 and press Backspace. The sidebar shows one card that lists the struck `sentence.`, the paragraph break and the struck `Keep this redundant phrase out of the`. ![after](artifacts/2026-10-17-change-card-grouping/s16-3bd3b04.jpg)
2. Click at the end of a line, type a few letters, press Enter, press Enter again and type on. One card lists the typing and both breaks. ![after](artifacts/2026-10-17-change-card-grouping/double-enter-3bd3b04.jpg)
3. Type at the end of line 1, click at the start of line 2 and press Enter. The new break gets its own card, apart from your typing. ![after](artifacts/2026-10-17-change-card-grouping/start-of-line-3bd3b04.jpg)

## Teach

In Suggesting mode every edit is stored as a pending change, and the review sidebar shows cards. A card gathers one person's changes that sit next to each other, so a reviewer accepts or rejects them in one click.

Two things broke that. A suggested line break did not count as touching the text around it, so deleting from the middle of one line into the next gave two cards. And Enter right after your own new text started a separate change, while the text you typed next continued the first one, so the break sat inside it and got its own card.

Now a suggested line break counts as touching the text on both sides. Enter, or a pasted line break, inside or next to your own new text becomes part of that text's change, and so does a second Enter on the blank line the first one left. One action shows as one card, as in Google Docs.

## Main changes

- `touches` in `packages/plitejs/src/authored/changes.ts` treats a pending `join` or `split` of blocks, not an inline cut, as covering no unit. It sits right before its block's first unit, so it touches the content that ends right before the block and the content that opens it. The kernel's `groupAuthoredChanges` and the ledger's `startsAfter` share `touches`, so both give the same cards, and a card start still depends only on the change before it.
- `continuedOwnInsert` in `packages/plitejs/src/authored/tree/record.ts` replaces `adjacentOwnInsert` as the one rule for which of one's own pending insertions a write continues, the one it lands in or one at its edge. It looks past the empty leaf a text split leaves and never across a block edge. Text typed into an empty block that one's own pending split opened continues that split's change. A second Enter continues an Enter's change only when that Enter continued one's typing. The block split and the inline cut of one Enter take the change it picks, through `splitOf` and `splitInline`.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| A deletion next to your older deletion | It joins that card, so one Reject undoes both, as in Google Docs (look) | Each gesture keeps a card of its own | apart | big |
| An older change inside a whole deleted line | It keeps its own card and is decided apart (look) | It folds into the line's card | nest | small |
| Cards around an Enter inside a link | Two cards, as before, and a follow-up task fixes it (look) | Fix it in this run | links | small |
| Typing or a second Enter at the start of the line your own Enter pushed down, when that line has text, and a second Enter right after a plain Enter | A new change in the same card (look) | It joins the Enter's change | follow | detail |
| The other suggestion rows | Drove only the rows this change reaches; the rest ran the day before on the same base (look) | Drive every row again | full playtest | small |
| Where the verdict is recorded | In this plan, under the suggestions review that is still open | A new review question for card grouping | scope | detail |
| Review of the change | Two independent code reviewers, the bug reviewer over four rounds | A full panel | panel | detail |
| Who writes the code | I wrote it, since each fix was shorter than its brief | Hand it to Codex | codex | detail |

## Evidence

Model: claude-opus-5-5 at xhigh, in the worktree `inspiring-yonath-badb9f` at `4f880fc570`.

This plan retains `2026-10-12-suggestions-complete`: it builds one `/docs/suggestion` parity gap under that open Pursue and reopens none of its decisions. It retains `docs/plans/2026-09-14-suggestion-grouping-regression.md` as the source of the identity law and its Google Docs probes.

### Requirements

- A card is the adjacent pending changes of one author, named by its oldest change, so every peer and reload names it alike (`docs/vision/plite.md`, the Authored changes paragraph).
- S16: both parts struck, the join suggested, no text lost, one card (`docs/editor-behavior/scenarios/suggestions.md`).
- A change follows the text, not the undo history; established ids never merge; a deletion that bridges two own deletions extends one side (`docs/plans/2026-09-14-suggestion-grouping-regression.md`, SG-01 to SG-03).
- The ledger's card sequence equals the kernel's (`groupAuthoredChanges` in `packages/plitejs/src/authored/changes.ts`, checked by `packages/plitejs/test/authored-tree-recording-laws.slow.ts`).
- A card start depends only on the entry before it, so a sync rechecks only entries near a changed block (`syncCards` and `startsAfter` in `packages/plitejs/src/authored/ledger/cards.ts`).

### Findings

- The browser stores S16 as `sentence.` and the join under the new change and `Keep this redundant phrase out of the ` under `removed-phrase`. At base that reads as two cards, because a join never touched the next block's text.
- `tx.text.delete` over the same range puts the whole leaf `Keep this ` in the new change and the partial leaf `out of the ` in `removed-phrase`; that shape already read as one card.
- Backspace at a line start, then Backspace on the line above, gave two cards at base: the join and the struck letter.
- Typing, Enter and typing gave two cards at base; with the edge rule but not the inside rule, a two-line paste inside one's own typing still gave two.
- A deletion that covers a whole line holding one's older deletion layers the new change over it, and the older change keeps its card under both rules.
- The code-quality review found that the inline cut of an Enter inside a link minted its own change while the block split took the typing's, and that a near-copy helper did the same lookup. Both are gone.
- The bug review found three gaps, each with a test now. Enter at a line start joined one's own typing on the line above. Enter at the left edge of one's own typing depended on how the caret was named, because the split first leaves an empty leaf. A second Enter split the card. Its third round found nothing new, and 5,588 fuzz steps found the kernel and ledger cards equal. Its fourth round checked the narrowing to empty blocks and found nothing new, with kernel and ledger cards equal over another 5,588 steps.
- Around an Enter inside a link, a deletion beside the break still gets its own card, at HEAD too, because a cut covers its whole link half (`docs/plans/artifacts/2026-10-17-change-card-grouping/probe-cut-a2.log`; HEAD prints the same cards in `docs/plans/artifacts/2026-10-17-change-card-grouping/head-probe-cut-a1.log`).
- Typing, or a second Enter, at the start of a filled line one's own Enter made takes a new change in the same card, and so does a second Enter on the empty line a plain Enter made (`docs/plans/artifacts/2026-10-17-change-card-grouping/probe-plain-enter-a1.log`). Text typed into that empty line continues the Enter's change. The www spec that records the owner's key sequence pins a second Enter before struck text as a change of its own.
- The recording law "rejecting everything undoes a suggestion" fails at HEAD at seeds -353941099 and 426485304, each the same way with this change.

### Lanes

1. Keep the current design. Rejected: S16 and line-start Backspace break the Plite card law.
2. The strongest deletion: drop `ownDeleteNear`, so a gesture never grows an older change and cards alone group. Rejected: repeated Backspace makes one change per key, the card lists each letter, and the SG-01 one-change law that matched Google Docs breaks.
3. One change per gesture. Rejected: identity by undo batch is what SG-03 forbids, and separate gestures that meet at a line break still need card adjacency.
4. Card reach: fold every same-author change that sits inside another's span into its card. Rejected: a card start would depend on every earlier member of its card, so a ledger sync stops being local, and an older change under a whole-line deletion is a separate decision.
5. Chosen: a pending join or split touches both sides of its block edge, and a split joins one's own insertion it lands in or beside.

Proof limits: Chromium is the only browser driven by hand; Firefox, WebKit and Plite reach only what their specs assert.

### Dependents

- `suggestions`, through `useSuggestionGroups` in `packages/platejs/src/react/features/suggestion/useSuggestion.ts` and the copied `apps/www/src/registry/components/editor/discussion.tsx`: both read `groups` and `groupOf`, whose shapes stay the same; they show fewer cards on these gestures.

## Steps

- [x] Reproduce S16 and its siblings at the kernel and in the browser. Proof: `docs/plans/artifacts/2026-10-17-change-card-grouping/probe-a1.log`, `docs/plans/artifacts/2026-10-17-change-card-grouping/probe-base-a1.log`
- [x] Prove the new tests fail at base for their defects, and that the guards pass there. Proof: `docs/plans/artifacts/2026-10-17-change-card-grouping/base-red-a4.log`, `docs/plans/artifacts/2026-10-17-change-card-grouping/base-red-a5.log`
- [x] Bridge a pending line break in `touches`. Proof: `docs/plans/artifacts/2026-10-17-change-card-grouping/authored-fast-a9.log`
- [x] Continue one's own insertion or line break in `continuedOwnInsert`, and give a split and its cut one change. Proof: `docs/plans/artifacts/2026-10-17-change-card-grouping/authored-fast-a9.log`
- [x] Show each new branch is needed: eleven mutations, each caught by its named test. Proof: `docs/plans/artifacts/2026-10-17-change-card-grouping/mutate-spec-10.json`, `docs/plans/artifacts/2026-10-17-change-card-grouping/mutate/drop-line-break-before-content-a5.log`, `docs/plans/artifacts/2026-10-17-change-card-grouping/mutate/drop-content-before-line-break-a6.log`, `docs/plans/artifacts/2026-10-17-change-card-grouping/mutate/line-break-covers-its-block-a6.log`, `docs/plans/artifacts/2026-10-17-change-card-grouping/mutate/cut-counts-as-line-break-a6.log`, `docs/plans/artifacts/2026-10-17-change-card-grouping/mutate/split-ignores-insertion-it-lands-in-a6.log`, `docs/plans/artifacts/2026-10-17-change-card-grouping/mutate/split-mints-its-own-change-a6.log`, `docs/plans/artifacts/2026-10-17-change-card-grouping/mutate/cut-mints-its-own-change-a6.log`, `docs/plans/artifacts/2026-10-17-change-card-grouping/mutate/split-sees-the-block-before-a6.log`, `docs/plans/artifacts/2026-10-17-change-card-grouping/mutate/texts-stop-at-empty-leaf-a4.log`, `docs/plans/artifacts/2026-10-17-change-card-grouping/mutate/own-line-break-ignored-a4.log`, `docs/plans/artifacts/2026-10-17-change-card-grouping/mutate/own-line-break-at-any-block-start-a2.log`
- [x] State the card and change-identity law in `docs/vision/plite.md`. Proof: `docs/vision/plite.md`
- [x] Amend the unreleased changeset. Proof: `.changeset/plite-authored-review-cards.md`
- [x] Review the diff with two independent code reviewers. Proof: `docs/plans/artifacts/2026-10-17-change-card-grouping/review-quality/reply.md`, `docs/plans/artifacts/2026-10-17-change-card-grouping/review-bugs/reply-round4.md`
- [x] Hand drive `/docs/suggestion`. Proof: `docs/plans/artifacts/2026-10-17-change-card-grouping/hand-drive-a5.log`, `docs/plans/artifacts/2026-10-17-change-card-grouping/s16-3bd3b04.jpg`, `docs/plans/artifacts/2026-10-17-change-card-grouping/double-enter-3bd3b04.jpg`, `docs/plans/artifacts/2026-10-17-change-card-grouping/start-of-line-3bd3b04.jpg`
- [x] Run the writing passes and the lint fix. Proof: `docs/plans/artifacts/2026-10-17-change-card-grouping/review-comments/reply.md`, `docs/plans/artifacts/2026-10-17-change-card-grouping/review-comments/reply-narrowing.md`, `docs/plans/artifacts/2026-10-17-change-card-grouping/lint-task-a1.log`
- [x] Run the fast suite, the slow laws and the suggestions specs on the final bytes. Proof: `docs/plans/artifacts/2026-10-17-change-card-grouping/authored-fast-a9.log`, `docs/plans/artifacts/2026-10-17-change-card-grouping/authored-laws-a7.log`, `docs/plans/artifacts/2026-10-17-change-card-grouping/specs-a5.md`

## Open work

- Cards around an Enter inside a link still split, as at HEAD, because a cut covers its whole link half and the end cut sorts before its content. Suggested task t_3fbf4c17 in the ledger tracks it. owner: zbeyens. stop: t_3fbf4c17 lands or is dropped.
- Typing, or a second Enter, at the start of a filled line one's own Enter made takes a new change in the same card, and so does a second Enter on the empty line a plain Enter made (`docs/plans/artifacts/2026-10-17-change-card-grouping/probe-plain-enter-a1.log`). Text typed into that empty line continues the Enter's change. The www spec that records the owner's key sequence pins a second Enter before struck text as a change of its own. The suggestions subject's Open work tracks it. owner: zbeyens. stop: the owner says follow, or drops it.
- The recording law "rejecting everything undoes a suggestion" fails at HEAD at seeds -353941099 and 426485304. Suggested task t_54844d26 holds both. owner: zbeyens. stop: t_54844d26 lands or is dropped.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Base control | The seven new tests that fail at base fail at HEAD for their defects; the three guards pass there, and mutations back them |
| Mutation | Eleven of eleven caught on `3bd3b04f7a` |
| Slow laws | 47 of 47 on `3bd3b04f7a` |
| Code review | One code-quality review, four bug-review rounds and two comment reviews; every finding fixed, offered or rejected with its reason |
| Hand drive | S16, Enter twice after typing and Enter at a line start, in Chromium on `3bd3b04f7a` |
| Playtest | www 112 of 112 and Plite 39 of 39 in Chromium on `3bd3b04f7a`; Firefox and WebKit on `31d429e7f0` fail only as HEAD does |
| Writing passes | deslop, no-comments and unslop, run again over the narrowing |
| Lint | `pnpm lint:task` on the four changed source files passes |

## Verification

- On the final bytes, `3bd3b04f7a`, the 19 authored test files pass (665 tests), eleven of eleven mutations are caught, the 47 slow-law tests pass, and the suggestions specs pass in Chromium, www 112 of 112 and Plite 39 of 39.
- A Chromium hand drive of `/docs/suggestion` on the same bytes shows one card for the S16 deletion, one card for Enter twice after typing, and a card of its own for Enter at a line start.
- Proof stops at Chromium. Firefox and WebKit ran before the bug-review fixes, and each of their failures fails the same at HEAD.

## Close

It lands in the checkout's working tree as `docs/plans/artifacts/chips/t_cb70bf20.patch`, uncommitted, rebased onto `next` at `db38b40203`; the code proofs ran on freeze `3bd3b04f7a`. A deletion across a line break and the join it leaves now form one card. Enter written inside or at the edge of one's own pending insertion joins that insertion's change, and so does a second Enter on the empty line such an Enter made.

Reversals and deviations come first.

- The verdict and the plan were written down at 23:07, after the first code edit at 22:48. The verdict reasoning came first in the session, but no written verdict or plan gated the build, as the ask's order asked.
- The own-split continuation first applied at any line start. The www spec in `apps/www/tests/browser/suggestion-page.spec.ts` that records the owner's key sequence then failed, because a second Enter before struck text took the first Enter's change. The rule now applies only in the empty block one's own split opened. Text typed there continues the split's change, and a second Enter continues it only when the first Enter continued one's typing. The `follow` Default covers the rest: typing or a second Enter at the start of a filled line, and a second Enter after a plain Enter.
- The first Close and Main changes said any write into that empty block continues the split. The decision-trail review's probe showed a second Enter after a plain Enter takes a new change in the same card, and the text now says so.
- The build went past the ask's two questions to Enter after one's own typing, because typing, Enter and typing broke the same card law (the second `why` row).
- The comment review of that narrowing renamed `ownBreak` to `ownSplitOfEmptyBlock` and deleted its comment.
- Cards around an Enter inside a link stay split as at HEAD, deferred to suggested task t_3fbf4c17. A HEAD control prints the same cards (`head-probe-cut-a1.log`).
- Before landing, the worktree branch was rebased onto `next`, because `next` changed the suggestions subject where the fold appends. The 19 authored test files pass there too, 665 tests (`authored-fast-a10.log`).

Proof, each from its log row's scope:

- On `3bd3b04f7a`, the 19 authored test files pass, 665 tests (`authored-fast-a9.log`). Eleven of eleven mutations are caught by their named tests (`mutate-spec-10.json`). The 47 slow-law tests pass (`authored-laws-a7.log`). Chromium specs pass, www 112 of 112 and Plite 39 of 39 (`specs-a5.md`). The hand drive covers `/docs/suggestion` at desktop width (`hand-drive-a5.log`). The plitejs typecheck shows only the two TS2349 errors HEAD has (`plitejs-typecheck-a7.log`).
- The seven new tests that fail at HEAD fail there for their defects, and the three guards pass at HEAD, each backed by a mutation (`base-red-a4.log`, `base-red-a5.log`).
- On `0125198166`, which differs from the final bytes only by that rename and the deleted comment, the platejs authored specs pass 155 tests and fail only the 4 that HEAD fails (`platejs-authored-a4.log`).

The proof stops at Chromium. Firefox and WebKit ran on `31d429e7f0`, and all 96 of their failures fail the same at HEAD (t_2ad25b93, t_7ee7a6a0). The recording law fails at HEAD at seeds -353941099 and 426485304, the same way with this change (t_54844d26). Under host load averages of 60 to 130, bun's 5 s test timeout failed heavy tests that pass at 60 s or 120 s, so the final runs use the longer timeout.

Of the 11 steps, 11 are done, 0 partial, 0 skipped, 0 blocked and 0 open.

The three items under Open work stay open, each with its owner and stop.

The decision-trail review ran on Codex (`trail/answer.md`). It raised 5 warnings and 4 nits. The plan and log now record the design-first deviation, the narrower continuation rule, the HEAD control for link cards, the first comment review's separate reasons, the full timing range, both seed logs and the code-quality review applied in full. The Close names the landing patch, which the landed ledger row confirms.

### Attention

reviewed by gpt-6.1-sol @xhigh (Codex)

- Resolve the plain-Enter exception before treating empty-block continuation as a settled law.
- Record the design-first deviation honestly.
- Keep the Close provisional until landing is evidenced.
