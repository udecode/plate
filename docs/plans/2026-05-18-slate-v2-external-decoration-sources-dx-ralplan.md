# Slate v2 External Decoration Sources DX Ralplan

Date: 2026-05-18

## Verdict

No. `site/examples/ts/external-decoration-sources.tsx` is correct as a low-level
runtime proof, but it is not the absolute-best Slate-ish example DX.

Current score: 0.84.

Target score: 0.93.

Keep the external-source concept. Change the main teaching path from raw
`SlateProjection` plus manual `refresh({ sourceId })` to range decorations plus
hook-owned `deps`. Manual refresh stays as an advanced imperative source path,
not the first thing the example teaches.

## Intent And Boundary

Intent:

- Make the example show the public API shape an app author should reach for
  first when external app state highlights editor text.
- Keep Slate unopinionated. Diagnostics, search, and review overlays remain app
  data.
- Preserve the low-level source escape hatch for custom invalidation, metrics,
  and non-React stores.

Non-goals:

- Do not add a product hook such as `useExternalDiagnostics`.
- Do not hide `dirtiness`; external source invalidation is part of the runtime
  contract.
- Do not remove `createDecorationSource` or `useSlateDecorationSource`.
- Do not make `Editable.decorate` the scalable external-overlay answer.

Allowed edit scope for this pass:

- Planning and completion-state files only. Slate v2 implementation edits belong
  to a later `ralph` execution.

## Live Source Evidence

- `../slate-v2/site/examples/ts/external-decoration-sources.tsx:2-9` imports
  `useRef`, raw `SlateProjection`, and `useSlateDecorationSource`.
- `../slate-v2/site/examples/ts/external-decoration-sources.tsx:73-112`
  hand-builds projection objects with `key`, `data`, and explicit `range`.
- `../slate-v2/site/examples/ts/external-decoration-sources.tsx:114-133`
  formats a projection snapshot string for debug UI.
- `../slate-v2/site/examples/ts/external-decoration-sources.tsx:159-184`
  mirrors state into `externalSnapshotRef`, writes React state separately, then
  calls `externalSource.refresh({ reason: 'external', sourceId:
  'external-diagnostics' })`.
- `../slate-v2/site/examples/ts/external-decoration-sources.tsx:189-198`
  teaches `projectionStore.refresh(...)`, but the file's public object is
  `externalSource`.
- `../slate-v2/site/examples/ts/external-decoration-sources.tsx:260-264`
  displays debug snapshot state and passes the source through
  `<Slate decorationSources={[externalSource]} editor={editor}>`.
- `../slate-v2/packages/slate-react/src/hooks/use-slate-decoration-source.ts:13-27`
  already exposes `deps` on both low-level and range-decoration hooks.
- `../slate-v2/packages/slate-react/src/hooks/use-slate-decoration-source.ts:77-82`
  and `:123-128` refresh source data from `deps` without recreating the source.
- `../slate-v2/packages/slate-react/src/decoration-source.ts:20-54` already
  defines `SlateRangeDecoration` and `SlateRangeDecorationSourceOptions`.
- `../slate-v2/packages/slate-react/src/decoration-source.ts:141-160` maps
  range entries into projected decorations with stable keys.
- `docs/slate-v2/references/pr-description.md:890-919` records the accepted
  public shape: low-level source API remains, `deps` is first-class, range
  helpers exist, and `dirtiness` / `runtimeScope` stay visible performance
  controls.
- `docs/plans/2026-05-18-slate-v2-search-highlighting-dx-ralplan.md:560-595`
  already accepts `createRangeDecorationSource` /
  `useSlateRangeDecorationSource` and `source.refresh()` defaulting to its own
  `sourceId`.
- `docs/plans/2026-05-18-slate-v2-search-highlighting-dx-ralplan.md:706-725`
  keeps manual refresh as an advanced external-state path.
- `docs/solutions/logic-errors/2026-04-15-annotation-store-inputs-must-keep-stable-data-references.md:94-146`
  explains why the old ref/manual-refresh pattern existed: keeping source input
  identity stable avoided focus churn. With `deps`, the hook owns that lifecycle
  directly for React state.
- `docs/solutions/logic-errors/2026-04-03-slate-react-v2-projection-proof-must-split-range-semantics-from-react-overlay-store.md:26-51`
  says the clean architecture separates logical range derivation from React
  overlay projection.

## Ecosystem Comparison

