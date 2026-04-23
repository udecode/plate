---
title: Slate react text-block placeholder contract must omit native textarea placeholder
date: 2026-04-15
category: docs/solutions/developer-experience
module: slate-v2 slate-react
problem_type: developer_experience
component: tooling
symptoms:
  - JSX placeholder hosts in `custom-placeholder` and `placeholder-surface` stopped typechecking even though the runtime supported them
  - `EditableTextBlocksProps['placeholder']` collapsed into a nonsense `ReactNode & string` shape
  - site typecheck failures surfaced while recovering unrelated example drift
root_cause: wrong_api
resolution_type: code_fix
severity: medium
tags: [slate-v2, slate-react, placeholder, types, public-surface]
---

# Slate react text-block placeholder contract must omit native textarea placeholder

## Problem

`EditableTextBlocksProps` exposes a current custom `placeholder?: ReactNode`
contract so examples can render real JSX placeholder hosts.

The prop bag still inherited the native textarea `placeholder?: string`
attribute, so TypeScript intersected the two contracts into garbage.

## Symptoms

- [`placeholder-surface.tsx`](/Users/zbeyens/git/slate-v2/site/examples/ts/components/placeholder-surface.tsx)
  and [`custom-placeholder.tsx`](/Users/zbeyens/git/slate-v2/site/examples/ts/custom-placeholder.tsx)
  started failing `tsc`
- JSX placeholder values like `<><p>Type something</p></>` were rejected even
  though the runtime rendered them
- the failure showed up as a bizarre string-heavy union instead of a clear prop
  contract error

## What Didn't Work

- treating the typecheck failure as unrelated repo dirt
- staring only at the example files
- trusting the runtime because the placeholder UI already worked in the browser

The problem was not the examples.
The package type surface was lying.

## Solution

Omit the native `placeholder` key from the inherited textarea attributes in
[`editable-text-blocks.tsx`](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx)
so the current custom `ReactNode` placeholder contract owns the name cleanly.

```ts
} & Omit<
  TextareaHTMLAttributes<HTMLDivElement>,
  | 'autoFocus'
  | 'children'
  | 'className'
  | 'id'
  | 'onKeyDown'
  | 'onPaste'
  | 'placeholder'
  | 'readOnly'
  | 'spellCheck'
  | 'style'
>;
```

Then pin the contract with a compile-time proof in
[`primitives-contract.tsx`](/Users/zbeyens/git/slate-v2/packages/slate-react/test/primitives-contract.tsx)
using JSX placeholder hosts on both `EditableBlocksProps` and
`EditableTextBlocksProps`.

## Why This Works

Without the omit, the type system sees two different `placeholder` contracts:

- native textarea: `string`
- current text-block surface: `ReactNode`

That intersection is narrower than either real runtime contract, so callers get
type errors for perfectly valid JSX.

Once the native key is removed, the current public surface becomes honest
again: callers can pass strings or richer JSX because `ReactNode` owns the
prop.

## Prevention

- When a public component defines a custom prop that reuses a native DOM prop
  name, omit the native key first.
- Do not stop at runtime proof when a current example uses a public package
  prop; the exported type has to match the behavior.
- Add a contract test the moment a public prop widens beyond the native DOM
  shape.
- For projection-backed example recoveries, remember the sister trap from the
  same batch: if the example restores an outer [`Slate`](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate.tsx)
  wrapper, thread `projectionStore` through that provider or the decoration
  slices never reach `EditableBlocks`.

## Related Issues

- [Slate v2 Example Parity Recovery Plan](/Users/zbeyens/git/plate-2/docs/plans/2026-04-15-slate-v2-example-parity-recovery-plan.md)
- [Slate v2 Example Parity Matrix](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/example-parity-matrix.md)
