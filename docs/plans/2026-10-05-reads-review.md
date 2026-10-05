---
review_scopes: [reads]
review_basis: [2026-10-04-reads-audit]
work_kind: implementation
---

# Reads: one public commit subscription

Status: blocked: waiting on your call to close with the API reference gap
Playbook: plan

Plite's editor keeps one public way to observe a published commit, `editor.subscribeCommit((commit, snapshot) => ...)`. This plan deletes `editor.subscribe`, the `Editor.subscribe` and `Editor.subscribeCommit` namespace functions, and the root `SnapshotListener` and `EditorCommitSource` type exports. `editor.subscribe` and `editor.subscribeCommit` deliver the same commit and snapshot once per commit and differ only in argument order and phase. The namespace `subscribeCommit` only forwards to the method. Keeping them teaches four spellings of one job. The Plite React provider, the one production caller of `editor.subscribe`, calls `getEditorRuntime(editor).subscribe` instead. That is the same runtime function `editor.subscribe` forwarded to, so the provider's delivery, projection and order do not change. No existing test pins that order, so the plan adds one public-boundary test, written first, that fails if the provider moves to `subscribeCommit`. The owner said "go" on 2026-10-05 to plan this cut, which the 2026-10-04 audit's Pursue verdict proposed. The plan runs under the Build playbook, `.agents/playbooks/build.md`.

## Brief

### What will change?

Apps observe commits through one editor method. The older method, two helper functions and two public types are gone, and tests, documents and release notes use the remaining method. The Close lists one reverted merge. Nothing is committed.

### What could go wrong?

Apps using the removed method break when you publish. A moved listener that read the updated page runs earlier. The API reference still lists two removed types. Three checks fail as before. A final review found six warnings, none critical.

## Public API

Persistence moves from `editor.subscribe` to `editor.subscribeCommit`, which receives the snapshot as its second argument.

```ts before
// content/docs/api/editor-api.mdx
const unsubscribe = editor.subscribe((_snapshot, commit) => {
  if (commit?.changed.has("document") || commit?.dirtyStateKeys.length) {
    const documentValue = editor.read.value();

    save(documentValue);
  }
});
```

```ts after
// content/docs/api/editor-api.mdx
const unsubscribe = editor.subscribeCommit((commit) => {
  if (commit.changed.has("document") || commit.dirtyStateKeys.length) {
    save(editor.read.value());
  }
});
```

Code that used the namespace function calls the method with the arguments swapped.

```ts before
// packages/plitejs/test/snapshot-contract.ts
editorSubscribe(editor, (snapshot) => {
```

```ts after
// packages/plitejs/test/snapshot-contract.ts
editor.subscribeCommit((_commit, snapshot) => {
```

## Hard cuts and app migration

Deleted public names, with each place that defines or re-exports them:

| Name | Defined or exported at | Reaches |
| --- | --- | --- |
| `BaseEditor.subscribe` | `packages/plitejs/src/interfaces/editor.ts:1858`, base object `packages/plitejs/src/create-editor.ts:695`, view object `packages/plitejs/src/editor-runtime-view.ts:1412` | Every root editor and every `createEditorView` view |
| `Editor.subscribe(editor, listener)` | type `packages/plitejs/src/interfaces/editor.ts:4316`, body `:4897`, export lists `:5008` and `:5092` | `plitejs/internal` (`packages/plitejs/src/internal/index.ts:109`), `plitejs/testing` (`packages/plitejs/src/testing/index.ts:23`), `platejs/testing` through its re-export |
| `Editor.subscribeCommit(editor, listener)` | type `packages/plitejs/src/interfaces/editor.ts:4321`, body `:4901`, export lists `:5009` and `:5093` | `plitejs/internal`, `plitejs/testing` (`packages/plitejs/src/testing/index.ts:24`), `platejs/testing`, and the unused re-export in `packages/plitejs/src/react/editable/runtime-editor-api.ts:71,158` |
| `SnapshotListener` | `packages/plitejs/src/interfaces/editor.ts:2049`, root export `packages/plitejs/src/index.ts:306` | `platejs` root through `export * from 'plitejs'` (`packages/platejs/src/core.tsx:3`) |
| `EditorCommitSource` | root export `packages/plitejs/src/index.ts:147` | `platejs` root the same way; only the internal `subscribeSource` takes it |

The base and view objects lose `subscribe` in the same change, because `createEditorView` copies every key the view lacks from its source editor (`packages/plitejs/src/editor-runtime-view.ts:1417-1422`). The view object at `:1387` is an inferred literal, so a leftover `subscribe: viewRuntime.subscribe` would still typecheck; the build's absence check catches it instead.

Callers that break, found by the census, the delete-and-typecheck spikes and the round 1 panel:

- Production: the Plite provider at `packages/plitejs/src/react/components/plite.tsx:721`. A grep of `packages/platejs/src`, `apps/www/src` and `templates` found no other caller, and the spike's `pnpm --filter platejs typecheck` exited 0.
- Benchmarks (4 calls in 3 scripts, none typechecked): `benchmarks/slate-v2/donor/core/current/transaction-execution.mjs:109,134`, `benchmarks/slate-v2/donor/core/current/editor-store.mjs:125` and the generated program in `benchmarks/slate-v2/donor/core/compare/huge-document.mjs:166`, launched by `benchmarks/targets/slate-v2.json:1456,1656,1864`.
- Tests calling `editor.subscribe` or a view's `subscribe` (21 calls in 10 files): `apply-onchange-hard-cut-contract.ts:54,107`, `document-state-effect-contract.ts:190`, `editor-foundation-contract.ts:195`, `editor-runtime-view-contract.ts:157,1111,1516,1865,1899,2008,2049,2085,2121`, `history/history-branch-contract.spec.ts:925`, `react/editable-dom-runtime-contract.test.tsx:261`, `react/selection-controller-contract.ts:952,1072`, `synchronous-transaction-authors.test.ts:119`, `update-after-commit-contract.ts:529,533`, and the fragment view at `authored-retained-contract.test.ts:702`, all under `packages/plitejs/test/`.
- Tests calling the namespace `subscribe` (26 calls in 7 files): `snapshot-contract.ts` (12), `transaction-contract.ts` (6), `commit-metadata-contract.ts` (2), `history/integrity-contract.ts` (2), `collab-history-runtime-contract.ts` (2), `collab-canonical-reconcile-contract.ts` (1), `accessor-transaction.test.ts` (1). No file calls the namespace `subscribeCommit`.
- The export lists in `packages/platejs/test/public-package-import-smoke.slow.ts:410-411` (`plitejs/testing`) and `:622-623` (the internal bridge).
- The dnd research probe `docs/research/probes/2026-10-01-dnd-transfer/substrate.probe.ts:95` calls `editor.subscribe?.(...)`, which would silently do nothing after the cut.

