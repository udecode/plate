# Cursor find overlay architecture

Objective:
Design the canonical Plite cursor/find/overlay architecture; done when the
Plate Plan scores at least 0.92 with source-backed ownership, API, migration,
performance, and proof rows.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-08-30-cursor-find-overlay-architecture.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:

- package-api (docs/plans/templates/packs/package-api.md)

Major source:

- type: direct user architecture request
- id / link: current Codex thread
- title: absolute best Cursors / Find / overlays plan
- decision to make: choose the canonical model, permanent owners, public
  entrypoints, renderer contract, migration cut, performance law, and proof
  matrix for cursors, find highlights, and anchored overlays on Plite
- decision criteria: one substrate model with explicit state lifetimes; zero
  document mutations for transient paint; no duplicated range geometry; narrow
  subscriptions; deterministic rebasing; SSR/headless safety; accessible client
  renderers; executable migration and regression gates

Major lane:

- lane: architecture and public API plus editor-behavior specification
- output type: accepted implementation-ready plan, not product code
- implementation expected: later, only after user review and explicit execution
- affected packages / surfaces: `plitejs/react`, `platejs/react`,
  `platejs/cursor/react`, `platejs/find-replace`, `platejs/floating/react`,
  `platejs/yjs/react`, future comments/suggestions projection, registry
  renderers, tests, docs, and the entrypoint DAG
- dominant risk: creating a generic overlay abstraction that conflates durable
  anchors, transient decorations, layout geometry, and product UI state

Timed checkpoint:

- requested duration: none
- semantics: N/A: no duration or hard stop requested
- initial confidence score: 0.46 before live-source mapping
- improvement loop: current state, prior art, model/options, performance and
  browser pressure, objection ledger, revision, closure
- final score / loop closure: target total at least 0.92 with no dimension below
  0.85 and every scheduled pass complete or explicitly skipped with evidence

Completion threshold:

- One plan identifies every current cursor/find/overlay producer and consumer,
  classifies its state lifetime and rendering need, and names the canonical
  owner for each responsibility.
- The plan fixes the vocabulary and API boundaries among decorations,
  annotations, widgets, geometry snapshots, and product overlays.
- At least two viable architectures are compared; one wins against ownership,
  performance, accessibility, SSR/headless, collaboration, migration, and DX
  criteria.
- Public API, entrypoint DAG, compatibility/hard-cut policy, phased adoption,
  release impact, and rollback shape are explicit.
- Unit, type, headless, SSR, real-browser, stress, and packed-consumer proof
  rows are executable and mapped to owners.
- Plate Plan score is at least 0.92 with no dimension below 0.85; every major
  decision has an accepted objection row and every pass is complete or skipped
  with evidence.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-30-cursor-find-overlay-architecture.md`
  passes.

Verification surface:

- Live-source audit of the merged Plate/Plite entrypoints, geometry helpers,
  stores, extension contracts, renderer components, tests, examples, and
  entrypoint DAG.
- Source-backed comparison against relevant local editor clones only when the
  repo does not settle a design choice.
- Plate Plan scorecard, decision brief, objection ledger, high-risk pre-mortem,
  adoption map, and executable proof matrix in this plan.
- Mechanical closure with the exact `check-complete.mjs` command recorded below.

Constraints:

- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.
- Plite owns editor substrate; Plate owns product semantics and its public
  distribution paths.
- Transient search/cursor paint must not enter the document or history.
- A reusable geometry primitive must not grow product-specific hover, portal,
  thread, search-query, or collaboration policy.
- Performance and browser invalidation cost are API constraints, not cleanup.
- No compatibility alias or dual runtime path unless serialized-data safety
  proves a temporary migration owner is necessary.

Boundaries:

- Source of truth: latest merged `origin/next` Plate/Plite source plus current
  doctrine, tests, examples, and entrypoint manifests; current ref is verified
  during the source pass.
- Allowed edit scope: this plan and linked planning/research artifacts only;
  no package, registry, generated barrel, release, or product-runtime edits.
- External sources: local clones under `..` only if a material option remains
  unresolved after the repo audit; official docs only after local source.
- Browser surface: plan browser contracts for real editing routes, but do not
  run browser proof because this pass changes no renderer/runtime code.
- Tracker sync: N/A: no issue or PR is the source.
- Non-goals: implementing APIs, preserving legacy plugin names, redesigning
  comments/suggestions themselves, changing editor styling, or broad package
  consolidation.

Output budget strategy:

- Count files and matches before reading bodies. Restrict searches to
  `packages/plitejs`, `packages/platejs`, relevant registry/tests/docs, and the
  entrypoint DAG; exclude generated registry JSON, `dist`, `node_modules`,
  `.next`, `.turbo`, logs, and prior plan artifacts unless named evidence.
- Read exact owner files in bounded 150-250 line slices. Save any broad
  producer/consumer matrix to a linked artifact instead of streaming it.

Blocked condition:
Stop only if the merged source cannot be resolved, a required current owner is
unavailable, or two materially different product contracts remain equally
valid after source and prior-art review and require user preference. No such
blocker is known at intake.

Major state:

- task_type: major
- task_complexity: major
- current_phase: closure
- current_phase_status: complete
- current_pass: closure
- current_pass_status: complete
- next_phase: none
- next_pass: none
- next_action: user reviews the accepted architecture; implementation requires
  a separate execution goal and begins with contract-freeze proof
- goal_status: complete

Current verdict:

- verdict: hard-cut the public `platejs/cursor/react`,
  `platejs/find-replace`, and `platejs/floating/react` entrypoints. Do not replace
  them with `platejs/overlay`. Plite keeps Decoration, Annotation, and logical
  Widget. Add only a stable ids selector, collapsed-selection availability, and
  one private geometry engine exposed through `usePliteWidgetGeometry`; no raw
  Range target survives. `PliteWidgetStore` names its editor explicitly, and
  geometry requires the exact mounted Editable ref supplied by its caller;
  Plite never chooses a view for the application. Plite React owns built-in
  inactive-selection paint on the exact Editable that blurs to a target marked
  with `data-plite-keep-selection-visible`; Plate React inherits it, while
  copied registry UI owns markers, styling, Find, Floating UI composition, and
  all visuals. Yjs
  keeps its data hooks plus separate Decoration and Widget outputs, all reading
  one remote-cursor cache/index inside the existing private controller-owned
  `YjsAwarenessAdapter`, with no React or projection types. That cache reuses
  Plite's existing root-aware Anchors instead of inventing another point
  mapper. The public zero-argument awareness subscription stays unchanged; the
  controller's existing private awareness observer routes changed ids into
  that adapter. Widget geometry requires the exact mounted Editable ref instead
  of hiding a focused/last-focused view winner. Plate editable sibling slots
  receive that local ref, container sibling slots get their own truthful prop
  type, and `PlateStatic` invokes no before/after Editable sibling renderer.
  Find uses one copied `useFindController` result owner because Decoration
  snapshots contain projected slices, not canonical ranges. `FindKit` installs
  its local plugin; Plate privately lowers that plugin beside Yjs without
  app-root carrier composition. Performance gates separate
  deterministic counters from calibrated timing and consumer bundles.
- confidence: final 0.96; the closure inventory, requirement audit, research
  reconciliation, formatting gate, and mechanical completion check pass.
- next owner: the native inactive-selection execution goal at
  `docs/plans/2026-08-31-native-inactive-selection-focus-marker.md`. The
  historical execution plan records the superseded implementation and the
  corrected marker-driven follow-up.
- reason: merged source at `494d90c495092d25941b6f57ca7ebf97b5db13dd`
  proves that the three Plate entrypoints duplicate Plite capabilities or wrap
  registry-only UI. Implementation, maintainer, high-risk, and ecosystem
  pressure removed the last speculative public target/API, extended the
  existing headless Yjs awareness adapter rather than creating another store,
  fixed canonical one-source Find, made geometry explicitly view-scoped, and
  closed the registry dependency/static-renderer ownership gaps. Revision then
  reconciled every accepted decision into one normative inventory, private
  Plate plugin lowering, exact cost units, calibrated timing,
  law-update timing, phases, gates, and handoff. Closure mapped all 32 normative
  decisions to a current owner, accepted owner, and executable proof; no public
  API or ownership ambiguity remains.

## Current confidence scorecard

| Dimension                                            |   Weight |    Score | Current-pass evidence                                                                                                                   |
| ---------------------------------------------------- | -------: | -------: | --------------------------------------------------------------------------------------------------------------------------------------- |
| Evidence and authority strength                      |     0.18 |     0.96 | Exact plugin-slot, source/renderer plumbing, registry-closure, structural-store, and Yjs endpoint reads were reconciled owner by owner. |
| Plate editor-behavior DX and product fit             |     0.16 |     0.96 | Exact-view inactive selection, copied Find, and Floating owners stay distinct and customizable.                                         |
| Node model, affinity, and permanent-home coherence   |     0.16 |     0.97 | No raw Range Widget; Yjs caches typed cursor data and Plite Anchors headlessly; Find owns original ranges without editor mutation.      |
| Protocol, parity, and regression-proof testing       |     0.20 |     0.96 | Packed fixtures, per-ref mirrored-view rows, install closure, renderer coexistence, static exclusion, and the Yjs oracle are explicit.  |
| Research freshness and completeness                  |     0.15 |     0.94 | Pinned external evidence remains current; high-risk conclusions were rechecked against the immutable merged Plate/Plite snapshot.       |
| React/shadcn/effect implementation-review discipline |     0.10 |     0.97 | Exact local refs and truthful slot props replace global view choice; static rendering invokes no before/after Editable slot.            |
| Roadmap and implementation-handoff clarity           |     0.05 |     0.96 | Normative inventory, law timing, copied ownership, direct dependencies, atomic release cut, and rollback owners are explicit.           |
| **Weighted total**                                   | **1.00** | **0.96** | Numeric and conjunctive closure gates pass; remaining items are implementation falsifiers, not planning ambiguity.                      |

## Intent and boundary record

- Intent: replace historical plugin/package nouns with one durable projection
  model that remains fast with collaboration cursors, correct across multiline
  ranges, safe under SSR, and understandable without knowing Plate history.
- Desired outcome: applications use `platejs` and `platejs/react`; optional Yjs
  adaptation stays under `platejs/yjs/react`; `PlateContent` inherits Plite's
  marker-driven exact-view inactive-selection behavior; copied registry UI owns
  focus markers, visuals, and Floating UI composition; no application imports
  a generic cursor, find, floating, or overlay package.
- In scope: current-file Find highlights and navigation; inactive local
  selection; native drop caret; remote Yjs selection paint, caret, and label;
  selection/node/annotation Widget targets; viewport geometry; order and
  per-id subscriptions; SSR, exports, docs, and migration proof.
- Non-goals: redesigning comments/suggestions, changing serialized documents,
  implementing Replace, building a portal/popover framework, replacing Floating
  UI, adding a generic plugin-decoration DSL, or preserving old entrypoints.
- Decision boundary: this plan may delete or rename pre-stable public APIs,
  change Plite Widget types, move registry-only behavior out of packages, and
  require optional peer installation. It may not put product policy or DOM
  rectangles in headless state.
- Unresolved user decision: none. Revision and closure found no remaining
  product preference or public-API ambiguity.

## Accepted pass-2 decision brief

### Accepted exact-view selection correction (2026-08-31)

The earlier registry-plugin and controlled-prop verdicts were category errors.
Focus ownership is already observable by the exact mounted view. The corrected
target is a literal DOM protocol:

```tsx
import { Editable } from "plitejs/react";

<>
  <Editable />
  <button data-plite-keep-selection-visible="" type="button">
    Edit link
  </button>
