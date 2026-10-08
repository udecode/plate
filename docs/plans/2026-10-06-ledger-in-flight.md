---
work_kind: workflow
---

# Ledger next: skip a scope another session is working on

Status: executed: built and proven; waiting on your commit
Topic: correct
Playbook: build

Twice in one session the owner corrected the same mistake: the lead recommended a ledger item that another session was already working through. First came "already in progress in another session, do the next one". Then, after `node tooling/scripts/review-ledger.mjs next` returned `documents`, came "hey before suggesting a ledger item , check whats wip ! f.e. documents is already in progress" and "repair the skill about that". `docs/plans/2026-10-06-documents-review.md` names `documents` in `review_scopes`, says `Status: building: Phase 2, the root-part table`, and has uncommitted DOCX source beside it. `next` returned it because it never looked at plan status, and the scope's `progress` field missed the plan because the plan's `review_basis` names the older audit, not the review page it is itself.

## Brief

### What will change?

The ledger's next command skips a scope while a recent open plan names it, and lists those scopes. It also lists uncommitted files in the scope it offers, so an agent sees work that has no plan.

### What could go wrong?

A plan untouched for two weeks stops claiming its scope, so a slow or blocked session's work can be offered again. An agent can still ignore the uncommitted files that the command lists.

## Main changes

- `tooling/scripts/review-ledger.mjs` `next` skips every open scope that a plan names in `review_scopes` while that plan's `Status:` is active, held or planning and its file changed in the working tree or in a commit authored in the last 14 days. It lists each skipped scope under `inFlight` with its plans, and lists the offered scope's uncommitted member files under `uncommitted`. A months-old plan that still carries an open status claims nothing.
- `.agents/playbooks/api-review.md` says never to recommend an `inFlight` scope, to continue the plan instead when it is the session's own, and to treat the offered scope's `uncommitted` files with no plan behind them as another session's work.
- `AGENTS.md`'s rules table pairs the rule with `review-ledger.mjs next`, and names the uncommitted-work check as rule-only.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| How long an open plan claims its scope | Two weeks after its last change, or while its file has uncommitted edits, because several August plans still say active and would hide five scopes forever | Every open plan claims its scope until its status changes | claim forever |
| Blocked plans | A blocked plan claims its scope only while it changed in the last two weeks, like any other open plan | A blocked plan claims its scope at any age | blocked holds |
| Uncommitted work with no plan | The next command lists uncommitted member files of the scope it offers, and the agent judges them, because shared files such as package manifests are often dirty from unrelated work | The next command skips any scope with an uncommitted member file | skip dirty scopes |

## Close

What landed: `next` in `tooling/scripts/review-ledger.mjs`, three tests in `tooling/scripts/review-ledger.test.mjs`, one paragraph in `.agents/playbooks/api-review.md` and one row in `AGENTS.md`'s rules table. Nothing is committed.

Proof: the in-flight test failed on the unchanged script, returning the in-flight scope (`docs/plans/artifacts/review-ledger-wip/test-before-a1.log`). On the final bytes the three new tests pass with the other 38 (`test-final-a4.log`), and each fails on its named assertion when its guard is removed in a detached worktree (`mutations-a4.log`). The uncommitted-members test failed first on the script without it (`uncommitted-before-a1.log`). On this checkout's plans, the old `next` returns `documents` and the new one returns `pagination`. It lists `autocomplete`, `documents`, `markdown` and `proof` under `inFlight`, each with its building, awaiting or blocked plan (`next-before-a1.log`, `next-after-a2.log`, `next-checkout-a2.log`). Type-aware lint and the formatter are clean on both files (`lint-a2.log`). comment-sicko cut the JSDoc to its one true reason (`comment-sicko/answer.md`). The first correction's case is inferred, not replayed. That `next` offered `accessibility` while `docs/plans/2026-10-06-accessibility-announcement-host.md`, which names it in `review_scopes`, sat uncommitted in another session, and its decision rows at 10:53 to 10:55 show it getting ready for its panel. The new `next` skips such a scope, but no copy of that plan's Status at that moment survives.

Limits: the 14-day window is a judgment. The `pagination` plan, blocked since 2026-09-15, falls outside it, so `next` offers `pagination` though no one released it; say "blocked holds" to make blocked plans claim their scope at any age. Judging the listed uncommitted files stays rule-only.

### Reflect

The session's second reflect covered the build and this correction. Three Opus reviewers and an Opus synthesizer (`docs/plans/artifacts/review-ledger-wip/reflect/synthesizer/answer.md`) produced 16 accepted lessons, 15 rejected and 12 backlog items. One local lesson is applied: the zsh bullet in `~/.claude/CLAUDE.md` now warns that `$C:path` applies a modifier, so a revision path is written `"${C}:path"`. The other 15 accepted lessons change the shared pstack block or its helpers, so they run through `sync-pstack` Lesson mode in dotai, with one panel on those that change a gate. They include:
- building a cheap backlogged mechanism in the same run;
- treating a reviewer-caught rule-only repeat as a correction;
- a ways-to-pass row that blocks the gate;
- shared helpers for mutation proofs, proof logs, subagent replies, proof worktrees and batch row appends;
- checks that cited paths exist and that a partial step's box stays open;
- a re-read helper behind a compaction hook;
- checking a new baseline against the run's intake base;
- a lesson binding the lead from the moment it is written;
- the type system as a grammar too large to list;
- naming recreated page links under Needs you;
- a start gate that checks another plan's proof, not its Status.

The rejected and backlog lists, with their reasons, are in the synthesis file.

### Attention

reviewed by gpt-6.1-sol

- **2026-10-06T18:21:18Z, “Require recent activity before a plan claims its scope.”** The 14-day cutoff proves age, not abandonment. It makes `pagination` eligible despite an explicitly blocked plan. Line 5996 also shows pagination source committed that day. “Pagination is clear” at line 6000 exceeds the evidence: its members are clean, but ownership has not been released. The plan acknowledges this risk, but the owner should assess the cutoff.

- **2026-10-06T18:21:18Z, “Fix the repeated in-flight recommendation in review-ledger.mjs next, the highest level that works.”** Uncommitted work without a plan still depends on an agent remembering a rule. The run gives no evidence that checking those members inside `next` is impractical. This leaves part of the corrected mistake class unenforced and weakens the “highest level” claim.

- **2026-10-06T18:24:46Z, “Acceptance on the final bytes after the comment pass and lint.”** The mutation receipts show one failed test per guard, but omit the assertion failure and its cause. The helper shown at line 5943 prints results without asserting the expected failure or failing when a mutation survives. These receipts support that tests failed; they provide weaker evidence that each failed for its named defect.

- **Transcript line 5984.** The earlier `documents` recommendation was corrected in the React plan’s Markdown. No subsequent render, publication or corrected final reply appears before line 6008. The source correction is complete; updating the page the owner received remains a hand-back step.

The lead's answers, each logged as a row: blocked plans are your call through the Defaults row; `next` now lists the offered scope's uncommitted member files, so that check no longer rests on memory; the mutation receipts now print each failing assertion (`mutations-a4.log`); the React plan and page carry the corrected next item.

## Open work

- The 15 accepted reflect lessons landed through `docs/plans/2026-10-06-reflect-lessons.md`, except lesson 9's partial-proof check, which waits there as an unreviewed patch. owner: zbeyens; stop: that patch lands or is dropped; tracked: `docs/plans/topics/correct.md`.