Apps that migrate an `editor.subscribe` listener to `editor.subscribeCommit` move it earlier on root and named-root views. Today an app snapshot listener registered after `EditorRoot` mounts runs after the provider's DOM text sync, selector publication and commit callbacks, and after the DOM fences. That position held only through registration order. A commit listener runs before all of them, and after the cut no public hook runs after the provider publishes. Plite's `onCommit` prop fires inside the provider's publication, before the fences (`packages/plitejs/src/react/components/plite.tsx:693`), and Plate's `onCommit` is itself a commit listener (`packages/platejs/src/react/components/Plate.tsx:194`, `:216`). On an authored-fragment view a commit listener registered after mount still runs after the provider, as Main changes says.

Agent-facing notes that predate the cut still show the removed calls, and this build flags them without editing them, because each records a past fix: `docs/solutions/developer-experience/2026-04-19-plite-public-single-op-writes-should-use-editor-apply-and-keep-onchange-behind-subscribers.md`, `docs/solutions/logic-errors/2026-04-03-plite-history-capture-must-anchor-to-commit-subscribers-not-onchange-order.md`, `docs/solutions/performance-issues/2026-04-11-plite-huge-document-typing-needs-selector-fanout-cuts-before-islands.md`, `docs/solutions/performance-issues/2026-04-30-plite-source-bus-routing-must-prove-upstream-fan-in-and-runtime-bucket-locality-separately.md` and `docs/editor-test-harvester/lexical/plite-processing-ledger.md`, found by `rg -l -P '[Ee]ditor\.subscribe\b' docs/solutions docs/editor-test-harvester`.

Teaching changes in five places. `content/docs/api/editor-api.mdx:403-433` keeps one section for `editor.subscribeCommit` and documents its second argument, the snapshot. `content/docs/(guides)/debugging.mdx:127-130` drops the claim that a listener needs `editor.subscribe` to get the snapshot. `docs/plite/references/architecture-contract.md:33` lists `editor.subscribeCommit` alone. `docs/plite/final-api-hard-cuts-status.md:31` stops naming `Editor.subscribe`. `apps/www/api-reference.config.json:157,702` drops both types, and the generated manifest and registry docs regenerate. Copied registry components change nothing, because none calls `editor.subscribe`.

This page flags open plans that cite the removed names and leaves their text, because each is another run's record. A grep for the four names found `docs/plans/2026-04-15-plite-decoration-wave-9-execution.md` (status in_progress; lines 18, 47, 80), `docs/plans/2026-04-30-plite-lexical-api-steal-review-ralplan.md` (pending implementation; its line 1472 keeps `editor.subscribe` public, which this plan reverses) and `docs/plans/2026-06-14-plite-public-api-taste-and-beta-readiness-10h.md` (queued round 19 keeps `SnapshotListener`). The round 2 panel found more with active or pending status: `2026-04-30-plite-editor-namespace-runtime-api-shape-ralplan.md:818`, `2026-04-21-plite-final-api-runtime-shape-plan.md:60`, `2026-04-24-plite-absolute-architecture-closure-plan.md:3339`, `2026-04-22-plite-core-api-runtime-perfection-plan.md:1462`, `2026-04-22-plite-authoritative-command-kernel-architecture-plan.md:688`, `2026-04-23-plite-remaining-perfect-architecture-batches-plan.md:661` and `2026-04-15-plite-decoration-wave-10-execution.md:43`, all under `docs/plans/`. The build's blast-radius pass added `2026-10-04-ledger-triage-audit.md` (blocked; it quotes the 2026-10-04 verdict) and five plans with no status line: `2026-04-21-plite-react-huge-doc-perf-plan.md`, `2026-05-31-audit-plite-concept-docs.md`, `2026-06-10-plite-8h-automation.md`, `2026-06-14-plite-public-api-taste-and-beta-readiness-10h.md` and `2026-06-14-plite-public-beta-readiness-review.md`. The pass's search is `git grep -l -E` for the four names in `docs/plans/*.md`, with each plan's status read through `.agents/pstack/status.mjs`.

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| The provider calls the runtime subscription directly instead of the public method that forwarded to it | Plite | `plitejs/react`, importing `getEditorRuntime` through `packages/plitejs/src/react/editable/runtime-editor-api.ts`, which already re-exports it | The React partition may import the root partition under `tooling/entrypoints/entrypoint-dag.mjs`, and `getEditorRuntime` is already reachable there |
| The snapshot listener and commit source types become internal | Plite | `plitejs` root partition, no longer exported from `packages/plitejs/src/index.ts` | Only internal listener plumbing takes them |

## Main changes

