---
date: 2026-05-07
topic: slate-v2-core-structural-delete-normalization
status: slate-ralplan-done
score: 0.94
completion: .tmp/completion-checks/slate-v2-core-structural-delete-normalization-ralplan.md
owner: .tmp/slate-v2/packages/slate
---

# Slate v2 Core Structural Delete And Normalization Ralplan

## Verdict

Next bucket: `v2-core-engine`, narrowed to structural delete, merge/split
barriers, and normalization fixpoint proof.

This is the right next lane. History/undo is already closed for the first proof
slice. DOM selection has the browser fixes. Clipboard has the range operation
and paste/cut substrate. The remaining high-leverage core pressure is the
place where those features all still meet: delete a model range, repair
structure, normalize deterministically, and keep selection inside valid content.

Do not jump to virtualization, Android raw-device proof, or custom operation API
validation before this. That would be chasing newer noise while the core
delete/normalize owner still has old open issues with exact, testable repro
shapes.

## Execution Update

Ralph execution started on 2026-05-07.

Current result:

- `Fixes #4121`: focused core proof deletes only the selected formatted leaf
  window.
- `Fixes #2500`: focused core proof resets full-document delete over list-heavy
  content to one empty editable paragraph.
- `Fixes #3965`: focused core proof Backspaces across an empty same-mark block
  start without deleting both sides.
- `Fixes #3950`: focused core proof rechecks a node transformed during custom
  normalization until later normalizers reach fixpoint.
- `Improves #5811`: focused core proof turns custom normalization oscillation
  into a deterministic fixpoint diagnostic.
- `Improves #1654`: existing schema `isIsolating` now blocks collapsed Backspace
  and direct `mergeNodes` across protected containers. Split-specific closure is
  still unclaimed.

Implementation:

- `.tmp/slate-v2/packages/slate/src/transforms-text/delete-text.ts`
- `.tmp/slate-v2/packages/slate/src/transforms-node/merge-nodes.ts`
- `.tmp/slate-v2/packages/slate/test/delete-contract.ts`
- `.tmp/slate-v2/packages/slate/test/normalization-contract.ts`
- `.tmp/slate-v2/packages/slate/test/transforms-contract.ts`

Verification so far:

```bash
bun test ./packages/slate/test/delete-contract.ts ./packages/slate/test/normalization-contract.ts ./packages/slate/test/transforms-contract.ts
bun --filter slate typecheck
```

## Why This Is Next

Current completed evidence:

- `.tmp/completion-checks/slate-v2-core-history-selection-undo-execution.md`
  records #3534/#3551/#4559 as exact fixed claims and #3705/#3921 as improved.
- `.tmp/completion-checks/slate-v2-dom-selection-boundary-proof-ralplan.md`
  records the DOM/browser boundary fixed claims, including #6034 and #3991.
- `.tmp/completion-checks/slate-v2-range-delete-replace-children-ralplan.md`
  records `replace_children` as the child-window operation for large range
  delete, history, refs, and collab.

Gitcrawl pressure:

- #4121: expanded delete over-deletes text before the selected window.
- #2500: rich-text select-all delete leaves list structure behind.
- #3965: deleting across an empty marked text boundary removes text that should
  merge.
- #5811: custom normalization and default normalization can oscillate.
- #3950: a node transformed during normalization must be considered again until
  the editor reaches a fixpoint.
- #1654: tables/title-like containers need a way to prevent merge/split/delete
  from crossing their structural boundary.
- #2643/#2355: users ask for schema veto and selection normalization hooks, but
  the better v2 answer is transaction-level validation and internal selection
  projection, not new public escape hatches in this lane.

Live source owners:

- `.tmp/slate-v2/packages/slate/src/transforms-text/delete-text.ts:89` already has
  same-mark adjacent text merge helpers.
- `.tmp/slate-v2/packages/slate/src/transforms-text/delete-text.ts:186` owns the
  post-delete structural cleanup that just had to stop deleting nested blocks.
- `.tmp/slate-v2/packages/slate/test/delete-contract.ts:105` already proves
  Backspace after a table keeps row lengths `[4, 4, 4]`.
