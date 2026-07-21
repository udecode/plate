# Creation Flow

Use this decision tree before writing a plugin:

```text
Need a new plugin?
|
+- Does the behavior matter without React?
|  |
|  +- yes -> author `packages/*/src/lib`
|  |   |
|  |   +- `createBasePlugin`
|  |       +- pass a `PluginConfig` generic only for a real public contract
|  |   |
|  |   +- Need a React/Plate layer later?
|  |       +- yes -> `toPlatePlugin`
|  |       +- no  -> keep it base-only
|  |
|  +- no -> stay in `packages/*/src/react`
|      |
|      +- Is it a bundle of existing Plate plugins?
|      |   +- yes -> `createPlatePlugin`
|      |
|      +- `createPlatePlugin`
|          +- pass a `PluginConfig` generic only for a real public contract
|
+- Need docs?
   +- hand off to `docs-creator`
```

## Default Paths

### Semantic base plugin

Use this for document semantics, update groups, parsers, injected rules, and
shared behavior contracts.

Good fits:

- `BaseCommentPlugin`
- `BaseCodeBlockPlugin`
- `HtmlPlugin`

### Plate/React wrapper

Use this when the semantic base already exists and you only need component
binding, hooks, or Plate-only wrapper config.

Good fits:

- `CommentPlugin`
- `CodeBlockPlugin`
- `MentionPlugin`

### React-native exception

Use direct Plate authoring only when the plugin has no meaningful semantic
base.

Good fits:

- `EventEditorPlugin`
- `PlaywrightPlugin`
- `CopilotPlugin`

### Bundle plugin

Use `createPlatePlugin({ plugins: [...] })` when the job is composition, not
new semantics.

Good fits:

- `BasicBlocksPlugin`

## Named Exceptions

Skipping a semantic base is fine only when one of these is true:

1. The plugin is fundamentally hook-driven or `useHooks`-driven.
2. The plugin only exists to wire DOM/editor events in the Plate layer.
3. The plugin is a bundle of already-authored Plate plugins.
4. The plugin's useful behavior only exists through React node props or
   components.
