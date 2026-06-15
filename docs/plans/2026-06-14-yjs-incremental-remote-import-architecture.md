# Yjs Incremental Remote Import Architecture

Date: 2026-06-14
Status: draft, source-anchor-audited, feasibility-preflighted, path-map-preflighted
Owner: `slate-plan` planning packet under `docs/plans/2026-06-14-yjs-research-mode-8h.md`
Runtime surface: `.tmp/slate-v2/packages/slate-yjs`

## Verdict

Do not implement incremental remote import as an opportunistic patch.

The right next architecture is a staged remote-import pipeline that consumes Yjs
event/deep-delta evidence, maps affected Yjs paths back to Slate paths, applies
bounded Slate-side patches for proven-safe cases, and falls back to the current
full read/replace path with an explicit trace when the delta crosses an unsafe
boundary.

Current proof says the bottleneck is not update encoding. Repeated benchmark
samples put remote encode at p95 `0.25-0.33ms` and remote apply/import at p95
`28.16-38.35ms`. The new trace oracle proves the current remote reconcile path
still imports the whole Yjs root and replaces the Slate value.

## Intent And Boundary

Intent:
- Reduce large-document remote sync cost without weakening collaboration
  correctness, undo/history behavior, selection repair, or hidden/virtual child
  handling.

Desired outcome:
- Remote Yjs updates should use incremental import for narrow text and child
  window changes that can be mapped safely.
- The full read/replace importer should remain as an explicit fallback path
  until the incremental importer proves parity across selection, history,
  hidden children, and structural edits.

In scope:
- `@slate/yjs` remote import/readback architecture.
- Trace taxonomy for incremental, fallback, and full import paths.
- Package tests and benchmark rows that prove the chosen importer path.
- Research evidence from Yjs, y-prosemirror, and Lexical bindings.

Non-goals:
- No runtime implementation in this planning packet.
- No automatic soak invocation. Restored soak runners are manual-only and must
  not run unless the user explicitly asks for a soak run.
- No persistent-soak release-proof claim/helper restoration.
- No public API expansion unless a later implementation plan proves it is
  required.
- No release, PR, changeset, or broad integration-sweep claim.

Decision boundary:
- This plan may define the target architecture, accepted fallback policy,
  proof rows, and first implementation slice.
- A later execution packet must prove the behavior in `.tmp/slate-v2` before
  any runtime code is kept.

## Live Source Facts

| Fact | Evidence | Consequence |
| ---- | -------- | ----------- |
| Remote import currently reads every visible root child and replaces editor value. | `.tmp/slate-v2/packages/slate-yjs/src/core/controller.ts:523` and `:535-545` | Incremental import is a runtime-boundary change, not a helper cleanup. |
| Trace now records full read/replace imports with child count. | `.tmp/slate-v2/packages/slate-yjs/src/core/controller.ts:537-541`; `.tmp/slate-v2/packages/slate-yjs/src/core/types.ts:117-124` | The current fallback can stay observable while incremental cases are added. |
| Package oracle proves current full import on remote updates. | `.tmp/slate-v2/packages/slate-yjs/test/remote-import-contract.spec.ts:59-143` | Future implementation needs to revise this contract, not delete its coverage. |
| Benchmark now splits local edit, remote encode, remote apply/import, and remote sync. | `.tmp/slate-v2/scripts/benchmarks/core/current/yjs-collaboration.mjs:213-238` and `:415-462` | The next perf target is remote apply/import, not state-vector encoding. |
| Yjs soak runner scripts are restored as manual-only diagnostics. | `.tmp/slate-v2/packages/slate-yjs/test/package-config-contract.spec.ts:192-230`; `docs/slate-v2/agent-start.md` | Browser/proof strategy must use bounded package/Playwright gates by default; soak runners require explicit user instruction. |
| Persistent-soak release-proof surface is intentionally absent. | `.tmp/slate-v2/packages/slate-browser/src/core/release-proof.ts`; `.tmp/slate-v2/packages/slate-browser/src/core/index.ts` | Release proof should not retain a claim/helper that invites restoring the deleted runner. |
| Document helpers distinguish raw, visible, hidden, and virtual Yjs children. | `.tmp/slate-v2/packages/slate-yjs/src/core/document.ts:520-760` and `:1220-1428` | A future path map must preserve visible-slot semantics and cannot cache raw child indexes as Slate paths. |
| Visible child slots can point at virtual children with no raw slot and skip hidden raw children. | `.tmp/slate-v2/packages/slate-yjs/src/core/document.ts:245-363` | Incremental import needs a visible-slot resolver; raw Yjs event indexes are unsafe as Slate path indexes. |
| Remote selection repair already returns `null` when a Yjs relative position cannot map to a visible Slate path. | `.tmp/slate-v2/packages/slate-yjs/src/core/selection.ts:34-60` | Incremental import must keep selection repair as a gate, not assume every remote Yjs text position is visible in Slate. |
| Local Slate-to-Yjs operations already encode the safety taxonomy. | `.tmp/slate-v2/packages/slate-yjs/src/core/operations.ts:280-605` | The remote importer should reuse text-point resolution and traceable fallback categories instead of bypassing the existing safety model. |
| Compatible replacement helpers patch same-shape Slate snapshots, not raw Yjs events. | `.tmp/slate-v2/packages/slate-yjs/src/core/replacement.ts:220-420` | The helper is useful precedent for minimal text replacement, but remote import needs event-to-path input before it can use comparable patch semantics. |
| Current trace fallback labels are local-operation scoped. | `.tmp/slate-v2/packages/slate-yjs/src/core/types.ts:102-124`; `.tmp/slate-v2/packages/slate-yjs/src/core/operations.ts:245-252` | Remote import should add remote-specific fallback reason fields instead of overloading `YjsTraceFallback`. |