- The Plite provider registers through `getEditorRuntime(editor).subscribe(...)`. On a view, `editor.subscribe` was `viewRuntime.subscribe` (`packages/plitejs/src/editor-runtime-view.ts:1412`); on a base editor it called the same listener-state function as the transaction runtime (`packages/plitejs/src/create-editor.ts:638`, `:695`). So the provider keeps its delivery, view projection, lifecycle label and order exactly. For root and named-root views that order is after every public commit listener, after the decoration manager and before the DOM commit fences. For an authored-fragment view, the authored runtime already delivers to the provider inside its own `subscribeCommit` listener (`packages/plitejs/src/authored/authored.ts:1412-1423`), so later app listeners run after the provider, as they do today.
- The internal snapshot listener always receives a commit. `notifyListeners` takes a required commit, and the build deletes the commit-absent branches in the view runtime (`packages/plitejs/src/editor-runtime-view.ts:1176-1182`, `:1232-1238`), the provider (`packages/plitejs/src/react/components/plite.tsx:722-726`), the fence (`packages/plitejs/src/react/components/editable-dom-commit-fence.tsx:96`) and the decoration manager's `change` guards in `packages/plitejs/src/react/decoration-source.ts`.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| App commit observation | `editor.subscribe`, `editor.subscribeCommit` and two namespace forwarders | `editor.subscribeCommit` only | `packages/plitejs/src/core/listener-state.ts` | One way per job; VISION.md teaches commit listeners | Delete base, view and namespace subscriptions; migrate 47 test calls, 4 benchmark calls, a probe and five teaching sites | Test-project typecheck adds no error HEAD lacks; plitejs bun and vitest suites; transaction-execution benchmark runs | External apps calling `editor.subscribe` break; migrated listeners run earlier | cut |
| Snapshot listener type | `SnapshotListener` public with an optional commit that never arrives | Internal, commit required | `packages/plitejs/src/interfaces/editor.ts` | The single `notifyListeners` caller always passes the built commit (`packages/plitejs/src/core/public-state.ts:9382`, `:9573`) | Drop root export and API reference entry; delete dead branches | Typecheck; probes found no commit-absent notification | Hidden external type imports | cut |
| Commit source type | `EditorCommitSource` public | Internal | `packages/plitejs/src/core/listener-state.ts` | Only the internal `subscribeSource` takes it | Drop root export and API reference entry | Typecheck | Hidden external type imports | cut |
| Provider publication path | `editor.subscribe`, which forwards to the runtime subscription | `getEditorRuntime(editor).subscribe` | Plite React provider | Same function, so delivery, projection, label and order stay exact | `packages/plitejs/src/react/components/plite.tsx:721` | Order probe at base, with this change and with the `subscribeCommit` mutant; new ordering test | A later edit moves it to `subscribeCommit` | keep |
| App listener before provider | Holds because the provider sits in the snapshot phase | Unchanged, now pinned | Plite React provider | The `subscribeCommit` mutant passes all 1,425 React tests today | One test in `packages/plitejs/test/react/plite-runtime-provider-contract.test.tsx` | The test fails on the mutant and passes at base | None | keep |
| Decoration, provider and fence order | Held by React effect kinds: insertion, layout, passive | Unchanged, not pinned by a test | React effect kinds | No step in this plan touches it; the probe held under six re-renders and StrictMode | None | Order probe only | An effect-kind change reorders them unnoticed | keep |
| Snapshot-phase error routing | `update-after-commit-contract.ts:516-565` throws from `editor.subscribe` and expects `'snapshot-listener'` | The same case over `getEditorRuntime(editor).subscribe` | `packages/plitejs/src/core/public-state.ts:8756-8760` | It is the only test of that guard, and on root and named-root views the provider, decoration manager and fences run under it; on authored-fragment views provider errors reach the outer `'commit-listener'` guard, today and after the cut | Rewrite that block, keep its assertions | Removing the guard fails the rewritten case | None | keep |
| Plugin `on.commit` | Runs first; `apply-onchange-hard-cut-contract.ts:107-119` is the only test of its order against a public listener | Unchanged | `packages/plitejs/src/core/plugin.ts:1421` | Extension tier | Migrate that test's listener to `subscribeCommit`, keep its order assertion | The migrated assertion | None | keep |
| Fragment-view order | The authored runtime delivers to fragment observers inside one public commit listener (`packages/plitejs/src/authored/authored.ts:1412`) | Unchanged | Authored runtime | Fixing it needs per-phase fragment queues; no defect reproduced | owner: zbeyens; moves to the reads subject's Open work at the fold | Next probe: a retained-fragment edit with a mounted provider and a later app listener | Today's exception stays | defer |
| Per-view pipeline in the provider | Not built | Not built | Plite React | Would give fences a version queue; no nested-commit defect reproduced | owner: zbeyens; moves to Open work at the fold | Next probe: a nested commit from a decoration source or `onCommit` prop, checking fence delivery order | Fence sees version n+1 before n | defer |
| Base-editor source buckets | `SOURCE_LISTENERS` serves base-editor `subscribeSource`; every production caller passes a view | Unchanged | `packages/plitejs/src/core/listener-state.ts` | A subtractive cut outside this ask; it changes base-editor source tests and the dead `EditorCommitSource` members | owner: zbeyens; moves to Open work at the fold | Next step: route base-editor `subscribeSource` through the snapshot phase as views do and delete the buckets | Dead code stays | defer |

## Steps

