# Slate v2 Whole Rewrite Deep Review Plan

Date: 2026-04-28
Status: done; deep slate-review closed
Scope: review, research, and plan-hardening only. No Slate v2 implementation edits in this lane.
Score: 0.925 after Pass 7 closure

## 1. Current Verdict

Harsh take: the rewrite is much stronger than the old complaint list implied,
and the review plan is now strong enough to execute. That does not mean the
implementation is done; it means the remaining problems have the right owners,
cuts, acceptance criteria, and gates.

The good part is real. Slate v2 has a transaction-first core, `state` / `tx`
public lifecycle, extension namespaces, runtime-owned void shells, named root
selector sources, event/runtime facades, generated browser stress rows, and
collab/history replay contracts.

The bad part is also real. The implementation still has public API drift in
docs, some public surfaces still expose low-level primitives that fight the
clean DX target, and legacy browser parity is not yet generated enough to say
users will stop finding regressions one by one. Those are execution owners now,
not open architecture questions.

Pass 6 verdict: keep course and execute this shape. The hard cuts do not break
the ecosystem backbone; they force Plate and slate-yjs onto cleaner substrate.
The implementation plan now names the public API/doc guard, core write-surface
cut, internal transform registry, React shell/render DX cut, runtime facade
boundary, first legacy browser parity slice, and ecosystem release proof.

## 2. Confidence Scorecard With Evidence References

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.92 | React 19.2 research says React is the projection scheduler, not the editor invalidation engine, in `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md`. `EditableDOMRoot` wires `useEditableRootRuntime` and stable returned handlers in `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx:143`. Pass 4 accepts the facade direction but requires owner boundaries inside `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:77` and `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts:100`. |
| Slate-close unopinionated DX | 0.20 | 0.91 | `state` / `tx` is the accepted normal public API in `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md`. `state-tx-public-api-contract.ts` proves coherent reads/writes through `editor.read` and `editor.update` at `/Users/zbeyens/git/slate-v2/packages/slate/test/state-tx-public-api-contract.ts:29` and `:51`. Pass 6 turns the remaining API drift into concrete docs/API guard and write-surface owners, and Pass 5 confirms raw Slate should not preserve Plate's current `editor.api` / `editor.tf` shape as compatibility law. |
| Plate and slate-yjs migration-backbone shape | 0.15 | 0.96 | Plate currently depends on plugin API/transform extension and composition in `/Users/zbeyens/git/plate-2/packages/core/type-tests/plate-plugin-contracts.ts:24` and `/Users/zbeyens/git/plate-2/packages/core/type-tests/plugin-composition-contracts.ts:30`. Slate v2 provides typed `state` / `tx` namespaces without mutating the editor object in `/Users/zbeyens/git/slate-v2/packages/slate/test/generic-extension-namespace-contract.ts:56`. Yjs gets deterministic initial state in `/Users/zbeyens/git/plate-2/packages/yjs/src/utils/slateToDeterministicYjsState.ts:13` plus deterministic replay/metadata in `/Users/zbeyens/git/slate-v2/packages/slate/test/collab-history-runtime-contract.ts:113`. |
| Regression-proof testing strategy | 0.20 | 0.93 | Browser stress covers inline voids, markable inline voids, block voids, editable islands, stale targets, tables, search, toolbar selection, paste, and IME in `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:45`, with replay artifacts asserted at `generated-editing.test.ts:997`. Pass 6 names the first generated current-vs-legacy browser parity slice and keeps it in stress/release lanes, not default CI. |
| Research evidence completeness | 0.15 | 0.92 | The compiled research layer has current pages for React 19.2, Lexical, ProseMirror, Tiptap, state/tx, and runtime-owned node rendering. Pass 5 added local Plate and Yjs source evidence: Plate plugin composition/type contracts, Yjs plugin/provider/init shape, deterministic Yjs initialization, and Slate v2 collab/runtime contracts. |
| shadcn-style composability and hook/component minimalism | 0.10 | 0.91 | `renderVoid` receives only `{ element, target }` and no `children`, `attributes`, `selected`, `focused`, or `actions`, proved in `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx:373`. Plate's product layer already owns render/inject/UI composition through plugin `render` and `inject` surfaces at `/Users/zbeyens/git/plate-2/packages/core/src/lib/plugin/BasePlugin.ts:146` and `/Users/zbeyens/git/plate-2/packages/core/src/internal/plugin/pipeInjectNodeProps.tsx:11`; Pass 6 adds acceptance criteria that normal raw Slate exports stay content-target/selector based and shell mechanics remain internal. |

Weighted total: `0.925`.

The score threshold is met and Pass 7 closure confirms the review gates. The
checkpoint can move to `done`.

## 2.1 Pass 2 Research And Live-Source Refresh

Status: complete for Pass 2 only. Completion remains `pending`.

Verdict: the research layer mostly agrees with the live rewrite direction, but
Pass 2 found one stale research example and a wider public-doc drift than Pass 1
recorded.

The stale research example is fixed: the node-DX decision now uses
`editor.update((tx) => tx.nodes.insert(...))` in extension commands and points
back to the `state` / `tx` decision as the public write authority.

The live docs are still not ready. `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/slate.md:14`
still documents `onSelectionChange`, `onSnapshotChange`, and `onValueChange`.
`/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/hooks.md:17` still
documents `useFocused`, `useSelected`, `useSlateStatic`, and
`useSlateSelection`. `/Users/zbeyens/git/slate-v2/docs/api/nodes/element.md:60`
still teaches the old markable-void `children` plus `useSelected` /
`useFocused` shape. Those are not harmless docs typos; they are exactly the
API footguns this rewrite is supposed to kill.

Score: `0.879`.

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.90 | The React research page is current as of 2026-04-28 and still says React 19.2 helps the projection layer while the editor needs dirty-node/source runtime ownership. Live source still routes root policy through `useEditableRootRuntime` and named root selectors. No new perf contradiction was found. |
| Slate-close unopinionated DX | 0.20 | 0.81 | The `state` / `tx` decision remains accepted, and `docs/concepts/04-transforms.md` now teaches `tx.*`; however, public React docs still teach old callbacks and hooks, and `BaseEditor` still exposes primitive write methods. DX drops slightly because Pass 2 found stale hook and markable-void docs beyond the callback docs. |
| Plate and slate-yjs migration-backbone shape | 0.15 | 0.92 | Raw snapshots for Lexical, ProseMirror, and Tiptap are recorded under `../raw/*/README.md`; extension namespaces and replay/collab contracts remain live-source backed. No current-version adapter requirement was reintroduced. |
| Regression-proof testing strategy | 0.20 | 0.90 | `test:stress` is a sparing Playwright lane in `/Users/zbeyens/git/slate-v2/package.json:66`; `slate-browser` provides replay/plugin contract primitives at `/Users/zbeyens/git/slate-v2/packages/slate-browser/src/playwright/index.ts:2413`; release discipline guards are explicit at `/Users/zbeyens/git/slate-v2/packages/slate-browser/src/core/release-proof.ts:67`. The gap remains current-vs-legacy browser parity. |
| Research evidence completeness | 0.15 | 0.90 | Pass 2 checked recent research log entries, the state/tx decision, node-DX decision, React 19.2 source page, read/update corpus ledger, and raw-family metadata for Lexical, ProseMirror, and Tiptap. It also cleaned the stale node-DX command example and appended the research log. |
| shadcn-style composability and hook/component minimalism | 0.10 | 0.84 | The implementation API is cleaner than legacy, but public docs still teach old hook names, markable voids still show app-owned `children`, `SlateSpacer` remains public, and `React.createElement` leftovers remain. This dimension is below the floor until docs and exported primitives match the intended minimal surface. |

Weighted total: `0.879`.

Pass 2 findings:

- P1: public React docs are stale beyond callbacks. Hook docs and element docs
  still teach old APIs and old markable-void authoring.