Source-anchor audit:
- 2026-06-14T19:33+0800: `nl -ba` source slices confirm the facts above still
  match current Slate v2 source. Audited files:
  `packages/slate-yjs/src/core/controller.ts`,
  `packages/slate-yjs/src/core/types.ts`,
  `packages/slate-yjs/test/remote-import-contract.spec.ts`,
  `scripts/benchmarks/core/current/yjs-collaboration.mjs`, and
  `packages/slate-yjs/test/package-config-contract.spec.ts`.
- 2026-06-15T00:00+0800: soak runner files are restored as manual-only
  diagnostics. The package contract must keep package script aliases and
  automatic script references absent.
- 2026-06-14T20:48+0800: reran the source-anchor audit with narrow reads after
  a broad combined audit output was truncated. The controller, trace type,
  remote-import contract, benchmark metric, and no-soak guard anchors still
  match live source.
- 2026-06-14T20:58+0800: parent docs audit now also fails if either deleted
  Yjs long-runner file reappears under `.tmp/slate-v2/scripts/proof`.
- 2026-06-14T21:22+0800: read `document.ts` and `operations.ts` source
  anchors for path-map feasibility. Visible child readers, virtual/hidden child
  placeholders, text-point resolution, and traceable fallbacks are the relevant
  implementation constraints for the staged importer.
- 2026-06-14T21:31+0800: read `replacement.ts`, `types.ts`, and
  `operations.ts` trace helpers. Compatible child replacement needs old/new
  Slate snapshots, and existing fallback labels are local-operation scoped.
- 2026-06-14T22:37+0800: refreshed no-soak source anchors after deleting the
  remaining executable soak runners and removing the stale persistent-soak
  release-proof claim/helper. The package-config guard now spans
  `packages/slate-yjs/test/package-config-contract.spec.ts:192-230`; the
  `slate-browser` release-proof surface has no persistent-soak claim/helper.
- 2026-06-14T23:24+0800: refreshed path-map source preflight. Visible slots can
  surface virtual children with `rawIndex=-1`, skip hidden raw children, and
  selection repair maps Yjs relative positions through `getYjsVisiblePath`.

## Decision Brief

Principles:
- Keep Slate v2 unopinionated and package-owned; no Plate-shaped API leak.
- Preserve Yjs as the durable collaboration source of truth.
- Prefer bounded incremental import only when path mapping is exact.
- Keep full read/replace as a named fallback until parity is proven.
- Make every importer path traceable and benchmarked.

Top drivers:
- Large-doc remote apply/import dominates remote encode.
- Selection, history, hidden children, and Yjs node identity are correctness
  traps.
- External bindings prove event-delta import is the right class of design, but
  not a copy-paste implementation.

Viable options:

| Option | Pros | Cons | Decision |
| ------ | ---- | ---- | -------- |
| Keep full read/replace only | Simple and already green | Large-doc cost remains and remote updates scale with whole document readback | reject as final architecture |
| Directly rewrite remote import to deep-delta patches | Targets the measured hot lane | Too risky without path map, fallback policy, and trace contract | reject as first slice |
| Staged incremental importer with explicit fallback | Bounded, measurable, preserves safety, lets tests grow by case | More planning and trace taxonomy before runtime payoff | choose |
| Copy y-prosemirror/Lexical strategy | Proven ecosystems | Wrong editor model and would smuggle foreign abstraction into Slate | reject |