- [x] Add the ordering test first. In `packages/plitejs/test/react/plite-runtime-provider-contract.test.tsx`, mount `EditorRoot` with an `Editable` and an `onCommit` prop, register `editor.subscribeCommit` after mount, insert text, and assert the app listener ran before `onCommit`. Proof: `pnpm --filter plitejs test:react -- plite-runtime-provider-contract` passes at `HEAD`, and fails in a detached worktree where `packages/plitejs/src/react/components/plite.tsx:721` calls `editor.subscribeCommit(onContextChange)`. Closed by the decision row "Write the ordering test first and prove it fails for its named defect": exit 0 on the build, exit 1 on the `subscribeCommit` mutant.
- [x] Move the provider to `getEditorRuntime(editor).subscribe(...)`, imported from `packages/plitejs/src/react/editable/runtime-editor-api.ts`. Proof: the ordering test passes. Closed by `packages/plitejs/src/react/components/plite.tsx` and the ordering test passing in `pnpm --filter plitejs test:react`.
- [x] Delete `BaseEditor.subscribe`, the base and view object properties, the namespace `subscribe` and `subscribeCommit` types, bodies and export entries, their `plitejs/internal`, `plitejs/testing` and `runtime-editor-api.ts` re-exports, and the root `SnapshotListener` and `EditorCommitSource` exports. Proof: `pnpm --filter plitejs typecheck` and `pnpm --filter platejs typecheck` exit 0 after the next two steps, and `rg -n 'subscribe: viewRuntime\.subscribe' packages/plitejs/src` prints nothing (it prints `editor-runtime-view.ts:1412` at `HEAD`). Closed by the decision row "Typecheck the build": both package typechecks exit 0.
- [x] Make the internal listener's commit required and delete the commit-absent branches listed under Main changes. Proof: the same typechecks. Closed by the same typecheck row and the recheck rows after the diff panel.
- [x] Migrate the 47 test calls to `editor.subscribeCommit` with swapped arguments, with two exceptions. In `packages/plitejs/test/update-after-commit-contract.ts:529,533`, call `getEditorRuntime(editor).subscribe` and keep the `'snapshot-listener'` assertion. In `packages/plitejs/test/apply-onchange-hard-cut-contract.ts:107`, keep the plugin-before-listener order assertion. Remove `'subscribe'` and `'subscribeCommit'` from `packages/platejs/test/public-package-import-smoke.slow.ts:410-411` and `:622-623`. Proof: `node ../../node_modules/typescript/bin/tsc -p tsconfig.test.json --noEmit` in `packages/plitejs` reports no file and message pair that `HEAD` lacks (`HEAD` reports 903 pre-existing errors; this comparison misses a new error whose text the same file already has, see Panel gate); `pnpm --filter plitejs test` and `pnpm --filter plitejs test:react` pass; removing the `runEditorObserver` guard at `packages/plitejs/src/core/public-state.ts:8758` fails the rewritten case; the platejs smoke test passes. Closed by the decision rows "Run the plitejs and Plate suites on the build", "Prove the rewritten error-routing case still guards the snapshot phase" and "Typecheck the build". As built, after diff panel round 1: two more cases moved to the runtime subscription to keep the phase they observe, `packages/plitejs/test/synchronous-transaction-authors.test.ts` (its notifications counter) and `packages/plitejs/test/authored-retained-contract.test.ts:702` (the fragment snapshot path); stale identifiers were renamed and one duplicate assertion in `packages/plitejs/test/snapshot-contract.ts` was cut.
- [x] Migrate the 4 benchmark calls and the dnd probe to `editor.subscribeCommit`. Record that `editor-store.mjs`'s `subscribeDispatchMs` now measures commit-phase dispatch and needs a fresh baseline. Proof: `PLITE_TRANSACTION_EXECUTION_STRICT=1 bun --preload ./config/plite-source-aliases.ts benchmarks/slate-v2/donor/core/current/transaction-execution.mjs` exits 0. `editor-store.mjs` already fails at `HEAD` on an unrelated document-shape refusal, and `compare/huge-document.mjs` needs a plitejs build, so both lanes and the dnd probe stay unproven. Closed by the decision row "Migrate the benchmarks and the dnd probe and run the transaction-execution lane".
- [ ] Run `plate-docs` on `content/docs/api/editor-api.mdx` and `content/docs/(guides)/debugging.mdx`: the example coverage audit, the edits under Hard cuts, and their Chinese twins (`editor-api.cn.mdx` and `debugging.cn.mdx` carry no `subscribe` text today). Edit `docs/plite/references/architecture-contract.md:33` and `docs/plite/final-api-hard-cuts-status.md:31`. Remove both types from `apps/www/api-reference.config.json`, then run `pnpm --filter www api-reference` and `pnpm --filter www build:registry`. Proof: the `plate-docs` checks and preview, and `pnpm --filter www api-reference:check`. An absence search waits under Panel gate.
- [x] Write the changeset for `plitejs` and `platejs` with the `changeset` skill, naming the earlier timing of migrated listeners, and run `best-api repair` for the cut. Proof: the changeset file and the repair's report. Closed by `.changeset/plite-commit-subscription.md`, `.changeset/plate-commit-subscription.md` and the decision row "Run best-api repair for the cut".
- [ ] Run the writing passes, `pnpm lint:fix` on the task's files, then `pnpm check`, and fold the delta and the deferred rows into `docs/plans/topics/reads.md`. Proof: the passes' skill invocations, the check's exit status and `node .agents/pstack/plan-open.mjs docs/plans/2026-10-05-reads-review.md`.

## Completion Gates

| Gate | Source | Artifact |
| --- | --- | --- |
| Execution authority | Build playbook | The owner's Build now (Recommended) answer on 2026-10-05; decision row "Start the Build playbook on the reads plan" |
| Blast radius on the public API change before deletions | Build playbook | Decision row "Run the blast-radius pass before the deletions"; Hard cuts lists every open plan it found |
| Ordering test fails on the mutant and passes at base | Plan step 1 | `pnpm --filter plitejs test:react plite-runtime-provider-contract` exit 0; the `subscribeCommit` mutant in a detached worktree exits 1 with the order reversed |
| Hard-cut sweep of callers, exports, tests, docs, examples and benchmarks | Architecture reference, Hard cut | The absence search below; 47 test calls, 4 benchmark calls, the dnd probe and five teaching sites migrated |
| Corrected absence search prints nothing | Panel gate, accepted by Build now | partial: at `HEAD` it hits 14 files; on the build tree it prints only `apps/www/src/generated/api-reference-manifest.json`, which waits on the pre-existing `HistoryApi` generator failure under Open work |
| Test-project typecheck adds no error count over `HEAD` | Panel gate, accepted by Build now | `tsc -p tsconfig.test.json --noEmit`: 903 errors as at `HEAD`, no file, code and message count rose |
| `plate-docs` on `content/docs/api/editor-api.mdx` and `content/docs/(guides)/debugging.mdx` | Build playbook | `pnpm --filter www build:source`, `check-docs-source-parity.mts` and `pnpm --filter www build:registry` exit 0, and a dev-server preview shows both pages' final text with no console errors; `api-reference:check` fails at `HEAD` the same way |
| `best-api repair` | Build playbook | No Vision or skill change needed; an unseeded forward test answered `editor.subscribeCommit((commit, snapshot) => ...)` |
| Changeset for `plitejs` and `platejs` | Build playbook | `.changeset/plite-commit-subscription.md`, `.changeset/plate-commit-subscription.md` |
| Thermo-nuclear review of slices touching shared code | Build playbook | One finding applied, then reverted after diff panel round 1 showed the merge projected before filtering; report in scratch `plan/thermo/summary.md` |
| `deslop` and `no-comments` on code, `unslop` on docs and plan | AGENTS.md Writing passes | Decision rows "Run deslop on the code diff", "Run no-comments on the code diff", "Run unslop on the docs and changesets" and the plan's close pass |
| Panel on the diff | AGENTS.md reviews list `api-build` | Round 1 on frozen commit 7584ac9473: no critical finding, warnings applied or deferred with owners |
| `pnpm lint:fix` on task files and `pnpm check` | AGENTS.md Delivery | partial: lint clean on the 31 task TypeScript files; `pnpm check` red on lint, test-slow and www, each attributed to a cause outside this cut in the decision row "Attribute the three failing pnpm check steps" |
| Decision-trail review | AGENTS.md Decision-trail review | gpt-6.1-sol at xhigh on frozen commit c496b239d0: no critical finding; its Attention section is in Close and its fixes are decision rows |
| Ledger execution record | Build playbook close | `docs/research/review-records/2026-10-05-reads-review-execution.json`, outcome partial with partial proof; `lookup reads` reports progress in-progress |
| Subject fold, render with `--folded`, republish, `review-ledger.mjs next` | Build playbook close | blocked: waits on the answer under Needs you |

