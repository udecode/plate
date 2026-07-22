---
"@platejs/core": major
---

Scope `editor.plugin(FooPlugin).api` to the plugin API and expose the composed
editor API through `editor.plugin(FooPlugin).editor.api`.

Contextually infer callbacks for contract-declared explicit transaction groups.

Replace Slate-era Core exports with Plite and Plate-owned names.

Replace `pipeInsertDataQuery` with `prepareInsertDataQuery`, which compiles one
resolved plugin query and runs it against an immutable editor state.

Pass each render wrapper its owning plugin portal context and forward Plite DOM
strategy props through Plate content.

Preserve decoration rendering without coupling plugin identities to serialized
mark names.

Skip autofocus, input rule, and override work when lifecycle targets are unavailable.

Preserve initial selections when `transformInitialValue` wraps selected text
during editor setup.

Install typed plugin-object dependencies recursively with deterministic
overrides, dependency-first ordering, and graph validation.

Declare document identity with top-level `type`, element behavior through
`schema.element`, marks through descriptor-backed `schema.mark`, rendering
through `render`, and DOM attribute policy through `host`.

Derive schema identity from compiled plugin semantics when editor creation
omits `schema`. Pass `{ id, version }` only for application-named History,
Yjs, or migration lineage. Editor factories derive identity when called
without a `schema` option.

Keep plugin-owned values in one `options` bag. Use object-form
`.configure({ options })` for descriptor values and contextual
`.configure(context => ...)` for options, handlers, renderers, and shortcuts.
Contextual layers compose in declaration order. Reserve `.extend(...)` for
additive, type-widening plugin contracts. Read and update live values through
the scoped portal's `getOptions`, `setOption`, and `setOptions`; live option
updates do not rebuild the compiled schema.

Declare cross-plugin schema and host targets with the plugin's top-level
`targetPluginKeys` field.

Register semantic command policy through extension
`commands: ({ handle, around }) => [...]` factories. Handlers return
`false | TransactionSpec`; `handle` provides ordered fallback and `around`
wraps or rewrites downstream behavior.

Resolve shortcut names against the owning plugin's `.update` and `.api`
groups. Set `target: 'update' | 'api'` only when both groups define the same
name; custom shortcut handlers do not accept `target`.

Initialize editors synchronously through `initialValue` or
`({ editor }) => Value`. Observe published edits through
`onCommit({ editor, commit, snapshot })`.

Make `useEditor()` strict and `useActiveEditor()` nullable. Resolve rendered
elements and paths through descriptor-aware `useElement`, `useOptionalElement`,
`usePath`, and `useOptionalPath` hooks.

Render static HTML through `renderStaticHtml` from `platejs/static`.

**Migration:** Replace nested plugin API reads with the scoped portal API:

```tsx
// Before
editor.getApi(FooPlugin).foo.method();
editor.api.foo.method();

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

Load asynchronous values before editor construction and pass a synchronous
`initialValue`:

```tsx
// Before
createPlateEditor({
  value: () => loadDocument(),
  onReady: ({ editor }) => activateEditor(editor),
});

// After
const initialValue = await loadDocument();
const editor = createPlateEditor({ initialValue });
activateEditor(editor);
```

When editor construction cannot wait for the document, skip initialization and
publish the loaded value once:

```tsx
const editor = createPlateEditor({ plugins, skipInitialization: true });
const children = await loadDocument();

editor.update.value.replace({ children });
```

Use strict provider hooks and provider-owned element paths:

```tsx
// Before
const editor = useEditorRef();
const path = useNodePath(element);

// After
const editor = useEditor();
const path = usePath();
```

Rename static HTML rendering:

```tsx
// Before
import { serializeHtml } from 'platejs/static';

// After
import { renderStaticHtml } from 'platejs/static';
```

Move injection target lists to the plugin descriptor:

```tsx
createPlatePlugin({
  key: 'align',
  targetPluginKeys: [KEYS.p],
  inject: { nodeProps: { styleKey: 'textAlign' } },
});
```
