# Slate v2 Absolute Architecture Review Plan

Date: 2026-04-28
Status: done; slate-review rerun closed
Score: 0.923 (rerun closure score; previous closure score was 0.924)

## 1. Current Verdict

The architecture direction is still the right one, and this rerun is closed.
The prior execution completed the accepted plan; this review cycle rechecked
that plan against live source and found one public-DX guard to add.

The previous multi-pass review completed and drove the implementation lane.
This rerun has its own pass schedule. Pass 1 and Pass 2 are recorded below;
Pass 3 hardens the public write policy, Pass 4 answers maintainer and
ecosystem objections, Pass 5 folds that policy into the execution plan, and
Pass 6 closes the review gates.

Keep the Slate model and operations. Hard cut the remaining public API clutter
toward:

```ts
editor.read((state) => {
  state.selection.get()
})

editor.update((tx) => {
  tx.nodes.set(props, { at: target })
})
```

The implementation lane closed the exact issues this plan targeted.
Closed in `/Users/zbeyens/git/slate-v2`:

- eager void renderer `focused` / `selected` / `actions`
- public `onKeyCommand`
- public `onSnapshotChange`
- raw Slate `onValueChange` / `onSelectionChange`
- extension methods mutating the editor object

New review finding:

- The plan header was stale after execution: it still described hook cleanup,
  schema/spec predicates, and browser stress gates as open even though later
  Phase 5-7 ledger sections mark them complete.
- The bigger DX issue was live API drift: the accepted public target is
  `editor.update((tx) => tx.nodes.*)`, but live examples and tests still teach
  `editor.update(() => editor.insertNodes(...))` and similar primitive editor
  methods. Pass 3 resolves the policy: `tx.*` is the only normal public write
  path; primitive editor write methods may remain only as advanced/internal
  bridge APIs and must leave first-party authoring docs/examples/tests.

2026-04-28 correction: the ecosystem lane was over-scoped. Slate v2 does not
need to support current Plate or slate-yjs APIs directly, and it must not
require current-version adapter fixtures. The migration requirement is a raw
architecture backbone only: stable operations, commits, snapshots, `state` /
`tx` extension namespaces, schema/spec policy, and local-only render targets so
Plate, slate-yjs, and similar libraries have a credible migration path. Any
older "Plate adapter fixture" wording in this plan is superseded by this
correction.

## 2. Historical Closure Scorecard

This is the previous closure score from the completed review lane. It does not
close the current rerun; the active rerun closure score is `0.923` in section
2.6.

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.92 | Pass 3 rechecked node/text selector dirty-runtime-id filtering in `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-node-selector.tsx:31`, root source filters in `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/root-selector-sources.ts:23`, and render profiler budgets in `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:267`; the revision pass moved eager void subscriptions, stale-target handling, and plugin browser contracts into implementation phases and final gates instead of leaving them as review-only notes. |
| Slate-close unopinionated DX | 0.20 | 0.93 | Pass 4 rechecked legacy Slate docs for `onKeyDown` and `onChange`, current v2 `onKeyCommand`, `onSnapshotChange`, `RenderVoidProps`, hook exports, and the accepted `state` / `tx` decision. Pass 5 rechecked legacy Slate command/transform docs, Tiptap command/chain source, current v2 command registry, and the current extension-method mutation surface. Pass 9 cut raw Slate filtered change callbacks; the final raw callback surface is `onChange` plus advanced `onCommit`. Pass 10 challenged every hard cut as a skeptical Slate maintainer and kept the Slate mental model: document value, paths, operations, `Editable`, `renderElement`, `renderLeaf`, `onKeyDown`, `onChange`, and plain React renderers. |
| Plate and slate-yjs migration shape | 0.15 | 0.93 | Pass 6 rechecked Plate table typed API/transform groups in `/Users/zbeyens/git/plate-2/packages/table/src/lib/BaseTablePlugin.ts:119`, link element config in `/Users/zbeyens/git/plate-2/packages/link/src/lib/BaseLinkPlugin.ts:13`, mark transform sugar in `/Users/zbeyens/git/plate-2/packages/basic-nodes/src/lib/BaseBoldPlugin.ts:27`, image void/media transforms in `/Users/zbeyens/git/plate-2/packages/media/src/lib/image/BaseImagePlugin.ts:33`, Plate Yjs adapter APIs in `/Users/zbeyens/git/plate-2/packages/yjs/src/lib/BaseYjsPlugin.ts:30`, and v2 operation replay/commit contracts in `/Users/zbeyens/git/slate-v2/packages/slate/test/apply-onchange-hard-cut-contract.ts:38` and `/Users/zbeyens/git/slate-v2/packages/slate/test/collab-history-runtime-contract.ts:14`. The 2026-04-28 correction cuts current-version adapter fixture requirements; the remaining requirement is migration-backbone proof only. |
| Regression-proof testing strategy | 0.20 | 0.92 | Pass 7 rechecked the operation-family contract list in `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:43`, inline void navigation at `generated-editing.test.ts:254`, markable inline void shell proof at `generated-editing.test.ts:348`, block void navigation and no-layout-gap proof at `generated-editing.test.ts:408`, editable island focus proof at `generated-editing.test.ts:556`, table boundary navigation at `generated-editing.test.ts:625`, search focus/decorations at `generated-editing.test.ts:665`, mouse toolbar selection at `generated-editing.test.ts:698`, replay proof in `/Users/zbeyens/git/slate-v2/playwright/stress/replay.test.ts:19`, and release/stress scripts in `/Users/zbeyens/git/slate-v2/package.json:60`. The revision pass moved final callback, hook, namespace, migration-backbone proof, stale-target, plugin browser contract, and collab replay proof into the proof matrix, phases, and final gates. |
| Research evidence completeness | 0.15 | 0.92 | Pass 8 rechecked the compiled research entrypoints in `docs/research/index.md`, the accepted `state` / `tx` decision in `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md:27`, the cross-corpus steal/reject decision in `docs/research/decisions/slate-v2-perfect-plan-should-steal-read-update-transaction-discipline-and-extension-dx.md:21`, runtime-owned shell DX in `docs/research/decisions/editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md:19`, React 19.2 evidence in `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md:31`, and local source citations in `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalEditor.ts:1375`, `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalUpdates.ts:101`, `/Users/zbeyens/git/prosemirror/state/src/transaction.ts:22`, and `/Users/zbeyens/git/tiptap/packages/core/src/CommandManager.ts:28`. No contradiction was found. |
| shadcn-style composability and hook/component minimalism | 0.10 | 0.93 | Pass 9 reduced each public surface to one obvious path plus at most one advanced escape hatch: `onChange` / `onCommit`, `renderVoid({ element, target })` / `renderShellUnsafe`, named hooks / `useEditorSelector`, `state` / `tx`, and Plate-owned product sugar. The revision pass keeps raw Slate minimal while requiring migration-backbone proof, not current Plate adapter support. |

Weighted total: `0.924`.

Historical completion threshold passed:

- total score is above `0.92`
- no dimension is below `0.85`
- every dimension cites concrete evidence
- all major hard cuts have accepted objection-ledger answers
- extension, plugin, Plate, and slate-yjs answers are present
- implementation acceptance criteria and final proof gates are recorded
- pass-state ledger is complete through closure

## 2.1 2026-04-28 Slate Review Rerun: Pass 1 Current-State Read

Status: complete for Pass 1 only. Completion remains `pending`.

Current verdict: keep the architecture direction, but do not re-close the plan
yet. The code is stronger than the old header says, while the public write-DX
story is weaker than the accepted target says.

