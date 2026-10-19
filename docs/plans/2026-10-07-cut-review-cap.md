# Cut the review cap

Status: executed: dotai and Ellie pushed; plate-2 waits for your commit
Topic: pstack
Playbook: authoring-a-skill

The owner's words: "cut the review cap everywhere, we'll use pstack default." Upstream pstack v0.9.67 has no round cap: its playbooks call `interrogate` where a design is contested or a PR opens, and the lead judges the verdict. The shared block added a cap of two rounds that applied a critical fix, then let only subtractive changes land and parked everything else until the owner said "ship all" or "another round". This plan removes the cap and every rule that depends on it from the shared block, the plate-2 playbooks that cite it and every managed project's rendered copy.

## Brief

### What will change?

Reviews have no round limit. After the second round, a fix gets the same review as any other instead of waiting for your word. A plan phase rewritten after its reviews gets another review, then the run builds it.

### What could go wrong?

Without a limit, a review loop ends only when no critical finding remains or each is dismissed. Shared rules and Ellie are pushed; plate-2 waits for your commit.

## Main changes

- Shared block: the Panel review rule loses the cap, the hand-back pick at the cap, the subtractive-only rule after the last round and the owner's "another round" grant. The Review rule reruns the review after an applied critical fix and stops when no critical finding remains or each is dismissed. The decision-trail review and the reflect lessons panel follow the Panel review rule without a cap.
- Shared block, from the smokes: the Panel rule's round-earning sentence covers only rounds that review fixes to findings, and a design changed for another reason is reviewed before its first behavior edit, or before it ships when already built.
- Plate playbooks: the Build playbook's revert rule, its lint-before-freeze reason and its test-per-fix rule, and the Plan playbook's architecture comparison stop naming the cap.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Review after a fix | Keep the rerun after a round that applied a critical fix, with no count limit, so a review ends when no critical finding remains or each is dismissed | Review once and let the lead judge, as pstack's playbooks do | single review |
| A trial before adopting | Skip it: your decision replaces a trial's keep rule, and the smokes check that agents read the new rule | Run a paired trial first | trial first |
| Delivery | Push the shared change and Ellie, and leave plate-2 for your commit | Keep the shared change as a patch | hold the shared change |
| Which review a changed design gets | A change made for a reason other than a review's findings gets its own review before its first behavior edit; fixes to findings earn another round only after an applied critical fix | Leave the two rules as they read before, which every smoke flagged as a clash | restore the old re-review text |

## Steps

- [x] Shared: remove every cap clause from `skills/sync-pstack/assets/block.md` in a detached dotai worktree at `origin/main`, and reword the rules that named it. Proof: `node --test skills/sync-pstack/scripts/sync-pstack.test.mjs`, `node scripts/build-workflow.mjs`, `scripts/validate-skills`, and `apply --dry-run` on plate-2 and Ellie. Done: `docs/plans/artifacts/2026-10-07-cut-review-cap/edit-block.py`, `docs/plans/artifacts/2026-10-07-cut-review-cap/tests-a2.log`, `docs/plans/artifacts/2026-10-07-cut-review-cap/build-workflow-a2.log`, `docs/plans/artifacts/2026-10-07-cut-review-cap/validate-skills-a2.log`, `docs/plans/artifacts/2026-10-07-cut-review-cap/dry-run-plate-2-a1.log`, `docs/plans/artifacts/2026-10-07-cut-review-cap/dry-run-ellie-a1.log`.
- [x] Plate: reword the Build and Plan playbook sentences that cite the cap. Proof: `check-playbooks.mjs` and a search that finds no live cap reference outside dated records. Done: `docs/plans/artifacts/2026-10-07-cut-review-cap/check-playbooks-a1.log`, `docs/plans/artifacts/2026-10-07-cut-review-cap/retired-search-a1.log`.
- [x] Smokes: paired baseline and revised runs on plate-2 and a revised run on Ellie, in both runtimes, judged against intended behavior written first. Proof: the answers in the run directory. Done: `docs/plans/artifacts/2026-10-07-cut-review-cap/smoke/intended.md`, `docs/plans/artifacts/2026-10-07-cut-review-cap/smoke/base-a1.log`, `docs/plans/artifacts/2026-10-07-cut-review-cap/smoke/rev-a3.log`, `docs/plans/artifacts/2026-10-07-cut-review-cap/smoke/ellie-base-a1.log`, `docs/plans/artifacts/2026-10-07-cut-review-cap/smoke/ellie-rev-a1.log`.
- [x] Shared: commit and push dotai. Proof: the pushed commit. Done: udecode/dotai `6eb4bd9` on `main`.
- [x] Plate: apply the block; commit nothing. Proof: `apply` and `verify` output. Done: `docs/plans/artifacts/2026-10-07-cut-review-cap/plate-apply-a1.log`, `docs/plans/artifacts/2026-10-07-cut-review-cap/plate-verify-a1.log`.
- [x] Ellie: apply the block, commit only the sync's files and push `next`. Proof: the pushed commit and `verify` output. Done: InformedMedical/ellie `38da0d918` on `next`, `docs/plans/artifacts/2026-10-07-cut-review-cap/ellie-apply-a1.log`, `docs/plans/artifacts/2026-10-07-cut-review-cap/ellie-verify-a1.log`.

