# Component Shape & Editor Access

`docs/vision/plate.md` (Plugin and component doctrine) holds the component
shape and editor-access law. This reference keeps the plugin field contracts
that copied registry code consumes.

## Plugin field contracts

Plate owns the types of framework-defined plugin fields. Registry code consumes
those contracts; it does not restate them.

| Plugin field | Extracted consumer type |
| --- | --- |
| live node `component` | `EditorElementProps<typeof FooPlugin>` or `EditorLeafProps<typeof FooPlugin>` |
| static node `component` | the same descriptor-derived props from `platejs/static` |
| `beforeEditable` / `afterEditable` | `EditableSiblingProps` |
| `beforeContainer` / `afterContainer` | `ContainerSiblingProps` |
| `wrapRoot` | `WrapRootProps` |
| `wrapContent` | `WrapContentProps` |
| `wrapNode` / `wrapNodeChildren` | the matching `RenderNodeWrapperProps`, `RenderNodeWrapper`, or descriptor form |

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