Score: `0.880`.

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.90 | `EditableDOMRoot` is mostly wiring through `useEditableRootRuntime` and stable runtime handlers in `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx:124` and `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts:100`; root selector sources are named and operation-filtered in `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/root-selector-sources.ts:26`; stress rows assert render budgets in `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:45` and run through the generated harness at `generated-editing.test.ts:930`. |
| Slate-close unopinionated DX | 0.20 | 0.82 | Accepted research says normal writes should be `editor.update((tx) => tx.nodes.set(...))` in `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md:27`; live `BaseEditor` still exposes primitive transform methods in `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:258`; first-party examples still teach `editor.update(() => editor.insertNodes(...))` and `editor.update(() => editor.removeNodes(...))` in `/Users/zbeyens/git/slate-v2/site/examples/ts/images.tsx:100` and `images.tsx:147`; write-boundary tests explicitly call this the routed primitive path in `/Users/zbeyens/git/slate-v2/packages/slate/test/write-boundary-contract.ts:79`. |
| Plate and slate-yjs migration-backbone shape | 0.15 | 0.91 | Type fixtures prove plugin-style `state` / `tx` groups in `/Users/zbeyens/git/slate-v2/packages/slate/test/generic-extension-namespace-contract.ts:132`; runtime extension tests prove tx groups read transaction-local state in `/Users/zbeyens/git/slate-v2/packages/slate/test/extension-namespaces-contract.ts:103`; collab contracts prove deterministic remote replay and local runtime-id null/rebase behavior in `/Users/zbeyens/git/slate-v2/packages/slate/test/collab-history-runtime-contract.ts:113` and `collab-history-runtime-contract.ts:152`; browser rows add stale-target replay in `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:106`. |
| Regression-proof testing strategy | 0.20 | 0.92 | Operation-family contracts cover inline voids, markable inline voids, block voids, editable islands, stale targets, tables, search focus, toolbar selection, paste, and IME in `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:45`; the plugin contract registry exists in `/Users/zbeyens/git/slate-v2/packages/slate-browser/src/playwright/index.ts:2413`; Phase 7 recorded `bun check:full` exit 0 plus focused retry-disabled reruns for the two retry-resolved rows. |
| Research evidence completeness | 0.15 | 0.86 | The React 19.2 page still supports React as projection scheduler, not editor invalidation engine, in `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md:57`; the newer state/tx decision is accepted in `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md:27`; this pass found stale wording in the older steal/reject/defer decision and added a maintain note there, so the lane is usable but needs a proper research refresh pass before closure. |
| shadcn-style composability and hook/component minimalism | 0.10 | 0.86 | `renderVoid` is minimal at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:190`; stale hook aliases and callback names grep clean in `packages/slate-react/src`, tests, and first-party examples; five `React.createElement` callsites remain in `slate-react` components, including `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx:187`, so JSX cleanup is still a small DX/composability polish item rather than a blocker. |

Weighted total: `0.880`.

Pass 1 findings:

- P1: public write DX is not final. Raw Slate now has `state` / `tx`, but live
  examples still teach primitive editor methods inside `editor.update`. Either
  make `tx.*` the author-facing path in examples/docs/tests or explicitly
  demote primitive editor methods to advanced/internal bridge status with a
  release guard.
- P2: the plan header drifted after execution. Later Phase 5-7 sections are
  accurate, but the top verdict still spoke as if hook cleanup, schema/spec,
  and browser parity were open.
- P2: the research layer had stale wording. The older steal/reject/defer
  decision still described primitive editor methods as the power API inside
  update; this pass added a maintain note pointing to the newer state/tx
  decision as the current authority.
- P3: React `createElement` leftovers are not a runtime architecture blocker,
  but if the goal is absolute DX and shadcn-style component readability, the
  five remaining `slate-react` component callsites should be converted or
  explicitly justified.

Plan delta from Pass 1:

- Reopened the plan from previous closure to a new `slate-review` rerun.
- Set active score to `0.880`.
- Demoted the prior `0.924` to historical closure score only.
- Updated the research layer to resolve the state/tx wording drift.
- Named Pass 2 as research and live-source refresh.

Next owner:

- Pass 2: research and live-source refresh. Recheck the live public write
  surface, examples, docs expectations, and the current research pages before
  deciding whether the next plan revision should hard-cut primitive write DX or
  document it as advanced/internal.

## 2.2 2026-04-28 Slate Review Rerun: Pass 2 Research And Live-Source Refresh

Status: complete for Pass 2 only. Completion remains `pending`.

Verdict: the research direction is not contradictory, but the live public
surface is not final. `state` / `tx` is real and tested. The docs/examples
still teach primitive `editor.*` writes as normal authoring DX, so this stays a
P1 until the plan either hard-cuts those examples to `tx.*` or explicitly
classifies primitive methods as advanced/internal bridge APIs.

Score: `0.886`.

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.90 | Dirty runtime-id selection and decoration impact stay in `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:1200` and `public-state.ts:1226`; this pass did not find new React hot-path regression evidence, so performance stays unchanged from Pass 1. |
| Slate-close unopinionated DX | 0.20 | 0.83 | `state` / `tx` is proven by `/Users/zbeyens/git/slate-v2/packages/slate/test/state-tx-public-api-contract.ts:29`, `state-tx-public-api-contract.ts:51`, and `state-tx-public-api-contract.ts:80`; live `BaseEditor` still wires primitive writes in `/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts:200` and `create-editor.ts:247`; docs still teach primitive method DX in `/Users/zbeyens/git/slate-v2/docs/concepts/04-transforms.md:3` and `/Users/zbeyens/git/slate-v2/docs/concepts/07-editor.md:41`. |
| Plate and slate-yjs migration-backbone shape | 0.15 | 0.92 | `tx` read/write coherence and extension namespace direction remain the accepted backbone in `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md`; `applyOperations` remains the explicit replay writer in `/Users/zbeyens/git/slate-v2/packages/slate/test/write-boundary-contract.ts:57`, which keeps collaboration proof out of React callback naming. |
| Regression-proof testing strategy | 0.20 | 0.92 | Browser-operation family coverage from Pass 1 still stands; this pass added a sharper unit/docs gap: `/Users/zbeyens/git/slate-v2/packages/slate/test/write-boundary-contract.ts:79` intentionally preserves primitive writes inside update, so future regression contracts must prove the final chosen public write path rather than accepting both as normal DX. |
| Research evidence completeness | 0.15 | 0.88 | Refreshed `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md` with live-source evidence and appended `docs/research/log.md`; the older steal/reject/defer decision now points to the state/tx decision as current naming authority. |
| shadcn-style composability and hook/component minimalism | 0.10 | 0.86 | No new React component API issue surfaced beyond Pass 1; minimalism stays limited by the same public-write clutter: normal docs still expose a large primitive editor object instead of one grouped `tx` surface. |

Weighted total: `0.886`.

Pass 2 findings:

- P1 remains: public write DX mismatch. The accepted normal path is
  `editor.update((tx) => tx.nodes.*)`, but live docs/tests/examples still teach
  `editor.update(() => editor.*)`.
- Research is consistent after refresh: `tx.*` is the accepted target;
  primitive `editor.*` writes are either advanced/internal bridge APIs or need
  hard-cut migration from first-party author-facing docs/examples.
- `applyOperations` is not part of the mismatch. It remains the explicit
  operation replay writer for collaboration and replay proof.

Plan delta from Pass 2:

- Updated the state/tx decision page with live-source evidence.
- Appended a research log entry for the state/tx live-source refresh.
- Raised active score from `0.880` to `0.886`.
- Raised migration-backbone score from `0.91` to `0.92` because the `tx`
  substrate and replay writer proof are real.
- Raised research score from `0.86` to `0.88` because the stale-source gap is
  resolved.
- Kept DX below the `0.85` floor because public docs/examples still teach the
  wrong normal write surface.

Next owner:

- Pressure passes, starting with DX and unopinionated-core pressure over the
  public write path.
- Decide and record one of two end states:
  - make `tx.*` the only normal public write path in docs/examples/tests and
    classify primitive editor writes as advanced/internal bridge APIs
  - revise the accepted API target to keep primitive editor methods as normal
    DX, accepting the resulting lower architecture score and larger editor
    object

## 2.3 2026-04-28 Slate Review Rerun: Pass 3 DX/Unopinionated-Core Pressure

Status: complete for Pass 3 only. Completion remains `pending`.

Verdict: do not revise the accepted API target downward. The normal public
write path is:

```ts
editor.update((tx) => {
  tx.nodes.set(props, { at: target })
})
```

Primitive `editor.*` write methods are not the normal authoring API. They may
exist as advanced/internal bridge APIs for legacy transform fixtures, core
runtime composition, codemods, and low-level compatibility during the rewrite,
but first-party docs, examples, walkthroughs, and public API pages must teach
`tx.*`.

Keeping primitive editor writes as normal public DX would be the wrong call. It
would preserve a large editor object, make `state` / `tx` look optional, and
teach the exact surface the architecture is trying to stop.

Score: `0.903`.

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.90 | Unchanged from Pass 2: dirty runtime-id impact and React projection remain the performance owner; this pass did not touch hot runtime evidence. |
| Slate-close unopinionated DX | 0.20 | 0.88 | The accepted `tx` shape is proven in `/Users/zbeyens/git/slate-v2/packages/slate/test/state-tx-public-api-contract.ts:56`; current docs still teach primitive methods in `/Users/zbeyens/git/slate-v2/docs/concepts/04-transforms.md:3`, `/Users/zbeyens/git/slate-v2/docs/concepts/06-commands.md:3`, and `/Users/zbeyens/git/slate-v2/docs/api/transforms.md:3`; the pressure decision keeps `tx.*` normal and demotes primitive writes from public authoring docs. |
| Plate and slate-yjs migration-backbone shape | 0.15 | 0.93 | `state` / `tx` extension namespaces stay aligned with the migration backbone in `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md:60`; keeping primitive editor writes out of normal docs protects Plate-owned product sugar from leaking back into raw Slate. |
| Regression-proof testing strategy | 0.20 | 0.92 | `/Users/zbeyens/git/slate-v2/packages/slate/test/write-boundary-contract.ts:27` rejects primitive writes outside `editor.update`, while `write-boundary-contract.ts:79` still proves the old routed primitive path; the revision pass must add public-surface guards that first-party authoring examples/docs use `tx.*` and low-level primitive fixtures are classified explicitly. |
| Research evidence completeness | 0.15 | 0.89 | The refreshed state/tx decision page records the live-source split in `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md:100`; no new research contradiction was found. |
| shadcn-style composability and hook/component minimalism | 0.10 | 0.90 | The pass restores the one-normal-path rule for writes: app authors see `editor.update((tx) => ...)`, while primitive editor writes become advanced/internal bridge APIs instead of another public component authoring style. |

Weighted total: `0.903`.

Pass 3 findings:

- Public write policy is now decided: `tx.*` is normal public DX.
- Primitive editor writes are advanced/internal bridge APIs, not author-facing
  examples/docs/API reference material.
- The implementation plan needs a release guard that prevents first-party
  docs/examples/walkthroughs from re-teaching primitive `editor.*` writes as
  normal usage.
- Low-level transform fixtures can still use primitive methods if they are
  explicitly classified as core runtime/legacy transform fixtures rather than
  authoring examples.

Plan delta from Pass 3:

- Resolved the public write-policy fork in favor of `tx.*`.
- Raised DX above the `0.85` floor because the plan now has one normal write
  path again.
- Raised migration and composability scores because raw Slate keeps a smaller
  public authoring surface and leaves product sugar to Plate/adapters.
- Kept completion `pending`: the score is below `0.92`, the objection/revision
  passes are still incomplete, and the final implementation acceptance criteria
  must include docs/examples/public-surface guards for the chosen policy.

Next owner:

- Maintainer and ecosystem objection pass for the hardened public write policy.
- Update or add objection rows covering:
  - why primitive editor writes are advanced/internal bridge APIs
  - how Slate-close migration remains practical
  - how Plate and slate-yjs still get the migration backbone without raw Slate
    exposing current-version adapter APIs
  - which tests/guards prove docs/examples use `tx.*` as the normal path

## 2.4 2026-04-28 Slate Review Rerun: Pass 4 Maintainer/Ecosystem Objections

Status: complete for Pass 4 only. Completion remains `pending`.

Verdict: keep the hardened public write policy.

The strongest maintainer objection is fair: legacy Slate users know
`Editor.*` and `Transforms.*`, and `tx.nodes.set` looks like a new dialect. The
answer is not to keep primitive `editor.*` writes as normal DX. Legacy Slate's
actual split was already "editor value + static helpers + transforms +
commands." `tx.*` preserves that idea while making update ownership explicit:
reads and writes happen in the transaction view, operations still fall out as
Slate operations, and the editor object stops becoming a dumping ground.

The strongest ecosystem objection is also fair: Plate currently has
`editor.api` / `editor.tf`, and slate-yjs current integrations are not written
against `state` / `tx`. Raw Slate should still not support those current APIs.
The migration target is the backbone: typed extension namespaces on `state` and
`tx`, deterministic operations/commits, explicit operation replay, and local
targets that never become collaboration identity.

Score: `0.918`.

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.90 | No new runtime objection changes the React projection model from Pass 3. |
| Slate-close unopinionated DX | 0.20 | 0.91 | Legacy Slate uses `Transforms.insertNodes(editor, ...)` and `Transforms.setNodes(editor, ...)` in `/Users/zbeyens/git/slate/docs/api/transforms.md:39` and `/Users/zbeyens/git/slate/docs/walkthroughs/05-executing-commands.md:53`; v2 docs currently teach primitive editor writes in `/Users/zbeyens/git/slate-v2/docs/concepts/04-transforms.md:3` and `/Users/zbeyens/git/slate-v2/docs/concepts/06-commands.md:3`; the accepted v2 target keeps the Slate transform mental model but moves normal writes to `tx.*`. |
| Plate and slate-yjs migration-backbone shape | 0.15 | 0.94 | Plate pressure is real: table/media/yjs still use `PluginConfig`, `extendEditorTransforms`, `editor.api`, and `editor.tf` in `/Users/zbeyens/git/plate-2/packages/table/src/lib/BaseTablePlugin.ts:119`, `/Users/zbeyens/git/plate-2/packages/media/src/lib/image/BaseImagePlugin.ts:58`, and `/Users/zbeyens/git/plate-2/packages/yjs/src/lib/BaseYjsPlugin.ts:71`; v2 proves the intended backbone with typed extension groups in `/Users/zbeyens/git/slate-v2/packages/slate/test/generic-extension-namespace-contract.ts:132` and remote replay in `/Users/zbeyens/git/slate-v2/packages/slate/test/collab-history-runtime-contract.ts:113`. |
| Regression-proof testing strategy | 0.20 | 0.93 | The objection pass makes the missing guard explicit: first-party authoring docs/examples/API pages must grep clean for normal primitive `editor.*` writes, while low-level transform fixtures stay classified. Existing write-boundary tests already split illegal primitive writes from routed bridge writes in `/Users/zbeyens/git/slate-v2/packages/slate/test/write-boundary-contract.ts:27` and `write-boundary-contract.ts:79`. |
| Research evidence completeness | 0.15 | 0.91 | The accepted state/tx decision explicitly rejects `api` / `tf` as raw Slate naming and explains extension groups in `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md:27` and `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md:60`; no contradiction surfaced. |
| shadcn-style composability and hook/component minimalism | 0.10 | 0.93 | The pass keeps one normal write authoring surface and one advanced bridge: app/component authors use `editor.update((tx) => ...)`; internal/runtime fixtures may use primitive editor writes only when classified. |

Weighted total: `0.918`.

Maintainer objections answered:

- "This is not Slate anymore." Rejected. It keeps Slate value, paths, ranges,
  operations, `Editable`, `renderElement`, `renderLeaf`, `onKeyDown`, and
  `onChange`. It changes where writes are expressed.
- "Primitive editor methods are simpler." Rejected for normal DX. They are
  shorter, but they make the large editor object the teaching surface and make
  `state` / `tx` look optional.
- "This is too much churn before publish." Rejected. This is exactly when the
  hard cut belongs.
- "Docs should stay close to legacy `Transforms.*`." Accepted in spirit:
  docs should teach `tx.nodes.*`, `tx.text.*`, `tx.selection.*`, and
  `tx.marks.*` as the transaction-owned successor to transform families.

Ecosystem objections answered:

- Plate may keep `editor.api` / `editor.tf` as its product adapter vocabulary.
  Raw Slate should not import those names.
- Plate migration proof is namespace and inference proof, not current-version
  adapter fixtures.
- slate-yjs migration proof is deterministic operation replay, commit metadata,
  and target locality, not current slate-yjs API compatibility.
- Plugin authors get extension namespaces on `state` and `tx`, not editor-object
  mutation.

Revision requirements from this pass:

- Add implementation acceptance criteria that docs, walkthroughs, examples, and
  public API pages teach `tx.*` as the normal write path.
- Add a release guard that allows primitive editor writes only in classified
  core/runtime/legacy transform fixtures.
- Update the hard-cut and proof sections so primitive editor writes are named as
  advanced/internal bridge APIs.
- Keep `applyOperations` as the explicit replay writer and outside the normal
  authoring-DX ban.

Next owner:

- Revision pass. Fold the public write-policy objection answers into the main
  API target, hard cuts, proof matrix, implementation phases, and final gates.

## 2.5 2026-04-28 Slate Review Rerun: Pass 5 Revision

Status: complete for Pass 5 only. Completion remains `pending` until the
closure pass verifies the gates.

Verdict: the plan now owns the hardened public write policy in the main
execution sections, not only in the objection notes.

Revision decisions:

- `tx.*` is the only normal public write path.
- primitive `editor.*` write methods are advanced/internal bridge APIs.
- first-party docs, walkthroughs, examples, and public API pages must teach
  `tx.*`.
- low-level primitive transform fixtures may stay only when classified as
  core/runtime/legacy transform fixtures.
- `applyOperations` remains the explicit operation replay writer and is outside
  the normal authoring-DX ban.
- Plate may keep `editor.api` / `editor.tf` as adapter vocabulary; raw Slate
  does not import those names.

Score: `0.923`.

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.91 | The revision does not alter the React runtime owner, but the API target now prevents docs/examples from bypassing transaction-owned dirty commits with primitive write teaching. |
| Slate-close unopinionated DX | 0.20 | 0.92 | Section 4 now makes `tx.*` the normal authoring path while preserving Slate's transform-family mental model; Row 2b records the adoption story and rejects primitive editor writes as normal docs/API DX. |
| Plate and slate-yjs migration-backbone shape | 0.15 | 0.94 | Phase 6 and the final gates keep migration proof at the backbone layer: typed `state` / `tx` extension groups, operation replay, commit metadata, and local target behavior without current-version Plate/slate-yjs adapters. |
| Regression-proof testing strategy | 0.20 | 0.93 | The proof matrix, release-discipline gate, and final gates now require first-party authoring docs/examples/API pages to use `tx.*` and classify any primitive write fixtures explicitly. |
| Research evidence completeness | 0.15 | 0.91 | No research contradiction remains after the state/tx live-source refresh and Row 2b adoption answer. |
| shadcn-style composability and hook/component minimalism | 0.10 | 0.93 | The final public shape keeps one normal write surface, one operation-replay escape hatch, and one classified bridge for internals. |

Weighted total: `0.923`.

Plan changes from revision:

- Strengthened the Public API Target section with the final normal/advanced
  write split.
- Added a proof-matrix row for public write surface guards.
- Updated hard cuts to ban primitive editor writes as normal authoring DX, even
  inside `editor.update`.
- Added Phase 1, Phase 7, fast-gate, and final-gate criteria for
  docs/examples/API guardrails.
- Kept current Plate/slate-yjs adapter support out of scope.

Next owner:

- Closure pass. Verify score threshold, dimension floors, pass-state ledger,
  objection rows, public API certainty, and final gates, then set
  `tmp/completion-check.md` to `done` only if everything still passes.

## 2.6 2026-04-28 Slate Review Rerun: Pass 6 Closure

Status: complete. The slate-review rerun is closed.

Verdict: pass the plan. The rerun did not find a reason to pivot away from the
accepted architecture. It found one real public-DX gap: primitive
`editor.*` writes were still being treated as normal authoring material in live
docs/examples. The final plan closes that gap by making `tx.*` the only normal
public write path and by classifying primitive editor writes as
advanced/internal bridge APIs.

Closure score: `0.923`.

Closure gates checked:

- total score is above the `0.92` threshold
- every score dimension is above the `0.85` floor
- every score dimension cites concrete file, research, test, or plan evidence
- no unplanned P0/P1 issue remains
- no public API surface is left in "maybe" language
- maintainer and ecosystem objections for the `tx.*` write policy are answered
- migration remains architecture-backbone proof, not current-version
  Plate/slate-yjs adapter support
- implementation phases, proof matrix, browser/release strategy, hard cuts,
  fast gates, and final gates include the public write policy
- pass-state ledger proves the rerun sequence through closure
- plan deltas record the rerun changes

Final decision:

- Keep `editor.read((state) => ...)`.
- Keep `editor.update((tx) => ...)`.
- Teach normal writes through `tx.nodes.*`, `tx.text.*`, `tx.selection.*`, and
  `tx.marks.*`.
- Keep primitive `editor.*` writes only as advanced/internal bridge APIs.
- Keep `applyOperations` as the explicit replay writer.
- Keep raw Slate free of Plate-owned `editor.api` / `editor.tf` vocabulary.

## 3. Source-Backed Architecture North Star

Steal only the parts that beat Slate:

- Lexical: read/update lifecycle and active-context legality.
- ProseMirror: transaction-owned document, selection, marks, and metadata.
- Tiptap: extension packaging and discoverable product DX.

Reject:

- Lexical class-node identity and `$` public functions.
- ProseMirror integer positions and schema-first identity as the core Slate
  model.
- Tiptap chain-first product ceremony as raw Slate's primary API.

## 3.1 Pass 8 Research Pressure Verdict

Verdict: the plan is using research correctly. The external systems are proof
sources for specific disciplines, not vague prestige citations.

What held up:

- The `state` / `tx` decision is accepted and directly ties the public API to
  Lexical read/update lifecycle, ProseMirror transaction ownership, and Tiptap
  extension discoverability.
- Lexical source backs the read/update and active-context claim:
  `LexicalEditor.read` / `update` are explicit instance methods, active editor
  state is required during read/update callbacks, and dirty leaves/elements are
  tracked below rendering.
- ProseMirror source backs transaction ownership: transactions track document
  changes, selection changes, stored marks, scroll intent, and metadata; its
  selections also expose document-independent bookmarks.
- Tiptap source backs the product-DX claim: extensions add commands,
  attributes, keyboard shortcuts, input rules, and paste rules; `CommandManager`
  builds single-command and chained-command APIs around one transaction.
- React 19.2 compiled research supports the projection-layer claim:
  `useSyncExternalStore`, `Activity`, deferred work, transitions, and
  Performance Tracks make React a strong UI scheduler, but not a replacement
  for an editor dirty-node runtime.
- Runtime-owned shell and spec-first renderer research directly explains why
  the void API should cut app-owned spacers and hidden anchors.

What this means:

- Keep the north star exactly as written:
  Slate model + operations, Lexical-style lifecycle, ProseMirror-style
  transaction and DOM-selection discipline, Tiptap-style extension/product DX,
  and React 19.2 projection/runtime subscriptions.
- Do not add new framework research before closure unless a maintainer or
  ecosystem pass exposes a contradiction.
- Keep the remaining work on plan pressure: simplicity, maintainer objections,
  ecosystem objections, revision, and closure.

No active claim in the plan is currently relying on uncited external-source
assertions.

Final north star:

```txt
Slate model + operations
small editor object
read-only state view
writable transaction view
runtime-owned render shells
node-scoped React selectors
generated browser parity proof
Plate/Yjs migration through stable operations and extension namespaces
```

## 4. Public API Target

### Editor

Keep the editor object small:

```ts
editor.read(fn)
editor.update(fn, options?)
editor.getSnapshot()
editor.subscribe(listener)
editor.extend(extension)
editor.schema
```

Do not document normal app code against flat mutation methods like:

```ts
editor.setNodes()
editor.removeNodes()
editor.insertText()
editor.select()
editor.addMark()
```

Those move behind `tx`.

Normal authoring surfaces must teach `tx.*`, not primitive editor writes:

```ts
editor.update((tx) => {
  tx.nodes.set({ type: 'heading' }, { at: target })
  tx.text.insert('hello')
  tx.selection.set(target)
})
```

Primitive write methods such as `editor.setNodes`, `editor.insertText`,
`editor.select`, and `editor.removeNodes` are advanced/internal bridge APIs.
They may remain for core runtime composition, codemods, and low-level legacy
transform fixtures, but first-party docs, examples, walkthroughs, and public
API pages must not present them as normal app authoring DX.

`editor.applyOperations(operations)` is separate. It is the explicit operation
replay writer for history, collaboration, and replay fixtures, not normal
authoring syntax.

### Read State

```ts
editor.read((state) => {
  state.value.get()
  state.selection.get()
  state.marks.get()

  state.nodes.get(target)
  state.nodes.parent(target)
  state.nodes.children(target)
  state.nodes.match(options)
  state.nodes.hasPath(path)

  state.points.before(target, options)
  state.points.after(target, options)
  state.ranges.get(target)
  state.ranges.edges(target)
  state.text.string(target)

  state.schema.isInline(element)
  state.schema.isVoid(element)
  state.schema.isSelectable(element)
  state.schema.markableVoid(element)
})
```

### Transaction

`tx` includes read groups plus write groups. Reads inside update observe the
transaction-in-progress.

```ts
editor.update((tx) => {
  tx.selection.get()
  tx.selection.set(target)
  tx.selection.collapse({ edge: 'end' })
  tx.selection.move({ distance: 1 })
  tx.selection.clear()

  tx.nodes.insert(node, { at })
  tx.nodes.insertMany(nodes, { at })
  tx.nodes.remove({ at })
  tx.nodes.set(props, { at })
  tx.nodes.unset(keys, { at })
  tx.nodes.split(options)
  tx.nodes.merge(options)
  tx.nodes.wrap(element, options)
  tx.nodes.unwrap(options)
  tx.nodes.move({ at, to })

  tx.text.insert('hello')
  tx.text.delete(options)

  tx.marks.add('bold', true)
  tx.marks.remove('bold')
  tx.marks.toggle('bold')

  tx.meta.set('source', 'keyboard')
  tx.history.undo()
  tx.history.redo()

  tx.normalize()
  tx.withoutNormalizing(() => {})
})
```

### Extension Namespaces

Extensions add namespaces to `state` and `tx`, not flat editor methods:

```ts
defineEditorExtension({
  key: 'table',
  state: {
    table(state) {
      return {
        currentCell() {},
        isInTable(target = state.selection.get()) {},
      }
    },
  },
  tx: {
    table(tx) {
      return {
        insertRow() {},
        removeColumn() {},
      }
    },
  },
})
```

Usage:

```ts
editor.read((state) => {
  state.table.currentCell()
})

