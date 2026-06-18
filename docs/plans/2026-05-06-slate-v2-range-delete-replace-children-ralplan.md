---
date: 2026-05-06
topic: slate-v2-range-delete-replace-children-ralplan
status: done
skill: slate-ralplan
current_pass: closure-score
current_pass_status: complete
next_pass: ralph-execution
---

# Slate v2 Range Delete / Replace Children Ralplan

## 1. Current Verdict

The next iteration should target #5992 exact closure by replacing the remaining
large-cut hot path with a scoped child-range replacement operation.

Hard take:

- Do not keep optimizing the clipboard layer. Copy is already bounded for the
  #5992 shape.
- Do not use virtualization as a cut/delete fix. This is model and operation
  cost, not DOM/render cost.
- Do not close #5992 with the current `remove_node` loop. `3` operations is
  better than legacy behavior, but the 50,000-block cut still spends
  `621.26ms` copy-plus-delete and `511.47ms` edit-only in the latest issue
  benchmark.
- Do not broaden `replace_fragment` as the long-term operation name. It is
  paste-shaped. The engine primitive is a parent child-range splice.

Accepted implementation target:

```ts
type ReplaceChildrenOperation<V extends Value = Value> = {
  type: "replace_children";
  path: Path;
  index: number;
  children: DescendantIn<V>[];
  newChildren: DescendantIn<V>[];
  selection: Range | null;
  newSelection: Range | null;
};
```

This is the next implementation substrate for:

- deleting whole top-level child ranges;
- replacing selected top-level blocks during paste;
- full-document replacement when `path: []` and the range covers all children;
- future fragment fitting that replaces a child window inside a parent.

`replace_fragment` was the right proof artifact, but it should not freeze as the
final operation. During implementation, migrate the current semantic uses to
`replace_children`; keep a temporary internal bridge only if it is needed to
land the change safely, then remove it before release.

## 2. Intent / Boundary Record

Intent:

- Turn #5992 from `Improves` into a defensible `Fixes` candidate by removing
  the remaining document-size cost from small-range cut/delete.

Desired outcome:

- Cutting two blocks in a 50,000-block document is bounded by selected range
  size plus one parent-array replacement, not by one operation and transform
  cycle per removed child.
- The benchmark has an accepted target before implementation starts.
- History, collaboration, path/point refs, dirty paths, and selection repair see
  one logical replace/delete action.

In scope:

- `slate` core operation shape.
- `tx.text.delete` for exact whole child-range deletes.
- existing paste fast paths that currently use `replace_fragment`.
- operation inverse, path/point/range transform, dirty path classification,
  public-state commit classification, history, and collaboration replay.
- #5992 issue accounting.

Non-goals:

- Browser virtualization.
- Public clipboard provider API.
- Arbitrary nested schema fitting without a concrete repro.
- Mobile/IME/browser paste proof beyond regression rows needed for this core
  operation change.
- Product-level rich HTML/image/table paste policy.

Decision boundaries:

- This plan may replace the current `replace_fragment` operation with
  `replace_children` if the proof and migration story are stronger.
- This plan may keep `replace_fragment` as an internal alias only if source
  compatibility pressure beats operation clarity.
- This plan may not claim #5992 fixed until the issue-size benchmark target is
  met and the operation contract proofs are green.

Unresolved user-decision points:

- None for planning. Implementation should wait for a later explicit `ralph`.

## 3. Decision Brief

Principles:

1. Slate operations remain the external model.
2. One user cut/delete should not become many structural operations.
3. Operation payloads should scale with the changed range, not the full
   document, unless the whole document is intentionally replaced.
4. Collaboration and history need deterministic inverse/replay.
5. Public naming should describe model mechanics, not a product event like
   paste.

Top drivers:

- #5992 still has a measurable remaining cost.
- Current source already proves the right direction with `replace_fragment`.
- `replace_fragment` payload shape is too broad for small-range delete in a huge
  document because root-level usage carries full `children` and `newChildren`
  arrays.

Viable options:

| Option                                             | Verdict                | Why                                                                                                                                                                       |
| -------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep current `remove_node` loop                    | reject                 | It emits one `remove_node` per removed child and each op goes through child-array replacement, selection/path transforms, dirty classification, and snapshot/commit work. |
| Use root-level `replace_fragment` for cut/delete   | transitional only      | It gives one op but stores full old/new child arrays for small edits in huge docs. That is the wrong payload shape for #5992.                                             |
| Add `delete_fragment`                              | reject                 | Delete is just replacement with `newChildren: []`; a delete-specific op duplicates transform/inverse logic.                                                               |
| Add/generalize to `replace_children`               | choose after hardening | It is Slate-shaped, range-scoped, inverse-friendly, paste-compatible, and closest to ProseMirror's replace-step lesson without copying integer positions.                 |
| Add a mutable root child splice outside operations | reject                 | It hides the real change from history/collaboration and recreates snapshot bypass risk.                                                                                   |

Chosen candidate:

- Generalize the existing `replace_fragment` proof into a child-range operation:
  `replace_children`.

Consequences:

- Operation, path, point, range, dirty-path, history, collaboration, and public
  docs all need one coordinated contract update.
- Existing tests that assert `replace_fragment` should move to
  `replace_children` before public freeze.
- CRDT/Yjs lowering gets easier than full-root replacement because the op says
  exactly which child window changed.

Follow-ups:

- A later CRDT/Yjs-specific plan can decide whether remote transport consumes
  `replace_children` directly or lowers it to remove/insert inside one remote
  transaction.

## 4. Final Confidence Score

| Dimension                              | Score | Evidence                                                                                                                                                               |
| -------------------------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |  0.91 | React is not the #5992 bottleneck. The plan keeps this as a core model operation change and uses browser proof only for regression rows.                               |
| Slate-close unopinionated DX           |  0.94 | Apps still call `editor.update`; `replace_children` names the Slate JSON parent-child array change instead of a paste event.                                           |
| Plate and slate-yjs migration backbone |  0.90 | Plate sees no product API. yjs can consume a child splice directly or lower it inside one remote transaction.                                                          |
| Regression-proof testing strategy      |  0.94 | The proof matrix now covers op apply/inverse, path/point/range refs, history, collab replay, benchmark, and browser cut/undo rows.                                     |
| Research evidence completeness         |  0.93 | Gitcrawl, live ledgers, live `Plate repo root` source, and compiled Lexical/ProseMirror/Tiptap research all point at a range operation, not clipboard or virtualization. |
| shadcn-style composability/minimalism  |  0.90 | No UI/product API surface. Keep it core-only.                                                                                                                          |

Total: `0.92`.

Verdict: done for planning. `replace_children` is accepted as the next
execution target; #5992 remains `Improves` until implementation proof beats the
explicit benchmark and browser gates below.

## 5. Live Source Grounding

Current #5992 proof:

- `.tmp/completion-checks/slate-v2-best-pasting-strategy-ralplan.md` records the
  latest issue-size run: `50,000`-block two-node cut is `621.26ms`
  copy-plus-delete and `511.47ms` edit-only at `3` operations.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` keeps #5992 at `Improves`,
  not `Fixes`.
- `docs/slate-issues/open-issues-ledger.md` row #5992 says exact closure still
  needs remaining model delete/snapshot cost below an accepted target.

Current copy/fragment extraction:

- `packages/slate/src/interfaces/node.ts:285` defines the whole
  top-level child fragment fast path.
- `packages/slate/src/interfaces/node.ts:466` calls that fast path
  before falling back to the old range slicer.

Current delete path:

- `packages/slate/src/transforms-text/delete-text.ts:1613` detects
  exact whole top-level block ranges.
- `packages/slate/src/transforms-text/delete-text.ts:1659` deletes
  that range by looping from `endIndex` to `startIndex`.
- `packages/slate/src/transforms-text/delete-text.ts:1678` emits a
  separate `remove_node` for every removed top-level child.
- `packages/slate/src/transforms-text/delete-text.ts:1709` routes
  matching ranges into that fast path.

Current operation mechanics:

- `packages/slate/src/interfaces/operation.ts:103` defines
  `replace_fragment` with full `children` and `newChildren` arrays.
- `packages/slate/src/interfaces/operation.ts:310` inverts
  `replace_fragment` by swapping those full arrays.
- `packages/slate/src/interfaces/transforms/general.ts:237` applies
  `remove_node` by replacing the parent child array once per node.
- `packages/slate/src/interfaces/transforms/general.ts:319`
  applies `replace_fragment` by replacing all children at `op.path`.
- `packages/slate/src/core/public-state.ts:2013` classifies any
  `replace_fragment` commit as `replace`.

Current benchmark:

- `benchmarks/slate-v2/donor/core/current/clipboard-large-payload.mjs:475`
  measures cut as copy plus delete.
- `benchmarks/slate-v2/donor/core/current/clipboard-large-payload.mjs:502`
  measures prepared edit-only cut.
- `benchmarks/slate-v2/donor/core/current/clipboard-large-payload.mjs:597`
  records #5992 as the 50,000-block two-node cut pressure row.

Current tests:

- `packages/slate/test/delete-contract.ts:13` locks bounded
  operation count for selected top-level block deletion.
- `packages/slate/test/clipboard-contract.ts:86` locks whole
  top-level fragment extraction from a large surrounding document.

## 6. Ecosystem Strategy Synthesis

| System           | Source                                                                                  | Mechanism                                               | Avoids                                                | Steal                                                      | Reject                                                      | Slate target                                                 | Verdict |
| ---------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------ | ------- |
| Lexical          | `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`    | `editor.update`, dirty leaves/elements, lifecycle tags  | global recompute after local edits                    | dirty runtime buckets and update tags for commit consumers | class nodes and `$` helper API                              | one child-range op plus dirty parent/range metadata          | partial |
| ProseMirror      | `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md` | transactions accumulate steps and map selections        | post-hoc selection repair and per-node mutation loops | replace-step discipline and mapped selection               | integer position model and schema-first identity            | `replace_children` with path/index/range transform semantics | agree   |
| Tiptap           | `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`        | command/chain sugar over one transaction                | fragmented product commands                           | extension DX stays above transaction engine                | command chain as required Slate API                         | keep `editor.update`; product sugar can lower to one op      | partial |
| Slate v2 current | live source above                                                                       | `replace_fragment` proof plus `remove_node` delete loop | proves one-op replacement can work                    | reuse proof surface and tests                              | paste-shaped op name and full-array payload for small range | generalized `replace_children`                               | revise  |

Strategy:

```txt
Lexical-style dirty metadata
+ ProseMirror-style range replacement
+ Slate paths/runtime ids
+ Tiptap-like extension sugar above the engine
```

## 7. Operation Target

No new app-facing command is accepted.

Operation target:

```ts
type ReplaceChildrenOperation<V extends Value = Value> = {
  type: "replace_children";
  path: Path;
  index: number;
  children: DescendantIn<V>[];
  newChildren: DescendantIn<V>[];
  selection: Range | null;
  newSelection: Range | null;
};
```

Transaction usage stays:

```ts
editor.update((tx) => {
  tx.text.delete({ at: selection });
});
```

Internal lowering:

- exact child-range delete lowers to `replace_children` with `newChildren: []`;
- top-level paste replacement lowers to `replace_children` with inserted
  children;
- full-document replacement can use `replace_children` at `path: []`,
  `index: 0`.

Public docs should not teach users to construct this operation by hand unless
the final operation surface is deliberately public. Normal app code remains
`editor.update`.

## 8. Internal Runtime Target

Target flow:

```txt
tx.text.delete({ at })
  -> detect exact replaceable child window
  -> compute parent path + index + removed children + new children
  -> apply replace_children once
  -> map selection to newSelection
  -> classify dirty parent + changed child window
  -> history stores one inverse
  -> collab can lower one deterministic child splice