ProseMirror:

- Official docs expose decorations through a `decorations` prop and
  `DecorationSet`.
- Inline examples use `Decoration.inline(from, to, attrs)` and return a
  `DecorationSet` from plugin props.
- For many decorations, plugin state keeps a persistent `DecorationSet` and maps
  it through transactions.
- Takeaway for Slate: teach logical range decorations as the normal authored
  unit, then let the Slate React source/projector handle renderer-local output.

Tiptap:

- Extensions supply ProseMirror plugins with `addProseMirrorPlugins`.
- Diff/custom highlighting examples map domain data to ProseMirror
  `Decoration.inline(...)` values.
- Takeaway for Slate: app or extension code can own domain data, but examples
  should show a range-decoration API, not renderer projection plumbing.

Lexical:

- Lexical examples lean on nodes, themes, and plugins for rendering behavior.
- It is not a direct model for external range overlays because the public docs
  do not present a ProseMirror-style external `DecorationSet` first path.
- Takeaway for Slate: do not copy Lexical's node-transform direction for
  ephemeral overlays. Keep Slate document data separate from transient app-owned
  overlay data.

## Decision Brief

Principles:

- Slate-close means examples should look like Slate ranges, editor state, and
  React state. They should not start by exposing projection transport.
- External app state should be explicit, but React-owned external state should
  not require a ref mirror and imperative refresh at every button.
- The power API should remain visible somewhere; it should not be the canonical
  range-highlighting example.

Options:

| Option | Verdict | Reason |
| --- | --- | --- |
| Keep current raw projection/manual refresh example as-is | Reject | Accurate runtime proof, poor first-read DX. It teaches the transport layer first. |
| Switch main example to `useSlateRangeDecorationSource` with React state and `deps` | Choose | Closest to Slate: app state -> ranges -> `<Slate decorationSources>` -> `renderSegment`. |
| Split manual refresh into a smaller imperative-source example | Keep optional | Best if the runtime proof still needs a visible non-React-store lane. |
| Add `useExternalDecorationSource` | Reject | Product-shaped wrapper. Raw Slate should expose primitives, not a domain convenience hook. |
| Hide `dirtiness` behind defaults | Reject | The example is specifically about an external source; invalidation semantics must stay visible. |

## Accepted Target Shape

Primary example:

```tsx
const [diagnostics, setDiagnostics] = useState<{
  mode: Mode
  tone: Tone
}>({
  mode: 'alpha',
  tone: 'warm',
})

const diagnosticSource = useSlateRangeDecorationSource(editor, {
  id: 'external-diagnostics',
  deps: [diagnostics],
  dirtiness: 'external',
  read: () => getDiagnosticRanges(diagnostics),
})
```

`getDiagnosticRanges` returns:

```ts
readonly SlateRangeDecoration<{
  label: string
  tone: Tone
}>[]
```

Representative entry:

```ts
{
  key: 'diagnostic-alpha',
  data: {
    label: 'diagnostic-alpha',
    tone,
  },
  range: {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 20 },
  },
}
```

Button handlers become plain state writes:

```tsx
<button
  onClick={() => setDiagnostics((value) => ({ ...value, mode: 'both' }))}
  type="button"
>
  Show both diagnostics
</button>
```

If an imperative source lane stays in this file, it should be clearly smaller
and should use the tightened API:

```tsx
diagnosticSource.refresh({ reason: 'external' })
```

That depends on the already-accepted default that `source.refresh()` uses the
source's own id.

## Concrete Cleanup List For Ralph

Change `../slate-v2/site/examples/ts/external-decoration-sources.tsx`:

- Replace `SlateProjection` / `DiagnosticProjection` with
  `SlateRangeDecoration`.
- Replace `useSlateDecorationSource` with `useSlateRangeDecorationSource` in the
  main example.
- Replace `externalSnapshot` / `externalSnapshotRef` / `applySnapshot` with a
  single `diagnostics` state object.
- Rename `buildSnapshot` to `getDiagnosticRanges`.
- Remove `formatSnapshot` from the primary example, or keep a much smaller UI
  status derived from `diagnostics`.
- Replace `projectionStore.refresh(...)` copy with the actual public object name
  if manual refresh remains.
- Keep `dirtiness: 'external'`.
- Keep `<Slate decorationSources={[diagnosticSource]} editor={editor}>`.
- Keep `renderSegment` data styling.