- `.tmp/slate-v2/packages/slate/src/editor/normalize.ts:79` owns dirty normalize
  passes, mutation-version iteration, and loop detection.
- `.tmp/slate-v2/packages/slate/src/core/normalize-node.ts:238` owns default
  block/inline child repair and direct-child operation targeting.
- `.tmp/slate-v2/packages/slate/src/transforms-node/merge-nodes.ts:147` still
  calls `shouldMergeNodesRemovePrevNode`, which is exactly the kind of
  standalone legacy-shaped policy that should collapse into the structural
  boundary model if this lane needs a real merge rule.

Institutional warning:

- `docs/solutions/logic-errors/2026-05-06-slate-v2-delete-cleanup-must-not-remove-valid-nested-empty-blocks.md`
  says broad post-delete cleanup corrupted table cells. The next work must
  assert structure shape, not only text, and must not reintroduce whole-document
  cleanup that cannot prove it only removes artifacts created by the current
  operation.

## Intent And Boundary

Intent:

- Make range delete, Backspace/Delete, merge/split, and normalization converge
  on one deterministic core model.
- Prove old Slate bugs by issue-shaped package tests before claiming anything.
- Add internal structural boundary policy only if the tests prove a generic
  policy is needed.

Outcome:

- A Ralph execution pass with red tests first, narrow core patches second, and
  exact claim sync third.
- No public API expansion unless implementation proof forces it.

In scope:

- `.tmp/slate-v2/packages/slate/src/transforms-text/delete-text.ts`
- `.tmp/slate-v2/packages/slate/src/transforms-node/merge-nodes.ts`
- `.tmp/slate-v2/packages/slate/src/transforms-node/split-nodes.ts`
- `.tmp/slate-v2/packages/slate/src/transforms-node/remove-nodes.ts`
- `.tmp/slate-v2/packages/slate/src/editor/normalize.ts`
- `.tmp/slate-v2/packages/slate/src/core/normalize-node.ts`
- core tests under `.tmp/slate-v2/packages/slate/test/**`

Non-goals:

- No public `normalizeSelection`.
- No public schema-veto API for arbitrary operation rejection in this pass.
- No table/list product command layer in raw Slate core.
- No custom operation extensibility fix for #5977 in this lane.
- No browser/mobile fixed claim from package-only proof.

Decision boundary:

- If a bug is model-only, fix and prove it in package tests first.
- If a repro depends on DOM/native browser behavior, keep it `Related` until
  browser proof exists.
- If a behavior is table/list-specific product UX, expose only the raw structural
  substrate in core and leave product commands outside raw Slate.

## Issue Routing

| Issue       | Current decision                     | Why                                                                                                                                      |
| ----------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| #4121       | target exact proof                   | Expanded delete must not remove content before the selected range. This belongs to delete planning and selection placement.              |
| #2500       | target exact proof                   | Select-all delete over list structure is the same structural reset problem as range delete, not a React toolbar problem.                 |
| #3965       | target exact proof                   | Same-mark text around empty leaves should merge, not disappear. Current source has merge helpers, so this may already be done; prove it. |
| #5811       | target exact proof or improved claim | Current normalize loop detection is promising, but exact wrap/unwrap oscillation needs a dedicated custom-normalizer fixture.            |
| #3950       | target exact proof or improved claim | Mutation during normalization must cause another pass over dirty entries until fixpoint.                                                 |
| #1654       | architecture target                  | The likely core primitive is an internal `isIsolating` structural boundary policy, not table-specific logic.                             |
| #2643       | related, not public API              | Reject public schema veto for now. A future transaction validation hook is valid only after core transforms are deterministic.           |
| #2355       | related, not public API              | Selection repair belongs at commit/projection boundaries, not a public `normalizeSelection` hook.                                        |
| #5972       | repro-first candidate                | Inline input delete may fall out of the same delete boundary rules, but it needs current inlines/browser proof before any claim.         |
| #5977       | excluded from this lane              | Custom operation validation is an API/extensibility lane, not structural delete/normalize correctness.                                   |
| #3964/#3973 | excluded from this lane              | InsertBreak and word movement are core caret/movement bugs, but they are not the next structural delete/normalize owner.                 |
| #3891       | related                              | Multi-node remove pressure is represented by `replace_children`, but public helper semantics need separate proof.                        |