## Proof

- Behavior proof is the ordering test, the rewritten error-routing case, the plitejs bun and vitest suites, the platejs smoke test and the transaction-execution benchmark, as each step names.
- Type proof is `pnpm --filter plitejs typecheck`, `pnpm --filter platejs typecheck` and the test-project typecheck compared with `HEAD`.
- A scale receipt does not apply. The provider calls the same runtime function as before, and the listener stores, their registrations and the lazy snapshot memo stay as they are.
- Native behavior does not change. The provider's DOM text sync and selection reconcile keep their position, which the order probe covers in jsdom. No browser lane is planned, because no native event path changes.

## Close

Reversals and deviations come first.

- The build merged the view runtime's `subscribe` and `subscribeSource` after its thermo-nuclear review. Diff panel round 1 showed that the merged path projected the snapshot before the source filter, so filtered listeners paid a projection on commits they reject. The build reverted the merge byte for byte, and the approved deferral stands.
- The docs example briefly synced `snapshot.selection`. The diff panel showed that a main-root commit's snapshot selection is null while `commit.selectionAfter` holds a named-root selection, so the example syncs `commit.selectionAfter` again.
- The build merged that pair as a substituted slice that Build now never approved, and it should have stopped for you instead. The revert resolved it.
- The plan's docs proof named `pnpm --filter www api-reference` and a docs preview. The preview ran after the trail review and shows both pages' final text. The generator fails at `HEAD` and on this build because `apps/www/api-reference.config.json` never classified the `HistoryApi` export, so `apps/www/src/generated/api-reference-manifest.json` still lists `SnapshotListener` and `EditorCommitSource`. Needs you asks whether the build can close with that gap.
- Diff panel fixes moved two more tests to the runtime subscription than Step 5 named, and dropped the docs example's snapshot parameter; Step 5 keeps its approved wording beside what was built.
- The session restarted during the close, and its scratch directory came back empty. Evidence files that earlier decision rows cite under scratch paths are gone; the rows keep each command and result, and the frozen review commits still resolve.

What landed, all uncommitted in the working tree:

- `editor.subscribeCommit((commit, snapshot) => ...)` is the one public way to observe a commit. `editor.subscribe`, the `subscribe` and `subscribeCommit` helpers in `plitejs/testing`, `plitejs/internal` and `platejs/testing`, and the root `SnapshotListener` and `EditorCommitSource` exports are gone.
- The Plite provider publishes through `getEditorRuntime(editor).subscribe`, the same function as before, so its order holds; one new test in `packages/plitejs/test/react/plite-runtime-provider-contract.test.tsx` pins app listeners ahead of the provider.
- The internal snapshot listener always receives a commit, and the commit-absent branches in `notifyListeners`, the view runtime, the provider, the DOM fence and the decoration manager are gone.
- 47 test calls, 4 benchmark calls, the dnd probe, two docs pages, two internal docs, the API reference config and the generated registry output moved to the surviving API; two changesets describe the break.

Proof and its limits:

- These proofs pass: both package typechecks, the test-project typecheck (903 errors as at `HEAD`, none added), the forced plitejs bun suite, the plitejs React suite (1,426 tests), the Plate import smoke test, the guard-removal mutation, the ordering test on the build and its `subscribeCommit` mutant, the transaction-execution benchmark, lint on the 31 TypeScript files, every `www` sub-step after `api-reference:check`, and an unseeded forward test on the final docs that picked `editor.subscribeCommit((commit, snapshot) => ...)`, and a dev-server preview of both edited pages.
- `pnpm check` fails three steps, and each fails the same way at `HEAD` in a detached worktree: `lint` on the root `package.json` format, `test-slow` on a collaborative history case and on a TableGrid compiler wall-clock budget that failed once in six interleaved runs on each side, and `www` at the same `HistoryApi` classification, whose `HEAD` log the restart deleted.
- The order probes ran in jsdom on one decorated root view. The build migrated the editor-store and huge-document benchmark lanes and the dnd probe without running them. Nobody searched external downstream apps.

There are 16 completion gates: 12 done, 3 partial (the hard-cut sweep and the absence search, which leave the generated manifest, and `pnpm check`, red on three steps that fail the same way at `HEAD`), 0 skipped, 1 blocked (the fold, which waits on Needs you) and 0 open.

The Open work section names an owner for each remaining item: the history owner's reference classification, the listener-type and projection cleanups, the base-editor source buckets, the dead plugin-listener branch, the agent-facing notes, the table benchmark's wall-clock budget, the root `package.json` format and the collaborative history test.

Every Attention item below is answered by a decision row from the build-stage trail fixes onward.

#### Attention, build stage
reviewed by gpt-6.1-sol (xhigh)

- **warning — missing decision: completion counts, drafted at `18:11:51Z`.** The Close reports "11 done, 4 partial, 1 blocked, 0 open." The frozen table still marks the decision-trail review and ledger record pending. Those gates have no closing artifacts. Correct the count to **9 done, 4 partial, 1 blocked, 2 open**. Also narrow "The build is done except one generated reference page," which hides the missing preview and unfinished closing gates.