Chosen option:
- Add a staged incremental importer behind internal `@slate/yjs` runtime
  ownership. Start with narrow text updates and sibling child-window edits. Fall
  back explicitly for moves, merges, hidden/virtual children, selection-risky
  edits, or unknown Yjs paths.

## Ecosystem Strategy

| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
| ------ | ------ | --------- | ------ | ----- | ------ | ------------ | ------- |
| Yjs | `docs/slate-v2/research/2026-06-14-yjs-large-doc-import-readback/read-log.tsv` `yjs-event`, `local-yjs-event-path`, `local-yjs-text-delta`, `local-yjs-observe-deep` | Installed `yjs@13.6.30` exposes event path, callback-scoped changes/delta, YText delta, and deep event routing through `changedParentTypes` | Blind full tree reads for every remote update | Use event path/deep delta as the importer input, captured during the event callback | Treating raw Yjs delta as Slate ops without validation | Internal path-mapped importer input | agree |
| y-prosemirror | `read-log.tsv` `y-prosemirror-sync` | Converts Yjs deep deltas into editor transactions with sync metadata | Full document replacement and history pollution | Transaction-shaped remote import with explicit metadata | ProseMirror step/schema model | Slate commit tagged `remote-yjs-import` with importer mode | partial |
| y-prosemirror undo | `read-log.tsv` `y-prosemirror-undo` | Stores selection bookmarks through relative positions and suppresses plugin transactions | Remote sync corrupting local selection/history | Keep selection/history handling outside raw import patching | ProseMirror plugin lifecycle | Selection repair gate for every incremental case | partial |
| Lexical Yjs | `read-log.tsv` `lexical-sync-events` and `lexical-binding` | Binding-owned node maps and event precompute inside editor update | Recomputing whole editor state on every event | Binding-owned maps and event precompute concept | Lexical node model and command system | Yjs-node-to-Slate-path cache owned inside `@slate/yjs` | partial |

## Target Architecture

Internal pieces:

| Piece | Responsibility |
| ----- | -------------- |
| `remote-event-reader` | Convert Yjs transaction events into candidate changed Yjs paths and delta classes. |
| `yjs-slate-path-map` | Maintain a validated map from visible Yjs nodes to current Slate paths. |
| `incremental-remote-importer` | Apply safe text and child-window changes to Slate without reading the whole root. |
| `remote-import-fallback` | Preserve current `readSlateValueFromYjs` plus `replaceValue` path with explicit trace. |
| `remote-import-trace` | Emit `incremental`, `fallback`, `full-read-replace`, skipped reason, affected path count, and imported child count when applicable. |
| `remote-import-benchmark` | Keep local edit, remote encode, remote apply/import, remote sync, and verification metrics distinct. |

Implementation constraints from source preflight:
- A path map must be keyed by Yjs node identity plus validated visible Slate
  paths, not raw array indexes. Hidden nodes and virtual placeholders can alter
  the raw/visible relationship.
- A path-map cache must be invalidated or recomputed whenever an event touches
  hidden attributes, virtual child ids, or placeholder nodes. Raw event index
  drift in those zones is a mandatory fallback reason, not a partial patch.
- Narrow text import should reuse `resolveYjsTextPoint` semantics or an
  equivalent visible-child reader so adjacent text nodes and virtual children
  do not create wrong offsets.
- Selection repair must remain a gate after incremental import. If a relative
  selection cannot map through `getYjsVisiblePath`, the importer must fall back
  or clear selection using the current adapter behavior.
- Structural remote changes should begin as explicit fallback reasons. Existing
  local operation handling already treats move, merge, virtual unwrap, virtual
  removal, and incompatible structural edits as traceable fallback classes.
- `replaceCompatibleYjsChildren` is a useful same-shape patching reference, but
  it cannot be the first remote-event importer because it needs old/new Slate
  child snapshots instead of Yjs event-path input.
- Remote import fallback reasons should be a remote-specific trace surface.
  Reusing current `YjsTraceFallback` labels for event-path rejection would blur
  local Slate operation fallbacks with remote Yjs import decisions.
- The first trace-taxonomy slice should expose enough fallback detail to prove
  that unsafe Yjs event paths are rejected deliberately, not silently routed
  through an incremental label.