- P1: public write-surface direction is not contradictory in research anymore,
  but the live `BaseEditor` primitive method surface still needs a hard
  accepted answer.
- P2: release and stress proof are real, but browser legacy parity is still an
  architecture gap, not a solved fact.
- P2: `SlateSpacer` remains the clearest public export that conflicts with
  runtime-owned shell DX.

Plan delta from Pass 2:

- Updated the node-DX research decision to use `tx.nodes.insert(...)`.
- Appended a research log row for the cleanup.
- Raised research evidence from `0.88` to `0.90`.
- Raised migration-backbone from `0.91` to `0.92`.
- Raised regression proof from `0.89` to `0.90`.
- Lowered DX from `0.82` to `0.81` and composability from `0.86` to `0.84`
  because the stale hook/element docs are broader than Pass 1 recorded.

Next owner:

- Pass 3 pressure passes, starting with DX and simplicity. The plan needs a
  firm keep/cut answer for old callback docs, stale hook docs, markable-void
  docs, `SlateSpacer`, primitive editor writes, and root/event runtime facade
  size.

## 2.2 Pass 3 Pressure Passes

Status: complete for Pass 3 only. Completion remains `pending`.

Verdict: keep the rewrite direction, but remove the ambiguity. The stale React
docs are cuts, not migration help. Public spacer ownership is incompatible with
the target void DX. Primitive editor writes remain the only real unresolved API
pressure point and must be answered in the maintainer ledger instead of drifting
as a friendly legacy mirror.

Score: `0.888`.

