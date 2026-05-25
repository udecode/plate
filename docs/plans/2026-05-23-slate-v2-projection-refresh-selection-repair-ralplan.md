# Slate v2 projection refresh selection repair ralplan

## Verdict

Current fix: good regression fix, not the best final architecture.

The current code correctly fixes `#5987`, but the repair signal is in the wrong
place. `Editable.decorate` refreshes a projection source and then directly calls
`EDITOR_TO_FORCE_RENDER.get(editor)?.()`. That proves the root cause, but it
couples a legacy decorate adapter to the editable repair renderer.

Best target: projection refresh owns the invalidation result, and editable owns
the render/selection repair bridge. Decoration adapters only refresh their
source.

Score: `0.82` current, `0.94` target.

## Current Source Evidence

- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:1351`
  creates a legacy `Editable.decorate` projection source.
- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:1707`
  refreshes that source on `decorate` identity changes.
- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:1712`
  calls `EDITOR_TO_FORCE_RENDER` directly from the adapter.
- `.tmp/slate-v2/packages/slate-react/src/projection-store.ts:531` already has
  the right conceptual owner: `projectionStore.refresh(...)`.
- `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-decoration-source.ts:79`
  and `:125` have the same external refresh pattern for first-class decoration
  sources, so the architecture cannot be solved only in `Editable.decorate`.
- `.tmp/slate-v2/playwright/integration/examples/decorations-async.test.ts`
  proves the browser bug: model selection stayed at offset `41`, while DOM
  selection stayed at offset `35` before the fix.

## Why The Current Fix Is Not Final

1. It uses the weakest signal: "force render" instead of "projection refresh
   changed rendered text; export current model selection after React commits".
2. It fixes the legacy prop path, but first-class `useSlateDecorationSource`
   uses the same external refresh shape.
3. It hides the runtime reason from traces and metrics. The repair engine sees a
   render request, not a projection-driven selection export.
4. It bypasses the existing projection-store abstraction, where changed runtime
   ids, source ids, invalidation, and subscriber wakes already live.
5. It creates future copy-paste pressure: annotations, widgets, and decoration
   sources can all discover the same DOM materialization problem and poke render
   separately.

## Accepted Target Architecture

### Internal Contract

Add an internal projection refresh result:

```ts
type SlateProjectionRefreshResult = {
  changedRuntimeIds: readonly RuntimeId[]
  changedSourceId?: string
  didChange: boolean
  reason: SlateSourceDirtinessContext['reason']
  requiresDOMSelectionExport: boolean
}
```

`SlateProjectionStore.refresh()` should either return this result or publish it
through a narrow internal subscription.

### Editable Bridge

Editable owns one bridge:

```ts
useProjectionDOMRepairBridge({
  editor,
  projectionStore,
  requestEditableRepair,
})
```

The bridge reacts only when `refresh()` reports rendered text/projection change.
It schedules a typed repair:

```ts
requestEditableRepair({
  reason: 'projection-refresh',
  selection: 'export-model-to-dom-after-commit',
  runtimeIds: changedRuntimeIds,
})
```

The bridge runs from the editable runtime because only the editable runtime can
coordinate React commit timing, DOM repair, IME state, and selection export.

### Adapter Rule

Adapters must not touch `EDITOR_TO_FORCE_RENDER`.

Allowed:

```ts
source.refresh({ forceInvalidate: true, reason: 'external' })
```

Not allowed:

```ts
EDITOR_TO_FORCE_RENDER.get(editor)?.()
```

That applies to:

- legacy `Editable.decorate`
- `useSlateDecorationSource`
- `useSlateRangeDecorationSource`
- annotation refresh paths
- widget refresh paths if they change selectable DOM around the caret

## Public DX

No new app-facing API is needed.

Keep:

- `Editable decorate={decorate}` as adapter compatibility
- `decorationSources` / projection sources as the primary v2 path
- explicit `deps` on `useSlateDecorationSource`

Do not expose:

- `forceRender`
- selection repair flags
- projection repair internals

Slate users should only say what decorations exist. Slate React decides when a
projection refresh requires DOM selection export.

## Tests Required

Keep the current browser proof:

- `.tmp/slate-v2/playwright/integration/examples/decorations-async.test.ts`

Add these before calling the architecture final:

1. First-class decoration source async refresh row:
   - use `useSlateDecorationSource`
   - delayed source refresh restructures text
   - DOM caret and Slate selection stay at typed end
2. No-change refresh row:
   - external refresh with identical projection data does not force a repair
3. Scoped refresh row:
   - only changed runtime ids wake runtime subscribers
4. IME guard row:
   - projection refresh during composition does not export stale model selection
5. Contract test:
   - adapters call `source.refresh`
   - only editable bridge requests projection repair

## Implementation Phases

1. Add `SlateProjectionRefreshResult` or internal refresh event in
   `projection-store.ts`.
2. Add a single editable projection repair bridge near the runtime repair engine.
3. Move the current `EDITOR_TO_FORCE_RENDER` call out of
   `Editable.decorate`.
4. Route `useSlateDecorationSource` through the same bridge.
5. Add focused unit/browser tests above.
6. Re-run `.tmp/slate-v2` gates:
   - `bun --filter slate-react typecheck`
   - `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/decorations-async.test.ts --project=chromium`
   - new first-class decoration source Playwright row
   - `bun lint:fix`

## Issue Accounting

- `#5987` remains `Fixes #5987` because the current regression proof is valid.
- This follow-up does not change the public issue claim; it upgrades the
  architecture behind the claim.
