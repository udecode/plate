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
- use `usePath()` when you need the current element path
- do **not** reach for `useNodePath()` for dynamic validity state that must
  survive sibling path shifts

---

## Preserve props passthrough

If a renderer forwards to `PlateElement` or `SlateElement`, keep the full
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
const api = editor.getApi(CommentPlugin).comment;
const tf = editor.getTransforms(CommentPlugin).comment;
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
