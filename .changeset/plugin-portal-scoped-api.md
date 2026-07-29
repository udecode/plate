---
"@platejs/core": major
---

Export named `*PluginState` contracts for state-owning Core descriptors,
including debug, DOM, navigation feedback, and node ID plugins.
Require node ID generators to return strings. Treat every raw element as an ID
candidate in schema-free `normalizeNodeId`; use `match` to filter raw types.

Publish every installed non-empty plugin API under its inferred plugin key on
`editor.api`, while retaining `editor.plugin(FooPlugin).api` as the exact
generic portal. Both paths reference the same immutable API object. Reject
plugin-key collisions with explicit editor API namespaces.
Expose `editor.plugin(Plugin).installed` for optional package integrations.

Contextually infer callbacks for contract-declared explicit transaction groups
and plugin extension command transactions.
Keep each input-rule factory's exact editor contract while normalizing
heterogeneous descriptor storage through an unknown-context rule reference.
Infer callback-created plugin state from its return type without erasing
constructor `read`, `update`, or other inferred capabilities.

Replace Slate-era Core exports with Plite and Plate-owned names.
Delete the dead `isType` wrapper; compare configured element types at the
owning call site.

Replace `pipeInsertDataQuery` with `prepareHtmlParserQuery`, which compiles one
resolved plugin query and runs it against an immutable editor state.

Remove exported whitespace character aliases in favor of native character
literals. Preserve the first matching descendant returned by
`someHtmlElement`.

Keep element-provider updates local to their own node while descriptor-scoped
ancestor reads subscribe to the exact owning provider.

Remove `editor.meta.pluginList`, `editor.meta.isFallback`,
`editor.getOptionsStore`, and public plugin `optionsStore` fields. Read
installed plugins through `editor.getPlugin(Plugin)` and editor-local state
through the descriptor-scoped portal's `store`.

Pass each render wrapper its owning plugin portal context and forward Plite DOM
strategy props through Plate content.

Preserve decoration rendering without coupling plugin identities to serialized
mark names.

Skip autofocus, input rule, and override work when lifecycle targets are unavailable.

Preserve initial selections when `transformInitialValue` wraps selected text
during editor setup. Run the same document-input transforms before schema
fitting for complete `editor.update.value.replace(...)` loads.

Install typed plugin-object dependencies recursively with deterministic
overrides, dependency-first ordering, and graph validation.
Remove global plugin `priority`. Independent plugins keep application order;
use `dependencies` for installation requirements and resource-local
`priority` for competing shortcuts, input rules, or codecs.

Declare document identity with top-level `type`, element behavior through
`schema.element`, marks through descriptor-backed `schema.mark`, ordinary node
components through root-level `component`, advanced rendering through `render`,
and trusted DOM projection through `render.nodeProps`.

Derive schema identity from compiled plugin semantics when editor creation
omits `schema`. Pass `{ id, version }` only for application-named History,
Yjs, or migration lineage. Editor factories derive identity when called
without a `schema` option.

Seed one mutable editor-local plugin store through `initialState`. Put every
independent author contribution in `createBasePlugin()` or
`createPlatePlugin()`: plugin-owned
`api`, `read`, `update`, and `selectors`, editor-wide `extension`, format
`codecs`, and ordinary static fields. Constructor callbacks receive the typed
authoring context. Use `.extend()` only for an imported/prebuilt declaration,
a shared factory the constructor cannot access, or an earlier-stage type
dependency.
Move specialized builder contributions into the constructor:

| Before | After |
| --- | --- |
| `.extendApi()` | `api` |
| `.extendEditorApi()` | `extension.api` |
| `.extendSelectors()` | `selectors` |
| `.extendTx()` | `update` |
| `.extendTxGroup()` | `extension.tx` |
| `.extendExtension()` | `extension` |
| `.extendCodecs()` | `codecs: ({ defineCodecs }) => defineCodecs(...)` |
| `.extendHtmlCodec()` | `codecs: ({ defineCodecs }) => defineCodecs({ 'text/html': ... })` |

