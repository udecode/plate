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

- The last children rendered inside `Slate`, after `Editable`.

### `disableCorePlugins`

- If `true`, disable all the core plugins.
- If an object, disable the core plugin properties that are `true` in the object.

### `editableProps`

- The props for the `Editable` component.

### `editableRef`

- Ref to the `Editable` component.

### `editor`

- Controlled `editor`.
- Default is `pipe(createTEditor(), withPlate({ id, plugins }))`.

### `enabled`

- When `true`, Plate will set the editor.
- When updating to `false`, Plate will remove the editor from the store.
- When `false`, Plate will not render `Editable`.
- Default is `true`.

### `firstChildren`

- The first children rendered inside `Slate`, before `Editable`.
- Slate DOM is not yet resolvable on first render, for that case use `children` instead.

### `initialValue`

- Initial value of the editor.
- Default is `[{ children: [{ text: '' }]}]`.

### `normalizeInitialValue`
 
- When `true`, it will normalize the initial value passed to the `editor` once it gets created.
- This is useful when adding normalization rules on already existing content.
- Default is `false`.

### `onChange`

- See [onChange](#slate-onchange).

### `plugins`

- Plate plugins.
- See [Plugins](/docs/plugins).

### `renderEditable`

- Custom `Editable` node.
- Default is `<Editable {...editableProps} />`.

### `renderElement`

- See [renderElement](#editable-renderelement).

### `renderLeaf`

- See [renderLeaf](#editable-renderleaf).

### `value`

- Editor `value`.
- Stored in the store on each change (`Editable.onChange`).
- Except when resetting the editor with `resetEditor`, you should not directly update the value as it would break the history.
- If you want to update `value` with history support, you should use [Slate transforms](https://docs.slatejs.org/concepts/04-transforms) like `Transforms.setNodes`.
- Default is `[{ children: [{ text: '' }]}]`.

## Slate Props

`Plate` computes the `Slate` props:

### Slate `key`

- Each time the editor reference updates, a new random key is set
to `Slate` to unmount and mount again the component.

### Slate `editor`

- `Slate` needs an `editor` object to apply its operations on it.

### Slate `onChange`

Callback called by `Slate` on each change:
1. The new value is stored in plate [store](/docs/store#value).
2. Pipes `onChange` plugins.
3. `onChange` prop is called if defined.

## Editable Props

In addition to `editableProps`, `Plate` computes the `Editable`
props if `editor` is defined.

### Editable `decorate`

- Pipes `decorate` plugins.
- Adds `editableProps.decorate` if defined.

### Editable `renderElement`

- If plugin `isElement` is `true` and if plugin `type` equals `props.element.type`,  it will render an element using the following plugin properties:
  - `inject.props` to inject rendering props.
  - `component` to render the element.
  - `inject.aboveComponent` to inject a component above `component`.
  - `inject.belowComponent` to inject a component below `component`.
- If no plugin is found for a node type, `editableProps.renderElement` is used if defined.
- If the latter is not defined, `DefaultElement` is used (unstyled `div`).

### Editable `renderLeaf`

- If plugin `isLeaf` is `true` and if plugin `type` equals `props.leaf.type`,  it will render a leaf using the following plugin properties:
  - `inject.props` to inject rendering props.
  - `component` to render the leaf.
- If no plugin is found for a node type, `editableProps.renderLeaf` is used if defined.
- If the latter is not defined, `DefaultLeaf` is used (unstyled `span`).

### Handlers

- Pipes DOM handlers plugins, e.g. `onDOMBeforeInput`, `onKeyDown`,` etc.
