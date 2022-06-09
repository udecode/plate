---
slug: /Plate
title: Plate
---

`Plate` is the core component controlling the
`Slate` props, the `Editable` props and the plate store.

## Plate Props

### `id`

- A unique id used to store the editor state by id.
- Required if rendering multiple `Plate`. Optional otherwise.
- Default is `'main'`.

### `children`

- The children rendered inside `Slate` before the `Editable` component.

### `disableCorePlugins`

- If `true`, disable all the core plugins.
- If an object, disable the core plugin properties that are `true` in the object.

### `editableProps`

- The props for the `Editable` component.

### `editor`

- Controlled `editor`.
- Default is `createTEditor()`.

### `enabled`

- When `false`, the editor is not rendering.
- Default is `true`.

### `initialValue`

- Initial value of the editor.
- Default is `[{ children: [{ text: '' }]}]`.

### `normalizeInitialValue`
 
- When `true`, it will normalize the initial value passed to the `editor` once it gets created.
- This is useful when adding normalization rules on already existing content.
- Default is `false`.

### `onChange`

- See [onChange](#onchange).

### `plugins`

- Plate plugins.

### `renderEditable`

- Custom `Editable` node.
- Default is `<Editable {...editableProps} />`.

### `renderElement`

- See [renderElement](#renderelement).

### `renderLeaf`

- See [renderLeaf](#renderleaf).

### `value`

- Controlled `value`.
- Default is the store value.

## Slate Props

`Plate` computes the `Slate` props:

### `key`

- Each time the editor reference updates, a new random key is set
to `Slate` to unmount and mount again the component.

### `editor`

- `Slate` needs an `editor` object to apply its operations on it.

### `onChange`

1. [setValue](store#setvalue) is called
2. Pipes `onChange` plugins.
3. `onChange` props is called if defined.

## Editable Props

In addition to `editableProps`, `Plate` computes the `Editable`
props if `editor` is defined.

### `decorate`

- Pipes `decorate` plugins.

### `renderElement`

- If plugin `isElement` is `true` and if plugin `type` equals `props.element.type`,  it will render an element using the following plugin properties:
  - `inject.props` to inject rendering props.
  - `component` to render the element.
  - `inject.aboveComponent` to inject a component above `component`.
  - `inject.belowComponent` to inject a component below `component`.
- If no plugin is found for a node type, `editableProps.renderElement` is used if defined.
- If `editableProps.renderElement` is not defined, `DefaultElement` is used (unstyled `div`).

### `renderLeaf`

- If plugin `isLeaf` is `true` and if plugin `type` equals `props.leaf.type`,  it will render a leaf using the following plugin properties:
  - `inject.props` to inject rendering props.
  - `component` to render the leaf.
- If no plugin is found for a node type, `editableProps.renderLeaf` is used if defined.
- If `editableProps.renderLeaf` is not defined, `DefaultLeaf` is used (unstyled `span`).

### Handlers

- Pipes DOM handlers plugins, e.g. `onDOMBeforeInput`, `onKeyDown`,` etc.

## Store updates

- On `Plate` mount, [setInitialState](store#setinitialstate) is called.
- If defined, set `enabled`, `initialValue` or `value` into the
  store.
  - If `enabled` is `true`, set `editor` with `withPlate` into the
    store.
  - If `enabled` is `false`, set `editor` to `undefined`.
- `editor` is set only once (if not defined) as required by slate. You'll need to call [resetEditor](store/#reseteditor) to reset it.
- On `Plate` unmount, [clearState](store#clearstate) is called.