When upgrading from v53, move `.extendTransforms()` contributions to `update`
and `.extendEditorTransforms()` contributions to `extension.tx`. Replace
ordinary `render.node` component registration with `.configure({ component: Component })`.
Include `component` in that same terminal `.configure()` when other consumer
overrides are needed. New Plate descriptors declare `component` directly.
Bind static components to base descriptors with
`BasePlugin.configure({ component: Component })` without importing the React
plugin layer. Convert base descriptors with `toPlatePlugin(BasePlugin)` only
when authoring a live React adapter. Extracted
reusable editor-wide factories use the callback context's
`defineEditorExtension(...)` helper so command, state, and transaction
parameters stay inferred.
Apply at most one terminal consumer `.configure(...)` call per descriptor:
object configuration can set descriptor fields, while contextual configuration
can derive initial state, handlers, foreign-plugin overrides, renderers, and
shortcuts. Contextual extensions read the configured values, and consumer
configuration remains the final override. Read and update live values through
`editor.plugin(Plugin).store.get()` and `.store.set(...)`; subscribe in React
through `usePluginStore` or its explicit-editor `useEditorPluginStore` variant.
Pass the real plugin descriptor to store hooks. A key-only object cannot carry
the state or selector contract and is rejected instead of requiring manual
generic arguments.
Named selectors are pure state-first functions. Remove `getOption`,
`getOptions`, `setOption`, `setOptions`, and the option-named React hooks.

```tsx
// Before
const Plugin = createPlatePlugin({
  key: 'counter',
  options: { count: 0 },
  selectors: ({ getOptions }) => ({
    doubled: () => getOptions().count * 2,
  }),
});

editor.plugin(Plugin).setOption('count', 1);
const count = usePluginOption(Plugin, 'count');

// After
const Plugin = createPlatePlugin({
  initialState: { count: 0 },
  key: 'counter',
  selectors: {
    doubled: (state) => state.count * 2,
  },
});

editor.plugin(Plugin).store.set({ count: 1 });
const count = usePluginStore(Plugin, 'count');
```

Declare cross-plugin schema and render targets with the plugin's top-level
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

**Migration:** Read installed plugin APIs from the inferred editor API in app
code. Use the scoped portal when generic package code only knows the plugin
descriptor:

```tsx
// Before
editor.getApi(FooPlugin).foo.method();

// After
editor.api.foo.method();

// Generic package code
editor.plugin(FooPlugin).api.method();
```

Prepare parser queries once, then run them against read-only editor state:

```tsx
const canInsert = prepareHtmlParserQuery(editor, MyPlugin);
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

Replace the overloaded `node` declaration with explicit model and render fields:

```tsx
createPlatePlugin({
  key: 'link',
  type: 'a',
  schema: { element: { inline: true } },
}).configure({ component: LinkElement });
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

Replace `inject.targetPlugins` with top-level `targetPluginKeys`:

```tsx
createPlatePlugin({
  key: 'align',
  targetPluginKeys: [KEYS.p],
  inject: { nodeProps: { styleKey: 'textAlign' } },
});
```

Replace `inject.targetPluginToInject` with a typed foreign codec contribution,
`codecs: ({ defineCodecs }) =>
defineCodecs(TargetPlugin, { 'text/html': ... })`, or use
`override.plugins[key]` for package-owned adaptation of an installed peer.

Classify plugin relationships explicitly:

- Use `dependencies` for required structure and capabilities.
- Include optional capabilities as ordinary entries in the consumer plugin
  array.
- Let an optional enhancement depend on its required base capability; do not
  make the base capability bundle the enhancement.

Configure or omit an optional capability through the ordinary plugin array:

```tsx
const plugins = [
  CodeBlockPlugin,
  CodeHighlightPlugin.configure({
    initialState: { lowlight },
  }),
];
```

Remove `configurePlugin`, `extendPlugin`, `rootPlugin`, and
`override.enabled`. Configure imported target descriptors directly. Package
plugins that cannot import a foreign target or control the editor kit may use
`override.plugins[key]` to adapt an already-installed peer; missing targets are
ignored, topology is immutable, required dependencies cannot be disabled, and
target configuration wins.

Replace `parsers.html.deserializer`, serializer declarations, and injected HTML
node-rule projections with schema-inferred `codecs['text/html']` contributions
in the constructor callback. Keep whole-input HTML hooks directly under
`parsers.html`:

```tsx
createPlatePlugin({
  key: 'docx',
  parsers: {
    html: { query, transformData, transformFragment },
  },
});

const BoldPlugin = createPlatePlugin({
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => true,
        encode: ({ value }) => (value ? { tag: 'strong' } : null),
        match: [{ tag: ['strong', 'b'] }],
      },
    }),
  key: 'bold',
  schema: { mark: property.boolean() },
});
```
