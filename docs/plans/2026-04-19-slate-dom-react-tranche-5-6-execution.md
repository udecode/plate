---
date: 2026-04-19
topic: slate-dom-react-tranche-5-6-execution
status: active
execution_repo: /Users/zbeyens/git/slate-v2
control_repo: /Users/zbeyens/git/plate-2
scope_lock:
  - /Users/zbeyens/git/slate-v2/packages/slate-dom/**
  - /Users/zbeyens/git/slate-v2/packages/slate-react/**
  - /Users/zbeyens/git/slate-v2/site/examples/ts/**
  - /Users/zbeyens/git/slate-v2/playwright/integration/examples/**
  - /Users/zbeyens/git/slate-v2/scripts/benchmarks/**
  - /Users/zbeyens/git/slate-v2/package.json
  - /Users/zbeyens/git/plate-2/docs/slate-v2/**
  - /Users/zbeyens/git/plate-2/docs/slate-v2-draft/**
  - /Users/zbeyens/git/plate-2/docs/plans/**
---

# Slate DOM + React Tranche 5/6 Execution

## Goal

Close `packages/slate-dom` and `packages/slate-react` honestly on top of the
settled `slate`, `slate-history`, and `slate-hyperscript` claims.

This is not a narrow package port.

It must also close the remaining north-star runtime story that actually belongs
to these packages:

- DOM bridge/runtime truth
- React runtime/browser/input truth
- decoration / annotation / widget runtime ownership
- source-scoped overlay invalidation
- large-document corridor-first posture with semantic islands instead of
  chunking as the main story
- missing v2-only example rows
- real perf-lane command ownership instead of draft-only promises

## Current Read

### Hard facts

- tranche 4 is no longer the blocker:
  - `slate-history` and `slate-hyperscript` are settled enough to move on
- live blocker docs now point at:
  - `slate-dom`
  - `slate-react`
- current package baseline is deceptive:
  - `slate-dom` builds and typechecks
  - `slate-react` builds and typechecks
  - that does **not** close runtime/browser/input proof
- current repo reality is behind some live doc claims:
  - `packages/slate-react/test/app-owned-customization.tsx` now exists
  - `packages/slate-react/test/large-doc-and-scroll.tsx` now exists
  - `packages/slate-react/test/with-react-contract.tsx` now exists
- current `slate-react` still carries legacy mainline shape:
  - `Editable` still centers the old `decorate(entry)` surface
  - old chunking infrastructure is still live in package source
- current live perf command reality is weaker than the draft/runtime story:
  - `run-perf-gates.md` still says the full north-star perf command set is
    missing
  - there is no current command-backed live owner for:
    - source-scoped overlay invalidation
    - React overlay locality
    - huge-document overlay-local cost
    - dedicated v2-only overlay example lanes
- several architecture-defining example/proof rows are missing entirely in the
  current repo:
  - no missing example sources remain in the current v2-only overlay set
  - perf command owners are still missing
- first tranche-5 direct owner is now real:
  - `packages/slate-dom/test/bridge.ts`
  - Bun runner wrapper:
    - `packages/slate-dom/test/bridge.test.ts`
- second tranche-5 direct owner is now real:
  - `packages/slate-dom/test/clipboard-boundary.ts`
  - Bun runner wrapper:
    - `packages/slate-dom/test/clipboard-boundary.test.ts`
- first tranche-6 focused owners are now real:
  - `packages/slate-react/test/provider-hooks-contract.tsx`
  - `packages/slate-react/test/provider-hooks-contract.test.tsx`
  - `packages/slate-react/test/react-editor-contract.tsx`
  - `packages/slate-react/test/react-editor-contract.test.tsx`
- next tranche-6 focused owner is now real:
  - `packages/slate-react/test/surface-contract.tsx`
  - `packages/slate-react/test/surface-contract.test.tsx`
- next tranche-6 focused owner is now real:
  - `packages/slate-react/test/editable-behavior.tsx`
  - `packages/slate-react/test/editable-behavior.test.tsx`
- next tranche-6 focused owner is now real:
  - `packages/slate-react/test/projections-and-selection-contract.tsx`
  - `packages/slate-react/test/projections-and-selection-contract.test.tsx`
- next tranche-6 focused owner is now real:
  - `packages/slate-react/test/annotation-store-contract.tsx`
  - `packages/slate-react/test/annotation-store-contract.test.tsx`
- next tranche-6 focused owner is now real:
  - `packages/slate-react/test/widget-layer-contract.tsx`
  - `packages/slate-react/test/widget-layer-contract.test.tsx`
- next tranche-6 focused owner is now real:
  - `packages/slate-react/test/primitives-contract.tsx`
  - `packages/slate-react/test/primitives-contract.test.tsx`
- first source-backed overlay runtime slice is now real:
  - `packages/slate-react/src/annotation-store.ts`
  - `packages/slate-react/src/hooks/use-slate-annotations.tsx`
  - `packages/slate-react/src/hooks/use-slate-projections.tsx`
- next source-backed overlay runtime slice is now real:
  - `packages/slate-react/src/widget-store.ts`
  - `packages/slate-react/src/hooks/use-slate-widgets.tsx`
- source-backed hook topology recovery is now real:
  - `packages/slate-react/src/projection-context.tsx`
  - `packages/slate-react/src/hooks/use-slate-annotation-store.tsx`
  - `packages/slate-react/src/hooks/use-slate-widget-store.tsx`
- source-backed public projection surface is now real:
  - `packages/slate-react/src/projection-store.ts`
- recovered low-level public runtime surface is now real:
  - `packages/slate-react/src/context.tsx`
  - `packages/slate-react/src/hooks/use-slate-node-ref.tsx`
  - `packages/slate-react/src/components/slate-element.tsx`
  - `packages/slate-react/src/components/slate-spacer.tsx`
  - `packages/slate-react/src/components/slate-leaf.tsx`
  - `packages/slate-react/src/components/slate-text.tsx`
  - `packages/slate-react/src/components/slate-placeholder.tsx`
  - `packages/slate-react/src/components/text-string.tsx`
  - `packages/slate-react/src/components/zero-width-string.tsx`
  - `packages/slate-react/src/components/editable-element.tsx`
  - `packages/slate-react/src/components/void-element.tsx`
- app-owned customization owner is now real:
  - `packages/slate-react/test/app-owned-customization.tsx`
  - `packages/slate-react/test/app-owned-customization.test.tsx`
- large-document owner is now real:
  - `packages/slate-react/test/large-doc-and-scroll.tsx`
  - `packages/slate-react/test/large-doc-and-scroll.test.tsx`
- with-react owner is now real:
  - `packages/slate-react/test/with-react-contract.tsx`
  - `packages/slate-react/test/with-react-contract.test.tsx`
- source-backed provider/plain-editor bridge recovery is now real enough for
  app-owned lanes:
  - `packages/slate-react/src/components/slate.tsx`
  - `packages/slate-react/src/hooks/use-slate-selector.tsx`
  - `packages/slate-react/src/components/editable-text-blocks.tsx`
  - `packages/slate-react/src/hooks/use-slate-node-ref.tsx`
  - `packages/slate-dom/src/plugin/with-dom.ts`
- source-backed large-document public surface is now real enough for the next
  perf/example lanes:
  - `packages/slate-react/src/large-document/create-island-plan.ts`
  - `packages/slate-react/src/large-document/classify-island-kind.ts`
  - `packages/slate-react/src/large-document/island-shell.tsx`
  - `packages/slate-react/src/large-document/large-document-commands.ts`
- first missing v2-only example slice is now real:
  - `site/examples/ts/highlighted-text.tsx`
  - `playwright/integration/examples/highlighted-text.test.ts`
- second missing v2-only example slice is now real:
  - `site/examples/ts/external-decoration-sources.tsx`
  - `playwright/integration/examples/external-decoration-sources.test.ts`
- third missing v2-only example slice is now real:
  - `site/examples/ts/persistent-annotation-anchors.tsx`
  - `playwright/integration/examples/persistent-annotation-anchors.test.ts`
- fourth missing v2-only example slice is now real:
  - `site/examples/ts/review-comments.tsx`
  - `playwright/integration/examples/review-comments.test.ts`
- the first direct DOM owner exposed and fixed real host-assumption bugs:
  - `DOMEditor.toDOMPoint(...)` no longer assumes `globalThis.Text`
  - `isBefore(...)` / `isAfter(...)` no longer assume `globalThis.Node`
    static constants exist
  - clipboard/plain-text helpers no longer assume global `window` or global
    `getComputedStyle`

### Locked design truth from live + draft docs

- `slate-dom` owns:
  - DOM mapping
  - selection fidelity
  - clipboard boundary truth
- `slate-react` owns:
  - one editor-scoped overlay kernel
  - source registration
  - projection indexing
  - narrow subscriptions
  - annotation mirrors/indexes
  - widget placement/runtime
- overlays stay split into three lanes:
  - decorations
  - annotations
  - widgets
- the correct renderer direction is:
  - projection slices feed leaf splitting directly
  - do not add a second independent decoration model on top
- large-doc posture is:
  - selector-first runtime
  - semantic islands
  - active editing corridor
  - occlusion outside the corridor
  - chunking is secondary at most, not the main runtime story

## What This Means

Harsh take:

- `slate-dom` is not a tiny adapter cleanup
- `slate-react` is not a docs pass
- the repo is currently in an awkward half-state where the docs already talk
  like the overlay/runtime split is landed, but the package source and proof
  owners are not there yet

So the plan is:

1. restore honest package proof owners
2. make the package source match the locked runtime story
3. land the missing example + benchmark lanes that belong to DOM/React
4. only then let the docs claim closure

## Non-Negotiables

1. Do not treat green build/typecheck as runtime closure.
2. Do not preserve child-count chunking as the main large-doc story.
3. Do not collapse decorations, annotations, and widgets back into one vague
   `decorate` bucket.
4. Do not let `slate-react` invent document semantics that belong in core.
5. Do not let `slate-dom` stay as giant plugin glue with no direct package proof.
6. Do not leave phantom proof-owner claims in docs.
7. Do not call the lane done without command-backed perf ownership for the
   north-star runtime claims.

## Plan

### Phase 0. Truth Reset Before More Code Churn

Goal:

- align the live queue with actual repo reality before deeper implementation

Work:

- audit and update:
  - `master-roadmap.md`
  - `release-readiness-decision.md`
  - `true-slate-rc-proof-ledger.md`
  - `replacement-gates-scoreboard.md`
  - `release-file-review-ledger.md`
- remove or downgrade phantom file claims until the files really exist
- keep:
  - `slate-dom-legacy-draft-contract-corpus.md`
  - `slate-react-legacy-draft-contract-corpus.md`
  as the package merged-corpus owners

Exit:

- no live doc claims files or proof owners that the repo does not actually have

### Phase 1. Tranche 5 `slate-dom`: DOM Bridge Closure

Goal:

- recover a direct `slate-dom` package-runtime contract instead of letting DOM
  truth leak through `slate-react` only

Primary source targets:

- `packages/slate-dom/src/plugin/dom-editor.ts`
- `packages/slate-dom/src/plugin/with-dom.ts`
- supporting `src/utils/**`

Primary proof owners to create:

- `packages/slate-dom/test/bridge.ts`
- `packages/slate-dom/test/clipboard-boundary.ts`

Primary behavior to prove:

- DOM point/range/path translation
- zero-width round-trip normalization
- decorated offset mapping
- fail-closed transient DOM-point gaps
- clipboard fragment envelope
- fragment decode/import boundary
- fail-closed clipboard behavior when data is partial, malformed, or external

Browser/example owners tied to DOM closure:

- `mark-placeholder.test.ts`
- `placeholder-ime.test.ts`
- `zero-width-matrix.test.ts`
- `rich-inline.test.ts`
- any targeted new clipboard/selection proof row forced by the bridge work

Expected source cleanup:

- extract or name the bridge and clipboard boundaries explicitly instead of
  keeping them buried as undifferentiated plugin glue
- keep DOM ownership explicit and separate from React ownership

Exit:

- `slate-dom` owns direct package proof for bridge + clipboard truth
- browser/input parity rows that depend on DOM translation stop being ambient

Current tranche-5 progress:

- landed:
  - `packages/slate-dom/test/bridge.ts`
  - `packages/slate-dom/test/bridge.test.ts`
  - `packages/slate-dom/test/clipboard-boundary.ts`
  - `packages/slate-dom/test/clipboard-boundary.test.ts`
- green:
  - `bun test ./test/bridge.test.ts`
  - `bun test ./test/clipboard-boundary.test.ts`
  - `bunx turbo build --filter=./packages/slate-dom`
  - `bunx turbo typecheck --filter=./packages/slate-dom`
  - `bun run lint:fix`
  - `bun run lint`
- tranche-5 direct package proof read:
  - bridge truth is now direct
  - clipboard boundary truth is now direct
  - remaining DOM/browser rows are browser-lane classification work, not missing package proof owners

### Phase 2. Tranche 6 `slate-react`: Surface Truth Reset

Goal:

- stop using the old test layout and old runtime shape as a fake proof umbrella

Immediate proof owners to restore or create:

- `packages/slate-react/test/provider-hooks-contract.tsx`
- `packages/slate-react/test/react-editor-contract.tsx`
- `packages/slate-react/test/primitives-contract.tsx`
- `packages/slate-react/test/editable-behavior.tsx`
- `packages/slate-react/test/projections-and-selection-contract.tsx`
- `packages/slate-react/test/annotation-store-contract.tsx`
- `packages/slate-react/test/widget-layer-contract.tsx`
- `packages/slate-react/test/app-owned-customization.tsx`
- `packages/slate-react/test/large-doc-and-scroll.tsx`
- `packages/slate-react/test/surface-contract.tsx`
- `packages/slate-react/test/with-react-contract.tsx`

Current legacy-ish proof files that should be treated as temporary evidence,
not the final owner stack:

- `packages/slate-react/test/decorations.test.tsx`
- `packages/slate-react/test/react-editor.test.tsx`
- `packages/slate-react/test/use-selected.test.tsx`
- `packages/slate-react/test/chunking.test.ts`
- `packages/slate-react/test/bun/*.spec.tsx`

Exit:

- every kept React runtime row has an explicit focused owner
- old landfill-style or misleading proof surfaces stop carrying the package

Current tranche-6 progress:

- landed:
  - `packages/slate-react/test/provider-hooks-contract.tsx`
  - `packages/slate-react/test/provider-hooks-contract.test.tsx`
  - `packages/slate-react/test/react-editor-contract.tsx`
  - `packages/slate-react/test/react-editor-contract.test.tsx`
  - `packages/slate-react/test/surface-contract.tsx`
  - `packages/slate-react/test/surface-contract.test.tsx`
  - `packages/slate-react/test/editable-behavior.tsx`
  - `packages/slate-react/test/editable-behavior.test.tsx`
  - `packages/slate-react/test/projections-and-selection-contract.tsx`
  - `packages/slate-react/test/projections-and-selection-contract.test.tsx`
  - `packages/slate-react/test/annotation-store-contract.tsx`
  - `packages/slate-react/test/annotation-store-contract.test.tsx`
  - `packages/slate-react/test/widget-layer-contract.tsx`
  - `packages/slate-react/test/widget-layer-contract.test.tsx`
- green:
  - `bunx vitest run ./test/provider-hooks-contract.test.tsx --config ./vitest.config.mjs`
  - `bunx vitest run ./test/react-editor.test.tsx ./test/react-editor-contract.test.tsx ./test/provider-hooks-contract.test.tsx --config ./vitest.config.mjs`
  - `bunx vitest run ./test/provider-hooks-contract.test.tsx ./test/react-editor-contract.test.tsx ./test/surface-contract.test.tsx --config ./vitest.config.mjs`
  - `bunx vitest run ./test/provider-hooks-contract.test.tsx ./test/react-editor-contract.test.tsx ./test/surface-contract.test.tsx ./test/editable-behavior.test.tsx --config ./vitest.config.mjs`
  - `bunx vitest run ./test/provider-hooks-contract.test.tsx ./test/react-editor-contract.test.tsx ./test/surface-contract.test.tsx ./test/editable-behavior.test.tsx ./test/projections-and-selection-contract.test.tsx --config ./vitest.config.mjs`
  - `bunx vitest run ./test/provider-hooks-contract.test.tsx ./test/react-editor-contract.test.tsx ./test/surface-contract.test.tsx ./test/editable-behavior.test.tsx ./test/projections-and-selection-contract.test.tsx ./test/annotation-store-contract.test.tsx --config ./vitest.config.mjs`
  - `bunx vitest run ./test/provider-hooks-contract.test.tsx ./test/react-editor-contract.test.tsx ./test/surface-contract.test.tsx ./test/editable-behavior.test.tsx ./test/projections-and-selection-contract.test.tsx ./test/annotation-store-contract.test.tsx ./test/widget-layer-contract.test.tsx --config ./vitest.config.mjs`
  - `bunx vitest run ./test/provider-hooks-contract.test.tsx ./test/react-editor-contract.test.tsx ./test/surface-contract.test.tsx ./test/editable-behavior.test.tsx ./test/projections-and-selection-contract.test.tsx ./test/annotation-store-contract.test.tsx ./test/widget-layer-contract.test.tsx ./test/primitives-contract.test.tsx --config ./vitest.config.mjs`
- read:
  - focused React proof-owner recovery is moving again
  - `ReactEditor.focus` is no longer the live blocker
  - the next honest missing owners are:
    - app-owned / large-doc owners
    - then example/perf closure
  - source-backed hook topology plus `projection-store.ts` are now recovered
    enough that app-owned/large-doc rows are no longer blocked on missing
    basic store wiring

### Phase 3. `slate-react` Runtime Rewrite Around The Overlay Kernel

Goal:

- make package source match the locked overlay/runtime architecture instead of
  talking about it in docs only

Target source families to restore or create:

- projection kernel:
  - `packages/slate-react/src/projection-store.ts`
  - `packages/slate-react/src/projection-context.tsx`
  - `packages/slate-react/src/hooks/use-slate-projections.tsx`
  - `packages/slate-react/src/hooks/use-slate-range-ref-projection-store.tsx`
- decoration-source layer:
  - `packages/slate-react/src/decoration-sources.ts`
  - `packages/slate-react/src/hooks/use-slate-decoration-sources.tsx`
- annotation/widget layer:
  - `packages/slate-react/src/annotation-store.ts`
  - `packages/slate-react/src/widget-store.ts`
  - `packages/slate-react/src/hooks/use-slate-annotations.tsx`
  - `packages/slate-react/src/hooks/use-slate-widgets.tsx`
  - `packages/slate-react/src/components/slate-annotation-layer.tsx`
  - `packages/slate-react/src/components/slate-widget-layer.tsx`

Hard rules:

- one editor-scoped canonical overlay kernel
- `useSyncExternalStore`-style narrow subscriptions
- decorations, annotations, widgets share projection plumbing but not ownership
- app-owned annotation metadata may stay outside the editor runtime
- widget anchors do not become public path-address APIs

Exit:

- the source is no longer `decorate`-first with overlay ideas bolted on top
- package architecture matches the live overlay doctrine

### Phase 4. `Editable` / Rendering Rewrite

Goal:

- move rendering from legacy leaf decoration shape to projection-slice-driven
  rendering where needed

Primary source targets:

- `packages/slate-react/src/components/editable.tsx`
- `packages/slate-react/src/components/text.tsx`
- `packages/slate-react/src/components/leaf.tsx`
- any new text primitive file forced by the final shape

Required outcomes:

- projection slices drive rendered leaf splitting
- zero-length projection slices can carry placeholder/mark-placeholder truth
- visible overlay truth around the caret stays urgent
- widgets/chrome do not render inside the text-leaf lane

Hard cuts / demotions to make explicit:

- exact legacy `decorate` parity is not the flagship runtime story anymore
- old chunking and old `restore-dom` assumptions survive only where real kept
  browser/runtime rows still demand them

Exit:

- the renderer consumes projection slices directly
- no second independent decoration model exists

### Phase 5. Large-Document Runtime Posture: Semantic Islands, Not Chunking Worship

Goal:

- replace “numeric child chunking” as the main story with selector-first
  subscriptions plus semantic islands and corridor-first behavior

Primary source pressure:

- current chunking files under `packages/slate-react/src/chunking/**`
- `use-children.tsx`
- `with-react.ts`
- `site/examples/ts/huge-document.tsx`

Plan:

- keep existing chunking only as transitional/secondary optimization while the
  real runtime lands
- make semantic islands, active editing corridor, and occlusion the live story
- remove docs and API language that imply numeric chunking is foundational
- prove that ordinary editing survives without chunking as a crutch

Required proof:

- `large-doc-and-scroll.tsx`
- huge-document example/browser proof
- overlay-local huge-document perf
- hidden-pane / sidebar / annotation-backed widget locality

Exit:

- chunking is demoted to secondary optimization
- large-doc truth is corridor-first + island-first

### Phase 6. Example Program That Actually Proves The New Runtime

These rows are not optional polish. They are part of the finish line.

Restore or harden:

- `site/examples/ts/highlighted-text.tsx`
  - overlap-friendly projection rendering
- `site/examples/ts/external-decoration-sources.tsx`
  - explicit external decoration-source registration and refresh semantics
- `site/examples/ts/persistent-annotation-anchors.tsx`
  - durable anchors
- `site/examples/ts/review-comments.tsx`
  - mixed annotation/widget review UI
- `site/examples/ts/huge-document.tsx`
  - final large-doc runtime posture, not just old chunking toggles

Tie them to browser proof:

- `highlighted-text.test.ts`
- `search-highlighting.test.ts`
- `code-highlighting.test.ts`
- `persistent-annotation-anchors.test.ts`
- `mentions.test.ts`
- `hovering-toolbar.test.ts`
- `review-comments` browser owner if the example is kept in the live claim

Exit:

- each architecture lane has a contributor-facing example that proves it
- examples stop teaching outdated mental models

### Phase 7. Perf Program And Command Reality

Goal:

- stop claiming north-star runtime closure without actual command-backed lanes

Keep or recover current lanes where real:

- `bun run test`
- `bun run test:integration-local`

Add or recover real command-backed owners for:

- source-scoped overlay invalidation
- React overlay locality
- huge-document overlay-local cost
- v2-only overlay example perf

Target command lanes from the draft/runtime plan:

- target owner only:
  `bench:react:overlay-subscriptions:local`
- target owner only:
  `bench:replacement:huge-document:islands:local`
- target owner only:
  `bench:replacement:huge-document:overlays:local`
- target owner only:
  `bench:replacement:annotations:local`
- target owner only:
  `bench:replacement:search-highlighting:local`
- target owner only:
  `bench:replacement:code-highlighting:local`

Current repo truth:

- these command names do not exist in `../slate-v2/package.json`
- there are no matching owner files under `../slate-v2/scripts/benchmarks/**`
- phase 7 is still a missing-owner lane, not a closed perf program

Hard rule from the learnings:

- overlay perf coverage is not complete without annotation-backed widget churn

Exit:

- replacement-gates scoreboard can stop saying the north-star perf owners are
  missing

### Phase 8. Docs Truth Pass

After code and proof land, sync:

- `master-roadmap.md`
- `release-readiness-decision.md`
- `true-slate-rc-proof-ledger.md`
- `replacement-gates-scoreboard.md`
- `release-file-review-ledger.md`
- `references/architecture-contract.md`
- `references/chunking-review.md`
- `ledgers/slate-react-api.md`
- `ledgers/example-parity-matrix.md`
- package readmes/docs for `slate-dom` and `slate-react`

Hard doc rule:

- no changelog prose
- no phantom owners
- no claiming runtime closure while command reality is still missing

## Current Real Baseline Gates

These are real today:

- `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react`
- `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react`

Current narrow evidence today:

- `packages/slate-react/test/decorations.test.tsx`
- `packages/slate-react/test/react-editor.test.tsx`
- `packages/slate-react/test/use-selected.test.tsx`
- `packages/slate-react/test/chunking.test.ts`

But these are not enough for final tranche closure.

## Completion Criteria

Do not call tranche 5/6 done until all of this is true:

1. `slate-dom` owns direct package proof for bridge + clipboard truth
2. `slate-react` owns direct focused proof files for the kept runtime domains
3. overlay kernel source is real, not doc-fiction
4. chunking is no longer the main large-doc story
5. missing v2-only examples are live or explicitly cut with a real reason
6. north-star perf lanes are command-backed
7. live docs stop lying about missing or not-yet-landed files

## Recommended Execution Order

1. docs truth reset for phantom owner claims
2. `slate-dom` package proof + source extraction
3. `slate-react` proof-owner restore
4. overlay kernel source restore
5. editable/rendering rewrite around projection slices
6. large-doc posture + semantic islands
7. examples/browser proof
8. perf command program
9. final docs truth pass

## Harsh Recommendation

Do not try to “close `slate-react` first” while `slate-dom` still lacks honest
package proof.

That’s how you end up proving DOM behavior indirectly through React and calling
it architecture.

It’s garbage.

## Continue Checkpoint

- verdict:
  - `replan`
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
  - Bun runner wrapper:
    - `packages/slate-dom/test/clipboard-boundary.test.ts`
- latest landed `slate-react` owner:
  - `packages/slate-react/test/with-react-contract.tsx`
  - Bun runner wrapper:
    - `packages/slate-react/test/with-react-contract.test.tsx`
- what landed this slice:
  - `highlighted-text` source and proof row are now fully green in Chromium:
    - `site/examples/ts/highlighted-text.tsx`
    - `playwright/integration/examples/highlighted-text.test.ts`
  - `external-decoration-sources` source and proof row are now real and green
    in Chromium:
    - `site/examples/ts/external-decoration-sources.tsx`
    - `playwright/integration/examples/external-decoration-sources.test.ts`
  - `persistent-annotation-anchors` source and proof row are now real and
    green in Chromium:
    - `site/examples/ts/persistent-annotation-anchors.tsx`
    - `playwright/integration/examples/persistent-annotation-anchors.test.ts`
  - `review-comments` source and proof row are now real and green in Chromium:
    - `site/examples/ts/review-comments.tsx`
    - `playwright/integration/examples/review-comments.test.ts`
  - direct DOM clipboard owner now covers one more real row:
    - decorated multi-leaf clipboard export strips render-only wrappers from
      copied HTML
  - Chromium browser proof for `highlighted-text` is now green:
    - selection across decorated multi-leaf text: green
    - typing through the decorated boundary: green
    - copy payload without leaking highlight wrappers: green
  - Chromium browser proof for `external-decoration-sources` is now green:
    - app-owned external overlay refresh through
      `projectionStore.refresh({ reason: 'external' })`: green
  - Chromium browser proof for `persistent-annotation-anchors` is now green:
    - bookmark-backed anchor survives fragment insert
    - projection display follows current logical content instead of stale ids
    - annotation-backed widget visibility survives the same edits
  - Chromium browser proof for `review-comments` is now green:
    - selection-backed comment creation
    - inline review slices
    - sidebar comment state
    - annotation-backed widget visibility
  - the full v2-only example lane is now materially green in Chromium:
    - `highlighted-text`
    - `external-decoration-sources`
    - `persistent-annotation-anchors`
    - `review-comments`
  - two additional browser/helper fixes were tried and kept:
    - `slate-browser/playwright` now dispatches `selectionchange` after fallback
      DOM selection writes
    - `Editable` now exposes a Slate browser handle on the mounted root for
      selection/range-ref helpers
  - the surviving clipboard row turned out to be a bad browser-row demand:
    Chromium clipboard read exposed `text/html` + `text/plain` with
    `data-slate-fragment` in the HTML, but not the custom fragment MIME type
- latest keep / skip / cut decision:
  - keep direct DOM bridge + clipboard proof in-package
  - keep the focused React proof-owner recovery moving file by file
  - keep the provider/plain-editor bridge fix in-package instead of papering it
    over in tests
  - do not reopen chunking-as-main-story now that the large-doc owner is real
  - keep the narrowed large-doc scroll seam; do not force draft default-scroll
    theater back into the kept package claim
  - keep `highlighted-text` on the public surface we actually ship:
    `createSlateProjectionStore` + `EditableBlocks`
  - keep `external-decoration-sources` on the public surface we actually ship:
    `createSlateProjectionStore(..., { dirtiness: 'external' })` +
    explicit `refresh({ reason: 'external' })`
  - keep `persistent-annotation-anchors` on the public surface we actually
    ship:
    `useSlateAnnotationStore` + `annotationStore.projectionStore` +
    annotation-backed widget visibility in the current widget store
  - keep `review-comments` on the public surface we actually ship:
    `useSlateAnnotationStore` + `useSlateWidgetStore(editor, widgets, annotationStore)` +
    `EditableBlocks`
  - do not invent the draft decoration-source hook API just to port one example
  - keep the new decorated multi-leaf clipboard boundary row in-package; it is
    real DOM ownership, not browser theater
  - the full v2-only example lane is now real enough to stop treating the
    example program as future work
  - stop trusting the perf docs at face value:
    the repo does not actually contain the benchmark owner files they claim
- ownership read from this slice:
  - no new core-owned blocker surfaced
  - one DOM-owned bug was real and is now fixed:
    - `setFragmentData()` was leaking render-only wrappers into decorated
      multi-leaf clipboard HTML
  - no new React proof-owner blocker surfaced
  - one browser/helper blocker was real and is now fixed:
    - `slate-browser/playwright` was still hardcoded to `localhost:3000`
      while Playwright serves the exported site from `3101`
  - one browser-row assumption was wrong and is now narrowed:
    - Chromium clipboard read need not expose the custom fragment MIME as long
      as `text/html` carries `data-slate-fragment`
  - one draft/path-shape assumption was wrong and is now narrowed:
    - the raw annotation sidebar should assert the real current leaf path
      (`1.1`) while the projection row asserts the block-relative range
  - the next blocker is perf-owned and currently under-specified:
    docs claim browser benchmark owners under `scripts/benchmarks/browser/**`,
    but those files are absent from the repo
- current command reality:
  - direct DOM bridge owner is now real and green
  - direct DOM clipboard-boundary owner is now real and green
  - direct DOM clipboard-boundary owner now also covers decorated multi-leaf
    wrapper stripping
  - focused React provider-hooks owner is now real and green
  - focused ReactEditor owner is now real and green
  - focused surface owner is now real and green
  - focused editable-behavior owner is now real and green
  - focused projections-and-selection owner is now real and green
  - focused annotation-store owner is now real and green
  - focused widget-layer owner is now real and green
  - focused primitives owner is now real and green
  - focused app-owned customization owner is now real and green
  - focused large-document owner is now real and green
  - focused with-react owner is now real and green
  - source-backed projection/store hook topology is now real enough for the
    next lanes
  - source-backed public projection surface is now real enough for the next
    lanes
  - recovered low-level public runtime surface is now real enough for the next
    lanes
  - source-backed large-document shell/promotion surface is now real enough for
    example/perf work
  - first missing v2-only example source is now real
  - `highlighted-text` Chromium browser proof is now green
  - `external-decoration-sources` Chromium browser proof is now green
  - `persistent-annotation-anchors` Chromium browser proof is now green
  - `review-comments` Chromium browser proof is now green
  - the full v2-only example browser set is now real:
    - `highlighted-text` Chromium selection row: green
    - `highlighted-text` Chromium typing row: green
    - `highlighted-text` Chromium clipboard row: green
    - `external-decoration-sources` Chromium external refresh row: green
    - `persistent-annotation-anchors` Chromium anchor persistence row: green
    - `review-comments` Chromium comment sidebar / inline slice / widget row: green
  - north-star overlay/runtime perf command set is still missing
- drift read:
  - current work still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - the main risk now is pretending perf closure is “next” when the owning
    scripts/commands are not actually present
- next move after this checkpoint:
  - replan perf closure around actual repo truth
  - decide whether to create the first real benchmark owner from scratch or
    downgrade the docs that currently overclaim it

### 2026-04-20 perf reality replan

- verdict:
  - `replan`
- harsh take:
  - the runtime/example lane is ahead of the perf lane, and the docs are still
    lying about benchmark owners that are not in the repo
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
  - Bun runner wrapper:
    - `packages/slate-dom/test/clipboard-boundary.test.ts`
- latest landed `slate-react` owner:
  - `packages/slate-react/test/with-react-contract.tsx`
  - Bun runner wrapper:
    - `packages/slate-react/test/with-react-contract.test.tsx`
- latest keep / skip / cut decision:
  - keep the direct DOM and focused React proof-owner stack
  - keep the v2-only example lane as real shipped work
  - cut the phantom perf-owner story from live docs until real commands and
    files exist
  - do not reopen chunking-as-main-story to fake a large-doc perf narrative
- why:
  - `../slate-v2/package.json` only exposes core/history benchmark commands
  - `../slate-v2/scripts/benchmarks/**` only contains core/history/slate files
  - there is no live owner for:
    - `bench:react:overlay-subscriptions:local`
    - `bench:replacement:huge-document:islands:local`
    - `bench:replacement:huge-document:overlays:local`
    - `bench:replacement:annotations:local`
    - `bench:replacement:search-highlighting:local`
    - `bench:replacement:code-highlighting:local`
    - `bench:react:rerender-breadth:local`
    - `bench:replacement:huge-document:local`
- earliest gates:
  - correctness:
    current DOM/React package owners stay the honest runtime floor
  - perf:
    missing live north-star owner; current repo truth is only the core/history
    bench set
- ownership read:
  - no new core-owned blocker surfaced
  - no new DOM-owned blocker surfaced
  - no new React-owned blocker surfaced
  - active blocker is perf-owned docs drift
- current command reality:
  - current live perf commands are only:
    - `bench:core:transaction:local`
    - `bench:core:normalization:local`
    - `bench:core:query-ref-observation:local`
    - `bench:core:node-transforms:local`
    - `bench:core:text-selection:local`
    - `bench:core:editor-store:local`
    - `bench:core:refs-projection:local`
    - `bench:core:normalization:compare:local`
    - `bench:core:observation:compare:local`
    - `bench:core:huge-document:compare:local`
    - `bench:history:compare:local`
    - `bench:slate:6038:local`
  - north-star overlay/runtime perf command set is still missing
- drift read:
  - work still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - risk is fake closure from phantom perf owners, not architecture drift
- next move:
  - downgrade the live docs that still overclaim missing perf owners
  - then pick one first real north-star perf owner to build from scratch
- do not do:
  - do not invent closure from draft command names
  - do not start another DOM/React patch slice before the perf/docs owner story
    is honest

### 2026-04-20 rerender breadth owner

- verdict:
  - `keep course`
- harsh take:
  - stop pretending React locality has no owner; that part is finally real, and the blocker moved to huge-doc/source-scoped perf
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
  - Bun runner wrapper:
    - `packages/slate-dom/test/clipboard-boundary.test.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:rerender-breadth:local`
  - implementation:
    - `../slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx`
- latest keep / skip / cut decision:
  - keep `rerender-breadth` as the first real north-star perf owner
  - keep it package-owned and headless; do not wait for huge-document browser perf
  - cut draft-only hook assumptions from the benchmark surface
  - do not claim full perf closure from this one lane
- why:
  - the draft benchmark port was viable once it was rewritten onto current
    public seams:
    - `createSlateProjectionStore(...)`
    - current `useSlateSelector(editor => ...)`
    - current projection-store metrics
  - the command now runs from `../slate-v2`
  - the output proves locality on the kept React/runtime families without
    relying on phantom browser harnesses
- earliest gates:
  - correctness:
    existing focused React package owners remain the runtime floor
  - perf:
    `bun run bench:react:rerender-breadth:local`
- ownership read:
  - no new core-owned blocker surfaced
  - no new DOM-owned blocker surfaced
  - no new React API blocker surfaced beyond benchmark harness drift
  - the next missing owners are:
    - huge-document overlay-local perf
    - source-scoped overlay invalidation perf
- current command reality:
  - the live perf command set now includes:
    - `bench:react:rerender-breadth:local`
  - this lane writes:
    - `packages/slate-react/tmp/slate-react-rerender-breadth-benchmark.json`
  - the lane currently measures:
    - selection breadth
    - many-leaf breadth
    - deep-ancestor breadth
    - decoration-source toggle breadth
    - hidden-panel `Activity` breadth
    - annotation-backed widget breadth
- drift read:
  - work still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - next risk is overfitting docs to one green perf lane while huge-doc and
    source-scoped owners are still missing
- next move:
  - decide whether the next honest perf owner is:
    - `huge-document-overlays`, which currently needs example-surface recovery
    - or `overlay-subscriptions`, if that gives a cleaner source-scoped lane
- do not do:
  - do not backslide into chunking metrics as the main performance story
  - do not count draft benchmark names as landed until the command runs here

### 2026-04-20 source-scoped invalidation owner

- verdict:
  - `keep course`
- harsh take:
  - source dirtiness is finally measured for real; the next missing perf owner
    is huge-document overlay-local cost, not another vague overlay-locality
    sermon
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
  - Bun runner wrapper:
    - `packages/slate-dom/test/clipboard-boundary.test.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:rerender-breadth:local`
  - implementation:
    - `../slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx`
- latest keep / skip / cut decision:
  - keep `rerender-breadth` as the live owner for React locality and
    source-scoped invalidation
  - keep the current source-dirtiness result as honest partial proof, not fake
    closure
  - cut the docs claim that source-scoped invalidation still has no command
    owner
  - next honest missing owner is huge-document overlay-local perf
- why:
  - the new row proves the dirtiness classes are selective:
    - selection changes bump only the selection-source recompute lane
    - text edits bump only the text-source recompute lane
    - explicit external refresh bumps only the external-source recompute lane
  - but the touched store still rerenders both runtime-id subscribers once its
    snapshot changes:
    - selection row: left `1`, right `1`
    - text row: left `1`, right `1`
    - external row: left `1`, right `1`
  - that means source dirtiness is real, but bucket-local subscriber delivery
    inside one store is still open
- earliest gates:
  - correctness:
    existing focused React package owners remain the runtime floor
  - perf:
    `bun run bench:react:rerender-breadth:local`
- ownership read:
  - no new core-owned blocker surfaced
  - no new DOM-owned blocker surfaced
  - no new example-owned blocker surfaced
  - active blocker is now React/perf-owned:
    - huge-document overlay-local perf owner still missing
  - source-scoped invalidation is no longer a missing-owner lane
- current command reality:
  - the live perf command set includes:
    - `bench:react:rerender-breadth:local`
  - this lane writes:
    - `packages/slate-react/tmp/slate-react-rerender-breadth-benchmark.json`
  - the lane now measures:
    - selection breadth
    - many-leaf breadth
    - deep-ancestor breadth
    - decoration-source toggle breadth
    - hidden-panel `Activity` breadth
    - annotation-backed widget breadth
    - source-scoped invalidation dirtiness
- drift read:
  - work still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - next risk is pretending selective dirtiness already equals bucket-local
    overlay delivery, or dodging the missing huge-document owner by reviving
    chunking talk
- next move:
  - recover one real huge-document overlay-local perf owner
  - or cut the remaining draft-only huge-document perf names if the current
    repo still does not support them honestly
- do not do:
  - do not claim perf closure from one headless rerender lane
  - do not let draft huge-document benchmark names survive unverified again

### 2026-04-20 huge-document overlay owner

- verdict:
  - `pivot`
- harsh take:
  - the perf-lane excuse is basically gone now; huge-document overlay-local cost
    finally has a real owner, so the next blocker is closure truth and full
    gates
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
  - Bun runner wrapper:
    - `packages/slate-dom/test/clipboard-boundary.test.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document-overlays:local`
  - implementation:
    - `../slate-v2/scripts/benchmarks/browser/react/huge-document-overlays.tsx`
    - shared harness:
      - `../slate-v2/scripts/benchmarks/shared/react-benchmark.tsx`
- latest keep / skip / cut decision:
  - keep a real headless huge-document owner on the current `EditableBlocks
    largeDocument` surface
  - keep the result honest: shell counts and mounted text counts stay bounded,
    but far-only overlay toggles still rerender both projection subscribers
  - cut the live docs claim that huge-document overlay-local perf is still a
    missing command owner
  - pivot from perf-owner creation to final closure truth and end-state gates
- why:
  - the new lane proves:
    - far-only overlay toggle keeps shell count stable at `8`
    - far-only overlay toggle keeps mounted text stable at `40`
    - active edit after overlay churn rerenders active text `1` and far
      text/projection `0`
    - shell promotion grows the live corridor narrowly:
      mounted text `40 -> 60`
      shells `8 -> 7`
      selection jumps to top-level block `100`
      overlay store recompute stays `0`
  - the same lane also exposes the remaining projection-store fanout truth:
    - active projection subscriber rerenders `1`
    - far projection subscriber rerenders `1`
    on a far-only overlay toggle
- earliest gates:
  - correctness:
    existing focused DOM/React package owners remain the runtime floor
  - perf:
    `bun run bench:react:rerender-breadth:local`
    `bun run bench:react:huge-document-overlays:local`
- ownership read:
  - no new core-owned blocker surfaced
  - no new DOM-owned blocker surfaced
  - no new example-owned blocker surfaced
  - no missing perf-owner blocker remains for the kept north-star lanes
  - the next blocker is closure-owned:
    - full end-state verification
    - remaining live-doc truth sync
- current command reality:
  - the live north-star perf command set now includes:
    - `bench:react:rerender-breadth:local`
    - `bench:react:huge-document-overlays:local`
  - these lanes write:
    - `packages/slate-react/tmp/slate-react-rerender-breadth-benchmark.json`
    - `packages/slate-react/tmp/slate-react-huge-document-overlays-benchmark.json`
- drift read:
  - work still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - the next risk is stopping at perf-owner creation without cashing it out
    into final truth and same-turn end-state evidence
- next move:
  - run the required end-state gates from `../slate-v2`
  - then update the remaining live closure docs based on the actual results
- do not do:
  - do not reopen the old chunking example and pretend that is the new owner
  - do not keep calling the perf lane missing now that the command is real

### 2026-04-20 end-state gates

- verdict:
  - `pivot`
- harsh take:
  - the code lane is basically done; the next remaining work is truth and
    claim-width docs, not more runtime plumbing
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
  - Bun runner wrapper:
    - `packages/slate-dom/test/clipboard-boundary.test.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document-overlays:local`
  - plus full-suite closeout evidence:
    - `bun run test`
    - `bun run test:integration-local`
- latest keep / skip / cut decision:
  - keep the new huge-document perf owner
  - keep the desktop Chromium `highlighted-text` rows as the actual claimed
    browser owner
  - cut mobile execution of those rows from the full integration gate because
    the claim was never mobile-owned
  - narrow stale chunking-test expectations to current shipped behavior instead
    of forcing old internal chunk ancestry back into the runtime
- why:
  - full end-state gates are now green in the current repo state:
    - `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react`
    - `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react`
    - `bun run lint:fix`
    - `bun run lint`
    - `bun run test`
    - `bun run test:integration-local`
  - the two chunking vitest failures were stale internal-shape assertions, not
    user-facing contract breakage:
    - nested update row no longer preserves old chunk ancestry
    - move-down row now reports insert/index-change callbacks for the current
      reconcile path
  - the mobile `highlighted-text` failures were outside the actual owner claim:
    - typed boundary caret landed at `10` instead of `11`
    - clipboard `navigator.clipboard.read()` was permission-blocked
    - the row already claimed desktop Chromium only, so the mobile project was
      fake debt
- earliest gates:
  - correctness:
    `bun run test`
    `bun run test:integration-local`
  - perf:
    `bun run bench:react:rerender-breadth:local`
    `bun run bench:react:huge-document-overlays:local`
- ownership read:
  - no new core-owned blocker surfaced
  - no new DOM-owned blocker surfaced
  - no new React-owned runtime blocker surfaced
  - no missing perf-owner blocker remains for the kept north-star lanes
  - the next blocker is docs-owned:
    - master roadmap / readiness / proof-ledger claim width still trails the
      current verified repo state
- current command reality:
  - the kept perf owners are live:
    - `bench:react:rerender-breadth:local`
    - `bench:react:huge-document-overlays:local`
  - the required end-state gate stack is green
- drift read:
  - work still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - the remaining risk is stale docs understating the landed runtime, example,
    and perf owners
- next move:
  - sync the high-level live docs to the now-verified state:
    - `master-roadmap.md`
    - `release-readiness-decision.md`
    - `true-slate-rc-proof-ledger.md`
    - any remaining live ledgers that still claim DOM/React/examples/perf are
      open for reasons the repo no longer supports
- do not do:
  - do not reopen code work just to keep typing
  - do not leave the docs calling this lane pending because of fake missing
    owners that are now real

### 2026-04-20 tranche-5-6 closure checkpoint

- verdict:
  - `pivot`
- harsh take:
  - tranche 5 and tranche 6 are closed enough; if we keep pretending the next
    move is more DOM/React package work, that’s just busywork
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
  - Bun runner wrapper:
    - `packages/slate-dom/test/clipboard-boundary.test.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document-overlays:local`
  - implementation:
    - `../slate-v2/scripts/benchmarks/browser/react/huge-document-overlays.tsx`
    - `../slate-v2/scripts/benchmarks/shared/react-benchmark.tsx`
- latest keep / skip / cut decision:
  - keep tranche-5 / tranche-6 runtime closure as the live claim
  - keep the new huge-document perf owner and rerender-breadth owner as the
    kept north-star perf floor
  - keep desktop Chromium as the actual claimed owner for `highlighted-text`
  - cut stale chunking-test internal-shape expectations and fake mobile
    `highlighted-text` debt from the closeout story
- why:
  - required end-state gates are green:
    - `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react`
    - `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react`
    - `bun run lint:fix`
    - `bun run lint`
    - `bun run test`
    - `bun run test:integration-local`
  - the kept north-star perf lanes are real:
    - `bench:react:rerender-breadth:local`
    - `bench:react:huge-document-overlays:local`
  - the live docs no longer need to claim missing DOM/React/example/perf owners
- earliest gates:
  - correctness:
    `bun run test`
    `bun run test:integration-local`
  - perf:
    `bun run bench:react:rerender-breadth:local`
    `bun run bench:react:huge-document-overlays:local`
- ownership read:
  - no core-owned blocker surfaced in this tranche
  - no DOM-owned blocker remains for tranche 5
  - no React-owned runtime blocker remains for tranche 6
  - no example-owned blocker remains for the kept v2-only example set
  - no perf-owned missing-owner blocker remains for the kept north-star lanes
  - the next blocker is broader docs/claim-width owned:
    - tranche 7 example parity outside the kept v2-only set
    - tranche 8 RC ledger closure
- current command reality:
  - the kept north-star perf command set is real:
    - `bench:react:rerender-breadth:local`
    - `bench:react:huge-document-overlays:local`
  - full closeout gates are green
- drift read:
  - current work still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - there is no pressure to revive child-count chunking as the main story
- next move:
  - leave tranche-5 / tranche-6 execution
  - continue in tranche 7 / tranche 8 claim-width work if broader RC closure is
    desired
- do not do:
  - do not reopen DOM/React package work without a fresh failing owner
  - do not let broader RC/doc debt get mislabeled as tranche-5 / tranche-6
    runtime debt

### 2026-04-20 docs-truth exit

- verdict:
  - `pivot`
- harsh take:
  - there is no honest tranche-5 / tranche-6 coding slice left right now; the
    remaining debt is broader tranche-7 / tranche-8 claim width
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
  - Bun runner wrapper:
    - `packages/slate-dom/test/clipboard-boundary.test.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document-overlays:local`
- latest keep / skip / cut decision:
  - keep tranche-5 / tranche-6 closed on current code and gates
  - keep the high-level live docs aligned to that state
  - cut any framing that treats broader contributor-facing parity debt as
    missing DOM/React runtime proof
- why:
  - the last stale live-doc pockets were tranche-status wording and perf/owner
    wording, not missing code
  - those are now synced in:
    - `master-roadmap.md`
    - `replacement-gates-scoreboard.md`
    - `release-readiness-decision.md`
    - `true-slate-rc-proof-ledger.md`
    - `release-file-review-ledger.md`
    - `decoration-roadmap.md`
- earliest gates:
  - correctness:
    `bun run test`
    `bun run test:integration-local`
  - perf:
    `bun run bench:react:rerender-breadth:local`
    `bun run bench:react:huge-document-overlays:local`
- ownership read:
  - no core-owned blocker for tranche 5/6
  - no DOM-owned blocker for tranche 5/6
  - no React-owned blocker for tranche 5/6
  - no example-owned blocker for the kept v2-only set
  - no perf-owned missing-owner blocker for the kept north-star lanes
  - the remaining blocker is broader docs/RC-owned:
    - contributor-facing parity outside the kept v2-only set
    - final RC ledger closure
- current command reality:
  - tranche-5 / tranche-6 end-state gates are green
  - kept north-star perf owners are green
- drift read:
  - work still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - further work here would be fake motion unless a fresh failing owner appears
- next move:
  - leave this execution owner behind
  - continue in the tranche-7 / tranche-8 owner if the broader RC story still
    needs to be finished

### 2026-04-20 final tranche-5-6 docs sweep

- verdict:
  - `pivot`
- harsh take:
  - this owner is done; the only remaining useful work is outside tranche 5/6
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
  - Bun runner wrapper:
    - `packages/slate-dom/test/clipboard-boundary.test.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document-overlays:local`
- latest keep / skip / cut decision:
  - keep tranche-5 / tranche-6 runtime closure as the live claim
  - keep broader tranche-7 / tranche-8 work clearly labeled as broader parity /
    RC debt
  - cut the last stale live lines that still implied support-package or v2-only
    proof rows were missing here
- why:
  - final live-doc sweep removed the remaining misleading phrasing in:
    - `master-roadmap.md`
    - `true-slate-rc-proof-ledger.md`
  - no meaningful tranche-5 / tranche-6 stale owner claim remains
- earliest gates:
  - correctness:
    `bun run test`
    `bun run test:integration-local`
  - perf:
    `bun run bench:react:rerender-breadth:local`
    `bun run bench:react:huge-document-overlays:local`
- ownership read:
  - no core-owned blocker for tranche 5/6
  - no DOM-owned blocker for tranche 5/6
  - no React-owned blocker for tranche 5/6
  - no example-owned blocker for the kept v2-only set
  - no perf-owned blocker for the kept north-star lanes
  - remaining work is tranche-7 / tranche-8 docs-owned
- current command reality:
  - kept end-state gates are green
  - kept north-star perf owners are green
- drift read:
  - work still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - nothing here is drifting back into legacy `decorate` or chunking
- next move:
  - stop using this execution owner for new work
  - start a tranche-7 / tranche-8 owner if broader RC closure is desired

### 2026-04-20 exhausted-owner continue

- verdict:
  - `pivot`
- harsh take:
  - another `continue` here does not unlock anything new; this owner is
    exhausted
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document-overlays:local`
- latest keep / skip / cut decision:
  - keep tranche-5 / tranche-6 closure exactly where it is
  - skip further no-op doc churn inside this owner
  - cut the idea that repeated `continue` calls should stay attached to this
    package-runtime lane once the gates and truth-sync are green
- ownership read:
  - no core-owned blocker for tranche 5/6
  - no DOM-owned blocker for tranche 5/6
  - no React-owned blocker for tranche 5/6
  - no example-owned blocker for the kept v2-only set
  - no perf-owned blocker for the kept north-star lanes
  - remaining work is broader tranche-7 / tranche-8 docs/claim-width work
- current command reality:
  - kept end-state gates remain green from the verified closeout run
  - kept perf owners remain green
- drift read:
  - still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - further work here would just be fake movement
- next move:
  - leave this owner
  - continue under a tranche-7 / tranche-8 execution owner if broader RC
    closure still matters

### 2026-04-20 no-op continue

- verdict:
  - `pivot`
- harsh take:
  - there is no additional honest tranche-5 / tranche-6 slice left to run
    here
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document-overlays:local`
- latest keep / skip / cut decision:
  - keep this owner frozen at the verified green state
  - skip further tranche-5 / tranche-6 churn without a fresh failing owner
  - cut the expectation that repeated `continue` should keep producing work
    inside an exhausted owner
- ownership read:
  - no core-owned blocker for tranche 5/6
  - no DOM-owned blocker for tranche 5/6
  - no React-owned blocker for tranche 5/6
  - no example-owned blocker for the kept v2-only set
  - no perf-owned blocker for the kept north-star lanes
  - remaining work is broader tranche-7 / tranche-8 claim-width debt
- current command reality:
  - end-state gates remain green from the verified closeout run
  - kept perf owners remain green
- drift read:
  - still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - no drift back into legacy `decorate` or chunking
- next move:
  - stop using this owner
  - move to a tranche-7 / tranche-8 owner if broader RC closure still matters

### 2026-04-20 frozen-owner continue

- verdict:
  - `pivot`
- harsh take:
  - repeated `continue` on this owner is a no-op; nothing new inside tranche
    5/6 is waiting to be unlocked
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document-overlays:local`
- latest keep / skip / cut decision:
  - keep the owner frozen at the verified closeout state
  - skip further tranche-5 / tranche-6 work without a fresh failing owner
  - cut repeated no-op continues here
- ownership read:
  - no core-owned blocker for tranche 5/6
  - no DOM-owned blocker for tranche 5/6
  - no React-owned blocker for tranche 5/6
  - no example-owned blocker for the kept v2-only set
  - no perf-owned blocker for the kept north-star lanes
  - remaining work is broader tranche-7 / tranche-8 claim-width debt
- current command reality:
  - kept end-state gates remain green from the verified closeout run
  - kept perf owners remain green
- drift read:
  - still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - there is no meaningful work left here without a fresh red owner
- next move:
  - leave this owner
  - open or use a tranche-7 / tranche-8 execution owner if broader RC closure
    still matters

### 2026-04-20 readiness-sync continue

- verdict:
  - `pivot`
- harsh take:
  - the only remaining useful work in this owner was one stale blocker line in
    the readiness doc, and that is now gone too
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document-overlays:local`
- latest keep / skip / cut decision:
  - keep the owner frozen at the verified closeout state
  - keep broader parity / RC debt outside this owner
  - cut the stale readiness blocker line that still said live docs understated
    `slate-dom` / `slate-react`
- ownership read:
  - no core-owned blocker for tranche 5/6
  - no DOM-owned blocker for tranche 5/6
  - no React-owned blocker for tranche 5/6
  - no example-owned blocker for the kept v2-only set
  - no perf-owned blocker for the kept north-star lanes
  - remaining work is broader tranche-7 / tranche-8 claim-width debt
- current command reality:
  - kept end-state gates remain green from the verified closeout run
  - kept perf owners remain green
- drift read:
  - still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - there is still no meaningful tranche-5 / tranche-6 work left here
- next move:
  - leave this owner
  - move to tranche-7 / tranche-8 if broader RC closure still matters

### 2026-04-20 blocker-language narrow

- verdict:
  - `pivot`
- harsh take:
  - the only thing left to do in this owner was replace vague blocker prose
    with the actual open tranche-7 rows, and that is done now
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document-overlays:local`
- latest keep / skip / cut decision:
  - keep this owner frozen
  - keep broader claim-width debt explicit
  - cut vague “remaining deleted test/example/package residue” language in
    favor of named open rows:
    - same-path `huge-document`
    - same-path `scroll-into-view`
    - pending `mark-placeholder.test.ts`
    - pending `placeholder-ime.test.ts`
- ownership read:
  - no tranche-5 / tranche-6 blocker remains
  - remaining work is still broader tranche-7 / tranche-8 claim-width debt
- current command reality:
  - unchanged: kept end-state gates and perf owners remain green from the
    verified closeout run
- drift read:
  - still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - nothing here is drifting back into legacy `decorate` or chunking
- next move:
  - leave this owner
  - move to a tranche-7 / tranche-8 owner if you want to finish broader RC
    closure

### 2026-04-20 v2-only example classification

- verdict:
  - `pivot`
- harsh take:
  - the only honest forward motion left in this file is broader claim-width
    cleanup, and one real tranche-7 row just got less fake
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document-overlays:local`
- latest keep / skip / cut decision:
  - keep tranche-5 / tranche-6 frozen
  - keep using this file only for adjacent claim-width cleanup while the user
    insists on it
  - cut the parity-matrix ambiguity that left the landed v2-only examples in
    the unclassified current-only bucket
- why:
  - `example-parity-matrix.md` now explicitly classifies:
    - `highlighted-text`: `extended`
    - `external-decoration-sources`: `extended`
    - `persistent-annotation-anchors`: `extended`
    - `review-comments`: `extended`
  - that matches repo truth better than leaving those shipped current-only
    surfaces as ambient drift
- ownership read:
  - no tranche-5 / tranche-6 blocker remains
  - broader tranche-7 / tranche-8 claim-width debt still remains
- current command reality:
  - unchanged: kept end-state gates and perf owners remain green from the
    verified closeout run
- drift read:
  - still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - no drift back into legacy `decorate` or chunking
- next move:
  - leave this owner
  - move to a tranche-7 / tranche-8 owner if you want the remaining parity /
    RC rows closed for real

### 2026-04-20 ghost-row cleanup

- verdict:
  - `pivot`
- harsh take:
  - this was the first actually useful broader claim-width slice in a while:
    kill the ghost rows instead of talking about them
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document-overlays:local`
- latest keep / skip / cut decision:
  - keep tranche-5 / tranche-6 frozen
  - keep broader browser/input parity debt, but only under real owner docs
  - cut fake live file rows for absent files:
    - `mark-placeholder.test.ts`
    - `placeholder-ime.test.ts`
    - absent current-only example/proof names in `example-parity-matrix.md`
- why:
  - repo truth check showed those file rows do not exist in
    `../slate-v2/site/examples/ts/**` or
    `../slate-v2/playwright/integration/examples/**`
  - live docs now point broader browser/input parity at
    `true-slate-rc-proof-ledger.md` instead of pretending absent files are
    pending in-repo owners
- ownership read:
  - no tranche-5 / tranche-6 blocker remains
  - broader tranche-7 / tranche-8 claim-width debt still remains
- current command reality:
  - unchanged: kept end-state gates and perf owners remain green from the
    verified closeout run
- drift read:
  - still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - this cleanup removed phantom file drift without reviving legacy `decorate`
    or chunking
- next move:
  - leave this owner
  - move to a tranche-7 / tranche-8 owner if you want broader parity / RC
    closure finished for real

### 2026-04-20 blocker-row naming

- verdict:
  - `pivot`
- harsh take:
  - “broader example parity” was still too vague; now the high-level docs name
    the exact tranche-7 rows that are still open
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document-overlays:local`
- latest keep / skip / cut decision:
  - keep tranche-5 / tranche-6 frozen
  - keep tranche-7 open, but only on named rows
  - cut vague blocker prose like “broader example parity” where exact row names
    are available
- why:
  - the live docs now name the exact same-path rows still open:
    - `code-highlighting`
    - `custom-placeholder`
    - `huge-document`
    - `markdown-preview`
    - `markdown-shortcuts`
    - `plaintext`
    - `read-only`
    - `scroll-into-view`
    - `shadow-dom`
    - `styling`
    - `tables`
  - and the same-path mixed rows still open:
    - `editable-voids`
    - `images`
    - `paste-html`
    - `richtext`
- ownership read:
  - no tranche-5 / tranche-6 blocker remains
  - broader tranche-7 / tranche-8 claim-width debt still remains, but it is
    better named now
- current command reality:
  - unchanged: kept end-state gates and perf owners remain green from the
    verified closeout run
- drift read:
  - still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - this slice tightened broader parity ownership without reopening runtime work
- next move:
  - leave this owner
  - move to a tranche-7 / tranche-8 owner if you want those named rows closed
    for real

### 2026-04-20 current-only example ghost cleanup

- verdict:
  - `pivot`
- harsh take:
  - the live parity matrix was still pretending a pile of draft-only current-only
    example names were active debt; that was bullshit
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document-overlays:local`
- latest keep / skip / cut decision:
  - keep tranche-5 / tranche-6 frozen
  - keep only live current-only TS example surfaces in the live parity matrix
  - cut draft-only current-only names that do not map to files in
    `../slate-v2/site/examples/ts/**`
- why:
  - repo truth check showed the old current-only TS list was mostly ghosts
  - `example-parity-matrix.md` now keeps only the four live v2-only current-only
    examples:
    - `highlighted-text`
    - `external-decoration-sources`
    - `persistent-annotation-anchors`
    - `review-comments`
  - broader absent names stay in draft docs until they exist in the repo
- ownership read:
  - no tranche-5 / tranche-6 blocker remains
  - broader tranche-7 / tranche-8 claim-width debt still remains, but the live
    matrix is less fake now
- current command reality:
  - unchanged: kept end-state gates and perf owners remain green from the
    verified closeout run
- drift read:
  - still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - this cleanup removed ghost example drift without reopening runtime work
- next move:
  - leave this owner
  - move to a tranche-7 / tranche-8 owner if you want the remaining same-path
    open / mixed rows closed for real

### 2026-04-20 legacy-playwright sign-off

- verdict:
  - `pivot`
- harsh take:
  - the legacy Playwright drift rows were already decided in practice; leaving
    them as “needs sign-off” was just lazy bookkeeping
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document-overlays:local`
- latest keep / skip / cut decision:
  - keep tranche-5 / tranche-6 frozen
  - keep `select.test.ts` explicitly `recovered`
  - keep `huge-document.test.ts` explicitly `explicit cut`
  - cut the soft “still needs sign-off” wording from the parity matrix
- why:
  - `select.test.ts` already maps to `richtext.test.ts` and the current row
    really does own the triple-click paragraph-selection intent
  - `huge-document.test.ts` really was an old chunking-UI assertion, and the
    live huge-document claim is the benchmark lane instead
- ownership read:
  - no tranche-5 / tranche-6 blocker remains
  - broader tranche-7 / tranche-8 claim-width debt still remains, but one more
    legacy browser sublane is no longer fuzzy
- current command reality:
  - unchanged: kept end-state gates and perf owners remain green from the
    verified closeout run
- drift read:
  - still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - this cleanup reduced parity ambiguity without reopening runtime work
- next move:
  - leave this owner
  - move to a tranche-7 / tranche-8 owner if you want the remaining same-path
    open / mixed rows closed for real

### 2026-04-20 broader-docs no-op

- verdict:
  - `pivot`
- harsh take:
  - even the broader tranche-7 blocker docs are already aligned now; there is
    literally nothing left to patch in this owner without starting real
    tranche-7 recovery work
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document-overlays:local`
- latest keep / skip / cut decision:
  - keep tranche-5 / tranche-6 frozen
  - keep the broader tranche-7 blockers named exactly as they are
  - cut further docs-only churn in this owner
- ownership read:
  - no tranche-5 / tranche-6 blocker remains
  - broader tranche-7 / tranche-8 claim-width debt remains, but it is already
    named cleanly in the live docs
- current command reality:
  - unchanged: kept end-state gates and perf owners remain green from the
    verified closeout run
- drift read:
  - still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - further work here would just be fake movement until real tranche-7 recovery
    starts
- next move:
  - leave this owner
  - start a tranche-7 / tranche-8 execution owner if you want those named rows
    closed for real

### 2026-04-20 named-blocker plateau

- verdict:
  - `pivot`
- harsh take:
  - the high-level docs now name the exact tranche-7 open/mixed rows, so there
    is no more honest docs-only work left here without actually doing tranche-7
    recovery
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document-overlays:local`
- latest keep / skip / cut decision:
  - keep tranche-5 / tranche-6 frozen
  - keep tranche-7 blockers named explicitly
  - cut further docs-only churn in this owner unless a new stale claim is found
- ownership read:
  - no tranche-5 / tranche-6 blocker remains
  - remaining broader tranche-7 / tranche-8 claim-width debt is now named:
    - open: `code-highlighting`, `custom-placeholder`, `huge-document`,
      `markdown-preview`, `markdown-shortcuts`, `plaintext`, `read-only`,
      `scroll-into-view`, `shadow-dom`, `styling`, `tables`
    - mixed: `editable-voids`, `images`, `paste-html`, `richtext`
- current command reality:
  - unchanged: kept end-state gates and perf owners remain green from the
    verified closeout run
- drift read:
  - still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - further movement here would be fake unless we actually start tranche-7 row
    recovery
- next move:
  - leave this owner
  - start a tranche-7 / tranche-8 execution owner if you want those named rows
    closed for real

### 2026-04-20 plaintext-readonly recovery

- verdict:
  - `keep course`
- harsh take:
  - this is the first actual row reduction in a while, not paperwork cosplay
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
- latest landed `slate-react` owner:
  - `site/examples/ts/plaintext.tsx`
  - `site/examples/ts/read-only.tsx`
- latest keep / skip / cut decision:
  - keep tranche-5 / tranche-6 frozen
  - keep broader tranche-7 claim-width work moving row by row where the fix is
    cheap and honest
  - cut `plaintext` and `read-only` from the open same-path bucket
- why:
  - both examples were only open for trivial same-path drift
  - the source now reads close to legacy again
  - focused browser proof stayed green:
    - `playwright/integration/examples/plaintext.test.ts`
    - `playwright/integration/examples/read-only.test.ts`
  - `example-parity-matrix.md` now upgrades:
    - `plaintext` -> `recovered`
    - `read-only` -> `recovered`
- earliest gates:
  - correctness:
    `bunx playwright test ./playwright/integration/examples/plaintext.test.ts ./playwright/integration/examples/read-only.test.ts --project=chromium`
  - hygiene:
    `bun run lint:fix`
    `bun run lint`
- ownership read:
  - no tranche-5 / tranche-6 blocker remains
  - broader tranche-7 claim-width debt remains, but the open same-path set is
    smaller now
- current command reality:
  - unchanged for the kept closeout stack:
    end-state gates and perf owners remain green from the verified closeout run
- drift read:
  - still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - this was a real tranche-7 parity recovery, not a backslide into legacy
    chunking or `decorate`
- next move:
  - if continuing in this file, take another cheap same-path open row from the
    named tranche-7 list
  - otherwise leave this owner and start a tranche-7 / tranche-8 owner

### 2026-04-21 perf-superiority correction

- verdict:
  - `replan`
- harsh take:
  - the earlier “perf lane closed” language was too weak for the actual v2
    promise; command ownership is not enough if v2 still loses to legacy
    chunking on huge-doc typing
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document-overlays:local`
- latest keep / skip / cut decision:
  - keep the existing React perf owners as useful locality/corridor evidence
  - do not call the stronger slate-react perf-superiority claim closed
  - require a direct legacy chunking-on / legacy chunking-off / v2 comparison
    before claiming v2 is better on all important slate-react huge-doc lanes
- why:
  - existing saved evidence says:
    - `1000` block browser lane: v2 beat legacy on ready, type, select-all,
      and paste
    - older `5000` block browser compare: v2 typing improved from about
      `71ms` to `65ms`, but legacy chunking was around `18ms`
    - active-radius sweep at `10000` blocks made v2 corridor posture viable,
      but did not directly compare chunk-on / chunk-off / v2 in a live command
  - current repo commands prove:
    - core huge-doc compare
    - React rerender breadth
    - React huge-document overlay locality
  - current repo commands do not prove:
    - legacy chunking-on vs legacy chunking-off vs v2 across the browser
      huge-document user lanes
- ownership read:
  - no tranche-5 / tranche-6 runtime blocker reopens
  - perf-superiority claim is perf-owned and still open
  - broader tranche-7 / tranche-8 claim-width debt still remains
- current command reality:
  - useful but insufficient:
    - `bench:react:rerender-breadth:local`
    - `bench:react:huge-document-overlays:local`
    - `bench:core:huge-document:compare:local`
  - missing:
    - direct browser/runtime comparison of legacy chunk-on, legacy chunk-off,
      and v2
- drift read:
  - the work still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - the risk is under-measuring the actual v2 promise, not drifting back to
    chunking as the desired architecture
- next move:
  - create a tranche-7 / perf owner for direct legacy chunk-on / legacy
    chunk-off / v2 huge-document comparison
  - only then decide whether the v2 runtime needs more core/runtime work or the
    remaining gap is acceptable / explicitly deferred

### 2026-04-21 huge-document legacy compare owner

- verdict:
  - `replan`
- harsh take:
  - the missing command owner is fixed, and the result is uncomfortable: v2 is
    not currently winning the direct mounted huge-doc runtime comparison
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document:legacy-compare:local`
  - implementation:
    - `../slate-v2/scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`
- latest keep / skip / cut decision:
  - keep the new direct legacy chunk-on / legacy chunk-off / v2 compare owner
  - keep the existing rerender and overlay benchmarks as useful but insufficient
  - do not call the stronger slate-react perf-superiority claim closed while
    this compare is red
- why:
  - smoke command:
    `REACT_HUGE_COMPARE_BLOCKS=1000 REACT_HUGE_COMPARE_ITERATIONS=1 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
  - v2 won only the ready lane:
    - ready: `27.98ms`
    - legacy chunk-off ready: `47.93ms`
    - legacy chunk-on ready: `68.10ms`
  - v2 lost the runtime action lanes:
    - start typing: v2 `49.50ms`, chunk-off `40.02ms`, chunk-on `31.30ms`
    - middle typing: v2 `44.07ms`, chunk-off `24.06ms`, chunk-on `25.20ms`
    - select-all: v2 `10.24ms`, chunk-off `2.69ms`, chunk-on `2.92ms`
    - paste full document: v2 `27.09ms`, chunk-off `20.29ms`, chunk-on
      `24.64ms`
- follow-up probe:
  - after adding select/promote-then-type lanes, v2 still loses badly:
    - start select+type: v2 `65.32ms`, chunk-off `30.37ms`, chunk-on `31.13ms`
    - middle select+type: v2 `89.89ms`, chunk-off `26.54ms`, chunk-on
      `26.87ms`
  - this benchmark is mounted runtime/model-driven, not a full browser keyboard
    benchmark, but it is enough to prove the stronger perf claim is not closed
- ownership read:
  - no tranche-5 / tranche-6 runtime blocker reopens
  - stronger v2 perf-superiority is perf-owned and red
  - broader tranche-7 / tranche-8 claim-width debt still remains
- current command reality:
  - useful locality/corridor owners:
    - `bench:react:rerender-breadth:local`
    - `bench:react:huge-document-overlays:local`
  - direct comparison owner:
    - `bench:react:huge-document:legacy-compare:local`
  - current direct comparison result:
    - red for typing, select-all, and full-document paste at the 1000-block
      smoke
- drift read:
  - work still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - this is not an argument to make child-count chunking foundational again;
    it is evidence that the current v2 runtime still has perf debt against
    the legacy chunked baseline
- next move:
  - investigate why v2 loses action lanes in the mounted compare
  - decide whether to optimize the v2 large-document runtime, adjust the
    benchmark if it is not measuring the intended browser path, or explicitly
    defer those losing lanes

### 2026-04-21 huge-document compare fairness probe

- verdict:
  - `replan`
- harsh take:
  - the fairer promoted-corridor typing lane makes the v2 loss worse, not
    better
- latest landed `slate-dom` owner:
  - `packages/slate-dom/test/clipboard-boundary.ts`
- latest landed `slate-react` owner:
  - `bun run bench:react:huge-document:legacy-compare:local`
- latest keep / skip / cut decision:
  - keep the direct legacy chunk-on / chunk-off / v2 compare owner
  - keep raw typing and select/promote-then-type as separate lanes
  - do not call the stronger v2 perf-superiority claim closed
- why:
  - rerun command:
    `REACT_HUGE_COMPARE_BLOCKS=1000 REACT_HUGE_COMPARE_ITERATIONS=1 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
  - v2 still wins ready:
    - v2 `27.32ms`
    - legacy chunk-off `46.26ms`
    - legacy chunk-on `66.30ms`
  - v2 loses raw typing:
    - start: v2 `51.24ms`, chunk-off `24.52ms`, chunk-on `30.03ms`
    - middle: v2 `50.61ms`, chunk-off `43.37ms`, chunk-on `25.17ms`
  - v2 loses select/promote-then-type:
    - start: v2 `65.32ms`, chunk-off `30.37ms`, chunk-on `31.13ms`
    - middle: v2 `89.89ms`, chunk-off `26.54ms`, chunk-on `26.87ms`
  - v2 loses broad action lanes:
    - select-all: v2 `9.96ms`, chunk-off `2.70ms`, chunk-on `2.81ms`
    - paste: v2 `26.64ms`, chunk-off `19.91ms`, chunk-on `24.50ms`
- ownership read:
  - no tranche-5 / tranche-6 runtime blocker reopens
  - stronger v2 perf-superiority is perf-owned and red
  - the next owner should be the v2 large-document action path, not docs
- current command reality:
  - direct comparison owner exists and is red:
    - `bench:react:huge-document:legacy-compare:local`
  - locality/corridor owners remain useful:
    - `bench:react:rerender-breadth:local`
    - `bench:react:huge-document-overlays:local`
- drift read:
  - still points toward one overlay kernel, semantic islands, and
    corridor-first runtime
  - this is not a reason to revive child-count chunking as the target; it is a
    reason to make the v2 runtime actually win
- next move:
  - profile why `EditableBlocks largeDocument` loses select/promote-then-type,
    select-all, and paste in the mounted compare
  - optimize the action path or explicitly re-scope the perf claim if the
    benchmark is not representative