editor.update((tx) => {
  tx.table.insertRow()
})
```

## 4.1 Pass 5 Unopinionated-Core Verdict

Verdict: raw Slate should expose lifecycle and primitive grouped capabilities,
not a product command catalog.

Keep in raw Slate:

- `editor.read((state) => ...)`
- `editor.update((tx) => ...)`
- small editor object: `read`, `update`, `getSnapshot`, `subscribe`,
  `extend`, `schema`
- core primitive groups on `state` and `tx`: `selection`, `nodes`, `text`,
  `marks`, `schema`, `meta`, `history`
- extension-provided groups on `state` and `tx`
- internal command middleware for browser/editing intent routing

Do not put in raw Slate public DX:

- `editor.commands`
- `editor.chain()`
- `chain().focus().run()` as toolbar ceremony
- extension `methods` that mutate the editor object
- top-level product helpers like `editor.table.insertRow()`
- direct instance predicates as the authoring story:
  `editor.isVoid`, `editor.isInline`, `editor.markableVoid`,
  `editor.isSelectable`

The critical distinction:

```ts
// Raw Slate primitive.
editor.update((tx) => {
  tx.nodes.set({ type: 'heading', level: 2 }, { at: target })
})

// Plate or extension sugar, still lifecycle-owned.
editor.update((tx) => {
  tx.table.insertRow()
})
```

That second shape is allowed only because `table` is an extension namespace on
`tx`, not because core Slate has a command catalog.

Evidence:

- legacy Slate docs split low-level transforms from custom commands, but also
  let command helpers grow on the editor object; v2 should keep the primitive
  flexibility and cut the object-growth part
- Tiptap source proves `editor.commands` and `editor.chain()` are strong
  product DX, but also proves why that ceremony should stay above raw Slate
- current v2 already avoids public `editor.commands`, but its extension
  `methods` path still recomposes methods onto the editor object; that is the
  next hard cut for this API lane

Implementation consequence:

- rename the current internal command registry to intent/operation middleware
  language unless it is deliberately public
- replace extension `methods` with `state` and `tx` group registration
- add a public-surface contract that bans `editor.commands`, `editor.chain`,
  direct extension method recomposition, and normal-example predicate
  monkeypatching
- let Plate expose `editor.tf`, `editor.api`, chains, toolbar commands, and
  product sugar as an adapter layer over raw `editor.update`

## 5. Internal Runtime Target

`editor.update` creates one transaction runtime:

```txt
editor.update
  -> tx snapshot view
  -> target resolution / rebasing
  -> primitive grouped writes
  -> operations
  -> EditorCommit
  -> history / collab / React / DOM repair / browser proof
```

Targets passed to renderers are rebasing runtime targets, not raw `Path`
values. A target can resolve to the current path, range, runtime id, or null if
the node no longer exists.

Core schema predicates compile from element specs and extension predicates:

```ts
defineElement({
  type: 'mention',
  inline: true,
  void: 'markable-inline',
  selectable: true,
})
```

Manual predicate overrides remain advanced extension policy.

## 6. Hook / Component / Render DX Target

### Void Render

Hard cut:

```ts
renderVoid({ element, target })
```

Do not pass:

```ts
focused
selected
actions
children
attributes
```

Renderer example:

```tsx
function ImageVoid({ element, target }: RenderVoidProps<ImageElement>) {
  const editor = useEditor()
  const selected = useElementSelected(target)

  return (
    <ImageCard
      src={element.url}
      selected={selected}
      onRemove={() => {
        editor.update((tx) => {
          tx.nodes.remove({ at: target })
        })
      }}
    />
  )
}
```

This preserves content-only render DX and removes app-owned spacer/anchor
responsibility.

### Hook Renames

Hard cut before publish:

```txt
useSlateStatic      -> useEditor
useSlateSelector    -> useEditorSelector
useFocused          -> useEditorFocused
useSelected         -> useElementSelected
useReadOnly         -> useEditorReadOnly
useComposing        -> useEditorComposing
```

`useEditorSelector` is advanced. Public docs should teach named hooks first.

### Callback Names

Replace public `onSnapshotChange` with:

```tsx
<Slate
  onChange={({ value, selection, operations, snapshot, changed }) => {}}
  onCommit={(commit, snapshot) => {}}
/>
```

`onChange` is the normal public surface. `onCommit` is the low-level runtime
tap.

Do not ship raw Slate `onValueChange` or `onSelectionChange`. They are filtered
convenience callbacks that Plate or an app adapter can layer on top of
`onChange`.

### Keyboard Contract

Remove public `onKeyCommand`.

Keep Slate-close naming:

```tsx
<Editable
  onKeyDown={(event, ctx) => {
    if (isHotkey('mod+b', event)) {
      ctx.editor.update((tx) => {
        tx.marks.toggle('bold')
      })
      return true
    }
  }}