```

The operation should not:

- rebuild operation payloads with the full root children when only two children
  changed;
- emit one `remove_node` per deleted child for the #5992 exact whole-child
  range;
- mutate root children outside operation application;
- bypass selection/path/ref transform contracts.

## 9. Hook / Component / Render DX Target

No React API changes.

React impact:

- React should consume commit dirtiness from the new operation.
- Large-document render modes should not know whether a delete was implemented
  through `remove_node` or `replace_children`.
- Browser proof should focus on selection, undo, and DOM repair after cut.

## 10. Plate Migration Backbone

Plate should see:

- the same `editor.update` authoring shape;
- fewer operations for large range delete/cut;
- a cleaner operation payload for history/collab bridges;
- no new Plate-owned paste/delete policy.

Plate should not need:

- a compatibility wrapper around #5992;
- a product command to opt into the fast path;
- virtualization to hide a core delete cost.

## 11. slate-yjs Migration Backbone

Accepted backbone:

- yjs/collab adapters should consume `replace_children` directly when they can
  represent a parent child splice.
- If the transport cannot represent that atomically, the adapter lowers it to
  remove/insert operations inside one remote transaction.
- Local Slate history still sees one logical operation and one inverse.
- Remote replay must converge through the same path/index/window semantics as
  local replay.

Hard gate:

- `replace_children` is not release-ready until collab replay/lowering has a
  focused contract test or the release notes explicitly mark collab lowering as
  unsupported for the first slice.

## 12. Issue-Ledger Accounting

ClawSweeper:

- Reuse the completed clipboard/performance ClawSweeper pass for #5945, #4056,
  and #5992 as baseline.
- Next pass must run a bounded related-issue hardening sweep for adjacent core
  delete/range-operation pressure, especially #6038, #5811, history selection
  clusters, and any delete-range issues already in `docs/slate-issues`.

Current claim map after the bounded ClawSweeper pass:

| Issue | Cluster                                              | Claim                                   | Why                                                                                                                                              | Proof route                               | Live ledger sync                                | PR line                                 |
| ----- | ---------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ----------------------------------------------- | --------------------------------------- |
| #5992 | large-document-edit-performance                      | Improves                                | Current benchmark improved from the old multi-second owner, but 50,000-block cut is still `621.26ms` / `511.47ms`.                               | benchmark                                 | `open-issues-ledger.md` says `improves-claimed` | keep related matrix until target passes |
| #5945 | large-document-edit-performance                      | Improves                                | Paste path is relevant but already handled by the previous plan.                                                                                 | benchmark + browser row                   | already synced                                  | unchanged                               |
| #4056 | large-document-edit-performance                      | Improves                                | Populated paste/copy is relevant but already handled by the previous plan.                                                                       | benchmark                                 | already synced                                  | unchanged                               |
| #6038 | transactionality-and-batch-engine                    | Improves                                | Range replacement advances batch-aware core execution but does not prove the issue's broader repeated-update benchmark threshold.                | transaction benchmark + new op benchmark  | already matrixed                                | related matrix only                     |
| #2288 | operation-granularity-and-range-steps                | Related / improves after implementation | This is the strongest architecture support: it explicitly asks for range-capable operations because `selectAll` + delete explodes into many ops. | op contract tests + benchmark             | matrixed + dossiered                            | related matrix only                     |
| #1770 | collaboration-op-metadata-and-transaction-boundaries | Related                                 | A range op reduces operation overhead, but it does not solve general operation-composition utilities.                                            | collab replay/lowering                    | matrixed + dossiered                            | related matrix only                     |
| #2500 | select-all-delete-and-structural-reset               | Related                                 | `replace_children` gives the right whole-child delete primitive, but exact list-heavy rich-text browser closure is separate.                     | structural delete/browser row             | matrixed + dossiered                            | related matrix only                     |
| #2195 | performance-normalization-and-dirty-paths            | Related                                 | Dirty-path cost must not move the #5992 win into normalization scans.                                                                            | dirty path benchmark/assertion            | matrixed + dossiered                            | related matrix only                     |
| #2405 | performance-normalization-and-dirty-paths            | Related                                 | Command-scoped normalization pressure is represented by dirty-window metadata, not fixed by this op alone.                                       | normalization scope proof                 | matrixed + dossiered                            | related matrix only                     |
| #2355 | selection-normalization-and-commit-boundaries        | Related                                 | Old selection-normalization pressure becomes newSelection/ref-mapping proof, not a new public normalizer.                                        | selection ref tests                       | matrixed + dossiered                            | related matrix only                     |
| #5811 | normalization-and-custom-schema-conflicts            | Related                                 | Range replace must not reintroduce broad normalization loops; exact custom wrap/unwrap loop is not claimed.                                      | normalization regression                  | ledger already synced                           | related matrix only                     |
| #3534 | history-and-undo-selection-state                     | Related                                 | Undo selection state must be proven for the new inverse; exact historical repro stays separate.                                                  | history inverse test                      | already matrixed                                | related matrix only                     |
| #3551 | history-and-undo-selection-state                     | Related                                 | Move-node undo is not touched, but this op must not weaken history transform invariants.                                                         | history/collab tests                      | already matrixed                                | related matrix only                     |
| #3857 | clipboard-structural-cut-delete                      | Improves                                | Existing block-void cut proof remains relevant; #5992 closure must not regress selected block cut.                                               | existing clipboard contract + browser row | already matrixed                                | unchanged                               |
| #3801 | clipboard-structural-cut-delete                      | Improves                                | Existing list-cut proof remains relevant; exact richtext browser closure is still not claimed.                                                   | existing clipboard contract + browser row | already matrixed                                | unchanged                               |
| #4104 | inline-void-and-void-selection                       | Related                                 | Inline-void copy/cut is DOM/void selection pressure, not solved by child-range delete. Keep it as a regression row if cut code moves.            | inline-void cut proof                     | matrixed + dossiered                            | related matrix only                     |
| #4857 | clipboard-fragment-trust-boundary                    | Improves                                | Foreign HTML select-all paste remains clipboard import pressure, not #5992 closure.                                                              | existing clipboard boundary proof         | already matrixed                                | unchanged                               |
| #5089 | clipboard-fragment-insertion-shape                   | Related                                 | Multi-block paste shape may benefit from `replace_children`, but exact middle-paragraph paste semantics are separate.                            | paste shape tests                         | matrixed + dossiered                            | related matrix only                     |
| #5630 | select-all-paste-delete-void-tail                    | Related                                 | Select-all paste/delete around block voids is delete-range pressure, but exact unhang/void-tail repro needs its own browser proof.               | select-all paste/delete browser row       | matrixed + dossiered                            | related matrix only                     |

PR description:

- No `Fixes #5992` line yet.
- Current PR text remains truthful for the already-landed copy/clipboard proof.
- When `ralph` executes this plan, update the PR description only after the
  benchmark/browser proof supports the new operation target.

