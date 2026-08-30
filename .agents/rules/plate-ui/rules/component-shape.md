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
- element component and node-wrapper props do not expose `path`; position is
  live runtime state, not a stable render input
- when a path is needed only inside an event handler or command, keep the
  element and resolve `editor.read.nodes.path(element)` at interaction time
- treat `usePath()` as a reactive dependency: keep it only when a descendant
  must rerender or resynchronize as its element moves
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
export function MyElement(props: PlateElementProps<typeof MyPlugin>) {
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
}: PlateElementProps<typeof MyPlugin>) {
  return <PlateElement {...props} />;
}
```

That drops required renderer props from the passthrough object.

---

## Plugin access

Prefer the repo’s direct patterns:

```tsx
// Host-owned app code inferred from its local editor construction.
const api = editor.api.comment;
const update = editor.update.comment;
```

Copied registry UI and other generic code that owns or requires an exact
descriptor use its portal:

```tsx
const { api, editor } = useEditorPlugin(CommentPlugin);
```

If the generic component accepts a legitimately optional descriptor, keep the
portal and test availability before touching its API, updates, options, or
installed descriptor:

```tsx
const comment = editor.plugin(CommentPlugin);

if (comment.installed) {
  comment.api.open();
}
```

Registry UI remains generic even when its current host has a complete inferred
application contract. Do not import an app-specific editor type or
application-definition module there, cast a root
`editor.api` namespace, infer availability from node/schema internals, or catch
a missing-portal error. Use the core `useEditor()` plus descriptor portals.

A registry example whose metadata explicitly depends on `editor-kit` may
import the host's ordinary plugin composition. Independently copied UI may
not. The `editor-kit` name describes copied registry packaging; it is not an
application runtime API or application type owner.

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
  BaseInlineEquationPlugin.configure({
    component: InlineEquationElementStatic,
  }),
  BaseEquationPlugin.configure({
    component: EquationElementStatic,
  }),
];

export const MathKit = [
  InlineEquationPlugin.configure({ component: InlineEquationElement }),
  EquationPlugin.configure({ component: EquationElement }),
];
```

Base/static files must not import `platejs/react` or any `platejs/*/react`
entrypoint. `BasePlugin.configure({ component })` is the
static binding path; `toPlatePlugin(BasePlugin)` belongs only in live React
adapters.
Bind Base/static descriptors to static renderer modules, never live/client
node components. Registry Base kits use the owning `*-static` component.

Do not hide this behind a factory if the explicit array is clearer.

---

## Keep helpers local

If a helper is used once, keep it in the component file.

Start with the direct component. Do not extract `useFooState`, `useFooProps`, a
prop factory, provider, HOC, or component factory to make the JSX owner shorter.
The master component-family and headless-primitive gates live in `plate-ui`.

Extract only when:

- it becomes a stable package contract
- or multiple files need it
- or the helper stops being UI-specific
