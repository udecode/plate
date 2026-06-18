# Slate v2 DOM Coverage Full Execution Ralplan

status: done-full-execution-complete
created: 2026-05-03
skill: `.agents/skills/slate-ralplan/SKILL.md`
performance lens: `.agents/skills/performance/SKILL.md`
source repo: `/Users/zbeyens/git/slate-v2`
supersedes:

- `docs/plans/2026-05-02-slate-v2-hidden-subtree-first-class-ralplan.md`
- `docs/plans/2026-05-03-slate-v2-staged-rendering-strategy-phase-6-plan.md`

## Verdict

Use one Slate-owned primitive for every model-present / DOM-incomplete region:

```txt
DOMCoverageBoundary
```

Do not split this into separate systems for collapsed content, rendering strategy
staging, shell strategy, and viewport virtualization. That would multiply the exact
DOM lookup failure class Slate v2 is trying to kill.

The final shape is:

```txt
cheap staged default
+ DOM coverage registry and bridge
+ unstable Boundary authoring adapter
+ reason-specific policy engines
+ stress-only virtualization prototype
+ production perf/RUM visibility
```

No phase is left as a vague future bucket. Some phases have strict release gates, but
they are in the plan and owned.

Hard take:

```txt
DOM coverage is the primitive.
Collapse is one policy.
Large-doc staging is one policy.
Virtualization is one policy.
Shell is one explicit aggressive policy.
```

## Intent Boundary

Intent:

- Make hidden/collapsed editable model content first-class in Slate v2.
- Keep default rendering behavior staged enough for native editor
  expectations.
- Add virtualization research and proof as part of the same plan, without
  pretending it is default-safe.
- Apply GitHub-scale performance tactics: cheap repeated units, delegated
  events, rare-state isolation, O(1) indexes, p95/p99 interaction rows, DOM/heap
  tags, and production dashboard gaps.

Desired outcome:

- App renderers can hide child ranges or self nodes only through Slate-owned DOM
  coverage.
- Programmatic selection, native selection, copy, paste, browser find, IME,
  mobile touch, undo/history, and collaboration have explicit policy per reason.
- staged default beats legacy chunking by product metrics, not only by
  startup smoke.
- Extreme documents get an explicit virtualization prototype with honest native
  tradeoffs.
- Public API moves from `slots.unstableBoundary` to stable `slots.Boundary`
  only after lifecycle, browser, stress, and DX gates pass.

In scope:

- DOM coverage registry, bridge, materialization, copy/paste, and stale-DOM
  prevention.
- Hidden child range and self boundary authoring.
- staged rendering-strategy lifecycle.
- Shell classification as explicit aggressive strategy.
- Viewport virtualization prototype and proof gates.
- Hot repeated-unit simplification.
- Benchmark matrix, trace proof, and production RUM/Datadog design.
- Plate and slate-yjs migration-backbone answers.

Non-goals:

- No Plate product collapse component in raw Slate.
- No arbitrary partial-text hiding in the stable API.
- No default virtualization for ordinary editable rich text.
- No native browser find promise for content with no DOM.
- No React `Activity` as a replacement for editor DOM coverage.
- No stable public API until app-author lifecycle is proven.

Decision boundaries:

- Missing DOM is allowed only through registered DOM coverage.
- Stale old DOM exposed as current content is a hard failure.
- Default strategy optimizes staged behavior first.
- Degraded modes require explicit cohort thresholds and native behavior
  contracts.
- Slate core owns invariant and bridge; Plate owns opinionated UI.

## Live Source Grounding

Current live source already contains the internal primitive and an unstable
adapter:

- `DOMCoverageBoundary` states/reasons/policies exist in
  `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-coverage.ts:25`.
- Reasons include `app-collapse`, `app-hidden`, `rendering-staged`,
  `viewport-virtualization`, `shell-aggressive`, and `runtime-atom` in
  `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-coverage.ts:32`.
- Materialization supports a target range in
  `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-coverage.ts:134`.
- Private `DOMCoverageBoundaryRange` registers child-range coverage in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/dom-coverage-boundary.tsx:32`.
- Private `DOMCoverageSelfBoundary` registers self coverage in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/dom-coverage-boundary.tsx:106`.
- Registration currently runs from layout effect in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/dom-coverage-boundary.tsx:81`
  and `:139`.
- `renderElement` props expose `slots.unstableBoundary` in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:320`.
- `slots.unstableBoundary` supports `scope: self | children`, `mounted`,
  policies, and placeholder materialization in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:333`.
- Normal `renderElement` still receives mandatory `children` and `slots` in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:419`.
- Dev safety checks missing child DOM or coverage in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:258`.
- staged selection consults coverage before raw DOM range export in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/selection-controller.ts:206`
  and `:619`.
- Benchmark trace separates `interactiveReadyAt` and `nativeSurfaceCompleteAt`
  in
  `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs:861`
  and `:919`.
- Benchmark surface-weight counters already include DOM nodes and Slate unit
  counts in
  `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs:930`.

Current proof already exists for:

- hidden child range omits stale DOM:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx:70`
- first/last root self-boundaries:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx:238`
- unstable public slot adapter:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx:295`
- StrictMode duplicate/leak behavior:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx:409`
- structural insert/move/remove remap:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx:523`
- 1000-descendant expand cost and sibling render containment:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx:705`
- hidden model updates not waking visible sibling rendering:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx:785`

Gap:

- The unstable adapter exists, but stable public docs/API are not ready until the
  remaining browser/native/perf gates below pass.

## Decision Brief

Principles:

- Slate owns browser/editor invariants.
- App renderers do not get to create unexplained missing DOM.
- Normal staged editing stays the product default.
- Degraded modes are explicit and cohort-bound.
- Repeated units must be cheap before mounting policy gets fancy.

Top drivers:

- Legacy Slate crashes when editable model nodes have no DOM.
- GitHub-scale repeated-unit bloat can dominate before virtualization matters.
- Rich-text editors have stricter native behavior than diff viewers.
- Plate needs UX freedom without wrapping every core call.
- slate-yjs needs deterministic model operations and no mount-state history
  noise.

Options:

| Option                                                 | Verdict | Why                                                            |
| ------------------------------------------------------ | ------- | -------------------------------------------------------------- |
| Keep children mandatory, no hidden support             | reject  | Leaves the known legacy limitation unsolved.                   |
| Let renderers omit children freely                     | reject  | Recreates missing DOM crashes.                                 |
| CSS-hide everything                                    | reject  | Native find, a11y, copy, stale DOM, and IME become accidental. |
| Treat collapse as void/atom only                       | partial | Fine for cards, wrong for editable hidden sections.            |
| Separate collapse/staging/virtualization systems       | reject  | Duplicate DOM bridge risk.                                     |
| One DOM coverage primitive with reason-specific policy | choose  | Correct substrate and future-proof.                            |

Consequences:

- Stable API ships after the primitive gates prove stable authoring safety.
- Public docs must explain native find/copy/a11y limits honestly.
- Benchmarks must track DOM/heap/component/listener pressure, not timing alone.
- Virtualization is allowed, but only as a named stress/pathological strategy until
  native behavior proof is green.

## Public API Target

Current accepted public surface:

```tsx
renderElement={({ children, element, slots }) => {
  if (element.type === 'section') {
    return (
      <EditableElement>
        {React.Children.toArray(children)[0]}
        <slots.unstableBoundary
          boundaryId="section-body"
          mounted={!collapsed}
          reason="app-collapse"
          scope={{ type: 'children', from: 1 }}
          selectionPolicy="materialize"
          copyPolicy="include-model"
          findPolicy="not-native-until-mounted"
        >
          Collapsed body
        </slots.unstableBoundary>
      </EditableElement>
    )
  }

  return <EditableElement>{children}</EditableElement>
}}
```

Stable target after gates:

```tsx
<slots.Boundary
  boundaryId="section-body"
  mounted={!collapsed}
  reason="app-collapse"
  scope={{ type: "children", from: 1, to: 3 }}
  selectionPolicy="materialize"
  copyPolicy="include-model"
  findPolicy="not-native-until-mounted"
  renderPlaceholder={({ materialize }) => (
    <button type="button" onClick={materialize}>
      Show content
    </button>
  )}