Update tests:

- Keep the behavior assertions: alpha/beta/both/none, tone rotation, editor text
  unchanged.
- Stop requiring the old debug text
  `last-update:refresh({ reason: "external", sourceId:
  "external-diagnostics" })` unless the imperative lane intentionally remains.
- Assert the simpler user-visible state: `mode`, `tone`, and highlight count.

Optional API follow-up:

- If not already implemented in `../slate-v2`, make `source.refresh()` default
  `sourceId` to its own `id`. That keeps advanced examples from repeating the
  same identifier.

## What Stays

- External app state remains outside the Slate document.
- `dirtiness: 'external'` stays explicit.
- `decorationSources` remains provider-owned through `<Slate>`.
- Low-level `createDecorationSource` / `useSlateDecorationSource` stays public
  for custom invalidation, metrics, and non-React stores.

## What Drops From The Main Path

- Raw `SlateProjection` as the authored type.
- React state mirrored into a ref solely to satisfy the hook read closure.
- Per-button calls to `externalSource.refresh(...)`.
- Snapshot formatter/debug UI as the central story.
- `projectionStore.refresh` wording in user-facing example copy.
- Repeating `sourceId` in manual refresh calls.

## Verification For Ralph Execution

If the later execution touches only the example and test:

```bash
cd ../slate-v2/site && bun tsc --project tsconfig.json
cd ../slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/external-decoration-sources.test.ts --project=chromium
cd ../slate-v2 && bunx biome check site/examples/ts/external-decoration-sources.tsx playwright/integration/examples/external-decoration-sources.test.ts && bunx eslint site/examples/ts/external-decoration-sources.tsx playwright/integration/examples/external-decoration-sources.test.ts
```

If the API default changes:

```bash
cd ../slate-v2 && bun --filter slate-react typecheck
cd ../slate-v2 && bun test packages/slate-react/test/use-slate-decoration-source.test.ts
```

Known broad-lint caveat from the active lane:

- Full `bun lint` / `bun check` was previously blocked by unrelated formatting
  drift in `../slate-v2/packages/slate/src/core/editor-extension.ts` and
  `../slate-v2/packages/slate/src/index.ts`. A later execution should use
  touched-file Biome/ESLint unless that unrelated drift is resolved.

## Issue And Reference Sync

- No ClawSweeper rerun for this review pass: no issue claims or Slate v2 source
  behavior changed.
- If Ralph changes the example/test only, update
  `docs/slate-v2/references/pr-description.md` only if the public PR narrative
  still claims the old explicit `sourceId` refresh teaching path.
- If Ralph changes the public refresh API default, update the PR reference and
  relevant source docs/tests in the same execution.

## Pass-State Ledger

| Pass | Status | Evidence |
| --- | --- | --- |
| Skill reload | complete | Reloaded `slate-ralplan`, `ce-review`, `learnings-researcher`, and `planning-with-files` after compaction. |
| Completion reset | complete | Reset `.tmp/019e3627-238b-7993-a8cf-26be45504c47/completion-check.md` to pending for this activation. |
| Live source review | complete | Read the live example plus `use-slate-decoration-source.ts` and `decoration-source.ts` from `../slate-v2`. |
| Institutional knowledge | complete | Read the relevant projection/range and stable-reference solution notes. |
| Ecosystem comparison | complete | Checked current Context7 docs for Lexical, ProseMirror, and Tiptap decoration/plugin patterns. |
| API verdict | complete | Accepted range-decoration + `deps` main path; rejected product wrapper and raw projection as the primary example. |
| Implementation | skipped | Slate Ralplan is review/planning only; no `../slate-v2` source files edited. |
| Verification | complete | Plan artifact and completion state close with `node tooling/scripts/completion-check.mjs`. Slate v2 runtime checks are Ralph gates. |

## Final Handoff

Ralph-ready target:

- Rewrite the example around `useSlateRangeDecorationSource(editor, { id,
  deps: [diagnostics], dirtiness: 'external', read })`.
- Keep low-level manual refresh only as an advanced imperative source note or a
  separate example.
- Do not add a domain-specific hook.
- Do not hide `dirtiness`.
- Do not leave public copy saying `projectionStore.refresh` when the authored
  object is `diagnosticSource` / `externalSource`.

Closure:

- This review pass is complete.
- No implementation remains in the active Slate Ralplan pass until the user asks
  for `ralph` / execution.