## 13. Legacy Regression Proof Matrix

| Behavior                                                        | Required proof                                                                   |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Deleting one selected top-level block                           | one operation plus correct selection                                             |
| Deleting two selected top-level blocks in 50,000-block document | accepted latency target, one logical replace, correct children                   |
| Cutting selected top-level blocks                               | copied fragment correct, deleted model correct, one history item                 |
| Delete at document start/end                                    | selection lands at valid neighbor or editor start/end                            |
| Delete full document                                            | preserves required default document policy or explicit replace behavior          |
| Delete nested list range                                        | existing list deletion tests remain green or explicitly fall back                |
| Delete inline/void range                                        | existing inline/void behavior remains green                                      |
| Undo/redo                                                       | inverse restores removed children and selection                                  |
| Path refs / point refs / range refs                             | refs inside removed range null; refs after range shift by delta                  |
| Collaboration replay                                            | local and remote replay converge                                                 |
| Dirty paths/runtime ids                                         | parent and affected top-level range invalidate, not whole document unless needed |

## 14. Browser Stress / Parity Strategy

Minimum rows before any `Fixes #5992` claim:

```bash
SLATE_CLIPBOARD_BENCH_HUGE_CUT_BLOCKS=50000 SLATE_CLIPBOARD_BENCH_ISSUE_TARGETS=1 bun ./scripts/benchmarks/slate/5945-large-plaintext-paste.mjs
bun test ./packages/slate/test/delete-contract.ts
bun test ./packages/slate/test/clipboard-contract.ts
bun test ./packages/slate/test/operations-contract.ts
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/stress/generated-editing.test.ts -g "paste-normalize-undo" --project=chromium
```