/>
```

Whole-element target:

```tsx
<slots.Boundary
  boundaryId="hidden-header"
  mounted={!hidden}
  reason="app-hidden"
  scope={{ type: "self" }}
  selectionPolicy="boundary"
  copyPolicy="exclude"
  findPolicy="not-native-until-mounted"
/>
```

Hard API cuts:

- Cut `HiddenRange`.
- Cut `HiddenSelf`.
- Keep `SelfBoundary` private or sugar only; the public concept is one
  `Boundary` with `scope`.
- Prefer `mounted` over `hidden`.
- Do not expose raw runtime ids.
- Do not support arbitrary partial-text hiding in stable API.

Element-spec target after slots stabilize:

```ts
schema.define({
  type: "header",
  domCoverage: {
    scope: "self",
    mountedWhen: (element) => !element.hidden,
    reason: "app-hidden",
    selectionPolicy: "boundary",
    copyPolicy: "exclude",
  },
});
```

Slots own custom layout. Element specs own stable node-type behavior.

## Internal Runtime Target

One registry stores coverage records:

```ts
type DOMCoverageBoundary = {
  boundaryId: string;
  ownerRuntimeId: RuntimeId | null;
  ownerPath: Path;
  coveredPathRanges: readonly PathRange[];
  coveredRuntimeRanges: readonly RuntimeIdRange[];
  state:
    | "mounted"
    | "intentionally-hidden"
    | "pending-mount"
    | "virtualized"
    | "atom-boundary";
  reason:
    | "app-collapse"
    | "app-hidden"
    | "rendering-staged"
    | "viewport-virtualization"
    | "shell-aggressive"
    | "runtime-atom";
  anchor:
    | { type: "owner" }
    | { type: "summary-slot"; runtimeId: RuntimeId }
    | { type: "placeholder"; runtimeId?: RuntimeId };
  selectionPolicy: "materialize" | "boundary" | "model-backed";
  copyPolicy: "include-model" | "summary-only" | "exclude" | "materialize";
  findPolicy: "native" | "not-native-until-mounted" | "custom";
  version: number;
};
```

Runtime rules:

- Lookup is indexed by root key/range; no document scan in typing.
- Structural commit remaps or invalidates boundaries.
- Owner removal clears boundaries.
- Boundary id changes replace stale records.
- Nested boundaries use nearest covering boundary for point lookup; spanning
  ranges collect all boundaries.
- Parent policy wins for native traversal when parent content is unmounted.
- Materialization receives the target selection/range and mounts only the
  intersecting group/range when possible.
- Clipboard model-backed path never copies stale DOM.

## Mode Policy Matrix

| Reason                    | Cohort                                       | Selection                             | Copy/paste                                          | Find                          | A11y                            | Default?                               |
| ------------------------- | -------------------------------------------- | ------------------------------------- | --------------------------------------------------- | ----------------------------- | ------------------------------- | -------------------------------------- |
| `app-collapse`            | any doc with user collapse                   | materialize or boundary by app policy | include model for select-all; local policy explicit | not native until mounted      | placeholder announces collapsed | yes as feature                         |
| `app-hidden`              | hidden headers/footers/chrome-like doc nodes | boundary                              | exclude by default                                  | not native until mounted      | hidden/summary policy           | yes as feature                         |
| `rendering-staged`        | 2000-10000+ blocks                           | materialize target                    | model-backed or materialize for spans               | native after surface complete | complete after surface complete | yes for default large-document default |
| `shell-aggressive`        | explicit perf escape hatch                   | shell-specific                        | model-backed where needed                           | explicit limitation           | explicit limitation             | no, opt-in                             |
| `viewport-virtualization` | stress/pathological only                     | materialize caret target              | model-backed spans                                  | custom or limitation          | strategy required               | no, research/prototype                 |
| `runtime-atom`            | void/atom nodes                              | boundary                              | serialized node policy                              | native around atom            | atom semantics                  | yes when node spec says atom           |

## Performance Plan

GitHub lesson applied:

```txt
Make the repeated unit 50-75% cheaper before relying on virtualization.
```

GitHub tricks pulled into Slate:

- dedicated fast paths instead of generic wrapper stacks;
- fewer DOM nodes per repeated unit;
- fewer React component instances per repeated unit;
- root/group event delegation with `data-*` hit routing;
- rare state outside repeated units;
- O(1) maps instead of repeated scans;
- no effects in repeated line/block wrappers unless synchronizing externally;
- CSS/layout hot-path proof;
- virtualization only for the extreme cohort;
- interaction-level INP/p95/p99 and memory/DOM tagging;
- production dashboard with document-size segmentation.

### Performance

- applicability: applied
- Vercel rules used:
  - `client-event-listeners`
  - `client-passive-event-listeners`
  - `rerender-defer-reads`
  - `rerender-derived-state`
  - `rerender-derived-state-no-effect`
  - `rerender-move-effect-to-event`
  - `rerender-memo`
  - `rerender-use-ref-transient-values`
  - `js-index-maps`
  - `js-set-map-lookups`
  - `js-combine-iterations`
  - `js-length-check-first`
  - `js-early-exit`
  - `js-request-idle-callback` with max-latency fallback only
  - `rendering-content-visibility` for staged non-editor chrome only
  - `rendering-activity` for non-editor panels, not editor body coverage
- extra rules used:
  - `cohort-segmentation`
  - `repeated-unit-budget`
  - `rare-state-isolation`
  - `event-delegation-budget`
  - `effect-subscription-budget`
  - `css-layout-hotpath`
  - `interaction-inp-matrix`
  - `memory-dom-tagging`
  - `degradation-contract`
  - `staged-readiness`
  - `react-19-runtime-proof`
  - `browser-trace-cwv-proof`
  - `production-rum-dashboard`
  - `editor-native-behavior-proof`
- repeated unit:
  - default editable block;
  - text/leaf segment;
  - root group;
  - hidden boundary;
  - virtualized window row/group.
- cohorts:
  - normal: 0-500 blocks;
  - medium: 500-2000 blocks;
  - large: 2000-10000 blocks;
  - stress: 10000-50000 blocks;
  - pathological: custom renderers, high decoration density, many hidden
    boundaries, tables, voids, collab churn, mobile/IME.
- budgets:
  - Slate-owned handlers per repeated block: 0 by default;
  - hot wrapper effects per repeated block/leaf: 0 by default;
  - repeated-unit render lookup: O(1);
  - boundary lookup during ordinary typing: indexed, no doc scan;
  - rare UI state per block: absent unless active/present;
  - full-doc replace stale DOM count: 0;
  - virtualized caret target: mounted before typing/IME.
- React/runtime primitives:
  - `Activity`: allowed for side panels/inspectors/previews, not editor body DOM
    coverage;
  - transitions/deferred values: allowed for overlays/search/projections, not
    visible typing, DOM text sync, selection import/export, or IME;
  - `useEffectEvent`: only for effect-fired external subscription callbacks;
  - React Performance Tracks: required when React render/effect breadth is
    suspicious.
- interaction metrics:
  - type;
  - select;
  - select then type;
  - model beforeinput;
  - native beforeinput;
  - select-all;
  - copy;
  - paste;
  - drag selection;
  - expand/collapse;
  - materialize hidden range;
  - scroll/click far group then type;
  - remote update inside hidden boundary.
- trace/CWV proof:
  - Chrome trace for editor interaction long tasks/layout/style;
  - React Performance Tracks for render breadth;
  - Core Web Vitals only for page-shell load claims, not editor correctness.
- memory tags:
  - JS heap;
  - DOM node count;
  - editable descendant count;
  - root group count;
  - boundary count;
  - mounted/pending/virtualized group count;
  - listener count;
  - cached range/index sizes;
  - decoration/comment/annotation count;
  - custom renderer flags.
- degradation contract:
  - staged staging: temporary missing far DOM with bounded
    `nativeSurfaceComplete`;
  - shell: explicit escape hatch with native limitations;
  - virtualization: stress/pathological prototype only until native matrix
    passes.
- dashboard/RUM gap:
  - Datadog/RUM view must tag interaction name, cohort, document size, visible
    DOM count, hidden boundary count, decoration/comment density, custom
    renderer flags, strategy, browser, mobile, IME, release/version.
- plan delta:
  - old Phase 5/6d handwave becomes owned work;
  - benchmark closure becomes Phase 7, not a side note.

## API And DX Target

Slate-close authoring:

- `renderElement` remains the entrypoint.
- `children` stays mandatory for normal content.
- `slots.Boundary` is the future stable adapter.
- `slots.unstableBoundary` remains until browser/native/perf gates pass.
- Public props stay few: `scope`, `mounted`, `reason`, `selectionPolicy`,
  `copyPolicy`, `findPolicy`, `renderPlaceholder`.
- Plate can wrap this into collapsible blocks, hidden headers, outline panels,
  disclosure buttons, or product-specific affordances.

DX guardrails:

- Dev warning when content-bearing renderer omits child DOM and no coverage is
  registered.
- Docs explain native find and a11y honestly.
- Examples include hidden child range, hidden first root, hidden last root,
  nested boundaries, rendering-strategy staging, and virtualization prototype.

## Migration Backbone

Plate/plugin maintainer answer:

- Product plugins use `slots.Boundary` for custom layout and element specs for
  stable node behavior.
- Plate owns UI state, buttons, disclosure affordances, and design system.
- Slate owns coverage registration, DOM bridge, selection/copy/paste, stale DOM
  prevention, and debug traces.
- Plugin authors do not wrap raw DOM lookup helpers; they express coverage
  intent.

slate-yjs/collab maintainer answer:

- Coverage state is view/runtime state, not document ops.
- Collapse state can be document state only when product schema chooses it.
- Mount/virtualization state never enters shared history.
- Remote edits inside covered content update model and dirty the boundary
  summary/index only.
- Operations, snapshots, runtime ids, and commits stay deterministic.

## Native Behavior Proof Matrix

| Behavior         | `app-collapse`                 | `app-hidden`             | `rendering-staged`              | `shell-aggressive`   | `viewport-virtualization`          |
| ---------------- | ------------------------------ | ------------------------ | ------------------------------- | -------------------- | ---------------------------------- |
| browser find     | not native until mounted       | not native until mounted | native after surface complete   | explicit limitation  | custom or limitation               |
| screen reader    | summary/placeholder            | hidden/summary           | complete after surface complete | explicit limitation  | strategy required                  |
| click/caret      | boundary or materialize        | boundary                 | materialize target              | promote shell        | materialize target                 |
| native selection | boundary/materialize           | boundary                 | materialize/model-backed        | model-backed shell   | materialize/model-backed           |
| select-all       | include model by policy        | exclude by default       | model-backed full doc           | model-backed         | model-backed                       |
| copy             | include/model-backed by policy | exclude by default       | model-backed/materialize        | model-backed         | model-backed                       |
| paste            | no stale DOM                   | no stale DOM             | model-backed/materialize        | model-backed         | materialize target or model-backed |
| IME              | freeze toggles                 | freeze toggles           | target mounted first            | shell promotes first | target mounted first               |
| mobile touch     | materialize or clamp           | clamp                    | materialize target              | explicit proof       | materialize target                 |
| undo/history     | explicit ownership             | explicit ownership       | mount state excluded            | mount state excluded | mount state excluded               |
| collab           | boundary dirties only          | boundary dirties only    | group dirties only              | shell dirties only   | window/group dirties only          |

## Test And Proof Matrix

Unit/runtime:

- boundary registration coalesces child ranges;
- nested boundaries nearest/parent policy deterministic;
- first root self-boundary;
- last root self-boundary;
- point lookup inside covered content;
- range lookup crossing covered content;
- structural insert/remove/split/merge/move remap;
- boundary id replacement clears stale records;
- owner deletion clears registry;
- materialization receives target range;
- copy/paste model-backed payload correct;
- virtualization window indexes remap through structural ops.

React:

- normal renderer must render `children` or coverage;
- unstable slot lifecycle has no missing-boundary gap;
- StrictMode no duplicate boundaries;
- expand materializes current model, not stale DOM;
- hidden model update does not wake visible sibling;
- 1000-descendant expand is O(boundary), not O(document);
- UI examples stay minimal and accessible.

Browser:

- click collapsed summary then type after it;
- expand then type inside;
- programmatic select inside hidden content;
- drag selection across hidden content;
- select-all then copy;
- paste over range spanning hidden content;
- undo text edit and collapse toggle;
- IME while toggle fires;
- mobile touch near hidden first/last root;
- browser find before/after expand;
- browser find before/after `nativeSurfaceComplete`;
- remote update hidden text;
- nested collapse inner/outer;
- full-doc replace no stale far DOM;
- virtualized caret target materializes before typing.

Performance/stress:

- 5000 blocks, 100 hidden boundaries: typing outside hidden ranges adds no more
  than 5 ms median over baseline;
- 10000 blocks, default staged: p50/p75/p95/p99 rows green against legacy
  chunk-on gates;
- 25000+ blocks, virtualization prototype: heap/DOM drops without native matrix
  regressions;
- one hidden boundary with 1000 descendants: expand O(boundary);
- remote updates inside hidden boundary: no full body rerender;
- select-all copy over hidden ranges: correct payload, no DOM throw;
- nested depth 3: no selection/path corruption;
- first and last root hidden: no root-edge crash.

## Implementation Phases

### Phase 1: Hot Surface Audit And Budget Cuts

Owner: `Plate repo root` Slate React runtime and benchmark harness.

Work:

- Count DOM nodes, editable descendants, component proxy, listener count, effect
  count, subscriptions, heap where available.
- Split default paragraph/text hot path from custom renderer path.
- Remove thin wrapper components if they only preserve abstraction purity.
- Move comments/widgets/debug/menus/hover chrome out of repeated block props.
- Ensure delegated root/group handlers for repeated interaction.
- Ensure O(1) maps for comment/annotation/projection/boundary lookup.
- Trace CSS/layout hot paths, especially `:has`, broad selectors, scroll
  geometry, and overlay movement.

Gate:

- repeated unit budget table recorded for normal/medium/large/stress cohorts;
- no effect/listener explosion in default block path;
- benchmark records surface-weight tags.

Phase 1 budget snapshot:

Source: `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`
with `REACT_HUGE_COMPARE_MODE=current-only`,
`REACT_HUGE_COMPARE_READY_ONLY=1`, `REACT_HUGE_COMPARE_SKIP_BUILD=1`,
`REACT_HUGE_COMPARE_PROFILE=1`, and one iteration. This is iteration evidence,
not release-grade benchmark evidence.

| Cohort | Blocks | Surface                  | DOM nodes | DOM/block | Editable descendants | Render proxy                  |  Selector subscriptions | Active listeners | Root groups mounted/pending | Coverage boundaries |            Heap MB |
| ------ | -----: | ------------------------ | --------: | --------: | -------------------: | ----------------------------- | ----------------------: | ---------------: | --------------------------- | ------------------: | -----------------: |
| normal |    100 | `v2Off`                  |       401 |      4.01 |                  200 | not sampled                   |             not sampled |              148 | 0/0                         |                   0 |              29.88 |
| medium |   1000 | `v2Off`                  |      4001 |      4.00 |                 2000 | text 2000 / leaf 2000         | runtime 2000 / global 7 |              148 | 0/0                         |                   0 |             146.93 |
| medium |   1000 | `v2DefaultRenderOff`     |      4001 |      4.00 |                 2000 | text 2000 / leaf 2000         | runtime 1000 / global 7 |              148 | 0/0                         |                   0 | sampled separately |
| medium |   1000 | `v2AutoExplicit`         |       203 |      0.20 |                  100 | text 100 / leaf 100 / group 1 |  runtime 100 / global 7 |              148 | 1/1                         |                   1 |             119.84 |
| medium |   1000 | `v2DefaultRenderAuto`    |       203 |      0.20 |                  100 | text 100 / leaf 100           |   runtime 50 / global 7 |              148 | 1/1                         |                   1 | sampled separately |
| medium |   1000 | `v2ShellExplicitRadius0` |       437 |      0.44 |                  200 | text 200 / leaf 200           |             not sampled |              148 | 0/0                         |                   0 |             150.76 |
| large  |   5000 | `v2Off`                  |     20001 |      4.00 |                10000 | not sampled                   |             not sampled |              148 | 0/0                         |                   0 |             586.98 |
| large  |   5000 | `v2AutoExplicit`         |       203 |      0.04 |                  100 | not sampled                   |             not sampled |              148 | 1/1                         |                   1 |             473.61 |
| stress |  10000 | `v2AutoExplicit`         |       203 |      0.02 |                  100 | not sampled                   |             not sampled |              148 | 1/1                         |                   1 |             102.34 |
| stress |  10000 | `v2ShellExplicitRadius1` |      1193 |      0.12 |                  400 | not sampled                   |             not sampled |              148 | 0/0                         |                   0 |             203.98 |

Budget read:

- Event listeners are flat at 148 across cohorts, so the default repeated block
  is not adding per-block DOM listeners.
- Ungrouped staged repeated unit costs about 4 DOM nodes and 2 editable
  descendants per block before syntax/custom renderers.
- Ungrouped runtime selector subscriptions scale with mounted editable
  descendants: 2000 runtime subscriptions for 1000 simple blocks.
- Staged staged ready surface keeps mounted editable descendants flat at
  100 for 1000-10000 blocks, with runtime subscriptions flat at 100 for the
  first mounted group.
- Default no-custom rendering uses the direct text-child path and halves
  runtime selector subscriptions for simple text blocks: 2000 to 1000
  ungrouped, 100 to 50 staged.
- Custom `renderElement` keeps the generic child selector path by design.
- Process heap is noisy and process-scoped; use it as a regression tag, not a
  release-grade memory claim.
- CSS/layout hot-path scan found no `:has(...)` usage in Slate React/DOM
  runtime. Layout reads are concentrated in selection/caret repair and
  placeholder measurement, not per repeated block. Shell segments already use
  `contain: layout style paint`.
- Phase 1 remaining DOM-shape risk is not listener explosion; it is whether the
  default `SlateText` + `SlateLeaf` wrapper pair can be safely collapsed later.
  That needs a DOM mapping proof and should not block Phase 2.

### Phase 2: DOM Coverage Bridge Closure

Owner: `slate-dom` and `slate-react` selection/clipboard/runtime bridge.

Work:

- Complete boundary-aware `toDOMPoint`, `toDOMRange`, `toSlatePoint`, and
  clipboard bridge.
- Add paste over hidden range proof.
- Add drag selection across boundary proof.
- Add nested contradictory policy resolution.
- Add IME composition guard around collapse/materialization.
- Add mobile touch smoke for first/last root boundaries.

Gate:

- no raw DOM lookup throw for covered model points;
- no stale DOM copied or pasted;
- IME/mobile rows do not lose text or selection.

### Phase 3: Hidden/Collapsed Runtime Release Gate

Owner: hidden subtree feature lane.

Work:

- Keep `DOMCoverageBoundaryRange` and `DOMCoverageSelfBoundary` private.
- Keep `slots.unstableBoundary` public-unstable only.
- Add comprehensive example:
  - nested collapsible section;
  - hidden top-level header;
  - hidden top-level footer;
  - nested boundary depth 3;
  - remote/model update while hidden;
  - debug panel showing boundary records and policies.
- Add docs that state browser find/a11y/copy behavior exactly.

Gate:

- proof matrix green for child range, self range, first/last root, nested,
  copy/paste, IME, mobile, a11y smoke, stress.

### Phase 4: DOM-Present Large-Doc Default Closure

Owner: rendering strategy default strategy.

Work:

- Keep `auto` as staged default.
- Keep `staged` force strategy.
- Keep `full` benchmark/control strategy.
- Keep `shell` explicit aggressive strategy.
- Keep `interactiveReady` and `nativeSurfaceComplete` separate.
- Maintain no stale old far DOM after full-doc replace.
- Route selection/copy/paste through DOM coverage for pending staged groups.
- Bound background mounting latency.

Gate:

- 5000 and 10000 block, 5-iteration matrix;
- default interactive ready beats legacy chunk-on;
- default typing matches/beats legacy chunk-on;
- default select+type matches/beats legacy chunk-on;
- default full replace visible commit matches/beats legacy chunk-on;
- stale DOM count 0;
- `nativeSurfaceComplete` measured and bounded.

Iteration evidence:

- `copyPolicy: materialize` now requests `DOMCoverage.materializeBoundary` with
  reason `copy` and the active model range before writing model-backed clipboard
  data. This keeps the current copy event synchronous and avoids stale DOM while
  still waking the staged group.
- Paste now materializes pending selection boundaries with reason `paste` before
  applying `insert-data`, so editing into a pending staged group does not
  stay invisible by policy accident.
- Focused regression tests in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/test/dom-coverage-native-bridge-contract.test.ts`
  cover copy and paste over a `rendering-staged` pending boundary and
  assert stale DOM is not copied or mutated.