- **warning — `2026-10-05T18:10:50Z`, "Attribute the three failing pnpm check steps."** `verified: no failing step comes from this cut` exceeds the evidence. TableGrid passed at HEAD; the three solo build-tree reruns passed twice and failed once on a different case. That supports a flakiness inference, not attribution outside the cut. The detached script also ran only `lint` and `test-slow`, although the row's scope includes `www`. The earlier HEAD `api-reference:check` supports that sub-step's blocker. Append a correction separating verified lint/history attribution, the generator control, and **partial** TableGrid attribution. Narrow the Brief and Close accordingly.

- **warning — `2026-10-05T15:17:17Z`, "Thermo-nuclear review … merge the view runtime's duplicate subscription."** The row justifies implementing approved deferred work as a deviation "that only deletes code." The transcript shows a substituted implementation, and the panel subsequently demonstrated added projection work. Build now did not approve reopening that deferred target. Append a superseding clarification naming the lead's scope expansion and failure to stop the substituted slice for the owner. Preserve the later byte-identical revert as the resolution.

- **warning — missing decision: substituting the docs proof.** At `15:17`, the lead ran source generation, parity and registry checks without the approved preview. The corrected absence search also returned six manifest matches instead of nothing. The plan acknowledges these limits, but the log lacks an explicit proof-deviation row. The proposed "Accept the gap" decision discusses the reference manifest without clearly including the omitted preview. Append a **partial** row covering both unmet proofs. Keep their gates incomplete unless they pass or the owner explicitly accepts each narrower proof.

- **warning — missing decision: continuing on the changed tree after `continue`.** At `18:05`, the lead found another session's history source and plan changes, inspected the history diff, compared eleven source files with the frozen panel tree, and continued attribution. Row `18:06:18Z` records scratch loss, but omits this decision about concurrent changes and proof inputs. Append a resume row naming unchanged HEAD `af8b477822`, the observed history changes, the limited comparison, and continuation at failure attribution. Identify the resumed checks as runs on the mixed working tree.

- **warning — `2026-10-05T15:33:13Z`, the test-fidelity and docs-selection panel rows.** These rows record the fixes, but the plan's Step 5 still describes only two runtime-subscription exceptions. The panel added two more. The docs fix also removed the callback's snapshot argument at `15:31:07`, beyond restoring `commit.selectionAfter`; that choice is omitted. Append execution-deviation rows and retain the approved wording alongside the actual migration. Qualify the earlier example-coverage audit and forward test as checks of the earlier docs version.

- **nit — `2026-10-05T15:33:13Z`, panel rows citing projection probes, suites and the ordering test.** Their proof claims lack the required literal `scope:` field. Append scoped evidence rows naming the reviewed variant, counter stubs, inputs and limits. Include the post-panel multiset comparison printed at `15:32:44`, which established 903 errors and zero increased counts after the repairs.

Could not inspect deleted pre-restart scratch artifacts. Tests, builds and generators were not rerun because this review is read-only.

### Plan stage, before Build now

This stop hands back a plan; nothing in the source changed. Two deviations come first. Recommending a plan for a verdict the ledger marked stale was the lead's inference from a textual diff, and the verdict was not refreshed. The round 0 pick for the provider's entry point, the commit source subscription, was replaced in round 1 by the runtime subscription.

What ran: the census, an Opus explainer of commit delivery, a three-runner architect arena with an Opus cross-judge, order probes, a mutation control, two delete-and-typecheck spikes, two api-plan panel rounds with Opus, gpt-6-astra and gpt-6.1-sol, and a decision-trail review. Round 1 applied three critical findings and round 2 one, which reached the round cap. Two additive proof checks from round 2 wait under Panel gate.

Proof limits: probes ran in jsdom on one decorated root view, the mutation control ran the plitejs vitest React suite only, and two critical fixes rest on source traces rather than runs. Open work lists five deferred items, each with owner zbeyens.

#### Attention, plan stage
reviewed by gpt-6.1-sol (xhigh)

- **warning — `2026-10-05T13:25:17Z`, "Pick the reads unit…"** The playbook recommends review for a stale verdict. The lead chose planning because changed lines lacked three subscription-related names. That search supports a textual absence, not the stronger claim that the changes cannot affect subscriptions. No fresh review-ledger record appears in the transcript. Append a deviation row identifying this as the lead's inference, retain the stale basis explicitly, and state that this run did not refresh the verdict. The owner's `go` approved the proposed planning move.

- **warning — missing decision: accepting mid-run commit `624a54a763` as the proof base.** At 13:58:39 the lead called it docs-only. At 14:09:38 the lead acknowledged changes to rules, playbooks and the renderer. The commit also contains executable check scripts and this run's first plan and subject files. The frozen plan still says it "changes no file this plan edits," which is false. Append a base-change row naming the affected files, the rule changes adopted and the proof base. Correct the plan's description. Attribute the commit to the owner.

- **warning — `2026-10-05T14:05:09Z`, "Pick the arena base and cut its phase registry…"** "Every realistic re-render" exceeds the evidence. The saved probe covers seven cases on an ordinary decorated root. It does not cover authored fragments, nested commits or multiple-view fence ordering. Likewise, `14:01:57Z`, "Check whether any existing test…," establishes that the tested React suite accepts the mutant, not that every existing test does. Append narrower conclusions and describe rejecting the registry as a design judgment based on those samples.

- **warning — `2026-10-05T14:33:00Z`, "critical (astra, sol): the plan claims…"** Sol's fragment finding also challenges lifecycle-error labeling: fragment-provider errors reach the outer `commit-listener` guard. The disposition records only the ordering exception. The final Defaults and snapshot-error-routing rationale still broadly assign provider errors to `snapshot-listener`. Append the omitted label disposition and scope those claims to the paths actually checked. Keep the fragment exception and its deferred probe explicit.

- **warning — `2026-10-05T14:47:45Z`, "critical (astra; sol and opus rated it warning)…"** The `applied` status supports a documentation narrowing. The row explicitly says the Plate probe was not run. The fragment critical was also settled by source trace without a probe. Therefore, the plan's "Every critical finding has a reproduced fix" overstates the proof. Replace that sentence with a distinction between executed mutation/benchmark controls and corrections supported by source traces.

- **warning — missing decision: retaining archived teaching.** At 14:04:17 the lead deliberately left `docs/plite/reference/public-docs` unchanged because it was an archived copy. The plan records that default, but the decision log has no disposition row. Append the retained scope, the evidence for its archival status and the resulting limit on adoption searches. Do not describe the cut as removing the names from all documentation.

