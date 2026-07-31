---
"@platejs/core": major
---

Export named `*PluginState` contracts for state-owning Core descriptors,
including debug, DOM, navigation feedback, and node ID plugins.
Require node ID generators to return strings. Treat every raw element as an ID
candidate in schema-free `normalizeNodeId`; use `match` to filter raw types.

Rename Plate plugin identity from `key` to `name` across descriptor
definitions, inferred contracts, installed descriptors, lookup parameters,
transaction groups, targets, and overrides. Declare
`createPlatePlugin({ name: 'foo' })`, read `plugin.name`, and pass
`pluginName` to name-based lookups.
Publish every installed non-empty plugin API under its inferred plugin name on
`editor.api`, while retaining `editor.plugin(FooPlugin).api` as the exact
generic portal. Both paths reference the same immutable API object. Reject
plugin-name collisions with explicit editor API namespaces.
Expose `editor.plugin(Plugin).installed` for optional package integrations.

Contextually infer callbacks for contract-declared explicit transaction groups
and plugin extension command transactions.
Keep each input-rule factory's exact editor contract while normalizing
heterogeneous descriptor storage through an unknown-context rule reference.
Infer callback-created plugin state from its return type without erasing
constructor `read`, `update`, or other inferred capabilities.

Infer one exact definition for each Base and React plugin. Remove
the `PluginConfig` family, including `AnyPluginConfig`, `SlatePluginConfig`,
and `PlatePluginConfig`.
Use `DefinitionOf<typeof Plugin>` as the sole public descriptor-definition
extractor; remove the `InferConfig` alias.
Name exported descriptor contracts `FooDefinition`; reserve `FooConfig` for
real domain configuration. Keep fields omitted from an author definition
absent from its inferred descriptor type.
Keep Core's contextually typed author-source to canonical-lowered aliases
internal. Public authoring is one object call that returns one exact
descriptor without a caller-supplied generic list.
Declare `api` through a factory at every Plite, Base, and React layer, including
context-free APIs. Pass one context object rather than positional `editor` and
`context` arguments; Base and React add their plugin fields to that same object.
Declare Plite capabilities directly on the plugin root, and use one prefixless
`on` family for lifecycle and every DOM event. Remove the separate `handlers`
surface and names such as `onKeyDown`; use `keyDown`, `paste`, `nodeChange`,
and the matching prefixless event names:

```tsx
const AnalyticsPlugin = createPlatePlugin({
  name: 'analytics',
  on: {
    commit: ({ commit }) => reportCommit(commit),
    keyDown: ({ event }) => reportKey(event.key),
  },
  validate: ({ schema }) => validateAnalyticsSchema(schema),
});
```

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
installed plugins and editor-local state through `editor.plugin(Plugin)`.
Keep callback-only `editor` and `defineCodecs` off the consumer portal.

Remove parallel plugin lookup APIs: `getBasePlugin`, `getEditorPlugin`, React
`getPlugin`, `editor.getPlugin`, `getPluginType(s)`, `getPluginName(s)`,
`getPluginByType`, `getContainerTypes`, `editor.getType`, and
`editor.getInjectProps`. Use `editor.plugin(Plugin)` for an exact typed portal
and `editor.plugin(pluginName)` for an erased dynamic or family-agnostic
runtime-name portal. Reject weak `{ name }` lookup objects. A missing runtime
name reports `installed: false`; other portal fields throw instead of falling
back to the supplied name. React `useEditorPlugin` accepts the same
descriptor-or-name inputs. Read compiled injection data from
`editor.plugin(Plugin).plugin.inject.nodeProps`.

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
`api`, `read`, `update`, `selectors`, native Plite capabilities, format
`codecs`, and ordinary static fields. Constructor callbacks receive the typed
authoring context. Use `.extend()` only for an imported/prebuilt declaration,
a shared factory the constructor cannot access, or an earlier-stage type
dependency.

When `initialState` is an object, declare store-dependent fields in the same
constructor. When `initialState` is a factory, stage fields that consume its
inferred store type in a following `.extend()`:

```tsx
const FeaturePlugin = createPlatePlugin({
  initialState: ({ editor }) => ({ enabled: editor.read.isEmpty() }),
  name: 'feature',
}).extend({
  api: ({ store }) => ({
    isEnabled: () => store.get('enabled'),
  }),
});
```

Move specialized builder contributions into the constructor:

| Before | After |
| --- | --- |
| `.extendApi()` | `api` |
| `.extendEditorApi()` | `api` |
| `.extendSelectors()` | `selectors` |
| `.extendTx()` | `update` |
| `.extendTxGroup()` | `update` |
| `.extendExtension()` | the matching root Plite field |
| `.extendCodecs()` | `codecs: ({ defineCodecs }) => defineCodecs(...)` |
| `.extendHtmlCodec()` | `codecs: ({ defineCodecs }) => defineCodecs({ 'text/html': ... })` |

When upgrading from v53, move `.extendTransforms()` and
`.extendEditorTransforms()` contributions to `update`. Replace
ordinary `render.node` component registration with `.configure({ component: Component })`.
Include `component` in that same terminal `.configure()` when other consumer
overrides are needed. New Plate descriptors declare `component` directly.
Base and Plate descriptors declare root-level `component` directly for
static/RSC and live rendering. Base `.extend()` rejects `component`; terminal
`.configure({ component: Component })` replaces it. Use `toPlatePlugin()` at
the owning React adapter to publish a reusable Plate-layer descriptor or add
genuine Plate-only authoring. A terminal consumer does not convert merely to
set `component`.
Independently reusable raw Plite descriptors use
`defineEditorExtension(...)`; Plate-owned capabilities stay on the plugin root.
Apply at most one terminal consumer `.configure(...)` call per descriptor:
object configuration can set descriptor fields, while contextual configuration
can derive initial state, `on` events, foreign-plugin overrides, renderers, and
shortcuts. Earlier authoring stages read the configured values, and consumer
configuration remains the final override. Read and update live values through
`editor.plugin(Plugin).store.get()` and `.store.set(...)`; subscribe in React
through `usePluginStore` or its explicit-editor `useEditorPluginStore` variant.
Pass the real plugin descriptor to store hooks. A name-only object cannot carry
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
  name: 'counter',
  selectors: {
    doubled: (state) => state.count * 2,
  },
});

editor.plugin(Plugin).store.set({ count: 1 });
const count = usePluginStore(Plugin, 'count');
```

Declare cross-plugin schema and render targets with the plugin's top-level
`targetPluginNames` field.

Register semantic command policy through root
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

// Compiled descriptor and type
const foo = editor.plugin(FooPlugin);
foo.plugin;
foo.type;

// Dynamic runtime name
const dynamicPlugin = editor.plugin(pluginName);

if (dynamicPlugin.installed) {
  dynamicPlugin.type;
}
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
- `SlateRenderElementProps` to `PliteRenderElementProps`
- `SlateRenderLeafProps` to `PliteRenderLeafProps`
- `SlateRenderTextProps` to `PliteRenderTextProps`

Replace dependency names such as `dependencies: ['feature']` with the plugin
object, for example `dependencies: [BaseFeaturePlugin]`.

Replace the overloaded `node` declaration with explicit model and render fields:

```tsx
createPlatePlugin({
  name: 'link',
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

Replace `inject.targetPlugins` with top-level `targetPluginNames`:

```tsx
createPlatePlugin({
  name: 'align',
  targetPluginNames: [KEYS.p],
  inject: { nodeProps: { styleKey: 'textAlign' } },
});
```

Replace `inject.targetPluginToInject` with a typed foreign codec contribution,
`codecs: ({ defineCodecs }) =>
defineCodecs(TargetPlugin, { 'text/html': ... })`, or use
`override.plugins[pluginName]` for package-owned adaptation of an installed peer.

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

Repeat terminal configurations derived from the same authored plugin when a
later consumer layer needs to configure an installed preset. Plate composes
them in array order, preserves earlier non-overlapping fields, and lets later
defined values win. Unrelated plugins and divergent authoring branches cannot
share a name.

Remove `configurePlugin`, `extendPlugin`, `rootPlugin`, and
`override.enabled`. Configure imported target descriptors directly. Package
plugins that cannot import a foreign target or control the editor kit may use
`override.plugins[pluginName]` to adapt an already-installed peer; missing targets are
ignored, topology is immutable, required dependencies cannot be disabled, and
target configuration wins.

Replace `parsers.html.deserializer`, serializer declarations, and injected HTML
node-rule projections with schema-inferred `codecs['text/html']` contributions
in the constructor callback. Keep whole-input HTML hooks directly under
`parsers.html`:

```tsx
createPlatePlugin({
  name: 'docx',
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
  name: 'bold',
  schema: { mark: property.boolean() },
});
```