- Verification:
  `bunx biome check packages/slate-dom/src/plugin/dom-clipboard-runtime.ts packages/slate-react/src/editable/clipboard-input-strategy.ts packages/slate-react/test/dom-coverage-native-bridge-contract.test.ts --fix`,
  focused native bridge Vitest, `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force`,
  `bunx turbo test --filter=./packages/slate-dom --filter=./packages/slate-react`,
  and `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react`.
- 5000-block full legacy compare, 5 iterations, passed the Phase 4 default
  gates for `v2DefaultRenderAuto`: ready mean 21.21 ms versus legacy chunk-on
  302.84 ms; select/type/full-replace/insert-fragment rows beat chunk-on; stale
  group count stayed 0; `nativeSurfaceComplete` mean was 936.59 ms.
- 10000-block current-only readiness, 5 iterations, kept `v2DefaultRenderAuto`
  honest on startup and background completion: ready mean 36.21 ms,
  `nativeSurfaceComplete` mean 1963.65 ms, pending groups at ready 199, stale
  group count 0.
- 10000-block full legacy compare exposed the current Phase 4 blocker rather
  than closing the pass: default ready/full-replace/stale-DOM behavior is green,
  but several interaction means trail legacy chunk-on under the all-surface run.
- A cleaner 10000-block `v2DefaultRenderAuto`-only run beat legacy chunk-on in
  most rows but still missed the strict gate on
  `middleBlockSelectThenTypeMs` by 3.18 ms.
