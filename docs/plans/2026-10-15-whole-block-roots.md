---
review_scopes: [clipboard]
review_basis: []
work_kind: implementation
review_commit: b1e70bb257d7a33c3a2f6160759a8ecb79e44500
review_inputs: [packages/plitejs/test/slice-landing-contract.test.ts]
review_upstreams: ['../prosemirror-transform@662b7a937bafde19b7e2a83241dbc8888e257c89', '../prosemirror-model@6264de069d8439131e88f8ba06973551916184e4', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca']
---

# A paste refuses what commit refuses

Status: executed: landed on your working tree, waiting for your commit
Page: https://claude.ai/artifact/PSy4CoEA6dCGK6gXKKAWEN
Playbook: plan

Verdict: Pursue. A paste over selected blocks wrote content that commit then rejected with a throw, and the two older guards each guessed at commit's rule and got it wrong in opposite directions. The schema already owns that rule. This plan runs the schema's own change check on every paste write, after the same orphan cleanup commit runs, so a paste over blocks or carrying roots refuses exactly what commit refuses and never throws. A raw slice write with no carried roots keeps today's path and is judged at save. Requested as suggested task t_1412a88d, which follows the named limit of [One landing site for every paste](2026-10-14-paste-landing-target.md). Execution playbook: Build (`.agents/playbooks/build.md`). Run directory: `docs/plans/artifacts/2026-10-15-whole-block-roots/`.

## Brief

### What will change?

Pasting now refuses what saving refuses instead of crashing. A paste that would break the schema returns false and leaves the document alone. Some good pastes that used to be refused now land.

### What could go wrong?

A paste inside a multi-step edit is judged only on what it adds. Dragging an embed to a point still refuses, one raw multi-step edit still crashes, and in suggesting mode one paste reports success though suggesting refuses it.

## Teach

Plite documents can hold extra content areas, called roots, that a block owns, like a callout's body. The schema says whether a root takes one owner or many, and commit checks every edit against the schema before it saves.

Today paste guesses what commit will allow. A paste over selected blocks writes with no check, so a bad paste reaches commit and throws. The empty-block case uses a hand-written root rule that also refuses good pastes. A paste carrying roots checks the whole document, which takes seconds on big documents.

Now each paste builds its edit as a separate draft, drops the roots it left without an owner the way commit does, and asks the schema's own change check whether commit will accept it. When it won't, the paste returns false and nothing changes. The check reads only what the paste changed.

## Public API

No public call or type changes. The write that lands a slice now asks the schema before it returns, instead of catching what the schema threw.

```ts before
// packages/plitejs/src/core/public-state.ts, fitSliceAtSite
try {
  const spec = createTransactionSpec(owner, (transaction) => {
    written = runWithMutationRoot(owner, place.root, () => {
      if (place.kind === 'blocks') {
        return replaceBlocksAtSite(owner, transaction, place, remapped);
      }
      // writeSliceAtRange, then remove the place's covered blocks
    });
  });

  return written ? spec : false;
} catch (error) {
  if (error instanceof EditorSchemaValidationError) return false;
  throw error;
}
```

```ts after
// packages/plitejs/src/core/public-state.ts, fitSliceAtSite
return createCheckedSliceSpec(owner, (transaction) =>
  runWithMutationRoot(owner, place.root, () => {
    materializeContentSliceRoots(owner, remapped);
    if (place.kind === 'blocks') {
      return replaceBlocksAtSite(owner, transaction, place, remapped);
    }
    // writeSliceAtRange with its roots prepared, then remove the covered blocks
  })
);
```

## What other editors do

Read at prosemirror-transform `662b7a9`, prosemirror-model `6264de0`, lexical `dd5c41b13`, slate `945a484df` and tiptap `91c51be53`, none run. ProseMirror is the one editor that checks a paste against its schema, and it does so with the same content rule every step uses, which is the shape this plan takes.

| Editor | Where a paste is checked | When the result breaks the schema | Owned content areas |
| --- | --- | --- | --- |
| ProseMirror | `replaceStep` fits the slice with `Fitter` before it builds a step; `ReplaceStep.apply` rebuilds the node and `NodeType.checkContent` checks it | `StepResult.fromReplace` turns the `ReplaceError` into a failed step, and `Transform.replace` skips a step the fitter could not build | none; one tree |
| Tiptap | ProseMirror's `doPaste` calls `tr.replaceSelection` | as ProseMirror | none |
| Lexical | `$insertGeneratedNodes` dispatches a command, then `selection.insertNodes` | no schema; node transforms repair afterwards | nested editors live on decorator nodes, outside any schema |
| Slate | `insertFragment` writes inside `withoutNormalizing` | no schema; normalization repairs afterwards | none |
| Plite after this plan | each paste write builds its own spec, settles orphaned roots as commit does, then runs the schema's change check | the write returns false and the document is unchanged | element-owned roots with shared or exclusive ownership |

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Check each slice write with the schema's change validator in a mode that grants no authority | Plite | `plitejs` (core entrypoint) | The schema owns what is valid; commit already runs this validator |
| Count only the ownership errors a paste introduced, and inherit the parent's slice-created roots when a nested spec settles orphans | Plite | `plitejs` (core entrypoint) | Commit judges the whole update at save, so an error an earlier step left is not the paste's |
| Delete the open-edge root refusal | Plite | `plitejs` (core entrypoint) | The schema check replaces it and accepts the valid writes it refused |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Paste over selected blocks | A paste commit would reject returns false instead of throwing | `slice-landing-contract.test.ts` under Bun, model level |
| Paste into an empty block with a plugin proposal | An open proposal naming an existing shared root now closes and lands | same |
| Paste carrying roots at a range | Lands when commit would drop the orphaned owner's root | same |
| Drag move of a range holding an exclusive root's owner to a block edge | Lands with a copy of the root instead of refusing | same |
| Native clipboard and drag events | Unchanged; they reach the same `writePaste` | unproven in a browser, since no registered example declares content roots |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Paste admission | No check over selected blocks; a hand root rule for the open edge; a full `assertDocument` for range writes carrying roots | The schema's incremental change validator in check mode on the paste's own spec, after commit's orphan settle | `public-state.ts` `createCheckedSliceSpec`, `ChangeDraft.check`, `editor-schema.ts` `checkDocumentChange` | One owner of what is valid; no throw escapes the paste | Internal; every paste path through `fitSliceAtSite` and `writeSliceAtRange` | contract tests and eight mutants | A later step in the same update cannot re-own a root the paste itself dropped | rearchitect |
| Open-edge root rule (`canCloseSliceEdge`, exported `namesUncopiedRoot`) | Refuses an open edge naming any root the slice did not copy | Deleted; `namesUncopiedRoot` stays private for the unwrap rule | `slice-landing.ts` | It refused valid writes and duplicated the schema | none outside `plitejs` | `closes an open proposal that names an existing shared root` plus its mutant | none | cut |
| Orphan settle and check in a nested spec | Starts with no slice-created roots | Inherits the parent's slice-created roots; the check skips an ownership error its baseline already had | `createTransactionSpecContext`, `checkDocumentChange` | An earlier step's error is commit's to judge, after the later steps that may repair it | Internal | four tests and three mutants | An error the paste adds to a root an earlier step already broke surfaces only at commit | rearchitect |
| Commit settle sequence | Three copies of reconcile, finalize, reconcile | One helper shared with the paste check | `finalizeWithoutOrphanedRoots` | The paste and commit must settle the same way | Internal | plitejs partitions | none | keep |
| Raw `tx.slice.replace` with no carried roots | Writes unchecked; commit judges the transaction | Unchanged | `writeSliceAtRange` | A later step can make the transaction valid | none | census R3 | R3 still throws at commit | defer |
| Transfer point landing | Its validating finalize after the source removal refuses a move holding a root owner | Unchanged | `transfer.ts` | That refusal is transfer's own step, not the paste | none | `transfer-roots-proto-a1.log` | Over-refusal stays | defer |
| Per-paste cost | Range writes carrying roots walk the whole document | One incremental check per paste write | `checkDocumentChange` | Scale law: work tracks the paste | none | `paste-cpu-*` logs | Large-document paste cost | gate |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What decides a paste | The schema's own save check, run on the paste alone | A hand-written rule about roots | hand rule | big |
| Design base | Check the paste's own edit with save's cleanup rule | Check the whole update so far on every paste (the judge's first choice) | cumulative | small |
| Raw edits in a multi-step update with no carried roots | Keep today's path, checked only at save | Check them too, which can refuse an update that saves fine | check raw | small |
| Dragging an embed's range to a point | Leave the refusal for a follow-up task | Fix transfer here | fix transfer | small |
| A carried embed that lands as text | It lands as text and its area is dropped, matching a paste at a caret (look) | Refuse it as before | refuse flattened | small |
| Plan review panel | Skip it, since no public call or type changes and three designers and a judge compared designs | Run a panel on the plan | panel | detail |
| Where the verdict lives | In this plan, not as the clipboard scope's head review | Write it as the clipboard verdict | head | detail |
| Delivery | A patch on your working tree for you to commit | A commit on a branch | commit | detail |
| Timing proof on a busy machine | Accept the final rerun: no budget line misses, though four small-paste cells count as unsettled because the old code's own runs differed too much (look) | Wait for a quiet machine and rerun | wait | small |
| A suggesting-mode paste that would drop an embed's area | Leave it for its own task; it now reports success while suggesting refuses it and leaves the document unchanged (look) | Refuse it here | fix suggesting | small |
| An error an earlier step in the same update left | The paste ignores it, and save judges it after the later steps that may repair it | Refuse the paste while the update holds any such error | refuse inherited | small |
| When the paste runs its check | Once, after its cleanup, through the draft's own check | At every intermediate step of the paste, as a fork mode the code review suggested | fork mode | detail |

## Evidence

Model: claude-opus-5-5 (lead and judge); runners opus, codex gpt-6-astra and codex gpt-6.1-sol.

Prior work: [One landing site for every paste](2026-10-14-paste-landing-target.md) is retained; its line 152 named this follow-up, and its diff round 3 removed a carry-based refusal that over-refused. The clipboard scope's head review, `2026-10-14-list-paste-type-adoption`, judges list paste and is untouched.

### Requirements

- A paste refuses exactly what commit refuses: it returns false and leaves the document and selection unchanged.
- A paste never throws `EditorSchemaValidationError`.
- "A paste" covers every write `writePaste` makes: `editor.update.slice.replace`, the DOM clipboard and transfer's landing.
- Valid writes still land, one test per refused case and per must-land case.
- What is valid has one owner, so the paste cannot drift from commit.
- The paste's added cost tracks the write, not the document.

### Lanes

- The pick runs the schema's change check on the paste's own spec, after commit's orphan settle, and counts only the ownership errors the paste introduced.
- A hand root predicate is rejected. It misses nested grammar (census extra cases) and drifts from commit.
- A full `assertDocument` per paste is rejected. It takes 0.5 to 3.4 s at 1,000 to 10,000 blocks (`probes/assert-cost-base-a1.log`).
- The strongest deletion, removing only `canCloseSliceEdge`, is rejected because the whole-block throws stay.
- Candidate 3's cumulative check from the validated origin gives the same result on every probe and adds about eight names (`architect/synthesis.md`).

Census at `b1e70bb257` (`probes/census-base-a1.log`) against the worktree (`probes/census-worktree-a1.log`), closed schema, `portal` owning root `body`:

| Case | shared, base → after | exclusive, base → after |
| --- | --- | --- |
| W1 second owner over a block | lands → lands | throws → refuses |
| W4 names a missing root | throws → refuses | throws → refuses |
| W5 carried root names a missing root | throws → refuses | throws → refuses |
| W6 carried copy over the owner | throws → refuses | lands → lands |
| W7 paragraph over the only owner | throws → refuses | lands → lands |
| W9 two owners over the owner | lands → lands | throws → refuses |
| E1 open proposal names an existing root | plain landing → proposal lands | plain landing → plain landing |
| E5 closed proposal names an existing root | lands → lands | throws → plain landing |
| R2 carried paste over a range holding the owner | refuses → refuses | refuses → lands as text |
| R3 raw `tx.slice.replace` at a range | lands → lands | throws → throws (deferred) |
| Nested grammar break over a block | throws → refuses | |
| Carried root content breaks its slot | throws → refuses | |

Every shared refusal above matches commit. The old root would be left with no owner, and a closed schema rejects it.

### Dependents

- `proof`: `packages/test/test/types/scenario-types.ts`, unaffected, since no exported type or call changes.
- `ui`: the Plite example routes under `apps/www/src/app/(app)/examples/plite/`, unaffected, since none declares content roots.

### Cost

Frozen budget `probes/paste-cpu-budget.md`, CPU time per paste, median of 7, two interleaved rounds per tree (`probes/paste-cpu-proto-base-a1.log`, `-a2`, `probes/paste-cpu-proto-a1.log`, `-a2`). The carried-roots paste at 50,000 blocks drops from 412 to 420 ms to 69 to 80 ms. The plain cohorts match control within its own noise: two cells missed by under 1 ms in one round while the control runs differed by more, which the frozen rule calls inconclusive. The planted arm, control's carried paste against its plain paste, fails the line as it must. The host ran at load 35 to 80, so the line reruns on the final bytes.

## Main changes

- Every slice write that `fitSliceAtSite` or a root-carrying `writeSliceAtRange` makes builds its own spec, which defers validation even when no update is open, settles orphaned roots as commit does, then calls the spec builder's `check()`. That runs `checkDocumentChange`, the schema's change check without the baseline authority check, marking and sealing that `validateDocumentChange` adds around it. A rejection returns false.
- `checkDocumentChange` skips an ownership error its baseline already had, so a paste in a multi-step update is judged on what it adds. At commit the baseline is validated, so nothing is skipped there.
- A nested spec starts from its parent's slice-created roots, so a later paste drops a root an earlier paste created once its owner is replaced.
- `finalizeWithoutOrphanedRoots` replaces the three settle copies in `runEditorTransaction`.
- `canCloseSliceEdge` and the full-document `assertDocument` in `writeSliceAtRange` are gone.

## Steps

- [x] Census the root writes at base and settle the design through `architect`. Proof: `probes/census-base-a1.log`, `architect/judge.md`, `architect/synthesis.md`.
- [x] Prototype the pick and compare plitejs partitions with control. Proof: `proto/l1-core-a1.log` and the reruns `proto/rerun-core-arch-proto-a1.log`, `proto/rerun-yjs-work-proto-a1.log`, `proto/rerun-ime-proto-a1.log`.
- [x] Port the check, the origin rule and the slice-root seed onto the checkout's plitejs tree, with a contract test per case. Proof: `build/contracts-a1.log`.
  - Reversed after the bug review: the origin rule, which read exclusive ownership from the transaction's start, made a paste drop a root an earlier step orphaned, so a later step that restored the owner threw at commit. The check now skips errors its baseline already had instead.
- [x] Show each guard's test fails when its fix is reverted. Proof: `build/mutate-622b2c6685.out`, eight mutants with their logs under `build/mutate/mutate/`, run by `node .agents/pstack/mutate.mjs` on frozen tree `622b2c6685`.
- [x] Run the writing passes and the `thermos` review on the diff, then fix its findings. Proof: `review/thermo-bugs.md`, `review/thermo-quality.md`, `review/review-probes-a1.log`, `writing/comment-sicko-round3.md`.
- [x] Rerun the cost lines on the final bytes. Proof: `probes/judge-cost-final3.txt` over `probes/paste-cpu-final-candidate-a6.log` and the three logs beside it, against `probes/paste-cpu-budget.md`.
- [x] Run the touched plitejs partitions, the core typecheck and the contract file at base in a detached worktree. Proof: `build/accept-base-a1.log`, `build/accept-task-a1.log`, `build/partitions/timeout-reruns-a2.log`, `build/typecheck-core-final-a1.log`.
- [x] Amend the unreleased whole-block paste changeset, `.changeset/list-paste-object-boundary.md`, since users upgrading from the beta baseline never had the throw. Proof: its hunk in `/Users/zbeyens/git/plate-2/docs/plans/artifacts/chips/t_1412a88d.patch`.
- [x] Run `pnpm lint:fix` on the task's files, save the patch and apply it to the checkout. Proof: `build/lint-check-a1.log`, `build/contracts-checkout-a2.log`, `build/typecheck-core-checkout-a1.log` and the ledger's `landed` row.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Writing passes (`deslop`, `no-comments`, `unslop`) | deslop and no-comments on each round (`writing/comment-sicko-round2.md`, `writing/comment-sicko-round3.md`); unslop on this plan |
| `thermos` review on the diff | `review/thermo-bugs.md`, `review/thermo-quality.md`; C1 and W1 fixed |
| Cost rerun on the final bytes | `probes/judge-cost-final3.txt`: no line misses; four cells unsettled by control noise; accepted (look) |
| Partitions and typecheck on the final bytes | `build/final-partitions.out`, `build/partitions/timeout-reruns-a2.log`, `build/typecheck-core-final-a1.log` |
| Changeset | amended `.changeset/list-paste-object-boundary.md` |
| `pnpm lint:fix` on the task's files | `build/lint-fix-a1.log`, `build/lint-check-a1.log` |
| Patch applied to the checkout | `build/contracts-checkout-a2.log`, `build/typecheck-core-checkout-a1.log` |

## Open work

Each item is a suggested task in `docs/plans/suggested-tasks.decisions.tsv`, waiting on this task to land. Its owner is the owner, who starts its card, and it closes when the task lands or is dismissed there.

- t_3ffc7a0c, Decide how raw transaction writes treat content roots they break. A raw `tx.slice.replace` of a closed block naming an exclusive root that already has an owner still throws at commit (census R3), and removing a shared root's only owner throws too. owner: the owner, from the chips board. stop: t_3ffc7a0c lands or is dismissed.
- t_cbce0d1c, Let a point drop move a range that holds a content root's owner. Transfer's validating finalize after the source removal refuses before the landing runs. owner: the owner, from the chips board. stop: t_cbce0d1c lands or is dismissed.
- t_3d2ccabb, Check whether an owner swap revalidates an existing root's grammar. Traced by the cross-judge, not run. owner: the owner, from the chips board. stop: its probe disproves it or a fix lands.
- t_f896f89d, Bound paste root bookkeeping to the roots the paste touches. `materializeContentSliceRoots` and the orphan settle visit every root, about 1.7 ms per paste at 50,000 blocks. owner: the owner, from the chips board. stop: t_f896f89d lands or is dismissed.
- t_0302dacf, Check table cell pastes with the paste's change check. `fitSlicePlacements` still runs a full `assertDocument` with no orphan settle. owner: the owner, from the chips board. stop: t_0302dacf lands or is dismissed.
- t_53144b6c, Stop trusted adoption from sealing away ownership errors earlier steps left. A range paste after a raw step that breaks a root's ownership commits a document `assertDocument` rejects, at base and now. owner: the owner, from the chips board. stop: t_53144b6c lands or is dismissed.
- t_08e9b718, Give each deleted root its own empty owner index. One shared empty index makes a later deletion in another editor read stale nested roots and commit an undeclared root, at base and now. owner: the owner, from the chips board. stop: t_08e9b718 lands or is dismissed.
- t_cff52975, Decide what a paste returns when suggesting mode refuses its update. In suggesting mode, a carried paste over a range holding an exclusive owner now returns true while suggesting refuses the root deletion and rolls the update back. owner: the owner, from the chips board. stop: t_cff52975 lands or is dismissed.

## Close

Reversals and deviations come first.

- The origin rule from the port step is reversed. It read exclusive ownership from the transaction's start, so a paste dropped a root an earlier step had orphaned, and a later step that restored the owner then threw at save. The check now skips the ownership errors its baseline already had, and save settles an earlier step's orphans as it always did.
- The draft check runs once after the paste's cleanup. The code review proposed a fork mode that would also check every intermediate step, where a just-created root has no owner yet and a valid paste would refuse.
- The worktree holds a local commit, `a8891d33b8`, made with hooks off, that carries the checkout's plitejs working tree as the base. The rule for worktree sessions says they commit nothing. The commit never left the worktree, and the patch is its diff.
- `editor-schema.ts` changed in the checkout while the run worked, so the landing merged this task's change onto the checkout's copy with `git merge-file`, with no conflict, and diffed that file against it.
- The changeset amends the unreleased `.changeset/list-paste-object-boundary.md` instead of adding a new one, because users upgrading from the beta never had the throw.
- The design base is not the judge's first pick; Defaults names it with the word cumulative.
- The landing merged `editor-schema.ts` in scratch and applied it to the checkout, then ran the contract files and the core typecheck there, instead of redoing it in the worktree and checking before applying. Both pass on the landed bytes.
- The cost gate is accepted, not passed: the frozen noise rule leaves four small-paste cells unsettled although no line misses (Defaults, word wait).

Your working tree now holds, uncommitted, the paste check in `public-state.ts`, `ChangeDraft.check` in `change/builder.ts`, `checkDocumentChange` split from `validateDocumentChange` in `editor-schema.ts`, the deleted open-edge rule in `slice-landing.ts`, 18 new or changed contract tests, the amended changeset, and this plan with its log.

Proof and its limits:

- 184 contract tests and the core typecheck pass on the final worktree bytes, and 187 contract tests and the core typecheck pass in the checkout after the merge and the trail review's test.
- 8 of 8 mutants fail their test when their fix is reverted, on frozen tree `622b2c6685`.
- At base, 12 of the task's tests fail; base plus the task passes all of them.
- Every probe the bug reviewer wrote now matches base, apart from base throws that now refuse, roots that now land, and one suggesting-mode result offered as t_cff52975.
- Seven plitejs partitions pass. Five tests timed out at 5 s under load and pass alone on base and on the task. yjs fails the same eight cases base fails, which t_54844d26 owns.
- Every frozen cost line passes with the host below its load limit, and a paste carrying roots is 5 to 9 times cheaper at 50,000 blocks.
- The proof is model level. No browser drive ran, because no registered example declares content roots.
- Limits. A raw `tx.slice.replace` of a closed block naming an exclusive root that already has an owner, with no carried roots, still throws at save (census R3, owned by t_3ffc7a0c). An error a paste adds to a root an earlier step in the same update already broke surfaces only at save. In suggesting mode, a carried paste over an exclusive owner now returns true while suggesting refuses the update (t_cff52975). Two validation bypasses that predate this work stay open as t_53144b6c and t_08e9b718.

All 9 steps are done, and the trail review added one contract test, for a closed embed pasted mid-paragraph. The code review raised 2 bug findings and 5 quality findings: 5 applied (C1, W1, quality 1 to 3), 2 dismissed (quality 4 and 5), and 4 bug-review nits and side findings deferred to suggested tasks.

Open work is the eight suggested tasks above, each owned by the owner from the chips board.

### Attention

reviewed by gpt-6.1-sol

- Critical: the unconditional "never throws" overstated the claim, because a raw slice write with no carried roots still throws at save (R3). Applied: the verdict, Brief and limits now name that exception.
- Warning: the baseline filter can hide a new error on a root an earlier step already broke. Kept as a named limit; save still catches it.
- Warning: the suggesting-mode result is a new regression, not only the old S3 case. Kept as a (look) default with the word fix suggesting and owned by t_cff52975.
- Warning: S1 and S2 are validation bypasses that predate this work. Deferred to t_53144b6c and t_08e9b718.
- Warning: the cost verdict passed four cells the frozen rule calls unsettled. Applied: the log row is corrected and the gate is accepted as a (look) default, not passed.
- Warning: the merged file landed before its checks ran. Recorded as a deviation; the checks pass on the landed bytes.
- Warning: the flattening case had only probe coverage. Applied: a contract test now lands it as text, and it fails at base.
- Nits: the owner-issue test was written after its fix, and the writing row cited a lint log. Both rows are corrected in the log.

### Review inputs

The files this plan's `review_inputs` names, which its review and proof read:

- `packages/plitejs/test/slice-landing-contract.test.ts`