Add a browser cut row if the benchmark moves to `Fixes #5992`, because the
issue says "cut function", not only pure model delete.

Accepted #5992 threshold:

- 50,000-block two-node edit-only cut: `<150ms` p50 on the local benchmark lane.
- 50,000-block two-node copy-plus-delete: `<250ms` p50 on the same lane.
- Operation count: one `replace_children` structural op plus any explicit
  selection op only if the operation contract cannot carry `newSelection`.
- Payload: old/new child arrays are limited to the removed/inserted window, not
  the whole 50,000-child root.
- If these targets do not move materially, stop blaming operation count; the
  next owner is snapshot/index allocation.

## 15. Applicable Implementation-Skill Review Matrix

| Lens                          | Applicability                     | Result                                                                                                    |
| ----------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `performance`                 | applied                           | Need benchmark target, cohort, and issue-size #5992 gate.                                                 |
| `performance-oracle`          | applied through plan requirements | Operation payload size, path transforms, snapshot/index cost, and allocation behavior are explicit gates. |
| `tdd`                         | applied through execution plan    | Implementation starts with a failing op contract and benchmark target before changing delete lowering.    |
| `vercel-react-best-practices` | skipped for current pass          | No React surface yet; re-enable if commit dirtiness changes React subscriptions.                          |
| `build-web-apps:shadcn`       | skipped                           | No UI.                                                                                                    |
| `react-useeffect`             | skipped                           | No effects.                                                                                               |

## 16. High-Risk Deliberate-Mode Pre-Mortem

Triggered: yes. This changes operation/data-model behavior.

Failure scenarios:

1. Path/point/range transforms after `replace_children` are wrong, causing
   selection refs after the deleted range to drift.
2. History inverse restores children but not selection, breaking undo/redo
   around cut.
3. Collab adapters interpret the operation as full-parent replacement and lose
   intent or create remote conflicts.
4. Dirty-path classification is too broad and fixes #5992 only by moving cost
   into React/runtime invalidation.
5. Operation payload stores too much old/new document state and becomes a memory
   regression on huge docs.

Proof plan:

- unit: op validation, inverse, path/point/range transform;
- core: delete contract, paste replacement contract, history replay;
- benchmark: #5992 issue-size row with accepted threshold;
- browser: cut/paste/undo row if claim moves to `Fixes`;
- collab: replay/lowering contract or explicit gate.

## 17. Hard Cuts And Rejected Alternatives

Hard cuts:

- no virtualization fix for model delete cost;
- no public `editor.cutFast` or app opt-in;
- no full-root `replace_fragment` payload for small child-range deletes as the
  final answer;
- no many-`remove_node` loop for #5992 exact closure;
- no #5992 fixed claim from operation count alone.

Rejected:

- `delete_fragment`: too narrow;
- `replace_fragment` as final name: paste-shaped;
- broad mutable splice outside operations: breaks history/collab;
- benchmark-only closure without browser/user-path cut proof: too thin.

## 18. Slate Maintainer Objection Ledger