- **nit — `2026-10-05T14:33:00Z`, "superseded: the 2026-10-05T13 verify rows…"** No verify rows have that hour. The affected rows are at `14:01:57Z` and `14:05:09Z`. The replacement C2 probe also tests the runtime subscription, whereas spike2 tested the commit-source subscription. Append a correction naming exact row timestamps and decisions, and distinguish each target's evidence instead of saying all earlier conclusions simply hold.

- **nit — panel reproduction rows at `14:33:00Z` and `14:47:45Z`.** Several rows use mutation runs, benchmark controls or typecheck comparisons as proof without the required literal `scope:` field. Append scoped proof rows naming the checked predicate, inputs, target variant and limits. Preserve the existing rows.

no further findings

## Open questions

### Close with the reference gap

Can the build close while the generated API reference still lists the two removed types?

Why it needs you: The plan named this step as proof, and only you can accept less.

- An unlisted history type stops the generator, before and after this change.
- The history work owns that list.

- **Accept the gap** (recommended): I close the plan, update the subject page and record the result as complete. Cost: The generated reference shows two removed types until the history work regenerates it.
- **Keep it open**: I record the result as partial and wait for the reference to regenerate. Cost: The plan stays open for a step this change does not control.
- **Classify them here**: I add the history types to the reference list and regenerate it. Cost: It changes the list of another work area, whose owner can decide differently.

Why I pick it: The gap is in another owner's list and fails before this change.

Attention: safe

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Provider's private entry point | The runtime subscription its public method forwarded to | The commit source subscription that its decoration manager and DOM fences use | "provider on commit source" |
| Lifecycle phase label | Keep the snapshot-listener label for provider, decoration and fence errors on root and named-root views | Rename it to view-listener in the public error union | "rename the listener label" |
| Archived Plite docs | Leave the retired Plite docs copy under docs/plite/reference as is; only its coverage audit tracks it | Edit its five mentions of the deleted names | "edit the archive" |
| Internal listener type name | Keep the internal snapshot listener name | Rename it to match its private role | "rename the internal listener" |
| Order mechanism | Keep React effect-kind order; pin only app-before-provider with one test | A frozen phase list in the listener store | "phase the view pipeline" |
| Open plans that cite the cut | Flag them on this page and leave their text | Edit each plan's stale lines | "edit the open plans" |

## Open work

- Fragment-view order and per-view fence ordering stay deferred with their next probes, owner: zbeyens, moving to `docs/plans/topics/reads.md` Open work at the fold.
- Base-editor source buckets, `EditorCommitSource`'s never-emitted members (`annotation`, `focus`, `composition`, `external`) and the dead `hasListeners` and `hasSnapshotListeners` exports (`packages/plitejs/src/core/public-state.ts:306-307`) wait for one subtractive follow-up, owner: zbeyens, moving to the same Open work. On `plitejs/internal`, `subscribeSource(editor, 'commit', listener)` still reaches every commit, because every commit carries the `'commit'` source, so that follow-up also decides whether the internal entry point keeps it.
- After the commit-absent branches go, the view runtime's `subscribe` and `subscribeSource` (`packages/plitejs/src/editor-runtime-view.ts:1160-1246`) differ by one source filter and could share one projection, owner: zbeyens, tracked in the same Open work. The build merged them and the diff panel reverted the merge, because the shared path projected the snapshot before the source filter, adding work for every filtered listener on commits it rejects. A merge must keep the filter before the projection. The same file also repeats the commit-to-view projection in `afterCommit` and `subscribeCommit`.
- The internal snapshot listener now always receives a commit, so it is `EditorCommitListener` with its arguments reversed. Typing the runtime's `subscribe` and `subscribeSource` listeners as `(commit, snapshot)` would delete the internal `SnapshotListener` type, owner: zbeyens, tracked in the same Open work.
- `pnpm --filter www api-reference` and `api-reference:check` fail at `HEAD` because `apps/www/api-reference.config.json` never classified the `HistoryApi` export, so `apps/www/src/generated/api-reference-manifest.json` still lists `SnapshotListener` and `EditorCommitSource` until the history owner classifies it and the manifest regenerates, owner: zbeyens, tracked in the same Open work.
- `pnpm check` fails at `HEAD` on the root `package.json` format and on `publishes a remote update while a session replay is pending` in `packages/plitejs/test/yjs/collaborative-history-contract.slow.ts`, which still awaits the history result as a promise, owner: zbeyens, tracked in the same Open work with the history subject.
- The TableGrid compiler benchmark in `packages/platejs/src/features/table/lib/internal/mutation.benchmark.slow.ts` keeps wall-clock budgets in a blocking test and failed once in four runs on two different cases, owner: zbeyens, tracked in the same Open work.
- `notifyListeners` still branches on two-argument plugin commit listeners, which the only writer never registers (`packages/plitejs/src/core/plugin.ts:1421-1440`), owner: zbeyens, tracked with the listener cleanup above.
- `benchmarks/slate-v2/donor/core/current/editor-store.mjs` fails at `HEAD` on `Editor document field "marks" is not supported`, owner: zbeyens, tracked in the same Open work.
- The surviving `BaseEditor.subscribeCommit` takes `EditorCommitListener<any>` (`packages/plitejs/src/interfaces/editor.ts:1859`), and `packages/platejs/src/react/components/Plate.tsx:163-165` derives its listener type from it. Whether it should take `EditorCommitListener<V>` is a separate public-type decision, owner: zbeyens, tracked in the same Open work.

## Panel gate

Round 2 was the last allowed panel round. These additive changes came from it and are unreviewed; the build adopts each only after you accept it.

- Absence search for the docs step, proposed and run read-only at `HEAD` by the Opus seat: `rg -n -e '[Ee]ditor\.subscribe\b' -e '\bSnapshotListener\b' -e '\bEditorCommitSource\b' -e 'editorSubscribe\b' content apps/www/src apps/www/public/r apps/www/api-reference.config.json benchmarks docs/plite/references docs/plite/final-api-hard-cuts-status.md docs/research/probes packages/platejs` prints nothing after the build. The round 1 command could not pass, because its unanchored `SnapshotListener` matched the surviving `coreNotifySnapshotListenersP95Ms` benchmark metric, and it missed the backtick and `?.(` forms.
- Test-project typecheck comparison as a multiset of file, code and message, with no count allowed to rise, in place of the unique file and message pairs.