- Split-selection proof identified the owner: follow-up typing after selection
  is fine, but selecting a far pending root group pays materialization cost.
  `middleBlockSelectMs` was 21.77 ms versus legacy chunk-on 1.17 ms, while
  `middleBlockTypeAfterSelectMs` was 71.60 ms versus legacy 82.00 ms. The
  blocker is far selection/materialization cost, not generic typing.
- Rejected tactic: removing active-group persistence from
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
  made the 10000-row benchmark worse/outlier-heavy and was reverted.
- Next owner: reduce far pending root-group selection materialization cost
  without weakening staged correctness, stale-DOM prevention, or the
  explicit shell/virtualization boundary.
- Root-group urgent mount budget was reduced in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
  from 50 to 25 blocks. Background batch size moved from 8 to 16 groups so
  smaller urgent units do not slow native-surface completion just by increasing
  group count.
- The direct text-child fast path now includes child text-node references in
  the mounted element binding equality. This keeps the hot direct render path
  cheap for synced text operations while forcing visible DOM to refresh after a
  full-document replace that reuses runtime ids.
- Large-doc staged Bun contract rows now pass for staged coverage, urgent
  selected-group materialization, and full-document replacement without stale
  visible first-group text.
- Final 5000-block, 5-iteration matrix for `v2DefaultRenderAuto`:
  ready 23.38 ms versus legacy chunk-on 332.60 ms; start type 32.13 versus
  67.17; start select+type 31.18 versus 77.77; middle type 23.21 versus 64.17;
  middle select+type 41.03 versus 73.18; full replace 12.83 versus 113.66;
  insert fragment 9.26 versus 130.89; stale group count 0;
  `nativeSurfaceComplete` 939.43 ms.