- Related decoration invalidation pressure remains tracked by `#4993`, `#4997`,
  and `#3383`; no additional fixed claim until those exact repros pass.

## Decision Brief

Principles:

- projection changes report what changed
- editable runtime owns DOM repair and selection export
- adapters stay declarative
- public DX stays Slate-close
- repair work is skipped when projections are unchanged

Rejected alternatives:

- keep current fix as final: passes `#5987`, but leaves duplicate repair
  pressure in every external projection source
- call `forceRender` from every source hook: worse duplication and worse trace
  quality
- make apps call a repair API: bad DX and leaks internals
- export selection on every React render: too broad and worse for large docs

## Next Owner

`ralph` implementation pass, if accepted.

This review should not edit `.tmp/slate-v2` implementation code directly.

## Ralph Execution Result

Status: complete.

Implemented target:

- `projection-store.ts` returns/emits `SlateProjectionRefreshResult`.
- `decoration-source.ts` forwards projection refresh events through composed
  sources.
- `projection-repair-bridge.ts` is the single editable-owned bridge from
  projection refresh to DOM selection repair.
- `runtime-root-engine.ts` installs that bridge after the editable repair
  runtime exists.
- `Editable.decorate` now only refreshes its source; it no longer imports or
  calls `EDITOR_TO_FORCE_RENDER`.
- `useSlateDecorationSource` gets the same repair behavior through the shared
  projection refresh event.

Regression proof:

- RED before bridge: first-class hook source failed with DOM caret offset `35`
  vs expected `41`; legacy prop path passed because it still had the local
  adapter force-render.
- GREEN after bridge: both prop and hook source rows keep Slate selection and
  DOM caret at offset `41`.

Verification:

- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx`
- `.tmp/slate-v2`: `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/decorations-async.test.ts --project=chromium`
- `.tmp/slate-v2`: `bun --filter slate-react typecheck`
- `.tmp/slate-v2`: `bun lint:fix`

Diff review:

- `no issue`: projection refresh result is the right owner for changed runtime
  ids and skipped repair.
- `no issue`: first-class decoration source and legacy prop path share the same
  browser row.
- `fixed during review`: removed an unused bridge `editor` parameter.
- `fixed during review`: skipped targeted refresh results no longer report the
  store source id as changed.

Issue accounting:

- `#5987` remains `Fixes #5987`.
- No new issue claim added; this pass upgrades the architecture behind the same
  browser proof.