/>
```

Return contract:

- `true`: handled, prevent default, run model-owned repair
- `EditableRepairRequest`: handled with explicit repair policy
- `void`: fall through to runtime

## 6.1 Pass 4 DX Pressure Verdict

Verdict: keep the target API names, with two hard adjustments.

What stays close to Slate:

- keep `renderElement`, `renderLeaf`, `onKeyDown`, `onChange`,
  and `onCommit`
- keep normal element rendering as `attributes + children`
- keep hooks as the React escape hatch, but rename the confusing ones before
  publish

What must not stay:

- `onKeyCommand`; it is engine-shaped and duplicates `onKeyDown`
- `onSnapshotChange`; public users should not learn snapshots before
  value/selection/change semantics
- void render props with `children`, `attributes`, `actions`, `focused`, or
  `selected`
- `RenderVoidPropsFor` casts in examples
- `useSlateStatic` as the public "get editor" hook name
- top-level `editor.isVoid`, `editor.markableVoid`, and `editor.isSelectable`
  as the normal authoring story

Final naming:

- `editor.read((state) => ...)`
- `editor.update((tx) => ...)`
- `renderVoid({ element, target })`
- `useEditor()`
- `useEditorSelector()` for advanced selector work
- `useElementSelected(target)` and `useEditorFocused()` as opt-in hooks
- `<Editable onKeyDown={(event, ctx) => ...} />`
- `<Slate onChange={...} onCommit={...} />`

Reason:

- this is close enough to Slate for migration because the mental model keeps
  `Editable`, `renderElement`, `renderLeaf`, `onKeyDown`, `onChange`, value,
  selection, and operations
- it is not legacy-compatible for voids or filtered callbacks because those are
  exactly the footguns and duplicate surfaces that caused drift
- `state` / `tx` is better than `api` / `tf` for raw Slate because it is
  semantic English and not Plate-shaped

## 6.2 Pass 9 Simplicity Pressure Verdict

Verdict: the plan is simpler after one real cut. Raw Slate should expose one
normal public path and one advanced escape hatch per surface.

Final public/advanced split:

- editor lifecycle: public `editor.read` and `editor.update`; advanced
  `getSnapshot` / `subscribe` for stores and adapters
- writes: public writes only through `tx`; advanced replay through explicit
  `applyOperations`
- extension APIs: public extension namespaces on `state` and `tx`; no flat
  method injection on the editor object
- normal rendering: public `renderElement` / `renderLeaf` keep Slate-style
  `attributes + children`
- void rendering: public `renderVoid({ element, target })`; advanced
  `renderShellUnsafe` only when the author also owns browser contracts
- hooks: public named hooks like `useEditor`, `useElementSelected`, and
  `useEditorFocused`; advanced `useEditorSelector`
- keyboard: public `onKeyDown(event, ctx)`; no public `onKeyCommand` or
  `onCommand`
- callbacks: public `onChange`; advanced `onCommit`
- product sugar: Plate/adapters own `editor.api`, `editor.tf`, command
  catalogs, chains, and filtered callbacks

Cuts from raw Slate:

- `onValueChange` and `onSelectionChange`; they are convenience filters over
  `onChange`, not separate raw lifecycle APIs
- `editor.chain()` as future raw Slate possibility; it belongs in Plate/product
  sugar if needed
- compatibility aliases for hook renames, callbacks, void props, and extension
  method shapes

What stays:

- `onCommit` stays because collaboration, history, instrumentation, and adapters
  need a low-level runtime tap.
- `useEditorSelector` stays because advanced UI needs selector power, but docs
  should teach named hooks first.
- `renderShellUnsafe` may exist only as an explicitly ugly escape hatch with
  browser-contract proof.

Simplicity rule for implementation:

```txt
If a raw Slate API exists only because it is convenient sugar, move it to Plate.
If a raw Slate API can corrupt browser/runtime ownership, make it advanced and
require proof.
```

## 7. Plate Migration Backbone Target

Plate may later expose product APIs on top of Slate primitives:

```ts
editor.update((tx) => {
  tx.table.insertRow()
  tx.link.toggle({ href })
})
```

Raw Slate must not implement or support current Plate `editor.tf` /
`editor.api` directly. Those names are Plate-owned product sugar if Plate
chooses to build an adapter later.

Backbone route:

1. Raw Slate extension namespaces can express transform groups like
   `tx.table.*` and query groups like `state.table.*`.
2. Raw Slate schema/spec policy can express inline, void, markable-void,
   selectable, and read-only node behavior without renderer-owned DOM hacks.
3. Raw Slate keeps operation output stable so collaboration and history do
   not fork.
4. Plate owns any current-API adapter, compatibility layer, chain API, toolbar
   command sugar, or codemod.

Proof required:

- synthetic table/link/media-style namespace fixtures compile against
  `state.<plugin>` and `tx.<plugin>` groups
- type inference proves extension groups compose without widening the editor
  object
- content-only void renderers cover media-style nodes without
  `RenderVoidPropsFor` casts
- no proof fixture imports or promises support for current Plate APIs

## 8. slate-yjs Migration Backbone Target

The collab contract remains operations, commits, snapshots, and deterministic
normalization.

Rules:

- remote operations apply through transaction/runtime entrypoints
- remote apply carries metadata like `source: 'remote'`
- targets are local UI handles, not serialized collaboration identity
- serialized document state stays Slate value + operations
- collab does not depend on React render targets

Proof required:

- local update -> operations -> remote replay -> same snapshot
- remote apply does not fire local DOM repair as user input
- target refs rebase or null after concurrent remove/move
- normalization produces deterministic operations under remote replay
- remote commits preserve metadata without depending on React `onChange` /
  `onCommit`
- stale local `EditorTarget` handles fail softly or rebase through runtime APIs;
  they never become serialized collaboration identity
- no proof fixture imports or promises support for current slate-yjs APIs

## 8.1 Pass 6 Migration Verdict

Verdict: the migration path is credible only as a raw Slate backbone. The
previous adapter-fixture requirement was too high and is cut. Slate v2 should
prove the substrate that Plate/slate-yjs can migrate to, not support their
current versions.

Table/plugin row:

- Current Plate table config already separates typed read helpers from typed
  transforms.
- `api.create.table`, `api.table.getSelectedCell`, and
  `api.table.isCellSelected` map to `state.create.*` and `state.table.*`.
- `tf.insert.tableRow`, `tf.remove.tableColumn`, and `tf.table.merge` are
  examples of product transforms that can map to raw `tx.insert.*` /
  `tx.table.*` groups later.

Link/mark row:

- Link is an inline element plugin with parsing, normalization, and product
  options; it does not require raw Slate to grow link-specific editor methods.
- Mark plugins already expose product sugar like `editor.tf.toggleMark(type)`.
  Raw Slate should expose primitive mark transforms on `tx.marks.*`; Plate can
  keep `tf.bold.toggle()` or equivalent adapter sugar.

Void/media row:

- Image declares `isVoid` and media insertion transforms today.
- Slate v2 should compile this into an element spec with runtime-owned shell,
  hidden anchor, and selection mapping.
- Plate media commands map to `tx.image.*` / `tx.media.*` adapter groups rather
  than renderer-owned `children`, `attributes`, or `actions`.

Type-inference row:

- Plate's current `PluginConfig` generic slots prove the ecosystem depends on
  inferred API, transform, option, and selector groups.
- The v2 extension API must preserve group inference on `state` and `tx` so
  examples do not need casts like `RenderVoidPropsFor`.
- The target is inferred plugin groups, not a manually widened global editor
  object.

slate-yjs / operation replay row:

- Raw Slate owns value, operations, snapshots, commits, commit tags, and the
  explicit `applyOperations` replay entrypoint.
- slate-yjs and Plate own providers, awareness, CRDT wiring, cursor UI, and
  product lifecycle APIs.
- Runtime ids, local targets, DOM shells, hidden anchors, and React render props
  stay local runtime facts. They must not become serialized collaboration
  identity.

Keep:

- Plate may keep `editor.api` / `editor.tf` as its own product names.
- Raw Slate exposes `state` / `tx`, not `api` / `tf`, not product command
  catalogs, and not chain-first toolbar ceremony.

Backbone proof required before closure:

- table/link/media-style extension namespace fixtures compile against inferred
  `state.<plugin>` and `tx.<plugin>` groups
- mark/media fixtures compile without raw Slate link/media-specific methods
- content-only void renderer fixtures cover media-like nodes
- extension namespace type fixture proves inferred plugin groups without casts
- collab-backbone fixture applies operations with remote metadata and publishes
  one tagged commit without importing slate-yjs

## 9. Legacy Regression Proof Matrix

| Family | Required proof |
| --- | --- |
| Inline void navigation | `mentions`, `inlines`, and stress family `inline-void-boundary-navigation`; assert model selection, DOM selection, render budget. |
| Block void navigation | `images`, `embeds`, stress family `block-void-navigation`; assert no spacer layout gap and selection before/on/after. |
| Markable inline void | `mentions`, stress family `markable-inline-void-formatting`; assert mark styling, selection, render budget. |
| Editable island | `editable-voids`; assert native input focus stays inside island and outer editor selection restores. |
| Keyboard command handling | examples using `onKeyCommand` become `onKeyDown(event, ctx)` rows; assert handled return prevents default and model repair runs. |
| Change callbacks | unit tests for `onChange` and `onCommit`; assert `changed` distinguishes value-only, selection-only, metadata-only, and remote commits. |
| Hook renames | public surface contract tests; no exported old names before publish. |
| State/tx lifecycle | unit tests: reads outside callback fail or route through snapshot; writes outside update fail; reads inside `tx` see transaction-local changes. |
| Public write surface | release-discipline guard: first-party authoring docs, examples, walkthroughs, and public API pages teach `tx.*`; primitive editor write usages are allowed only in classified core/runtime/legacy transform fixtures. |
| Extension namespaces | unit tests: extension state group, tx group, conflict detection, dependency order, cleanup. |
| Plate migration backbone | synthetic table/link/media-style namespace fixtures prove `state.<plugin>` / `tx.<plugin>` composition without promising current Plate API support. |
| Collab migration backbone | remote operation replay, commit metadata, deterministic normalization, and target rebase/null behavior without promising current slate-yjs API support. |
| Plugin browser contracts | plugin-provided browser rows can register with the generated proof system without copy-pasting Playwright mechanics. |
| Ecosystem TypeScript | fixtures for nested plugin groups, collision errors, composed inference, and `state.<plugin>` / `tx.<plugin>` augmentation. |

## 10. Browser Stress / Parity Strategy

Fast CI:

- focused unit contracts
- `slate-browser` core proof
- selected browser rows for reported regressions
- render budget assertions on hot paths
- public surface contracts for removed callbacks/hooks/void props
- migration-backbone type fixtures for plugin-style `state` / `tx` groups
- stale-target unit contracts

Sparing stress:

- `bun test:stress`
- replay artifacts through `STRESS_REPLAY`
- full operation-family gauntlets for selection, voids, paste, deletion, IME,
  keyboard command handling, and change callbacks
- plugin-provided browser contract rows for table, media, link/mark, and
  editable-island packages

Release gate:

- `bun check:full`
- generated legacy-vs-v2 parity rows for the same scenario families
- persistent-profile soak
- raw device mobile proof only when the claim is mobile-device behavior

## 10.1 Pass 3 Performance Pressure Verdict

Verdict: keep the target architecture, but do not close performance yet.

What held up:

- mounted node/text rendering already routes through runtime-id selectors:
  `useMountedNodeRenderSelector` and `useMountedTextRenderSelector`
- runtime-id selector wakeups are dirty-id aware through
  `change.nodeImpactRuntimeIds`
- text render selectors can skip synced text operations on the hot DOM-sync
  path
- root sources are named wrappers for top-level runtime ids, selected island,
  placeholder, and root commit wakeup
- render profiler plumbing exists in `slate-react`, `slate-browser`,
  integration tests, and generated stress tests

What still fails the absolute bar:

- `EditableRenderedVoid` still computes `focused` and `selected` for every void
  renderer before user render code runs
- `useFocused()` is cheap but broad by design; it should not be injected into
  every void renderer by default
- `useSelected()` is runtime-id filtered, but still opt-out instead of opt-in
  for void authors

Required plan response:

- `renderVoid` must receive `element + target` only
- selection/focus UI must move to opt-in hooks such as `useSelected(target)` or
  `useElementSelected(target)`
- performance closure must include render-budget proof for block voids, inline
  voids, search decorations, table boundary navigation, and mouse selection
- broad `useSlateSelector` remains allowed only inside named source hooks or
  advanced APIs, not as the ordinary hot-render authoring surface

## 10.2 Pass 7 Regression Pressure Verdict

Verdict: the regression strategy is finally pointed at the right owner, but it
is not closure-grade yet.

What held up:

- `slate-browser` owns operation-family contracts instead of leaving examples
  as the primary safety net.
- The generated stress suite already covers the user-reported families:
  inline void navigation, markable inline voids, block voids, editable islands,
  table cell boundary navigation, search decoration focus, mouse selection
  toolbar visibility, paste normalization, and IME selection repair.
- The stress runner emits replayable artifacts, and `STRESS_REPLAY` replays the
  generated browser steps against the same route and surface.
- Render profiler assertions are part of the browser scenario language, so
  regression proof can include "did not rerender broad React roots" rather than
  only "the DOM looked right."
- Release scripts keep full browser proof out of the fast `bun check` loop and
  reserve it for `bun check:full`, `test:stress`, and release gates.

What still fails closure:

- The planned public hard cuts are not all contract-tested under their final
  names. Current tests still reference `onSnapshotChange` and `useSlateStatic`.
- `onKeyDown(event, ctx)` handled-result behavior needs an explicit browser or
  unit row replacing public `onKeyCommand`.
- `onChange` and `onCommit` need final callback contract tests that distinguish
  value-only, selection-only, metadata-only, and remote commits.
- Hook rename proof needs a public export contract: old names absent, new names
  present, examples using the final names only.
- Final `state` / `tx` namespace proof needs both unit type fixtures and at
  least one browser row proving commands routed through `tx` still repair DOM
  selection correctly.

Required plan response:

- Keep fast CI narrow: release-discipline unit contracts, `slate-browser` core
  proof, selected integration examples, and targeted render budgets.
- Keep slow human-like proof in `test:stress` and `test:stress:replay`, not in
  default CI.
- Add implementation acceptance criteria for:
  - final callback names
  - final hook names
  - final `state` / `tx` lifecycle and namespace fixtures
  - final `onKeyDown(event, ctx)` handled-result contract
  - Plate/Yjs migration-backbone replay rows
- Treat examples as demo surfaces only. Any regression first discovered in an
  example must become a reusable `slate-browser` contract family or step kind.

## 11. Hard Cuts And Rejected Alternatives

Hard cut:

- public `onKeyCommand`
- public `onSnapshotChange`
- raw Slate `onValueChange` / `onSelectionChange`
- eager `focused` / `selected` / `actions` in `renderVoid`
- renderer-owned void children/spacer/attributes
- normal public `useSlateStatic`
- flat public extension method injection on the editor object
- primitive editor write methods as normal public authoring DX, even inside
  `editor.update`
- top-level schema predicates as normal authoring surface
- compatibility aliases before publish

Rejected:

- `editor.update(({ api, tf }) => {})`
- `editor.update(() => editor.setNodes(...))` as normal first-party docs/API DX
- `editor.api` / `editor.tf` in raw Slate
- Tiptap-style flat `editor.commands` as core API
- keeping Slate legacy void renderer shape for compatibility
- making examples the primary safety net

## 12. Slate Maintainer Objection Ledger

### Row 1: Read/update with `state` and `tx`

- Change: make `editor.read((state) => ...)` and `editor.update((tx) => ...)`
  the public lifecycle.
- Who feels pain: raw Slate users, plugin authors, Plate, slate-yjs.
- Likely objection: "Slate was flexible because I could call editor methods
  directly; this makes simple code ceremony."
- Why this is not change for change's sake: stale reads and writes outside a
  coherent update caused the exact class of toolbar, selection, DOM repair, and
  browser timing bugs the v2 work is eliminating.
- Evidence: Lexical active-context legality in
  `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalUpdates.ts:101`;
  ProseMirror transaction ownership in
  `/Users/zbeyens/git/prosemirror/state/src/transaction.ts:22`.
- Rejected alternative: keep flat editor methods but assert at runtime. Weaker
  because autocomplete still teaches illegal shape.
- Migration answer: direct mutation examples move into `editor.update((tx) => ...)`;
  reads move into `editor.read((state) => ...)`.
- Docs / example answer: "read state, update transaction" guide with before and
  after examples for common Slate transforms.
- Regression proof: lifecycle unit contracts plus browser command rows.
- Plate/plugin answer: Plate maps transforms to `tx.<plugin>.*`.
- slate-yjs answer: operations and commits remain the serialized contract.
- Verdict: keep.

### Row 2: Grouped `state` / `tx` APIs instead of flat editor methods

- Change: move primitive groups to `state.selection`, `state.nodes`, `tx.nodes`,
  `tx.marks`, etc.
- Who feels pain: raw Slate users and TypeScript users.
- Likely objection: "This is a new API, not just safer Slate."
- Why this is not change for change's sake: the live `BaseEditor` surface is
  already large and mixed; read/write groups reduce clutter and prevent writes
  from existing in read context.
- Evidence: flat surface in
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:118`.
- Rejected alternative: `editor.api` / `editor.tf`. Weaker because it leaves
  writes visible outside update and uses unclear names.
- Migration answer: codemod maps `editor.setNodes(props, opts)` to
  `editor.update((tx) => tx.nodes.set(props, opts))`.
- Docs / example answer: grouped method reference generated from the public
  types.
- Regression proof: type tests and lifecycle tests for every grouped method.
- Plate/plugin answer: plugin groups extend the same namespace pattern.
- slate-yjs answer: grouped methods still emit Slate operations.
- Verdict: keep.

### Row 2b: Primitive editor writes become advanced/internal bridge APIs

- Change: normal authoring docs and examples use `tx.*`; primitive
  `editor.insertText`, `editor.setNodes`, `editor.select`, and similar writes
  may remain only as advanced/internal bridge APIs.
- Who feels pain: Slate users migrating from direct transform examples, docs
  authors, and low-level transform-test maintainers.
- Likely objection: "`editor.update(() => editor.insertText())` is shorter and
  already guarded by runtime checks."
- Why this is not change for change's sake: runtime checks prevent illegal
  writes, but autocomplete and docs would still teach the large editor object
  as the write API. That undermines the `state` / `tx` architecture.
- Evidence:
  `/Users/zbeyens/git/slate-v2/docs/concepts/04-transforms.md:3`;
  `/Users/zbeyens/git/slate-v2/packages/slate/test/write-boundary-contract.ts:79`;
  `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md:27`.
- Rejected alternative: keep primitive editor writes as the normal public path
  inside update. Weaker because `state` / `tx` becomes ceremony instead of the
  public architecture.
- Migration answer: docs map legacy transform families to `tx.nodes.*`,
  `tx.text.*`, `tx.selection.*`, and `tx.marks.*`; codemods can rewrite common
  `editor.update(() => editor.setNodes(...))` forms to
  `editor.update((tx) => tx.nodes.set(...))`.
- Docs / example answer: first-party authoring docs, examples, walkthroughs,
  and public API pages teach `tx.*` only.
- Regression proof: release guard greps first-party authoring surfaces for
  primitive editor writes; low-level primitive fixtures must be explicitly
  classified.
- Plate/plugin answer: Plate product sugar can still expose `editor.tf`; raw
  Slate extension transforms attach to `tx.<plugin>`.
- slate-yjs answer: no serialized contract change; operation replay continues
  through explicit `applyOperations`.
- Verdict: keep.

### Row 3: Extension namespaces instead of editor method injection

- Change: extensions add `state.table.*` and `tx.table.*`, not flat
  `editor.insertRow`.
- Who feels pain: plugin authors and Plate maintainers.
- Likely objection: "Flat methods are easy to call and match current
  extension style."
- Why this is not change for change's sake: live extension registration writes
  methods onto the editor object and manually detects conflicts; namespaces make
  ownership visible.
- Evidence:
  `/Users/zbeyens/git/slate-v2/packages/slate/src/core/editor-extension.ts:156`;
  Tiptap proves extension commands are valuable in
  `/Users/zbeyens/git/tiptap/packages/core/src/Extendable.ts:113`.
- Rejected alternative: keep flat method injection. Weaker because collisions
  are inevitable as ecosystem APIs grow.
- Migration answer: extension method maps split into `state` and `tx` groups.
- Docs / example answer: table extension example with `state.table` and
  `tx.table`.
- Regression proof: conflict/dependency/cleanup unit tests.
- Plate/plugin answer: Plate gets clean grouped plugin APIs without wrapping
  every core call.
- slate-yjs answer: extension methods only build operations; remote apply does
  not serialize extension method names.
- Verdict: keep.

### Row 4: `renderVoid({ element, target })`

- Change: remove `focused`, `selected`, and `actions` from normal `renderVoid`.
- Who feels pain: app authors currently using `actions.remove()` and
  `selected`.
- Likely objection: "You removed convenient props for a perf theory."
- Why this is not change for change's sake: current void renderers subscribe to
  global focus and node selection before user code decides whether it needs
  them.
- Evidence:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:208`;
  void stress render budgets in
  `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:410`.
- Rejected alternative: keep eager props and rely on dirty-id filtering. Weaker
  because global focus still fans out to every consumer.
- Migration answer: use `const selected = useElementSelected(target)` and
  `editor.update((tx) => tx.nodes.remove({ at: target }))`.
- Docs / example answer: image, mention, video, and editable-island examples.
- Regression proof: render budget rows for selecting before/on/after voids.
- Plate/plugin answer: Plate UI components receive minimal props and call
  editor update methods.
- slate-yjs answer: target is local-only, rebased or null; serialized ops do
  not depend on render props.
- Verdict: keep.

### Row 5: `onKeyDown(event, ctx)` instead of public `onKeyCommand`

- Change: remove public `onKeyCommand`; strengthen Slate-close `onKeyDown`.
- Who feels pain: examples and app code using `onKeyCommand`.
- Likely objection: "Why invent a new return contract on a React event?"
- Why this is not change for change's sake: the runtime needs an explicit
  model-owned handled signal to prevent native DOM drift and repair selection.
- Evidence:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts:117`.
- Rejected alternative: keep both. Weaker because two public keyboard surfaces
  teach users to pick the wrong one.
- Migration answer: move handler body to `onKeyDown`, return `true` or an
  `EditableRepairRequest`.
- Docs / example answer: markdown shortcuts, rich text, check lists, tables,
  images, mentions.
- Regression proof: keyboard rows asserting preventDefault, model selection,
  DOM selection, and follow-up typing.
- Plate/plugin answer: Plate hotkeys call `editor.update((tx) => ...)` through
  the same contract.
- slate-yjs answer: no collab surface change; only local event ownership.
- Verdict: keep.

### Row 6: `onChange` / `onCommit` instead of duplicate change callbacks