## Proof

- Every proof command runs through `node .agents/pstack/proof.mjs`, which writes its command line and exit status under `docs/plans/artifacts/2026-10-07-cut-review-cap/`.
- A smoke counts only for routing; it never proves a review loop ends.

## Close

What landed: udecode/dotai `6eb4bd9` removes the panel round cap and every rule that leaned on it, and InformedMedical/ellie `38da0d918` renders it. plate-2 renders it too, with the four playbook sentences reworded, and waits for your commit. Upstream pstack has no cap, so reviews now follow its default: a round reruns after an applied critical fix and stops when no critical finding remains or each is dismissed.

Deviation: the first revised smoke showed every runtime reading the Review rule's re-review of a changed design against the Panel rule's "only a round with an applied critical finding earns another". The block now scopes the second to rounds that review fixes to findings and reviews any other design change before its first behavior edit. The Defaults row "Which review a changed design gets" records it.

Proof and limits: paired smokes on plate-2 and Ellie in Claude Code and Codex match the intended behavior written before any run (`docs/plans/artifacts/2026-10-07-cut-review-cap/smoke/intended.md`). The baseline parks the guard and the rewritten phase two for your "another round"; the revised block runs a third round and builds the rewrite in the same run. A smoke proves only what a session says it would do; no real review loop has run under the new text, so nothing yet shows how long an uncapped loop takes.

Reversed lessons: the cap clauses from dotai `2048e50`, `6115afb`, `a167271`, `886fde5`, `85e799a`, `f2e70e7`, `04b2cb7`, `3287b86` and `297a9e1`. The wrong-record rule from `297a9e1` and `7856afa` keeps its non-cap half: a critical finding about a wrong clinical, legal or financial value is never dismissed or narrowed on a reviewer's check of text the same faulty step produced.

Counts for six steps: 6 done, 0 partial, 0 skipped, 0 blocked, 0 open.

## Open work

- Plans and subject items that still name "another round" or "ship all" as their stop now wait only for a review round the next run on them takes: `docs/plans/2026-10-06-knowledge-reorg.md`, `docs/plans/topics/pstack.md` (the round-2 warning patch), `docs/plans/topics/correct.md` and `docs/plans/topics/documents.md`. owner: Ziad. stop: each plan's next run reviews or drops its patch, or 2026-11-07. Tracked here.
- The smokes raised older rule conflicts this change does not touch, such as CLAUDE.md's no git state at intake against recording the base, writing passes on fix code and reflect's trigger; the decision log lists each. owner: Ziad. stop: the next pstack lesson batch takes or drops each, or 2026-11-07. Tracked in this plan's decision log.
- Ellie's shared checkout holds another session's uncommitted `AGENTS.md` edit outside the block, so its next pull of `38da0d918` merges with it. owner: Ziad. stop: that checkout pulls `next`. Tracked here.