First implementation slice:
- Add trace taxonomy only:
  - `importKind: 'full-read-replace' | 'incremental' | 'fallback-full-read-replace'`
  - `affectedPaths?: number`
  - `remoteFallbackReason?: <remote-import fallback union>`
- Add failing/characterization tests for a remote text insert that should be
  eligible for incremental import.
- Do not change import behavior until the trace taxonomy and tests are green.

Second implementation slice:
- Implement incremental text import for a single Yjs text event under a stable
  visible parent path.
- Keep fallback for structural edits, hidden children, and any map miss.
- Verify package tests and benchmark direction before expanding.

## Proof Plan

Package proof from `.tmp/slate-v2`:

| Gate | Command | Required result |
| ---- | ------- | --------------- |
| Current package contracts | `bun test ./packages/slate-yjs/test` | pass |
| Type/API | `bun --filter ./packages/slate-yjs typecheck` | exit 0 |
| Remote import contract | `bun test ./packages/slate-yjs/test/remote-import-contract.spec.ts` | old full-import row stays until intentionally revised |
| Benchmark correctness | `bun run bench:core:yjs-collaboration:local` | `yjs_correctness_failures=0` |
| Manual-only soak runners | `bun test ./packages/slate-yjs/test/package-config-contract.spec.ts` | runner files exist, but package script aliases and automatic references stay absent |
| No stale release-proof soak surface | `bun --filter slate-browser test:proof`; no-soak symbol scan | persistent-soak claim/helper/export stay absent |

Implementation proof rows to add later:

| Scenario | Import path expected | Assertion |
| -------- | -------------------- | --------- |
| Remote text insert in one paragraph | incremental | No full root read trace; target text converges; selection remains valid. |
| Remote text insert with local adjacent edit | incremental or fallback with reason | Convergence and no history pollution. |
| Remote child insertion in visible parent | incremental child-window or fallback with reason | Existing sibling identity preserved where possible. |
| Hidden/virtual child change | fallback with reason | No silent incremental path. |
| Move/merge/split structural edit | fallback with reason until dedicated matrix row | No false incremental claim. |

Benchmark proof:
- Baseline: remote apply/import p95 `28.16-38.35ms` in repeated samples.
- Target for first kept runtime implementation: reduce remote apply/import p95
  for eligible text-only large-doc remote sync without increasing correctness
  failures or hiding work in verification.

## Maintainer Objection Ledger

| Objection | Answer | Verdict |
| --------- | ------ | ------- |
| "This is too much machinery for one benchmark." | The plan does not add runtime machinery yet. It first adds trace taxonomy and characterization tests. Current metrics prove the hot lane is apply/import, not encoding. | keep |
| "Full read/replace is safer." | It remains the explicit fallback. Incremental import is allowed only for mapped, proven-safe deltas. | keep |
| "Yjs deltas are not Slate operations." | Correct. The target is a validated importer from Yjs event paths to Slate patches, not raw delta replay as Slate ops. | keep |
| "Selection/history will break." | Every incremental row must include selection/history gates; risky rows fall back. | keep |
| "This may conflict with the older operation matrix." | The older matrix covers local operation encoding. This plan covers remote Yjs import/readback. They meet at trace and fallback policy, but are separate owners. | keep |

## Score

| Dimension | Score | Evidence |
| --------- | ----- | -------- |
| React runtime performance | 0.84 | Planning packet does not touch React; benchmark target is package runtime. |
| Slate-close unopinionated DX | 0.90 | No public API expansion; package-owned internal importer. |
| Plate/slate-yjs migration backbone | 0.90 | Collaboration import remains `@slate/yjs` owned with explicit fallback. |
| Regression-proof testing strategy | 0.88 | Package tests, trace contract, benchmark rows, and no-soak guard are named; browser proof remains scoped. |
| Research evidence completeness | 0.88 | Yjs, y-prosemirror, Lexical, and live Slate v2 source evidence recorded. |
| Simplicity/composability | 0.86 | Staged slices avoid one-shot rewrite; still needs implementation validation. |

Total: `0.88`

Status:
- Planning packet is useful and ready to feed a later implementation plan.
- It is not a closed Slate Plan lane. Browser/native proof and issue-ledger
  accounting are intentionally not complete here.

## Next Owner

`slate-plan` or `slate-patch` execution only after explicit acceptance of this
architecture direction:

1. Add trace taxonomy and tests.
2. Keep current full read/replace behavior.
3. Prove package/type/benchmark stay green.
4. Add first incremental text-import implementation only after the trace tests
   fail for the current full-import path in a useful way.