## Decision Brief

Principles:

- Core transforms must be model-deterministic before React/browser layers repair
  anything.
- Structure rules must be schema/runtime policy, not table names hard-coded into
  delete logic.
- Normalization should converge by dirty entries and mutation evidence, not by
  scanning the full document after every keystroke.
- Public hooks are a last resort. They fossilize runtime internals.

Drivers:

- Exact open issue pressure is stronger here than in the next performance or API
  lane.
- The table-backspace regression proves local cleanup heuristics can silently
  corrupt valid nested structure.
- ProseMirror has a proven editor primitive for this: isolating nodes.
- Lexical proves the right normalize shape: dirty node sets, transforms, and a
  bounded fixpoint loop before DOM reconciliation.

Options:

| Option                                                | Verdict                 | Reason                                                                                                         |
| ----------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| Keep current standalone heuristics                    | Reject                  | `shouldMergeNodesRemovePrevNode` and broad cleanup helpers will keep accumulating special cases.               |
| Hard-code table/list behavior                         | Reject                  | Raw Slate should not ship product schema assumptions.                                                          |
| Add internal `isIsolating` structural boundary policy | Choose if tests need it | This matches ProseMirror's battle-tested concept while staying unopinionated.                                  |
| Add public schema veto / normalizeSelection now       | Reject                  | These are escape hatches. They do not solve the core deterministic transform problem.                          |
| Move everything to extension commands                 | Reject for core bugs    | Tiptap-style commands are good for product behavior, but core delete and normalization must be reliable first. |

Chosen shape:

```txt
transaction delete plan
+ range/point refs
+ structural boundary policy
+ dirty normalize pass
+ explicit newSelection
+ exact operation stream
```

If `isIsolating` lands, keep it internal first:

```ts
schema: {
  isIsolating?: (element: Element) => boolean
}
```

Then use it only at transform boundaries:

- Backspace/Delete across block boundaries;
- `mergeNodes`;
- `splitNodes`;
- range delete cleanup;
- paste/cut only through shared delete/insert plans.

Do not expose public docs for it until tests prove the semantics are stable.

## Ecosystem Synthesis

Lexical:

- Steal: dirty node sets, transform-before-reconcile discipline, update/read
  boundaries, and fixpoint thinking.
- Reject: Lexical's node-class model as Slate's public API.

ProseMirror:

- Steal: `isolating` node behavior for boundaries that join/lift/delete should
  not cross, plus transaction mapping through structural changes.
- Reject: full schema-first content fitting as raw Slate's first public contract.

Tiptap:

- Steal: product-specific list/table behavior belongs in extensions/commands.
- Reject: making raw Slate core a product command DSL.

Typora-style editor behavior:

- Steal: destructive commands are context-specific around tables/code/math-like
  regions.
- Reject: context behavior hidden in ad hoc keydown patches.

## Ralph Execution Plan

### Phase 1: Red Package Tests

Add issue-shaped tests before code changes:

- `delete-contract.ts`: #4121 expanded delete over marked leaf boundary deletes
  only the selected text.
- `delete-contract.ts`: #2500 select-all delete on list-rich content resets to
  the expected editable root, not an orphan list shell.
- `delete-contract.ts`: #3965 Backspace/Delete around empty same-mark text merges
  text instead of removing both sides.
- `delete-contract.ts`: keep the existing table-backspace `[4, 4, 4]` row count
  assertion green.
- `normalization-contract.ts`: #5811 custom normalizer wrap/unwrap conflict
  exits deterministically with a clear error or reaches fixpoint when the custom
  normalizer is corrected.
- `normalization-contract.ts`: #3950 node transformed during normalization is
  reconsidered until all plugin/default normalizers agree.
- `transforms-contract.ts`: #1654 cannot merge/split across an internal
  isolating boundary if the red test proves current behavior crosses it.

### Phase 2: Narrow Core Fixes

Patch only the owner that fails:

- Prefer `delete-text.ts` for range planning, adjacent text merge, structural
  artifact cleanup, and `newSelection`.
