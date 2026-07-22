---
"@platejs/core": major
---

Scope `editor.plugin(FooPlugin).api` to the plugin API and expose the composed
editor API through `editor.plugin(FooPlugin).editor.api`.

Replace Slate-era Core exports with Plite and Plate-owned names.

Replace `pipeInsertDataQuery` with `prepareInsertDataQuery`, which compiles one
resolved plugin query and runs it against an immutable editor state.

Pass each render wrapper its owning plugin portal context and forward Plite DOM
strategy props through Plate content.

Render legacy decoration data through projection-backed leaves without coupling
plugin identities to serialized mark names.

Skip autofocus, input rule, and override work when lifecycle targets are unavailable.

Keep Plate root wiring on direct Plite React imports and infer plugin lookup
and root callback types without local adapter casts.

Prepare v54 beta prerelease versioning and preserve initial selections when
`transformInitialValue` wraps selected text during editor setup.

Install typed plugin-object dependencies recursively with deterministic
overrides, dependency-first ordering, and graph validation.

Declare document identity with top-level `type`, element behavior through
`schema.element`, marks through descriptor-backed `schema.mark`, rendering
through `render`, and DOM attribute policy through `host`.

Derive schema identity from compiled plugin semantics when editor creation
omits `schema`. Pass `{ id, version }` only for application-named History,
Yjs, or migration lineage. `createBaseEditor`, `createPlateEditor`,
`createStaticEditor`, `usePlateEditor`, and `usePlateViewEditor` accept no
options.

Keep plugin model configuration immutable. Use object-form `.configure(...)`
for descriptor data, contextual `.configure(context => ...)` for existing
runtime options, handlers, renderers, and shortcuts, and `.extend(...)` for
additive plugin contracts. Use `editor.configure(plugin, config)` for atomic
live reconfiguration of the compiled schema, APIs, updates, parsers, renderers,
handlers, and lifecycle.

Declare cross-plugin schema and host targets with the plugin's top-level
`targetPluginKeys` field.

Register semantic command policy through extension
`commands: ({ handle, around }) => [...]` factories. Handlers return
`false | TransactionSpec`; `handle` provides ordered fallback and `around`
wraps or rewrites downstream behavior.

**Migration:** Replace nested plugin API reads with the scoped portal API:

```tsx
// Before
editor.plugin(FooPlugin).api.foo.method();

// After
editor.plugin(FooPlugin).api.method();
editor.plugin(FooPlugin).editor.api.foo.method();
```

Prepare parser queries once, then run them against read-only editor state:

```tsx
const canInsert = prepareInsertDataQuery(editor, ParserPlugin);
const allowed = editor.read((state) => canInsert(state, options));
```

Rename these exports:

- `Slate` to `Plite`
- `PlateSlate` to `PlateRoot`
- `useSlateProps` to `usePlateRootProps`
- `getSlatePlugin` to `getBasePlugin`
- `SlateRenderElementProps` to `PliteRenderElementProps`
- `SlateRenderLeafProps` to `PliteRenderLeafProps`
- `SlateRenderTextProps` to `PliteRenderTextProps`

Replace dependency keys such as `dependencies: ['feature']` with the plugin
object, for example `dependencies: [BaseFeaturePlugin]`.

Replace the overloaded `node` declaration with explicit model and host fields:

```tsx
createPlatePlugin({
  key: 'link',
  type: 'a',
  schema: { element: { inline: true } },
  render: { node: LinkElement },
});
```

Move callback configuration to `.extend(...)`:

```tsx
// Before
FooPlugin.configure(({ editor }) => ({
  options: { enabled: editor.api.isEnabled() },
}));

// After
FooPlugin.extend(({ editor }) => ({
  options: { enabled: editor.api.isEnabled() },
}));
```

Move injection target lists to the plugin descriptor:

```tsx
createPlatePlugin({
  key: 'align',
  targetPluginKeys: [KEYS.p],
  inject: { nodeProps: { styleKey: 'textAlign' } },
});
```