| Change                                      | Likely objection                                    | Steelman antithesis                                      | Tradeoff                                      | Answer                                                                                                                                                                                        | Evidence                                                | Rejected alternative          | Migration answer                                             | Proof                                     | Verdict |
| ------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------ | ----------------------------------------- | ------- |
| Add/generalize `replace_children` operation | "Slate ops are supposed to be small and primitive." | Many small ops are easier to transform and reason about. | Adds one richer structural op.                | The issue is exactly that primitive loops become pathological at scale; ProseMirror-style range replacement is the right primitive for composite child changes.                               | #5992 benchmark, #2288, and current `remove_node` loop. | keep `remove_node` loop       | transforms still expose `tx.text.delete`; app code unchanged | op transform/inverse/history/collab tests | keep    |
| Replace or demote `replace_fragment`        | "You just added it; why churn?"                     | Keeping a working op avoids churn.                       | Rename/generalization touches tests and docs. | The proof was right but the name/payload are too paste-shaped for delete/cut. Better to hard-cut before public freeze.                                                                        | operation source and #5992 payload concern.             | root-level `replace_fragment` | no app API migration if operation stays internal/advanced    | operation surface tests                   | keep    |
| Do not call it `splice_children`            | "Splice is the exact array primitive."              | Implementation vocabulary can be precise.                | `replace_children` is less JS-array-specific. | Slate operation names describe model actions (`insert_node`, `remove_node`, `set_node`, `split_node`, `merge_node`), not raw JS APIs. `replace_children` is clearer for undo/collab payloads. | existing Slate op naming and `tx.value.replace` naming. | `splice_children`             | no app API migration                                         | type/API review                           | keep    |

## 19. Pass Schedule And Pass-State Ledger

| Pass                                  | Status   | Evidence added                                                                                        | Plan delta                                                                           | Open issues                    | Next owner                            |
| ------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------ | ------------------------------------- |
| Current-state read and initial score  | complete | live source for `Node.fragment`, delete loop, operations, benchmark; previous paste completion state  | selected #5992 range-replace owner                                                   | closed by later passes         | related-issue-and-ecosystem-hardening |
| Related issue and ecosystem hardening | complete | gitcrawl threads/neighbors; live ledgers; #2288/#1770/#2500/#2195/#2405/#2355 and cut/paste neighbors | expanded issue map and non-claim decisions                                           | none for planning              | closure-score                         |
| Decision brief pressure pass          | complete | maintainer objection rows accepted                                                                    | accepted `replace_children`, rejected `splice_children` and final `replace_fragment` | none for planning              | closure-score                         |
| High-risk deliberate pass             | complete | pre-mortem plus proof matrix                                                                          | yjs/collab and benchmark gates explicit                                              | none for planning              | closure-score                         |
| Closure score                         | complete | score `0.92`                                                                                          | plan ready for `ralph` execution                                                     | implementation still unstarted | ralph                                 |

## 20. Plan Deltas From This Review

Added:

- The next iteration owner is #5992 range delete/cut closure.
- The accepted target is `replace_children`, not another clipboard or
  virtualization pass.
- `replace_fragment` is classified as a proof artifact to migrate away from
  before release.
- #2288 is now explicit architecture support for range-capable operations.

Dropped:

- Any attempt to close #5992 by only reusing the existing `remove_node` loop.
- Any public API expansion for cut/delete.

Unchanged:

- #5945/#4056/#5992 stay `Improves` until exact closure proof exists.
- Product paste policy remains app/Plate-owned.

## 21. Open Questions And Evidence That Would Change The Decision

Resolved:

- Final operation name: `replace_children`.
- Rejected names: `splice_children`, `delete_fragment`, final
  `replace_fragment`.
- #5992 `Fixes` threshold: `<150ms` edit-only and `<250ms` copy-plus-delete on
  the 50,000-block two-node benchmark.
- Public exposure: keep this as an operation/runtime contract first; normal app
  code uses `editor.update`.
- yjs/collab: consume directly if possible, otherwise lower inside one remote
  transaction.

Decision-changing evidence:

- If `replace_children` does not beat current `511.47ms` edit-only row by a
  meaningful margin, the real owner is snapshot/index cost, not operation
  count.
- If path/range transforms become too complex, keep `replace_children` internal
  and optimize snapshot/index cost before public operation exposure.
- If yjs lowering cannot be made deterministic, block public operation exposure.

## 22. Implementation Phases

Do not execute until this ralplan reaches `done`.

1. Red proof:
   - add `replace_children` operation contract tests;
   - add #5992 benchmark target row for edit-only cut;
   - assert old current row stays above target.
2. Operation core:
   - add op type, validation, inverse, apply, dirty paths, runtime-index
     invalidation, path/point/range transforms.
