# Slate v2 External Decoration Sources DX Ralplan

Date: 2026-05-18

## Verdict

No. `site/examples/ts/external-decoration-sources.tsx` is correct as a low-level
runtime proof, but it is not the absolute-best Slate-ish example DX.

Current score: 0.84.

Target score: 0.93.

2026-05-19 follow-up score after the `Linting` rewrite: 0.89.

Reason: the public example is much better, but still stores raw lint `Range`s in
React state. After "Run linter", typing before a diagnostic can leave the
highlight on stale offsets. That is not absolute-best Slate-ish DX.

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

Execution scope:

- Rewrite `.tmp/slate-v2/site/examples/ts/external-decoration-sources.tsx` into
  the user-facing `Linting` example while keeping the stable route id.
- Update the example label, Playwright coverage, and browser contract metadata.
- Follow-up: change the linting example from stored range diagnostics to
  snapshot-derived diagnostics so lint highlights recompute on text edits.

## Live Source Evidence

- `.tmp/slate-v2/site/examples/ts/external-decoration-sources.tsx:2-9` imports
  `useRef`, raw `SlateProjection`, and `useSlateDecorationSource`.
- `.tmp/slate-v2/site/examples/ts/external-decoration-sources.tsx:73-112`
  hand-builds projection objects with `key`, `data`, and explicit `range`.
- `.tmp/slate-v2/site/examples/ts/external-decoration-sources.tsx:114-133`
  formats a projection snapshot string for debug UI.
- `.tmp/slate-v2/site/examples/ts/external-decoration-sources.tsx:159-184`
  mirrors state into `externalSnapshotRef`, writes React state separately, then
  calls `externalSource.refresh({ reason: 'external', sourceId:
'external-diagnostics' })`.
- `.tmp/slate-v2/site/examples/ts/external-decoration-sources.tsx:189-198`
  teaches `projectionStore.refresh(...)`, but the file's public object is
  `externalSource`.
- `.tmp/slate-v2/site/examples/ts/external-decoration-sources.tsx:260-264`
  displays debug snapshot state and passes the source through
  `<Slate decorationSources={[externalSource]} editor={editor}>`.
- `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-decoration-source.ts:13-27`
  already exposes `deps` on both low-level and range-decoration hooks.
- `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-decoration-source.ts:77-82`
  and `:123-128` refresh source data from `deps` without recreating the source.
- `.tmp/slate-v2/packages/slate-react/src/decoration-source.ts:20-54` already
  defines `SlateRangeDecoration` and `SlateRangeDecorationSourceOptions`.
- `.tmp/slate-v2/packages/slate-react/src/decoration-source.ts:141-160` maps
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

| Option                                                                             | Verdict       | Reason                                                                                          |
| ---------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------- |
| Keep current raw projection/manual refresh example as-is                           | Reject        | Accurate runtime proof, poor first-read DX. It teaches the transport layer first.               |
| Switch main example to `useSlateRangeDecorationSource` with React state and `deps` | Choose        | Closest to Slate: app state -> ranges -> `<Slate decorationSources>` -> `renderSegment`.        |
| Split manual refresh into a smaller imperative-source example                      | Keep optional | Best if the runtime proof still needs a visible non-React-store lane.                           |
| Add `useExternalDecorationSource`                                                  | Reject        | Product-shaped wrapper. Raw Slate should expose primitives, not a domain convenience hook.      |
| Hide `dirtiness` behind defaults                                                   | Reject        | The example is specifically about an external source; invalidation semantics must stay visible. |

## Accepted Target Shape

Primary example:

```tsx
const [diagnostics, setDiagnostics] = useState<{
  mode: Mode;
  tone: Tone;
}>({
  mode: "alpha",
  tone: "warm",
});

const diagnosticSource = useSlateRangeDecorationSource(editor, {
  id: "external-diagnostics",
  deps: [diagnostics],
  dirtiness: "external",
  read: () => getDiagnosticRanges(diagnostics),
});
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
  onClick={() => setDiagnostics((value) => ({ ...value, mode: "both" }))}
  type="button"
>
  Show both diagnostics
</button>
```

If an imperative source lane stays in this file, it should be clearly smaller
and should use the tightened API:

```tsx
diagnosticSource.refresh({ reason: "external" });
```

That depends on the already-accepted default that `source.refresh()` uses the
source's own id.

## Concrete Cleanup List For Ralph

Change `.tmp/slate-v2/site/examples/ts/external-decoration-sources.tsx`:

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

- If not already implemented in `.tmp/slate-v2`, make `source.refresh()` default
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

## Ralph Execution Update

Implemented target:

- The public example label is `Linting`; the route remains
  `external-decoration-sources`.
- The example now models a realistic linter: run local diagnostics, apply a
  fixable punctuation issue, receive a server diagnostic, and clear results.
- The authored type is `SlateRangeDecoration<LintIssue>`, not raw
  `SlateProjection`.
- The final execution keeps lint source mode in React state and derives lint
  findings from the latest editor snapshot. `useSlateRangeDecorationSource`
  receives `deps: [lintMode]`, `dirtiness: ['text', 'external']`, and
  `read: ({ snapshot }) => collectLintIssues(snapshot, ...)`.
- The visible diagnostics panel is rendered under `<Slate>` and derives its
  count/list with `useEditorState`, so the UI and overlay source follow the same
  current snapshot.
- The renderer reads `data-lint-rule` and `data-lint-severity` from segment
  slices.
- Follow-up review tightened the comma-spacing rule so its fix text matches its
  matcher, and the Playwright spec now asserts the visible `Linting` page title.

Current gap found on 2026-05-19:

- Live `.tmp/slate-v2/site/examples/ts/external-decoration-sources.tsx:221-230`
  stores `readonly LintIssueDecoration[]` in React state and passes
  `deps: [diagnostics]`, `dirtiness: 'external'`, `read: () => diagnostics`.
- Live `.tmp/slate-v2/site/examples/ts/external-decoration-sources.tsx:126-175`
  already derives diagnostics from an `EditorSnapshot`, so the clean target is
  available locally.
- Live `.tmp/slate-v2/packages/slate-react/src/projection-store.ts:255-268`
  makes `'text'` dirty on text commits and `'external'` dirty only for external
  refresh. Therefore the current lint source will not recompute on normal text
  edits.
- Live `.tmp/slate-v2/site/examples/ts/review-comments.tsx:420-430` stores
  comments as `state.ranges.bookmark(range)`, which is correct for durable user
  comments but the wrong default for ephemeral lint diagnostics.

Accepted correction:

- Lint diagnostics are derived findings, not durable anchors.
- The example should store lint source mode/config only, not projected ranges.
- Use `dirtiness: ['text', 'external']` so local lint results recompute after
  document edits and app/server mode changes still refresh externally.
- Keep comment-style bookmarks out of the linting example except as an explicit
  contrast: durable comments anchor; ephemeral lint recomputes.
- Server diagnostics in this example should either be recomputed from the latest
  snapshot or marked stale on text edit. Do not silently pretend remote ranges
  stay correct after arbitrary edits unless a bookmark/anchor model is chosen.

Target call site:

```tsx
const [lintMode, setLintMode] = useState<"local" | "server" | "off">("off");

const lintingSource = useSlateRangeDecorationSource<LintIssue>(editor, {
  deps: [lintMode],
  id: "linting",
  dirtiness: ["text", "external"],
  read: ({ snapshot }) =>
    lintMode === "off"
      ? []
      : collectLintIssues(snapshot, {
          includeServerDiagnostics: lintMode === "server",
        }),
});
```

Button target:

- `Run linter`: `setLintMode('local')`.
- `Receive server diagnostics`: `setLintMode('server')`.
- `Clear diagnostics`: `setLintMode('off')`.
- `Apply first fix`: compute the first fix from
  `collectLintIssues(editor.read((state) => state.runtime.snapshot()), ...)`,
  apply it, and leave `lintMode` as-is so the source recomputes from the next
  snapshot.

Required proof for Ralph:

- Update the integration test to run the linter, type at the start of the
  document, and assert the highlight still wraps the intended words.
- Keep the existing stress row; it should still assert two lint slices after
  `Run linter`.