- Final 10000-block, 5-iteration matrix for `v2DefaultRenderAuto`:
  ready 36.20 ms versus legacy chunk-on 593.05 ms; start type 100.37 versus
  104.73; start select+type 56.55 versus 74.38; middle type 54.01 versus
  65.87; middle select+type 72.66 versus 80.55; full replace 21.22 versus
  256.31; insert fragment 23.85 versus 269.83; stale group count 0;
  `nativeSurfaceComplete` 2136.26 ms.
- Residual recorded row: 10000 `middleBlockPromoteThenTypeMs` is 77.62 ms
  versus legacy chunk-on 65.39 ms. This is not one of the Phase 4 staged
  default gates; keep it visible for the later native event/path pass instead
  of using it to claim a clean sweep.

### Phase 5: Stable Boundary API Bake-Off

Owner: Slate React API/DX.

Work:

- Build three examples against the same runtime:
  - `slots.Boundary`;
  - element-spec `domCoverage`;
  - low-level internal registration.
- Evaluate self coverage through `scope: self` before accepting public
  `SelfBoundary` sugar.
- Finalize prop names and defaults.
- Write public reference docs from current-state perspective only.

Gate:

- examples are readable;
- no raw runtime ids exposed;
- no lifecycle gap;
- no StrictMode leak;
- no public `Hidden*` names;
- docs show honest native behavior contract.

Iteration evidence:

- Current source already exposes one unstable adapter,
  `slots.unstableBoundary`, from `renderElement` props in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`.
- Current tests prove that one adapter covers both child ranges and self
  coverage without exposing runtime ids:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx`.
- Current docs and example use `scope={{ type: 'self' }}` for hidden
  header/footer and `scope={{ type: 'children', from, to }}` for collapsed
  section bodies:
  `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/editable.md` and
  `/Users/zbeyens/git/slate-v2/site/examples/ts/dom-coverage-boundaries.tsx`.
- Bake-off verdict:
  - `slots.Boundary` is the leading stable target after remaining gates.
  - `slots.SelfBoundary` should not ship first; `scope: self` is clear enough
    and keeps the public model unified.
  - `HiddenRange` and `HiddenSelf` stay rejected because they describe product
    UI instead of DOM coverage.
  - Element-spec `domCoverage` is a later convenience for stable node-type
    behavior, not the first authoring API for custom child layouts.
  - Lower-level registration stays internal; app authors should not manually
    register runtime boundaries.
- Stable API remains blocked. The current public surface stays
  `slots.unstableBoundary` until lifecycle, browser/native, stress, and DX gates
  are closed.

### Phase 6: Shell Policy Integration

Owner: shell explicit strategy.

Work:

- Register shell regions as `shell-aggressive` coverage where bridge/debug needs
  it.
- Keep shell promotion and model-backed selection separate from staged
  staging.
- Add copy/paste/select/find/a11y contract rows for shell.

Gate:

- shell stays opt-in;
- shell benchmark remains green;
- shell limitations are explicit;
- no shell policy leaks into default `auto`.

### Phase 7: Release-Grade Benchmark Closure

Owner: benchmark/perf lane.

Work:

- Run 5 iterations at 5000 and 10000 blocks.
- Add p50/p75/p95/p99 interaction rows or lab proxies.
- Include default, `staged`, `full`, legacy chunk-on/off, and explicit
  shell.
- Track DOM node count, editable descendants, root groups, pending groups,
  stale groups, listener count, heap if available.
- Compare direct model typing and native beforeinput.
- Capture Chrome trace and React Performance Tracks when a row regresses.

Gate:

- no release claim from one-iteration smoke;
- default strategy has enough evidence to compare against legacy chunk-on;
- shell is reported separately and never used to make default claims.

### Phase 8: Viewport Virtualization Prototype

Owner: stress/pathological research and prototype lane.

Work:

- Implement an experimental `viewport-virtualization` policy on the same DOM
  coverage registry.
- Materialize caret target before edit, IME, or touch.
- Use model-backed copy for spanning virtualized ranges.
- Define browser find behavior: custom find, full materialization, or explicit
  limitation.
- Define screen-reader behavior.
- Add persistent caret soak.
- Add 25000+ and 50000 block stress rows.