- Change: make `onChange` the normal callback and `onCommit` the low-level
  commit tap. Do not ship raw Slate `onSnapshotChange`, `onValueChange`, or
  `onSelectionChange`.
- Who feels pain: users already wired to `onSnapshotChange` and users who
  expected separate value-only or selection-only callbacks in raw Slate.
- Likely objection: "Snapshot is the honest runtime object; why hide it?"
- Why this is not change for change's sake: `onSnapshotChange` is engine-shaped
  and makes normal app state sync feel internal.
- Evidence:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate.tsx:35`.
- Rejected alternative: keep `onSnapshotChange` and document it. Weaker because
  it leaves the primary API less Slate-close than necessary.
- Migration answer: `onSnapshotChange((snapshot, commit) => ...)` becomes
  `onCommit((commit, snapshot) => ...)` or
  `onChange(({ snapshot, commit, changed }) => ...)`. Existing value-only and
  selection-only app callbacks become small filters over `onChange`.
- Docs / example answer: controlled value, selection-only, commit-listener
  examples.
- Regression proof: callback unit tests for value-only, selection-only,
  metadata-only, and remote commits.
- Plate/plugin answer: Plate can subscribe to `onChange` for app state and
  `onCommit` for low-level plugin telemetry.
- slate-yjs answer: collab listens to commits, not React callbacks.
- Verdict: keep.

### Row 7: Hook renames

- Change: `useSlateStatic` -> `useEditor`, `useSelected` ->
  `useElementSelected`, `useFocused` -> `useEditorFocused`, and related names.
- Who feels pain: current Slate React users and examples.
- Likely objection: "This is churn."
- Why this is not change for change's sake: `useSlateStatic` is obscure, and
  `useSelected` hides whether the selection is editor-wide or element-scoped.
- Evidence: current exports in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/index.ts:53`.
- Rejected alternative: keep aliases. Weaker before publish because aliases
  become permanent API debt.
- Migration answer: direct import rename.
- Docs / example answer: hook reference grouped by editor, element, and
  advanced selector hooks.
- Regression proof: public surface contract test and example typecheck.
- Plate/plugin answer: Plate can re-export names without compatibility junk.
- slate-yjs answer: not applicable to serialized collab contract.
- Verdict: keep.

### Row 8: Schema/spec predicates

- Change: move top-level `isInline`, `isVoid`, `markableVoid`, `isSelectable`
  into `editor.schema` and compiled element specs.
- Who feels pain: plugin authors overriding predicate functions.
- Likely objection: "Classic Slate made these simple functions."
- Why this is not change for change's sake: these are schema policy, not random
  editor methods; specs prevent every plugin from hand-rolling browser-critical
  void behavior.