| Pressure | Decision | Evidence | Plan response |
| --- | --- | --- | --- |
| React runtime | keep, with split-pressure | `EditableDOMRoot` now wires `useEditableRootRuntime` at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx:143` and handler bindings at `editable.tsx:162`. The root runtime still composes selection, Android, repair, trace, and input state at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:77`, while event runtime takes a broad parameter set at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts:100`. | Keep React thin. Pass 4 accepted the facade direction with owner-boundary conditions. |
| React callback docs | cut | `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/slate.md:14` still documents `onSelectionChange`, `onSnapshotChange`, and `onValueChange`; `/Users/zbeyens/git/slate-v2/docs/walkthroughs/06-saving-to-a-database.md:32` teaches `onValueChange`. | Current docs should teach `onChange` for value persistence and `onCommit` for advanced commit observation. No normal public `onSnapshotChange`, `onSelectionChange`, or `onValueChange`. |
| Hook docs | cut | `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/hooks.md:17` and `/Users/zbeyens/git/slate-v2/docs/walkthroughs/09-performance.md:45` still teach old broad hooks. Current exports are `useEditor`, `useEditorFocused`, `useEditorSelection`, `useEditorSelector`, `useElementSelected`, `useNodeSelector`, and `useTextSelector` at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/index.ts:51`. | Docs should teach stable editor access plus opt-in source/node/text/element selectors. No broad hook story that implies all nodes rerender on focus/selection. |
| Markable void authoring docs | cut | `/Users/zbeyens/git/slate-v2/docs/api/nodes/element.md:57` still teaches markable void rendering through text children plus `useSelected` / `useFocused`. Live `renderVoid` passes only `{ element, target }` at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:207`, and surface tests reject `children`, `attributes`, `selected`, `focused`, and `actions` at `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx:409`. | Keep markable void model semantics, but app renderers do not own hidden children or shell placement. Selection/focus UI is opt-in by target. |
| Public `SlateSpacer` | cut from normal public surface | `SlateSpacer` is exported at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/index.ts:42`; `SlateVoidShell` consumes it internally at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate-void-shell.tsx:25`; the primitives contract still manually composes it at `/Users/zbeyens/git/slate-v2/packages/slate-react/test/primitives-contract.tsx:111`. | Move `SlateSpacer` to internal or an ugly unsafe/testing export. Normal void authors never see the spacer. |
| Primitive editor writes | revise through ledger | `BaseEditor` exposes overrideable primitive transforms at `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:258`; write-boundary tests still allow `editor.setNodes` and `editor.insertText` inside update at `/Users/zbeyens/git/slate-v2/packages/slate/test/write-boundary-contract.ts:79`. | Normal public docs stay `editor.update((tx) => tx.*)`. Pass 4 accepted removing primitive writers from normal public `BaseEditor`; any survival is internal/unsafe only. |
| Migration backbone | keep | Extension namespaces and flat `methods` rejection remain the substrate. Collab replay stays through `applyOperations`, with legacy fixture utilities mapping old core fixtures into the current runtime at `/Users/zbeyens/git/slate-v2/packages/slate/test/legacy-fixture-utils.ts:9`. | Do not add current-version Plate/slate-yjs adapters. Require only extension namespace, schema/spec, deterministic commit, and operation replay backbone. |
| Regression proof | revise stronger | `test:stress` is sparing at `/Users/zbeyens/git/slate-v2/package.json:66`; operation families start at `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:45`; replayability is asserted at `generated-editing.test.ts:997`; release guards are listed at `/Users/zbeyens/git/slate-v2/packages/slate-browser/src/core/release-proof.ts:67`. | Add generated current-vs-legacy browser parity rows for the user-reported classes as a stress/release subset, not default CI. |

Plan delta from Pass 3:

- Promoted stale callback, hook, and markable-void docs from "drift" to hard
  cuts.
- Promoted public `SlateSpacer` from "question" to normal-public-surface cut.
- Kept root/event runtime facades as the right direction while reserving a
  maintainer-ledger challenge on facade size.
- Kept migration-backbone scope and explicitly rejected current adapter work.
- Strengthened regression proof to require generated current-vs-legacy browser
  parity in stress/release lanes.

Next owner:

- Pass 4 Slate maintainer objection ledger. Answer the real objections before
  raising the score over the completion floor.

## 2.3 Pass 4 Slate Maintainer Objection Ledger

Status: complete for Pass 4 only. Completion remains `pending`.

Verdict: the cuts survive maintainer pressure. The plan should not keep old API
shapes around as sympathy shims. The only concession is architectural, not
compatibility-based: if primitive writers or spacer helpers remain necessary
for internals or tests, they need an explicitly non-normal home.

Score: `0.904`.

| Objection | Verdict | Answer | Plan response |
| --- | --- | --- | --- |
| "`editor.insertText` is familiar. Why force `tx.text.insert`?" | accepted hard cut | Familiar is not enough. `editor.read` and `editor.update` prove grouped state and writes with coherent draft reads in `/Users/zbeyens/git/slate-v2/packages/slate/test/state-tx-public-api-contract.ts:29` and `:51`. Primitive writers on `BaseEditor` at `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:258` keep the old footgun alive because normal code cannot tell transaction writes from direct mutable core methods. | Normal public writes are `tx.*`. Primitive editor writers leave normal public `BaseEditor`; if core needs overrideable algorithms, put them in an internal transform registry or explicitly unsafe/internal bridge, guarded by public-surface tests. |
| "`onValueChange` is clearer than `onChange`." | accepted cut | Live `<Slate>` already exposes `onChange` and `onCommit` at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate.tsx:30`, calls `onCommit` for every commit at `:93`, and calls `onChange` only when children changed at `:97`. `onValueChange`, `onSelectionChange`, and `onSnapshotChange` fragment the public lifecycle and duplicate the low-level tap. | Docs and guards teach `onChange(value)` for value persistence and `onCommit(commit, snapshot)` for advanced observation. Selection observation goes through state/selectors, not a default callback prop. |
| "Legacy hooks are useful for selected/focused void UI." | accepted cut | Current hook exports already provide focused editor state, selection, editor selectors, element selection, node selectors, and text selectors at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/index.ts:51`. `renderVoid` intentionally omits eager `selected` and `focused` props in `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx:409`. | Docs teach opt-in node/element/source selectors by target. No broad hook docs that imply all nodes subscribe to focus or selection. |
| "Markable void authors sometimes need the hidden child for marks/IME." | accepted cut with model caveat | Markable void model semantics can stay, but DOM placement belongs to the runtime. `SlateInlineVoidShell` already owns platform-specific anchor order at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate-void-shell.tsx:37`. User renderers receive `{ element, target }`, not hidden children. | Keep marks as model data. App code renders visible content only; runtime maps marks/IME/hidden anchors. Advanced shell ownership is unsafe and must carry browser-contract proof. |
| "I need `SlateSpacer` for weird browser cases." | accepted cut from normal surface | `SlateSpacer` is currently public at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/index.ts:42`, but normal `SlateVoidShell` consumes it internally at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate-void-shell.tsx:25`, and surface tests already prove runtime-owned spacer DOM at `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx:402`. | Remove `SlateSpacer` from normal exports. Keep only internal/testing/unsafe shell helpers. Name the unsafe path ugly and require browser-contract coverage. |
| "The runtime facade is just a new giant component." | accepted direction, revised owner boundary | `EditableDOMRoot` is thin enough: it calls `useEditableRootRuntime` at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx:143` and attaches returned handlers at `:162`. The concern is inside the runtime: `runtime-root-engine.ts:77` and `runtime-event-engine.ts:100` still have broad orchestration surfaces. | Keep policy out of React components. Split runtime internals by owner if the facade starts hosting policy bodies. The allowed root facade shape is orchestration plus stable bindings, not a policy dump. |
| "Legacy browser parity rows will be slow and flaky." | accepted with scope control | `test:stress` is already sparing at `/Users/zbeyens/git/slate-v2/package.json:66`; operation families and replayability exist at `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:45` and `:997`. Core legacy fixtures are mapped at `/Users/zbeyens/git/slate-v2/packages/slate/test/legacy-fixture-utils.ts:9`, but browser parity is still missing. | Add generated current-vs-legacy behavior parity rows for the user-reported bug classes. Compare model selection, focus owner, DOM-selection class, and layout invariants, not pixel-perfect old DOM. Keep default CI fast; run parity in stress/release subsets. |
| "Raw Slate should support current Plate/slate-yjs adapters now." | rejected as wrong requirement | The review target is migration backbone, not current adapter support. Extension namespaces are typed and do not mutate the editor object at `/Users/zbeyens/git/slate-v2/packages/slate/test/generic-extension-namespace-contract.ts:132`; legacy extension `methods` are rejected at `/Users/zbeyens/git/slate-v2/packages/slate/test/extension-methods-contract.ts:15`. | Keep raw Slate unopinionated. Plate and slate-yjs get a viable architecture backbone: `state` / `tx` namespaces, schema/spec policy, deterministic commits, operation replay, and local-only targets. |

Plan delta from Pass 4:

- Accepted `tx.*` as the only normal write DX.
- Reclassified primitive editor writers from "maybe advanced" to "not normal
  public `BaseEditor`"; any survival needs internal/unsafe naming and guards.
- Accepted `onChange` / `onCommit` as the whole public React callback story.
- Accepted selector-by-target docs as the replacement for legacy selected/focus
  hook guidance.
- Accepted runtime-owned markable-void DOM structure and cut normal app-owned
  hidden child placement.
- Accepted public `SlateSpacer` removal from normal exports.
- Accepted root/event facades with an owner-boundary condition.
- Accepted generated current-vs-legacy browser parity as behavior contracts in
  stress/release lanes.

Next owner:

- Pass 5 ecosystem maintainer pass. Pressure the accepted cuts against Plate and
  slate-yjs migration-backbone needs without requiring current adapters.

## 2.4 Pass 5 Ecosystem Maintainer Pass

Status: complete for Pass 5 only. Completion remains `pending`.

Verdict: the accepted cuts hold. The plan should not pivot to current Plate or
current slate-yjs compatibility. It should preserve the substrate those
libraries need to migrate cleanly: extension namespaces, schema/spec policy,
deterministic commits, operation replay, local-only targets, and React render
composition that stays above raw Slate.

Score: `0.916`.

| Ecosystem pressure | Verdict | Evidence | Plan response |
| --- | --- | --- | --- |
| Plate plugin commands currently use `editor.api` / `editor.tf`. | keep hard cut; provide backbone, not adapter | Plate's current plugin API shape is explicit in `/Users/zbeyens/git/plate-2/packages/core/type-tests/plate-plugin-contracts.ts:24`, where plugins extend editor API, and in `/Users/zbeyens/git/plate-2/packages/core/type-tests/plugin-composition-contracts.ts:30`, where nested plugins add selectors, API, and transforms. Slate v2's replacement backbone is typed `state` / `tx` namespaces at `/Users/zbeyens/git/slate-v2/packages/slate/test/generic-extension-namespace-contract.ts:56` and editor-object mutation rejection at `:153`. | Raw Slate keeps `state` / `tx`; Plate can map product `api` / `tf` to raw namespaces during its own migration. Raw Slate must not freeze current `editor.api` / `editor.tf` as public law. |
| Plate needs schema/spec policy for nodes, voids, selectability, and marks. | keep | Slate v2 schema definitions live on `editor.schema.define` and `getElementSpec` at `/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts:149`, with `isInline`, `isSelectable`, `isVoid`, and `markableVoid` derived at `:164`. State exposes schema reads at `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:649`. | Keep schema/spec as the raw policy substrate. Plate can package opinionated node specs, but raw Slate owns interpretation during normalization, selection, and render shell mapping. |
| Plate UI needs render, inject, shadcn components, and product composition. | keep raw/Plate split | Plate's product layer owns render nodes, render wrappers, and inject props at `/Users/zbeyens/git/plate-2/packages/core/src/lib/plugin/BasePlugin.ts:146` and `/Users/zbeyens/git/plate-2/packages/core/src/internal/plugin/pipeInjectNodeProps.tsx:11`. Slate v2 renderVoid is content-only and runtime-owned at `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx:373`. | Raw Slate exposes content targets and selectors; Plate owns UI packaging, shadcn components, toolbars, inject props, and product-level composition. Do not add UI-kit ceremony to raw Slate. |
| slate-yjs needs deterministic initialization and remote operation replay. | keep, strengthen release target | Current Plate Yjs builds deterministic initial updates at `/Users/zbeyens/git/plate-2/packages/yjs/src/utils/slateToDeterministicYjsState.ts:13`, with bit-identical tests at `/Users/zbeyens/git/plate-2/packages/yjs/src/utils/slateToDeterministicYjsState.spec.ts:7`. Slate v2 replays remote operations through `applyOperations` and publishes one commit at `/Users/zbeyens/git/slate-v2/packages/slate/test/apply-onchange-hard-cut-contract.ts:38`. | Keep explicit `applyOperations` as the collaboration import path. Do not reintroduce `editor.apply` or `onChange` timing as collab authority. |
| slate-yjs needs commit metadata, history grouping, and local target semantics. | keep | Slate v2 commit metadata captures tags and selection before/after in `/Users/zbeyens/git/slate-v2/packages/slate/test/commit-metadata-contract.ts:12`, groups writes into one commit at `:48`, and publishes one commit truth for collab/history at `/Users/zbeyens/git/slate-v2/packages/slate/test/collab-history-runtime-contract.ts:29`. Runtime ids are explicitly absent from remote operations and rebase/null locally at `collab-history-runtime-contract.ts:152`. | Treat commit metadata and local target semantics as release-law for collaboration. Runtime ids never become collaboration identity. |
| Current Plate Yjs plugin owns providers, cursors, and init/destroy API. | keep above raw Slate | Current Yjs plugin creates `YjsPlugin` from `BaseYjsPlugin` at `/Users/zbeyens/git/plate-2/packages/yjs/src/react/YjsPlugin.tsx:7`; the demo uses provider config and remote cursor overlay at `/Users/zbeyens/git/plate-2/apps/www/src/registry/examples/collaboration-demo.tsx:40`, initializes through `editor.getApi(YjsPlugin).yjs.init` at `:81`, and toggles providers at `:170`. | Provider management, cursor overlays, room UI, and network lifecycle stay in Plate/slate-yjs. Raw Slate only needs deterministic commit/replay/subscription primitives. |
| Cutting primitive `BaseEditor` writers may hurt plugin override use cases. | revise implementation phase, not public API | Plate current `ExtendEditorApi` and `ExtendEditorTransforms` types allow plugin method extension at `/Users/zbeyens/git/plate-2/packages/core/src/lib/plugin/SlatePlugin.ts:87` and `:103`. Slate v2 extension namespaces support tx groups that read transaction-local state at `/Users/zbeyens/git/slate-v2/packages/slate/test/extension-namespaces-contract.ts:71`. | Implementation phase needs an internal transform-registry answer for core algorithms and plugin ordering. It should not expose primitive writers as normal public `BaseEditor` methods. |

Plan delta from Pass 5:

- Confirmed accepted hard cuts preserve Plate migration backbone.
- Confirmed current Plate `editor.api` / `editor.tf` should be treated as a
  product-layer shape to migrate, not a raw Slate compatibility target.
- Confirmed schema/spec policy is the right raw substrate for Plate node
  behavior.
- Confirmed runtime-owned void shells fit Plate because Plate can render visible
  content and compose UI above raw Slate.
- Confirmed slate-yjs needs deterministic operation/commit/replay primitives,
  not `onChange` timing or raw React callbacks.
- Added implementation risk: core/plugin override algorithms need an internal
  transform-registry home if primitive writers leave public `BaseEditor`.

Next owner:

- Pass 6 revision pass. Fold accepted maintainer and ecosystem answers into the
  implementation phases, acceptance criteria, and first browser parity slice.

## 2.5 Pass 6 Revision Pass

Status: complete for Pass 6 only. Completion remains `pending`.

Verdict: the review is finally executable. The remaining work is not another
architecture pivot; it is a closure check that the executable plan really
contains every owner, acceptance criterion, and release guard it claims.

Score: `0.925`.

| Revision target | Decision | Plan response |
| --- | --- | --- |
| Public API/docs drift | Make it the first execution owner | Slate React docs and guards must teach `onChange` / `onCommit`, `state` / `tx`, current selector hooks, and content-only void renderers. Stale callback/hook/markable-void docs are not compatibility; they are release blockers. |
| Core write surface | Hard cut normal public primitive writers | Normal writes are `editor.update((tx) => ...)`. Primitive writer algorithms move behind internal/unsafe owner code, with an internal transform registry for core/plugin override ordering. |
| React shell/render DX | Runtime owns browser shell structure | `SlateSpacer` leaves normal public exports. Normal void renderers receive content targets only. Selection/focus UI is opt-in by target selector, not eager props. |
| Runtime facade boundary | Keep facades, guard owner imports | React attaches stable refs/listeners and renders islands. Runtime modules own selection import/export, native-user guards, IME, Android, DOM repair, input, clipboard, drag, and trace policy. |
| Browser parity | First slice is explicit | Generate legacy-vs-v2 rows for inline void before/on/after navigation, image/block void before/on/after navigation plus spacer layout, search decoration focus retention, hovering-toolbar mouse selection, and table cell boundary arrows. Keep this in `test:stress` / release subset, not default CI. |
| Ecosystem backbone | Preserve substrate, not current adapters | Plate migrates product APIs onto raw `state` / `tx` namespaces and content targets. slate-yjs migrates onto deterministic operation replay, commit metadata, and local-only runtime targets. Raw Slate does not ship current Plate or Yjs adapters. |

Plan delta from Pass 6:

- Rewrote the implementation phases into owner slices with acceptance criteria.
- Named the first generated browser parity slice.
- Promoted the internal transform-registry requirement from risk to execution
  owner.
- Split public API/docs guards from core write-surface cuts.
- Clarified that the score threshold can be met while completion stays
  `pending` until the closure pass runs.

Next owner:

- Pass 7 closure score and final gates. Do not add a new architecture pass
  unless closure finds a contradiction or uncited claim.

## 2.6 Pass 7 Closure Score And Final Gates

Status: complete. Review lane can close.

Verdict: done for review. The plan meets the slate-review completion threshold:
score is above `0.92`, no dimension is below `0.85`, every score row cites
current evidence, maintainer and ecosystem objections have accepted answers,
and the first generated browser parity slice is named.

Closure audit:

- Score gate: pass, weighted total is `0.925`.
- Evidence gate: pass, every scorecard row cites research, source, tests, or
  plan pass evidence.
- Pass ledger gate: pass, Pass 1 through Pass 7 are complete.
- Public API gate: pass for planning, with execution owners for stale docs,
  normal `tx.*` writes, callback cuts, selector hooks, and spacer hiding.
- Objection gate: pass, all maintainer rows are accepted with plan responses.
- Ecosystem gate: pass, Plate/slate-yjs migration-backbone answers exist
  without requiring current adapters.
- Browser parity gate: pass for planning, with the first generated
  legacy-vs-v2 slice named and kept in stress/release lanes.
- Scope gate: pass, this lane did not edit `/Users/zbeyens/git/slate-v2`
  implementation code.

Plan delta from Pass 7:

- Closed the review lane.
- Kept the score at `0.925`; closure confirmed the gates instead of inflating
  the score.
- Reclassified remaining work as execution owners, not open review blockers.

Next owner:

- A later `complete-plan` run can execute the accepted implementation owners.

## 3. Source-Backed Architecture North Star

Keep the Slate data model and operation stream. Do not drift into Lexical node
classes, ProseMirror integer positions, or Tiptap product-first command
ceremony.

Steal the best parts only:

- Lexical: `read` / `update` lifecycle, update tags, dirty-node discipline.
- ProseMirror: transaction authority, DOM selection import/export ownership,
  mapped selection/bookmark thinking.
- Tiptap: extension packaging, discoverable command groups, selector-aware
  React UI guidance.
- React 19.2: `useSyncExternalStore`, transition/deferred/background UI tools,
  and Performance Tracks for evidence.

The editor runtime owns browser correctness. React renders stable islands and
visible UI. Public app code should not own hidden anchors, void spacers,
selection import/export, DOM repair, or hot-path broad subscriptions.

## 4. Public API Target

Normal public lifecycle:

```ts
editor.read((state) => {
  state.selection.get()
})