- Run from `.tmp/slate-v2`: touched-file Biome, `bun typecheck:site`,
  `bun typecheck:root`, focused Playwright linting spec, focused stress row,
  and `bun lint:fix`.

Tiptap comparison applied:

- Copied the product shape from Tiptap's linter demo: rules produce diagnostics,
  diagnostics highlight ranges, and one issue can be fixed.
- Did not copy the ProseMirror decoration/widget implementation. Slate keeps
  the authored surface as ranges plus `renderSegment`.
- Follow-up synthesis: unlike ProseMirror/Tiptap plugin state that may map a
  `DecorationSet` through transactions, this Slate example should use the
  source `read({ snapshot })` path. That is the Slate-native primitive already
  exposed by `useSlateRangeDecorationSource`.

## Verification

Latest Ralph execution proof:

```bash
cd .tmp/slate-v2 && bunx biome check site/examples/ts/external-decoration-sources.tsx playwright/integration/examples/external-decoration-sources.test.ts playwright/stress/generated-editing.test.ts --fix
cd .tmp/slate-v2 && bun typecheck:site
cd .tmp/slate-v2 && bun typecheck:root
cd .tmp/slate-v2 && bun lint:fix
cd .tmp/slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/external-decoration-sources.test.ts --project=chromium
cd .tmp/slate-v2 && STRESS_ROUTES=external-decoration-sources STRESS_FAMILIES=overlay-many-decoration-sources PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/stress/generated-editing.test.ts --project=chromium
```

Notes:

- The focused browser spec now runs the linter, inserts `Prefix ` at the start
  of the document, then asserts the warning still wraps `obviously` and the
  comma-spacing highlight still wraps ` ,`.
- The focused stress row still passes with at least two lint slices after
  `Run linter`.
- Captured reusable guidance in
  `docs/solutions/developer-experience/2026-05-19-slate-v2-derived-lint-decorations-need-snapshot-sources-and-panel-subscriptions.md`.

## Issue And Reference Sync

- No ClawSweeper rerun for this review pass: the change is example semantics and
  proof coverage, with no fixed upstream issue claim.
- If Ralph changes the example/test only, update
  `docs/slate-v2/references/pr-description.md` only if the public PR narrative
  still claims the old explicit `sourceId` refresh teaching path.
- If Ralph changes the public refresh API default, update the PR reference and
  relevant source docs/tests in the same execution.

## Pass-State Ledger

| Pass                             | Status   | Evidence                                                                                                                                                                    |
| -------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Skill reload                     | complete | Reloaded `slate-ralplan`, `ce-review`, `learnings-researcher`, and `goal workflow` after compaction.                                                                  |
| Completion reset                 | complete | Reset `active goal state` to pending for this activation.                                                                       |
| Live source review               | complete | Read the live example plus `use-slate-decoration-source.ts` and `decoration-source.ts` from `.tmp/slate-v2`.                                                                |
| Institutional knowledge          | complete | Read the relevant projection/range and stable-reference solution notes.                                                                                                     |
| Ecosystem comparison             | complete | Checked current Context7 docs for Lexical, ProseMirror, and Tiptap decoration/plugin patterns.                                                                              |
| API verdict                      | complete | Accepted range-decoration + `deps` main path; rejected product wrapper and raw projection as the primary example.                                                           |
| Implementation                   | complete | Replaced the synthetic external-source demo with the `Linting` example in `.tmp/slate-v2`.                                                                                  |
| Verification                     | complete | Latest Ralph proof passed touched-file Biome, site/root typechecks, lint fix, focused Playwright, stress route, Plate lint, and completion check.                           |
| 2026-05-19 position drift review | complete | Live source shows lint ranges are stored in state while comments use bookmarks; plan now accepts recompute-on-text for linting and reserves bookmarks for durable comments. |
| 2026-05-19 Ralph execution       | complete | Executed the `lintMode` / `dirtiness: ['text', 'external']` target and added browser proof for typing before a lint issue.                                                  |

## Final Handoff

Closure:

- `Linting` is the public example name.
- The example keeps the low-level route id only for URL stability.
- No API addition is needed; the existing range-decoration source hook is clean
  enough.
- The example recomputes lint diagnostics from snapshots on text edits.