- Evidence: current top-level predicates in
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:188`;
  node DX decision in
  `docs/research/decisions/editor-node-dx-should-use-runtime-owned-shells-and-spec-first-renderers.md`.
- Rejected alternative: keep predicates only. Weaker because it preserves void
  kind ambiguity.
- Migration answer: predicate plugins become element specs or schema extension
  predicates.
- Docs / example answer: mention/image/editable-island specs.
- Regression proof: generated browser rows per void kind and schema contract
  unit tests.
- Plate/plugin answer: Plate plugins map cleanly to element specs.
- slate-yjs answer: schema affects normalization deterministically; remote
  peers must share schema config.
- Verdict: keep.

### Row 9: Generated parity and stress gates

- Change: examples stop being the main safety net; `slate-browser` owns
  replayable operation-family contracts.
- Who feels pain: test authors and release maintainers.
- Likely objection: "This is slower and heavier."
- Why this is not change for change's sake: the user-reported regressions came
  from human editing sequences examples did not catch.
- Evidence: stress families in
  `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:46`;
  replay artifacts in
  `/Users/zbeyens/git/slate-v2/playwright/stress/replay.test.ts:19`.
- Rejected alternative: patch examples one by one. Weaker because regressions
  keep escaping through untested operation families.
- Migration answer: fast subset in CI, full stress under `test:stress` and
  release gates.
- Docs / example answer: testing guide with contract families and replay
  artifact workflow.
- Regression proof: this row is the proof strategy.
- Plate/plugin answer: Plate can add plugin-specific contract families without
  copying Playwright mechanics.
- slate-yjs answer: collab replay rows assert remote operation determinism.
- Verdict: keep.

### Row 10: No compatibility aliases before publish

- Change: remove old names instead of shipping aliases for unpublished APIs.
- Who feels pain: local examples and current branch users.
- Likely objection: "Aliases would make migration less annoying."
- Why this is not change for change's sake: the package is not published; aliases
  turn wrong API names into permanent support burden.
- Evidence: current examples still carry `RenderVoidPropsFor` casts and
  `onKeyCommand` usage, e.g.
  `/Users/zbeyens/git/slate-v2/site/examples/ts/images.tsx:50`.
- Rejected alternative: deprecate first. Weaker because there is no external
  release audience yet.
- Migration answer: one hard-cut branch with examples and tests migrated in the
  same pass.
- Docs / example answer: latest-state docs only, no changelog-style migration
  prose.
- Regression proof: public surface contract grep for removed names.
- Plate/plugin answer: Plate starts from final API.
- slate-yjs answer: no serialized contract effect.
- Verdict: keep.

## 12.1 Pass 10 Slate Maintainer Verdict

Verdict: keep the hard cuts. The maintainer objection pass did not find a
reason to pivot back toward compatibility aliases, eager render props, flat
editor methods, or duplicate callback surfaces.

The strongest fair objection is that this is a lot of change and can sound like
"not Slate anymore." That objection is valid only if the plan loses Slate's
authoring center. It does not. The plan keeps:

- document value and operations as the data model
- paths and ranges as the addressing model
- `Editable`, `renderElement`, `renderLeaf`, `onKeyDown`, and `onChange`
- plain React renderers for normal elements
- operation/commit boundaries for collaboration and history

The hard cuts target the places where the legacy shape actively teaches the
wrong owner:

- writes outside an update context
- browser selection policy living in React components
- app-owned void spacers and hidden anchors
- eager selection/focus subscriptions in every void renderer
- engine-shaped callback names as default app API
- flat extension methods colliding on the editor object
- examples acting as the regression system

Maintainer challenge results:

| Row | Decision | Maintainer answer |
| --- | --- | --- |
| 1. `state` / `tx` lifecycle | Keep | This is the largest mental shift, but it is the right one. It preserves Slate operations while making stale reads and illegal writes harder to author. |
| 2. grouped `state` / `tx` APIs | Keep | The grouped shape is more teachable than flat editor clutter. It also gives plugin namespaces one obvious home. |
| 3. extension namespaces | Keep | Flat method injection is convenient until two plugins pick the same verb. Namespace ownership is worth the break. |
| 4. `renderVoid({ element, target })` | Keep | Convenience props are not worth global focus/selection fanout. Users who draw selection UI can opt into node-scoped hooks. |
| 5. `onKeyDown(event, ctx)` | Keep with strict docs/tests | Do not rename Slate's public keyboard surface. Strengthen it with a handled/repair return contract instead of shipping `onKeyCommand`. |
| 6. `onChange` / `onCommit` | Keep, strengthened | Normal users get Slate-close `onChange`; low-level consumers get `onCommit`. Separate raw `onValueChange` / `onSelectionChange` would reintroduce callback sprawl. |
| 7. hook renames | Keep | `useEditor` and node-scoped hook names are clearer than legacy names. No aliases before publish. |
| 8. schema/spec predicates | Keep, but keep escape policy | Schema owns browser-critical node behavior. Advanced predicate policy can exist, but it should compile into schema behavior. |
| 9. generated browser proof | Keep | This is the only credible answer to "I cannot report every bug one by one." Fast CI stays narrow; stress/replay handles human-like breadth. |
| 10. no compatibility aliases | Keep | The API is unpublished. Shipping aliases now is debt with a warning label. |

Required strengthening from this pass:

- Every breaking change needs a mechanical adoption recipe in the execution
  plan or test fixture, not just prose.
- Callback cuts need examples for controlled value sync, selection observation,
  commit telemetry, and remote/collab commits.
- Hook renames need a public export contract and first-party examples using only
  the final names.
- `renderVoid({ element, target })` needs examples for image, mention, embed,
  and editable island shapes, with selection UI using opt-in hooks.
- `state` / `tx` namespaces need TypeScript fixtures for core groups and plugin
  group augmentation.
- The final implementation plan must keep user docs latest-state only; adoption
  recipes can live in the plan, codemods, fixtures, and PR notes.

No objection row moves to `drop` or `revise`. Row 6 was strengthened after the
Pass 9 callback simplification because raw `onValueChange` / `onSelectionChange`
are now explicitly cut.

## 12.2 Pass 11 Ecosystem Maintainer Verdict

Verdict: keep the architecture, but keep the ecosystem scope honest. The
ecosystem pass did not justify backing away from `state` /
`tx`, content-only void renderers, callback cuts, hook renames, schema/spec
predicates, or no aliases. It does not require Slate v2 to implement today's
Plate or slate-yjs adapters. The non-negotiable requirement is a migration
backbone: extension namespaces, operation replay, commit metadata, and local
target semantics must be good enough that those libraries can migrate.

Ecosystem challenge results:

| Perspective | Strongest objection | Decision | Required answer |
| --- | --- | --- | --- |
| Plate maintainer | Current Plate APIs, tests, and plugins rely heavily on `editor.api` / `editor.tf`; raw Slate `state` / `tx` could become churn with no product benefit. | Keep raw Slate `state` / `tx`; do not support current Plate APIs in raw Slate. Plate may build product sugar later. | Prove the backbone with synthetic table/link/media-style namespace fixtures and operation stability, not current-version adapter fixtures. |
| Plate plugin author | Extension namespaces can hurt inference if plugin groups, selectors, transforms, and options stop composing cleanly. | Keep extension namespaces. | Add TypeScript fixtures for nested plugin groups, collision errors, composed plugin inference, and `state.<plugin>` / `tx.<plugin>` augmentation. |
| slate-yjs maintainer | React callback names should not affect collaboration; target refs can go stale after remote operations. | Keep callback cuts and local `target` render props. Do not support current slate-yjs APIs directly. | Add raw collab-backbone contracts for remote operation replay, commit metadata, target rebasing/nullability, and no dependency on React `onChange` / `onCommit` for serialized collaboration. |
| Third-party plugin author | Runtime-owned void shells reduce footguns but can feel less flexible for unusual inline, editable-island, or embedded widgets. | Keep content-only renderers plus ugly unsafe escape hatch. | Add plugin-facing void kind examples for image, mention, embed, table-adjacent widget, and editable island; require `renderShellUnsafe` users to attach browser contracts. |
| Test/release maintainer | Generated browser contracts can become slow and hard to maintain. | Keep generated proof, split fast and slow lanes. | Add a plugin contract registry: fast core rows in CI, focused plugin rows on package change, full human-like replay in `test:stress` / release gates. |
| App author | Cutting `focused`, `selected`, and `actions` from void props removes convenient UI state. | Keep opt-in hooks and target-based editor methods. | Add small examples for selection UI, remove/select/set-node commands, stale target behavior, and toolbar usage. |

What this pass changes:

- Migration-backbone proof becomes a first-class requirement, not current
  Plate/slate-yjs adapter support.
- `editor.api` / `editor.tf` remain explicitly rejected as raw Slate names.
  Plate may own those names later if it builds product sugar.
- `EditorTarget` needs a stale-target policy:
  - local targets are stable enough for render-time commands
  - remote changes can invalidate targets
  - invalid targets fail softly or require rebasing through runtime APIs
  - serialized collaboration never depends on target identity
- Browser proof must be extensible by plugins. Otherwise "examples are demos"
  just moves the burden from examples to handwritten Playwright.
- TypeScript proof must cover ecosystem authoring, not only raw core methods.

No hard cut is dropped. The revision pass must fold these ecosystem constraints
into the implementation phases, final gates, and acceptance criteria.

## 12.3 Revision Pass Verdict

Verdict: the plan now owns the maintainer and ecosystem objections in its main
execution sections, not just in review notes.

Revision decisions:

- Keep the raw Slate API exactly as accepted: `editor.read((state) => ...)` and
  `editor.update((tx) => ...)`.
- Keep `editor.api` / `editor.tf` out of raw Slate and explicitly allow them as
  Plate-owned adapter names.
- Treat stale `EditorTarget` behavior as runtime policy, not an open design
  vibe: local handles may rebase or fail softly; remote/collab state never
  serializes target identity.
- Make plugin browser contracts first-class so regression proof scales beyond
  first-party examples.
- Make ecosystem TypeScript fixtures part of the implementation, not a closure
  afterthought.
- Keep docs latest-state only. Adoption recipes belong in execution plans,
  codemods, fixtures, and PR notes.

The plan now has a high enough score for closure review, but not for automatic
completion. Closure still needs to verify every gate and then set
`tmp/completion-check.md` to `done`.

## 12.4 Closure Pass Verdict

Verdict: close the review lane.

Closure gates checked:

- score is `0.924`, above the `0.92` threshold
- all score dimensions are at or above `0.92`
- every score dimension has concrete file, research, test, or ledger evidence
- no P0/P1 review issue remains unplanned
- no public API surface is left in "maybe" language
- every hard cut has an accepted maintainer objection row
- extension, plugin, Plate, and slate-yjs answers are present
- final implementation phases own the accepted maintainer/ecosystem constraints
- final proof gates cover public API cuts, callbacks, hooks, void renderers,
  Plate adapter sugar, stale targets, plugin browser contracts, and slate-yjs
  replay/commit behavior
- pass-state ledger proves the multi-pass sequence completed before closure
- plan deltas record what changed, what was dropped, what was strengthened, and
  what stayed unchanged

Historical note: this closed the previous review lane. The current rerun is
closed in sections 2.1 through 2.6 and the 2026-04-28 rerun pass-state ledger
below.

## 13. Pass Schedule And Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| Current-state read and initial score | complete | Rechecked live `renderVoid`, `onKeyCommand`, `onSnapshotChange`, flat editor methods, extension method mutation, and research index/log entries. | Reopened plan from single-pass closure to multi-pass pending state; demoted `0.928` to candidate closure target; active score is `0.806`. | None for Pass 1. | Research and live-source refresh pass. |
| Research and live-source refresh | complete | Rechecked Lexical `read`/`update` and active-context legality, Lexical extension packaging, ProseMirror transactions and `EditorState.tr`, Tiptap command/chain and extension hooks, official React 19.2 Activity/Performance Tracks, Slate selector context, and `slate-browser` selection/stress APIs. | Refreshed the React 19.2 source page to accepted/current; raised research score to `0.90`; kept closure pending. | None for Pass 2. | Performance pressure pass. |
| Performance pressure pass | complete | Rechecked runtime-id node/text selectors, root source filters, eager void selection/focus props, render profiler plumbing, and generated render-budget stress rows. | Added Pass 3 performance verdict; raised performance score to `0.88`; kept void eager subscription as a closure-blocking hard cut. | None for Pass 3; remaining work belongs to the implementation plan and later closure proof. | DX pressure pass. |
| DX pressure pass | complete | Rechecked legacy Slate `onKeyDown`, `onChange`, void docs, current v2 `onKeyCommand`, `onSnapshotChange`, `RenderVoidProps`, hook exports, and the state/tx decision page. | Added Pass 4 DX verdict; raised DX score to `0.89`; kept void compatibility as explicitly rejected. | None for Pass 4; unopinionated-core pressure remains. | Unopinionated-core pass. |
| Unopinionated-core pass | complete | Rechecked legacy Slate command/transform docs, current v2 `BaseEditor` flat method surface, extension method recomposition, internal command registry, public-surface contracts, Tiptap `CommandManager`, and the accepted state/tx decision page. | Added Pass 5 unopinionated-core verdict; raised active score to `0.871`; clarified that `editor.commands` / `editor.chain()` stay out of raw Slate and Plate owns product sugar. | None for Pass 5; migration proof remains. | Migration pass. |
| Migration pass | complete | Rechecked Plate table typed API/transform groups, link element config, mark transform sugar, image void/media transforms, Plate Yjs adapter APIs, the accepted `state` / `tx` decision, and current Slate v2 operation replay/commit contracts. | Added Pass 6 migration verdict; raised migration score to `0.88` and active score to `0.881`; clarified Plate can keep `editor.api` / `editor.tf` as adapter sugar while raw Slate stays `state` / `tx`. | None for Pass 6; regression proof remains. | Regression pass. |
| Regression pass | complete | Rechecked generated operation-family contracts, inline void, markable inline void, block void, paste image void, editable island, large-document runtime void, table boundary navigation, search decoration focus, mouse toolbar selection, IME, replay artifacts, render profiler assertions, release-discipline scripts, public-surface hard-cut tests, and remaining old callback/hook names in tests/docs. | Added Pass 7 regression verdict; raised regression score to `0.87` and active score to `0.887`; clarified that `slate-browser` owns regression families while examples stay demos. | Final callback, hook rename, `onKeyDown(event, ctx)`, and `state` / `tx` namespace contracts still need final-name proof before closure. | Research pass. |
| Research pass | complete | Rechecked research index/log, accepted `state` / `tx` decision, cross-corpus steal/reject decision, runtime-owned shell DX decision, React 19.2 source page, read/update corpus ledger, Lexical read/update and active-context source, ProseMirror transaction and bookmark source, and Tiptap command/extension source. | Added Pass 8 research verdict; raised research score to `0.92` and active score to `0.890`; confirmed no active plan claim relies on uncited external-source assertions. | None for Pass 8; simplicity pressure remains. | Simplicity pass. |
| Simplicity pass | complete | Rechecked editor lifecycle, mutation, extension, render, hook, keyboard, callback, product-sugar, alias, and escape-hatch surfaces against the one-public-path / one-advanced-escape-hatch rule. | Added Pass 9 simplicity verdict; cut raw `onValueChange` / `onSelectionChange`; closed raw `editor.chain()` as Plate/product-only; raised DX score to `0.92`, composability/minimalism to `0.91`, and active score to `0.895`. | None for Pass 9; maintainer objections remain. | Slate maintainer pass. |
| Slate maintainer pass | complete | Rechallenged all ten objection rows as a skeptical Slate maintainer: `state` / `tx`, grouped APIs, extension namespaces, content-only void renderers, `onKeyDown`, `onChange` / `onCommit`, hook renames, schema/spec predicates, generated proof, and no aliases. | Added Pass 10 maintainer verdict; strengthened Row 6 for the callback cuts after Pass 9; raised DX score to `0.93`, migration score to `0.89`, and active score to `0.899`. | None for Pass 10; ecosystem maintainer objections remain. | Ecosystem maintainer pass. |
| Ecosystem maintainer pass | complete | Rechecked Plate `editor.api` / `editor.tf` usage, table/image/Yjs plugins, type-test surfaces, slate-yjs init/collab contracts, plugin authoring pressure, app author void ergonomics, and generated browser proof ownership. | Added Pass 11 ecosystem verdict; made the Plate adapter layer, stale-target policy, plugin browser contract registry, and ecosystem TypeScript fixtures required; raised migration score to `0.91`, regression score to `0.88`, composability/minimalism to `0.92`, and active score to `0.905`. | None for Pass 11; revision pass must fold constraints into phases/gates. | Revision pass. |
| Revision pass | complete | Folded accepted maintainer/ecosystem constraints into the scorecard, Plate migration target, slate-yjs target, proof matrix, browser strategy, implementation phases, fast gates, open questions, and final completion gates. | Added revision verdict; made Plate adapter fixtures, stale-target policy, plugin browser contract registry, plugin void examples, ecosystem TypeScript fixtures, and slate-yjs remote commit/target proof core plan requirements; raised active score to `0.924`. | None for revision; closure must verify every final gate. | Closure pass. |
| Closure score and final gates | complete | Verified score threshold, dimension floors, evidence citations, accepted objection rows, ecosystem/collab answers, implementation phases, final proof gates, pass-state ledger, and plan deltas. | Added closure verdict; set active score to `0.924`; review lane is ready for `complete-plan` execution. | None. | Done. |

### 2026-04-28 Rerun Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| Current-state read and initial score | complete | Rechecked live `renderVoid`, callback names, hook alias greps, schema predicate greps, `BaseEditor` primitive method surface, first-party examples, write-boundary contracts, root runtime/event runtime, generated stress rows, plugin browser contract registry, collab runtime contracts, and research decision drift. | Reopened the plan from previous closure; set active score to `0.880`; marked the older primitive-method research wording as superseded by the newer state/tx decision; recorded public write-DX drift as P1. | P1 public write DX mismatch remains: accepted target is `tx.*`, but live examples/tests still teach primitive `editor.*` writes inside update. | Research and live-source refresh pass. |
| Research and live-source refresh | complete | Rechecked live `state` / `tx` contract tests, primitive write-boundary tests, `BaseEditor` primitive method wiring, docs concepts for transforms/editor, dirty runtime-id impact code, and refreshed the state/tx research decision. | Added Pass 2 verdict and score `0.886`; raised migration and research scores; recorded that `tx.*` is implemented but not yet the taught normal public write path. | P1 public write DX mismatch remains: choose `tx.*` as the only normal path and demote primitive editor writes, or revise the accepted API target. | Pressure passes. |
| DX/unopinionated-core public write pressure | complete | Rechecked live docs, API pages, examples/tests grep, `BaseEditor` primitive transform surface, `state/tx` contract tests, write-boundary tests, and the accepted state/tx research decision. | Added Pass 3 verdict and score `0.903`; chose `tx.*` as the only normal public write path; classified primitive editor writes as advanced/internal bridge APIs. | Objection rows still need to answer maintainer/ecosystem pushback to the hard public write split. | Maintainer and ecosystem objection pass. |
| Remaining pressure bridge | complete | Rechecked whether the hardened write policy changes runtime performance, regression, research, or composability requirements. | No runtime pivot; added docs/examples/public-surface guard as the main new regression/composability requirement. | None separate from revision. | Revision pass. |
| Maintainer and ecosystem objection passes | complete | Challenged `tx.*`-only normal writes against legacy Slate transforms/commands, Plate `editor.api` / `editor.tf`, media/table plugins, slate-yjs plugin pressure, v2 extension namespace type fixtures, and collab replay contracts. | Added Pass 4 verdict and score `0.918`; added objection Row 2b; kept primitive editor writes as advanced/internal bridge APIs only. | Revision pass must fold the objection answers into implementation phases and final gates. | Revision pass. |
| Revision pass | complete | Folded the public write-policy objection answers into the Public API Target, proof matrix, browser/release strategy, hard cuts, implementation phases, fast gates, and final gates. | Added Pass 5 verdict and score `0.923`; made docs/examples/API `tx.*` guards an implementation and closure requirement. | None for revision; closure must verify final gates. | Closure pass. |
| Closure pass | complete | Verified threshold, dimension floors, evidence citations, pass-state ledger, objection answers, public API certainty, implementation phases, proof matrix, fast gates, and final gates. | Added Pass 6 closure verdict; set rerun status to `done` with score `0.923`. | None. | Done. |

## 14. Plan Deltas From Review

2026-04-28 second slate-review rerun deltas:

- Reopened completion from `done` to `pending` for a new review cycle.
- Added a new Pass 1 current-state read with score `0.880`.
- Corrected the stale top verdict that still listed already-completed Phase 5-7
  items as open.
- Added a P1 review issue for public write-DX drift: `tx.*` is the accepted
  target, but examples/tests still teach primitive `editor.*` writes inside
  `editor.update`.
- Ran a research maintain cleanup so the older steal/reject/defer decision no
  longer justifies primitive editor methods as the final normal authoring DX.
- Named research and live-source refresh as the next owner.
- Completed second-rerun Pass 2 research/live-source refresh.
- Updated the state/tx decision page with live evidence that `tx.*` is
  implemented while docs/examples still teach primitive `editor.*` writes.
- Raised active score to `0.886`, but kept completion `pending` because DX is
  still below floor and the public write P1 remains.
- Named DX/unopinionated-core pressure over public write policy as the next
  owner.
- Completed second-rerun Pass 3 DX/unopinionated-core pressure.
- Chose `tx.*` as the only normal public write path.
- Classified primitive editor writes as advanced/internal bridge APIs rather
  than normal docs/examples/API reference material.
- Raised active score to `0.903`.
- Named maintainer and ecosystem objection pass as the next owner for the
  hardened public write policy.
- Completed second-rerun Pass 4 maintainer/ecosystem objection pass.
- Added objection Row 2b for primitive editor writes as advanced/internal bridge
  APIs.
- Kept `tx.*` as the normal public write path after checking legacy Slate,
  Plate, slate-yjs, v2 extension namespaces, and collab replay.
- Raised active score to `0.918`.
- Named revision pass as the next owner.
- Completed second-rerun Pass 5 revision.
- Folded the public write-policy objection answers into API target, proof
  matrix, browser strategy, hard cuts, implementation phases, fast gates, and
  final gates.
- Raised active score to `0.923`.
- Completed second-rerun Pass 6 closure.
- Verified the closure gates: score threshold, dimension floors, evidence,
  pass-state ledger, objection answers, public API certainty, and final gates.
- Set review status to `done`.
- Named closure pass as the next owner.

Pass 1 rerun deltas:

- Reopened the review from `done` to `pending`.
- Replaced the single-pass closure claim with a pass-state ledger.
- Demoted the prior `0.928` score to candidate closure target only.
- Set active Pass 1 score to `0.806`.
- Named Pass 2 as research and live-source refresh.

Pass 2 rerun deltas:

- Revalidated the compiled read/update corpus against live local source.
- Refreshed
  `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md`
  against the official React 19.2 release page.
- Confirmed no research contradiction against the `state` / `tx` namespace
  decision.
- Raised active score from `0.806` to `0.822`.
- Named Pass 3 as performance pressure pass.

Pass 3 rerun deltas:

- Added a dedicated performance pressure verdict.
- Confirmed runtime-id node/text selectors and named root source hooks are the
  right direction.
- Confirmed render-profiler and stress-budget proof hooks exist.
- Kept eager void `focused` / `selected` props as a hard closure blocker.
- Raised active score from `0.822` to `0.841`.
- Named Pass 4 as DX pressure pass.

Pass 4 rerun deltas:

- Added a dedicated DX pressure verdict.
- Accepted `state` / `tx`, `target`, `onKeyDown`, `onChange`, and content-only
  `renderVoid` as final names pending maintainer review.
- Rejected `api` / `tf`, public `onKeyCommand`, public `onSnapshotChange`,
  `RenderVoidPropsFor`, and app-owned void shell props.
- Raised active score from `0.841` to `0.859`.
- Named Pass 5 as unopinionated-core pressure pass.

Pass 5 rerun deltas:

- Added a dedicated unopinionated-core verdict.
- Confirmed raw Slate should not expose `editor.commands`, `editor.chain()`, or
  chain-first toolbar ceremony.
- Kept Tiptap-style command catalogs as Plate/product adapter sugar over
  `editor.update`.
- Kept extension-provided `state` / `tx` namespaces as the clean replacement
  for direct extension method recomposition onto the editor object.
- Raised active score from `0.859` to `0.871`.
- Named Pass 6 as migration pass.

Pass 6 rerun deltas:

- Added a dedicated migration verdict.
- Validated table/plugin, link/mark, void/media, type-inference, and
  slate-yjs/operation replay rows against current Plate and Slate v2 source.
- Kept Plate `editor.api` / `editor.tf` as adapter sugar, not raw Slate
  terminology.
- Confirmed `state` / `tx` extension namespaces are enough for Plate if the
  type system preserves inferred plugin groups.
- Raised active score from `0.871` to `0.881`.
- Named Pass 7 as regression pass.

Pass 7 rerun deltas:

- Added a dedicated regression pressure verdict.
- Confirmed the generated stress suite already maps the reported regression
  families to reusable browser contracts.
- Confirmed replay artifacts and render-budget assertions are first-class proof
  mechanisms.
- Kept examples classified as demos, not the regression spine.
- Identified closure gaps for final callback names, hook renames,
  `onKeyDown(event, ctx)`, and final `state` / `tx` namespace contracts.
- Raised active score from `0.881` to `0.887`.
- Named Pass 8 as research pass.

Pass 8 rerun deltas:

- Added a dedicated research pressure verdict.
- Revalidated the plan against the compiled research layer and live local
  Lexical, ProseMirror, and Tiptap source citations.
- Confirmed React 19.2 evidence supports React as projection/UI scheduler, not
  as a replacement for editor dirty-node runtime.
- Confirmed runtime-owned shell DX is backed by the node/render research lane.
- Found no contradiction in the accepted `state` / `tx` namespace decision.
- Raised active score from `0.887` to `0.890`.
- Named Pass 9 as simplicity pass.

Pass 9 rerun deltas:

- Added a dedicated simplicity pressure verdict.
- Reduced raw Slate callbacks to `onChange` plus advanced `onCommit`.
- Moved `onValueChange` and `onSelectionChange` to Plate/app adapter filters
  over `onChange`.
- Closed `editor.chain()` as Plate/product sugar only, not raw Slate.
- Confirmed every major surface has one obvious public path and at most one
  advanced escape hatch.
- Raised active score from `0.890` to `0.895`.
- Named Pass 10 as Slate maintainer pass.

Pass 10 rerun deltas:

- Added a dedicated Slate maintainer verdict.
- Rechallenged every objection row against Slate-ness, migration pain, docs,
  tests, Plate, and slate-yjs.
- Kept all ten hard cuts.
- Strengthened Row 6 for the post-Pass-9 callback surface:
  `onChange` plus advanced `onCommit`, no raw `onValueChange` /
  `onSelectionChange`.
- Added required strengthening for mechanical adoption recipes, final callback
  examples, hook export contracts, void examples, and `state` / `tx` type
  fixtures.
- Raised active score from `0.895` to `0.899`.
- Named Pass 11 as ecosystem maintainer pass.

Pass 11 rerun deltas:

- Added a dedicated ecosystem maintainer verdict.
- Rechallenged the plan from Plate maintainer, Plate plugin author, slate-yjs
  maintainer, third-party plugin author, test/release maintainer, and app author
  perspectives.
- Kept raw Slate `state` / `tx`; `editor.api` / `editor.tf` stay outside raw
  Slate and are Plate-owned if Plate builds product sugar later.
- Made migration-backbone proof, stale-target policy, plugin browser contract
  registry, plugin void examples, and ecosystem TypeScript fixtures required
  before closure.
- Raised active score from `0.899` to `0.905`.
- Named the revision pass as the next owner.

Revision pass deltas:

- Folded accepted objection answers into the main plan sections instead of
  leaving them only in Pass 10/11 verdicts.
- Added migration-backbone proof to migration target, proof matrix, phases, and
  final gates.
- Added stale `EditorTarget` policy to slate-yjs target, proof matrix, phases,
  open questions, and final gates.
- Added plugin browser contract registry requirements to browser strategy,
  phases, fast gates, and final gates.
- Added ecosystem TypeScript fixtures to migration target, proof matrix, phases,
  and final gates.
- Raised active score from `0.905` to `0.924`.
- Named closure as the next owner.

Closure pass deltas:

- Verified every `slate-review` completion threshold.
- Added a dedicated closure verdict.
- Marked the pass-state ledger complete through closure.
- Kept active score at `0.924`.
- Set the review lane to `done`.

Accepted decisions after revision:

Added decisions:

- `state` / `tx` naming is accepted.
- `tx` includes read groups.
- extension methods attach to `state` / `tx` namespaces.
- `editor.schema` owns predicate access.

Revised decisions:

- public keyboard API keeps Slate-close `onKeyDown` and cuts public
  `onKeyCommand`.
- public change API uses `onChange` and `onCommit`, not `onSnapshotChange`.
- raw Slate cuts `onValueChange` and `onSelectionChange`; Plate/adapters can
  reintroduce them as filters over `onChange`.
- `renderVoid` is `element + target` only.

Dropped decisions:

- `api` / `tf` names for raw Slate.
- top-level `actions` for void renderers.
- compatibility aliases before publish.
- optional `editor.chain()` in raw Slate.

Strengthened acceptance criteria:

- every hard cut has a public surface contract test
- every render hot path has render budget proof
- Plate and slate-yjs migration-backbone rows are required before closure
- migration-backbone fixtures prove plugin-style product sugar can be built over
  legal raw Slate read/update contexts
- stale `EditorTarget` behavior is specified and covered for local and remote
  changes
- plugin-provided browser contract rows can join the generated proof system
- ecosystem TypeScript fixtures cover plugin namespace inference and collisions

No-change decisions:

- keep Slate value and operation model
- keep `editor.read` / `editor.update`
- keep generated browser stress outside the fastest routine loop

## 15. Open Questions And What Would Change The Decision

No blocking open question remains for planning.

Non-blocking implementation choices:

- exact names for grouped methods where Slate legacy has multiple close terms

Closed implementation choice:

- `editor.chain()` belongs to Plate/product sugar only, not raw Slate.
- `EditorTarget` is a local runtime handle; it can rebase or fail softly, but it
  is not serialized collaboration identity.
- `editor.api` / `editor.tf` are Plate adapter names only.
- plugin browser contracts are part of the regression system, not bespoke
  example tests.

What would change the decision:

- a type-system proof that `state` / `tx` namespaces cannot preserve plugin
  inference
- a slate-yjs proof that target rebasing or nullability changes serialized
  operation determinism
- browser evidence that runtime-owned target refs add measurable hot-path cost
  beyond current path refs

## 16. Implementation Phases With Owners

### Phase 1: Core lifecycle and grouped API

Owner: `packages/slate`.

- introduce `EditorStateView` and `EditorTransactionView`
- implement grouped read APIs
- implement grouped tx write APIs
- classify primitive editor write methods as advanced/internal bridge APIs
- make writes outside `editor.update` fail in development/test
- add release-discipline coverage that first-party authoring docs/API/examples
  do not teach primitive editor writes as normal DX
- keep operation output identical where behavior is unchanged

### Phase 2: Extension namespace model

Owner: `packages/slate`.

- add extension `state` and `tx` namespaces
- migrate current flat `methods` registration
- add conflict and dependency tests
- keep commands/commit listeners/operation middleware as runtime slots
- add ecosystem TypeScript fixtures for nested groups, collision errors,
  composed plugin inference, and `state.<plugin>` / `tx.<plugin>` augmentation

### Phase 3: React render API and hook cleanup

Owner: `packages/slate-react`.

- replace `renderVoid` props with `element + target`
- remove eager `focused` / `selected` subscriptions
- define stale `EditorTarget` runtime behavior: rebase when possible, fail
  softly when invalid, never serialize target identity
- add `useEditor`, `useElementSelected`, `useEditorFocused`, and related
  renamed hooks
- cut old exports before publish
- remove `RenderVoidPropsFor` casts from examples
- add image, mention, embed, editable-island, and table-adjacent widget examples
  using content-only void renderers

### Phase 4: Event and callback API cleanup

Owner: `packages/slate-react`.

- remove public `onKeyCommand`
- make `onKeyDown(event, ctx)` carry handled/repair return contract
- replace public `onSnapshotChange` with `onChange` and `onCommit`
- remove raw `onValueChange` and `onSelectionChange`; adapters can filter
  `onChange`
- update all examples and tests
- add callback tests for controlled value sync, selection observation, commit
  telemetry, metadata-only commits, and remote commits

### Phase 5: Schema/spec surface

Owner: `packages/slate` and `packages/slate-react`.

- add `editor.schema`
- compile element specs into schema policy
- migrate void kind behavior to specs
- keep manual predicate overrides as advanced extension policy
- require `renderShellUnsafe` users to register browser contracts for owned DOM
  shell behavior

### Phase 6: Plate/slate-yjs migration backbone proof

Owner: raw Slate contracts.

- add synthetic table/link/media-style extension namespace fixtures
- prove plugin-style transforms cannot exist outside `editor.update` unless
  they go through `tx`
- prove plugin-style reads inside updates observe transaction-local state
- prove remote apply and operation replay stay deterministic without importing
  slate-yjs
- prove remote commit metadata does not depend on React callbacks
- prove local targets rebase or null after remote remove/move
- document migration-backbone rules and explicitly say current Plate/slate-yjs
  APIs are not supported by raw Slate

### Phase 7: Browser parity and release proof

Owner: `packages/slate-browser` and Playwright suite.

- add generated operation-family rows for every renamed public surface
- add legacy-vs-v2 parity rows for selection and void scenarios
- add a public write-surface guard for first-party docs, examples,
  walkthroughs, and public API pages: normal write examples use `tx.*`, and
  primitive editor write usages must be classified
- add a plugin browser contract registry so table/media/link/mark/editable
  island plugins can contribute replayable rows
- add stale-target browser rows around void selection, remote remove/move, and
  follow-up typing
- run focused browser rows, `test:stress`, and `bun check:full`

## 17. Fast Driver Gates

During implementation:

```bash
bun --filter slate test
bun --filter slate-react test:vitest
bun --filter slate-browser test:core
bun --filter slate-react typecheck
bun --filter slate-browser typecheck
bun typecheck:site
bun lint
```

Type/API proof:

```bash
bun test:release-discipline
bun typecheck:packages
bun typecheck:site
bun --filter slate-browser test:core
cd /Users/zbeyens/git/plate-2 && pnpm test:types
```

Public write-surface proof:

```bash
bun test:release-discipline
rg "editor\\.update\\(\\(\\) =>|editor\\.(setNodes|insertText|insertNodes|removeNodes|select)\\(" \
  docs site/examples/ts packages/slate-react/src \
  -g '!**/dist/**'