- Prefer `normalize.ts` for dirty-pass iteration, mutation-version scheduling,
  and loop diagnostics.
- Prefer `normalize-node.ts` for default inline/block repair.
- Prefer `merge-nodes.ts` / `split-nodes.ts` only when #1654 proves crossing
  structural boundaries is the root cause.

Hard cuts:

- Do not re-broaden `removeEmptyStructuralArtifacts`.
- Do not add table/list names to core.
- Do not add a public `normalizeSelection`.
- Do not add a public schema veto.
- If `shouldMergeNodesRemovePrevNode` needs semantic expansion, replace it with
  the structural boundary policy instead of growing that legacy-shaped method.

### Phase 3: Claim Sync

After tests are green:

- Claim `Fixes` only for exact package or browser repro proof.
- Move exact package-only wins to `Fixes` only when the original issue is
  model-level and does not require browser proof.
- Keep #5972 `needs-repro` unless a current browser/inlines test proves it.
- Keep #5977 outside this lane.
- Update the coverage matrix, fork issue dossier, PR reference count, full
  issue-ledger execution plan, and completion checkpoint.

### Phase 4: Verification

Run the smallest meaningful proof first:

```bash
cd .tmp/slate-v2 && bun test ./packages/slate/test/delete-contract.ts ./packages/slate/test/normalization-contract.ts ./packages/slate/test/transforms-contract.ts
cd .tmp/slate-v2 && bun --filter slate typecheck
cd .tmp/slate-v2 && bun lint:fix
```

If #5972 becomes browser-owned:

```bash
cd .tmp/slate-v2 && bun test:integration-local --grep "inlines"
```

If #1654 lands a structural boundary:

```bash
cd .tmp/slate-v2 && bun test ./packages/slate/test/delete-contract.ts ./packages/slate/test/transforms-contract.ts ./packages/slate/test/collab-history-runtime-contract.ts
```

## Maintainer Objections

| Objection                                   | Answer                                                                                                                                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "This is just table behavior."              | No. #1654 explicitly names tables as one example of a general isolated-container rule. Core should expose a structural policy, not table logic.                                                         |
| "Selection normalization should be public." | Not yet. Public `normalizeSelection` lets app code repair symptoms after commands. v2 should make commit selection valid by construction first.                                                         |
| "Schema veto is cleaner."                   | Premature. A veto layer is useful only after core transforms have deterministic dry-run or validation metadata. Otherwise it is just another inconsistent interception point.                           |
| "Why not fix #5977 now?"                    | Custom operation validation is real, but it is an API/extensibility contract. Mixing it into delete/normalization would blur the owner and produce a worse plan.                                        |
| "Why use ProseMirror's `isolating` idea?"   | Because it is the exact established primitive for table cells and other content islands where join/lift/delete should not cross. Slate can use the concept without adopting ProseMirror's schema model. |

## Implementation Skill Notes

- `clawsweeper`: applied. Used gitcrawl doctor, targeted threads, and neighbors
  for #4121/#5811 plus related issue pressure.
- `learnings-researcher`: applied. The table-backspace solution note blocks
  broad nested-block cleanup.
- `planning-with-files`: applied through this `docs/plans` file.
- `tdd`: required for Ralph execution. This lane must begin red.
- `performance`: skipped. This lane is correctness-first; #5992 remains an
  improved performance row from the range-delete plan.
- `react-useeffect` / React runtime review: skipped. React does not own this
  core model path.

## Score

- corpus fit: 0.96
- live source grounding: 0.95
- ecosystem evidence: 0.93
- execution specificity: 0.94
- issue-claim restraint: 0.96
- public API restraint: 0.95

Final score: `0.94`.

## Next Ralph Target

Run:

```txt
[$ralph](/Users/zbeyens/git/plate-2/.agents/skills/ralph/SKILL.md) docs/plans/2026-05-07-slate-v2-core-structural-delete-normalization-ralplan.md
```

First execution target:

```txt
red issue-shaped core tests for #4121, #2500, #3965, #5811, #3950, and #1654;
then patch only the failing owner; then sync issue claims.
```