editor.update((tx) => {
  tx.nodes.set(props, { at: target })
})
```

Target public callback surface:

```tsx
<Slate
  editor={editor}
  initialValue={initialValue}
  onChange={(value) => save(value)}
  onCommit={(commit, snapshot) => observe(commit, snapshot)}
/>
```

Current accepted cuts to execute after review closure:

- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/slate.md:14` still
  documents `onSelectionChange`, `onSnapshotChange`, and `onValueChange`.
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/06-saving-to-a-database.md:32`
  still teaches `onValueChange`.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:258`
  still presents primitive writes as overrideable core transforms on
  `BaseEditor`.

Pass 4 accepts that primitive editor write methods are not normal public DX.
They should leave public `BaseEditor` or move behind explicitly internal/unsafe
bridges with release guards that keep normal docs on `tx.*`.

## 5. Internal Runtime Target

The rewrite should keep React as a projection layer:

- root component attaches refs/listeners and renders islands
- root runtime owns root policy composition
- event runtime returns stable handler bindings
- source selectors own root facts
- node/text/decorations subscribe by runtime id or source id
- selection import/export, IME, DOM repair, Android, and proof traces are
  runtime modules

Current state is better than the earlier review findings:

- `EditableDOMRoot` calls one root runtime facade at
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx:143`.
- Event handler bindings come from `eventRuntime.handlers` at
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx:162`.
- `kernel-authority-audit-contract.ts` now inventories the old direct event
  and root policy imports as zero in the component at
  `/Users/zbeyens/git/slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts:300`.