```

The grep is diagnostic. The release-discipline guard owns the allowlist for
classified core/runtime/legacy transform fixtures.

Focused browser:

```bash
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright \
  playwright/integration/examples/images.test.ts \
  playwright/integration/examples/embeds.test.ts \
  playwright/integration/examples/editable-voids.test.ts \
  playwright/integration/examples/mentions.test.ts \
  --project=chromium
```

Plugin browser contracts:

```bash
PLUGIN_CONTRACTS=table,media,link,mark,editable-island \
  PLAYWRIGHT_RETRIES=0 bun test:stress
```

Stress:

```bash
STRESS_FAMILIES=inline-void-boundary-navigation,markable-inline-void-formatting,block-void-navigation,editable-island-native-focus \
  PLAYWRIGHT_RETRIES=0 bun test:stress
```

Release closure:

```bash
bun check:full
```

## 18. Final Completion Gates

The implementation is not complete until all gates pass:

- no public `onKeyCommand`
- no public `onSnapshotChange`
- no raw Slate `onValueChange` / `onSelectionChange`
- no public `actions` in `RenderVoidProps`
- no eager `focused` / `selected` in `RenderVoidProps`
- no `RenderVoidPropsFor` casts in first-party examples
- `useSlateStatic`, `useSelected`, and `useFocused` aliases removed before
  publish
- writes outside `editor.update` fail in development/test
- normal first-party authoring docs, examples, walkthroughs, and public API
  pages use `editor.update((tx) => tx.*)`, not
  `editor.update(() => editor.*)`
- primitive editor write usages are classified as advanced/internal bridge,
  core/runtime, codemod, or legacy transform fixture usages
- `applyOperations` remains the explicit replay writer and is not treated as
  normal authoring DX
- reads inside `tx` see transaction-local state
- extension `state` / `tx` namespaces typecheck with plugin augmentation
- `editor.schema` is the documented predicate surface
- migration-backbone fixtures prove table/link/media-style groups read/write
  through raw `state` / `tx`
- plugin-style transforms cannot write outside `editor.update`
- plugin-style reads inside updates observe transaction-local state
- stale `EditorTarget` handles rebase or fail softly; they are never serialized
  collaboration identity
- collab-backbone replay fixture passes with remote commit metadata
- remote apply does not depend on React `onChange` / `onCommit`
- ecosystem TypeScript fixtures cover nested plugin groups, collision errors,
  composed inference, and state/tx augmentation
- plugin browser contract registry accepts first-party plugin rows
- `renderShellUnsafe` examples carry explicit browser contracts
- generated browser rows cover selection, void, callbacks, keyboard, target,
  and extension families
- `bun check:full` passes

## 19. Execution Ledger

### 2026-04-28 Phase 1 tracer: public state/tx callback views

Status: complete for tracer, lane still pending.

Implemented in `/Users/zbeyens/git/slate-v2`:

- `editor.read((state) => ...)` receives grouped read state.
- `editor.update((tx) => ...)` receives grouped tx write/read methods.
- `tx` reads observe same-update draft mutations.
- tx write groups route through the existing transaction runtime.
- release-discipline inventory classifies the new public-state adapter as a
  central runtime owner.

Files changed:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/state-tx-public-api-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/escape-hatch-inventory-contract.ts`

Verification:

```bash
bun test ./packages/slate/test/state-tx-public-api-contract.ts
bun test ./packages/slate/test/read-update-contract.ts ./packages/slate/test/write-boundary-contract.ts ./packages/slate/test/transaction-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts
bun test ./packages/slate/test/transaction-target-runtime-contract.ts ./packages/slate/test/generic-editor-api-contract.ts ./packages/slate/test/surface-contract.ts
bun test:release-discipline
bun lint:fix
bun typecheck:packages
```

Notes:

- `bun --filter slate test` does not match a package in this checkout; focused
  package contracts were run directly.
- The first `bun typecheck:packages` failed on tx generic variance. The accepted
  fix keeps read value generics precise and widens tx write parameter types so
  `Editor<CustomValue>` still flows through runtime helpers.

Next owner:

- Phase 1 extension namespace registration: `state.<extension>` /
  `tx.<extension>` group composition, collision proof, cleanup, and type
  fixtures.

### 2026-04-28 Phase 1 tracer: extension namespaces and method hard cut

Status: complete for runtime tracer, lane still pending for TypeScript
augmentation fixtures.

Implemented in `/Users/zbeyens/git/slate-v2`:

- extension `state` / `tx` groups register into runtime namespace maps
- duplicate extension group names fail before becoming public state
- reserved core group names reject extension collisions
- unextend cleans up extension groups
- failed multi-extension batches roll back earlier namespace groups
- flat extension `methods` are no longer a public or internal registration
  path
- stale runtime objects that still pass `methods` are rejected before editor
  mutation
- registry `methodNames` and editor-object method recomposition were removed

Files changed:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/extension-registry.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/editor-extension.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/extension-namespaces-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/extension-methods-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/extension-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/escape-hatch-inventory-contract.ts`

Verification:

```bash
bun test ./packages/slate/test/extension-namespaces-contract.ts
bun test ./packages/slate/test/extension-methods-contract.ts ./packages/slate/test/extension-namespaces-contract.ts ./packages/slate/test/generic-extension-contract.ts ./packages/slate/test/extension-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts ./packages/slate/test/read-update-contract.ts
bun typecheck:packages
bun lint:fix
bun test:release-discipline
```

Notes:

- `EditorExtension.methods` was cut instead of renamed. Plugin sugar can exist
  above raw Slate, but the raw runtime extension surface is grouped `state` /
  `tx`.
- The first rollback helper typecheck failed because it accepted the full
  generic registry type even though cleanup only deletes installed extension
  names. The fix narrowed the helper to that one operation.

Next owner:

- Phase 1 namespace TypeScript fixtures: inferred `state.<plugin>` /
  `tx.<plugin>` groups, nested group shapes, collision errors, composed
  inference, and module augmentation.

### 2026-04-28 Phase 1 tracer: extension namespace type fixtures

Status: complete for Phase 1 type surface, lane still pending for React/API
cuts.

Implemented in `/Users/zbeyens/git/slate-v2`:

- `EditorStateExtensionGroups<V>` and `EditorTxExtensionGroups<V>` are public
  module-augmentation slots
- `EditorStateView<V>` and `EditorUpdateTransaction<V>` expose augmented
  extension groups while the runtime builders satisfy non-augmented core view
  types first
- extension group factories get contextual return typing for known augmented
  group names
- compile-only fixture proves:
  - nested `state.<plugin>` groups
  - nested `tx.<plugin>` groups
  - tx-only groups are not visible in read state
  - extension groups do not mutate the editor object
  - bad known-group return shapes fail typecheck
  - custom value generics flow through augmented state groups

Files changed:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/generic-extension-namespace-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/tsconfig.generic-types.json`

Verification:

```bash
bunx tsc --project packages/slate/test/tsconfig.generic-types.json --noEmit
bun test ./packages/slate/test/extension-methods-contract.ts ./packages/slate/test/extension-namespaces-contract.ts ./packages/slate/test/generic-extension-contract.ts ./packages/slate/test/extension-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts ./packages/slate/test/read-update-contract.ts
bun typecheck:packages
bun lint:fix
bun test:release-discipline
```

Notes:

- The first type fixture run failed red on missing namespace augmentation.
- Biome tried to collapse empty augmentation interfaces into type aliases. The
  final slots are interfaces with optional unique-symbol brands so they remain
  mergeable without lint suppression.

Next owner:

- Phase 2 React void renderer API cut: `RenderVoidProps` becomes
  `{ element, target }`, eager `focused` / `selected` / `actions` leave the
  default render path, and first-party void renderers move to opt-in
  node-scoped hooks/selectors.

### 2026-04-28 Phase 2 tracer: void renderer props hard cut

Status: complete for `RenderVoidProps` / first-party examples, lane still
pending for callback and keyboard API cuts.

Implemented in `/Users/zbeyens/git/slate-v2`:

- `RenderVoidProps<T>` is `{ element: T; target: Path }`
- void renderers no longer receive eager `focused`, `selected`, or `actions`
- runtime still owns the block/inline void shell and hidden spacer/anchor
- first-party void examples use `useFocused()` / `useSelected()` only inside
  components that draw selected/focused UI
- image/video examples use `editor.removeNodes` / `editor.setNodes` with the
  supplied `target`
- `RenderVoidPropsFor` and casts disappeared from first-party examples
- stale example `defineEditorExtension({ methods })` usage was removed
- release-discipline now bans flat extension `methods` teaching instead of
  requiring the removed API path

