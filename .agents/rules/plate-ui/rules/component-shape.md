# Component Shape & Editor Access

## Contents

- Node context hooks
- Preserve props passthrough
- Plugin access
- Base/live split
- Keep helpers local

---

## Node context hooks

For node renderers already inside Plate element context:

- use `useElement()` when you need the current element object
- use the incoming `PlateElementProps.path` when rendered output genuinely
  depends on the current path
- when a path is needed only inside an event handler or command, keep the
  element and resolve `editor.read.nodes.path(element)` at interaction time
- treat `usePath()` as a reactive dependency: keep it only when a descendant
  must rerender or resynchronize as its element moves and no path prop is
  already available
- do not add `usePath()` merely to replace an event-time path lookup; that
  converts cold interaction work into a dependency in every mounted node
- do **not** reach for `useNodePath()` for dynamic validity state that must
  survive sibling path shifts

---

## Preserve props passthrough

If a renderer forwards to `PlateElement` or `PliteElement`, keep the full
incoming `props` object intact and destructure from it locally:

**Correct:**

```tsx
export function MyElement(props: PlateElementProps<TNode>) {
  const { editor, element } = props;

  return <PlateElement {...props} />;
}
```

**Incorrect:**

```tsx
export function MyElement({
  editor,
  element,
  ...props
}: PlateElementProps<TNode>) {
  return <PlateElement {...props} />;
}
```

That drops required renderer props from the passthrough object.

---

## Plugin access

Prefer the repo’s direct patterns:

```tsx
const api = editor.plugin(CommentPlugin).api;
const update = editor.plugin(CommentPlugin).update;
```

Or:

```tsx
const { api, editor } = useEditorPlugin(CommentPlugin);
```

Do **not** invent local wrappers like:

```tsx
const getCommentApi = (editor) => ...
const getCommentTransforms = (editor) => ...
```

unless multiple files genuinely need the same typed adapter.

---

## Base/live split

If a surface has both static/base and live renderers, keep the split explicit:

```tsx
export const BaseMathKit = [
  BaseInlineEquationPlugin.withComponent(InlineEquationElementStatic),
  BaseEquationPlugin.withComponent(EquationElementStatic),
];

export const MathKit = [
  InlineEquationPlugin.withComponent(InlineEquationElement),
  EquationPlugin.withComponent(EquationElement),
];
```

Do not hide this behind a factory if the explicit array is clearer.

---

## Keep helpers local

If a helper is used once, keep it in the component file.

Extract only when:

- it becomes a stable package contract
- or multiple files need it
- or the helper stops being UI-specific