Open pressure issue: `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:77`
is still a very large root policy hook, and
`/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts:100`
takes a broad parameter set. This may be acceptable as runtime ownership, but
Pass 4 accepts the facade direction with a boundary condition: root/event
runtime facades can orchestrate and return stable bindings, but policy bodies
must stay in smaller owner modules.

## 6. Hook, Component, And Render DX Target

Normal elements should stay close to Slate:

```tsx
const renderElement = ({ attributes, children, element }) => {
  return <p {...attributes}>{children}</p>
}
```

Voids/atoms should not expose shell mechanics:

```tsx
const renderVoid = ({ element, target }) => {
  return <ImageCard src={element.url} target={target} />
}
```

Node-scoped state is opt-in:

```tsx
const selected = useElementSelected(target)
const focused = useEditorFocused()
```

Current good evidence:

- `renderVoid` gets content-only props in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:190`.
- Surface tests assert no `actions`, `selected`, `focused`, `children`, or
  `attributes` in renderVoid props at
  `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx:409`.

Current review issues:

- `SlateSpacer` is still public at
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/index.ts:42`. If app
  authors should never own spacer layout, this is cut from the normal public
  surface. Any remaining spacer helper is internal, testing-only, or explicitly
  unsafe.
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/09-performance.md:45` still
  teaches `useSlate`, `useSlateSelection`, `useSlateSelector`, `useSelected`,
  `useFocused`, and `useSlateStatic`, which no longer matches the target public
  hook story.
- `React.createElement` remains in five `slate-react/src` component files. That
  is not a runtime blocker, but it is weak DX/readability for a rewrite trying
  to feel clean.

## 7. Plate Migration-Backbone Target

Raw Slate does not need current-version Plate adapter support.

Pass 5 confirms it does need this architecture backbone Plate can migrate to:

- stable Slate value and operation model
- `state` and `tx` extension namespaces
- schema/spec predicates
- local-only render targets
- deterministic commit metadata
- no editor-object method collision model
- an internal transform/algorithm extension point for core/plugin ordering,
  without putting primitive writers on normal public `BaseEditor`

Current Plate `editor.api` / `editor.tf` is a migration pressure signal, not a
raw-Slate compatibility requirement. Plate can become the product layer that
maps its API/transform authoring onto raw `state` / `tx` namespaces.

## 8. slate-yjs Migration-Backbone Target

Raw Slate does not need current slate-yjs adapter fixtures.

Pass 5 confirms it does need:

- deterministic operations
- explicit remote replay through `applyOperations`
- commit tags and metadata
- local runtime ids that never become collaboration identity
- target refs that null or rebase under remote changes
- subscription and commit-listener truth independent of React callbacks

Current evidence:

- `applyOperations` is the explicit replay writer in
  `/Users/zbeyens/git/slate-v2/packages/slate/test/write-boundary-contract.ts:57`.
- Remote import/rebase behaviors are covered in
  `/Users/zbeyens/git/slate-v2/packages/slate/test/collab-history-runtime-contract.ts`.
- Browser stale-target rebase is a stress family at
  `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:106`.
- Current Plate Yjs deterministic initialization is evidenced in
  `/Users/zbeyens/git/plate-2/packages/yjs/src/utils/slateToDeterministicYjsState.ts:13`.

## 9. Legacy Regression Proof Matrix

Current proof is meaningful but incomplete.

| Class | Current proof | Gap |
| --- | --- | --- |
| Core query/transform parity | legacy fixture contracts under `/Users/zbeyens/git/slate-v2/packages/slate/test` | strong for model behavior |
| Inline void navigation | stress family `inline-void-boundary-navigation` | needs current-vs-legacy browser parity harness |
| Block void navigation/layout | stress family `block-void-navigation` | needs legacy browser comparison, not just v2 assertion |
| Search focus/decorations | stress family `external-decoration-refresh` | no legacy route replay |
| Hovering toolbar mouse selection | stress family `mouse-selection-toolbar` | no legacy route replay |
| Tables | stress family `table-cell-boundary-navigation` | no legacy route replay |
| IME/mobile | stress family and raw-device guard policy | raw-device proof remains a separate machine/device lane |

Accepted legacy browser parity spine: not slow default CI, but generated
`test:stress` behavior rows with replay artifacts and a small release-gate
subset.

## 10. Browser Stress / Parity Strategy

Keep default CI fast. Do not dump the whole browser gauntlet into every commit.

Required shape:

- fast unit/release-discipline guards in normal iteration
- focused Playwright rows for touched example families
- generated `test:stress` for human-like editing operation families
- replay artifacts for every stress failure
- sparse release-gate subset in `bun check:full`
- full local stress only before release or when human bug clusters demand it

Current stress spine is good:

- operation family registry starts at
  `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:45`
- cases are generated at
  `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:930`
- replayability is asserted at
  `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts:997`

Missing: generated legacy-browser parity rows against `/Users/zbeyens/git/slate`
example behavior for the bug classes the user already found manually.

## 11. Hard Cuts And Rejected Alternatives

Hard cuts already supported by evidence:

- No public `onSnapshotChange`, `onValueChange`, or `onSelectionChange` as
  normal React callbacks.
- No public `onKeyCommand`; keep Slate-style `onKeyDown(event, ctx)`.
- No eager `selected` / `focused` / `actions` props in void renderers.
- No public `VoidElement` / `InlineVoidElement` authoring helpers.
- No flat extension `methods` that mutate the editor object.
- No `Transforms.*` as exported normal authoring API.
- No stale hook docs that teach broad React subscriptions as normal authoring.
- No markable-void docs that make app renderers place hidden children.
- No normal public `SlateSpacer`; spacer ownership belongs to the runtime shell.

Pass 7 closure result:

- Closure passed at `0.925`.
- Remaining `React.createElement` component callsites are assigned to the React
  shell/render DX implementation owner: convert to JSX unless a current
  TypeScript limitation is documented in that slice.

Rejected alternatives:

- Keeping every legacy-looking API because migration feels familiar. That keeps
  the same footguns with a new runtime underneath.
- Putting all stress tests in default CI. That will slow iteration and people
  will route around it.
- Making raw Slate a Plate replacement. Product commands and UI kits belong
  above the raw core.

## 12. Slate Maintainer Objection Ledger

Pass 4 accepted ledger.

| Change | Who feels pain | Likely objection | Evidence | Current verdict |
| --- | --- | --- | --- | --- |
| Make `tx.*` the only normal write DX | raw Slate users, plugin authors | "Why do I need another object when `editor.insertText` is familiar?" | `state-tx-public-api-contract.ts`; primitive methods in `BaseEditor`; write-boundary bridge test | accepted: normal public writes are `tx.*`; primitive writers leave normal public `BaseEditor` |
| Cut old React callbacks from docs/API | app authors | "`onValueChange` was clearer than `onChange`." | code exposes `onChange` / `onCommit`; docs still stale | accepted: `onChange` plus `onCommit` only |
| Cut stale hooks and markable-void authoring docs | app/plugin authors | "Legacy hooks and children placement are familiar." | current hook exports; `renderVoid({ element, target })`; surface contract rejects shell props | accepted: selector-by-target docs and runtime-owned hidden anchor |
| Cut or hide `SlateSpacer` | void/plugin authors | "I need control for weird browser cases." | runtime-owned void shell contract; public export and primitive test remain | accepted: cut from normal exports; internal/testing/unsafe only |
| Keep root/event runtime facades | runtime maintainers | "This just moved complexity from `Editable` into giant hooks." | `runtime-root-engine.ts` and `runtime-event-engine.ts` line evidence | accepted with revision: facade orchestrates, owner modules hold policy |
| Add generated legacy browser parity | test authors | "This will be slow and flaky." | user-found regressions; stress replay harness exists | accepted: behavior parity in stress/release subset |

## 13. Pass Schedule And Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| 1. Current-state read and initial score | complete | Read active completion file, previous plan, compiled research, live Slate v2 public/core/react/stress/docs surfaces | Created this plan, set score to `0.877`, seeded P1/P2 issues | no closure; several public drift issues | Pass 2 |
| 2. Research and live-source refresh | complete | Checked recent research log entries, accepted state/tx and node-DX decisions, React 19.2 source page, read/update corpus ledger, raw-family metadata, live docs, public guards, release proof, stress scripts, and slate-browser replay primitives | Cleaned stale node-DX command example, appended research log, updated score to `0.879`, widened stale-doc findings | public docs/hooks/element docs still stale; primitive write and `SlateSpacer` decisions still open | Pass 3 |
| 3. Pressure passes | complete | Read live stale React docs, current hook exports, `renderVoid` implementation and tests, public `SlateSpacer` export/tests, `BaseEditor` primitive writes, write-boundary bridge test, runtime root/event facades, stress/release proof, and legacy fixture utilities | Updated score to `0.888`; classified stale docs/hooks/markable-void docs and normal public `SlateSpacer` as cuts; kept root/event direction with split-pressure; strengthened generated legacy browser parity requirement | maintainer objections not accepted yet; primitive write public status still needs ledger answer | Pass 4 |
| 4. Slate maintainer objection ledger | complete | Read `<Slate>` callback implementation, state/tx contract, extension namespace and legacy-method rejection contracts, void shell/surface contracts, root/event runtime facades, stress/release proof, and legacy fixture utilities | Updated score to `0.904`; accepted hard cuts for normal write DX, callbacks, hooks, markable-void DOM ownership, public `SlateSpacer`, root/event facade boundaries, and generated legacy browser parity | ecosystem pass not complete; revision pass must fold accepted answers into implementation plan | Pass 5 |
| 5. Ecosystem maintainer pass | complete | Read Plate plugin API/transform/composition type contracts, Plate plugin render/inject surfaces, current Plate Yjs deterministic init and provider lifecycle, Slate v2 state/tx/schema/commit/collab contracts | Updated score to `0.916`; confirmed hard cuts preserve migration backbone; rejected current Plate/Yjs adapter compatibility as raw Slate requirement; added internal transform-registry risk | revision pass must fold accepted answers into implementation plan and first parity slice | Pass 6 |
| 6. Revision pass | complete | Used accepted Pass 4 and Pass 5 evidence to revise owners, acceptance criteria, release guards, internal transform-registry requirement, and first browser parity slice | Updated score to `0.925`; made the execution plan concrete enough for closure review | closure pass must verify no uncited claim or hidden maybe remains | Pass 7 |
| 7. Closure score and final gates | complete | Read completion checkpoint, research index/log, scorecard, hard cuts, objection ledger, implementation owners, fast gates, and final gates | Kept score at `0.925`; closed review lane; reclassified remaining work as execution owners | none for review | later `complete-plan` execution |

Single-pass closure was avoided: Pass 7 closed only after Pass 1 through Pass 6
were already complete.

## 14. Plan Deltas From Review

Added:

- New whole-rewrite review plan instead of mutating the old closed plan.
- Scorecard based on current live source, not older chat memory.
- P1 public-doc/API drift around cut React callbacks.
- P1/P2 question around primitive editor write methods versus `tx.*`.
- P2 question around public `SlateSpacer`.
- P2 question around root/event runtime facade size.
- Explicit legacy browser parity gap.
- Pass 2 stale hook docs and markable-void docs findings.
- Pass 2 research cleanup for the node-DX command example.
- Pass 3 pressure verdicts for stale callbacks, stale hooks, markable-void docs,
  public `SlateSpacer`, primitive writer status, runtime facade size, and
  generated legacy browser parity.
- Pass 3 score update to `0.888`.
- Pass 4 accepted maintainer-ledger answers and score update to `0.904`.
- Pass 4 made primitive writers a normal-public-surface cut instead of a maybe.
- Pass 4 scoped legacy browser parity to behavior contracts in stress/release
  lanes.
- Pass 5 ecosystem maintainer answers and score update to `0.916`.
- Pass 5 confirmed Plate/slate-yjs migration backbone without current adapters.
- Pass 5 added internal transform-registry risk for core/plugin override
  algorithms.
- Pass 6 revision pass and score update to `0.925`.
- Pass 6 turned accepted answers into execution owners, acceptance criteria,
  release guards, and a concrete first browser parity slice.
- Pass 6 promoted the internal transform registry to a required owner before
  primitive writers leave normal public `BaseEditor`.
- Pass 7 closure confirmed the final gates and kept the score at `0.925`.
- Pass 7 moved remaining work into execution-owner status instead of review
  blockers.

Dropped:

- Current-version Plate/slate-yjs adapter support as a requirement. The target
  is migration backbone only.
- Treating the prior closed plan score as proof for this whole-rewrite review.

Unchanged:

- Keep Slate model and operations.
- Keep `state` / `tx`.
- Keep runtime-owned void shells.
- Keep generated browser stress out of default CI.

## 15. Open Questions And What Would Change The Decision

Open:

- None for this review lane.
- Execution detail: remaining `React.createElement` component callsites should
  convert to JSX unless a current TypeScript limitation is recorded in the
  implementation slice.

Would change the decision:

- If local raw/source refresh shows Lexical/ProseMirror/Tiptap evidence points
  away from `state` / `tx`, reopen the API target.
- If primitive editor writes are required for a real Slate-close DX case that
  `tx` cannot express cleanly, the exception must be explicitly unsafe/internal
  and release-guarded, not normal public `BaseEditor`.
- If browser parity rows are too slow even as `test:stress`, define a smaller
  deterministic release subset and keep full stress sparing.

## 16. Implementation Phases With Owners

This review lane does not implement code. These are candidate execution owners
after review closure.

1. Public API/docs guard owner
   - Scope: Slate React docs, performance docs, walkthroughs, public examples,
     and release-discipline grep guards.
   - Acceptance: docs teach `onChange` for value persistence and `onCommit` for
     advanced commit observation; no normal docs mention `onValueChange`,
     `onSelectionChange`, `onSnapshotChange`, `onKeyCommand`,
     `useSlateStatic`, eager `useSelected` / `useFocused`, or markable-void
     hidden children.
   - Gate: release guard fails on stale callback/hook/void-authoring phrases.

2. Core write-surface and transform-registry owner
   - Scope: `BaseEditor`, transaction API, internal transform registration,
     plugin/core override ordering, and public-surface contracts.
   - Acceptance: normal writes are only `editor.update((tx) => ...)`;
     primitive writers leave normal public `BaseEditor`; internal algorithms
     that need override/order behavior register through an internal transform
     registry instead of public editor mutation.
   - Gate: public-surface tests reject primitive normal writers while runtime
     and extension namespace contracts still prove schema, normalization,
     plugin order, and collab replay work.

3. React shell/render DX owner
   - Scope: void shell exports, `renderVoid`, selector hooks, spacer ownership,
     and JSX cleanup.
   - Acceptance: normal void renderers receive `{ element, target }`; no
     `children`, `attributes`, eager `selected`, eager `focused`, or `actions`;
     `SlateSpacer` is internal/testing/unsafe only; target-scoped hooks own
     opt-in selection/focus UI.
   - Gate: `surface-contract.tsx` proves content-only renderers and public
     exports stay clean; remaining `React.createElement` callsites are converted
     to JSX or justified by a recorded TypeScript limitation.

4. Runtime facade owner-boundary owner
   - Scope: `EditableDOMRoot`, `runtime-root-engine`, `runtime-event-engine`,
     selection import/export, IME, Android, DOM repair, input, clipboard, drag,
     mouse, keyboard, trace, and source wakeups.
   - Acceptance: React components attach stable refs/listeners and render
     islands; policy bodies live in runtime modules with direct tests; facades
     orchestrate but do not become untestable catch-all engines.
   - Gate: kernel authority/audit contracts prove React does not own browser
     policy; owner-boundary checks reject policy imports in component files.

5. Generated browser parity owner
   - Scope: `slate-browser`, stress family registry, legacy route fixtures,
     replay artifacts, and release subset.
   - Acceptance: first generated legacy-vs-v2 slice covers inline void
     before/on/after navigation, image/block void before/on/after navigation,
     image spacer/layout, search decoration focus retention, hovering-toolbar
     mouse selection, and table cell boundary arrows.
   - Gate: default CI stays fast; `test:stress` and `check:full` carry the
     generated parity rows; every failure emits replay artifacts and enough
     metadata to shrink the scenario.

6. Ecosystem backbone owner
   - Scope: raw Slate extension namespaces, schema/spec reads, commit metadata,
     deterministic operation replay, and local-only runtime target semantics.
   - Acceptance: Plate has a migration route by mapping product commands and UI
     composition onto raw `state` / `tx` namespaces, schema/spec policy, and
     content targets; slate-yjs has a migration route through deterministic
     operations, commit metadata, and target rebase/null semantics.
   - Gate: raw Slate tests prove the substrate. No current-version Plate or
     slate-yjs adapter is required for closure.

## 17. Fast Driver Gates

For later implementation slices, use focused gates first:

- `bun test:release-discipline`
- `bun test ./packages/slate/test/public-surface-contract.ts --bail 1`
- `bun test ./packages/slate/test/state-tx-public-api-contract.ts --bail 1`
- `bun test ./packages/slate/test/generic-extension-namespace-contract.ts --bail 1`
- `bun test ./packages/slate/test/collab-history-runtime-contract.ts --bail 1`
- `bun test ./packages/slate-react/test/surface-contract.tsx --bail 1`
- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts --bail 1`
- focused Playwright rows for the touched example family
- generated `test:stress` rows for the first legacy-vs-v2 browser parity slice
- `bun check:full` only when making release-quality browser claims

