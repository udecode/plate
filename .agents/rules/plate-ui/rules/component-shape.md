# Component Shape & Editor Access

## Contents

- Node context hooks
- Preserve props passthrough
- Inline component props
- Plugin field contracts
- Plugin access
- Base/live split
- Keep helpers local

---

## Node context hooks

For node renderers already inside Plate element context:

- use `useElement()` when you need the current element object
- use `useElementSelector(FooPlugin, node => node.field)` for a derived payload
  value; use `usePath(path => path.at(-1))` for a derived live position
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

If a renderer forwards to `EditorElement` or `EditorElement`, keep the full
incoming `props` object intact and destructure from it locally:

**Correct:**

```tsx
export function MyElement(props: EditorElementProps<typeof MyPlugin>) {
  const { editor, element } = props;

  return <EditorElement {...props} />;
}
```

**Incorrect:**

```tsx
export function MyElement({
  editor,
  element,
  ...props
}: EditorElementProps<typeof MyPlugin>) {
  return <EditorElement {...props} />;
}
```

That drops required renderer props from the passthrough object.

---

## Inline component props

Write a component-owned prop shape at the component signature:

```tsx
export function ToolbarButton({ active, children }: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return <button data-active={active || undefined}>{children}</button>;
}
```

Do not create a local `ToolbarButtonProps` alias. Same-file siblings, helpers,
signature length, and generic complexity do not make that alias a contract.
Keep a named component prop type only when it is exported through a real
cross-file or published entrypoint contract. Do not export a type merely to
avoid inlining it.

An inline prop shape may select from an honest domain owner such as
`Pick<EmojiPickerState, 'isOpen'>`. The state remains a state contract; do not
flatten it or rename it to a prop bag. Descriptor-owned public renderer types
such as `EditorElementProps<typeof FooPlugin>` remain their existing exported
contracts.

Apply this convention during implementation and review. It does not need a
dedicated whole-repository lint gate.

---

## Plugin field contracts

Plate owns the types of framework-defined plugin fields. Registry code consumes
those contracts; it does not restate them.

| Plugin field | Extracted consumer type |
| --- | --- |
| live node `component` | `EditorElementProps<typeof FooPlugin>` or `EditorLeafProps<typeof FooPlugin>` |
| static node `component` | the matching descriptor-derived Plite props |
| `beforeEditable` / `afterEditable` | `EditableSiblingProps` |
| `beforeContainer` / `afterContainer` | `ContainerSiblingProps` |
| `wrapRoot` | `WrapRootProps` |
| `wrapContent` | `WrapContentProps` |
| `wrapNode` / `wrapNodeChildren` | the matching `RenderNodeWrapperProps`, `RenderNodeWrapper`, or descriptor form |

Keep inline plugin builder callbacks contextually typed by `.configure()` or
`.extend()`. Do not add a local object type, state `Pick` alias, callback return
annotation, or cast merely to make a native field compile:

```tsx
// Correct: the package owns the extracted slot contract.
function FeatureRoot({ children, editableRef }: WrapRootProps) {
  useFeature(editableRef);

  return children;
}

// Correct: the plugin builder infers native callback fields.
const FeaturePlugin = BaseFeaturePlugin.configure(({ editor }) => ({
  initialState: {
    query: () => editor.read.isEnabled(),
  },
}));

// Incorrect: copied UI reconstructs a framework-owned field.
function FeatureRoot({ children, editableRef }: {
  children: React.ReactNode;
  editableRef: React.RefObject<HTMLDivElement | null>;
}) {
  return children;
}

// Incorrect: a local adapter hides failed builder inference.
type FeaturePluginState = Pick<BaseFeaturePluginState, 'query'>;

BaseFeaturePlugin.extend(
  ({ editor }): { initialState: FeaturePluginState } => ({
    initialState: { query: () => editor.read.isEnabled() },
  })
);
```

If the package does not export the exact extracted-field contract, or the
builder cannot infer a native callback, treat that as a package API defect.
Route the repair through `plate-plugin-creator` and `best-api`, add the smallest
canonical contract at the field owner, and prove its public inference before
using it in registry code. Do not leave a local shadow contract behind.

Application-authored API method parameters, honest domain data, and ordinary
component props may still carry explicit types. The forbidden annotations are
the ones that duplicate a framework field or coerce plugin builder acceptance.

---

## Plugin access

Prefer the repo’s direct patterns:

```tsx
// Host-owned app code inferred from its local editor construction.
const api = editor.api.comments;
```

Copied registry UI and other generic code that owns or requires an exact
descriptor use its portal:

```tsx
const editor = useEditor();
const { api } = editor.plugin(SuggestionPlugin);
```

If the generic component accepts a legitimately optional descriptor, keep the
portal and test availability before touching its API, updates, options, or
installed descriptor:

```tsx
const suggestion = editor.plugin(SuggestionPlugin);

if (suggestion.installed) {
  suggestion.api.createIdentity();
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
static binding path; `toReactPlugin(BasePlugin)` belongs only in live React
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
