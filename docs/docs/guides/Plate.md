---
slug: /Plate
title: Plate
---

`Plate` is the core component updating the store, computing the
`Slate` props, the `Editable` props and rendering them.

## Store updates

- On mount, calls [setInitialState](store#setinitialstate)
- If defined, set `initialValue`/`value`, `enabled`, `plugins` into the
  store.
- If `enabled` is `true`, set `editor` with `withPlate` into the
  store.
- If `enabled` is `false`, set `editor` to `undefined`.
- `editor` is set only once (if not defined) as required by slate.
- On unmount, calls [clearState](store#clearstate)

## Slate Props

`Plate` computes the `Slate` props:

### `key`

- Each time the editor reference updates, a new random key should be set
to `Slate` to unmount and mount again the component.

### `editor`

- `Slate` needs an `editor` object to apply its operations on it.

### `onChange`

1. Calls [setValue](store#setvalue)
2. Pipes plugins `onChange`.
3. Calls `onChange` props.

## Editable Props

In addition to `editableProps`, `Plate` computes the `Editable`
props if `editor` is defined.

### `decorate`

- Pipes plugins `decorate`.

### `renderElement`

- Pipes plugins `renderElement`.

### `renderLeaf`

- Pipes plugins `renderLeaf`.

### Handlers

- Pipes plugins DOM handlers, e.g. `onDOMBeforeInput`, `onKeyDown`, etc.

## Props

`Plate` props:

### `id`

- A unique id used to store the editor state by id.
- Required if rendering multiple `Plate`. Optional otherwise.
- Default is `'main'`.

### `children`

- The children rendered inside `Slate` before the `Editable` component.

### `components`

- Components stored by plugin key.
- These will be merged into `options`.
- Read more in [Styling](styling#components).

### `editableProps`

- The props for the `Editable` component.

### `editor`

- Set [editor](store#editor) into the store.
- Default is `createEditor()`.

### `enabled`

- Set [enabled](store#enabled) into the store.

### `initialValue`

- Initial value of the editor.

### `normalizeInitialValue`
 
- When `true`, it will normalize the initial value passed to the `editor` once it gets created.
- This is useful when adding normalization rules on already existing content.
- Default is `false`.

### `options`

- Options stored by plugin key.

### `plugins`

- Set [plugins](store#plugins) into the store.

### `value`

- Set [value](store#value) into the store.
