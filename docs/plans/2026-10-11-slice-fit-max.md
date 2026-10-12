---
review_scopes: []
work_kind: implementation
---

# Slice fit over a parent's max

Status: fixed; waits on your commit
Page: https://claude.ai/artifact/7wkMoAeff6n9vrhLHHTbFj
Playbook: bug-fix

`tx.slice.replace` threw `EditorSchemaValidationError: Editor element "maxTwoBox" at [0] allows at most 2 children.` when a replacement would give a parent more children than its schema `max` allows. AI Replace hit it through `ai.api.replaceSelection` on a box declared with `max: 2`, holding two paragraphs, when a two-paragraph answer replaced all of the first one. The fitter accepted a candidate that split the target paragraph and added a block next to it. That candidate's admission check only balanced its tokens and never read the parent's content program. Outside a transaction the fitter's draft validates its own result, so `read.slice.fit` refused the same input. Inside one the draft defers validation to the transaction, so the fit claimed success and the commit threw. The same gap let marked text into an element whose text content allows one leaf throw `allows at most 1 children`. The fitter now refuses both writes and returns `false`, which leaves the document unchanged. The defect predates the AI list landing work. The reporter's log shows it at `73a6a0e6`, and it reproduces at `HEAD`.

## Main changes

- `isStructurallyApplicable` in `packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` admits every candidate the fitter selects among: local, structural and positional. It now tracks a child count for each open level while it scans a relative candidate's tokens, root first. Each count starts from the children up to and including the one that holds the candidate's start (`getChildCountsThrough`). It grows by one for each node the insert opens at that level, is checked when the insert closes that level, and, for a level still open at the end, adds the children after the one that holds the candidate's end. A count over the content program's `max` rejects the candidate before selection, so the selector moves on to the next candidate and refuses only when none fits. The count covers block containers. A program that allows text is skipped here, because construction merges equal text leaves after selection.
- After canonical construction, `fit` checks, for programs that allow text, the parent that holds the edit's start and, when the fitted selection maps, the parent that holds it. A parent over its `max` there makes the fit return `false` before anything is applied. This reads the constructed result instead of copying construction's merge rules.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| When the new content won't fit the box | Nothing changes, and you get false back | Push the extra blocks out of the box | lift overflow | small |
| When to count the text in a line | After the editor joins matching text | Count up front with a copy of the joining rules | count text early | detail |
| Release note | A short patch note for plitejs | No note | drop changeset | detail |

## Close

What landed, uncommitted in the working tree on `next`:

- `packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts`. Another session has uncommitted work in the same file. Its diff against the pre-edit copy in the run directory (`pre-edit/compiled-slice-fitter.ts`) holds only this fix's hunks.
- Four tests after `publishes nothing when transactional slice fitting declines` in `packages/plitejs/test/slice-fit-contract.test.ts`, on one shared `ParentMaximumSchema`. Two refuse: the reporter's two-paragraph open slice over all of `One` in a max-2 box, and bold text into a one-leaf `line`. Two must still land: a cross-block range that fills a max-2 root to exactly two, and plain text into a one-leaf `line`.
- `.changeset/slice-replace-content-max.md`, a `plitejs` patch note.

Deviations and reversals first:

- The first count also counted text leaves under text programs. A probe caught it refusing a plain paste into a one-leaf code line, which the old code landed in-line. The count now skips text programs, and a must-accept test pins that paste.
- A first perf probe (`perf-probe-a1.log`) disabled only the final comparison, so both arms ran the counting. `perf-probe-2` replaced it with an arm that runs the pre-fix scan verbatim.
- The marked-text case surfaced after the first round of writing passes and acceptance. It reran deslop, no-comments, lint and the full acceptance.

Proof and its limits:

- The repro runs on the package API. Before the fix, the box test fails with `Editor element "box" at [0] allows at most 2 children.` on the working tree (`red-test-a1.log`), and the line test fails with `Editor element "line" at [0] allows at most 1 children.` (`red-text-leaf-a1.log`). On `HEAD` with only the tests applied, both fail the same way, and the two must-land tests pass (`f2-head-red-a1.log`).
- The reporter's AI Replace probe on the working tree no longer throws, and the box keeps `One` and `Two` (`f2-plate-ai-probe-a1.log`). AI Replace returns nothing when the fitter declines, so the owner sees no change and no error.
- On the final bytes, the slice suites pass 169 tests, the plitejs Bun lane 3434, the plitejs React lane 1443, and the plitejs typecheck 13 of 13 partitions (`f2-*-a1.log`). `HEAD` with only this fix's patch typechecks and passes the same slice suites (`f2-head-acceptance-a1.log`). `pnpm lint:task` on the two files reports nothing (`lint-task-a3.log`).
- The platejs source suite passes 2992 and fails one code-drawing Graphviz interop test. It passes alone and fails the same way with this fix's two files at their pre-edit copies, so it is not from this fix (`platejs-control-a1.log`, `platejs-candidate-a1.log`).
- Five mutants on a frozen commit of the final bytes each fail their named test: dropping the open-level check, dropping the replaced-sibling accounting, counting text leaves before construction, dropping the text-leaf refusal, and refusing a text parent at exactly its `max` (`mutate/`).
- A differential ran eight probe sets with the pre-fix scan and no text check against the final code. Every line that changed was a commit-time throw that became a refusal. Code-line, line, vacated-slot and type-repair outputs did not change (`diff3-*.out`).
- Cost: no measurable difference. Pasting 2000 and 10000 open paragraphs, 15 interleaved pairs each, gave a median paired delta of 1.59 ms and 4.51 ms against budgets of 5.85 ms and 31.98 ms, with per-pair ranges of -2.4 to 4.8 ms and -28.4 to 38.1 ms. A planted slowdown failed both budget lines. Canonical construction takes most of the paste, 408 of 858 ms for 10000 blocks, and the new count runs once over the insert's tokens (`f3-perf-probe-a1.log`, `limiter-probe.ts`). Host load was 1.9 to 3.6 on 18 cores. The probe runs the model API, not a browser paste.
- `canPlaceAt` in `editor-schema.ts` checks `max` on decoded nodes. These candidates are relative token runs that close and reopen the target's ancestors, so they cannot decode into nodes, and the count reads the same content program instead. The public JSDoc of `tx.slice.replace` already says it returns `false` without mutating when the schema cannot fit a well-formed slice. The fix makes the code keep that promise, so no doc changes.
- Not proven: a comment-sicko side finding says construction can fill a prefix slot that the change vacates, which would add a block after the early count. Five vacated-slot shapes did not overflow (`probe-vacated-a1.out`), so this rests on a read of `content-completion.ts`.

Counts: 22 items, 15 done, 0 partial, 7 skipped, 0 blocked and 0 open. The skips are `diagnose`, because the request asks for the fix; `architect`, because both checks stay inside `fit` and change no function's contract; the commit and the PR, because the owner commits and asked for no PR; the panel, because a bug fix with no PR and no public API change is not on the reviews list; the decision-trail review, because this was one attended session whose log holds no panel finding; and reflect, because no one corrected the workflow. The todo list (`todo.md`) was written at the close, not kept live during the run.

Open work, tracked here:

- A block added by construction into a vacated prefix slot is not counted before selection. owner: zbeyens. stop: a repro of that overflow, which then gets a post-construction block check, or the owner drops it.
