# Navigation Feedback Contract

## Goal

Define the long-term shared navigation-feedback contract for Plate so TOC,
footnotes, search jumps, and later anchor surfaces can reuse one
editor-scoped primitive instead of local flashes, overlay hacks, or selection
repair tricks.

## Status

- Phase: draft for consensus review
- Scope: architecture + implementation plan
- Decision target: permanent package home, API shape, rendering approach, and
  rollout

## RALPLAN-DR Summary

### Principles

1. Standardize only the overlap the current consumers have actually earned.
2. Resolve targets in feature packages, execute shared feedback in core.
3. Separate selection-driven navigation from flash-only consumers.
4. Use the cheapest visual primitive that satisfies current product needs.
5. Reuse existing editor/plugin seams before inventing extra stores or wrappers.

### Decision Drivers

1. **Permanent ownership**: the contract should live where future features
   expect to find it.
2. **Performance**: avoid rect measurement, scroll listeners, overlay layout,
   and extra DOM when simple node-target highlighting is enough.
3. **DX**: future packages should call one obvious API instead of re-rolling
   focus + scroll + flash logic.
4. **Reversal cost**: do not freeze a too-generic API in core before the target
   model is real.

### Viable Options

#### Option A — `@platejs/core` shared navigation plugin

Pros:

- best permanent home for a cross-surface editor contract
- aligns with existing shared plugin, DOM, and node-prop seams
- avoids semantic confusion with selection-only concerns
- exposes the most discoverable API for humans and agents

Cons:

- requires touching core plugin architecture
- raises reversal cost if the API is over-generalized too early

#### Option B — `@platejs/selection` shared host

Pros:

- already owns selection-adjacent UI and overlay surfaces
- could host a later range-overlay adapter naturally

Cons:

- semantically wrong as the primary owner
- makes cheap node-target feedback look like a selection feature
- risks dragging overlay assumptions into the base contract

#### Option C — feature-local implementations in `toc` / `footnote` / `search`

Pros:

- smallest local diff per feature
- easy to ship piecemeal

Cons:

- guaranteed drift
- duplicate timers / duplicate state / duplicate render logic
- worst long-term DX and maintenance story

### Recommendation

Choose **Option A**.

Put the permanent contract in `@platejs/core` as a **small shared navigation
plugin**, but keep Phase 1 intentionally narrow.

Do not put the permanent contract in `toc`, `footnote`, `floating`, or
primarily in `selection`.

`selection` is a reasonable future home for an optional range/overlay adapter,
not the primary owner of the navigation contract.

That recommendation is not “one giant abstraction for everything that moves the
viewport.” It is a slim core contract for the overlap Plate already has:

- replace prior nav feedback deterministically
- auto-clear after a short interval
- expose node-target flash semantics
- expose an opt-in selection-driven navigation helper

Search is **not** part of Phase 1 unless the plan intentionally expands to
range semantics.

## Problem Frame

Current law already says:

- successful nav should land focus or caret
- scroll target into view
- briefly highlight the landed target

Those rules now exist in:

- [markdown-editing-spec.md](docs/editor-behavior/markdown-editing-spec.md)
- [editor-protocol-matrix.md](docs/editor-behavior/editor-protocol-matrix.md)
- [editor-behavior-architecture.md](docs/research/systems/editor-behavior-architecture.md)

What does **not** exist yet is the shared runtime contract.

The two current consumers are related, but they are not identical:

- footnote navigation is selection-driven caret movement plus focus/scroll
- TOC click is DOM-scroll-first and only adds block-selection chrome after the
  scroll

So the contract should standardize the overlap, not pretend both flows are one
primitive today.

Without a shared contract for that overlap, every feature that jumps to a
target will keep re-implementing:

- target resolution handoff
- transient highlight timing
- replacement/clearing of prior target state
- eventual visual-token drift

That is dumb, slow to evolve, and guaranteed to drift.

## Decision

Build a shared **navigation feedback contract** in `packages/core`.

The plugin should own:

- canonical active nav target metadata
- pulse id / request id
- deterministic target replacement
- auto-clear timing
- transforms for:
  - flash-only consumers
  - selection-driven navigate consumers
- node-prop injection for target data attributes

Feature packages should continue to own **target resolution** only.

## ADR

### Decision

Implement the permanent navigation feedback contract in `@platejs/core` as a
shared plugin surface with shared transforms and shared render-state injection.

Do **not** lock Phase 1 to a broader “all navigation” abstraction than current
consumers justify.

### Drivers

- cross-surface reuse
- low rendering cost
- low conceptual cost
- predictable ownership
- future-proof path to broader target kinds

### Alternatives Considered

1. `@platejs/selection` as primary host
2. feature-local implementations
3. `@platejs/floating`
4. new package dedicated to navigation

### Why Chosen

`core` is where editor-wide contracts belong when they are:

- not specific to one feature family
- not inherently overlay geometry
- not fundamentally selection-only
- needed by multiple current and future surfaces

### Consequences

Good:

- one API
- one timer model
- one target-state story
- no duplicated flashing logic

Cost:

- a core plugin addition
- careful API design to avoid bloating the surface
- extra restraint so core does not standardize range/search semantics too early

### Follow-ups

- later optional range/overlay adapter can live in `selection`
- later richer app-shell surfaces can still reuse the same core transforms

## Best Runtime Shape

### 1. Core owns the contract

Use a two-layer core shape:

- lib layer owns the canonical contract and transforms
- React layer is a thin adapter for render-time consumption

That keeps the API permanent without letting a React store quietly become the
real contract.

#### Lib layer

Add a small editor-scoped lib plugin in `packages/core` that owns:

- current nav target
- nav request id / pulse id
- replacement of previous target
- auto-clear timer

Shared transforms:

```ts
editor.tf.navigation.flashTarget(...)
editor.tf.navigation.navigate(...)
```

#### React layer

Add only the React-side plugin/hook surface needed to expose the active nav
target to renderers and hooks.

Do **not** default to a separate `NavigationFeedbackStore` if plugin/editor
state can feed `inject.nodeProps` and render hooks cleanly.

Start with the lightest seam that works:

- plugin/editor state for canonical target metadata
- React helper/hook for render consumption
- dedicated store only if a real renderer constraint forces it

Hard requirement:

- prove that nav target changes trigger the render update needed for
  `inject.nodeProps` to add and remove highlight attributes without relying on
  unrelated selection churn

### 2. First-class consumer modes

Phase 1 should support two explicit modes:

1. **Selection-driven navigate**
   For consumers like footnote jumps that own a concrete caret/selection point.

2. **Flash-only target feedback**
   For consumers like TOC that should keep their current non-text-selection
   navigation behavior while still reusing shared flash timing and replacement
   semantics.

Do not force TOC into the footnote shape just to make the abstraction look
clean.

### 3. Feature packages resolve targets

Feature packages keep doing their own lookup:

- footnote resolves definition/ref path
- TOC resolves heading path/id
- search resolves match target
- comments/discussion resolve anchors

After resolution, they call the shared core navigation API.

### 4. Rendering is node-class / data-attribute first

Default visual implementation:

- apply transient `data-nav-target` / `data-nav-highlight` to the landed node
- style it with CSS animation

Why this wins:

- no rect measurement
- no scroll listeners
- no overlay layout
- no floating geometry
- no extra DOM layer
- works for block targets and inline void targets
- cheap enough to reuse everywhere

### 5. Overlay is later fallback, not default

Only add an overlay or range-painting adapter when a real surface needs:

- arbitrary text-range highlight
- targets without a stable rendered node
- complex multi-rect painting

That later adapter can live in `selection`.

## Proposed API

### Transform-first surface

```ts
editor.tf.navigation.flashTarget({
  target: { type: "node", path },
  variant: "navigated",
});
```

```ts
editor.tf.navigation.navigate({
  target: { type: "node", path },
  flash: { variant: "navigated" },
  focus: true,
  scroll: true,
  select: {
    anchor: point,
    focus: point,
  },
});
```

Design intent:

- `flashTarget(...)` is first-class, not a fallback helper
- `navigate(...)` is for selection-driven flows that should coordinate select,
  focus, scroll, and flash together
- do not require every consumer to supply selection semantics

### Initial target kinds

Phase 1A should support:

- `node` target by Slate path

Optional but deferred:

- `block-id`
- `range`
- custom DOM rect or virtual target

Do not start with a more generic target algebra unless the rollout explicitly
adds a consumer that needs it.

That means search is **deferred** until the team either:

- promotes `range` into the target model intentionally
- or proves the real search jump only needs node-target semantics

## Exact File Targets

### Core package

Add a lib plugin lane under `packages/core/src/lib/plugins/`:

- `packages/core/src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.ts`
- `packages/core/src/lib/plugins/navigation-feedback/index.ts`
- `packages/core/src/lib/plugins/navigation-feedback/types.ts`
- `packages/core/src/lib/plugins/navigation-feedback/transforms/flashTarget.ts`
- `packages/core/src/lib/plugins/navigation-feedback/transforms/navigate.ts`
- `packages/core/src/lib/plugins/navigation-feedback/transforms/index.ts`

Wire the lib plugin into:

- `packages/core/src/lib/plugins/index.ts`
- `packages/core/src/lib/plugins/getCorePlugins.ts`

Add a React-side lane under `packages/core/src/react/plugins/`:

- `packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.ts`
- `packages/core/src/react/plugins/navigation-feedback/useNavigationFeedback.ts`
- `packages/core/src/react/plugins/navigation-feedback/index.ts`

Wire the React layer into:

- `packages/core/src/react/plugins/index.ts`
- `packages/core/src/react/editor/getPlateCorePlugins.ts`

If node-prop injection needs a reusable core helper, prefer reusing existing
inject seams instead of creating ad hoc render wrappers:

- `packages/core/src/internal/plugin/pipeInjectNodeProps.tsx`
- `packages/core/src/internal/plugin/pluginInjectNodeProps.ts`

If scroll integration needs a shared option surface, inspect:

- `packages/core/src/lib/plugins/dom/DOMPlugin.ts`

Default split:

- lib plugin owns transforms and canonical contract
- React layer owns only the render-facing adapter/hook surface

Do not make a React store the contract itself unless the render pipeline proves
it is necessary.

### Feature package integrations

Footnote:

- `packages/footnote/src/lib/transforms/focusFootnoteDefinition.ts`
- `packages/footnote/src/lib/transforms/focusFootnoteReference.ts`

TOC:

- `packages/toc/src/react/hooks/useTocElement.ts`

Search:

- deferred until range-vs-node target semantics are explicit

### Render-layer CSS / UI consumers

Initial highlight styling should stay in app/editor UI until there is a proven
need to publish package-level styles:

- `apps/www/src/app/globals.css`
- or a dedicated registry/ui editor stylesheet if that is where the team wants
  the visual token to live

Do not block core plugin design on package-owned styling publication.

## Rollout Plan

### Phase 1A — Core contract + selection-driven consumer

1. Add the lib plugin + React plugin/hook + exports.
2. Add `flashTarget` and `navigate` transforms.
3. Add node-prop injection for `data-nav-target` / `data-nav-highlight`.
4. Add timer replacement / auto-clear behavior.
5. Integrate:
   - footnote ref -> def
   - footnote def -> ref

Notes:

- keep target kind to `node`
- prove the contract on selection-driven consumers first
- do not drag search into this phase

### Phase 1B — Non-selection consumer

Integrate TOC as a flash-first consumer on the same contract.

- preserve TOC’s current scroll behavior if that remains the cleanest seam
- reuse shared flash timing / replacement semantics
- do not force text selection where the surface does not want it
- treat any future “TOC should also land caret” decision as a separate UX
  choice, not something smuggled into the base contract

### Phase 2 — Explicit target-model expansion

Only after Phase 1A/1B prove stable:

1. decide whether search needs `range` targets or only node targets
2. if range is needed, design that as a real expansion, not a quiet patch
3. then integrate search

### Phase 3 — Hardening

1. unify variant naming and timeout policy
2. ensure replacement semantics are deterministic
3. add browser tests for visible target feedback

### Phase 4 — Deferred extension

Only if needed:

1. range targets
2. overlay adapter in `selection`
3. discussion/comment anchor consumers

## Test Plan

### Unit / package tests

Core:

- plugin registers in `getPlateCorePlugins`
- `flashTarget` sets target state
- new flash replaces prior state
- auto-clear timer clears the target
- `navigate` performs selection + scroll + flash in order
- node-prop injection adds/removes the expected data attributes
- render invalidation path updates highlight attributes without requiring a
  selection change

Feature consumers:

- footnote transforms call shared navigation API instead of owning flash locally
- TOC click path reuses shared flash timing / replacement semantics without
  forcing selection semantics

### Integration tests

- navigating from one target to another swaps highlight cleanly
- inline void target highlighting works
- block target highlighting works

### Browser verification

- footnote ref -> def visibly flashes target
- footnote def -> ref visibly flashes target
- TOC jump visibly flashes target

Deferred:

- search jump visibly flashes target once search target semantics are explicit

## Risks

1. **Too much generic abstraction too early**
   Mitigation:
   start with the overlap we have actually earned:
   `flashTarget` + selection-driven `navigate` on `node` targets

2. **Render-layer coupling**
   Mitigation:
   keep styling thin and data-attribute based

3. **Core surface bloat**
   Mitigation:
   expose only the minimum `flashTarget` / `navigate` transforms first

4. **TOC and footnote are not actually one primitive**
   Mitigation:
   make both consumer modes explicit in the contract instead of hiding the
   mismatch

5. **Feature packages still doing local flashes**
   Mitigation:
   explicitly migrate first consumers and delete local highlight logic

6. **Target state updates do not rerender the node tree cleanly**
   Mitigation:
   prove the render invalidation seam in Phase 1A; only add a minimal React
   store if plugin/editor state plus hooks cannot repaint the attributes

## Available Agent Types Roster

Best follow-up roles for execution:

- `architect`
  to pressure-test core/plugin ownership and API shape
- `executor`
  to implement the core plugin and first consumers
- `test-engineer`
  to add unit/integration/browser coverage
- `code-reviewer`
  for final API and layering review
- `verifier`
  for completion evidence

## Suggested Reasoning By Lane

- core contract + package boundaries: `high`
- feature integrations: `medium`
- tests + browser verification: `medium`

## Team / Ralph Handoff Guidance

### Ralph-friendly sequence

1. core plugin/API
2. footnote consumers
3. TOC consumer
4. decide search target model
5. search only if earned
6. verification pass

### Team-friendly split

- Worker 1: core plugin/API in `packages/core`
- Worker 2: footnote integration
- Worker 3: TOC integration
- Worker 4: tests and browser verification

If search is pulled into the same implementation wave, treat it as a separate
follow-up lane only after the target model decision is explicit.

### Verification path

- package tests first
- app integration tests second
- browser proof last
- only then treat the contract as real

## Recommendation

Build the permanent contract in `packages/core` as a shared navigation plugin.

Do not hide it in `selection`, `floating`, or feature packages just because
those seams already exist.