</>;
```

- `plitejs` keeps the sole canonical selection. There is no public boolean,
  `Range`, or second selection state.
- `plitejs/react` watches the exact Editable's focus transition. A marked next
  target activates expanded fill or a collapsed caret; focus return or any
  unmarked target clears it.
- Plite exposes neutral `data-plite-inactive-selection` and
  `data-plite-inactive-selection-caret` styling hooks. The marker and paint
  never write model or DOM selection, input, history, clipboard,
  collaboration, or private projected view selection.
- `platejs/react` inherits the behavior through `PlateContent`; it adds no prop,
  plugin, store, kit, or second API name.
- Copied `Editor` places `data-plite-keep-selection-visible` on owned focus
  targets and styles the output hooks.
- Delete the registry `SelectionRetentionPlugin`, `SelectionRetentionKit`, and
  independent `selection-retention` install item. The behavior may keep a demo,
  but its reusable API is the Plite DOM protocol.

This section supersedes every later normative row that assigns inactive
selection rendering to a registry plugin, kit, Decoration contribution, or
Widget carrier. Historical source reads, rejected options, proof receipts, and
pass logs may still name that implemented shape as evidence; they are not the
target.

### Accepted execution correction

The user accepted one API correction before implementation. The lifetime split
below remains authoritative, but the normal Plate path no longer exposes raw
Decoration-source, `renderSegment`, singleton selection-Widget, or Yjs
Widget-store assembly.

- Plite still owns Decoration, Annotation, logical Widget, and the exact-view
  geometry coordinator. It adds the direct domain read
  `useSelectionGeometry({ editableRef })`; generic Widget APIs remain the
  advanced path for app-owned node and annotation targets.
- Plate's existing `decorate`, `render.leaf`, and Editable sibling slots are
  the normal semantic authoring surface. Plate privately lowers those plugin
  contributions to Plite projection/render carriers and automatically
  invalidates an owning decoration contribution when its plugin store changes.
  Transient decoration data does not require a persisted schema mark.
- Find remains copied registry product policy inside `FindKit`. Inactive
  selection uses the Plite React view prop proxied by `PlateContent`; copied
  `Editor` owns only the boolean activation and styles. Normal consumers do not
  install a retention plugin or wire sources/renderers at the root.
- Existing `YjsPlugin` remains the only public collaboration owner. The
  integration keeps its generic Widget adapter private and exposes domain reads
  for cursor ids, one cursor, and one cursor's exact-view geometry. No
  `YjsCursorPlugin` survives.
- Raw `PlateProps.decorationSources`, `Editable.renderSegment`, generic Widget
  stores, and source refresh remain advanced escape paths only when a caller
  genuinely owns a custom projection.

This correction supersedes any later normative row or example that calls raw
source/store/renderer composition the normal Plate API. Historical option and
falsification text may still name that rejected shape as evidence.

### Principles

1. Classify state lifetime before naming an API.
2. Transient paint never enters schema, document data, or history.
3. Logical targets stay DOM-neutral; geometry is a mounted React/DOM projection.
4. One editor owns one scheduled DOM-read pipeline; components do not invent
   timers, animation frames, or observers per cursor.
5. Package publication requires an independent semantic, DOM, or accessibility
   job; copied UI alone does not justify a package entrypoint.
6. A list renderer must read the stable membership/order snapshot separately
   from each item; an item-only update may invoke the existing store listener
   but must preserve ids identity and cause zero list render.
7. One external fact is resolved once. Separate data, Decoration, and Widget
   outputs may not create separate Yjs relative-position pipelines.
8. A public target kind needs a maintained caller. Integration-owned relative
   ranges do not justify a generic raw-Range Widget target.

### Top drivers

1. Correct multiline and collapsed-range behavior under live editing.
2. Narrow source and per-widget invalidation at hundreds of remote cursors.
3. One obvious Plate plugin/registry path without generic abstraction tax or
   lower-layer carrier assembly.

### Viable architectures

| Option                    | Shape                                                                                                                                          | Strength                                                                                    | Fatal cost / status                                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| A. Repair current entries | Keep CursorOverlay, FindReplace, and Floating; share a few helpers                                                                             | Small migration                                                                             | Preserves false concepts, duplicate DOM scheduling, schema-shaped transient paint, and registry-only package wrappers. Rejected. |
| B. Generic overlay system | One `OverlayPlugin`/`OverlayStore` owns ranges, anchors, rectangles, and renderers                                                             | One marketing noun                                                                          | Conflates four lifetimes, forces DOM into headless state, and creates global invalidation. Rejected.                             |
| C. Lifetime split         | Decoration for inline paint, Annotation for durable anchors, Widget for logical out-of-flow UI, one Widget geometry projection for mounted DOM | Matches existing Plite law; reusable by cursors, toolbars, links, comments, and suggestions | Requires a deliberate hard cut, one geometry hook, and one stable ids selector. Chosen.                                          |
| D. Registry-only geometry | Delete packages and let each copied component measure the DOM                                                                                  | Small public API                                                                            | Repeats the exact cursor/Yjs/floating bugs already present and cannot enforce one scheduler. Rejected.                           |

### Consequences and follow-ups

- `cursor` stops being an architecture noun. Local inactive selection, drop
  insertion feedback, and collaborative awareness get separate owners.
- `find-replace` stops lying: the current package only highlights. A copied Find
  controller composes existing headless primitives. Replace remains a separate
  deferred behavior packet within the same product surface; this cut neither
  implements it nor weakens its locked structural-safety law.
- `floating` stops being a Plate wrapper around an optional upstream dependency.
  Registry components import `@floating-ui/react` directly.
- Inactive-selection mechanics move to the exact Plite React view. Copied
  `Editor` stores or derives only whether product chrome should keep the live
  selection visible and passes that boolean through `PlateContent`; it owns no
  Range, plugin, Decoration contribution, or Widget carrier.
- Plite publishes its existing logical Widget target families, one ids selector,
  per-id reads, and one geometry hook. The ids selector reuses the existing
  subscription and stable `allIds` identity; no `getIds`/`subscribeIds` methods
  are added. The geometry coordinator and its store are private. The proposed
  raw Range target is cut because no independent caller survives.
- Yjs keeps one private Widget-store adapter because awareness must update
  per-id cursor state without forcing a host React render. It and the
  Decoration source share one cache/index by extending the existing private
  controller-owned `YjsAwarenessAdapter`; public domain hooks project ids,
  one cursor, and exact-view geometry. A public store, parallel controller,
  generic cursor manager, React-owned resolution, duplicate pipelines, and a
  new public awareness-event callback do not survive.
- Find owns its ordered original ranges in one registry-local result owner. Its
  Decoration source reads that owner; navigation never reverse-engineers
  logical ranges from per-node projection slices.
- Later comments/suggestions reuse Annotation + Widget; they do not influence
  this cut's product behavior.

### Best API deletion cone

| Public noun / surface                                  | Independent current job                                                                 | Decision and priority                                                                                                                                                                                                                               |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `platejs/cursor/react`                                 | None; it conflates local retention, native drop feedback, arbitrary cursors, and DOM UI | Delete, P0 architecture debt.                                                                                                                                                                                                                       |
| `CursorOverlayPlugin`                                  | None after those jobs return to their owners                                            | Delete, P0. Do not preserve generic add/remove cursor commands.                                                                                                                                                                                     |
| `SelectionRetentionPlugin` / `SelectionRetentionKit`   | No independent job; both wrap exact-view presentation and product focus policy          | Delete both, P0. Make inactive selection built into `plitejs/react` `Editable`, drive it with `data-plite-keep-selection-visible`, and keep marker placement/styling in copied `Editor`.                                                           |
| `platejs/find-replace`                                 | None; current code only stores a query and highlights                                   | Delete, P1. Find becomes copied UI over existing primitives; Replace remains future behavior.                                                                                                                                                       |
| `platejs/floating/react`                               | None; terminal consumers already own Floating UI policy                                 | Delete, P1. Registry imports the optional dependency directly.                                                                                                                                                                                      |
| `platejs/overlay` / `OverlayStore`                     | No coherent lifetime or consumer                                                        | Never add, P0.                                                                                                                                                                                                                                      |
| `PliteWidgetStore`                                     | Yes; it resolves app-owned logical targets independent of DOM                           | Keep and repair, P0 foundation; do not add a raw Range target.                                                                                                                                                                                      |
| `PliteWidgetGeometryStore` / provider                  | No caller needs to own or configure the scheduling engine                               | Keep private, P1.                                                                                                                                                                                                                                   |
| `usePliteWidgetGeometry(store, id, { editableRef })`   | Yes; advanced app-owned node/annotation Widgets need one exact-view geometry snapshot   | Add, P0 foundation; do not teach it for ordinary selection UI.                                                                                                                                                                                      |
| `useSelectionGeometry({ editableRef })`                | Yes; toolbar, link, and retained-caret UI all ask for the current selection geometry    | Add as the normal direct Plite React read, proxied by `platejs/react`; privately reuse the same exact-view coordinator.                                                                                                                             |
| `usePliteWidgetIds(store)`                             | Yes; lists must render only when membership/order changes                               | Add over existing `subscribe` plus stable `getSnapshot().allIds`; do not add `getIds` or `subscribeIds`.                                                                                                                                            |
| `useYjsRemoteCursor` / `useYjsRemoteCursors`           | Yes; app-owned presence/data UI may need one client or a deliberate whole-list read     | Keep over the same adapter cache; make the singular hook per-client, retain the plural hook as intentionally broad, and do not use the plural hook for the copied cursor layer.                                                                     |
| `useYjsRemoteCursorDecorationSource`                   | Yes; Yjs-relative selections need a collaboration-specific Decoration adapter           | Keep; read one shared private remote-cursor cache/index, P0.                                                                                                                                                                                        |
| `useYjsRemoteCursorWidgetStore`                        | No caller needs the complete generic carrier                                            | Keep private inside `platejs/yjs/react`; publish cursor ids and per-id cursor/geometry reads instead.                                                                                                                                               |
| `useYjsRemoteCursorIds` / `useYjsRemoteCursorGeometry` | Yes; custom cursor renderers need stable membership and one exact-view geometry read    | Add domain reads over the private Widget adapter and shared awareness cache.                                                                                                                                                                        |
| Public Yjs remote-cursor cache owner                   | No caller should coordinate resolution, mapping, or output fan-out                      | Do not add. Extend the existing private controller-owned `YjsAwarenessAdapter` into the DOM/React-free cache/index; preserve changed ids, decode each changed client once, and run at most one endpoint-resolution pass when its selection changes. |
| Structured public awareness callback                   | No independent consumer; only the private adapter cache needs exact changed ids         | Do not add. Keep `subscribeAwareness(listener: () => void)` unchanged and pass the existing private observer event directly to `YjsAwarenessAdapter`.                                                                                               |
| `useYjsRemoteCursorOverlayPositions`                   | None after Widget geometry exists                                                       | Delete, P0 duplication.                                                                                                                                                                                                                             |
| Floating UI virtual-element helper                     | None outside copied registry Floating UI consumers                                      | Do not publish, P2. Adapt the immutable rectangle locally.                                                                                                                                                                                          |

No other new public noun survives the deletion test. In particular, there is no
cursor manager, overlay provider, package Find plugin, geometry context,
renderer registry, positioning package, projection/view plugin layer,
`YjsCursorPlugin`, or compatibility alias.

Accepted entrypoint DAG:

| Entrypoint / owner        | Runtime                           | May depend on                                                            | Must not reach                      |
| ------------------------- | --------------------------------- | ------------------------------------------------------------------------ | ----------------------------------- |
| `plitejs`                 | headless                          | headless Plite only                                                      | React, DOM, Plate, Yjs, Floating UI |
| `plitejs/react`           | SSR/static plus client activation | `plitejs`, React                                                         | Plate, Yjs, Floating UI             |
| `platejs`                 | headless                          | proxied `plitejs`, headless Plate features                               | React, DOM, Yjs, Floating UI        |
| `platejs/react`           | SSR/static plus client activation | `platejs`, proxied `plitejs/react`, React                                | Yjs, Floating UI, removed entries   |
| `platejs/yjs`             | headless                          | `platejs`, optional Yjs peer                                             | React, DOM, Floating UI             |
| `platejs/yjs/react`       | SSR/static plus client activation | `platejs/yjs`, `platejs/react`, React, optional Yjs peer                 | Floating UI, removed entries        |
| copied registry client UI | client product composition        | surviving Plate entries and direct `@floating-ui/react`/`yjs` where used | `plitejs`, removed Plate entries    |

Generated Oxlint restrictions enforce every reverse edge; packed runtime and
declaration reachability prove that emitted artifacts obey the same graph.

## Source-backed behavior north star

- Plite doctrine fixes the architecture as Decoration, Annotation, and Widget,
  not "Overlay" (`docs/vision/plite.md:217`).
- Plite owns unopinionated projection sources and editor DOM scheduling;
  Plate owns product policy (`VISION.md:89-104`).
- Registry UI owns visuals and product composition. A package React primitive
  must own durable DOM/accessibility behavior, not merely wrap one copied
  component (`docs/vision/plate.md:547-576`).
- Search matches, selection fills, and remote selection fills are transient
  Decorations. Persistent comment/suggestion positions are Annotations.
  Carets, labels, toolbars, link popovers, and side controls are Widgets.
- A Widget target may resolve logically while having no mounted geometry. The
  public vocabulary must distinguish those facts.

## Request classification

- Request types: architecture-only specification question; current feature API
  redesign; public entrypoint hard cut; regression-proofing plan.
- Feature families: collaboration/editor-only, styling/editor chrome, and
  cross-surface interaction.
- Evidence state: architecture-lane change with strong merged-source evidence;
  API, React/performance, high-risk, ecosystem, and revision pressure are
  complete; closure passes at final score 0.96.
- Node model: `overlay / no node` for every rendered surface in this plan.
- Affinity: `n/a` for transient Decorations and selection/node Widgets;
  durable range affinity remains owned by the Annotation subsystem even when a
  Widget targets an annotation.

## Current law and readiness state

Source audit is pinned to merged `origin/next` commit
`494d90c495092d25941b6f57ca7ebf97b5db13dd`. Canonical paths below are relative
to that commit; `/tmp/plate-cursor-audit.L4c8go` is the immutable read snapshot.

| Surface                   | Live owner and evidence                                                                                                                                                  | Current fact                                                                                                                                                                                                                                                                                                                      | Readiness / target pressure                                                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Projection law            | `docs/vision/plite.md:217`; `packages/plitejs/src/react/{projection-store,decoration-source,annotation-store,widget-store}.ts`                                           | Plite already has source dirtiness, runtime/source subscriptions, stable-id mapped stores, and metrics.                                                                                                                                                                                                                           | Keep and extend; do not invent Overlay.                                                                                                                                                     |
| Text search               | `packages/plitejs/src/interfaces/node.ts:791-835`; `packages/plitejs/test/find-text-ranges-contract.ts`                                                                  | `NodeApi.findTextRanges` is pure/headless and spans adjacent leaves and inline descendants without crossing block roots.                                                                                                                                                                                                          | Keep in `plitejs` root, proxied by `platejs`.                                                                                                                                               |
| Plate Find                | `packages/platejs/src/features/find-replace/lib/FindReplacePlugin.ts:14-135`                                                                                             | Stores only `search`, declares a schema boolean, rescans blocks, and exposes no replace operation.                                                                                                                                                                                                                                | Delete entrypoint; copied Find UI composes the search source. Replace stays out of this implementation packet.                                                                              |
| Plite Find proof          | `apps/www/src/app/(app)/examples/plite/_examples/search-highlighting.tsx:26-117`                                                                                         | Existing example already uses `NodeApi.findTextRanges`, text dirtiness, query revision, and `renderSegment` with no schema mutation.                                                                                                                                                                                              | Use as the canonical implementation seed, imported through Plate proxies in Plate apps.                                                                                                     |
| Plate CursorOverlay state | `packages/platejs/src/react/features/cursor/CursorOverlayPlugin.tsx:4-108`                                                                                               | One plugin stores copied raw ranges for arbitrary cursors, inactive selection, and drag caret; it repairs state with `setTimeout(0)`.                                                                                                                                                                                             | Delete concept and entrypoint.                                                                                                                                                              |
| Plate cursor geometry     | `packages/platejs/src/react/features/cursor/useCursorOverlay.ts:26-157`                                                                                                  | Per-hook Range identity cache, local rAF, local ResizeObserver, and React state compute rectangles.                                                                                                                                                                                                                               | Replace with one Plite Widget geometry projection.                                                                                                                                          |
| Drop caret                | `packages/plitejs/src/react/components/editable.tsx:339-373`; registry editor style at `apps/www/src/registry/components/editor/editor.tsx:60-66`                        | Plite already creates and clears `[data-plite-drop-cursor]`; registry already styles it.                                                                                                                                                                                                                                          | Delete CursorOverlay drag state and renderer.                                                                                                                                               |
| Inactive selection        | `CursorOverlayPlugin.tsx:31-106`; exact prior browser contract `docs/plans/2026-08-24-cursor-overlay-focus-transition.md`                                                | Focus transfer into marked product chrome needs one visual selection while native DOM selection is empty.                                                                                                                                                                                                                         | Make neutral paint native to `plitejs/react` `Editable`; activate it with `data-plite-keep-selection-visible`; let `PlateContent` inherit it; keep marker placement and styles in copied `Editor`; publish no retention plugin/kit. |
| Plite view selection      | `packages/plitejs/src/react/{view-selection,view-selection-decoration}.ts`; its keyboard, clipboard, history, mutation, and reconciliation consumers                     | Built-in view selection is editing-engine state for projected/nested selection, is cleared by many input paths, and already mounts its own Decoration source inside Editable.                                                                                                                                                     | Do not reuse or expose it for toolbar retention; product blur paint must not alter editing-engine selection state.                                                                          |
| Cursor terminal consumers | `apps/www/src/registry/components/editor/{plugins,cursor-overlay,ai,ai-menu,link,link-toolbar-button,font-size-toolbar-button}.tsx`                                      | Every focus marker and current retained-selection renderer is copied registry UI; the AI package depends on CursorOverlay only to clear one retained selection.                                                                                                                                                                   | Move mechanics to the exact Editable lifecycle, keep marker placement in copied `Editor`, rename the marker, and remove the AI/package/plugin dependency.                                    |
| Yjs selection paint       | `packages/platejs/src/yjs/react/useYjs.ts:559-688`                                                                                                                       | `useYjsRemoteCursorDecorationSource` already produces the correct DOM-neutral range source.                                                                                                                                                                                                                                       | Keep. Registry must actually mount it.                                                                                                                                                      |
| Yjs caret geometry        | `packages/platejs/src/yjs/react/useYjs.ts:690-877`                                                                                                                       | A second hook duplicates rAF, global scroll/resize listeners, equality, and range geometry.                                                                                                                                                                                                                                       | Delete hook; expose the awareness-adapter cursor cache through a Widget-store adapter.                                                                                                      |
| Yjs React invalidation    | `packages/platejs/src/yjs/react/useYjs.ts:145-176,540-688`; `packages/platejs/src/yjs/core/controller.ts:125,242-244,886-955`; `core/awareness-adapter.ts:34-48,150-230` | Remote-cursor hooks subscribe only to awareness; resolved relative selections can change on editor commits. The private observer receives exact ids, while the public callback remains scalar/void. `YjsAwarenessAdapter` already owns cursor decoding. The Decoration hook also re-renders its host on every awareness revision. | Route the private event/commits into a stateful DOM/React-free awareness adapter; preserve the public callback; React adapters consume per-id/list/source subscriptions without host state. |
| Yjs renderer              | `apps/www/src/registry/components/editor/remote-cursor-overlay.tsx:70-148`                                                                                               | Registry uses only one bounding rect per range, so multiline selection paint is wrong; it adds another observer/listener layer.                                                                                                                                                                                                   | Decorations paint every line; Widget geometry paints only focus caret/label.                                                                                                                |
| Widget logical store      | `packages/plitejs/src/react/widget-store.ts:30-107,196-475`; `stable-id-mapped-source.ts:276-315`                                                                        | Supports annotation, node, and selection targets; calls the target an `anchor`, calls logical resolution `visible`, rejects collapsed selection visibility, and already preserves `allIds` identity on item-only refresh.                                                                                                         | Rename target vocabulary, make collapsed selection available, add only an ids selector over the existing subscription, and reject an unearned Range target.                                 |
| DOM scheduling            | `packages/plitejs/src/dom/plugin/dom-phase-scheduler.ts`; `packages/plitejs/src/dom/plugin/dom-geometry.ts`                                                              | Plite already owns ordered `model -> dom-read -> dom-write -> selection-repair` work plus range rect helpers.                                                                                                                                                                                                                     | Geometry must use this scheduler; no new timer loop.                                                                                                                                        |
| Floating wrapper          | `packages/platejs/src/floating/react/*`; `packages/platejs/package.json`                                                                                                 | Six files wrap/reexport optional `@floating-ui/react`; only registry link and floating-toolbar components are terminal product consumers.                                                                                                                                                                                         | Delete entrypoint; copied components import the optional peer directly.                                                                                                                     |
| Floating targets          | `apps/www/src/registry/components/editor/floating-toolbar.tsx:120-250`; `link.tsx:280-390`                                                                               | Both components repeatedly read selection/node DOM rectangles and manually refresh Floating UI on editor revisions.                                                                                                                                                                                                               | Consume stable Widget geometry virtual references.                                                                                                                                          |

Bounded source manifest:

- Cursor entry: 8 source/test files.
- Find entry: 4 source/test files.
- Floating entry: 6 source/test files.
- Public surfaces affected: `platejs/cursor/react`, `platejs/find-replace`,
  `platejs/floating/react`, `platejs/react`, `platejs/yjs/react`, and proxied
  `plitejs/react` Widget APIs.
- Packed/runtime proof, aliases, docs, generated API metadata, entrypoint sizes,
  registry dependency manifests, and type-test paths all reference the three
  entries and must move atomically during implementation.

## Research freshness decision

- Existing compiled research covered projection invalidation, Widget churn,
  annotation reference stability, dynamic lint/search decorations, selection
  export, bookmark rebasing, and placeholder overlays.
- Current merged Plite source is newer and stronger than several April-May
  conclusions: source dirtiness, runtime scope, stable-id mapping, narrow
  subscriptions, metrics, and DOM phase scheduling already exist.
- Pinned ProseKit, Tiptap, Lexical, and y-prosemirror reads preserved the
  lifetime split and falsified independent Yjs Decoration/Widget resolution.
  Research first required one private per-editor owner; implementation and
  maintainer pressure fixed its permanent home in the Yjs controller, below
  React, by extending the existing private awareness adapter into the
  remote-cursor cache/index fed by its private event without widening the public
  subscription contract.
- ProseKit's complete Search/Replace extension is a viable alternative for a
  complete product contract, but it does not justify plugin state for Plate's
  smaller Find-only packet over the existing pure matcher.
- The compiled refresh is
  [cursor-find-and-widget-geometry.md](docs/research/sources/editor-architecture/cursor-find-and-widget-geometry.md).
- `docs/solutions/patterns/critical-patterns.md` is a stale workflow route, not
  an evidence gap. The current `research-wiki` owner files were present and
  fully read. The old corpus claim that Lexical/ProseMirror/Tiptap lacked
  normalized raw families was also corrected.

## Best API target

These are the public and copied-UI targets after research, implementation,
maintainer, high-risk, ecosystem, and revision pressure. The closure pass audits
them against the normative inventory; compatibility does not preserve a
rejected noun.

| Responsibility                                | Permanent home                                                                  | Accepted target                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pure text matching                            | `plitejs` root, proxied by `platejs`                                            | Keep `NodeApi.findTextRanges`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Transient inline paint                        | Plite carriers; Plate plugin compiler for normal apps                           | Keep range Decoration sources and `renderSegment` as Plite/advanced carriers. Plate plugin `decorate` plus `render.leaf` is the normal semantic API and privately lowers to those carriers; transient decoration data never requires a persisted schema mark.                                                                                                                                                                                                                                                       |
| Durable positions                             | Plite Annotation lane                                                           | Keep persistent anchors/affinity there; Widget does not become durable storage.                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Logical out-of-flow target                    | `plitejs/react`, proxied by `platejs/react`                                     | Rename `PliteWidgetAnchor` to `PliteWidgetTarget`, `anchor` to `target`, and `visible` to `available`; keep explicit `nodeKey`; retain only annotation, node, and selection targets; collapsed selections are available.                                                                                                                                                                                                                                                                                            |
| Widget list and item reads                    | `plitejs/react`, proxied by `platejs/react`                                     | Keep `usePliteWidget`; add `usePliteWidgetIds`, subscribing to the existing store while reading stable `getSnapshot().allIds`; item-only publication invokes at most the one list listener but changes no ids snapshot and causes no list render. Add no subscription methods; expose the store's canonical `readonly editor` because every store is editor-bound and integration stores must participate without private branding. Keep `usePliteWidgets` only for deliberate whole-snapshot consumers.            |
| Mounted Widget geometry                       | private Plite React runtime coordinator with public immutable snapshots         | Add `usePliteWidgetGeometry(store, id, { editableRef }): PliteWidgetGeometry \| null` for advanced generic Widgets and `useSelectionGeometry({ editableRef })` for the normal selection job. Both require the exact Editable ref and reject wrong-editor/root refs. Do not publish a geometry store, provider, scheduler, virtual-element adapter, imperative refresh API, or implicit active-view policy.                                                                                                          |
| Plate projection lowering                     | private `platejs/react` plugin compiler                                         | Lower installed plugin `decorate` and `render.leaf` contributions into stable Plite Decoration/render carriers. Subscribe only to owning plugin state and source invalidation; plugin-store changes never require consumer `refreshDecorations()`. Keep raw `PlateProps.decorationSources` and `Editable.renderSegment` as explicitly advanced composition.                                                                                                                                                         |
| Plate render-slot DOM scope                   | `platejs/react` plugin render contract                                          | Make `EditableSiblingProps` contain only `editableRef` and pass the exact local `PlateContent` ref to `beforeEditable`/`afterEditable`; make `ContainerSiblingProps` contain only `containerRef`. No-argument renderers remain valid. `PlateStatic` renders document nodes only and never invokes before/after Editable sibling slots.                                                                                                                                                                                        |
| Inactive local selection mechanics and policy | `plitejs/react` exact Editable + inherited `platejs/react` behavior + copied `Editor` policy | Derive activation from the exact Editable blurring to `data-plite-keep-selection-visible`. Render expanded/collapsed mechanics from the live canonical selection with neutral data attributes. Copied `Editor` owns marker placement and styling. Delete the retention plugin/kit/item and never write Plite view selection.                                                                                                                   |
| Native drop caret                             | Plite Editable                                                                  | Keep `[data-plite-drop-cursor]`; no Plate state/API.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Yjs awareness adaptation                      | existing private `platejs/yjs` awareness adapter plus public domain React reads | Make `YjsAwarenessAdapter` the DOM/React-free cache keyed by client; feed it the private awareness event and affected-root transaction completion; retain cursor data, raw Yjs relative endpoints, root-aware Plite Anchors, order, and private per-id/list subscriptions. Existing data/Decoration plus `useYjsRemoteCursorIds` and `useYjsRemoteCursorGeometry` read it; the generic Widget adapter remains private and the position hook is deleted.                                                             |
| Floating placement/style                      | copied registry UI                                                              | Import `@floating-ui/react` directly through one copied `use-widget-floating` registry hook installed by both toolbar and link items; adapt `geometry.boundingRect` to a virtual reference and let Floating UI observe only its floating element, not duplicate reference scroll/resize ownership. Remove both Floating peers from `platejs`; the copied hook declares the direct package dependency.                                                                                                               |
| Find controller/style                         | copied `find` registry item                                                     | Export `FindKit` containing one registry-local plugin and copied UI. Local input query, deferred query, requested match index, and a tiny private active-match store feed one result owner retaining ordered `{ id, range }` matches from one `NodeApi.findTextRanges` read. The local plugin contributes Plate `decorate`, `render.leaf`, and `render.afterEditable`; callers install the kit and perform no source/renderer wiring. No package plugin, persisted schema mark, document/history state, or Replace. |

Accepted logical Widget target:

```ts
type PliteWidgetTarget =
  | { annotationId: string; type: "annotation" }
  | { nodeKey: NodeKey; type: "node" }
  | { type: "selection" };

type PliteWidget<
  TData extends Record<string, unknown> = Record<string, never>
> = {
  data?: TData;
  id: string;
  target: PliteWidgetTarget;
};

type PliteResolvedWidget<
  TData extends Record<string, unknown> = Record<string, never>,
  TAnnotation extends Record<string, unknown> = Record<string, never>
> = PliteWidget<TData> & {
  annotation: PliteResolvedAnnotation<TAnnotation> | null;
  available: boolean;
  range: Range | null;
};

type PliteWidgetStore<
  TData extends Record<string, unknown> = Record<string, never>,
  TAnnotation extends Record<string, unknown> = Record<string, never>
> = {
  readonly editor: Editor;
  // Existing snapshot, refresh, lifecycle, and subscription members remain.
};
```

Accepted Plate sibling scopes:

```ts
type EditableSiblingProps = {
  readonly editableRef: React.RefObject<HTMLDivElement | null>;
};

type ContainerSiblingProps = {
  readonly containerRef: React.RefObject<HTMLDivElement | null>;
};
```

`usePliteWidgetIds(store)` subscribes through the existing `store.subscribe` and
returns the exact frozen `store.getSnapshot().allIds` value. Its identity changes
only when membership or order changes, so item data or logical availability may
invoke the one store-listener check but cannot cause a list render; geometry is a
separate store and does not invoke it.

Accepted geometry surface:

```ts
type PliteViewportRect = Readonly<{
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
  x: number;
  y: number;
}>;

type PliteWidgetGeometry = Readonly<{
  boundingRect: PliteViewportRect;
  focusRect: PliteViewportRect | null;
  rects: readonly PliteViewportRect[];
}>;

declare function usePliteWidgetIds(store: PliteWidgetStore): readonly string[];

declare function usePliteWidgetGeometry(
  store: PliteWidgetStore,
  id: string,
  options: Readonly<{
    editableRef: React.RefObject<HTMLElement | null>;
  }>
): PliteWidgetGeometry | null;

declare function useSelectionGeometry(
  options: Readonly<{
    editableRef: React.RefObject<HTMLElement | null>;
  }>
): PliteWidgetGeometry | null;
```

Geometry law:

- Return immutable plain viewport rectangles, never live `DOMRect` instances.
- One snapshot exposes `rects`, `boundingRect`, and direction-aware `focusRect`.
  Selection and annotation targets expose currently mounted/measurable line
  boxes; `rects` is viewport evidence, not a promise that a virtualized range is
  fully mounted. Their `focusRect` is resolved independently from a collapsed
  DOM range at the logical focus point, not guessed from a box edge.
  `boundingRect` unions the available line boxes and falls back to `focusRect`
  when only the focus point is mounted. A collapsed selection has `rects: []`
  and uses its caret rect as `boundingRect` and `focusRect`. A node target has
  one node border rect in `rects`, the same `boundingRect`, and
  `focusRect: null`. A null snapshot means no target geometry is currently
  measurable. A store whose editor has no mounted representation returns null;
  custom integration stores are valid when they expose the same canonical
  editor contract. Do not add a speculative `complete` flag: no maintained
  consumer needs full-document layout truth.
- Annotation is the only durable range target. Selection reads the current
  model selection; node reads a stable node key. Arbitrary raw ranges do not
  enter Widget's public contract.
- Every Widget store exposes the canonical editor it resolves against. This is
  an honest part of the store contract, not a hidden WeakMap brand: the public
  interface is structural and `platejs/yjs/react` must be able to implement it.
  The geometry hook reads `store.editor` plus the caller's stable
  `editableRef`, never ambient React context or a global active-view guess, so
  portals and structural integration stores need no private Plite handshake.
- Geometry is explicitly view-scoped. The ref must resolve to one connected
  Editable runtime registered to `store.editor`; null, disconnected,
  cross-editor, or wrong-root refs return null and never fall back to another
  view. Two mirrored Editables may intentionally render the same logical Widget
  once per explicit ref, but one hook snapshot never unions rectangles across
  views or documents. Ref replacement and unmount clear the old view in the
  same scheduler cycle.
- Key geometry by `(store identity, widget id, editable ref)`, not by id alone.
  Only scoped ids with geometry subscribers are registered; only registered
  targets whose DOM hosts are mounted in that exact runtime are measured.
  Virtualized mount/unmount notifications dirty the reverse-indexed scoped ids.
- One coordinator per `(editor, ownerDocument)` owns one passive capture scroll
  listener, one window resize listener, `visualViewport` resize/scroll listeners
  when available, and one shared ResizeObserver observing exact Editable roots
  plus ref-counted active target hosts. At most one shared position-only
  observer per coordinator catches layout shifts; an IntersectionObserver
  strategy is a candidate, not public law, and survives only if the browser
  tracer proves it. They feed keyed/coalesced Plite `dom-read` tasks. No
  observer, timer, or raw rAF loop is created per widget or per view scope.
- Editor commits dirty ids whose logical targets changed. Root/target resize or
  scroll dirties mounted registered ids only. Arbitrary continuously animated
  ancestor transforms are outside the base contract; do not hide a 1,000-range
  rAF loop behind "correctness."
- Geometry publication is per id and equality-stable. Metrics separate geometry
  reads, mounted/registered ids, changed ids, scheduler flushes, full fallbacks,
  list-listener checks, ids snapshot changes, list renders, and item/geometry
  subscriber wake-ups.
- Server snapshot is empty/null, imports touch no DOM, and hydration performs the
  first scheduled measurement after subscription and root mount. The private
  coordinator is owned by the Plite runtime, not a module-global request cache.

Ideal normal Plate call site:

```tsx
import { FindKit } from "@/components/editor/find";
import { CollaborationKit } from "@/components/editor/collaboration";

const editor = useCreateEditor({
  plugins: [...EditorKit, ...FindKit, ...CollaborationKit],
});

return (
  <Plate editor={editor}>
    <Editor />
  </Plate>
);
```

One copied renderer that genuinely needs custom selection placement reads the
domain value rather than constructing a singleton Widget carrier:

```tsx
import { useSelectionGeometry } from "platejs/react";

const geometry = useSelectionGeometry({ editableRef });
```

The copied toolbar adapts `geometry?.boundingRect` to Floating UI. Plite does
not import or name Floating UI. Generic `usePliteWidgetStore` and
`usePliteWidgetGeometry` remain the advanced path for app-owned node and
annotation Widgets.

Ideal Yjs renderer split:

```tsx
import {
  useYjsRemoteCursorDecorationSource,
  useYjsRemoteCursorGeometry,
  useYjsRemoteCursorIds,
} from "platejs/yjs/react";

const selectionSource = useYjsRemoteCursorDecorationSource(editor);
const cursorIds = useYjsRemoteCursorIds(editor);
const geometry = useYjsRemoteCursorGeometry(editor, cursorIds[0], {
  editableRef,
});
```

The hooks read the same private remote-cursor cache/index and Widget adapter
inside the
controller-owned `YjsAwarenessAdapter`. The public
`subscribeAwareness(listener: () => void): () => void` contract does not change.
The controller's existing private `awarenessObserver(event)` sends exact
`added`/`updated`/`removed` ids to the adapter before incrementing the generic
scalar revision; provider connectivity or owner replacement calls the adapter's
private full-rebuild method directly. One changed client is decoded once; a
selection change runs at most one cursor-resolution pass containing at most two
endpoint conversions, one per distinct endpoint, while a metadata-only change
reuses the cached endpoints. The
adapter retains raw relative endpoints plus root-aware Plite Anchors. After a
local Yjs transaction or remote editor import completes, it reads only affected
root buckets, preserves Yjs association semantics through those Anchors, and
publishes only changed clients. It exposes private order, per-client, and cache
subscriptions consumed by existing data reads and the React
Decoration/Widget adapters. No parallel controller store, public generic
Widget-store carrier, public aggregate
cursor store, structured awareness callback, React-owned cache, or bespoke
point mapper is added.

The Yjs Widget store uses the cached `YjsRemoteCursor<TCursorData>` itself as
Widget data; it does not add a second public cursor-view wrapper or mapping
callback. The existing Decoration hook keeps its `decorate` callback and
`revision` option. A revision-only change recomputes render data from cached
cursors without resolving Yjs endpoints again.

Each cached cursor keeps data plus zero or two raw Yjs endpoints and root-aware
Plite `Anchor<Point>` endpoints. Association derives from each Yjs
`RelativePosition.assoc` (`assoc < 0` maps backward; zero/positive maps
forward), and deletion uses `drop`. Plite's existing Anchor engine, not a new
cursor mapper, maps ordinary text and structural commits. After a local Yjs
transaction or remote editor import finishes, the controller asks the adapter
to publish only changed cursors in the affected root buckets. Existing bridge
fallback, root create/delete, provider replacement/reconnect, a dropped anchor,
or a mapping exception re-resolves the affected root bucket directly from the
raw Yjs endpoints and increments `fullFallbackCount`. A cursor with data but no
valid selection remains in the id/data view and has an unavailable Widget/no
Decoration. Removal or a full rebuild releases every Plite Anchor before
publication. Sorted client-id order changes only on membership.

The list renders one keyed child per id. Each child reads only the singular
cursor data hook and `useYjsRemoteCursorGeometry(editor, id, { editableRef })`.
The configured registry-local collaboration renderer contributes selection
paint through the existing `YjsPlugin` owner and Plate's private projection
lowering; normal apps append no source and compose no segment renderer. A
mirrored view mounts a second renderer with its own exact `editableRef`; it does
not ask Plite to pick a global winner. The concrete copied renderer may call
itself an overlay; that word never names a package, store, plugin, state
lifetime, or public substrate.

Ideal Find registry composition:

```tsx
import { NodeApi } from "platejs";

const findPlugin = definePlatePlugin("find", {
  decorate: readFindDecorations,
  render: {
    afterEditable: FindBar,
    leaf: FindMatch,
  },
});

export const FindKit = [findPlugin] as const;
```

The copied `useFindController(editor)` owns `query` and `requestedIndex`;
`effectiveIndex`,
result count, and empty state are derived. A deferred query drives one
registry-local Find result owner. That owner performs one matcher read, retains
the ordered canonical `{ id, range }` list, and supplies the range Decoration
source from the same list. It never derives ranges from
`PliteDecorationSource.getSnapshot()`, whose public values are per-node
`PliteProjectionSlice` objects without a `range`. Next/previous changes a tiny
registry-local per-id active-match store, scrolls the active segment, and keeps
focus in the Find input; only the old and new match components wake. A semantic
`commitActiveMatch` action writes editor selection/focus, but this plan does not
freeze a dedicated Jump button. The registry-local plugin projects the same
result owner through `decorate` and `render.leaf`; Plate privately composes it
with every installed plugin contribution. The normal caller installs `FindKit`
and performs no root source/renderer registration. No public renderer registry,
second plugin layer, or new Plite composition API is added. Query changes reset
`requestedIndex` in the input event, while text edits clamp it synchronously;
no effect mirrors derived state.

## Pass-4 implementation pressure verdict

North-star reaffirmed: `laws`, `performance-selection-rules`, and
`pattern-catalog`. The pass preserves Core as mechanism, Plite React as mounted
projection, Plate integrations as semantic adapters, and copied registry UI as
product composition. It adds no application policy to Plite and no DOM state to
headless Yjs.

### Authority, model, affinity, and permanent home

| Surface                             | Node model / affinity                       | Canonical authority                                             | Permanent home                                                                                     | Rejected pressure                                                                                         |
| ----------------------------------- | ------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Search match paint                  | overlay / no node; `n/a`                    | existing `EDIT-SEARCH-*` law plus pure `NodeApi.findTextRanges` | registry-local Find plugin `decorate`/`render.leaf`, privately lowered by Plate                    | document mark, persisted schema key, package plugin, or root source wiring                                |
| Active Find result                  | overlay / no node; `n/a`                    | copied Find navigation contract                                 | registry-local canonical result owner, tiny per-id active store, and leaf UI                       | projection-snapshot range recovery or document selection mutation on every next/previous action           |
| Inactive local selection            | overlay / no node; live canonical selection | exact #5091 behavior and copied focus policy                    | exact Editable focus transition; `data-plite-keep-selection-visible`; copied `Editor` marker/style policy | Plite view selection, copied Range state, boolean prop, timers, Decoration/Widget carrier, plugin, kit, or install item |
| Remote selection                    | overlay / no node; Yjs endpoint association | existing `EDIT-COLLAB-*` plus Yjs relative positions            | private stateful Yjs awareness adapter -> React Decoration adapter                                 | React revision scan or one bounding box                                                                   |
| Remote caret/label                  | overlay / no node; same Yjs endpoints       | same private cursor entity as remote selection                  | private Yjs Widget adapter -> domain geometry hook -> copied renderer                              | public generic adapter, second resolver, old position hook, or cursor manager                             |
| Toolbar/link target                 | overlay / no node; `n/a`                    | live selection                                                  | `useSelectionGeometry`; copied Floating UI                                                         | singleton Widget assembly, editor-version effects, or per-component DOM-range reads                       |
| Durable comment/suggestion position | editor-only annotation; existing affinity   | Annotation law, outside this product cut                        | existing Plite Annotation lane                                                                     | Widget range persistence or widening this plan into comments                                              |

The existing Plite view-selection source is explicitly not reused. It is
editing-engine state consumed by keyboard, clipboard, history, mutation, and
selection reconciliation; many of those owners clear it. Product toolbar blur
must not make the input engine believe it owns a projected selection.

### Copied UI and accessibility

- Find composes existing `InputGroup`, `InputGroupInput`,
  `InputGroupAddon`, `InputGroupButton`, `Button`, and `Tooltip`. No new shadcn
  primitive or package component is justified, so no CLI/docs fetch is needed
  for this planning pass.
- The surface has `role="search"`, a visible or screen-reader label, a
  polite result-count announcement, `aria-busy` while the deferred query trails,
  and labelled previous, next, and close controls. A product may expose the
  semantic `commitActiveMatch` action, but this plan does not require a Jump
  button.
- `Mod+F` opens and seeds from an expanded editor selection; `Enter` and
  `Shift+Enter` move next/previous while input focus stays put; `Escape` closes
  and restores editor focus without fabricating a selection.
- Find match spans use semantic tokens for ordinary/current results and expose
  `data-find-match-id` only as copied UI instrumentation. Package code owns no
  class names, colors, icons, popovers, or labels.
- Remote cursor labels, retained-selection styling, floating toolbar, and link
  popover remain copied registry components. Product styling never enters
  Widget data or Plite geometry.
- Plite activation tests the marked target or composed ancestor of
  `relatedTarget`, survives focus moves inside marked chrome, clears when focus
  leaves that chrome or returns to the editor, and renders only while the
  editor is not natively focused. No public value owns a Range. Default copied
  composition suppresses text fill for multi-cell table selection (the table
  selection UI already owns it) and while AI streaming hides editor chrome;
  neither Table nor AI depends back on retention.

### React and effect contract

| Owner                     | Accepted React shape                                                                                                                                                                                                            | Effects allowed                                                                                   | Effects rejected                                                                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Widget ids/items/geometry | `useSyncExternalStore` over stable `getSnapshot().allIds`, per-id item, and `(store,id,editableRef)` geometry snapshots; one keyed child per id                                                                                 | external subscription registration and cleanup                                                    | whole-snapshot value as list snapshot, redundant ids subscription API, implicit active-view choice, geometry in React state, render-time owner mutation                                        |
| Geometry runtime          | private `(editor,ownerDocument)` coordinator; exact-ref routes and keyed scheduler tasks; stable event callbacks                                                                                                                | view/listener/observer registration, DOM read scheduling, cleanup                                 | implicit global view selection, per-widget/view rAF/observer/listener, `setTimeout`, state-sync effects                                                                                        |
| Yjs adapters              | stateful DOM/React-free awareness adapter below React; existing scalar public subscription stays stable; source/store hooks expose external stores                                                                              | activate/release adapters and sources under StrictMode-safe lifecycle                             | parallel controller/React cache, `useYjsAwarenessRevision` host rerender pipeline, public structured-event churn, module-global request state                                                  |
| Find                      | registry-local input/open/requested-index state; deferred query; one canonical result owner; matches/effective index derived; private active-match store; one local plugin whose `decorate` and render slot lower through Plate | editor-root shortcut listener when plugin keydown cannot own it; result/plugin-store subscription | query-to-plugin mirroring, projection-snapshot range recovery, effect-clamped index, second matcher call, dynamic Plate registration, app-root source arrays, or app-root renderer composition |
| Inactive selection        | exact Editable lifecycle over live canonical selection; copied `Editor` marks owned focus targets                                                                                                                               | exact-view lifecycle and document focus cleanup only                                               | controlled prop, editor-global plugin/store/kit, copied Range, post-commit timeout, Plite view-selection writes                                                                                |
| Floating/link             | one copied `use-widget-floating` registry hook; exact Editable-scoped geometry drives a virtual reference; visibility selectors stay narrow                                                                                     | synchronize Floating UI reference and observe floating-element resize only                        | editor-version update effect, duplicate ancestor scroll/resize observers, two geometry hooks for one target                                                                                    |

If a native shortcut listener is required, it uses React 19 `useEffectEvent` so
the subscription is stable and reads current state without a ref-sync effect.
No component is declared inline inside a render path.

### Complexity and performance budgets

Let `n` be known remote cursors, `m` be geometry-subscribed
`(store,id,editableRef)` scopes whose DOM hosts are mounted, and `k` be changed
cursor ids in one awareness event.

One cursor-resolution pass decodes one changed client's selection and performs
zero endpoint conversions when it has no valid/changed selection or at most two,
one per distinct anchor/focus endpoint. Client decode, cursor-resolution pass,
and endpoint conversion are separate counters; “one resolution” never hides
endpoint work.

| Event                                          | Required complexity and deterministic counters                                                                                                                                                                                            | Timing acceptance after calibration                                                                                                     |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| One awareness client changes                   | `O(k)` client decodes; for `k=1`: one decode, at most one cursor-resolution pass containing at most two endpoint conversions when selection changes, stable ids identity, no list render, no unrelated item/geometry wake, no host render | controlled-lane p95 stays within 20% of the accepted baseline and below the recorded one-frame budget                                   |
| Awareness membership changes                   | `O(k)` resolutions plus one order publication; ids identity changes and the list renders exactly once                                                                                                                                     | same calibrated gate for one add/remove at `n=1,000`                                                                                    |
| Ordinary editor document commit                | zero Yjs relative-position resolutions; existing Plite Anchors map affected-root endpoints and the adapter publishes only ids whose resolved points changed                                                                               | calibrated `n=1,000` p95 stays within the reviewed noise-adjusted threshold and below one frame                                         |
| Anchor drop / bridge fallback / root lifecycle | re-resolve the affected root bucket from raw Yjs endpoints, match the direct Yjs oracle, and increment an explicit fallback counter; never run independent output scans                                                                   | work and resolution count bounded by cursors in affected roots; fallback frequency is saved in the artifact                             |
| Scroll/viewport/root layout                    | one coalesced scheduler flush and `O(m)` DOM reads; an unmounted cursor is not measured                                                                                                                                                   | `n=1,000`, `m<=40` p95 stays within 20% of baseline and below the recorded one-frame budget                                             |
| One logical Widget changes                     | ids snapshot identity remains stable; the list listener check causes zero list render; only its item and mounted geometry subscribers may wake                                                                                            | one item wake and at most one geometry wake                                                                                             |
| Find query on 100k text                        | urgent input publishes query/request state only; deferred work performs one matcher read, one result-owner publication, one Decoration projection, and zero editor operations/history entries                                             | deferred controlled-lane p95 stays within 20% of baseline and below the recorded one-frame budget                                       |
| Find next/previous with 10k matches            | zero matcher/source reads and at most old/new active-match subscriber groups wake                                                                                                                                                         | controlled-lane p95 stays within 20% of baseline and below the recorded one-frame budget; no editor operation until `commitActiveMatch` |
| Teardown                                       | all mapped endpoints, source/store subscriptions, observed target refs, and scheduler registrations released                                                                                                                              | zero retained registrations after 1,000-cursor unmount/reconnect loop                                                                   |

The old 4/8/16 ms figures were false precision before a harness existed. The
implementation first records environment metadata and at least 30 warm samples
on one controlled benchmark lane; deterministic operation/subscription counters
remain hard gates everywhere, while duration becomes a hard gate only after the
baseline is reviewed. The failure threshold is the larger of 20% over baseline
or the calibrated noise band, while the recorded one-frame budget remains
absolute.
A later baseline update requires the saved before/after artifact and an accepted
explanation, never a blind snapshot rewrite. Timings stay report-only on shared
or uncalibrated CI runners.

Listener counts stay constant per `(editor, ownerDocument)` coordinator: one
capture scroll listener, one window resize listener, at most two
`visualViewport` listeners, one shared ResizeObserver, and at most one private
position observer. Observed Editable/target elements may scale with mounted
scopes, but observer instances may not. Bundle proof is consumer-scenario based,
not inferred from a namespace
entrypoint size: headless `platejs` contains zero geometry bytes; an unrelated
`platejs/react` consumer has exactly zero normalized geometry delta after DCE;
a consumer that imports Widget geometry adds at most 8 KiB minified+gzip; the
Yjs cursor-adapter scenario adds at most 10 KiB excluding the peer; and base
React scenarios contain neither Yjs nor Floating UI. Any budget change requires
an accepted objection plus a saved before/after artifact, not a baseline
overwrite.

### TDD tracer sequence

Implementation proceeds vertically; each tracer starts RED through the public
behavior it owns, turns GREEN, and preserves the previous tracers:

1. `widget-layer-contract`: item-only publication preserves `allIds` identity
   and causes zero `usePliteWidgetIds` list render through the existing store
   subscription; reorder/membership renders once; collapsed selection is
   logically available.
2. `widget-geometry-contract`: selection, node, and annotation targets obey
   their exact rect/focus semantics; `store.editor` plus a required
   `editableRef` works through a portal and for a structural integration store;
   duplicate same-root Editable views produce independent scoped snapshots,
   cross-editor/wrong-root refs fail closed, server render stays null, and
   client mount schedules one read. Plate sibling-slot type/runtime tests prove
   each `PlateContent` supplies its local ref, container slots receive their
   container ref, and `PlateStatic` invokes no Editable sibling renderer.
3. `widget-geometry-contract` plus browser fixture: scroll, viewport/root resize,
   target resize, and virtualized partial/full mount/unmount use one coordinator;
   focus geometry resolves independently; only mounted registered ids wake.
4. `yjs/awareness-contract`: exact added/updated/removed ids reach the stateful
   private awareness adapter; one changed client is decoded once, a changed
   selection runs at most one cursor-resolution pass with at most two endpoint
   conversions, and a metadata-only update runs none; provider reset invokes
   its private full rebuild; the public zero-argument subscription type is
   unchanged.
5. `yjs/react-contract`: per-client data, Decoration, and Widget adapters share
   one cache; a host render is not the refresh mechanism; existing Plite
   Anchors map ordinary commits without another Yjs resolution; fallback/root
   lifecycle re-resolves exactly one affected root bucket.
6. collaboration browser fixture: forward/backward/RTL multiline selection
   paints every visible line and places one caret/label at the focus endpoint;
   removal and virtualization leave no stale DOM.
7. registry retained-selection unit plus exact #5091 browser path: marked focus
   transfer leaves exactly one expanded fill or collapsed caret, then refocus
   and typing restore native behavior with no timeout.
8. Find result-owner/source unit: one scan feeds the canonical range list,
   highlights, count, ordering, and navigation; no logical range is recovered
   from projection slices; marked leaves/inline descendants match; blocks never
   join; requested index derives safely through edits; installing Find beside
   Yjs preserves both plugin outputs without app-root carrier wiring.
9. Find browser route: seed, shortcut, deferred typing, wrap navigation,
   accessible count, semantic `commitActiveMatch`, Escape, scroll, and zero
   document/history mutation before that commit.
10. existing floating-toolbar/link browser owner: mouse/keyboard selection,
    retained input focus, insert/edit modes, outside click, Escape, scroll, and
    resize consume Widget geometry without editor-version refresh effects.
11. packed/runtime proof: removed exports are absent from the manifest, every
    surviving entry imports/renders in its declared runtime lane, declarations
    resolve, unrelated React consumers DCE all geometry, opted-in consumer
    bundle budgets pass, and no forbidden dependency is reachable.

Tests do not assert that dead symbol names throw. Export/manifest and packed
consumer proofs own the hard cut; behavior tests describe only the surviving
contract.

## Editor-behavior output map

| Output                                                     | Current finding                                                                                                                | Exact execution output                                                                                                                                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/editor-behavior/markdown-standards.md`               | No Markdown authority winner changes.                                                                                          | No change: the completed research pass found no cross-family authority shift.                                                                                                       |
| `docs/editor-behavior/markdown-editing-spec.md`            | Already locks Yjs presence/remote cursors as runtime collaboration state and Find/Replace as deferred document-navigation law. | Contract freeze specifies multiline remote fill/focus caret, exact retained selection, and the bounded Find packet; Replace remains deferred and is never described as shipped.     |
| `docs/editor-behavior/editor-protocol-matrix.md`           | Already contains specified Yjs and deferred Find/Replace rows. The current plan cannot claim these owners are absent.          | Contract freeze adds the six user-observable rows below as `specified`; Replace and broader Search stay deferred. Runtime/SSR/subscription/install contracts remain outside it.     |
| `docs/editor-behavior/markdown-parity-matrix.md`           | Already lists Yjs collaboration overlays and explicitly routes Search/Find-Replace outside the closed Markdown gate.           | Implementation closure records proved Yjs evidence/status and the bounded Find packet while keeping Search cross-surface and Replace deferred.                                      |
| `docs/editor-behavior/master-roadmap.md`                   | Already owns Lane 5 Search/Find-Replace and Lane 6 collaboration/editor-only work.                                             | Contract freeze orders the Find foundation and Yjs cursor cache/adapters first; Replace, discussion, and broader collaboration work remain explicit later work in their same lanes. |
| `docs/editor-behavior/markdown-editing-reference-audit.md` | The completed research pass found no external winner shift.                                                                    | No change; the compiled research page and log already record the architecture evidence.                                                                                             |

Pass-4 law reconciliation:

- This plan does not erase locked Replace behavior. It removes a package that
  never implemented Replace and limits the first execution packet to Find.
- This plan does not invent a new collaboration family. It supplies the
  Decoration/Widget implementation shape for the existing Yjs law.
- Readable law, protocol, parity, and roadmap are required implementation
  outputs, not optional documentation cleanup.
- This planning goal does not edit current behavior law because it ships no
  behavior and its named deliverable is this implementation-ready plan. The
  later execution goal's contract-freeze phase updates readable law, protocol,
  and roadmap before runtime code; implementation closure updates parity/status
  only from executable evidence. `specified` never means `shipped`.

Proposed protocol rows:

| ID                          | Context / input                                                                                   | Expected                                                                                                                       | Initial status and proof owner                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `EDIT-SELECTION-RETAIN-001` | expanded or collapsed editor selection; focus enters `[data-plite-keep-selection-visible]` chrome | keep exactly one visual selection while model selection survives and native focus leaves; refocus restores normal native paint | `specified`; Plite React DOM contract, copied Editor unit, and exact #5091 browser row |
| `EDIT-COLLAB-CURSOR-001`    | remote forward/backward/RTL multiline selection                                                   | Decoration paints every visible segment; one caret/label follows the logical focus endpoint                                    | `specified`; Yjs React contract plus collaboration browser route                                |
| `EDIT-SEARCH-FIND-001`      | `Mod+F` with collapsed or expanded selection                                                      | open current-file Find, seeding from selected text when expanded, without document/schema/history mutation                     | existing wildcard narrowed to `specified`; Find controller/browser                              |
| `EDIT-SEARCH-FIND-002`      | Enter / Shift+Enter or next / previous with matches                                               | wrap through ordered matches, keep Find input focus, scroll and mark the active result, and do not rescan                      | existing wildcard narrowed to `specified`; Find unit/browser/stress                             |
| `EDIT-SEARCH-FIND-003`      | copied UI invokes semantic `commitActiveMatch` for the active result                              | set and focus the editor selection at that range while preserving document structure; no dedicated button is required          | existing wildcard narrowed to `specified`; Find controller/browser                              |
| `EDIT-SEARCH-FIND-004`      | query or document text changes                                                                    | recompute one shared match source, clamp the effective result synchronously, and never join separate block roots               | existing wildcard narrowed to `specified`; pure matcher/source/browser                          |

Runtime/package proof contracts, deliberately outside the editor behavior
matrix:

| ID                                   | Contract                                                                                                                                                                                                                                                                                                                    | Proof owner                                         |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `PLITE-WIDGET-GEOMETRY-001`          | mounted selection/node/annotation geometry follows `store.editor` plus an exact `editableRef`, fails closed for invalid scope, never unions views/documents, and is null on the server                                                                                                                                      | Plite React unit plus browser geometry fixture      |
| `PLITE-WIDGET-SUBSCRIPTION-001`      | stable membership preserves ids identity and wakes no unrelated item/geometry subscriber                                                                                                                                                                                                                                    | deterministic Widget store counters                 |
| `PLATE-EDITABLE-SIBLING-SCOPE-001`   | every dynamic editable sibling receives its local `editableRef`, container siblings receive `containerRef`, and `PlateStatic` invokes no Editable sibling renderer                                                                                                                                                          | Plate type/unit plus static/SSR fixtures            |
| `PLATE-YJS-CURSOR-PROJECTION-001`    | exact awareness ids, one decode and at most one cursor-resolution pass per changed client, zero duplicate endpoint conversions, Plite Anchor/direct-Yjs oracle equivalence, affected-root fallback, and no host-render pipeline hold at 1/100/1,000 clients                                                                 | Yjs core/React property and stress contracts        |
| `PLATE-RUNTIME-SSR-001`              | surviving React/Yjs/Widget/Find consumers import and SSR-render with no DOM/timer/request-shared state or hydration mismatch                                                                                                                                                                                                | runtime-lane SSR fixtures                           |
| `PLATE-ENTRYPOINT-DAG-001`           | source, runtime, declarations, optional peers, DCE, and size budgets obey the accepted DAG                                                                                                                                                                                                                                  | Oxlint plus packed release-artifact checker         |
| `PLATE-REGISTRY-INSTALL-CLOSURE-001` | `find`, `use-widget-floating`, and `remote-cursor-overlay` each install and compile independently with direct package/registry dependencies; `Editor` consumes the proxied inactive-selection prop without a retention install item; installing Find and Yjs plugins preserves both outputs without app-root carrier wiring | registry checker plus isolated copied-item fixtures |

## Implementation-skill review matrix

| Lens                 | Applies | Current status | Applied result                                                                                                                                                                        |
| -------------------- | ------: | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| north-star           |     yes | complete       | Reaffirmed Core/Plite/integration/registry ownership; removed the unearned raw-Range Widget target and kept Plite product-agnostic.                                                   |
| shadcn / `plate-ui`  |     yes | complete       | Existing InputGroup/Button/Tooltip primitives cover Find; all visuals stay copied; a registry-local Floating helper is justified by two consumers.                                    |
| Vercel React         |     yes | complete       | Split ids, item, and exact-view geometry subscriptions; list children read their own ids; active Find state wakes only old/new match segments; unrelated consumers must DCE geometry. |
| `react-useeffect`    |     yes | complete       | Query/index/visibility remain state or derivation; effects are limited to external subscriptions, observers, scheduling, and Floating UI synchronization.                             |
| performance-oracle   |     yes | complete       | Added `n/m/k` complexity law, constant listener counts, 100/1,000-cursor counters, calibrated timing policy, memory gates, and consumer-scenario bundle budgets.                      |
| tdd                  |     yes | complete       | Fixed eleven vertical RED/GREEN tracers through surviving behavior; dead-name removal assertions are rejected.                                                                        |
| feasibility reviewer |     yes | complete       | Traced happy/nil/empty/error paths and forced exact-ref multi-Editable, remote-import publication, Find failure, migration, and rollback behavior.                                    |
| adversarial reviewer |     yes | complete       | Falsified hidden store branding and a bespoke Yjs mapper; added load-bearing spikes, kill criteria, and the do-nothing/direct-resolution fallback baseline.                           |

## Scheduled browser, stress, parity, and regression strategy

Named contracts exist now so the later protocol pass can refine rather than
invent them:

1. Headless import/execute: import every non-React public entrypoint with
   `document`, `window`, `HTMLElement`, `DOMRect`, and `ResizeObserver` absent;
   execute pure matching plus Yjs cursor state without React or DOM.
2. SSR/static: render every React-static entrypoint and retained-selection/
   Widget/Find consumer to HTML without DOM access, timers, request-shared
   mutable state, or hydration mismatch. Client-only geometry reads a null
   `editableRef` on the server/first client snapshot. `PlateStatic` never
   invokes before/after Editable sibling renderers; SSR of interactive
   `PlateContent` passes a stable null ref until commit.
3. Retained selection: exact #5091 mouse path; focus a
   `[data-plite-keep-selection-visible]` control; native selection is empty; exactly
   one expanded fill or collapsed caret remains; refocus and type. Multi-cell
   table selection and AI-streaming composition do not add a second layer.
4. Find: matches across marked leaves and inline elements, never across block
   roots; selected text seeds the query; live insert/delete updates one
   canonical result owner and its Decoration source; next/previous wraps and
   uses navigation feedback without recovering ranges from projection slices;
   query/index never enter document data, schema, operations, or history. In a
   Find+Yjs route, both installed plugins remain active and neither feature
   drops or double-renders the other's paint.
   Replace is not in this packet.
5. Remote cursor: collapsed and multiline forward/backward/RTL selections;
   decorations paint every line; the label follows the focus edge; awareness
   removal leaves no stale DOM.
6. Geometry invalidation: exact-ref duplicate views, cross-editor/wrong-root
   rejection, ref replacement, nested scroll roots, capture scroll, window and
   `visualViewport` resize/scroll, root/target resize, position-only root layout
   shift/static transform, virtualized mount/unmount, browser zoom, and editor
   commit each settle in one scheduler cycle. Continuously animated ancestor
   transforms are explicitly outside the contract and must not introduce a
   global frame loop.
7. Floating toolbar/link: mouse selection, keyboard selection, editor-to-input
   focus transfer, edit/insert link modes, outside click, Escape, scroll, and
   resize preserve focus and placement.
8. Stress: 100 and 1,000 cursor targets; awareness changes refresh stores without
   rendering the host; one changed client causes one decode and at most one
   cursor-resolution pass containing at most two endpoint conversions, with no
   duplicate conversions across data, Decoration, and Widget outputs; changing
   one logical cursor preserves ids identity and causes
   zero list/host render or unrelated item/geometry wake; membership changes
   render the list once;
   layout invalidation reads only mounted registered ids. Record changed-client,
   cursor-decode, cursor-resolution-pass, endpoint-conversion, anchor-map,
   source-read, geometry-read,
   scheduler-flush, changed-id, each subscriber class, full-fallback, and
   host-render counters separately.
9. Packed consumer and entrypoint DAG: removed entries are absent from exports;
   all surviving runtime/declaration graphs resolve; `platejs` stays headless,
   `platejs/react` stays SSR-safe, `platejs/yjs/react` may depend on both Yjs and
   React lanes, and reverse imports are forbidden. Base bundles reach neither
   Yjs nor `@floating-ui/react`; an unrelated React consumer has zero normalized
   geometry delta after DCE; reviewed opt-in size budgets pass.

## High-risk deliberate-mode verdict

Depth: deep. This plan is over 18,000 words, changes more than ten public or
runtime contracts, removes three entrypoints, introduces a browser geometry
engine, and changes collaboration projection. Passing ordinary API review is
not enough.

The pre-mortem found two load-bearing design errors and repaired them before
implementation:

1. Hidden Widget-store branding was incompatible with the public structural
   `PliteWidgetStore` interface and the planned Yjs integration store. The
   store now exposes `readonly editor`; geometry has no secret owner handshake.
2. A bespoke Yjs endpoint mapper duplicated Plite's existing root-aware,
   association-aware Anchor engine. The adapter now owns raw Yjs endpoints plus
   Plite `Anchor<Point>` endpoints and uses direct Yjs resolution only for
   awareness reads, lifecycle rebuilds, explicit fallback, and the oracle.

The pass also proved that one editor can own multiple connected Editable
runtimes and that one node key can have multiple mounted DOM bindings
(`editable-dom-runtime.ts:53-149,602-903`,
`use-plite-node-ref.tsx:20-130,720-810`, and
`plite-runtime-provider-contract.test.tsx:436-484`). Pass 6 initially answered
that fact with a focused/last-focused/mount-order winner. Ecosystem pressure
rejected that answer: it hid product policy in Plite and gave mirrored-view app
authors no exact scope. The current target requires an `editableRef`; it must
never call `getMountedEditableDOMRuntime(editor)[0]`, guess an active view, or
union rectangles from separate views or documents.

### Pre-mortem and containment matrix

| Failure                                                             | Why it is plausible in current source                                                                                                              | Containment / implementation order                                                                                                                                                                                                                      | Hard falsifier                                                                                                              |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Hidden store branding rejects the Yjs adapter or third-party stores | Widget stores are public structural types, while the Yjs adapter will not be created by `usePliteWidgetStore`                                      | Add `readonly editor` to the store contract and every implementation before geometry; publish no registration API or WeakMap brand                                                                                                                      | A structural store with the right editor cannot render geometry through a portal                                            |
| Same editor/root mounted twice anchors to a random DOM copy         | Plite deliberately tracks a `Set<EditableDOMRuntime>` and multiple DOM elements per node key; a singular implicit resolver would encode app policy | Require the caller's stable `editableRef`; resolve only the runtime registered to that editor/ref; key and publish each explicit view independently                                                                                                     | A ref measures another view/editor, rectangles mix documents, or unmount leaves the old view published                      |
| Yjs mapped endpoints diverge from `RelativePosition.assoc`          | Yjs uses `assoc = -1` at text end and `0` elsewhere; split/merge/move/delete and normalization can disagree with a hand-written mapper             | Reuse Plite Anchors with association derived from `assoc`; build the direct-Yjs randomized oracle before enabling the zero-resolution path                                                                                                              | Any mapped endpoint differs from direct Yjs resolution after the matching Yjs transaction                                   |
| Correctness fallback silently becomes the ordinary path             | Controller bridge reconciliation and root lifecycle can invalidate cached endpoint assumptions                                                     | Count direct resolutions and `fullFallbackCount`; fall back only per affected root after bridge fallback, root create/delete, reconnect/replacement, anchor drop, or mapping error                                                                      | An ordinary supported commit performs a direct Yjs resolution, or one fallback scans unaffected roots                       |
| Remote imports never publish Anchor changes                         | `handleCommit` returns early while `editorAdapter.importing()` or for `collaboration` tags                                                         | Invoke adapter publication after local Yjs transaction completion and after remote `applyRemote` completion, with exact affected roots; do not rely on the early-returning generic commit branch                                                        | A remote insert moves the direct oracle but no Decoration/Widget subscriber wakes                                           |
| Awareness reconnect exposes stale clients                           | Provider lifecycle currently only bumps a scalar revision and clears local selection                                                               | Full rebuild adapter membership before generic revision publication on connect/disconnect/replacement; release old Anchors before publishing the new snapshot                                                                                           | Removed provider clients remain addressable for one render or old Anchors remain retained                                   |
| Geometry goes stale under partial DOM or view replacement           | DOM ranges can be missing while coverage is virtualized; roots and node bindings can move independently                                            | Resolve currently mounted line boxes and focus independently; discard disconnected reads before publish; dirty ids on binding/root lifecycle; re-resolve only inside the caller's exact runtime/ref in the same scheduled cycle, otherwise publish null | A removed host's rect survives one scheduler flush, partial geometry claims full truth, or another view is used as fallback |
| Observer policy becomes an idle frame loop                          | Existing Cursor/Yjs hooks use local rAF/listeners; transformed ancestors are hard to observe                                                       | One coordinator per `(editor, ownerDocument)` with ref-counted exact-view registrations; scheduler-coalesced event/observer dirtiness; static layout shift must pass a browser spike; animated transforms stay outside the contract                     | One timer/rAF/observer appears per Widget/view or reads scale with unmounted ids                                            |
| StrictMode/Suspense leaks coordinators or request state             | Widget stores already use delayed destruction to survive React lifecycle churn                                                                     | Runtime owns coordinator; activation/cleanup is idempotent; no module-global mutable snapshot; abort/unmount releases stores, Anchors, observers, listeners, and scheduled tasks                                                                        | Two listeners survive one StrictMode mount, or SSR requests share geometry/cache state                                      |
| Find publishes results from the wrong query/editor revision         | Deferred query and document commits can interleave; Decoration refresh can feed back into React                                                    | One monotonic result epoch captures query + editor snapshot, scans once, publishes canonical ranges, then refreshes Decoration without rereading; stale epochs cannot publish                                                                           | A slower old query replaces a newer result list, or one epoch invokes the matcher twice                                     |
| Find error leaves stale highlights that look authoritative          | Source callbacks can throw and the copied controller otherwise has no error contract                                                               | Fail the epoch closed: publish zero results, clear active id, set an error status, report through the copied component's error owner, retain the user's input                                                                                           | Count/paint/navigation still expose the prior epoch after an exception                                                      |
| Retention paints the wrong mirrored view or duplicates native paint | Focus can leave the Editable for copied chrome while several runtimes remain connected                                                             | `EditableSiblingProps.editableRef` scopes the copied retention renderer to its own view; registry stores only retention policy, never a Range; native focus suppresses retained paint                                                                   | More than one retained/native layer is visible in one view, or one ref paints another view                                  |
| Floating UI and geometry both own reference invalidation            | Current wrappers observe reference movement and editor revisions independently                                                                     | Geometry owns reference scroll/resize/layout revisions; copied Floating helper observes floating-element size only; prove nested clipping and zoom                                                                                                      | Duplicate ancestor listeners survive or placement lags one geometry revision                                                |
| Atomic deletion misses a generated or declaration edge              | The three entries appear in exports, source imports, docs/API metadata, aliases, Turbo/Oxlint maps, and packed artifacts                           | Migrate replacements first, then delete every old owner in one final publishable diff; generated and packed checks are blockers                                                                                                                         | Any removed path remains reachable from runtime, declarations, generated docs, aliases, or manifests                        |
| Timing/bundle gates become baseline theater                         | Shared CI timing varies and namespace bundle size does not prove DCE                                                                               | Structural counters and dependency reachability are hard everywhere; timing is hard only on the calibrated lane; scenario bundles test exact imports                                                                                                    | Baseline changes without saved before/after evidence, or unrelated React geometry delta is nonzero                          |

### Happy, nil, empty, and error paths

| Flow                      | Happy                                                                | Nil                                                        | Empty                                                                                        | Error / required result                                                                                                                         |
| ------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Widget logical resolution | target resolves against `store.editor`                               | unknown/removed id returns null                            | collapsed selection is available with an empty rect list                                     | source fault preserves fault-boundary status; geometry never fabricates a target                                                                |
| Widget geometry           | explicitly scoped mounted host publishes immutable viewport rects    | available target with no mounted host returns null         | partial virtualization may publish only mounted line boxes; collapsed caret uses `rects: []` | disconnected/throwing DOM read is discarded, reports one diagnostic, and may retry on the next real invalidation; no stale snapshot             |
| Multiple Editable views   | each exact registered `editableRef` resolves its own snapshot        | null/disconnected/cross-editor/wrong-root ref returns null | two explicit refs may render the same logical Widget once per view                           | cross-document union or implicit fallback to another view is forbidden                                                                          |
| Awareness change          | exact changed ids rebuild their cached entities once                 | no awareness/provider disconnected exposes an empty list   | awareness with zero remote states preserves one stable empty ids snapshot                    | malformed data is omitted; invalid selection retains client/data with no Decoration and unavailable Widget; one bad client cannot poison others |
| Yjs document commit       | affected-root Anchors map and changed ids publish                    | commit touches no cursor root: zero cursor publication     | root bucket with zero cursors does zero endpoint work                                        | bridge/root fallback re-resolves that root; mapping failure fails closed for its selection and increments fallback/error metrics                |
| Find query                | one epoch supplies ordered ranges, Decoration, count, and navigation | absent seed selection leaves the input unchanged/empty     | empty query performs zero matcher reads; zero results has no effective index                 | failed epoch clears results and exposes copied UI error state; stale epochs cannot publish                                                      |
| Inactive selection        | exact Editable focus transition keeps one visual model selection     | model selection null produces no inactive paint            | collapsed caret and expanded fill come from the same exact-view renderer                     | window blur, destroyed editor, removed marker, or invalid target clears activation; no timeout or state repair                                  |
| Floating consumer         | one virtual reference follows geometry revision                      | null geometry keeps the UI closed/unpositioned             | zero-width caret with usable height remains valid                                            | Floating failure stays copied UI-local and cannot mutate Widget or editor state                                                                 |
| SSR/headless              | headless matching/Yjs execute; React-static renders null geometry    | no DOM globals or optional peer on unrelated entries       | server/client initial geometry snapshots are both null                                       | any import-time DOM access, timer, hydration mismatch, or request-shared state fails the runtime lane                                           |
| Hard cut                  | migrated consumers use surviving entries                             | no serialized-data migration exists                        | no old imports yields no compatibility code                                                  | third-party old imports fail at compile/load by design; rollback is package version/revert, never an alias                                      |

### Migration and cutover order

1. Freeze public types and the protocol/runtime rows. Add compile-time examples
   for `store.editor`, Widget names, required `editableRef`, truthful Plate
   sibling-slot props, and both Yjs hooks.
2. Build two disposable spikes before product migration: the explicit-ref
   duplicate same-root Editable geometry tracer and the randomized Plite-Anchor
   versus direct-Yjs oracle. A failed spike revises the private mechanism; it
   does not create a compatibility API.
3. Add Plite Widget repairs, geometry, metrics, and headless/SSR/browser proofs
   while old Plate entries still exist. No old consumer points at the new path
   yet.
4. Extend `YjsAwarenessAdapter`, migrate remote cursor outputs, then migrate
   copied retention, Find, toolbar, and link consumers. Replacement browser
   rows must be red before the migration and green after it.
5. In one final publishable diff, delete the three exports and their source,
   remove every internal import/dependency, regenerate barrels/API metadata,
   update entrypoint/Turbo/Oxlint/manifests and source-only docs, and add the
   release artifacts. `templates/**` remains CI-generated and is never edited
   manually.
6. Run the complete headless, SSR, browser, stress, packed-consumer,
   declaration, DCE, optional-peer, size, and stale-reference matrix before a
   prerelease candidate. Stable publication is blocked on that same immutable
   artifact, not a rebuilt approximation.

Release classification is explicit: the Plite Widget rename/editor field and
the Plate public entrypoint removals are breaking package changes, so
implementation needs separate `major` changesets for `plitejs` and `platejs`
relative to current `main`. Copied registry behavior gets the registry
changelog owner rather than a package changeset. There is no data migration.

Rollback is intentionally boring:

- before publish: revert the atomic cut;
- after prerelease: publish a corrected prerelease from the same API contract;
- after stable: consumers pin the prior package version while maintainers
  revert/correct the whole release;
- never restore a forwarding entrypoint, alias, dual runtime, or copied Range
  path as a rollback mechanism.

### Blast radius and proof owners

| Radius               | Exact implementation obligation                                                                                                                                           | Proof owner                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `plitejs/react`      | Widget target rename, `store.editor`, ids hook, exact-Editable geometry coordinator, DOM-binding validation, metrics, SSR snapshot                                        | Widget unit/type + runtime browser fixtures                        |
| `platejs/react`      | truthful editable/container sibling prop types, exact local refs, and dynamic-only sibling rendering outside `PlateStatic`                                                | plugin type/unit + static/SSR fixtures                             |
| `platejs/yjs`        | awareness cache/index, Plite Anchors, root buckets, provider/root/fallback lifecycle, public scalar callback unchanged                                                    | headless Yjs unit/property/stress                                  |
| `platejs/yjs/react`  | Decoration and Widget adapters over one cache; no host revision render or bespoke geometry                                                                                | React/SSR/collaboration browser                                    |
| copied registry      | retained selection, local `find` plugin/controller/UI kit, remote cursor presentation over Yjs domain reads, copied Floating hook/dependency closure, AI/table exclusions | registry unit/accessibility/install/coexistence/browser/changelog  |
| `platejs` topology   | delete cursor/find/floating exports and dependencies; keep optional peers isolated                                                                                        | generated Oxlint DAG + manifests + declarations + packed consumers |
| Turbo/CI             | scoped Plite React, Yjs, registry, runtime-lane, and consumer-bundle tasks with exact inputs and upstream entrypoint dependencies                                         | entrypoint Turbo checker and cache-hit/invalidation fixture        |
| docs/API metadata    | latest-state imports and lifetime guide only; migration prose only in release artifact                                                                                    | stale-reference search + docs build/API generation                 |
| downstream ecosystem | explicit import/API mapping; no shim                                                                                                                                      | packed third-party-style compile fixtures                          |

### High-risk kill criteria

- Do not publish geometry if the same-root Editable tracer cannot bind each
  required `editableRef` to exactly one runtime, reject cross-editor/wrong-root
  refs, and clear replacement/unmount without cross-document rects.
- Do not enable zero-resolution Yjs mapping if any randomized operation differs
  from the direct Yjs oracle. Keep one shared direct-resolution cache while the
  private optimization is repaired; do not resurrect duplicate React pipelines.
- Do not delete `platejs/cursor/react` until retained-selection and remote-cursor
  replacement browser rows pass against the exact final artifact.
- Do not delete `platejs/find-replace` until one-scan epochs, stale-epoch
  suppression, failure clearing, navigation, and history immutability pass.
- Do not delete `platejs/floating/react` until toolbar/link clipping, focus,
  scroll, resize, zoom, and listener-count rows pass with direct Floating UI.
- Do not make timing a universal CI gate; a noisy runner is not evidence.
- Do not release if a base `platejs`/`platejs/react` consumer reaches Yjs,
  Floating UI, or Widget geometry after tree shaking.

Pass-6 delta: revise hidden store branding to explicit `store.editor`; replace
the proposed endpoint mapper with existing Plite Anchors; initially propose an
implicit deterministic multi-Editable winner; and add nil/empty/error law, Yjs
oracle/fallback order, atomic cutover, explicit major-release/rollback policy,
scoped Turbo/CI blast radius, and kill criteria. Pass 7 superseded only that
implicit winner with exact-ref scope. No behavior-law file changed in this
planning pass.

## Ecosystem maintainer verdict

Pass 7 keeps the lifetime split, Yjs owner, copied product UI, and three hard
cuts. It rejects one pass-6 answer: Plite cannot choose a focused,
last-focused, or mount-order view on behalf of applications. That policy is
both lossy and impossible for a plugin renderer to override cleanly. The exact
Editable is now an explicit input.

Live ecosystem facts:

- `PliteWidgetStore` is a public structural interface, but the merged repo has
  no independent structural implementation: public production creation goes
  through `usePliteWidgetStore`; other matches are Plite tests, type smoke, and
  examples (`widget-store.ts:72-85`, `use-plite-widget-store.tsx:40-111`, and
  the bounded source-only consumer manifest). Unknown third-party adoption is
  not claimed. A packed structural fixture stands in for compatibility proof.
- `PlateContent` already owns an exact local `editableRef`, but
  `EditableSiblingComponent` receives only generic Editable props and
  `PlateStatic` invokes before/after Editable renderers without any Editable
  (`PlateContent.tsx:299-382`, `PlatePlugin.ts:92-94`,
  `PlateStatic.tsx:299-356`). That is the missing plugin extension point.
- `PlateProps.decorationSources` and `Editable.renderSegment` are existing
  advanced carrier boundaries (`Plate.tsx:51-60,210-245`). Normal installed
  Plate plugins do not pass them from the app root: the Plate compiler lowers
  plugin decoration/render contributions privately. Explicit props remain for
  custom app-owned sources and renderers only.
- The registry checker follows copied imports, registry dependencies, and
  package dependencies transitively and rejects missing direct ownership
  (`apps/www/scripts/check-registry-source.mts:430-650`). A shared copied helper
  therefore needs its own registry item; a comment saying “install the peer” is
  not install closure.
- Yjs already exposes the extension points that matter: provider/awareness
  interfaces, configurable field names, `YjsCursorDataSchema`, typed cursor
  metadata, cursor reads, and a zero-argument awareness subscription
  (`yjs/core/types.ts:5-78,88-104,148-195`). None needs a compatibility wrapper.

Canonical extension and adoption surface:

| Owner                   | Exact extension point                                                                                   | App/plugin customization and opt-out                                                                                                    | Migration surface                                                                                                                                        | Closure proof                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Plite Widget            | structural `PliteWidgetStore` with `readonly editor`; `usePliteWidgetIds`; per-id item hook             | implement the structural store or use the React hook; omit a Widget or geometry subscriber to opt out                                   | rename `anchor -> target`, `visible -> available`; add `editor`; collapsed selection becomes available                                                   | public type/JSDoc, official-store and packed custom-store fixtures, stable ids/item counters                                     |
| Plite geometry          | `useSelectionGeometry({ editableRef })`; advanced `usePliteWidgetGeometry(store, id, { editableRef })`  | caller owns the exact ref; common selection UI reads the domain value while app-owned node/annotation Widgets use the generic store     | replace Cursor/Yjs/Floating geometry helpers with immutable exact-view reads; no raw Range target                                                        | portal, duplicate-view per-ref, cross-editor/wrong-root, ref replacement, SSR, browser invalidation, bundle fixtures             |
| Plate plugin projection | `decorate`, `render.leaf`, `EditableSiblingProps.editableRef`, and `ContainerSiblingProps.containerRef` | configure or omit ordinary plugins/kits; raw source/render props remain advanced                                                        | privately lower transient paint; auto-invalidate owning plugin state; stop requiring schema marks and consumer refresh calls; static omits dynamic slots | compiler/type/unit source-scope proof, local-ref unit, `PlateStatic` exclusion, SSR hydration fixture                            |
| Yjs data/collab         | existing provider/awareness options, `YjsCursorDataSchema`, `YjsRemoteCursor`, scalar subscription      | custom metadata validation and Decoration `decorate` callback remain; omit either React adapter independently                           | only the geometry hook is replaced; provider, awareness fields, cursor data, headless cursor reads, and scalar callback stay source-compatible           | custom-schema type/runtime tests, malformed-client isolation, reconnect/root lifecycle, direct-Yjs oracle, no-host-render stress |
| Copied Find             | registry `find` item exporting `FindKit` with one local plugin plus copied toolbar/match UI             | edit copied matcher/UI/actions or omit the kit; normal apps install it with no root source/renderer plumbing                            | delete `FindReplacePlugin`; absorb `search-highlight`; rename `find-replace-demo` to `find-demo`; Replace remains absent                                 | registry install compile, one-scan/stale/error unit, Find+Yjs composition, accessibility/browser/history rows                    |
| Inactive selection      | built-in `Editable` focus lifecycle inherited by `PlateContent`; copied `Editor` marker/style policy    | mark owned focus targets and edit copied styles; no package or registry plugin/kit                                                     | delete `cursor-overlay` and `selection-retention` plugin/kit/item; bind EditorKit through `Editor`; AI no longer imports it                              | Plite React DOM contract, #5091 browser path, multi-view, table/AI exclusions, static exclusion                                  |
| Copied Floating         | registry hook item `use-widget-floating`                                                                | edit Floating options locally or omit link/toolbar items                                                                                | link and floating-toolbar depend on the copied hook; hook declares `@floating-ui/react`; remove both Floating peers from `platejs`                       | registry source/install closure, missing-peer fixture, link/toolbar browser rows, base-bundle reachability                       |
| Remote cursor UI        | existing `remote-cursor-overlay` registry item over Yjs domain reads and Plate plugin projection        | customize label/color/portal locally or omit fill/caret renderers independently; the installed collaboration kit owns their composition | item declares `platejs` and `yjs`; collaboration kit contributes selection paint and passes the exact ref to cursor geometry                             | independent item install, custom schema, Find coexistence, multiline/RTL/browser/teardown rows                                   |

The release migration table is deliberately mechanical:

| Old public/copy-owned surface                                                                 | Target                                                                                                             |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `CursorOverlayPlugin.addCursor/removeCursor`                                                  | exact Editable inactive-selection prop, Plite native drop caret, or app-owned Annotation/Widget by actual lifetime |
| `useCursorOverlayPositions`, `getSelectionRects`, `getCaretPosition`, `getCursorOverlayState` | `useSelectionGeometry`; generic Widget geometry only for app-owned non-selection targets                           |
| `useYjsRemoteCursorOverlayPositions`                                                          | `useYjsRemoteCursorIds`, singular cursor data, and `useYjsRemoteCursorGeometry`                                    |
| `FindReplacePlugin` and plugin `search` state                                                 | copied registry-local `FindKit`; Plate privately composes its decoration/render contribution                       |
| `platejs/floating/react` exports                                                              | direct `@floating-ui/react` inside copied `use-widget-floating`                                                    |
| `render.beforeEditable/afterEditable` guessing global editor DOM                              | supplied `EditableSiblingProps.editableRef`                                                                        |

There is no codemod pretending to infer product intent from arbitrary cursor
ids or raw ranges. Type errors plus the release mapping are the honest migration
mechanism. Current reference docs describe only the surviving shape; migration
prose lives in the two major changesets/release note and registry changelog.

Pass-7 delta plus accepted execution correction: replace the implicit
mounted-view winner with required exact-ref geometry; add a direct selection
read, truthful Plate editable/container sibling props, private plugin
projection lowering, and dynamic-only static behavior; remove normal Find/Yjs
source plumbing; name the `find` and `use-widget-floating` registry owners;
route inactive selection through the exact Editable lifecycle and copied `Editor` marker;
require direct
`yjs`/Floating install closure; preserve Yjs metadata/schema/decorate extension
points; add packed custom-store/plugin/cursor-schema and registry-install proof.
No behavior-law file changed in this planning pass.

## Maintainer objection ledger

This pass treats the most attractive counterproposal as real. A row survives
only when its complexity buys an observable ownership, correctness, or scaling
property. Pass 7 attacked every surviving decision from downstream plugin,
app, docs/test, and collaboration/data ownership and records the resulting
extension point and proof obligations in each row.

### M-01: Keep the lifetime split; do not add `platejs/overlay`

- Change: retire `cursor` as a generic architecture noun and use Decoration,
  Annotation, and Widget by state lifetime.
- Who feels pain: app and plugin authors must classify a feature before choosing
  an API instead of putting every transient UI object into one store.
- Likely objection: "One Overlay API would be easier to discover and render."
- Steelman antithesis: a single overlay registry could offer one add/remove API,
  one renderer, and one place to inspect every cursor, popover, and highlight.
- Tradeoff tension: the chosen model has three nouns and composition between a
  logical Widget and its DOM geometry.
- Why this is not change for change's sake: the current CursorOverlay already
  mixes copied raw ranges, inactive selection, and drag feedback while Plite
  separately owns drop feedback and Decoration projection.
- Evidence: `Current law and readiness state`; `docs/vision/plite.md:217`;
  `packages/platejs/src/react/features/cursor/CursorOverlayPlugin.tsx:4-108`;
  `packages/plitejs/src/react/components/editable.tsx:339-373`.
- Rejected alternative: an Overlay store loses durable-vs-transient semantics,
  puts DOM/product policy near headless state, and would invalidate all outputs
  through one subscription surface.
- Adoption answer: match/selection paint uses Decoration, durable comment-like
  anchors use Annotation, and out-of-flow UI targets use Widget geometry through
  `platejs/react`.
- Docs/example answer: one lifetime decision table plus one minimal example for
  each primitive; no migration alias teaches the rejected noun.
- Regression proof: entrypoint DAG plus Find, Yjs selection, Widget geometry,
  and retained-selection protocol rows.
- Plugin maintainer: expose Decoration, Annotation, and Widget directly; no
  wrapper, renderer registry, or compatibility junk drawer is required.
- App author: choose or omit each lifetime independently and keep product data
  and visuals local; the lifetime table is the only routing rule.
- Docs/test maintainer: one decision table, three minimal examples, and the
  existing projection protocol families stay coherent.
- Collab/data maintainer: operations, snapshots, identity, normalization, and
  conflict behavior are unchanged; Yjs adaptation is covered by M-05.
- Verdict: `keep`.

### M-02: Publish one direct selection read and one advanced view-scoped Widget geometry hook

- Change: add `useSelectionGeometry({ editableRef })` for the common singular
  selection job and retain `usePliteWidgetGeometry(store, id, {
editableRef })` for advanced generic Widget consumers. Keep the coordinator,
  listeners, observers, scheduler, and registration map private.
- Who feels pain: Plite maintainers inherit a browser geometry engine and its
  SSR/virtualization proof burden.
- Likely objection: "This is a lot of substrate for copied toolbar code; let
  Floating UI and the Yjs component measure their own ranges."
- Steelman antithesis: registry-local measurement has no public API and lets a
  mature positioning dependency own every browser quirk.
- Tradeoff tension: the chosen hook adds a permanent DOM contract, an explicit
  store editor and Editable ref, view-scoped invalidation machinery, metrics,
  and browser fixtures to Plite React.
- Why this is not change for change's sake: remote caret/label, floating
  toolbar, and link UI are three current consumers that duplicate range reads,
  revision effects, rAF, resize, and scroll handling.
- Evidence: `packages/platejs/src/react/features/cursor/useCursorOverlay.ts:26-157`;
  `packages/platejs/src/yjs/react/useYjs.ts:690-877`;
  `apps/www/src/registry/components/editor/floating-toolbar.tsx:120-250`;
  `apps/www/src/registry/components/editor/link.tsx:280-390`.
- Rejected alternative: per-component measurement cannot enforce one root
  scheduler, mounted-only work, or deduplicated browser listeners.
- Adoption answer: apps create logical stores with `platejs/react`, retain the
  exact Editable ref they render beside, subscribe by id/ref, and pass immutable
  rects to their renderer or positioning library. Plate render siblings receive
  the local ref directly.
- Docs/example answer: selection, node, and annotation examples state exact
  `rects`/`boundingRect`/`focusRect` semantics, explain partial virtualized
  viewport evidence, and show null-on-server behavior.
- Regression proof: `PLITE-WIDGET-GEOMETRY-001`, structural integration-store
  unit, portal fixture, duplicate same-root Editable per-ref fixture,
  cross-editor/wrong-root rejection, SSR fixture,
  nested-scroll/layout/virtualization browser tracer, and listener counters.
- Plugin maintainer: `EditableSiblingProps.editableRef` supplies exact scope;
  no provider, public view registry, or geometry-store wrapper is required.
- App author: pass the ref already attached to `Editable`/`PlateContent`, mount
  one renderer per desired view, or omit the hook; portals reuse the same ref.
- Docs/test maintainer: JSDoc and examples name viewport coordinates, ref
  ownership, null cases, partial virtualization, and no cross-view union.
- Collab/data maintainer: geometry reads no collaboration state beyond the
  resolved logical Widget; Yjs remains the owner of remote identity/ranges.
- Affected extension points: `PliteWidgetStore.editor`,
  `usePliteWidgetGeometry`, `EditableSiblingProps`, and structural Widget-store
  adapters. Migration and proof are the pass-7 extension table plus
  `PLITE-WIDGET-GEOMETRY-001` and packed custom-store/plugin fixtures.
- Verdict: `keep`. High-risk revision exposed the editor honestly on every
  Widget store; ecosystem revision replaces the hidden global mounted-view
  winner with a required exact `editableRef`; target-specific and partial-
  virtualization rect semantics remain, and the root-move observer algorithm
  stays private/proof-driven.

### M-03: Add an ids selector, not an ids subscription API

- Change: add only `usePliteWidgetIds`; retain the existing store subscription,
  per-item subscription, and deliberate whole-snapshot API.
- Who feels pain: an item-only update still invokes the one list-store listener
  check even though React observes the same ids snapshot and does not render.
- Likely objection: "Add `getIds`/`subscribeIds` so even that callback is
  membership-only."
- Steelman antithesis: a keyed membership subscriber is maximally narrow and
  makes the no-list-wake counter literal.
- Tradeoff tension: reusing the existing subscription accepts one O(1) listener
  callback per logical update; adding a subscriber class expands every store
  adapter and metric surface forever.
- Why this is not change for change's sake: a list still needs a hook whose
  snapshot is `allIds`, not the whole Widget snapshot; `useSyncExternalStore`
  skips the render when that array identity is unchanged.
- Evidence: `widget-store.ts:273-332` republishes snapshots with
  `mappedSource.getSnapshot().allIds`; `stable-id-mapped-source.ts:276-315`
  keeps the same `state.allIds` when membership/order is unchanged;
  `usePliteWidgets` currently returns the whole snapshot.
- Rejected alternative: `getIds`/`subscribeIds` saves one listener call but adds
  public methods, adapter obligations, and a subscriber index before a measured
  need; a second cursor-list store still duplicates Widget.
- Adoption answer: list owners call `usePliteWidgetIds`; keyed children call
  `usePliteWidget` and optionally `usePliteWidgetGeometry`.
- Docs/example answer: the Yjs renderer example shows ids/item/geometry
  selectors and warns that `usePliteWidgets` is intentionally broad.
- Regression proof: stable ids identity, exactly one list render on reorder,
  zero list render on item/geometry-only changes, at most one list-listener
  check, and 1/100/1,000-item counters.
- Plugin maintainer: custom Widget-store adapters gain no subscription methods;
  preserving `allIds` identity remains the only membership contract.
- App author: lists use the ids hook and keyed children; whole-snapshot reads
  remain available when broad rendering is intentional.
- Docs/test maintainer: selector docs and 1/100/1,000 counters distinguish a
  listener check from a React render.
- Collab/data maintainer: order is deterministic client-id order for Yjs, while
  the generic store preserves source order; no snapshot/data format changes.
- Affected extension points: one new hook over existing `subscribe` and
  `getSnapshot`; custom-store compile and identity/fan-out proofs close it.
- Verdict: `keep`. Plan response: drop `getIds` and `subscribeIds`; keep only
  `usePliteWidgetIds` over existing `subscribe` plus `getSnapshot().allIds`.

### M-04: Reject a raw Range Widget target

- Change: Widget supports annotation, node, and live selection targets only.
- Who feels pain: an app with an arbitrary ephemeral Range cannot pass that
  Range directly to the geometry hook.
- Likely objection: "Range is the universal editor location; refusing it makes
  Widget less useful."
- Steelman antithesis: `{ type: 'range', range }` is easy to learn and could
  anchor spellcheck, search, comments, and custom popovers without creating an
  annotation.
- Tradeoff tension: an ephemeral custom range must either remain a Decoration,
  become a durable Annotation, or use an app-local direct DOM projection.
- Why this is not change for change's sake: a copied Range has no owner for
  rebasing, deletion, affinity, or lifetime; CursorOverlay's timeout repair is
  the current failure mode.
- Evidence: `CursorOverlayPlugin.tsx:4-108`; existing
  `PliteWidgetAnchor` families at `widget-store.ts:30-41`; no maintained
  independent raw-Range consumer in the bounded manifest.
- Rejected alternative: accepting raw ranges now creates a public stale-range
  contract only to serve deleted integration code.
- Adoption answer: durable app ranges enter Annotation; current selection uses
  the selection target; transient inline feedback stays Decoration.
- Docs/example answer: the target reference includes a "which target?" table
  and explicitly excludes copied arbitrary ranges.
- Regression proof: type contracts for the three target families and browser
  geometry coverage for each.
- Plugin maintainer: the three target kinds compose without wrapping core; a
  fourth kind requires a maintained caller and rebasing/deletion law.
- App author: transient ranges use Decoration, durable ranges use Annotation,
  selection uses the selection target, and app-local DOM work remains possible.
- Docs/test maintainer: the target-choice table and type fixtures make the
  exclusion explicit without dead-symbol tests.
- Collab/data maintainer: Annotation/Anchor owns durable identity and deletion;
  Widget introduces no copied Range snapshot or conflict semantics.
- Affected extension points: `PliteWidgetAnchor -> PliteWidgetTarget` and
  `anchor -> target`; the migration table and three-target type/browser matrix
  are mandatory.
- Verdict: `keep`.

### M-05: Extend the existing Yjs awareness adapter; keep it headless

- Change: the existing controller-owned `YjsAwarenessAdapter` becomes the one
  remote-cursor cache/index supplying data reads and React Decoration/Widget
  adapters.
- Who feels pain: the private awareness adapter gains Plite Anchor ownership,
  affected-root indexes, per-client/list subscribers, lifecycle rebuilds, and
  conformance tests; the controller must route events and transaction
  completion into it.
- Likely objection: "Cursor rendering is view code; putting its projection in
  the headless collaboration controller violates layering."
- Steelman antithesis: one React-owned WeakMap per editor keeps the controller
  small and lets hooks resolve selections only while UI is mounted.
- Tradeoff tension: the chosen adapter owns more derived collaboration state and
  Plite Anchors; it must prove those Anchors equal direct Yjs resolution across
  every editor operation family and retain a bounded affected-root fallback.
- Why this is not change for change's sake: the controller alone receives exact
  awareness events and every editor transaction; React ownership would rebuild
  that bridge and can duplicate it across data, fill, and caret consumers.
- Evidence: private `awarenessObserver(event)` already exists at
  `packages/platejs/src/yjs/core/controller.ts:125,242-244`; controller state
  already delegates `remoteCursor(s)` to `YjsAwarenessAdapter` at `:896-899`;
  that adapter owns current cursor decoding at
  `core/awareness-adapter.ts:34-48,150-230`; current React hooks independently
  scan/resolve at `useYjs.ts:559-877`.
- Rejected alternative: a new parallel controller cache duplicates the existing
  adapter; React cache ownership couples correctness to mount lifecycle and
  preserves duplicate resolution or host revision fan-out.
- Adoption answer: public headless cursor data methods and existing React
  `useYjsRemoteCursor(s)` hooks keep their shape; the singular hook becomes
  per-client, the plural hook remains deliberately broad for presence UI, the
  copied cursor layer uses Widget ids/items, and the Decoration hook plus new
  Widget adapter share the same owner.
- Docs/example answer: collaboration docs distinguish singular data, deliberate
  whole-list presence, Decoration fill, and Widget caret/label outputs and
  state that their resolution/cache is private and DOM-free.
- Regression proof: awareness and randomized Anchor/direct-Yjs operation-oracle
  contracts, local/remote affected-root publication, no-host-render stress,
  provider reset/reconnect, SSR import/render, and teardown counters.
- Plugin maintainer: Yjs providers, awareness field names, cursor-data schemas,
  headless cursor reads, and the Decoration `decorate` callback remain the
  supported extension points; no React/Widget/Decoration type enters the core
  adapter.
- App author: install the existing `YjsPlugin`, mount copied presentation when
  wanted, and read cursor ids, one cursor, or exact-view cursor geometry without
  composing raw source or segment-renderer carriers at the app root.
- Docs/test maintainer: collaboration docs show Yjs domain reads, private
  Widget lowering, custom schema/decorate examples, Find coexistence, exact-ref
  rendering, and teardown.
- Collab/data maintainer: client id, raw Yjs endpoints, association, named root,
  validation, provider lifecycle, remote apply, and affected-root publication
  remain deterministic in one controller-owned cache.
- Affected extension points: private `YjsAwarenessAdapter` internals, private
  Widget adaptation, and public cursor-domain reads; provider/schema/state
  contracts stay compatible. The direct-Yjs oracle, malformed-client isolation, provider
  replacement, packed schema fixture, and no-host-render stress are blockers.
- Verdict: `keep`. High-risk revision: extend `YjsAwarenessAdapter` instead of
  adding a parallel controller store; call its state a remote-cursor
  cache/index; reuse headless Plite Anchors for mapped endpoints; and forbid
  React, DOM, Decoration, Annotation, or Widget types in that owner.

### M-06: Drop the public structured awareness callback

- Change: attack widening `subscribeAwareness` to deliver an optional
  `YjsAwarenessChange`.
- Who feels pain: every public state implementation, mock, type test, and plugin
  that implements or wraps the callback contract.
- Likely objection: "You are breaking a public API to feed one private adapter."
- Steelman antithesis: public changed ids could help third-party awareness UI
  avoid full scans and are strictly more informative than a void callback.
- Tradeoff tension: keeping the event private means third-party code cannot use
  it without a later deliberately designed API.
- Why this is not change for change's sake: it is not justified; the private
  observer already receives the event before generic revision publication.
- Evidence: public zero-argument type at
  `packages/platejs/src/yjs/core/types.ts:193`; private event owner at
  `controller.ts:125,242-244`; scalar subscriber publication at `:944-955`.
- Rejected alternative: source-compatible optional parameters still enlarge
  the semantic contract and force lifecycle reset sentinels into public API.
- Adoption answer: none; existing subscribers remain untouched. The private
  cache gets the event directly, and provider lifecycle invokes its private
  full rebuild directly.
- Docs/example answer: no public docs change; internal architecture notes name
  the private event path.
- Regression proof: existing public type tests stay byte-for-byte compatible;
  a core unit proves exact ids reach the private adapter before generic
  listeners.
- Plugin maintainer: public wrappers and mocks retain the zero-argument
  callback exactly; no compatibility overload or reset sentinel is added.
- App author: existing awareness subscriptions keep revision semantics; exact
  ids remain an internal optimization, not a new app event API.
- Docs/test maintainer: no public docs migration exists; a type fixture pins the
  callback and an internal unit pins event-before-revision ordering.
- Collab/data maintainer: provider reset calls the adapter's private rebuild;
  public notification order and cursor reads remain deterministic.
- Verdict: `drop`. The proposed optional callback signature and `undefined`
  reset sentinel were removed from the target.

### M-07: Give Find one canonical result owner

- Change: one registry-local owner retains ordered original match ranges and
  supplies navigation plus the Decoration source.
- Who feels pain: copied Find UI owns a small headless external store instead of
  being a single hook around `usePliteRangeDecorationSource`.
- Likely objection: "The Decoration source is already the source of truth; do
  not add another store."
- Steelman antithesis: attach `{ id, order, range }` to Decoration data and
  deduplicate its public snapshot for count/navigation.
- Tradeoff tension: a private result owner adds lifecycle/subscription code and
  must sequence one scan before one Decoration refresh.
- Why this is not change for change's sake: the public Decoration snapshot is a
  record of `PliteProjectionSlice` values containing only data/start/end/key;
  it has no canonical Range and can repeat data across node/leaf slices.
- Evidence: `packages/plitejs/src/react/projection-store.ts:32-45` distinguishes
  source projections with `range` from public slices without it;
  `decoration-source.ts:58-78` exposes only slice snapshots.
- Rejected alternative: copying the full Range into every slice's data wastes
  memory and makes renderer projection the owner of navigation state.
- Adoption answer: registry callers install one copied `FindKit`; its local
  plugin lowers `decorate` and its render slot through Plate. No package,
  app-root carrier wiring, or public Plite API is added.
- Docs/example answer: the copied Find example explains query, ordered results,
  navigation, loading/error status, and Decoration as outputs of one private
  owner.
- Regression proof: one matcher count per query/text revision, identical
  canonical ranges for navigation and paint, stale-epoch rejection,
  fail-closed error clearing, no scan on next/previous, no document/history
  mutation, and a Find+Yjs route where both plugins render without app-root
  carrier composition.
- Plugin maintainer: the copied local Plate plugin is the ordinary authoring
  unit; reusable substrate stays `NodeApi.findTextRanges` plus private lowered
  Decoration/render carriers.
- App author: install/edit the copied `find` item and add `FindKit`, or build
  another local plugin directly on the pure matcher.
- Docs/test maintainer: `find` and `find-demo` replace misleading
  FindReplace/SearchHighlight names; docs keep Replace separately deferred.
- Collab/data maintainer: N/A: query/results are local ephemeral state and never
  enter operations, snapshots, history, URLs, or remote apply.
- Affected extension points: copied `useFindController`, `FindKit`, and Plate's
  existing plugin `decorate`/render slots; registry install, plugin
  coexistence, one-scan, stale/error, accessibility, and
  history-immutability proofs close it.
- Verdict: `keep`. Plan response: remove every claim that ranges are recovered
  from `PliteDecorationSource.getSnapshot()`.

### M-08: Keep per-id active Find state private and tiny

- Change: next/previous publishes only the old and new active match ids.
- Who feels pain: the registry owns a tiny `useSyncExternalStore`-compatible
  store for one feature.
- Likely objection: "A React `activeId` state/context is much simpler."
- Steelman antithesis: most documents mount few matches, and a context rerender
  is harmless compared with the matcher and editor rendering costs.
- Tradeoff tension: narrow publication adds a bespoke private primitive and
  another stress assertion.
- Why this is not change for change's sake: the accepted 10k-match scenario can
  mount thousands of `renderSegment` consumers; navigation is frequent and
  must not reproject ranges or wake every match.
- Evidence: current Plite search example renders match segments through
  `renderSegment`; the plan's 10k navigation workload and exact subscriber
  counters make the cost falsifiable.
- Rejected alternative: a public generic selection store is overbuilt; global
  context remains allowed only if the tracer proves it meets the same old/new
  wake bound, which is unlikely at 10k mounted matches.
- Adoption answer: keep the store registry-local and unexported; consumers see
  only the Find component/controller behavior.
- Docs/example answer: no public store docs; Find docs describe only active
  result behavior.
- Regression proof: next/previous performs zero matcher/projection reads and
  wakes only old/new mounted result groups.
- Plugin maintainer: no public or plugin API exposes the per-id activity store.
- App author: sees active-result behavior and semantic actions only; copied code
  remains editable if a different navigation UI is wanted.
- Docs/test maintainer: docs describe behavior, while tests assert old/new
  subscriber wakes rather than the private store shape.
- Collab/data maintainer: N/A: the state is local, ephemeral, and non-serialized.
- Verdict: `keep`.

### M-09: Promote inactive selection to the exact Editable

- Change: make the exact `plitejs/react` Editable derive inactive paint when it
  blurs to `data-plite-keep-selection-visible`. Let `platejs/react`
  `PlateContent` inherit the behavior. Delete `SelectionRetentionPlugin`,
  `SelectionRetentionKit`, and the independent registry item.
- Who feels pain: Plite React owns one small renderer law; Plate and registry
  callers stop composing lower-layer Decoration/Widget machinery.
- Likely objection: "The toolbar policy is app-specific, so all mechanics
  should stay copied."
- Steelman antithesis: keeping everything copied avoids one Plite DOM contract.
- Tradeoff tension: the activation decision is product policy, but correct
  expanded/collapsed paint and native-paint deduplication are reusable
  per-Editable mechanics.
- Why this is not change for change's sake: one editor can mount multiple
  Editables, so an editor-global plugin boolean has the wrong lifetime. The
  exact view is the only owner that can render without guessing or duplicating
  state.
- Evidence: canonical selection already lives in Plite; `PlateContent` already
  inherits Plite Editable behavior; the current registry plugin owns only
  transition state plus renderer mechanics; internal projected view selection
  also changes keyboard/clipboard/history behavior and cannot be reused.
- Rejected alternatives: public Plate plugin, registry-local plugin/kit, copied
  Range, public selection Widget carrier, or internal view-selection writes.
- Adoption answer: raw Plite and Plate render normal `Editable`/`PlateContent`;
  copied `Editor` places `data-plite-keep-selection-visible` on owned focus
  targets and owns product exclusions/styles.
- Docs/example answer: teach the marker and output hooks as the API; no
  retention install page, prop, or plugin API exists.
- Regression proof: exact #5091 browser path; expanded/collapsed, backward/RTL,
  root/multi-block, two views over one editor, two editors, native-layer count,
  SSR/unmounted/virtualized behavior, and typing/copy/history after refocus.
- Verdict: `rearchitect` and `cut` the plugin/kit/item.

### M-10: Delete the Floating wrapper and the three obsolete entrypoints

- Change: delete `platejs/floating/react`, `platejs/cursor/react`, and
  `platejs/find-replace` with no aliases; copied Floating consumers import the
  optional peer directly.
- Who feels pain: current importers must migrate atomically and install the
  Floating peer when their copied UI uses it.
- Likely objection: "A thin wrapper stabilizes upstream imports and a one-major
  deprecation costs almost nothing."
- Steelman antithesis: keep forwarding exports and deprecated plugin aliases for
  one release so third-party packages do not break immediately.
- Tradeoff tension: the hard cut creates short-term ecosystem churn and gives
  copied UI direct responsibility for an upstream positioning API.
- Why this is not change for change's sake: Floating owns no Plate semantics,
  FindReplace does not replace, and CursorOverlay conflates jobs already owned
  by Plite or copied UI. Aliases would preserve the exact false concepts.
- Evidence: bounded manifests contain 6/4/8 files; terminal Floating consumers
  are copied registry toolbar/link components; package source matrix above
  traces every replacement owner.
- Rejected alternative: compatibility aliases make runtime/declaration DAG
  enforcement lie and require maintaining two paths through the same major cut.
- Adoption answer: source migration maps each old use to Decoration, Widget,
  copied retention/Find UI, Plite drop caret, Yjs adapters, or direct Floating
  UI; replacement behavior lands and passes first, then the atomic cleanup
  updates every in-repo importer and generated owner.
- Docs/example answer: latest-state docs show only surviving imports and copied
  components; migration detail belongs in the changeset/release note, not
  reference docs.
- Regression proof: zero-stale source/docs/generated searches, export manifest,
  Oxlint DAG, scoped Turbo invalidation, packed runtime/declaration/optional-peer
  consumers from the exact release artifact, and replacement browser rows.
- Plugin maintainer: packages migrate to public primitives/direct Floating UI;
  no forwarding export or deprecated alias preserves false ownership.
- App author: registry items install their exact dependencies; manual copies
  install the documented optional peer and can otherwise omit the feature.
- Docs/test maintainer: source docs show only current imports; the release note
  owns migration, generated outputs regenerate, and historical plans stay
  historical rather than poisoning zero-stale checks.
- Collab/data maintainer: no serialized data changes; package rollback is a
  previous version/atomic revert, never a dual runtime.
- Affected extension points: three exports, Cursor/Find/Floating public symbols,
  registry item names/dependencies, generated manifests, Oxlint/Turbo/DCE and
  packed artifacts. Exact source/import mapping and final-tarball proof block
  release.
- Verdict: `keep`. High-risk result: `plitejs` and `platejs` receive separate
  major changesets; replacement proofs precede one atomic topology deletion;
  rollback is a whole version/revert, never a shim.

### M-11: Keep hard performance law; drop fake precision

- Change: enforce deterministic complexity/subscriber/listener counters,
  calibrated controlled-lane timings, and consumer-scenario bundle budgets.
- Who feels pain: tooling owners must maintain stress fixtures, environment
  metadata, scenario bundles, and reviewed baseline changes.
- Likely objection: "The 4/8/16 ms and 8/10 KiB numbers are arbitrary, flaky,
  and will become cargo-cult gates."
- Steelman antithesis: skip duration gates and trust algorithmic counters plus
  ordinary bundle snapshots; optimize only after a real regression.
- Tradeoff tension: calibrated timings catch machine-level cost but require a
  stable lane and deliberate baseline review; scenario bundles add CI work.
- Why this is not change for change's sake: the architecture is explicitly
  justified by avoiding O(n) cursor resolution, global React fan-out, per-widget
  observers, and unused bundle cost; those claims need executable falsifiers.
- Evidence: current release tooling exact-baselines namespace entrypoint bytes
  in `tooling/scripts/check-plite-release-artifacts.mjs:1261-1309` and separately
  checks generic DCE, but it has no geometry/Yjs consumer scenarios; current
  `platejs/react` consumers cannot infer tree-shaken cost from the namespace
  number.
- Rejected alternative: uncalibrated absolute duration is fake certainty;
  namespace size alone can hide both successful DCE and an expensive opt-in
  path.
- Adoption answer: no runtime user API changes; maintainers review the first
  30-warm-sample baseline, then CI enforces counters, frame caps, regression
  ratio, DCE, and opt-in deltas.
- Docs/example answer: contributor performance docs name fixture, environment,
  samples, counters, scenarios, and baseline-update review policy.
- Regression proof: `n/m/k` counters, teardown, controlled p95 artifact,
  unrelated React zero-delta bundle, opted-in geometry/Yjs deltas, and forbidden
  dependency reachability.
- Plugin maintainer: adapters keep their own scoped tasks and counters without
  creating npm packages solely for cache granularity.
- App author: base consumers inherit no Yjs/Floating/unused geometry; scenario
  bundles model actual imports instead of asking users to trust tree shaking.
- Docs/test maintainer: one contributor page owns environment, sample count,
  counter definitions, bundle scenarios, and baseline-review policy.
- Collab/data maintainer: structural counts catch duplicate resolution and
  retained Anchors independently of noisy wall-clock timings.
- Verdict: `keep`. Plan response: the old 4/8/16 ms values are removed rather
  than treated as provisional truth; the controlled lane records its baseline,
  noise band, and one-frame budget first. Unrelated React DCE is exactly zero;
  opt-in 8/10 KiB caps remain explicit design ceilings.

### M-12: Do not freeze a dedicated Find Jump button

- Change: attack requiring labelled previous, next, jump, and close controls.
- Who feels pain: design-system and product owners would inherit a control that
  is not required for Find navigation and may not match browser conventions.
- Likely objection: "The plan is specifying product chrome without evidence."
- Steelman antithesis: an explicit button makes editor focus/selection transfer
  discoverable and gives the existing jump protocol a direct UI owner.
- Tradeoff tension: keeping only a semantic command leaves each copied product
  composition to decide whether and how to expose it.
- Why this is not change for change's sake: the button itself has no current
  owner or external authority; only the behavior of committing an active range
  needs a protocol.
- Evidence: current package exposes highlight-only behavior and no Find chrome;
  the source/research pass found no Plate-owned Jump control to preserve.
- Rejected alternative: mandatory bespoke chrome would violate the copied UI
  boundary and overstate the scope of the architecture decision.
- Adoption answer: `commitActiveMatch` remains a registry-local semantic action
  callable by a button, result click, or future keyboard binding.
- Docs/example answer: reference docs describe navigation and the optional
  commit action; examples expose only controls justified by their product UI.
- Regression proof: protocol `EDIT-SEARCH-FIND-003` tests the action, not the
  existence of a specific button.
- Plugin maintainer: no package API or plugin chrome contract is added.
- App author: expose `commitActiveMatch` through a button, result click,
  shortcut, or not at all without changing the result owner.
- Docs/test maintainer: protocol tests the semantic action; examples show only
  controls their copied composition actually owns.
- Collab/data maintainer: N/A: committing the range uses the normal local
  selection path and adds no document or collaboration state.
- Verdict: `drop`. The mandatory Jump control was removed while the semantic
  action and protocol remain.

### M-13: Make Plate sibling slots exact-view and dynamic-only

- Change: pass `EditableSiblingProps.editableRef` to before/after Editable
  renderers, split container sibling props around `containerRef`, and stop
  `PlateStatic` from invoking before/after Editable sibling renderers.
- Who feels pain: Plate plugin type owners, static-render tests, docs, and any
  external plugin whose explicitly typed container renderer relied on the
  currently incorrect Editable-props declaration.
- Likely objection: "Do not widen the hard cut with a plugin-render API change;
  global `editor.api.dom.editable()` works for normal apps."
- Steelman antithesis: keep the current slot signature, let the geometry hook
  choose the active mounted view, and declare mirrored overlays unsupported.
- Tradeoff tension: the chosen fix changes a public plugin type and makes the
  ref explicit at every geometry call; it also removes chrome that
  `PlateStatic` technically rendered even though static docs promise pure
  non-interactive output.
- Why this is not change for change's sake: `PlateContent` already owns the
  exact local ref while one editor may have multiple runtimes; the current slot
  discards the only unambiguous view identity, and `PlateStatic` invokes the
  slot without an Editable at all.
- Evidence: `PlateContent.tsx:299-382`, `PlatePlugin.ts:92-94`,
  `PlateContainer.tsx:18-86`, `PlateStatic.tsx:299-356`, and the static guide's
  pure/non-interactive contract at `content/docs/(guides)/static.mdx:6-28`.
- Rejected alternative: a focused/last-focused/mount-order winner is product
  policy in Plite, cannot render two mirrored views intentionally, and can
  anchor a plugin instance to another view.
- Adoption answer: existing no-argument components keep working; scoped
  renderers destructure the supplied ref; container renderers move to the
  truthful container prop type. No compatibility alias is needed.
- Docs/example answer: plugin API docs show the two prop types and exact-ref
  geometry; static docs state that before/after Editable chrome is never
  rendered.
- Regression proof: type fixtures for no-argument and ref-aware plugins,
  per-PlateContent local-ref identity, two mirrored contents, portal use,
  container prop identity, `PlateStatic` absence, and SSR/hydration.
- Plugin maintainer: one truthful slot prop removes global DOM lookup and no
  provider or wrapper is added.
- App author: plugin and copied UI can render one layer per exact Editable or
  omit it; static output remains document-only.
- Docs/test maintainer: interactive slot docs, static guarantees, and runtime
  fixtures describe one behavior instead of the current type/runtime mismatch.
- Collab/data maintainer: N/A: refs are React/DOM projection inputs and never
  enter editor state, operations, snapshots, normalization, or Yjs.
- Affected extension points: `EditableSiblingComponent`, new
  `EditableSiblingProps`/`ContainerSiblingProps`, `PlateContent`,
  `PlateContainer`, and `PlateStatic`; major changeset, public type smoke,
  static/SSR/browser proof, and packed plugin compilation are required.
- Verdict: `keep`.

Pass-5 verdict:

- Keep: lifetime split, three entrypoint hard cuts, public geometry hook, three
  Widget target families, `usePliteWidgetIds`, private per-id Find activity,
  exact-view inactive-selection presentation, and direct Floating UI ownership.
- Drop: public structured awareness events, a parallel Yjs controller cache,
  `getIds`/`subscribeIds`, a raw Range Widget target, and mandatory Jump chrome.
- Revise: extend `YjsAwarenessAdapter`; give Find one original-range owner;
  associate Widget stores with their editor; define exact rect semantics; make
  observer choice private; calibrate timing; prove DCE with consumer scenarios.
- Unresolved maintainer objections: none. At pass 5, ecosystem pressure was a
  separate scheduled falsification owner rather than a hidden objection; pass
  7 completed that attack.

Pass-7 ecosystem verdict:

- Keep: lifetime split, all three entrypoint cuts, structural store editor,
  stable ids selector, three Widget target kinds, one Yjs cache, exact-view
  inactive selection plus copied Find/Floating UI, explicit source plumbing,
  and hard release gates.
- Revise: geometry is required-ref and view-scoped; Plate editable/container
  slot props expose exact refs; static rendering invokes no before/after
  Editable slot; copied owners are named `find` and `use-widget-floating`;
  inactive selection is the inherited exact-view behavior; registry items declare
  direct Yjs/Floating closure.
- Preserve: Yjs provider/awareness fields, cursor-data schema, headless cursor
  reads, scalar subscription, Decoration `decorate`/`revision`, and app-owned
  renderer customization.
- Unresolved ecosystem objections: none. Revision reconciled every accepted
  delta; closure audits the normative inventory, score, gates, and handoff.

## Hard cuts and rejected alternatives

- Cut `platejs/cursor/react`; do not alias it.
- Cut `CursorOverlayPlugin`, arbitrary `addCursor/removeCursor`, copied Range
  state, cursor rectangle helpers, and the registry CursorOverlay renderer.
- Cut Plate drag-cursor handling; Plite's existing drop cursor is canonical.
- Cut `platejs/find-replace`, `FindReplacePlugin`, `searchHighlight` schema, and
  plugin-store query state; do not rename the same implementation to `/find`.
- Cut `platejs/floating/react` and its Floating UI reexports; do not create a
  `platejs/positioning` replacement.
- Cut `useYjsRemoteCursorOverlayPositions`; keep the remote cursor data and
  Decoration source; add only the integration-specific Widget-store adapter.
- Cut the AI package dependency on CursorOverlay and every
  `removeCursor('selection')` call. Retention hiding/clearing is registry
  composition policy.
- Cut the copied `cursor-overlay` and `selection-retention` item/plugin/kit
  names. Absorb `search-highlight` into the copied `find` item and rename
  `find-replace-demo` to `find-demo`.
- Rename registry focus-retention markers from `[data-plate-focus]` to
  `[data-plite-keep-selection-visible]`; do not keep both attributes.
- Stop `PlateStatic` from invoking before/after Editable chrome; container
  siblings remain a client `PlateContainer` surface, and static node renderers
  remain the only static plugin rendering surface.
- Reject `platejs/overlay`, `OverlayPlugin`, `OverlayStore`, one global overlay
  renderer, a public raw-Range Widget target, DOM rectangles inside
  Annotation/Widget logical snapshots, Plite view-selection reuse, and
  compatibility shims.
- Defer the broader Plate `decorate` API redesign. Code syntax is the other
  production decorator; this cut must not smuggle in an unrelated plugin DSL.

## Accepted implementation phases and owners

1. **Contract freeze**: `plite-plan` + `plate-plan` + protocol owner: lock the
   exact-view inactive-selection owner/API, geometry semantics, proof rows,
   Find-only packet boundary, and hard-cut list; update the readable behavior
   spec, protocol matrix, and roadmap before runtime code.
2. **Load-bearing spikes**: focused `major-task`: first prove exact-ref
   geometry with duplicate same-root Editable views, portals, named roots,
   ref replacement/unmount, cross-editor rejection, and separate documents;
   then prove Plite
   Anchors equal direct Yjs resolution across randomized local/remote operation
   sequences. No consumer migration or export deletion precedes these proofs.
3. **Widget geometry and scoped Plate slots**: `best-api` then `major-task`:
   rename target fields,
   make collapsed selections available, add the stable ids selector and
   `readonly editor`, and implement runtime-owned `(store,id,editableRef)`
   geometry subscriptions, exact runtime validation, target rect semantics,
   mounted-target indexing, proof-driven browser invalidation, and metrics in
   `plitejs/react`. In the same API slice, split Plate editable/container
   sibling props, pass exact local refs, and stop `PlateStatic` from invoking
   before/after Editable sibling renderers.
4. **Yjs split**: `plate-feature`/Yjs owner: extend the existing private
   `YjsAwarenessAdapter` into the one DOM/React-free remote-cursor cache/index;
   feed it exact changed-client ids from the private awareness observer and
   editor commits; share it across existing cursor data plus React Decoration
   and Widget adapters; keep the public scalar subscription unchanged; keep raw
   Yjs endpoints plus root-aware Plite Anchors; publish after local Yjs and
   remote editor transactions; rebuild affected roots only on explicit
   fallback/lifecycle events; privately lower remote selection paint and
   cursor Widgets through the existing `YjsPlugin`; expose cursor ids,
   singular cursor data, and exact-view cursor geometry; and migrate
   caret/label to those domain reads.
5. **Selection split**: `plate-feature` + `plate-ui`: preserve #5091 behavior
   in copied registry code with boolean retention state, Plate `decorate` fill,
   and direct selection geometry; never write Plite view selection; remove the AI
   dependency and rely on Plite drop cursor. Keep the old Cursor entry until the
   replacement browser row passes.
6. **Find cut**: `plate-ui`: replace the plugin demo with a copied `find` item
   exporting `useFindController` and `FindKit`; its single
   `NodeApi.findTextRanges` read feeds canonical navigation ranges and the
   local plugin's transient `decorate` output; add deferred
   query, private per-id active match, seeded query, wrap navigation, the
   semantic `commitActiveMatch` action, stale-epoch rejection, fail-closed error
   state, and accessibility; leave Replace deferred. Keep the old Find entry
   until the replacement unit/browser rows pass.
7. **Floating cut**: `plate-ui`: feed exact-ref Widget geometry to direct
   `@floating-ui/react` consumers through one copied `use-widget-floating`
   registry hook; make link and floating-toolbar declare that item and its
   package closure; disable duplicate reference ancestor observers while
   retaining floating-element resize. Keep the wrapper until link/toolbar
   replacement browser rows pass.
8. **Atomic topology cleanup**: package/tooling owners: delete all three old
   entries and bespoke Yjs geometry only after replacement proofs; update
   exports, aliases, entrypoint DAG/runtime lanes, remove Floating peers from
   `platejs`, retain optional Yjs ownership only in the Yjs entry, update size
   manifests, generated API/docs/barrels, Oxlint restrictions, scoped Turbo
   tasks, direct registry `yjs`/Floating dependencies, unrelated-consumer DCE and opted-in bundle
   scenarios, packed proofs, `plitejs`/`platejs` major changesets, and the
   registry changelog in one publishable diff.
9. **Closure**: focused unit/type/SSR/browser/stress/packed proof, immutable
   prerelease artifact verification, then P1
   review under the repo invocation cap.

## Fast driver gates

- Gate A: no API implementation before Widget target and geometry names pass
  `best-api` pressure.
- Gate B: no cursor entry deletion before exact retained-selection and Yjs
  browser tests are red against the replacement branch.
- Gate C: no generic geometry publication until one selection target, one node
  target, and one annotation target use the same contract; a raw Range target
  remains forbidden until a maintained non-integration caller proves it.
- Gate D: no performance claim without separate source-read, geometry-read,
  changed-client, cursor-decode, cursor-resolution-pass, endpoint-conversion,
  changed-id, ids-snapshot-change, list-listener-check, list-render, item-wake,
  geometry-wake, full-fallback, and host-render counters.
- Gate E: no entrypoint removal commit until source imports, exports, docs,
  generated metadata, runtime proofs, aliases, Turbo/Oxlint maps, and packed
  declarations are zero-stale in one atomic diff.
- Gate F: no Find or Yjs completion claim until the behavior spec, protocol,
  parity, and roadmap rows describe the shipped packet and continue to label
  Replace as deferred.
- Gate G: no Yjs implementation approval while Decoration, Widget, and cursor
  data independently resolve the same awareness selection or while the
  private awareness adapter discards awareness change ids; do not add a parallel
  controller store or widen the public `subscribeAwareness` callback to solve an
  internal problem. Do not add a bespoke endpoint mapper while Plite Anchors
  satisfy the direct-Yjs oracle.
- Gate H: no inactive-selection approval unless the exact Editable derives its
  marked focus transition, reads the live canonical selection, avoids duplicate
  native paint, and stays presentation-only. Any controlled prop, copied Range,
  editor-global plugin/store/kit, internal view-selection write, repair timeout,
  or cross-view guessing fails the gate.
- Gate I: no Find approval if query/text revision invokes the matcher more than
  once, navigation recovers ranges from projection slices, next/previous invokes
  the matcher at all, or query/current state reaches schema, operations,
  history, URL state, or a dynamic Plate-store registration effect. Find also
  fails this gate if installing its local plugin drops or double-invokes
  another plugin's paint.
- Gate J: no runtime approval unless headless/import, SSR/static, and real-client
  proof lanes plus dependency reachability, unrelated-consumer zero-delta DCE,
  and opted-in minified+gzip budgets all pass.
- Gate K: no timing gate is accepted from an unrecorded developer machine run;
  first capture the controlled environment and 30 warm samples, then enforce
  deterministic counters, reviewed baseline ratio, and applicable frame cap.
- Gate L: no Widget geometry approval unless every store exposes its editor,
  every call provides an exact Editable ref, structural integration stores work
  through portals, duplicate same-root views resolve independently,
  cross-editor/wrong-root refs fail closed, separate-document rects never mix,
  and selection/annotation/node plus partial-virtualization rect semantics are
  unambiguous.
- Gate M: no optimized Yjs cursor mapping until randomized insert/delete/split/
  merge/move/wrap/unwrap/set/normalize/named-root and concurrent local/remote
  sequences match direct `RelativePosition` resolution for forward, backward,
  collapsed, boundary, deleted, and invalid endpoints. A failed oracle keeps
  the one-owner direct-resolution cache and blocks the zero-resolution claim;
  it does not revive independent React pipelines.
- Gate N: no publishable hard cut until replacement behavior passes before
  export deletion, the final packed tarball passes the same runtime/declaration/
  optional-peer/DCE/size matrix, and rollback is a whole-version/revert path
  with no alias or dual runtime.
- Gate O: no copied-UI approval until `find`, `use-widget-floating`, and
  `remote-cursor-overlay` each install independently, copied `Editor` consumes
  the proxied inactive-selection prop without a retention item, direct
  registry/package dependencies close every import/optional-peer need,
  `PlateStatic` invokes no before/after Editable slot, and generated registry
  outputs are produced only by CI.

## Canonical revision inventory

These rows are normative. Historical pass rows explain how the target changed
but cannot override this inventory.

### Plite projection substrate

- `keep`: Decoration owns transient inline paint, Annotation owns durable
  positions/affinity, and Widget owns logical out-of-flow targets
  (`docs/vision/plite.md:217`; M-01).
- `cut`: no `platejs/overlay`, Overlay store/plugin/provider, global renderer,
  or DOM rectangle in a headless logical snapshot (M-01; Gate C).
- `rename`: `PliteWidgetAnchor -> PliteWidgetTarget`, `anchor -> target`, and
  `visible -> available`; collapsed selection becomes logically available
  (`widget-store.ts:30-107`; M-04).
- `keep`: Widget target kinds remain annotation, node with explicit `nodeKey`,
  and live selection; arbitrary copied Range is rejected (M-04).
- `add`: every structural `PliteWidgetStore` exposes `readonly editor`; no
  hidden brand, registration API, or private-store exception exists (M-02).
- `add`: `usePliteWidgetIds` reads stable `allIds` through existing
  subscription methods; no `getIds`/`subscribeIds` API is added (M-03).
- `add`: `usePliteWidgetGeometry(store,id,{editableRef})` returns immutable
  viewport `rects`, `boundingRect`, and direction-aware `focusRect`, or null
  when exact-view geometry is unavailable (M-02;
  `PLITE-WIDGET-GEOMETRY-001`).
- `keep private`: one coordinator per `(editor,ownerDocument)` owns exact-view
  registrations, shared observers/listeners, scheduler reads, equality, and
  metrics; no per-widget/view loop or implicit active-view policy survives
  (Gate L).

### Plate React and selection policy

- `add`: `EditableSiblingProps.editableRef` and distinct
  `ContainerSiblingProps.containerRef` make plugin slots truthful while
  preserving no-argument components (M-13).
- `cut`: `PlateStatic` invokes no before/after Editable sibling renderer;
  static node rendering remains document-only (M-13;
  `PLATE-EDITABLE-SIBLING-SCOPE-001`).
- `cut`: `platejs/cursor/react`, `CursorOverlayPlugin`, arbitrary
  add/remove-cursor commands, copied Range state, bespoke rectangle helpers,
  timeout repair, and the AI dependency all disappear (M-10).
- `keep`: Plite's native `[data-plite-drop-cursor]` remains the only drop-caret
  owner (`editable.tsx:339-373`).
- `add/cut`: make `Editable` derive activation from
  `data-plite-keep-selection-visible`, let `PlateContent` inherit it, and let
  copied `Editor` own only marker placement, exclusions, and styles. Cut the
  retention plugin/kit/item, copied Range, Decoration contribution, and Widget
  carrier (M-09; `EDIT-SELECTION-RETAIN-001`).

### Yjs collaboration projection

- `revise private`: the existing controller-owned `YjsAwarenessAdapter`
  becomes the one DOM/React-free remote-cursor cache/index over raw Yjs
  endpoints and root-aware Plite Anchors; no parallel/public/React cache exists
  (M-05).
- `keep`: provider/awareness interfaces, configurable fields,
  `YjsCursorDataSchema`, `YjsRemoteCursor<T>`, headless reads, scalar
  `subscribeAwareness`, and Decoration `decorate`/`revision` stay public
  extension points (M-05; M-06).
- `keep/add/cut`: keep singular/broad `useYjsRemoteCursor(s)` data hooks and
  `useYjsRemoteCursorDecorationSource`, add cursor-id and exact-view cursor
  geometry domain reads, privately adapt the cache to Widgets, and delete
  `useYjsRemoteCursorOverlayPositions`; every surviving output reads one cache
  and the copied cursor layer avoids the broad hook (M-05).
- `add copied`: `remote-cursor-overlay` remains a concrete copied visual item,
  installs under the existing `YjsPlugin`, reads cursor-domain geometry, and
  renders caret/label. “Overlay” is descriptive
  UI wording here, never a public architecture noun (M-01; M-05).
- `gate`: one changed awareness client is decoded once and runs at most one
  cursor-resolution pass with at most two endpoint conversions; ordinary
  commits map Anchors with zero Yjs endpoint conversions, while named fallback
  paths re-resolve only affected roots (`PLATE-YJS-CURSOR-PROJECTION-001`).

### Find

- `cut`: `platejs/find-replace`, `FindReplacePlugin`, `searchHighlight`
  schema/query state, and the misleading `find-replace-demo` disappear; the
  current package never implemented Replace (M-10).
- `add copied`: registry `find`/`find-demo` exports `useFindController` and
  `FindKit`; one
  monotonic result owner performs one `NodeApi.findTextRanges` scan and retains
  canonical ordered ranges for count, paint, and navigation (M-07).
- `keep private`: query/open/requested index stay local, effective index/count
  are derived, and a tiny per-id activity store wakes only old/new active
  segments; stale/error epochs fail closed (M-08).
- `lower`: Plate privately lowers the local Find plugin's `decorate` and
  render contributions beside Yjs/other plugins; no app-root carrier wiring,
  dynamic registration, or public renderer pipeline is added
  (`PLATE-REGISTRY-INSTALL-CLOSURE-001`).
- `keep deferred`: Replace and broader search/outline work stay in their
  existing behavior/roadmap lane; `commitActiveMatch` remains semantic and its
  dedicated Jump button remains optional (M-12).

### Floating UI and copied installation

- `cut`: `platejs/floating/react` and its reexports disappear; both Floating
  peers leave `platejs` after the wrapper is gone (M-10).
- `add copied`: registry `use-widget-floating` imports
  `@floating-ui/react` directly, adapts immutable Widget geometry, and is a
  dependency of copied link/floating-toolbar items; geometry owns reference
  invalidation while Floating observes its own element (M-10).
- `gate`: `find`, `use-widget-floating`, and `remote-cursor-overlay`
  independently install/compile with direct registry and package dependencies;
  copied `Editor` uses the proxied inactive-selection prop without a separate
  install item; the cursor item declares `yjs`, and the Floating helper declares
  `@floating-ui/react`
  (`PLATE-REGISTRY-INSTALL-CLOSURE-001`; Gate O).

### Publication, performance, and law

- `cut atomically`: the three obsolete entrypoints, all source/generated/docs
  references, aliases, manifests, declarations, and internal imports disappear
  only after replacement proofs; no alias, forwarding path, or dual runtime is
  allowed (M-10; Gate N).
- `gate`: generated Oxlint restrictions, exact-input Turbo tasks, runtime-lane
  imports, packed declarations, optional-peer reachability, unrelated-consumer
  zero-delta DCE, and reviewed opt-in bundle ceilings prove the entrypoint DAG
  (`PLATE-ENTRYPOINT-DAG-001`).
- `gate`: structural operation/subscriber/listener counters are hard
  everywhere; wall-clock p95 becomes hard only after 30 warm samples on a
  recorded controlled lane and uses the reviewed noise/regression band plus
  recorded frame budget (M-11).
- `revise law during execution`: contract freeze updates readable law,
  protocol, and roadmap before runtime code; executable closure updates parity
  status. Standards/audit remain unchanged because no authority winner shifted
  (Editor-behavior output map).
- `release`: separate `major` changesets cover `plitejs` and `platejs`; copied
  UI uses the registry changelog; rollback is a prior package version or atomic
  revert, never a compatibility path (Migration and cutover order).
- `prove`: exact-ref and Anchor/direct-Yjs spikes precede migration; unit,
  type, headless, SSR, real-browser, stress, registry-install, packed-consumer,
  declaration, DCE, size, stale-reference, and immutable-artifact gates all
  block release (TDD tracer sequence; Fast driver gates).

## Closure decision handoff inventory

Every row below maps one normative inventory item to a source-backed current
shape, its accepted permanent owner, and its closure proof. A row marked
`decision` has no current API to cite and deliberately names that absence
instead of inventing a before shape.

### Plite projection substrate

| ID / status         | Current / before evidence                                                                                                                                                                  | Accepted target and owner                                                                                                         | Proof pointer                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| P-01 `keep`         | `docs/vision/plite.md:217`; `packages/plitejs/src/react/{decoration-source,annotation-store,widget-store}.ts` already split the three lifetimes                                            | Decoration owns transient paint, Annotation durable positions, Widget logical out-of-flow targets                                 | M-01; source north star                |
| P-02 `cut`          | `decision`: no current `platejs/overlay` API exists; generic Overlay was option B                                                                                                          | Never add an Overlay store/plugin/provider/global renderer or headless DOM rectangle                                              | M-01; Gate C                           |
| P-03 `rename`       | `packages/plitejs/src/react/widget-store.ts:30-60` exposes `PliteWidgetAnchor`, `anchor`, and `visible`                                                                                    | `PliteWidgetTarget`, `target`, and `available`; collapsed selection is logically available in `plitejs/react`                     | M-04; Widget type contracts            |
| P-04 `keep`         | `packages/plitejs/src/react/widget-store.ts:30-47` has annotation, node/`nodeKey`, and selection targets                                                                                   | Keep those three targets; reject arbitrary copied Range                                                                           | M-04; three-target browser/type matrix |
| P-05 `add`          | `packages/plitejs/src/react/widget-store.ts:72-85` exposes a structural store with no editor identity                                                                                      | Every `PliteWidgetStore` exposes canonical `readonly editor`                                                                      | M-02; packed structural-store fixture  |
| P-06 `add`          | `packages/plitejs/src/react/widget-store.ts:67,273-332` and `packages/plitejs/src/react/stable-id-mapped-source.ts:276-315` already preserve `allIds` identity; `usePliteWidgets` is broad | Add `usePliteWidgetIds` over existing subscription/snapshot methods; add no ids subscription API                                  | M-03; `PLITE-WIDGET-SUBSCRIPTION-001`  |
| P-07 `add`          | Cursor and Yjs hooks duplicate range geometry at `packages/platejs/src/react/features/cursor/useCursorOverlay.ts:26-157` and `packages/platejs/src/yjs/react/useYjs.ts:690-877`            | `usePliteWidgetGeometry(store,id,{editableRef})` returns immutable exact-view rects from `plitejs/react`                          | M-02; `PLITE-WIDGET-GEOMETRY-001`      |
| P-08 `keep private` | `packages/plitejs/src/dom/plugin/{dom-phase-scheduler,dom-geometry}.ts` already owns phased DOM reads                                                                                      | One private `(editor,ownerDocument)` coordinator owns exact-view registrations, shared observers/listeners, equality, and metrics | Gate L; geometry browser tracer        |

### Plate React and selection policy

| ID / status    | Current / before evidence                                                                                                                                                                                                            | Accepted target and owner                                                                                                                                                                                                                  | Proof pointer                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| R-01 `add`     | `packages/platejs/src/react/plugin/PlatePlugin.ts:92-131`, `packages/platejs/src/react/components/PlateContent.tsx:298-382`, and `packages/platejs/src/react/components/PlateContainer.tsx:32-75` discard or mis-type the local refs | `EditableSiblingProps.editableRef` and distinct `ContainerSiblingProps.containerRef` in `platejs/react`; no-argument renderers remain valid                                                                                                | M-13; `PLATE-EDITABLE-SIBLING-SCOPE-001` |
| R-02 `cut`     | `packages/platejs/src/static/components/PlateStatic.tsx:299-356` invokes before/after Editable renderers without an Editable                                                                                                         | `PlateStatic` renders document nodes only and invokes neither slot                                                                                                                                                                         | M-13; static/SSR fixture                 |
| R-03 `cut`     | `packages/platejs/src/react/features/cursor/CursorOverlayPlugin.tsx:4-108` stores arbitrary copied ranges and repairs them with a timer; `useCursorOverlay.ts` owns duplicate geometry                                               | Delete `platejs/cursor/react`, CursorOverlay commands/state/helpers, timeout repair, and the AI dependency                                                                                                                                 | M-10; Gates B/E/N                        |
| R-04 `keep`    | `packages/plitejs/src/react/components/editable.tsx:339-373` already owns `[data-plite-drop-cursor]`                                                                                                                                 | Plite Editable remains the only drop-caret owner                                                                                                                                                                                           | retained/drop browser row                |
| R-05 `add/cut` | `packages/platejs/src/react/features/cursor/CursorOverlayPlugin.tsx` plus current copied retention plugin and focus-marker consumers split one view job across package and registry state                                            | `plitejs/react` `Editable` owns marker-driven exact-view expanded/collapsed paint; `PlateContent` inherits it; copied `Editor` owns marker placement, exclusions, and styles; cut plugin/kit/item | M-09; `EDIT-SELECTION-RETAIN-001`        |

### Yjs collaboration projection

| ID / status           | Current / before evidence                                                                                                                                                              | Accepted target and owner                                                                                                                                                                   | Proof pointer                                      |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Y-01 `revise private` | `packages/platejs/src/yjs/core/controller.ts:125,242-244,896-955` discards awareness ids while `awareness-adapter.ts:150-230` already decodes cursors                                  | Existing controller-owned `YjsAwarenessAdapter` becomes the one DOM/React-free cursor cache/index over raw endpoints and Plite Anchors                                                      | M-05; direct-Yjs oracle                            |
| Y-02 `keep`           | `packages/platejs/src/yjs/core/types.ts:5-104,148-195` and `packages/platejs/src/yjs/react/useYjs.ts:559-688` expose provider/schema/data/scalar-subscription/Decoration customization | Preserve those public extension points unchanged                                                                                                                                            | M-05/M-06; packed custom-schema fixture            |
| Y-03 `keep/add/cut`   | `packages/platejs/src/yjs/react/useYjs.ts:540-877` has singular/broad data hooks, a Decoration source, and a separate overlay-position resolver                                        | Keep data and Decoration hooks, add cursor ids and exact-view cursor geometry reads, privately adapt Widgets, and delete `useYjsRemoteCursorOverlayPositions`; every output reads one cache | M-05; Yjs core/React contracts                     |
| Y-04 `add copied`     | `apps/www/src/registry/components/editor/remote-cursor-overlay.tsx:70-148` renders one bounding box and duplicates geometry                                                            | Keep the concrete copied item under `YjsPlugin`; read domain geometry for caret/label with no app-root carrier composition                                                                  | M-01/M-05; multiline/RTL/coexistence browser rows  |
| Y-05 `gate`           | Current awareness and React paths independently scan/resolve and force host/source refresh                                                                                             | One changed client: one decode, at most one cursor-resolution pass and two distinct-endpoint conversions; ordinary commits map Anchors with zero conversions                                | `PLATE-YJS-CURSOR-PROJECTION-001`; stress counters |

### Find

| ID / status          | Current / before evidence                                                                                                                                                                                                                  | Accepted target and owner                                                                                                                   | Proof pointer                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| F-01 `cut`           | `packages/platejs/src/features/find-replace/lib/FindReplacePlugin.ts:14-137` stores query/schema highlight state and implements no Replace                                                                                                 | Delete `platejs/find-replace`, `FindReplacePlugin`, `searchHighlight`, and `find-replace-demo`                                              | M-10; Gates E/N                            |
| F-02 `add copied`    | `packages/plitejs/src/interfaces/node.ts` (`NodeApi.findTextRanges`) and `apps/www/src/app/(app)/examples/plite/_examples/search-highlighting.tsx` already provide pure matching/projection without schema mutation                        | Copied `find`/`find-demo` exports `useFindController` and `FindKit`; one result owner scans once and retains ordered canonical ranges       | M-07; Find source/controller contract      |
| F-03 `keep private`  | `decision`: current package has no complete Find UI or navigation store                                                                                                                                                                    | Query/open/requested index stay local, count/effective index derive, and a tiny private per-id activity store wakes only old/new matches    | M-08; 10k navigation counters              |
| F-04 `lower`         | `packages/platejs/src/react/components/Plate.tsx:51-60,210-245`, `packages/platejs/src/react/components/PlateContent.tsx:40-57,260-294`, and `packages/plitejs/src/react/components/editable-text.tsx:353-356,475-477` expose raw carriers | Plate privately lowers plugin `decorate` and render slots; installing Find and Yjs plugins needs no app-root source or renderer composition | M-07; `PLATE-REGISTRY-INSTALL-CLOSURE-001` |
| F-05 `keep deferred` | `docs/editor-behavior/markdown-editing-spec.md` and protocol/roadmap rows already lock broader Search/Replace as deferred                                                                                                                  | Ship only current-file Find/navigation; keep Replace and broader search in the existing future lane; `commitActiveMatch` stays semantic     | M-12; `EDIT-SEARCH-FIND-001..004`          |

### Floating UI and copied installation

| ID / status       | Current / before evidence                                                                                                              | Accepted target and owner                                                                                                                           | Proof pointer                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| L-01 `cut`        | `packages/platejs/src/floating/react/*` is a six-file reexport/wrapper and `packages/platejs/package.json` carries both Floating peers | Delete `platejs/floating/react` and remove both peers from `platejs` after migration                                                                | M-10; Gates E/N                              |
| L-02 `add copied` | Registry link and floating-toolbar currently read DOM rectangles and refresh on editor revisions                                       | Copied `use-widget-floating` imports `@floating-ui/react`, adapts Widget geometry, and lets Floating observe only its own element                   | M-10; link/toolbar browser rows              |
| L-03 `gate`       | `apps/www/scripts/check-registry-source.mts:430-650` requires transitive copied-item dependency closure                                | `find`, `use-widget-floating`, and `remote-cursor-overlay` install independently; copied `Editor` uses the proxied view prop with no retention item | Gate O; `PLATE-REGISTRY-INSTALL-CLOSURE-001` |

### Publication, performance, and behavior law

| ID / status           | Current / before evidence                                                                                                                         | Accepted target and owner                                                                                                                                             | Proof pointer                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| G-01 `cut atomically` | `packages/platejs/package.json`, source imports, aliases, docs/API metadata, Turbo/Oxlint maps, and packed artifacts expose the three old entries | Delete every runtime/type/generated/internal edge only after replacement proof; no alias, forwarding path, or dual runtime                                            | M-10; Gate N                       |
| G-02 `gate`           | Existing entrypoint DAG, runtime lanes, size manifests, and packed checker already enforce package topology but lack these final scenarios        | Generated Oxlint rules, exact-input Turbo tasks, runtime/declaration/optional-peer reachability, unrelated-consumer DCE, and opt-in bundle ceilings prove the new DAG | `PLATE-ENTRYPOINT-DAG-001`         |
| G-03 `gate`           | Existing namespace size baselines do not prove consumer DCE; no calibrated geometry/Yjs timing harness exists                                     | Structural counters are immediately hard; p95 becomes hard only after 30 warm controlled samples and reviewed noise/frame limits                                      | M-11; Gate K                       |
| G-04 `revise law`     | Behavior law already owns Yjs and deferred Search/Replace, but lacks the bounded shipped packet rows                                              | Execution contract freeze updates readable spec/protocol/roadmap before code; implementation closure updates parity/status from proof; standards/audit stay unchanged | Editor-behavior output map; Gate F |
| G-05 `release`        | This planning goal changes no package or registry runtime                                                                                         | Implementation carries separate `major` changesets for `plitejs`/`platejs`, registry changelog ownership for copied UI, and whole-version/revert rollback             | Migration and cutover order        |
| G-06 `prove`          | Current replacement APIs do not exist, so no shipped-runtime claim is made                                                                        | Exact-ref and Anchor/Yjs spikes precede migration; unit/type/headless/SSR/browser/stress/install/packed/declaration/DCE/size/stale/artifact gates block release       | TDD tracer sequence; Gates A-O     |

## Closure requirement audit

| Objective requirement                                         | Authoritative closure evidence                                                                                                                                                                                  | Verdict   |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Current source is authoritative                               | `origin/next` still resolves to `494d90c495092d25941b6f57ca7ebf97b5db13dd`; immutable snapshot exists; exact package/API owners were reread in closure                                                          | satisfied |
| Every current producer/consumer is mapped                     | Source matrix plus rerun 8/4/6 Cursor/Find/Floating manifests, registry consumers, Yjs adapters, Plate slots, and topology blast radius                                                                         | satisfied |
| Vocabulary and API boundaries are fixed                       | Best API target, exact type/call-site examples, and P-01 through G-06 contain no unresolved public API                                                                                                          | satisfied |
| Competing architectures were fairly compared                  | Options A-D compare repair, generic Overlay, lifetime split, and registry-only geometry; C wins and every rejection has a concrete cost                                                                         | satisfied |
| Ownership, migration, release, rollback, and DAG are explicit | Permanent-home table, migration order, release classification, rollback law, accepted DAG, phases, and Gates A-O                                                                                                | satisfied |
| Proof rows are executable and owner-mapped                    | Six behavior rows plus seven runtime/package contracts cover unit, type, headless, SSR, browser, stress, registry install, and packed consumers                                                                 | satisfied |
| Score threshold and evidence caps pass                        | Weighted score is `0.9596 -> 0.96`; lowest dimension is research at `0.94`; every dimension cites plan/source/proof evidence                                                                                    | satisfied |
| Major objections and ecosystem impact are closed              | 13 M-rows contain every required field; `drop` rows M-06/M-12 feed explicit target removals; no `unresolved`/`revise` verdict remains                                                                           | satisfied |
| Research layer has no unresolved contradiction                | Pinned ProseKit/Tiptap/Lexical/ProseMirror/y-prosemirror commits resolve locally; accepted source/concept pages now name the final adapter owner, exact counters, Anchors, exact refs, and remaining proof only | satisfied |
| Behavior-law layers are accounted for                         | Standards/audit stay unchanged with reasons; spec/protocol/roadmap update during execution contract freeze; parity/status waits for executable proof                                                            | satisfied |
| Review discipline is complete                                 | Intent, authority, API, UI, React/effect, performance, TDD, maintainer, high-risk, ecosystem, and revision passes are recorded before closure                                                                   | satisfied |
| Planning boundary was preserved                               | Only this plan and linked research artifacts changed; no package, registry runtime, generated output, browser behavior, release, or product code was implemented                                                | satisfied |
| Residual risks are not plan ambiguity                         | Every remaining risk is an implementation falsifier with a named spike, test, browser route, stress counter, packed artifact, or release gate                                                                   | satisfied |

## Final user-review handoff outline

The closure decision inventory above enumerates every accepted `keep`, `cut`,
`rename`, `add`, `revise`, `compose`, `release`, and `prove` decision across
Plite Widget, Plate view-scoped render slots, selection retention, Yjs, Find,
Floating UI, entrypoints, docs, and proof. Each item includes a live before path
or an explicit no-current-API decision, its target owner, and a proof pointer.
The final response mirrors every row. No implementation starts from this plan.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-30-cursor-find-overlay-architecture.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | No duration was requested. |
| `major-task` loaded | yes | Full skill and architecture/public-API execution path read. |
| Active goal checked or created | yes | `get_goal` returned no active goal; `create_goal` created the matching planning goal. |
| Source of truth read before analysis | yes | User request and prior merged public-owner audit read; live owner mapping is the first scheduled pass. |
| Major lane selected | yes | Architecture/public API plus editor-behavior planning; no implementation. |
| Decision criteria stated | yes | Criteria are recorded under Major source and Completion threshold. |
| Existing repo patterns / prior decisions checked | yes | Prior merged package audit and persistent-annotation history identified; live verification remains scheduled. |
| Helper stack selected | yes | `autogoal`, `major-task`, `plate-plan`, `north-star`, `plate-ui`, shadcn, Vercel React, `react-useeffect`, `performance-oracle`, and `tdd`; source-research helpers were used in prior passes. |
| External research decision recorded | yes | Local source first; external research only for a material unresolved option. |
| Implementation expectation recorded | yes | Planning only; later execution requires user acceptance. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2`, merged `origin/next` source. |
| Branch / PR expectation decided | no | Analytical plan only; no branch, commit, push, or PR action. |
| Output budget strategy recorded | yes | Narrow/count-first/source-owner strategy recorded above. |
| Package/API pack selected | yes | `package-api` protects public entrypoints, exports, migration, and release classification. |
| Public surface or package boundary identified | yes | Plite projection substrate and Plate cursor/find/floating/Yjs entrypoints listed above. |
| Release artifact path selected | no | N/A at planning time: no published user-visible delta in this pass. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no package implementation or release artifact is created. |
| Barrel/export impact decision recorded | no | N/A: this pass changes no exports or exported files. |

Work Checklist:

- [x] N/A: no duration was requested; initial confidence and closure score are
      still recorded.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded: the bounded falsification pass
      against pinned local editor clones is complete and recorded above.
- [x] Options, accepted recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated by `Current law`,
      `Accepted pass-2 decision brief`, and `Best API target` sections.
- [x] All scheduled review/pressure passes are complete or marked N/A;
      implementation, maintainer, high-risk, ecosystem, and revision passes are
      complete; closure is a separate final-gate pass, not another pressure
      pass.
- [x] N/A for this pass: no runtime implementation happened; package/API impact
      and later browser/docs surfaces are scheduled in the plan.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded: accidental broad capped reads are
      listed below and every used conclusion was rechecked with bounded
      owner-specific commands.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence in the objection ledger, review-fixes record, and canonical
      revision inventory.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: this planning-only
      diff has no published package or registry user-visible delta.
- [x] Package/API pack: N/A: `.changeset` is not required until implementation
      changes published packages.
- [x] Package/API pack: N/A: no registry runtime source changed in this pass.
- [x] Package/API pack: no artifact because only a non-user-facing plan changed;
      implementation will require package changesets and registry classification.
- [x] Package/API pack: hard cut with no aliases or dual runtime is explicit.
- [x] Package/API pack: N/A for this plan-only pass; package typecheck/build/test
      proof is mapped to implementation closure.
- [x] Package/API pack: N/A: no exports or exported files changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | complete | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | Closure audit maps 32/32 normative decisions; weighted score is 0.96 with no dimension below 0.94; scoped formatting and `check-complete.mjs` pass. |
| Current-state source audit | complete | Map current owner, boundaries, constraints, and affected surfaces | `Current law and readiness state`, pinned merged commit, bounded manifest |
| Decision criteria closure | complete | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | All 13 rows under `Closure requirement audit` are satisfied; no unresolved or revise verdict remains. |
| Options / tradeoffs / rejection record | complete | Record viable options, chosen recommendation, and why alternatives lose | `Accepted pass-2 decision brief`, `Hard cuts and rejected alternatives` |
| Review / pressure pass | complete | Run selected reviewer/lens or record N/A with reason | Implementation, maintainer objection/steelman, high-risk deliberate mode, ecosystem-maintainer, and revision passes are complete. |
| Review findings closure | complete | Fix or explicitly reject accepted/actionable findings and record closure proof | Every accepted pass-5 through pass-7 delta is reconciled in the canonical revision inventory, API, phases, proof matrix, and gates. |
| External-source audit | complete | Cite official/local clone/external sources when used, or record N/A | Pinned ProseKit, Tiptap, Lexical, ProseMirror, and y-prosemirror commits plus compiled source ledger |
| Implementation gates | N/A | If code changed, close primary-template and touched-surface gates; otherwise N/A | Plan-only pass; no runtime code changed. |
| Final handoff contract | complete | Record recommendation, evidence, caveats, residual risk, and next owner | Final contract names the recommendation, source/proof boundary, implementation falsifiers, and user-review owner; the 32-row handoff inventory is exhaustive. |
| Final lint | complete | Run `pnpm lint:fix` or scoped equivalent when files changed | Scoped Prettier write/check covers the plan and three reconciled research artifacts. |
| Output budget discipline | complete | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Truncated search recorded under Error attempts; bounded source commands re-established every used fact. |
| Timed checkpoint | N/A | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | No duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-30-cursor-find-overlay-architecture.md` | Completed after the closure inventory, final evidence, and handoff were recorded. |
| Public API / package boundary proof | complete for target design | Source-audit public API, exports, and package boundary impact | `Best API target`, exact ideal call sites, and current-law matrix close the target design; executable proof is an implementation gate. |
| Release artifact classification | complete for current pass | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Plan-only internal documentation; no published package or registry behavior changed. |
| Published package changeset | N/A for current pass | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | Internal plan only; later implementation requires separate major changesets for `plitejs` and `platejs`. |
| Registry changelog | N/A for current pass | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | No registry runtime changed; later copied-UI implementation requires registry-changelog classification. |
| No release artifact | complete for current pass | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Internal plan only; no user-visible delta from `main`. |
| Package typecheck/build/test | N/A for current pass | Run owning package checks or record N/A with reason | No package/runtime source changed. |
| Barrel/export generation | N/A for current pass | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | No export or exported layout change. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | plan contract, immutable merged snapshot, North-Star/Vision reads | current-state map |
| Current-state map | complete | source matrix, bounded manifest, initial score | intent/boundary + decision brief |
| Options and recommendation | complete | `best-api` deletion cone, accepted public/copy-owned API, exact call sites | research refresh |
| Research refresh | complete | pinned external reads, refreshed compiled layer, falsification table | implementation pressure |
| Review / pressure pass | complete | implementation-lens, maintainer objection, high-risk deliberate-mode, ecosystem-maintainer, and revision passes complete at score 0.96 | closure |
| Implementation or plan artifact | complete | revised implementation-ready plan; no runtime edits authorized | verification |
| Verification | complete | 32/32 inventory audit; 13/13 objection-schema audit; pinned-source reread; research reconciliation; score, format, and plan-completion checks | closeout |
| Closeout | complete | final contract, exhaustive handoff inventory, completed gates, timeline, and reboot state | user review |

Pass-state ledger:

| Pass                                                                          | Status   | Evidence added                                                                                                                                                                                                | Plan delta                                                                                                                                                                                                                                                                                                                                                 | Editor-behavior output delta                                                                                                                                                                               | Open issues                                                                                  | Next owner                                  |
| ----------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 1. Current-state read and initial score                                       | complete | Merged commit pin; owner/consumer/source matrices; live Vision, tests, examples, exports, package dependencies, runtime scheduling, and registry consumers                                                    | Replaced tentative "overlay substrate" with three hard cuts and a preliminary lifetime-split target; score 0.79                                                                                                                                                                                                                                            | Recorded exact later spec/protocol/roadmap owners; no behavior-law file changed in this pass                                                                                                               | Selection-retention publication and exact Widget geometry API need pressure                  | `plate-plan` intent/boundary + `best-api`   |
| 2. Intent/boundary and decision brief                                         | complete | Best API deletion cone; terminal-consumer and AI dependency reads; exact Widget/Yjs/Find call sites; behavior-law reconciliation                                                                              | Historical pass selected registry-only retention; the 2026-08-31 exact-view correction supersedes that row. Widget/Yjs/Find decisions otherwise remain.                                                                                                                                                                                                    | Corrected stale output map: Yjs and Search law already exist; later protocol/parity/roadmap updates are mandatory                                                                                          | Resolved by the exact-view correction                                                        | `plite-plan` + `plate-plan`                 |
| 3. Research and live-source refresh                                           | complete | Pinned ProseKit/Tiptap/Lexical/ProseMirror/y-prosemirror reads; compiled source page; refreshed concepts/index/log                                                                                            | Lifetime split and hard cuts survived; Yjs changed to one shared private cursor owner; score 0.84                                                                                                                                                                                                                                                          | No behavior-law edit; exact protocol/parity/roadmap deltas remain scheduled                                                                                                                                | Internal changed-key primitive and shared-owner React lifecycle need pressure                | implementation-lens matrix                  |
| 4. Authority/model/home/protocol/UI/React/effect/perf/TDD/regression pressure | complete | Plite view-selection and projection owners; exact Widget/Yjs/Find/Floating call paths; north-star, UI, React, effect, performance, and TDD matrices                                                           | Cut raw Range Widget; moved Yjs cache to controller; fixed one-source Find, runtime geometry lifecycle, budgets, and tracer order; score 0.91                                                                                                                                                                                                              | Proposed eleven behavior/runtime rows; no law file changed because this is an unshipped planning pass                                                                                                      | Hard cuts, controller cache, geometry limits, and budgets need maintainer attack             | maintainer objection + steelman             |
| 5. Maintainer objection + steelman                                            | complete | Twelve concrete ledger rows; exact Yjs callback/controller/awareness-adapter, Decoration slice, Widget/stable-id snapshots, and bundle-checker reads                                                          | Dropped public awareness-event payload, `getIds`/`subscribeIds`, and mandatory Jump button; revised Find to one canonical result owner, geometry ownership/rect law, Yjs to extend its existing private awareness adapter, timing calibration, and consumer DCE; hard cuts/lifetime split survived; score 0.93                                             | No behavior-law file changed; refined future `EDIT-SEARCH-FIND-003`, Widget/Yjs runtime proof, and consumer-bundle gates                                                                                   | High-risk cut ordering, rollback, mapping failure modes, and browser falsification remain    | `plate-plan` high-risk deliberate mode      |
| 6. High-risk deliberate mode                                                  | complete | Deep feasibility/adversarial pass; multi-Editable runtime and DOM-binding reads; Plite Anchor/Yjs association/controller lifecycle reads; failure-path, cutover, rollback, and blast-radius matrices          | Replaced hidden store branding with `readonly editor`; replaced bespoke Yjs mapper with Plite Anchors plus affected-root fallback; initially specified focused/last-focused/stable-mount geometry later rejected by pass 7; added stale Find/error handling, major release classification, atomic migration, calibrated timing, and kill gates; score 0.94 | No behavior-law file changed; strengthened future Widget/Yjs/Find/runtime proof rows and added duplicate-view/oracle cases                                                                                 | Downstream plugin/app/docs/test/collab ergonomics and extension points need ecosystem attack | `plate-plan` ecosystem maintainer           |
| 7. Ecosystem maintainer                                                       | complete | Source-only Widget adoption manifest; exact PlateContent/plugin/container/static slots; explicit decoration-source boundary; registry dependency closure; package optional peers; Yjs public extension points | Rejected Plite's implicit active-view policy; required exact Editable refs; split truthful Plate sibling props; excluded before/after Editable slots from PlateStatic; fixed copied registry item ownership and direct peer closure; preserved Yjs schemas, callbacks, and adapters; score 0.95                                                            | No behavior-law file changed; strengthened future exact-view, static, copied-install, custom-store, custom-schema, Find-source, and Yjs-source proof rows                                                  | Accepted ecosystem deltas need whole-plan reconciliation                                     | `plate-plan` revision                       |
| 8. Revision                                                                   | complete | Whole-plan read; exact behavior-law, `renderSegment`/`PlateContent`, Plate sibling-slot, Yjs cursor type/adapter, and endpoint-resolution rereads; canonical decision and contradiction audits                | Defined Yjs decode/resolution/endpoint counters; fixed one `(editor, ownerDocument)` coordinator, exact static wording, calibrated timing, law-update timing, phases, gates, and one normative inventory; the accepted execution correction moves ordinary composition behind Plate's plugin compiler; score 0.96                                          | No behavior-law file changed because this goal ships no behavior; execution phase 1 updates readable law/protocol/roadmap before runtime code, and implementation closure updates parity/status from proof | Closure-only inventory, score, mechanical checker, and handoff remain                        | `plate-plan` closure                        |
| 9. Closure score and final gates                                              | complete | 32/32 decision inventory; 13/13 requirement rows; source/research contradiction audit; weighted score 0.96; scoped formatting and `check-complete.mjs`                                                        | Closed every remaining gate without changing the accepted API: exact current/target/proof mapping, final handoff, completed phase state, and implementation-only residual-risk classification                                                                                                                                                              | No behavior-law file changed; closure verified that execution updates readable spec/protocol/roadmap before code and parity/status only after executable proof                                             | None for planning; all residual implementation risks have named falsifiers                   | user review, then a separate execution goal |

Findings:

- `cursor` currently hides three unrelated jobs: inactive local selection,
  drag/drop feedback, and arbitrary/remote cursors.
- Plite already owns drop feedback and a complete remote-selection Decoration
  source; Plate duplicates both through cursor geometry.
- FindReplace neither replaces nor needs a document/schema feature. Its correct
  headless primitive and a correct Plite example already exist.
- Floating is a six-file optional-peer wrapper whose only terminal product
  consumers are copied registry components.
- Widget is the correct logical owner but lacks mounted DOM geometry;
  implementation pressure proved that no caller earns the initially proposed
  range target. Its `anchor`/`visible` vocabulary still confuses target
  availability with viewport state.
- Widget's mapped source already preserves `allIds` identity when ids/order do
  not change. `usePliteWidgetIds` therefore needs only the existing store
  subscription and a narrow snapshot selector; a new ids subscriber API would
  optimize one callback rather than one render.
- Plite's built-in view selection already has an internal Decoration source,
  but it is editing-engine state shared by input, clipboard, history, mutation,
  and reconciliation. Reusing it for toolbar blur would be an ownership bug.
- The Yjs registry renderer ignores the existing Decoration source and collapses
  multiline selections into one bounding rectangle.
- Existing Yjs cursor hooks subscribe only to awareness. Direct Widget/Decoration
  store refresh is required for resolved-range correctness without host React
  fan-out.
- Yjs already exposes awareness changed-client ids but discards them at the
  controller boundary. The current Decoration hook then force-invalidates the
  entire source, while the position hook independently scans and resolves every
  cursor.
- y-prosemirror supplies the stronger model: rebuild on awareness change, map
  the cached decoration set through document transactions. Plate needs the same
  one-owner principle with changed-client precision.
- ProseKit's Search extension proves plugin publication is justified for a
  complete query/navigation/replace contract, not for Plate's current
  highlight-only package.
- The behavior corpus already owns Yjs collaboration and deferred Find/Replace.
  The implementation plan must narrow the first packet without silently
  rewriting that law.
- `PliteDecorationSource.getSnapshot()` contains per-node
  `PliteProjectionSlice` values with data/start/end/key but no original Range.
  Find therefore needs one registry-local result owner that retains canonical
  ranges and supplies both navigation and its Decoration source; this still
  performs one matcher read.
- Plite's runtime and DOM phase scheduler already provide the correct private
  home for geometry coordination; a module-global WeakMap or public provider is
  unnecessary and weaker under SSR/StrictMode.
- Plite deliberately supports multiple connected Editable runtimes for one
  editor API and multiple DOM elements for one node key. Geometry therefore
  requires the exact Editable ref; `getMountedEditableDOMRuntime(editor)[0]`
  and a hidden active-view winner are not contracts.
- `PliteWidgetStore` is a public structural interface. Hidden owner branding
  would make the Yjs integration store and legitimate custom stores fail;
  `readonly editor` is the smaller and more honest contract.
- The merged repo has no independent production structural Widget-store
  implementation outside `usePliteWidgetStore`; tests and examples are the
  remaining consumers. Unknown third-party adoption is therefore unproven, and
  a packed custom-store fixture is the honest compatibility proxy.
- `PlateContent` owns the exact Editable ref already. Its plugin sibling type
  hides that useful scope, while `PlateContainer` reuses the same type for div
  props and `PlateStatic` invokes Editable siblings without an Editable. The
  current extension contract is both underpowered and false.
- `PlateProps.decorationSources` and Plite's segment renderer are advanced raw
  carrier boundaries. Normal Plate plugins contribute `decorate` and render
  slots; the Plate compiler must lower and compose them privately without
  replacing another plugin's paint (`PlateContent.tsx:40-57,260-294`;
  `editable-text.tsx:353-356,475-477`).
- Copied registry dependency closure is transitive and enforced. Shared
  Floating composition therefore needs its own copied hook item, remote cursor
  UI needs direct `yjs`, and the obsolete Plate Floating peers can disappear.
- Yjs provider/awareness interfaces, field options, cursor data schema, typed
  cursor metadata, headless reads, scalar subscription, and Decoration
  customization are valid extension points and remain intact.
- The public Yjs awareness subscription need not change: the existing private
  observer already receives `YjsAwarenessChange`, while generic subscribers are
  intentionally zero-argument revision listeners.
- `YjsAwarenessAdapter` already owns remote cursor decoding and the controller's
  public `remoteCursor(s)` delegates to it. Extending that private adapter is
  more coherent than adding a sibling controller cache.
- Plite already has root-aware Anchors with forward/backward association and
  drop-on-delete behavior. Reusing those endpoints and proving them against a
  direct Yjs oracle is safer and smaller than building a cursor-only mapper.
- Current bundle tooling exact-baselines namespace entrypoint bytes and proves
  generic DCE, but it does not model an unrelated React consumer versus an
  opted-in Widget-geometry/Yjs-cursor consumer. Those scenario proofs are the
  meaningful release gate.

Decisions and tradeoffs:

- Pass 2 accepts the hard-cut and lifetime split as the target subject to later
  falsification. Compatibility is not a decision driver.
- Inactive-selection state has no independent owner: Plite's canonical
  selection survives. Exact-view rendering is a reusable Plite React job;
  copied registry code owns only activation and styling. Yjs Widget adaptation
  has an independent integration/performance job and earns one public hook.
- One exact-ref geometry hook plus one stable ids selector is the minimum public
  cost that makes component-local DOM duplication and list-wide cursor render
  fan-out illegal. The selector reuses existing subscription methods; the store
  exposes its editor; the coordinator validates the caller's view privately;
  annotation, node, and selection cover every maintained target.
- Separate public Yjs Decoration and Widget hooks remain useful, but they read
  one stateful private DOM/React-free `YjsAwarenessAdapter`. The public awareness
  callback remains unchanged. A parallel controller cache, public aggregate
  cursor store, structured awareness event API, React-owned cache, generic Range
  target, and independent resolver pipelines are rejected.
- Replace remains locked future behavior but is not allowed to inflate this
  Find implementation packet.
- One-source Find means one canonical result owner feeding Decoration and
  navigation, not reverse-engineering original ranges from projected slices.
- Copied `useFindController` feeds one registry-local `findPlugin`; Plate
  privately lowers its Decoration and render contributions. It owns no editor
  schema, document, history, URL, or dynamically registered Plate state.
- Plate supplies `EditableSiblingProps.editableRef` and a separate truthful
  `ContainerSiblingProps.containerRef`; no-argument components remain valid,
  and `PlateStatic` invokes no dynamic Editable sibling renderer.
- Copied `find` and `use-widget-floating` registry items are customization
  units. Inactive selection is activated by copied `Editor` markers through the
  inherited exact-view behavior, with no install item. Surviving items declare their
  direct dependencies; package boundaries do not compensate for incomplete
  copied-item manifests.
- Plate's existing plugin compiler composes Find, Yjs, and other semantic
  contributions in installed-plugin order and lowers each once; no public
  renderer registry, new public projection layer, or dynamic registration is
  justified. Raw app-owned carriers remain advanced escape paths.
- The Yjs adapter caches `YjsRemoteCursor<T>` itself as Widget data, feeds
  explicit Decoration and Widget outputs from one headless owner, and preserves
  all existing public metadata/schema/custom-decoration contracts.
- Deterministic operation/subscription/listener counts are immediate hard gates;
  duration is hard only after controlled calibration, and bundle cost is proved
  with unrelated versus opted-in consumer scenarios.
- Release rollback is the previous package version or an atomic source revert,
  not a compatibility alias. There is no serialized-data rollback.

Implementation notes:

- N/A: planning-only activation. Runtime implementation requires a later
  user-reviewed execution goal.

Review fixes:

- `best-api` rejected every selection-retention plugin/kit/store and selected
  the exact Editable boolean prop; it also rejected any public geometry
  store/provider/virtual-element API.
- Narrow-subscription pressure added `usePliteWidgetIds` and replaced the
  tentative registry mapping of `useYjsRemoteCursors` with a direct-subscription
  `useYjsRemoteCursorWidgetStore`; maintainer pressure then reused the existing
  Widget subscription and stable `allIds` identity instead of adding
  `getIds`/`subscribeIds`.
- Research pressure corrected that target: `useYjsRemoteCursorWidgetStore` and
  `useYjsRemoteCursorDecorationSource` share one private owner that preserves
  awareness ids and shares cached endpoints across outputs.
- The accepted execution correction keeps that Widget adapter private and
  exposes cursor ids, singular cursor data, and exact-view cursor geometry as
  the public Yjs reads.
- Implementation pressure moved that owner into the headless Yjs controller,
  removed the speculative raw-Range Widget target, and required exact
  awareness-change payloads, per-id/order subscriptions, and zero repeated Yjs
  resolution across independent outputs.
- Maintainer pressure corrected that wording and API: the existing private
  `YjsAwarenessAdapter` becomes the DOM/React-free remote-cursor cache/index,
  exact awareness payloads travel only from the controller's private observer,
  no parallel store is added, and public `subscribeAwareness` remains a
  zero-argument notification contract.
- Maintainer pressure rejected deriving Find navigation ranges from segmented
  Decoration snapshots; one registry-local result owner now retains original
  ranges and feeds both navigation and Decoration from one matcher read.
- High-risk pressure replaced private Widget-store branding with an explicit
  `readonly editor`, made geometry follow that editor through portals, and
  initially specified focused/last-focused/stable-mount selection when one
  editor has duplicate Editable views; the next ecosystem bullet supersedes
  that proposal.
- Ecosystem pressure rejected that global view winner and requires an exact
  `editableRef`; it also adds truthful editable/container sibling props and
  prevents `PlateStatic` from mounting before/after Editable chrome.
- High-risk pressure replaced the bespoke Yjs endpoint mapper with Plite
  Anchors, added an affected-root direct-resolution fallback and randomized
  oracle, and fixed publication ordering after local Yjs transactions and
  remote editor imports.
- High-risk pressure added fail-closed/stale-epoch Find behavior, atomic
  replacement-before-deletion ordering, separate `plitejs`/`platejs` major
  release artifacts, whole-version rollback, and scoped Turbo/packed proof.
- Maintainer pressure dropped a mandatory Find Jump button while preserving the
  semantic `commitActiveMatch` protocol action.
- Maintainer pressure replaced uncalibrated 4/8/16 ms release claims and
  namespace-size inference with hard structural counters, controlled timing
  calibration, unrelated-consumer zero-delta DCE, and opted-in bundle scenarios.
- API-name pressure kept explicit `nodeKey`; shortening it to `key` would add a
  breaking rename while making agent and human call sites less clear.
- `plate-ui`/shadcn pressure kept all visuals copied and reused existing
  InputGroup/Button/Tooltip components; no package-owned UI or new primitive
  survived.
- React/effect pressure replaced parent/global snapshots, component geometry
  state, editor-version effects, and derived-state effects with narrow external
  stores, event-time transitions, and runtime-owned observers.
- Performance/TDD pressure added structural counters, 100/1,000-cursor,
  100k-text/10k-match, memory, bundle, SSR, and eleven vertical tracer gates.
- Behavior-law reread removed the false claim that parity/protocol owners were
  absent and kept Replace explicitly deferred.
- ProseKit's full Search/Replace alternative was accepted as valid evidence but
  rejected for this smaller Find-only packet; Tiptap, Lexical, and
  y-prosemirror reinforced the lifetime split and one-source/multiple-output
  cursor model.
- Ecosystem pressure also fixed copied registry ownership and direct dependency
  closure, preserved the current Yjs extension surface, and made Plate plugin
  lowering the normal Find/Yjs owner.
- Revision reconciled private source and segment-renderer lowering, Yjs resolution
  counter units, the coordinator owner, timing calibration, exact static slot
  wording, behavior-law timing, and one normative decision inventory.
- Closure reconciled the linked research layer, mapped all 32 decisions to
  before/target/proof, closed all 13 objective requirements, and left only
  execution-time falsifiers.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Oversized initial plan patch included a stale terminal context line | 1 | Split the patch into exact sections after rereading the generated shell | Objective, boundaries, gates, and checklist rows were applied successfully. |
| Assumed registry files lived under `registry/ui` | 1 | Locate with bounded `rg --files` before reading | Resolved canonical `registry/components/editor` paths. |
| Assumed Plite stores lived under `react/stores` | 1 | Locate exact filenames before reading | Resolved stores directly under `packages/plitejs/src/react`. |
| One broad capped import search emitted 20,721 tokens and was truncated | 1 | Stop using its output as evidence; rerun owner-specific paths and exact source slices | Every used conclusion was re-established through bounded file counts, package export reads, and direct owner reads. |
| Broad multi-section plan/behavior reads exceeded their useful output budget | 2 | Read one exact section from one file per command | Exact Search, collaboration, protocol, parity, and roadmap sections were reread independently before changing the output map. |
| Guessed the Widget hook filename as `use-widget-store.ts` | 1 | Locate the exact file with bounded `rg --files` | Resolved `hooks/use-plite-widget-store.tsx` and `hooks/use-plite-widgets.tsx`; no conclusion used the failed path. |
| Combined Decoration-source/projection-store read exceeded the output cap | 1 | Locate symbols, then read exact type and refresh ranges separately | Confirmed refresh options have no changed-item ids and external force invalidation remaps the full source. |
| Looked for merged Plite source in the older current checkout package path | 1 | Return to the pinned immutable `origin/next` snapshot before locating files | Resolved `packages/plitejs/src/react/decoration-source.ts` and `projection-store.ts` in the authoritative snapshot. |
| Combined view-selection source/read search exceeded the output cap | 1 | Locate exact exports/writers/readers, then read bounded owner slices | Proved built-in view selection is internal editing state with its own mounted Decoration source; no conclusion used truncated output. |
| Broad selection-retention corpus search exceeded the output cap | 1 | Restrict to CursorOverlay, registry marker consumers, and exact behavior-law rows | Re-established the retention contract and copied consumers from bounded current owners. |
| Guessed `use-plite-decoration-source.tsx` instead of its `.ts` path | 1 | Locate with `rg --files` before reading | Read the exact hook/source lifecycle and public snapshot/subscription types. |
| Broad size-budget search exceeded useful output | 1 | Read the exact entrypoint-size JSON and release-artifact checker slices | Confirmed every tracked entry size is exact-baselined and added scenario budgets separately. |
| Combined memory search and six-skill size/read output exceeded the cap | 1 | Rerun the memory slice and every selected skill in bounded, one-owner chunks | Read `autogoal`, `major-task`, `plate-plan`, `architecture-strategist`, `feasibility-reviewer`, and `maintainability-reviewer` completely; no conclusion used truncated output. |
| An unquoted backtick in a stale-phrase `rg` pattern invoked a shell command | 1 | Use one single-quoted plain pattern without shell-active punctuation | Reran the audit with safe patterns; no source or plan file was mutated by the failed read. |
| One multi-section adapter-owner patch missed a Prettier-expanded table line | 1 | Re-read the exact sections and apply bounded owner-specific patches | Replaced the parallel controller-cache wording with the existing stateful `YjsAwarenessAdapter` owner everywhere current target text depends on it. |
| One multi-row ids-selector patch missed Prettier-expanded table spacing | 1 | Locate exact rows with bounded `rg -C 1`, then patch each owner separately | Removed the proposed `getIds`/`subscribeIds` API and retained only `usePliteWidgetIds` over the existing stable snapshot contract. |
| Final `plate-plan` skill chunk exceeded the direct output cap | 1 | Reread lines 781-900 and 901-1001 separately before any pass work | The full skill tail, plus feasibility and adversarial reviewer instructions, was read in bounded chunks; truncated output was not evidence. |
| Combined current/snapshot DOM-runtime search included a missing current path and truncated | 1 | Restrict every follow-up to the immutable snapshot and exact runtime/binding files | Re-established multi-Editable runtime and multi-binding facts from `editable-dom-runtime.ts`, `use-plite-node-ref.tsx`, and focused tests only. |
| Combined post-format reread of three dense plan ranges truncated | 1 | Reread high-risk, phase/gate, ledger, and handoff ranges independently | Every changed conclusion was rechecked in bounded section-specific reads; truncated output was not used as evidence. |
| Autogoal lines 1-300 exceeded direct model context during pass-7 reload | 1 | Reread the skill in 120-line-or-smaller chunks before ecosystem work | The complete 1,206-line skill, `major-task`, `plate-plan`, and this active plan were reloaded in bounded chunks; the truncated read was not used as evidence. |
| Broad pass-7 Widget grep included generated registry JSON and truncated | 1 | Restrict the manifest to package source/tests and `apps/www/src`, excluding generated public output | The source-only Widget manifest was rerun; the truncated output was not used as evidence. |
| Post-revision stale-view phrase search exceeded model context | 1 | Run each literal phrase as an individually bounded fixed-string search | Every current-target occurrence was checked separately; historical pass-6 wording remains labeled as rejected history. |
| One mixed revision patch missed the Prettier-expanded Gate O lines | 1 | Split historical-delta, sibling-slot, and Gate O edits into exact owner-specific patches | All three revisions applied independently; the failed patch changed no file content. |
| One small current-verdict patch returned truncated tool output | 1 | Reread the exact verdict before retrying | The intended Yjs data-hook plus Decoration/Widget wording was already present; no duplicate edit was applied. |
| Closure whole-plan lines 251-500 truncated | 1 | Reread the range as lines 251-375 and 376-500 | Both bounded reads completed; no conclusion used the truncated output. |
| Combined research reconciliation patch mixed concept context into the source page | 1 | Split the source, concept, and append-only log edits by owner | All three bounded patches applied; the failed patch changed no file content. |
| Large closure-inventory path-precision patch returned truncated tool output | 1 | Reread the exact inventory and audit all 32 rows before retrying | The intended fully qualified paths were already present; no duplicate edit was applied. |
| Closure path tightening guessed obsolete `NodeApi` and Plite example locations | 1 | Locate the symbols in the immutable snapshot before retaining the citation | Corrected F-02 to `packages/plitejs/src/interfaces/node.ts` and the live Plite search-highlighting example. |
| First closure-structure audit used shell-active quoting and failed before Node ran | 1 | Rerun the read-only audit through a literal heredoc | The bounded audit completed with 32 unique inventory ids, 13 satisfied requirement rows, and zero unresolved verdicts; no file was changed by the failed command. |
| First canonical-inventory audit assumed table rows although the source inventory is a bullet list | 1 | Parse normative action bullets and closure table ids separately | Confirmed 32 source actions map to 32 unique closure rows; also confirmed 13 unique proof rows and 13 objection rows with every required field. |

Verification evidence:

- Workspace: `/Users/zbeyens/git/plate-2`; immutable source snapshot:
  `/tmp/plate-cursor-audit.L4c8go`.
- `git rev-parse origin/next` ->
  `494d90c495092d25941b6f57ca7ebf97b5db13dd`.
- Read `platejs` exports directly from `packages/platejs/package.json` and
  confirmed the cursor/find/floating/Yjs/React entrypoints.
- Counted exact Cursor/Find/Floating source manifests with bounded `rg --files`:
  8 / 4 / 6 files.
- Read exact Find, CursorOverlay, cursor geometry, WidgetStore, projection,
  Decoration, Yjs, Plite drop-cursor, registry floating/link, and remote-cursor
  owner slices cited in the source matrix.
- Read exact collaboration/Search sections in `markdown-editing-spec.md`,
  `editor-protocol-matrix.md`, `markdown-parity-matrix.md`, and
  `master-roadmap.md`; verified Yjs and deferred Find/Replace already have
  behavior-law owners.
- Ran the merged `best-api` deletion/publication counterfactual from the
  immutable snapshot; recorded exact Plate imports and rejected public nouns.
- Read pinned ProseKit inline-popover/Search, Tiptap BubbleMenu/collaboration
  caret, Lexical Yjs cursor synchronization, and y-prosemirror cursor-plugin
  sources; recorded the falsification ledger in
  [cursor-find-and-widget-geometry.md](docs/research/sources/editor-architecture/cursor-find-and-widget-geometry.md).
- Read exact merged Plite projection refresh types and Yjs controller/awareness
  paths; confirmed awareness changed ids are discarded and the current
  Decoration hook uses full external invalidation.
- Read exact Plite view-selection state, built-in Decoration source, Editable
  composition, and keyboard/clipboard/history/reconciliation consumers;
  rejected selection-retention reuse as an input-engine coupling.
- Read exact Widget store/kernel/hooks, DOM phase scheduler, Anchor API/state,
  Yjs awareness/controller/React adapters, Decoration source snapshots, Plate
  `decorationSources`/`renderSegment` proxy, and registry Find/Floating/link
  owners; fixed the pass-4 home/API/lifecycle decisions from those owners.
- Read the exact entrypoint-size baseline/checker and runtime lane machinery;
  recorded dependency reachability and scenario bundle gates instead of
  treating tree shaking as assumed.
- Re-read exact public `YjsState.subscribeAwareness`, private
  `awarenessObserver`, controller state/subscriber, `PliteProjection` versus
  `PliteProjectionSlice`, `PliteDecorationSource.getSnapshot`, Widget snapshot,
  Widget publish path, stable-id mapped-source refresh, Widget hooks,
  `YjsAwarenessAdapter` cursor decoding, Plite Find example, and namespace-size/
  DCE checker lines for the maintainer counterproposal.
- Ran the architecture, feasibility, and maintainability lenses as one
  maintainer objection pass; recorded twelve full objection rows and applied
  every `drop`/revision to the target rather than leaving ledger-only advice.
- Scoped ledger audit counted 13 maintainer rows and 13 occurrences of every
  required field: pain owner, objection, steelman, tension, payoff, rejected
  alternative, adoption, docs/example, regression, ecosystem, and verdict.
- Ran the deep feasibility/adversarial high-risk pass. Read the exact mounted
  runtime registry and focus lifecycle, multiple node-key DOM bindings,
  multi-Editable tests, DOM range resolution, Widget store construction,
  Plite Anchor state/mapping, Yjs relative-position association, awareness
  adapter, controller local/remote lifecycle, and changeset rules from the
  immutable merged snapshot/current doctrine.
- Traced happy/nil/empty/error paths for Widget logic/geometry, multiple views,
  awareness, Yjs commits, Find, retained selection, Floating UI, SSR/headless,
  and the hard cut; converted every blocking gap into a target revision or gate.
- Recorded the implementation blast radius, replacement-before-deletion order,
  randomized Anchor/direct-Yjs oracle, affected-root fallback, scoped Turbo/CI
  obligations, major release classification, and whole-version rollback.
- Refreshed the overlay-lifetime and source-scoped-invalidation concepts,
  editor-architecture source index, corpus raw-status note, main research index,
  and append-only research log.
- Ran the source-only Widget consumer manifest; found no independent production
  structural store and converted unknown ecosystem adoption into a packed
  custom-store proof obligation.
- Read exact `PlateContent`, `PlatePlugin`, `PlateContainer`, `PlateStatic`, and
  `PlateProps.decorationSources` owners; required exact local refs, truthful
  sibling types, static exclusion, and private Find/Yjs plugin lowering.
- Read the registry source checker and exact Find, selection-retention,
  remote-cursor, collaboration, link, and floating-toolbar item manifests;
  required copied helper ownership and direct `yjs`/Floating dependency closure.
- Read Yjs provider/awareness/cursor schema/types, React adapters, and package
  peers; preserved supported extension points and removed Floating peers only
  with the obsolete wrapper.
- Re-read exact readable behavior-law owners and fixed execution timing: contract
  freeze updates the spec/protocol/roadmap before runtime code; parity/status
  changes only after executable implementation proof.
- Re-read the raw `renderSegment` path through `PlateContent` and Plite
  `EditableText`; required Plate's existing plugin compiler to lower each
  plugin contribution exactly once without a public renderer registry or
  app-root carrier helper.
- Re-read `YjsRemoteCursor` and the awareness adapter endpoint path; separated
  changed-client decode, cursor-resolution-pass, and per-distinct-endpoint
  conversion counters, including metadata-only endpoint reuse.
- Audited every accepted current decision against the canonical revision
  inventory, implementation phases, browser/runtime contracts, gates, and
  handoff; historical rejected proposals no longer govern current target text.
- Reconciled the accepted research source and source-scoped invalidation concept
  with the final architecture: the existing controller-owned
  `YjsAwarenessAdapter`, Plite Anchors, exact Editable refs, affected-root
  fallback, copied Find owner, renderer coexistence, and exact work counters are
  canonical; the remaining-research section contains executable proof only.
- Closure audit counted 32 canonical decisions and 32 handoff rows with unique
  ids, 13 complete objective-requirement rows, 13 maintainer objections with all
  required fields, and 13 unique proof definitions. No unresolved/revise
  verdict, target-level placeholder, or unowned public API remains.
- Re-resolved every pinned external commit locally and reran the bounded 8/4/6
  Cursor/Find/Floating source manifests against the immutable merged source.
- Runtime/package tests were not run because this pass changed no executable
  source and makes no shipped behavior claim.
- `pnpm exec prettier --write` and scoped `--check` cover this plan, the accepted
  cursor/Find/Widget source page, source-scoped invalidation concept, and
  append-only research log.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-30-cursor-find-overlay-architecture.md`
  passes with every required goal-plan state and completion gate closed.

Final handoff contract:

- Recommendation: execute the hard cut and lifetime-split API above;
  explicit Widget-store editor, exact-ref view-scoped geometry, truthful Plate
  sibling slots, copied Find/Floating ownership, and Plite-Anchor-backed Yjs
  cache. Do not add a generic Overlay API or preserve any old entrypoint.
- Confidence: final 0.96 weighted score; every planning and closure gate passes.
- Evidence: merged source matrix, bounded manifests, 32-row decision handoff,
  13-row objective audit, and pinned external falsification ledger above.
- Tests / commands: source, structural, research, score, formatting, and plan
  completion proof passed; executable runtime proof is deliberately scheduled
  for implementation.
- Browser proof: not run because no runtime/UI source changed; exact contracts
  are named for implementation.
- PR / tracker: none; no git mutation authorized.
- Caveats: implementation must prove per-ref duplicate-view isolation,
  registry install closure, Anchor/Yjs oracle equivalence, and renderer
  coexistence before release. These are falsification gates, not unresolved
  architecture choices.
- Next owner: user review; if accepted, create a separate execution goal and
  begin with the contract-freeze and exact-ref/Anchor spikes.

Timeline:

- 2026-08-30T10:57:59.625Z Major-task goal plan created.
- 2026-08-30 Skills and required North-Star constitutional references read;
  active goal created after filling the durable contract.
- 2026-08-30 Current-state pass completed against merged commit
  `494d90c495092d25941b6f57ca7ebf97b5db13dd`; initial score 0.79; next pass
  recorded without implementing runtime code.
- 2026-08-30 Intent/boundary and `best-api` pass completed: selection retention
  moved to copied registry ownership, Widget API fixed to target/order/geometry,
  Yjs gained an integration-store target, Find excluded Replace, existing
  behavior law was reconciled, and the score moved to 0.81.
- 2026-08-30 Research/live-source pass completed: pinned ProseKit, Tiptap,
  Lexical, ProseMirror, and y-prosemirror evidence preserved the lifetime split,
  corrected Yjs to one shared private projection owner, repaired stale research
  routing/status, and moved the score to 0.84.
- 2026-08-30 Implementation-lens pass completed: north-star/UI/React/effect/
  performance/TDD pressure rejected view-selection reuse and raw Range Widgets,
  moved Yjs resolution into its controller, fixed one-source Find and
  runtime-owned geometry, added exact protocol/tracer/performance/bundle gates,
  and moved the score to 0.91.
- 2026-08-30 Maintainer objection/steelman pass completed: twelve objections
  preserved the lifetime split and hard cuts but dropped the public structured
  awareness callback, redundant ids-store methods, and mandatory Jump button;
  revised Yjs to a DOM/React-free stateful awareness-adapter cache, Find to a
  canonical registry result owner, geometry to an editor-owned invariant/exact
  rect contract, and perf proof to calibrated timings plus consumer bundles;
  score moved to 0.93.
- 2026-08-30 High-risk deliberate-mode pass completed: deep feasibility and
  adversarial pressure found hidden store branding and a bespoke Yjs mapper to
  be wrong; revised to explicit `store.editor`, initially proposed a canonical
  multi-Editable view winner later rejected by pass 7, adopted Plite Anchors
  plus affected-root fallback/direct oracle, and added complete failure paths,
  atomic cutover, major release/rollback law, and scoped CI blast radius; score
  moved to 0.94.
- 2026-08-30 Ecosystem-maintainer pass completed: plugin/app/docs/test/collab
  pressure rejected implicit active-view selection, exposed exact Editable refs
  through truthful Plate slots, made `PlateStatic` invoke no before/after
  Editable slot, fixed copied registry ownership/direct dependencies, preserved
  Yjs extension points, and moved the score to 0.95.
- 2026-08-30 Revision pass completed: reconciled all accepted decisions into one
  normative inventory; the accepted execution correction moved Find/Yjs
  carrier coexistence behind Plate's plugin compiler;
  defined exact Yjs work units and one geometry coordinator owner; removed fake
  timing precision; fixed static-slot and behavior-law timing; score moved to
  0.96. Closure remains a separate pass.
- 2026-08-30 Closure pass completed: reconciled the research layer, mapped all
  32 normative decisions to current owner/target/proof, satisfied all 13
  objective requirements, closed every plan gate, and passed scoped formatting
  plus the mechanical goal-plan checker at final score 0.96.
- 2026-08-31 API correction completed: registry-only retention was split into
  marker-driven Plite React mechanics inherited by PlateContent and copied
  Editor marker/styles. The retention plugin/kit/item became deletion targets;
  earlier pass-log statements remain historical only.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Architecture corrected after the historical execution: exact-view inactive selection is the accepted target. |
| Where am I going? | Complete `docs/plans/2026-08-31-native-inactive-selection-focus-marker.md` for Plite lifecycle behavior and registry deletion/adoption. |
| What is the goal? | Choose and prove the canonical Plite cursor/find/overlay architecture. |
| What have I learned? | Overlay is the wrong public noun; existing Widget targets are sufficient; geometry needs the caller's exact Editable ref; normal Find and Yjs authoring belongs in Plate plugins while raw carriers stay advanced; Yjs work needs separate decode, resolution-pass, and endpoint counters. |
| What have I done? | Reconciled all accepted decisions across API, migration, performance, behavior law, phases, research, proof, gates, and the 32-row handoff inventory; passed closure at 0.96. |

Open risks:

- Publishing geometry before proving `(store,id,editableRef)` and existing
  target kinds are sufficient, structural stores work through portals,
  duplicate views stay isolated, invalid refs fail closed, and target rect
  semantics hold.
- Hiding product-only selection policy in Plite or, conversely, duplicating a
  durable focus/selection contract across registry items.
- Global React fan-out despite per-id logical subscriptions.
- Duplicate Yjs relative-position resolution, Plite Anchor semantics diverging
  from Yjs under a structural operation, affected-root fallback becoming the
  ordinary path, or per-commit mapping missing the 1,000-cursor budget.
- Geometry staleness under virtualization, nested scroll, transforms, or focus
  transitions.
- Atomic entrypoint removal missing generated docs/runtime/type/Turbo/Oxlint
  references or being tested against a different artifact than the release.
- One-source Find result-owner lifecycle proving awkward enough that
  implementation quietly adds a second matcher call, recovers ranges from
  slices, or globally rerenders matches.
- App-chosen segment-renderer order changing nested markup or overlap styling;
  the Find+Yjs browser fixture must pin both outputs and once-per-delegate
  invocation on the same segment.
- Timing calibration or consumer-bundle fixtures becoming snapshot theater
  instead of stable falsifiers.
- Copied item manifests compiling only inside the monorepo because direct
  optional peers or transitive registry dependencies were omitted.