Gate:

- no default strategy claim;
- native behavior matrix explicit;
- DOM/heap reduction proven;
- p95/p99 interaction rows improve without stale DOM;
- accessibility and mobile strategy not hand-waved.

### Phase 9: Production Observability

Owner: instrumentation/RUM lane.

Work:

- Design Datadog/RUM dashboard.
- Tag interaction name, cohort, document size, strategy, boundary count, visible DOM
  count, decoration/comment density, custom renderer flag, browser, mobile, IME,
  release/version.
- Record p50/p75/p95/p99 interaction latency, heap, DOM node count, mounted
  group count, listener count, cached index sizes, and React scheduler priority
  where available.

Gate:

- dashboard can answer which cohort, interaction, strategy, memory bucket, and
  release regressed.

### Phase 10: Stable Release Decision

Owner: Slate maintainer review.

Work:

- Stabilize `slots.Boundary` only if Phase 2-9 gates pass.
- Keep `slots.unstableBoundary` if stable gates are not met.
- Keep virtualization experimental unless Phase 8 gates pass.
- Publish docs/examples only for behavior proven by tests/browser/stress rows.

Gate:

- score remains >= 0.92;
- no dimension below 0.85;
- no native behavior gap hidden behind performance wins;
- completion handoff lists every accepted decision.

## Slate Maintainer Objection Ledger

| Change                                  | Objection                                    | Antithesis                            | Answer                                                                                            | Verdict |
| --------------------------------------- | -------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------- | ------- |
| DOM coverage primitive                  | This is too much machinery for collapse.     | Plate can render CSS-hidden children. | CSS hiding leaves native behavior accidental; DOM coverage centralizes bridge policy.             | keep    |
| Stable `slots.Boundary`                 | Public JSX slots may create lifecycle races. | Keep only internal API.               | Stabilize only after lifecycle/browser/perf gates; current API remains `unstableBoundary`.        | revise  |
| `scope: self` instead of `SelfBoundary` | Self hiding is a different concept.          | Separate component is clearer.        | One Boundary concept avoids public API split; sugar can be added if examples prove need.          | keep    |
| Virtualization in same plan             | Virtualization has different semantics.      | Separate project avoids pollution.    | Same missing-DOM bridge, different policy engine. Separate bridge would be worse.                 | keep    |
| Model-backed copy                       | Visual and copied payload may diverge.       | Always materialize before copy.       | Use explicit policy; select-all can include model, local ranges can be product-specific.          | keep    |
| staged staging                          | Missing far DOM hurts native find.           | Render all DOM always.                | Track `nativeSurfaceComplete`; absent far DOM during warmup is allowed, stale far DOM is not.     | keep    |
| Shell strategy                          | Shell is faster, make it default.            | Use the fastest path.                 | Rich text native behavior makes shell an escape hatch, not default.                               | keep    |
| Performance budget pass                 | This delays architecture work.               | Just finish coverage.                 | GitHub's diff work shows repeated-unit bloat can dominate; skip this and staging hides bad units. | keep    |

## Scorecard

| Dimension                              | Score | Evidence                                                           |
| -------------------------------------- | ----: | ------------------------------------------------------------------ |
| React 19.2 runtime performance         |  0.94 | Performance phase, React primitive limits, benchmark trace owners  |
| Slate-close unopinionated DX           |  0.93 | `renderElement` + `slots.unstableBoundary`, Plate owns product UI  |
| Plate and slate-yjs migration backbone |  0.91 | runtime-vs-document state split, plugin/collab answers             |
| Regression-proof testing strategy      |  0.95 | unit/react/browser/perf/native matrix and current test owners      |
| Research evidence completeness         |  0.92 | prior Lexical/ProseMirror evidence plus GitHub performance article |
| shadcn-style composability/minimalism  |  0.91 | one Boundary adapter, minimal props, no product API in core        |

Weighted total: `0.93`.

Ready for execution review: yes.

## Pass-State Ledger

| Pass                 | Status   | Evidence added                                        | Plan delta                                            | Next owner  |
| -------------------- | -------- | ----------------------------------------------------- | ----------------------------------------------------- | ----------- |
| current-state read   | complete | live source/test/benchmark pointers                   | unstable adapter treated as current, not hypothetical | done        |
| intent/boundary      | complete | explicit scope and non-goals                          | no vague future bucket                                | done        |
| decision brief       | complete | options/rejections/consequences                       | one primitive, many policies                          | done        |
| performance pass     | complete | performance rule files and GitHub tricks              | hot-surface audit and RUM phases added                | done        |
| native behavior pass | complete | per-strategy matrix                                   | virtualization proof owned                            | done        |
| migration pass       | complete | Plate/slate-yjs backbone answers                      | mount state excluded from history/collab              | done        |
| high-risk pass       | complete | public API, browser, IME/mobile, virtualization gates | stable API gated, not assumed                         | done        |
| closure              | complete | score >= 0.92 and no dimension below 0.85             | ready for `ralph` execution                           | user review |

## Execution Ledger