## Evidence

The panel's challenge delta is improved. Round 1 replaced the provider's entry point (the commit source subscription became its own runtime subscription), added the namespace `subscribeCommit`, four benchmark calls and two teaching sites to the cut, and kept the behavior of two tests the round 0 plan would have broken. Round 2 narrowed the timing advice and the open-plan census.

Designs compared, after the arena, the probes and panel round 1:

| Target | Public ways | Order guarantee | Private change | Hot path | Result |
| --- | --- | --- | --- | --- | --- |
| Today | 3 spellings of one job | React effect kinds, proven by probe | None | Unchanged | Loses on one way per job |
| Cut, provider on its runtime subscription (selected) | 1 | Unchanged path; app-before-provider pinned by a new test | Provider call, dead branches | Unchanged | Selected |
| Cut, provider on the commit source subscription (round 0 pick) | 1 | Same Set on views; source phase on base editors | Provider call | One cached lookup per commit | Replaced in round 1: it changes phase with the editor kind and adds work the runtime path avoids |
| Frozen phase tuple, delete source buckets (arena base) | 1 | Structural | Listener stores, `notifyListeners`, runtime type, four React owners | Changed; needs a Benchmark receipt | Guards a reorder none of the seven sampled cases on a decorated root view produced; the probe did not cover authored fragments, nested commits or several views; rejected as a design judgment on that sample; its source-bucket cut is deferred on its own merits |
| Ordered registry with fragment continuation | 1 | Structural, fragment views too | Adds the authored runtime | Changed, unmeasured | Loses on size and risk |
| Per-view pipeline inside the provider | 1 | Per-view code order and fence version order | A React-owned registry | Changed | Deferred until a nested-commit fence defect reproduces |
| No editor subscription, plugin tier only | 0 | Not applicable | 19 call sites re-owned | Not applicable | Rejected: disposable observers such as the annotations store (`packages/plitejs/src/annotations/store.ts:324`, `:359`) have their own lifetime, and plugin install runs an update (`packages/plitejs/src/core/plugin.ts:3196`) |
| Rename the survivor to `subscribe((commit, snapshot))` | 1 | Not applicable | About 25 callers churn | Unchanged | Rejected: no capability gained |

How the target was chosen:

- Architect arena with three read-only runners: Opus, gpt-6-astra at high effort and gpt-6.1-sol at xhigh effort, each given a different starting direction. All three converged on deleting public `subscribe` and `SnapshotListener` and keeping `subscribeCommit`. They also converged on private ordered phases for the view pipeline. An Opus cross-judge scored the Opus candidate highest (23 against 16 and 16). It also proposed the per-view pipeline as an untested alternative.
- Order probe, run in detached worktrees with four logging lines (`probe-instrumentation.patch`) and the scratch test `zz-probe-order.test.tsx`. At base, app listeners, then decorations, then the provider, then the fences ran in that order after mount, a new `onValueChange`, a new decorations array, `readOnly` on and off, an `Editable` remount and StrictMode. The `subscribeCommit` mutant ran the provider before later app listeners and before decorations. The selected runtime-subscription change matched base in all seven cases. The three runs are saved separately as `r1/C0-probe-base.order`, `r1/C1-probe-mutant-subscribeCommit.order` and `r1/C2-probe-runtime-subscribe.order`.
- Mutation control: the full plitejs React suite passed all 1,425 tests both at base and with the provider on `subscribeCommit`. No test in that suite catches the move, which is why the plan adds one; the bun suites did not run against the mutant.
- Error-routing control: `runtime-contracts.test.ts` fails when a mutation removes the snapshot-phase `runEditorObserver` guard. It stops failing once the case migrates to `subscribeCommit` with its label changed. It fails again once the case calls `getEditorRuntime(editor).subscribe`, and that rewrite passes without the mutation.
- Benchmark control: `transaction-execution.mjs` exits 0 at `HEAD` and crashes at line 109 with `editor.subscribe is not a function` after the cut.
- Delete-and-typecheck spikes: with the round 0 cut applied (`spike2.patch`, provider on the commit source subscription, namespace `subscribeCommit` kept), `pnpm --filter platejs typecheck` exited 0. With the round 1 cut (`spike3.patch`), only the plitejs test-project typecheck ran, and it added errors only in the 17 test files listed under Hard cuts. The build reruns both package typechecks.
- What other editors do: see the subject's table. Only the slate-v2 fork keeps two public listeners with the same payload. Lexical, Tiptap and Slate split listeners by payload or filter, and CodeMirror and ProseMirror give early code an extension tier.
- Reconciliation with the 2026-10-04 audit: it proposed keeping the provider "through the private listener-state subscribe phase". Calling listener-state's `subscribe` with a view would register on an object `notifyListeners` never reads, so the plan uses the view runtime's subscription instead. It also rejected moving the provider into the private `'commit'` source phase. The plan does not take that path.

Three realistic failures and what catches each:

1. The provider moves to `subscribeCommit` during the build. The new ordering test fails.
2. Only the base object or only the view object loses `subscribe`. The base object is an annotated literal, so the typecheck flags a leftover there. The view object is inferred, so the absence check in the deletion step catches a leftover there.
3. An external app imports `SnapshotListener` or calls `editor.subscribe`. The plan accepts that as a beta break and names it in the changeset with the migration and the timing note, including that no public hook runs after the provider publishes.

To roll back, revert the build's diff. The cut changes no stored document, serialized format or wire shape, so nothing outlives a revert.

The probes ran in jsdom, not a browser. External downstream apps were not searched. The run's base commit is `0dfa19ab11`. The owner's commit `624a54a763` landed during the run. It committed this run's pick-page versions of this plan and `docs/plans/topics/reads.md`, along with `AGENTS.md`, the Build playbook, the architecture reference, the plan-page renderer and two check scripts. Those rule changes were already in the working tree when this session loaded them. The commit touches no source file this plan cites.
