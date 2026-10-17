# Markdown filters inside marks

Status: blocked, waiting for one approval from the admin team
Playbook: babysit

## Brief

### What will change?

The contribution fixes filtering inside bold, italic and strikethrough. Review and local checks passed, and this run approved the held CI workflows. Full CI is green. GitHub still requires one admin approval.

### What could go wrong?

Callers with a list of allowed types must include text to keep marked text. The contribution documents this effect. This run found no repair to make and left the contributor's commits and description intact.

## Teach

Markdown imports turn a parsed document into editor nodes. A caller can exclude node types, admit only selected types or supply a custom filter.

Ordinary containers already filter their children. The mark converter skipped that check, so a link excluded outside bold could survive inside bold. The contribution calls the same filter before converting each child of a mark.

## Main changes

- Keep the contributor's direct use of the existing filter. Preserve its return type and the three mark rules.
- Recheck the issue reproduction, nested marks, allowed text and the package checks.
- Compare plate-2 for relevant ownership lessons without moving this Slate package to a different engine.

## Plate-2 comparison

Plate-2 accumulates marks and sends their children through one common converter. This avoids a separate traversal skipping shared checks. Its Markdown API differs from this Slate package, so it is an ownership lesson rather than a fix to copy.

The contribution already uses the existing node filter and preserves the mark rules' return contract. A traversal refactor would enlarge this fix without resolving another confirmed defect.

## Redo

| Unit | Producer | Level | Verdict |
| --- | --- | --- | --- |
| Implementation and tradeoff | Contributor's AI assistant | Unknown | redo, inspect current source and consumers |
| Reported test results | Contributor's local checkout | Unknown source environment | recheck on the PR commit |
| Public issue acceptance criteria | Issue 5142 | Not a model judgment | reuse as the reported contract |

## Steps

- [x] Resolve the contribution, linked issue and review threads. Proof: GitHub PR 5185 and issue 5142 read on 2026-10-17.
- [x] Run the unmodified package suite. Proof: artifacts/babysit-markdown-filters/pr-markdown-baseline-a1.log.
- [x] Recheck the defect against the pre-fix source and inspect plate-2. Proof: artifacts/babysit-markdown-filters/base-regressions-a2.log and pr-regressions-a1.log; the plate-2 converter and composition test were read directly.
- [x] Finish the code quality review and any justified repair. Proof: artifacts/babysit-markdown-filters/code-quality-review.md; no repair justified.
- [x] Verify the final candidate and identify GitHub's merge verdict. Proof: artifacts/babysit-markdown-filters/pr-markdown-final-a1.log, pr-markdown-types-a2.log and final-forge-state-a1.log.
- [ ] Obtain the required admin approval. owner: an authorized member of udecode/admin; stop: GitHub records the required approving review on PR 5185.
- [x] Finish the record and remove this run's disposable checkouts. Proof: the plan and decision log pass their checks; git worktree list confirms both proof checkouts were removed.

## Verification

- The contributor's PR commit passes 312 Markdown tests and the focused typecheck with an independent install and built dependencies. All three regression tests fail without the fix and pass with it.
- Nested-mark and text-omission probes pass. Biome accepts both changed TypeScript files. No browser was needed for this headless conversion defect.
- [Full CI](https://github.com/udecode/plate/actions/runs/39005346304) passed workflow checks, lint, package typechecks, fast tests, slow tests and the slowest lane. Changeset policy also passed.

## Needs you

GitHub requires one approval from the udecode/admin team. The review request is already assigned to that team. The PR has no unresolved review threads, and its head merges cleanly into main. The watcher reports a merge blocker until the required approval arrives.

This run does not submit a public review or merge the PR. The repository requires explicit authority for those actions.

## Reflection

Accepted: none. Rejected: duplicate guidance about focused test flags and linked dependency declarations.

Backlog: teach babysit status to identify fork workflows held for approval. The initial check rollup omitted those runs and the watcher described the blocked state as branch protection. The task is tracked in the suggested-task ledger.

## Close

The production fix and three tests are sound. No code, test, changeset or documentation repair was required. This run approved three held workflow runs and made no commits, pushes, PR comments, reviews or merges.

The first local typecheck read declarations through links to the main checkout and failed. An independent install and package build resolved the failure, and the same focused typecheck then passed. A temporary probe initially expected an empty paragraph; the actual importer returns an empty document when all text is excluded. Its corrected assertion passed, and the temporary file was removed before the final 312-test run.

The package proof, red-before-fix control, plate-2 comparison, writing passes and code-quality review are complete. GitHub's required admin approval remains open. Model effort could not be attributed reliably from this app's transcript discovery, so the record makes no model-level claim.

Both proof checkouts were removed. The original checkout's branch and unrelated workflow work remain intact. This report and its decision log are local records. No additional PR was needed for a contribution that required no repair.

The 21-item task list closes with 18 completed items, two skipped steps and one blocked approval. There are no partial items. The skipped steps are a CI retrigger that was unnecessary and delivery of a source repair that was not needed.

## Open work

- Required review on [PR 5185](https://github.com/udecode/plate/pull/5185). owner: an authorized member of udecode/admin; stop: the required approving review is recorded by GitHub. Tracked on the PR.
- t_fc82935c Identify held fork workflows in babysit status. owner: the owner; stop: started or dismissed. Tracked in docs/plans/suggested-tasks.decisions.tsv.
