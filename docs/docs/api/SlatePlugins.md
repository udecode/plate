---
slug: /SlatePlugins
title: SlatePlugins
---

### `id`
`string`

A unique id used to store the editor state by id.
Required if rendering multiple `SlatePlugins`.
Optional otherwise.

### `children`
`React.ReactNode`

The children rendered inside `Slate` before the `Editable` component.

### `editableProps`
[`EditableProps`](https://github.com/ianstormtaylor/slate/blob/v0.61.3/packages/slate-react/src/components/editable.tsx#L90-L100)

The props for the `Editable` component.
