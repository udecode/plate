# Slate v2 Custom Placeholder Visual Parity

## Goal

Compare `examples/custom-placeholder` against legacy Slate and fix the visual regression where custom placeholders render as normal black document content instead of the grey absolute overlay.

## Findings

- Legacy passes default placeholder overlay styles through `renderPlaceholder` attributes.
- Slate v2 applies default overlay styles only inside `SlatePlaceholder`.
- Custom `renderPlaceholder` in v2 receives `attributes.style = {}`, so example markup falls into normal document flow.
- After style parity, `dev-browser` showed a second legacy-parity miss: the placeholder was absolutely positioned, but the editable root stayed `22px` tall while the custom placeholder was `86px` tall. The overlay was vertically outside the editor.
- Owners are `packages/slate-react/src/components/editable-text.tsx` for placeholder attrs and `packages/slate-react/src/components/editable-text-blocks.tsx` for placeholder-height measurement, not the example.

## Checklist

- [x] Add a focused primitive regression contract.
- [x] Patch placeholder attribute style ownership.
- [x] Verify focused package test.
- [x] Verify package build/type/lint for `slate-react`.
- [x] Browser-check the custom-placeholder page when practical.

## Verification

- Red proof: `bun test ./packages/slate-react/test/primitives-contract.tsx -t "custom placeholder" --bail 1` failed with `position` empty.
- Green proof: same focused test passed after sharing the default placeholder style.
- `bun test ./packages/slate-react/test/primitives-contract.tsx --bail 1` passed.
- `bun test ./packages/slate-react/test/rendered-dom-shape-contract.tsx --bail 1` passed.
- `bunx turbo build --filter=./packages/slate-react --filter=./packages/slate-dom --force` passed.
- `bunx turbo typecheck --filter=./packages/slate-react --filter=./packages/slate-dom --force` passed.
- `bun run lint:fix` passed and formatted one file.
- `bun run lint` passed.
- `dev-browser --connect http://127.0.0.1:9222` verified `/examples/custom-placeholder` computes `position: absolute`, `opacity: 0.333`, and `pointer-events: none` for `[data-slate-placeholder="true"]`.
- Follow-up `dev-browser` verification caught the height regression: editor height `22.390625`, placeholder height `86.578125`, `bottomInside: false`.
- Added `custom placeholder height contributes to editable root height` in `rendered-dom-shape-contract.tsx`.
- Final `dev-browser` verification: editor height `86.578125`, placeholder height `86.578125`, root `minHeight: 86.5781px`, and all containment checks true.

## Memory

- Updated `docs/solutions/logic-errors/2026-04-04-v2-placeholder-primitives-should-own-overlay-attrs-and-style.md` with the custom renderer regression and shared-style rule.

## 2026-04-26 Follow-up: Delete-To-Empty Regression

Status: done.

Symptom:

- After typing text in `/examples/custom-placeholder` and deleting it all, v2
  rendered only the custom placeholder body. The `Type something` placeholder
  child disappeared, and the editor root collapsed back to one empty line.

Cause:

- Text insertion unmounted the placeholder and made the root rerender with
  `placeholderValue = undefined`. Deleting back to empty only rerendered the
  text node, so the custom renderer was called with `children: undefined`, and
  placeholder height measurement never restarted.

Fix:

- `EditableTextBlocks` now subscribes to the placeholder-visible state instead
  of deriving it only during structural root renders.
- `EditableText` no longer calls a custom `renderPlaceholder` when no
  placeholder value is present.

Evidence:

- Red proof: `bun test ./packages/slate-react/test/rendered-dom-shape-contract.tsx -t "custom placeholder restores" --bail 1` failed with placeholder text `custom placeholder`.
- Green proof: same focused test passed after the runtime patch.
- `bun test ./packages/slate-react/test/rendered-dom-shape-contract.tsx --bail 1`
- `bun test ./packages/slate-react/test/primitives-contract.tsx --bail 1`
- `bun --cwd packages/slate-react test -- --bail 1`
- `bunx turbo build --filter=./packages/slate-react --force`
- `bunx turbo typecheck --filter=./packages/slate-react --force`
- `bun run lint:fix`
- `bun run lint`
- `dev-browser --connect http://127.0.0.1:9222` verified type/delete on
  `http://localhost:3100/examples/custom-placeholder`: placeholder text
  restored, editor height `86.578125`, placeholder height `86.578125`,
  `minHeight: 86.5781px`, `position: absolute`, and `bottomInside: true`.