Files changed:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/public-surface-contract.ts`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/custom-types.d.ts`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/images.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/embeds.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/paste-html.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/mentions.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/editable-voids.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/inlines.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/forced-layout.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/large-document-runtime.tsx`

Verification:

```bash
bun --filter slate-react typecheck
bun --filter slate-react test:vitest
bun --filter slate build
bun typecheck:site
bun typecheck:packages
bun lint:fix
bun test:release-discipline
rg "RenderVoidPropsFor|as RenderVoidProps|actions\\." site/examples/ts packages/slate-react/src packages/slate-react/test
```

Notes:

- `bun typecheck:site` initially resolved stale `slate/dist` declarations with
  the previous zero-arg `read` signature. Rebuilding `slate` fixed the artifact
  path and the site checker passed.
- The example migration uses local editor wrappers for old predicate/input
  overrides. That is a temporary bridge until Phase 5 schema/spec predicates
  replace top-level predicate overrides.

Next owner:

- Phase 3 callback/keyboard API naming: remove public `onSnapshotChange`,
  expose polished `onChange` / `onCommit`, and replace public `onKeyCommand`
  with Slate-style `onKeyDown(event, ctx)` handled-result semantics.

### 2026-04-28 Phase 4 tracer: callback and keyboard API hard cut

Status: complete for callback / keyboard naming, lane still pending for hook
renames and schema/spec cleanup.

Implemented in `/Users/zbeyens/git/slate-v2`:

- `<Slate>` exposes value-only `onChange(value)` and advanced
  `onCommit(commit, snapshot)`
- public `onSnapshotChange`, `onValueChange`, and `onSelectionChange` are gone
  from source, tests, and first-party examples
- `<Editable>` exposes `onKeyDown(event, { editor })`
- public `onKeyCommand` and `EditableKeyCommandHandler` are gone from source,
  tests, and first-party examples
- examples that handled keyboard commands now use `onKeyDown`
- the mentions example observes commits through `onCommit`
- callback tests prove selection-only commits do not call `onChange`, value
  commits call `onChange`, and `onCommit` receives commit telemetry
- keyboard tests prove `onKeyDown` receives editor context and can execute a
  model command with handled-result semantics

Files changed:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/runtime-keyboard-events.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/index.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/editable-behavior.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/react-editor-contract.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/images.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/inlines.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/tables.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/check-lists.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/markdown-shortcuts.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/richtext.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/mentions.tsx`

Verification:

```bash
bun --filter slate-react test:vitest -- editable-behavior react-editor-contract
bun --filter slate-react test:vitest
bun --filter slate-react typecheck
bun typecheck:site
bun typecheck:packages
bun test:release-discipline
bun lint:fix
rg "onKeyCommand|EditableKeyCommandHandler|onSnapshotChange|onValueChange|onSelectionChange" packages/slate-react/src packages/slate-react/test site/examples/ts packages/slate/test -g '!**/dist/**'
```

Notes:

- The only remaining `onSelectionChange` grep hit is the internal DOM
  `selectionchange` event listener in `selection-reconciler.ts`; it is not a
  public Slate callback.
- The first red test run proved new callback props were not wired. The final
  focused run passed after wiring `onChange` / `onCommit`.
- The keyboard test needed an explicit JSDOM `isContentEditable` property so
  the event follows the same editable-target branch as browsers.

Next owner:

- Phase 3 hook cleanup: add and migrate to `useEditor`,
  `useElementSelected`, `useEditorFocused`, `useEditorReadOnly`,
  `useEditorComposing`, and `useEditorSelector`; cut the old public hook
  aliases before publish.

### 2026-04-28 Phase 3 tracer: hook alias hard cut

Status: complete for public hook aliases, lane still pending for schema/spec
predicates and browser proof.

Implemented in `/Users/zbeyens/git/slate-v2`:

- `useSlateStatic` became `useEditor`
- `useSelected` became `useElementSelected`
- `useFocused` became `useEditorFocused`
- `useReadOnly` became `useEditorReadOnly`
- `useComposing` became `useEditorComposing`
- `useSlateSelector` became `useEditorSelector`
- `useSlateSelection` became `useEditorSelection`
- broad public `useSlate` / `useSlateWithV` were deleted instead of renamed
- first-party toolbar examples now use `useEditor` plus `useEditorSelector`
  for reactive button state
- void examples that have a runtime target pass it to `useElementSelected`
- old hook aliases are gone from `slate-react` source, tests, and first-party
  examples

Files changed:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-editor.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-element-selected.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-editor-focused.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-editor-read-only.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-editor-composing.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-editor-selection.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/index.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/use-element-selected.test.tsx`
- first-party examples under `/Users/zbeyens/git/slate-v2/site/examples/ts`

Verification:

```bash
bun --filter slate-react test:vitest -- provider-hooks-contract use-element-selected surface-contract
bun --filter slate-react test:vitest
bun --filter slate-react typecheck
bun typecheck:site
bun typecheck:packages
bun test:release-discipline
bun lint:fix
rg "\\buseSlateStatic\\b|\\buseSelected\\b|\\buseFocused\\b|\\buseReadOnly\\b|\\buseComposing\\b|\\buseSlateSelector\\b|\\buseSlateSelection\\b|\\buseSlate\\b|\\buseSlateWithV\\b" packages/slate-react/src packages/slate-react/test site/examples/ts packages/slate/test -g '!**/dist/**'
```

Notes:

- `useSlateNodeRef`, `useSlateProjections`, annotation, and widget hooks still
  carry Slate-domain names because they are not the confusing editor-state hook
  aliases this phase cuts.
- The post-lint verification pass was rerun because Biome rewrote 17 files.

Next owner:

- Phase 5 schema/spec predicate surface: replace normal top-level
  `editor.isInline`, `editor.isVoid`, `editor.markableVoid`, and
  `editor.isSelectable` monkeypatching with `editor.schema` / element specs,
  while keeping manual predicate overrides as advanced extension policy.

### 2026-04-28 Phase 5 tracer: schema/spec predicate surface

Status: complete for first-party schema/spec predicates, lane still pending for
Plate/slate-yjs proof and browser parity.

Implemented in `/Users/zbeyens/git/slate-v2`:

- added `editor.schema`
- added app-defined `editor.schema.define(...)`
- added extension-owned `elements` specs
- `state.schema` and `tx.schema` expose read-only schema queries
- `schema.define` is intentionally unavailable from `state.schema` /
  `tx.schema`
- `void: 'block' | 'inline' | 'markable-inline' | 'editable-island'` drives
  default `isVoid`, `isInline`, and `markableVoid` policy
- `selectable: false` and `readOnly: true` drive selectable/read-only policy
- first-party examples register element specs instead of overriding top-level
  predicate methods
- the internal DOM `onSelectionChange` listener variable was renamed to
  `handleNativeSelectionChange` so public-callback hard-cut greps are clean

Files changed:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/extension-registry.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/editor-extension.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/schema-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/images.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/embeds.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/editable-voids.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/inlines.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/paste-html.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/large-document-runtime.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/mentions.tsx`

Verification:

```bash
bun test ./packages/slate/test/schema-contract.ts
bun test ./packages/slate/test/schema-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts ./packages/slate/test/extension-namespaces-contract.ts ./packages/slate/test/extension-contract.ts
bun --filter slate build
bun typecheck:site
bun typecheck:packages
bun --filter slate-react typecheck
bun --filter slate-react test:vitest
bun test:release-discipline
bun lint:fix
rg "editor\\.isInline\\s*=|editor\\.isVoid\\s*=|editor\\.markableVoid\\s*=|editor\\.isSelectable\\s*=|editor\\.isElementReadOnly\\s*=|nextIsInline|nextIsVoid|nextIsSelectable|nextMarkableVoid|nextIsElementReadOnly" site/examples/ts -g '!**/dist/**'
rg "onKeyCommand|EditableKeyCommandHandler|onSnapshotChange|onValueChange|onSelectionChange|state\\.schema\\.define|tx\\.schema\\.define|\\buseSlateStatic\\b|\\buseSelected\\b|\\buseFocused\\b|\\buseReadOnly\\b|\\buseComposing\\b|\\buseSlateSelector\\b|\\buseSlateSelection\\b|\\buseSlate\\b|\\buseSlateWithV\\b" packages/slate-react/src packages/slate-react/test site/examples/ts packages/slate/test/schema-contract.ts packages/slate/test/state-tx-public-api-contract.ts -g '!**/dist/**'
```

Notes:

- `bun typecheck:site` initially failed against stale `slate/dist`
  declarations. `bun --filter slate build` refreshed the declarations and the
  site checker passed.
- Core tests still override predicate methods where they are explicitly testing
  low-level behavior. That is accepted advanced policy, not first-party author
  DX.
- `state.schema.define` and `tx.schema.define` were cut during review of this
  slice because read/update views should not mutate global schema policy.

Next owner:

- Blocked by user direction on 2026-04-28. Do not continue Phase 6 as
  current-version Plate/slate-yjs adapter work. If execution resumes, Phase 6
  is migration-backbone proof only: synthetic plugin-style `state` / `tx`
  groups, deterministic operation replay, remote commit metadata, and
  local-only target behavior. No current Plate or slate-yjs adapter support.

### 2026-04-28 Phase 6 tracer: migration-backbone proof

Status: complete for raw Slate migration-backbone contracts, lane still pending
for browser parity and release proof.

Implemented in `/Users/zbeyens/git/slate-v2`:

- synthetic table-style extension namespaces now prove plugin-style
  `state.table.*` and `tx.table.*` groups
- tx plugin groups read transaction-local state through `tx.value.get()` after
  the group mutates the document
- type fixtures prove table/link/media-style groups compose without mutating
  the editor object
- collab contracts prove local update operations replay into a remote editor
  with deterministic snapshot equality
- remote apply carries commit metadata through tags without React callbacks
- remote remove operations null local runtime ids
- remote move operations rebase local runtime ids
- serialized remote operations do not carry runtime ids
- no current Plate or slate-yjs APIs are imported or promised

Files changed:

- `/Users/zbeyens/git/slate-v2/packages/slate/test/extension-namespaces-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/collab-history-runtime-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/generic-extension-namespace-contract.ts`

Verification:

```bash
bunx tsc --project packages/slate/test/tsconfig.generic-types.json --noEmit
bun test ./packages/slate/test/extension-namespaces-contract.ts ./packages/slate/test/collab-history-runtime-contract.ts
bun test ./packages/slate/test/extension-methods-contract.ts ./packages/slate/test/generic-extension-contract.ts ./packages/slate/test/extension-contract.ts ./packages/slate/test/extension-namespaces-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts ./packages/slate/test/read-update-contract.ts ./packages/slate/test/collab-history-runtime-contract.ts ./packages/slate/test/apply-onchange-hard-cut-contract.ts
bun test:release-discipline
bun typecheck:packages
bun lint:fix
```

Notes:

- The first runtime contract failed because the synthetic table group used
  `state.nodes.children([])` for root-row counts. Root document rows are
  document value reads: `state.value.get()` and `tx.value.get()`.
- This keeps the backbone clean: raw Slate proves substrate behavior; Plate and
  slate-yjs own any current-version adapter or product API migration.

Next owner:

- Phase 7 browser parity and release proof: plugin browser contract registry,
  stale-target browser rows for void selection plus remote remove/move, then
  focused browser gates before any release-quality claim.

### 2026-04-28 Phase 7 tracer: browser contract registry and stale-target replay

Status: complete. The accepted architecture/DX hard-cut lane is done.

Implemented in `/Users/zbeyens/git/slate-v2`:

- added a `slate-browser` plugin contract registry for generated browser rows
- grouped generated operation families under synthetic plugin-style contract
  rows without importing current Plate APIs
- added replayable scenario steps for:
  - remote `applyOperations`
  - runtime-id capture
  - runtime-id path assertions
  - last-commit tag assertions
- added a test-browser handle for operation replay and runtime-id lookup
- added the `stale-target-remote-rebase` stress row
- proved stale void targets are local runtime facts:
  - removed runtime ids become `null`
  - moved runtime ids rebase to the new path
  - serialized operations do not carry runtime ids
  - remote replay carries collaboration metadata through commit tags
- updated the kernel authority inventory for browser-handle remote replay

Files changed:

- `/Users/zbeyens/git/slate-v2/packages/slate-browser/src/playwright/index.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-browser/test/core/scenario.test.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/browser-handle.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`
- `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts`

Verification:

```bash
bun --filter slate-browser test:core
bun --filter slate-browser typecheck
bun --filter slate-browser build
bunx tsc --project playwright/tsconfig.json --noEmit
STRESS_FAMILIES=table-cell-boundary-navigation PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun test:stress
STRESS_FAMILIES=stale-target-remote-rebase PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun test:stress
bun --filter slate-react test:vitest -- kernel-authority-audit-contract
bun --filter slate-react typecheck
bun typecheck:packages
bun test:release-discipline
bun lint:fix
bun check:full
PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox -g "persistent native word-delete|generated inline cut typing gauntlet"
```

Notes:

- `bun check:full` exited 0. It reported two retry-resolved browser flakes:
  Chromium richtext persistent native word-delete and Firefox inline cut typing
  gauntlet.
- Both retry-resolved rows passed cleanly in the focused retry-disabled rerun:
  4 passed.
- This phase is migration-backbone proof only. It does not support current
  Plate or slate-yjs APIs, and it does not add adapters.

Next owner:

- None. Completion target met.

### 2026-04-28 Complete-plan restart: public write-surface guard

Status: complete.

Reason:

- The `slate-review` rerun closed with one accepted implementation owner:
  first-party authoring docs, examples, walkthroughs, and public API pages must
  teach `editor.update((tx) => tx.*)`, not primitive `editor.*` writes.
- The prior architecture/DX lane was complete, but this public write-surface
  guard is a new hardening slice from the rerun.

Scope:

- Implementation code lives in `../slate-v2`.
- Control files live here: `tmp/completion-check.md`, `tmp/continue.md`, and
  this plan ledger.
- No current Plate or slate-yjs adapter support.

Next owner:

- Add or tighten the release-discipline/public-surface guard in `../slate-v2`
  so it fails on unclassified first-party primitive `editor.*` write teaching.
- Migrate normal authoring docs/examples/API pages to `tx.*`.
- Classify any remaining primitive `editor.*` write usage as
  advanced/internal bridge, core/runtime, codemod, or legacy transform fixture
  usage.

Driver gates:

```bash
bun test:release-discipline
rg "editor\\.update\\(\\(\\) =>|editor\\.(setNodes|insertText|insertNodes|removeNodes|select)\\(" docs site/examples/ts packages/slate-react/src -g '!**/dist/**'
```

Completion:

- `tmp/completion-check.md` is `done`; the guard and targeted proof passed.

Completed in `/Users/zbeyens/git/slate-v2`:

- Added public write-surface coverage to
  `packages/slate/test/public-surface-contract.ts`.
- The guard fails on normal first-party docs/examples/API pages that teach
  primitive `editor.*` writes instead of `tx.*`.
- Migrated normal authoring docs and examples to transaction methods.
- Classified the remaining primitive write files as advanced normalizer or
  collaboration bootstrap policy:
  - `site/examples/ts/forced-layout.tsx`
  - `docs/concepts/11-normalizing.md`
  - `docs/walkthroughs/07-enabling-collaborative-editing.md`
- Kept current Plate/slate-yjs adapter support out of scope.

Verification:

```bash
bun test ./packages/slate/test/public-surface-contract.ts --bail 1
bun test:release-discipline
bun typecheck:site
bun typecheck:packages
bun lint:fix
bun test:release-discipline
bun typecheck:site
rg "editor\\.(collapse|delete|deselect|insertFragment|insertNodes|insertText|mergeNodes|move|moveNodes|removeNodes|select|setNodes|splitNodes|unsetNodes|unwrapNodes|wrapNodes)\\(" docs/api docs/concepts docs/walkthroughs site/examples/ts -g '!**/dist/**'
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/images.test.ts playwright/integration/examples/inlines.test.ts --project=chromium
```

Final verification result:

- release discipline passed: 115 pass
- site typecheck passed
- package typecheck passed: 6 package typechecks
- focused browser proof passed: 12 Chromium tests
- final grep only reports the classified normalizer/collaboration bootstrap
  files

Next owner:

- None. This complete-plan implementation slice is done.