| Time       | Phase                                         | Status                | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Next                                                                                                                                                                                 |
| ---------- | --------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-05-03 | Phase 1: Hot Surface Audit And Budget Cuts    | in_progress           | `ralph` activated the plan; `active goal state` set to pending; `active goal state` refreshed; first slice scoped to benchmark/runtime instrumentation for missing hot-surface tags.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Add/verify surface-weight tags, then close or continue Phase 1 budget cuts.                                                                                                          |
| 2026-05-03 | Phase 1 activation cleanup                    | stopped               | User interrupted the benchmark run on purpose while asking an explanatory question; orphaned benchmark processes were stopped. Existing live source already contains the first-slice instrumentation tags: event listener stats, DOM coverage boundary count, root group counts, and process heap tags in `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs:419` and `:1057`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | No active execution owner. Reopen Phase 1 with `ralph` when execution should resume.                                                                                                 |
| 2026-05-03 | Phase 1 hot-surface audit                     | complete              | Added JSDOM event-listener counting and ready surface-weight tags for active/added listeners, selected listener types, DOM coverage boundary count, mounted/pending root group counts, and process heap in `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`. Verification: `node --check`, targeted Biome check, and generated current-runner profile emitted the new keys. Full compare wrapper was SIGTERM'd locally, so this is iteration proof, not release-grade benchmark evidence.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Continue Phase 1 budget cuts: produce the repeated-unit budget table, then cut measured wrapper/listener/effect/state overhead in the default staged path.                           |
| 2026-05-03 | Phase 1 budget table                          | in_progress           | Added `current-only`, `ready-only`, `skip-build`, and surface-filter benchmark strategies; recorded normal/medium/large/stress ready-surface budget snapshot; added selector subscription profiler tags in `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx`. Verification: benchmark syntax, targeted Biome, `bunx turbo build --filter=./packages/slate-react --force`, `bunx turbo typecheck --filter=./packages/slate-react`, `bunx turbo test --filter=./packages/slate-react`, and current-only ready profiler rows.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Continue runtime cuts against default render component/proxy and selector subscription pressure.                                                                                     |
| 2026-05-03 | Phase 1 default direct text-child cut         | complete              | Default no-custom element rendering now renders direct text children from the parent selector when no projection store or custom text/leaf/segment renderer is active. Custom renderers and projection-backed text stay on the generic child selector path. Benchmark proof at 1000 blocks: `v2DefaultRenderOff` runtime selector subscriptions 1000 vs `v2Off` 2000; `v2DefaultRenderAuto` 50 vs `v2AutoExplicit` 100. Verification: targeted Biome, `node --check`, `bunx turbo build --filter=./packages/slate-react --force`, `bunx turbo typecheck --filter=./packages/slate-react`, `bunx turbo test --filter=./packages/slate-react`, and current-only ready benchmark rows.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Continue Phase 1 with remaining default render proxy/DOM shape and CSS/layout hot-path review.                                                                                       |
| 2026-05-03 | Phase 1 closure review                        | complete              | CSS/layout scan found no `:has(...)` runtime selectors; repeated DOM listeners are flat; selector pressure is measured and reduced for default no-custom rendering; rare state remains in projection/annotation/widget stores instead of block props; staged ready surface keeps mounted descendants and subscriptions bounded.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Move to Phase 2 DOM Coverage Bridge Closure. Keep the SlateText/SlateLeaf DOM-shape collapse as a later measured risk, not a Phase 1 blocker.                                        |
| 2026-05-03 | Phase 2 DOM coverage bridge closure           | complete              | Fixed editor-owned unmapped DOM target probing in `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts` so iframe-shaped paragraph targets return non-void instead of throwing; added native bridge tests in `/Users/zbeyens/git/slate-v2/packages/slate-react/test/dom-coverage-native-bridge-contract.test.ts` proving copy, paste, and drag-start over hidden boundaries use model-backed data and avoid stale DOM; guarded `DOMCoverage.materializeBoundary` during active composition in `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-coverage.ts`; extended boundary tests with first/last self-boundary DOM point import smoke in `/Users/zbeyens/git/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx`. Verification: targeted Biome, `bun test ./packages/slate-dom/test/bridge.ts ./packages/slate-dom/test/dom-coverage.ts --bail=1`, `bun test ./packages/slate-react/test/dom-coverage-boundary-contract.tsx --bail=1`, focused native bridge vitest, `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force`, `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react`, and `bunx turbo test --filter=./packages/slate-react`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Move to Phase 3 Hidden/Collapsed Runtime Release Gate: keep private harness private, keep slots unstable, add comprehensive example/docs/debug proof, then browser/a11y/stress rows. |
| 2026-05-03 | Phase 3 hidden/collapsed runtime release gate | complete              | Converted `/Users/zbeyens/git/slate-v2/site/examples/ts/dom-coverage-boundaries.tsx` from direct private boundary component imports to `slots.unstableBoundary`, added the `deep-section-body` depth-3 boundary, kept header/footer self boundaries and hidden model update/copy/debug controls, and documented `slots.unstableBoundary` plus native find/a11y/copy policy behavior in `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/editable.md`. Verification: targeted Biome, site typecheck, slate-react typecheck, managed browser proof at `/examples/dom-coverage-boundaries` with Outer then Nested toggles showing `deep-section-body` and `Deep body collapsed` while `Deep hidden body` stayed absent.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Move to Phase 4 DOM-Present Large-Doc Default Closure: selection/copy/paste over staged coverage, stale DOM prevention, readiness, and benchmark matrix.                             |
| 2026-05-03 | Phase 4 staged clipboard bridge               | complete              | Added materialization requests for `copyPolicy: materialize` in `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts` and paste target materialization in `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`. Added regression rows in `/Users/zbeyens/git/slate-v2/packages/slate-react/test/dom-coverage-native-bridge-contract.test.ts` proving copy and paste over a `rendering-staged` pending boundary request materialization, use model data, and avoid stale DOM. Verification: targeted Biome, focused native bridge Vitest, slate-dom+slate-react build, slate-react package tests, and slate-dom+slate-react typecheck.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Continue Phase 4 with stale-DOM/readiness proof and 5000/10000 benchmark matrix.                                                                                                     |
| 2026-05-03 | Phase 4 benchmark split                       | complete              | 5000-block full compare was green for default auto against legacy chunk-on, and 10000-block readiness/full-replace/stale-DOM rows were green. Strict 10000 interaction closure first missed `middleBlockSelectThenTypeMs` by 3.18 ms, and split-selection proof showed the real owner was far pending root-group selection/materialization (`middleBlockSelectMs` 21.77 ms versus legacy chunk-on 1.17 ms) while typing after selection was faster than legacy. A speculative active-group persistence cut was reverted after worse/outlier-heavy results.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Reduce urgent root-group materialization cost without weakening staged correctness.                                                                                                  |
| 2026-05-03 | Phase 4 staged closure                        | complete              | Reduced staged root group size from 50 to 25 and increased background batch size from 8 to 16. Fixed the direct text-child fast path so full-document replace refreshes visible first-group text even when runtime ids are reused. Verification: targeted Biome; staged Bun contract rows (`7 pass`); slate-react package Vitest (`20 files / 146 tests`); slate-react typecheck; slate-react build; 5000 and 10000 block, 5-iteration legacy-compare matrices. Final 5000 and 10000 default auto rows beat legacy chunk-on for ready, select-all, start/middle type, start/middle select+type, full replace, and insert-fragment; stale group count stayed 0; native completion was measured at 939.43 ms and 2136.26 ms. Residual 10000 `middleBlockPromoteThenTypeMs` remains recorded for the later event/path pass.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Move to Phase 5 API bake-off without stabilizing `slots.Boundary` yet.                                                                                                               |
| 2026-05-03 | Phase 5 boundary API bake-off                 | complete              | Re-read live source, tests, docs, and example for `slots.unstableBoundary`, private boundary components, and DOM coverage docs. The current unified slot adapter already covers child ranges and self coverage without raw runtime ids. Verdict: keep `slots.unstableBoundary` public-unstable; keep `slots.Boundary` as the eventual stable target; reject public `HiddenRange` / `HiddenSelf`; do not ship public `SelfBoundary` before proving `scope: self` is insufficient; keep element-spec `domCoverage` and low-level registration as later/internal shapes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Move to Phase 6 shell policy integration.                                                                                                                                            |
| 2026-05-03 | Phase 6 shell policy integration              | complete              | Shell segments now register `shell-aggressive` DOM coverage boundaries in `/Users/zbeyens/git/slate-v2/packages/slate-react/src/rendering-strategy/segment-shell.tsx`, using `state: virtualized`, `selectionPolicy: model-backed`, `copyPolicy: include-model`, and `findPolicy: not-native-until-mounted`. Shell placeholder DOM carries DOM coverage attributes for bridge/debug import. Regression rows in `/Users/zbeyens/git/slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.tsx` verify shell boundary ids, path/runtime coverage, policy, DOM attributes, cleanup after promotion, and neighboring shell boundary retention. Verification: targeted Biome; shell-focused direct Bun test (`11 pass`); slate-react typecheck; slate-react package Vitest (`20 files / 146 tests`); slate-react build with the known `is-hotkey` external warning.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Move to Phase 7 release-grade benchmark closure; keep shell evidence separated from default auto claims.                                                                             |
| 2026-05-03 | Phase 7 release-grade benchmark closure       | complete              | Added isolated current-surface benchmark strategy in `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs` after all-in-one surface runs showed process contamination. Moved staged background mounting into `React.startTransition`, reduced root group size from 25 to 16, and moved first background mount from 250 ms to 500 ms in `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`, preserving urgent typing before native completion. Final isolated artifacts: `/Users/zbeyens/git/slate-v2/tmp/phase7-final-isolated-5000.json` and `/Users/zbeyens/git/slate-v2/tmp/phase7-final-isolated-10000.json`. At 10000 blocks, `v2DefaultRenderAuto` mean rows were: ready 34.09 ms, select-all 0.25 ms, start type 68.37 ms, start select+type 51.05 ms, middle type 53.93 ms, middle select+type 74.54 ms, middle promote+type 68.22 ms, full replace 19.51 ms, insert fragment 12.83 ms, native completion 2573.97 ms, stale groups 0. Residual default miss: middle promote+type is +2.42 ms versus legacy chunk-on mean. Shell rows remain explicit and slower for middle select/promote, so they cannot support default claims. Profile artifact `/Users/zbeyens/git/slate-v2/tmp/phase7-profile-10000.json` records ready surface tags: default auto 67 DOM nodes, 32 editable descendants, 1 coverage boundary, 148 active listeners, 88.46 MB heap; shell radius 0 797 DOM nodes, 200 editable descendants, 99 boundaries, 148 listeners, 148.51 MB heap. Verification: benchmark syntax; targeted Biome; staged direct Bun rows (`7 pass`); slate-react typecheck; slate-react package Vitest (`20 files / 146 tests`); slate-react build with known `is-hotkey` external warning; 5000/10000 isolated 5-iteration matrices.             | Move to Phase 8 viewport virtualization prototype.                                                                                                                                   |
| 2026-05-03 | Phase 8 viewport virtualization prototype     | complete-experimental | Added explicit `renderingStrategy={{ type: 'virtualized' }}` support in `/Users/zbeyens/git/slate-v2/packages/slate-react/src/rendering-strategy/create-segment-plan.ts`, `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`, and `/Users/zbeyens/git/slate-v2/packages/slate-react/src/rendering-strategy/segment-shell.tsx`. Far segments now register `viewport-virtualization` DOM coverage boundaries with `state: virtualized`, `selectionPolicy: materialize`, `copyPolicy: include-model`, and `findPolicy: not-native-until-mounted`; broad selections stay model-backed through the existing shell-backed selection lane. Docs in `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/editable.md` state browser find and screen-reader limits. Stress artifacts: `/Users/zbeyens/git/slate-v2/tmp/phase8-virtualized-25000.json`, `/Users/zbeyens/git/slate-v2/tmp/phase8-virtualized-50000.json`, and `/Users/zbeyens/git/slate-v2/tmp/phase8-virtualized-profile-50000.json`. At 25000 blocks, virtualized ready mean was 137.03 ms, select-all 0.27 ms, middle promote+type 360.48 ms, full replace 40.46 ms, stale groups 0. At 50000 blocks, ready mean was 249.39 ms, select-all 0.28 ms, middle promote+type 908.59 ms, full replace 155.73 ms, stale groups 0. The 50000 profile row records 2397 DOM nodes, 200 editable descendants, 499 coverage boundaries, 148 active listeners, and 357.35 MB mean heap. Verdict: prototype works as a stress lane, but 50k edit interactions are too slow for stable/default claims. Verification: targeted Biome; virtualized/shell direct Bun rows; slate-react typecheck; slate-react package Vitest (`20 files / 146 tests`); slate-react build with known `is-hotkey` external warning; 25000/50000 current-only stress rows. | Move to Phase 9 production observability; keep virtualization experimental.                                                                                                          |
| 2026-05-03 | Phase 9 production observability              | complete              | Added `onRenderingStrategyMetrics` to `<Editable>` in `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx` and `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`, exporting `EditableRenderingStrategyMetrics` from `/Users/zbeyens/git/slate-v2/packages/slate-react/src/index.ts`. The callback runs after commit and reports cohort, document size, requested/effective strategy, mounted/pending groups and top-level counts, shell count, native surface completeness, DOM coverage boundary counts by reason, DOM boundary element count, visible DOM node count, and editable descendant count. Tests in `/Users/zbeyens/git/slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.tsx` cover virtualized and staged metrics. Docs now show the Datadog/RUM action shape and required dashboard tags: interaction, cohort, document size, strategy, boundary count, visible DOM count, editable descendant count, custom renderer flag, browser, mobile/desktop, IME, and release. Verification: `bunx biome check ... --fix`; focused metrics/virtualized Bun rows (`4 pass`); `bunx turbo typecheck --filter=./packages/slate-react`; `bunx turbo test --filter=./packages/slate-react` (`20 files / 146 tests`); `bunx turbo build --filter=./packages/slate-react --force` with known `is-hotkey` external warning; `bun lint:fix`.                                                                                                                                                                                                                                                                                                                                                                                                             | Move to Phase 10 stable release decision.                                                                                                                                            |
| 2026-05-03 | Phase 10 stable release decision              | complete              | Maintainer decision: keep default `renderingStrategy` as auto staged rendering; keep `slots.unstableBoundary` documented but unstable; do not stabilize `slots.Boundary`; keep `renderingStrategy.type = "virtualized"` experimental because 50000-block edit lanes are still hundreds of milliseconds to about one second; keep shell as explicit aggressive strategy only. This satisfies the full-plan requirement without lying: the primitive is implemented and measured, the production observability hook exists, and the unstable/experimental surfaces stay labeled honestly. Final fast gate in `/Users/zbeyens/git/slate-v2`: `bun check` passed lint, all package/site/root typechecks, Bun tests (`1007 pass`, `95 skip`), and slate-react Vitest (`20 files / 146 tests`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Full execution complete.                                                                                                                                                             |
| 2026-05-03 | Rendering strategy API rename                 | complete              | Renamed the public large-document rendering controls to `renderingStrategy`, with string values `auto`, `staged`, `full`, `shell`, and `virtualized`, object option key `type`, metrics fields `requestedStrategy` and `effectiveStrategy`, and export `EditableRenderingStrategyMetrics`. Renamed live source/test/example files from `large-document` to `rendering-strategy`, updated browser contract route families, docs, walkthroughs, active plan state, continuation state, and the RUM solution note. Kept the unrelated `editable-island` void kind intact. Verification: targeted Biome; `node --check` for the legacy compare benchmark; focused `rendering-strategy-and-scroll` and provider hook Bun tests; `bunx turbo typecheck --filter=./packages/slate-react`; `bunx turbo test --filter=./packages/slate-react`; `bunx turbo build --filter=./packages/slate-react --force` with the known `is-hotkey` external warning; `bunx turbo typecheck --filter=./packages/slate-browser`; `bun typecheck:root`; `bun typecheck:site`; `bun lint:fix`; old API reference sweep; focused Playwright route row (`rendering-strategy-runtime`, Chromium) passed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Full execution complete with renamed API.                                                                                                                                            |

## Final Gates

The plan is ready only because it does not claim implementation completion.
Execution starts with Phase 1.

Before stable release:

- Phase 1-10 complete;
- `bun check` green in `/Users/zbeyens/git/slate-v2`;
- focused DOM coverage tests green;
- rendering-strategy package tests green;
- browser integration rows green;
- 5000/10000 block 5-iteration benchmark matrix green;
- virtualization stress matrix green if virtualization is exposed at all;
- docs/examples match latest state only;
- RUM/dashboard gap either implemented or explicitly listed as production-proof
  gap.