Do not run full browser integration by default during review. This plan is not
implementing code.

## 18. Final Completion Gates

This review can move from `pending` to `done` only when:

- total score is `>= 0.92`
- no dimension is below `0.85`
- every dimension has current evidence
- all pass-state rows are complete
- objection ledger rows have verdicts and plan responses
- ecosystem answers exist where extension/plugin/collab/data-model surfaces are
  changed
- docs/API drift is assigned to a concrete implementation owner with release
  guards
- public API surface has no "maybe" language
- legacy regression proof has a generated browser parity answer and named first
  slice
- `tmp/completion-check.md` points to this plan and says `done`

Current status: `done`.

## 19. Execution Ledger

### Slice 1: Public API/Docs Guard Owner

Status: complete.

Started by `complete-plan` on 2026-04-28.

Scope:

- Update Slate React docs, performance docs, walkthroughs, public examples, and
  release-discipline guards in `../slate-v2`.
- Cut stale normal docs for `onValueChange`, `onSelectionChange`,
  `onSnapshotChange`, `onKeyCommand`, `useSlateStatic`, broad eager
  `useSelected` / `useFocused`, and app-owned markable-void hidden children.

Driver gates:

- stale public API grep over `../slate-v2/docs`
- `bun test:release-discipline`

Files changed:

- `../slate-v2/docs/libraries/slate-react/slate.md`
- `../slate-v2/docs/libraries/slate-react/hooks.md`
- `../slate-v2/docs/walkthroughs/06-saving-to-a-database.md`
- `../slate-v2/docs/walkthroughs/09-performance.md`
- `../slate-v2/docs/api/nodes/element.md`
- `../slate-v2/docs/concepts/xx-migrating.md`
- `../slate-v2/packages/slate/test/public-surface-contract.ts`

Verification:

- stale public API grep over the normal docs set passed
- `bun test:release-discipline` passed
- `bun lint:fix` passed with no fixes
- `bun typecheck:packages` passed

Result:

- Normal docs now teach `onChange`, `onCommit`, current selector hooks, and
  content-only void renderers.
- `public-surface-contract.ts` now rejects stale React callback/hook docs and
  app-owned void shell docs.

Next owner:

- Slice 2: core write-surface and internal transform-registry owner.

### Slice 2: Core Write-Surface And Internal Transform-Registry Owner

Status: complete.

Started by `complete-plan` on 2026-04-28 and continued after the pending
completion-check hook.

Scope:

- Cut primitive writers from normal public `BaseEditor`.
- Keep normal write authoring on `editor.update((tx) => ...)`.
- Add an internal transform registry so transaction views and runtime code use
  registered transform implementations instead of public instance writer
  properties.
- Retype DOM, React, and history plugin editors as transform-capable runtime
  editors without putting primitive writers back on `BaseEditor`.

Driver gates:

- core public-surface and write-boundary contract pack
- `bun test:release-discipline`
- `bun lint:fix`
- `bun typecheck:packages`

Files changed:

- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/src/core/transform-registry.ts`
- `../slate-v2/packages/slate/src/core/index.ts`
- `../slate-v2/packages/slate/src/create-editor.ts`
- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate/test/public-field-hard-cut-contract.ts`
- `../slate-v2/packages/slate/test/write-boundary-contract.ts`
- `../slate-v2/packages/slate/test/state-tx-public-api-contract.ts`
- `../slate-v2/packages/slate/test/generic-extension-namespace-contract.ts`
- `../slate-v2/packages/slate/test/escape-hatch-inventory-contract.ts`
- `../slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`
- `../slate-v2/packages/slate-dom/src/plugin/with-dom.ts`
- `../slate-v2/packages/slate-react/src/plugin/with-react.ts`
- `../slate-v2/packages/slate-history/src/history-editor.ts`

Verification:

- `bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/public-field-hard-cut-contract.ts ./packages/slate/test/write-boundary-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts ./packages/slate/test/generic-extension-namespace-contract.ts --bail 1`
  passed with 163 tests.
- `bun test:release-discipline` passed with 169 tests.
- `bun lint:fix` passed.
- `bun typecheck:packages` passed across all six packages.
- `bun run completion-check` failed as expected because status is `pending`
  and Slice 3 is runnable.

Rejected tactics:

- Do not restore primitive writer keys to `BaseEditor` to satisfy plugin
  package type errors.
- Do not keep direct transaction-view calls to instance writer properties when
  the transform registry owns that routing.

Result:

- `BaseEditor` is the normal public read/update surface.
- `EditorTransformApi` is the runtime transform layer.
- `editor.update((tx) => ...)` routes through the internal transform registry,
  including when an instance writer property is overridden.

Next owner:

- Slice 3: React shell/render DX owner.

### Slice 3: React Shell/Render DX Owner

Status: complete.

Started after Slice 2 verification on 2026-04-28.

Scope:

- Keep normal `renderVoid` content-only with `{ element, target }`.
- Keep void spacers and hidden anchors runtime-owned.
- Remove `SlateSpacer` from the public package index while preserving internal
  test access.
- Convert remaining `React.createElement` component/rendering callsites in
  `slate-react` to JSX.
- Make the surface contract runnable from both the repo root and package cwd.

Driver gates:

- `bun test ./packages/slate-react/test/surface-contract.tsx --bail 1`
- `bun test ./packages/slate-react/test/rendered-dom-shape-contract.tsx --bail 1`
- primitive/render-profiler tests for internal spacer access
- stale public export/helper grep
- `bun test:release-discipline`
- `bun lint:fix`
- `bun typecheck:packages`

Files changed:

- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
- `../slate-v2/packages/slate-react/src/index.ts`
- `../slate-v2/packages/slate-react/test/primitives-contract.tsx`
- `../slate-v2/packages/slate-react/test/render-profiler-contract.test.tsx`
- `../slate-v2/packages/slate-react/src/components/slate-leaf.tsx`
- `../slate-v2/packages/slate-react/src/components/slate-text.tsx`
- `../slate-v2/packages/slate-react/src/components/text-string.tsx`
- `../slate-v2/packages/slate-react/src/components/zero-width-string.tsx`
- `../slate-v2/packages/slate-react/src/components/slate-element.tsx`
- `../slate-v2/packages/slate-react/src/components/slate-placeholder.tsx`
- `../slate-v2/packages/slate-react/src/components/editable-element.tsx`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/components/slate.tsx`
- `../slate-v2/packages/slate-react/src/components/restore-dom/restore-dom.tsx`

Verification:

- `bun test ./packages/slate-react/test/surface-contract.tsx ./packages/slate-react/test/rendered-dom-shape-contract.tsx ./packages/slate-react/test/primitives-contract.tsx ./packages/slate-react/test/render-profiler-contract.test.tsx --bail 1`
  passed with 21 tests.
- `bun test:release-discipline` passed with 169 tests.
- `bun typecheck:packages` passed across all six packages.
- `bun lint:fix` passed with no fixes after the final verification pass.
- stale `React.createElement` / public `SlateSpacer` / legacy void helper grep
  over the touched React package/example roots returned no matches.
- `bun run completion-check` failed as expected because status is `pending`
  and Slice 4 is runnable.

Rejected tactics:

- Do not keep `SlateSpacer` in the normal package index just because tests need
  it; tests can import the internal component path.
- Do not reintroduce eager `selected` / `focused` props to void renderers.

Result:

- Normal void renderers stay content-only.
- Spacer ownership is no longer a public export.
- Component/rendering files use JSX rather than `React.createElement`.

Next owner:

- Slice 4: runtime facade owner-boundary owner.

### Slice 4: Runtime Facade Owner-Boundary Owner

Status: complete.

Started after Slice 3 verification on 2026-04-28.

Scope:

- Keep `EditableDOMRoot` as React wiring, not event/runtime policy.
- Move event handler binding assembly behind `useEditableRootRuntime`.
- Move deferred selector flushing behind the root runtime facade.
- Add authority guards against `EditableDOMRoot` unpacking event runtime
  handler families or calling root selector wakeups directly.

Driver gates:

- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts --bail 1`
- `bun test ./packages/slate-react/test/provider-hooks-contract.tsx --bail 1`
- direct root-policy grep over `components/editable.tsx`
- `bun test:release-discipline`
- `bun lint:fix`
- `bun typecheck:packages`

Files changed:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Verification:

- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts ./packages/slate-react/test/provider-hooks-contract.tsx ./packages/slate-react/test/surface-contract.tsx ./packages/slate-react/test/rendered-dom-shape-contract.tsx --bail 1`
  passed with 30 tests.
- `bun test:release-discipline` passed with 169 tests.
- `bun typecheck:packages` passed across all six packages.
- `bun lint:fix` passed with no fixes after the final verification pass.
- direct root-policy grep over `components/editable.tsx` returned no matches
  for event-runtime handler unpacking, runtime policy hooks, or deferred
  selector flushing.
- `bun run completion-check` failed as expected because status is `pending`
  and Slice 5 is runnable.

Rejected tactics:

- Do not let `EditableDOMRoot` destructure `eventRuntime.handlers`; the root
  runtime facade returns stable event bindings.
- Do not leave selector wakeup flushing in the component just because it is a
  hook call; it is root runtime ownership.

Result:

- `EditableDOMRoot` consumes one root runtime facade and spreads stable event
  bindings.
- Root selector flushing and event binding assembly now live behind
  `useEditableRootRuntime`.

Next owner:

- Slice 5: generated browser parity owner.

### Slice 5: Generated Browser Parity Owner

Status: complete.

Started after Slice 4 verification on 2026-04-28.

Scope:

- Move first-party generated browser contract metadata into fast
  `slate-browser/core` guards.
- Keep Playwright stress as the executor, not the only owner of the registry.
- Lock the first legacy-vs-v2 parity slice: inline void boundary navigation,
  block void/image layout navigation, search highlight focus retention,
  hovering-toolbar mouse selection, and table cell boundary arrows.
- Prove generated stress remains outside default `bun check`.

Driver gates:

- `bun --filter slate-browser test:core`
- `bun --filter slate-browser test:proof`
- root and package typecheck
- focused generated Playwright stress slice with retries disabled

Files changed:

- `../slate-v2/packages/slate-browser/src/core/plugin-contracts.ts`
- `../slate-v2/packages/slate-browser/src/core/first-party-browser-contracts.ts`
- `../slate-v2/packages/slate-browser/src/core/index.ts`
- `../slate-v2/packages/slate-browser/src/playwright/index.ts`
- `../slate-v2/packages/slate-browser/test/core/scenario.test.ts`
- `../slate-v2/playwright/stress/generated-editing.test.ts`

Verification:

- TDD red: `bun --filter slate-browser test:core` failed while the new fast
  parity guard imported missing core exports.
- `bun --filter slate-browser test:core` passed with 33 tests after the core
  registry landed.
- `bun lint:fix` passed and fixed formatting in 5 files.
- `bun --filter slate-browser build` passed.
- `bun typecheck:packages` passed across all six packages.
- `bun typecheck:root` passed.
- `bun --filter slate-browser test:proof` passed with 23 tests.
- `STRESS_FAMILIES=inline-void-boundary-navigation,block-void-navigation,external-decoration-refresh,mouse-selection-toolbar,table-cell-boundary-navigation PLAYWRIGHT_RETRIES=0 bun run playwright playwright/stress/generated-editing.test.ts --project=chromium`
  passed with 6 tests.

Rejected tactics:

- Do not leave first-party stress metadata owned only by a Playwright test file;
  fast package tests need to guard the registry and first parity family list.
- Do not add generated stress to default `bun check`; the fast guard proves the
  slow lane stays in `test:stress` / release proof.

Result:

- `slate-browser/core` owns the first-party browser contract registry and first
  legacy parity slice.
- Playwright stress imports that registry and emits replay artifacts for the
  same operation families.
- The focused retry-disabled browser slice proves the user-reported regression
  classes in Chromium without slowing default CI.

Next owner:

- Slice 6: ecosystem backbone owner.

### Slice 6: Ecosystem Backbone Owner

Status: complete.

Started after Slice 5 verification on 2026-04-28.

Scope:

- Prove raw Slate gives Plate and slate-yjs a migration backbone without
  shipping current-version adapters.
- Cover extension namespaces, schema/spec reads, commit metadata,
  deterministic operation replay, and local-only runtime target semantics.
- Keep adapter-shaped product namespaces such as `api`, `tf`, `plate`, and
  `yjs` off the raw editor object.
- Add the backbone proof to release discipline.

Driver gates:

- `bun test:release-discipline`
- `bun lint:fix`
- package and root typecheck
- final `bun check`

Files changed:

- `../slate-v2/packages/slate/test/migration-backbone-contract.ts`
- `../slate-v2/package.json`

Verification:

- `bun test:release-discipline` passed with 171 tests.
- `bun lint:fix` passed and fixed formatting in 1 file.
- `bun typecheck:packages` passed across all six packages.
- `bun typecheck:root` passed.
- `bun check` passed: lint, package/site/root typecheck, Bun tests
  (1050 pass, 95 skip), and Slate React Vitest (109 pass).

Rejected tactics:

- Do not add current Plate or slate-yjs adapters to raw Slate closure.
- Do not preserve product-layer `editor.api` / `editor.tf` as raw Slate public
  law; extension namespaces and `state` / `tx` are the backbone.

Result:

- Release discipline now includes a migration-backbone contract.
- Raw Slate proves extension namespace composition, schema/spec policy,
  deterministic commit/replay, and local-only runtime target rebasing.
- All six implementation owners from the whole-rewrite review plan are
  complete and verified.

Next owner:

- None. Completion target met.
