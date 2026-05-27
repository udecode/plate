# Slate v2 ReactEditor Type Hard Cut

Status: done
Runtime id: 019e3627-238b-7993-a8cf-26be45504c47
Completion file: `active goal state`
Continue file: `active goal state`

## Goal

Expose the created React editor type as `ReactEditor`, not
`ReactEditorInstance`, while preserving extension-derived `api`, `state`, `tx`,
and `getApi(...)` typing.

## Context Grounding

- User rejected `ReactEditorInstance` as public DX.
- The former internal `ReactEditor` interface in
  `slate-react/src/plugin/react-editor.ts` extended `DOMEditor<V>` and
  hand-wrote `api.dom` / `api.clipboard`.
- `react()` deletes root `editor.dom` and installs DOM/React handles through
  `editor.api`, so the old interface lies about the runtime shape.
- `createReactEditor()` already returns the correct extension-derived type, but
  it is named `ReactEditorInstance`.
- `HistoryExtension` is the right local name for the default history factory
  output. Do not use `DefaultHistoryExtension`.

## Scope

In scope:

- `.tmp/slate-v2/packages/slate-react/src/plugin/with-react.ts`
- `.tmp/slate-v2/packages/slate-react/src/plugin/react-editor.ts`
- `.tmp/slate-v2/packages/slate-react/src/index.ts`
- call sites importing `ReactEditorInstance`
- focused generic type contracts if the existing contracts do not cover the
  public rename

Out of scope:

- Changing the runtime extension architecture.
- Restoring root `editor.dom`, root `editor.history`, or wrapper-style editor
  intersections.
- Backward compatibility export for `ReactEditorInstance`.

## Implementation Plan

1. Move the public `ReactEditor<V, TExtensions>` type to the extension-derived
   shape in `with-react.ts`.
2. Rename return types and Slate props from `ReactEditorInstance` to
   `ReactEditor`.
3. Keep the internal `ReactEditor` runtime namespace value, but rename the
   internal editor instance annotation type so it cannot compete with the public
   generic `ReactEditor`.
4. Update examples and internal aliases.
5. Add or update negative/positive type contracts proving:
   - `ReactEditor<CustomValue>` includes default `api.history`.
   - extra extensions contribute custom `api` handles.
   - disabled `history({ enabled: false })` removes `api.history`.
   - root `editor.dom` is not part of the public React editor type.

## Verification

Required before `done`:

- `bun x tsc --project packages/slate-react/test/tsconfig.generic-types.json --noEmit`
- `bun --filter slate-react typecheck`
- `bun typecheck:site`
- `bun lint:fix`
- `bun check`

## Ralph Ledger

- 2026-05-17: Started via Ralph. Completion reset to `pending`; next owner is
  `.tmp/slate-v2/packages/slate-react`.
- 2026-05-17: Implemented public `ReactEditor<V, TExtensions>` as
  `Editor<V, [react(), history(), ...TExtensions]>`, removed public
  `ReactEditorInstance`, updated examples and docs, and kept `HistoryExtension`
  as the local type name.
- 2026-05-17: Added generic type coverage for default history, disabled
  history, custom extension API handles, and the absence of root `editor.dom` on
  the public React editor type.
- 2026-05-17: Reference docs updated:
  `docs/slate-v2/references/pr-description.md` now distinguishes the non-public
  runtime helper namespace from the public `ReactEditor<Value, Extensions>`
  instance type. Issue ledgers unchanged; no fixed/improved issue claim changed.
- 2026-05-17: Full Ralph closeout requested. Reopened lane for explicit
  `diff-review-pass` and `verification-sweep-pass` accounting before final
  `done`.
- 2026-05-17: Diff review found one real P2: `plugin/react-editor.ts` still
  exported an internal `ReactEditor` interface with the old DOM inheritance
  shape. Fixed by renaming internal annotations to `ReactRuntimeEditor` while
  leaving the non-public runtime helper namespace as `ReactEditor`.
- 2026-05-17: Verification sweep passed the focused generic type contract,
  package typecheck, site typecheck, lint fix, broad `bun check`, stale-name
  grep, and the scoped completion-check command.
- 2026-05-17: `ce-compound` evaluation was positive. Captured the internal
  runtime type split learning in
  `docs/solutions/developer-experience/2026-05-17-slate-react-public-type-hard-cuts-need-internal-runtime-type-splits.md`.

## Pass Accounting

| Pass                    | Status   | Evidence                                                               | Result                                                                                                                                            |
| ----------------------- | -------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| implementation          | complete | Files listed in the ledger below.                                      | Public `ReactEditor` type is extension-derived and `ReactEditorInstance` source/docs usage is gone.                                               |
| diff-review-pass        | complete | Changed-files review found the stale internal `ReactEditor` interface. | Fixed with `ReactRuntimeEditor` internal annotations; no stale `ReactEditorInstance` or internal `interface ReactEditor` source/docs hits remain. |
| verification-sweep-pass | complete | Commands listed below.                                                 | Passed.                                                                                                                                           |

## Verification

- `bun x tsc --project packages/slate-react/test/tsconfig.generic-types.json --noEmit`: passed.
- `bun --filter slate-react typecheck`: passed.
- `bun typecheck:site`: passed.
- `bun lint:fix`: passed; fixed formatting/import ordering in renamed files.
- `bun x tsc --project packages/slate-react/test/tsconfig.generic-types.json --noEmit`: passed after lint.
- `bun --filter slate-react typecheck`: passed after lint.
- `bun typecheck:site`: passed after lint.
- `bun check`: passed; existing eslint warning remains in
  `packages/slate-react/src/components/slate.tsx`.
- `rg -n "ReactEditorInstance" .tmp/slate-v2`: no source/docs hits.
- `rg -n "ReactEditorInstance|export interface ReactEditor\b|interface ReactEditor\b|ReactRuntimeEditor\." .tmp/slate-v2/packages/slate-react .tmp/slate-v2/docs .tmp/slate-v2/site/examples/ts`: no hits.
- `node tooling/scripts/completion-check.mjs`: passed.
- `node tooling/scripts/completion-check.mjs`: passed after the `ce-compound`
  doc capture.
