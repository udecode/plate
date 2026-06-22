# React Adapter Boundary

Date: 2026-06-20

## Verdict

Do not swap `packages/core/src/react/slate-react.ts` from upstream
`slate-react` to `@platejs/slate-react` as a direct import replacement.

That would be fake compatibility. The names look close, but the runtime
contract is different.

## Current Plate Boundary

`packages/core/src/react/slate-react.ts` still re-exports old upstream
`slate-react` symbols:

- `Slate`
- `Editable`
- `RenderPlaceholderProps`
- `useComposing`
- `useFocused`
- `useReadOnly`
- `useSelected`

It no longer re-exports `withReact`, `useSlateStatic`, or
`DefaultPlaceholder`. Upstream Slate comparison code imports `withReact`
directly from upstream `slate-react` in `apps/www`, and `withPlateReact` is a
named current-runtime bridge.

Primary local consumers:

- `PlateSlate` mounts old `<Slate editor initialValue onChange ...>`.
- `PlateContent` mounts old `<Editable ...>`.
- render utilities call old `useReadOnly`.
- `PlateControllerEffect` calls old `useFocused`.
- element store calls old `useComposing` / `useReadOnly`.
- `withPlateReact` calls old upstream `withReact` through a named bridge and
  returns the Plate editor.

## Slate v2 React Surface

Current `@platejs/slate-react` exports:

- `Slate`, but its props are runtime-oriented: `editor`, `root`, `readOnly`,
  `onChange`, `onSelectionChange`, `onValueChange`, children, decoration
  sources, annotation store.
- `Editable`, but under the v2 editable runtime/root model.
- `createReactEditor` / `ReactEditor`, not old `withReact`.
- `useEditorReadOnly`, `useEditorFocused`, `useEditorComposing`.
- `useElementSelected({ at, mode })`, not old zero-arg `useSelected`.
- Slate runtime/root hooks such as `useSlateRootEditor`,
  `useSlateActiveEditor`, `useSlateRootEffect`, and
  `useSlateCommandCallback`.

Notable mismatch: Plate currently passes `initialValue` to `<Slate>`. The v2
`SlateProps` source inspected here does not expose `initialValue`; v2 editor
content is owned by editor/runtime creation and transaction updates.

## Migration Rule

No alias shim.

The next packet should build a real Plate React runtime adapter:

1. Decide whether `PlateSlate` is replaced by a v2 runtime provider or split
   into legacy/current implementations during the migration.
2. Move editor creation toward `createPlateRuntimeEditor` /
   `createReactEditor`, not `withReact(createEditor())`.
3. Map read-only/focused/composing hooks to v2 contexts only after Plate is
   actually mounted under the v2 provider.
4. Migrate `useSelected` only with behavior proof, because v2
   `useElementSelected` is path/root-aware and not a drop-in.
5. Keep `packages/core/src/react/slate-react.ts` as an explicit legacy boundary
   until the runtime adapter packet replaces its consumers.

## Proof Needed Before Cutting The Boundary

- focused `packages/core` typecheck and React component tests;
- one app-visible playground/browser proof through `apps/www`;
- no public `platejs/react` export of old upstream `withReact`,
  `useSlateStatic`, or `DefaultPlaceholder`;
- source audit showing old `withReact`, `useSlateStatic`, and direct
  `slate-react` imports are either removed or quarantined with owner.