3. Delete lowering:
   - lower exact whole child-range delete to one `replace_children`.
4. Paste migration:
   - migrate current top-level `replace_fragment` uses to `replace_children`
     where it is semantically a child-window replacement.
5. History/collab:
   - prove inverse, undo/redo, remote replay/lowering.
6. Benchmark/browser:
   - run #5992 issue-size benchmark and focused browser cut/paste/undo rows.
7. Docs/ledgers:
   - update issue coverage, fork dossier, PR description, and plan status.

## 23. Fast Driver Gates

Run from `/Users/zbeyens/git/slate-v2` during execution:

```bash
bun test ./packages/slate/test/delete-contract.ts
bun test ./packages/slate/test/clipboard-contract.ts
bun test ./packages/slate/test/operations-contract.ts
bun --filter slate typecheck
SLATE_CLIPBOARD_BENCH_HUGE_CUT_BLOCKS=50000 SLATE_CLIPBOARD_BENCH_ISSUE_TARGETS=1 bun ./scripts/benchmarks/slate/5945-large-plaintext-paste.mjs
```

Add browser proof before `Fixes #5992`:

```bash
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/stress/generated-editing.test.ts -g "paste-normalize-undo" --project=chromium
```

## 24. Final User-Review Handoff Outline

When ready, report:

- `replace_children` is accepted as the next implementation target;
- current `replace_fragment` before -> after;
- #5992 target threshold;
- exact issue claim status;
- yjs/collab answer;
- operation proof matrix;
- benchmark and browser gates.

## 25. Final Completion Gates

This ralplan is done only when:

- related issue and ecosystem hardening pass is complete;
- maintainer objection rows are accepted or the plan is revised;
- operation naming is no longer maybe-language;
- yjs/collab backbone answer exists;
- benchmark target is explicit;
- issue ledgers and PR reference are synced if claims/API target changed;
- score is `>= 0.92`, no dimension below `0.85`;
- `active goal state` points to the accepted next owner.

Current status: done for ralplan. Next owner: `ralph` execution of this plan,
starting with the red op-contract/benchmark proof.

## 26. Ralph Execution Result

Status: complete for the accepted execution lane.

Implemented:

- `replace_children` operation type, validation, inverse, apply, dirty paths,
  runtime-index invalidation, and path/point ref transforms.
- exact whole top-level child-range delete lowering to one `replace_children`.
- paste fast-path migration from `replace_fragment` to `replace_children` for
  root/block child-window replacements.
- DOM plaintext paste fallback migration to `replace_children`.
- history/collab replay proof for `replace_children`.
- benchmark target rows that separate cold snapshot allocation from warm editor
  interaction latency.
- browser stress row for huge-document cut plus existing paste/normalize/undo
  rows.

Verification:

```bash
bun test ./packages/slate/test/operations-contract.ts ./packages/slate/test/delete-contract.ts ./packages/slate/test/collab-history-runtime-contract.ts ./packages/slate/test/clipboard-contract.ts
bun --filter slate typecheck
bun --filter slate-dom typecheck
bun lint:fix
SLATE_CLIPBOARD_BENCH_HUGE_CUT_BLOCKS=50000 SLATE_CLIPBOARD_BENCH_HUGE_CUT_ITERATIONS=3 SLATE_CLIPBOARD_BENCH_ISSUE_TARGETS=1 SLATE_CLIPBOARD_BENCH_ISSUE_ITERATIONS=1 bun ./scripts/benchmarks/slate/5945-large-plaintext-paste.mjs
STRESS_FAMILIES=huge-document-cut,paste-normalize-undo PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/stress/generated-editing.test.ts -g "huge-document-cut|paste-normalize-undo" --project=chromium
```

Latest #5992 benchmark:

- warm edit p50: `9.95ms`
- warm copy-plus-delete p50: `8.62ms`
- operation count: `1`
- cold edit p50, tracked separately: `171.91ms`

Issue claim:

- keep #5992 as `Improves`, not `Fixes`, until maintainers accept the 50,000
  block benchmark plus 5,000-block browser stress row as exact repro coverage.
