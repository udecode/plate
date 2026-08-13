---
"@platejs/core": major
---

Export named `*PluginState` contracts for state-owning Core descriptors,
including debug, DOM, navigation feedback, and persisted element IDs.
Replace the default `NodeIdPlugin` with opt-in `ElementIdPlugin`. It assigns
string IDs to block and inline elements through one `generateId` state option,
indexes them across every document root, and never assigns IDs to text nodes.
Use `migrateElementIds` before editor creation to fill missing IDs, report
duplicates, and canonicalize a legacy property through `sourceKey`. Use editor-scoped
`NodeKey` for live node targeting, selection, drag and drop, and temporary UI
state; node keys cover text nodes and never enter serialized data.

Infer plugin-local node-property patches from the current plugin plus its
required dependencies through a shallow capability graph. Use
`nodes.set(props, options)` for typed atomic writes, the exact property handle
key for aliases, `unset(key, options)` for removals, and semantic owner updates
for prefix or cross-node behavior.

Rename Plate plugin identity from `key` to `name` across descriptor
definitions, inferred contracts, installed descriptors, lookup parameters,
transaction groups, targets, and overrides. Declare
`definePlatePlugin('foo', definition)`, read `plugin.name`, and pass the plugin
descriptor or a dynamic name string to descriptor-aware lookups.
Use `name` solely for capability identity. Element plugins expose persisted
identity through `schema.type`; primary-mark plugins expose persisted identity
through `schema.key`. Behavior and aggregate-property plugins expose no
consumer `schema`. Additional property handles stay in author callbacks and
compiler APIs. Remove public reverse identity lookup and name/type translation.
Publish every installed non-empty plugin API under its inferred plugin name on
`editor.api`, while retaining `editor.plugin(FooPlugin).api` as the exact
generic portal. Both paths reference the same immutable API object. Reject
plugin-name collisions with explicit editor API namespaces.
Expose `editor.plugin(Plugin).installed` for optional package integrations.
Call the scoped update portal with a transaction policy when an operation needs
tagged history or another root update policy:
`editor.plugin(Plugin).update(policy).method()`. The scoped call opens one root
transaction and preserves its rollback and history behavior.
Compose plugin commands inside an active transaction through
`tx.plugin(Plugin).method()`. Generated editors retain direct
`tx.pluginName.method()` groups. Raw Plite keeps direct extension groups and
does not expose a descriptor transaction portal.

Give default-constructible, schema-compatible text-block descriptors a standard
`toggle` update. Text blocks with required construction properties author their
own domain-aware command when needed.
Configure same-name keyboard shortcuts with keys only; Plate dispatches the
plugin update automatically. Structural plugins keep authored toggle commands
for wrapping, conversion, or child mutations. Rename the paragraph shortcut
from `toggleParagraph` to `toggle`.

Contextually infer callbacks for contract-declared explicit transaction groups
and plugin extension command transactions.
Keep each input-rule factory's exact editor and rule-family contracts, infer
only explicitly declared consumer options, and publish portable declarations
while normalizing heterogeneous descriptor storage through an unknown-context
rule reference.
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
const AnalyticsPlugin = definePlatePlugin('analytics', {
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
and `editor.plugin(plugin)` for an erased dynamic or family-agnostic
runtime-name portal. Reject weak `{ name }` lookup objects. A missing runtime
name reports `installed: false`; name-only portals keep non-optional
`schema.type` and `schema.key` getters for package-decoupled code, while missing
or wrong-kind access throws. Exact portals publish only their primary element
or mark identity. React
`useEditorPlugin` accepts the same
descriptor-or-name inputs. Read compiled injection data from
`editor.plugin(Plugin).inject.nodeProps`. The consumer portal exposes every
resolved descriptor field directly beside scoped `api`, `read`, `update`,
`store`, and `installed`; it has no nested `plugin` alias. Authoring callback
contexts retain `plugin` for the current raw descriptor.

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

Declare document identity and element behavior through `schema.element`, marks
through descriptor-backed `schema.mark`, ordinary node
components through root-level `component`, advanced rendering through `render`,
and trusted DOM projection through `render.nodeProps`.

Derive schema identity from compiled plugin semantics when editor creation
omits `schema`. Pass `{ id, version }` only for application-named History,
Yjs, or migration lineage. Editor factories derive identity when called
without a `schema` option.

Seed one mutable editor-local plugin store through `initialState`. Put every
independent author contribution in `defineBasePlugin()` or
`definePlatePlugin()`: plugin-owned
`api`, `read`, `update`, `selectors`, native Plite capabilities, format
`codecs`, and ordinary static fields. Constructor callbacks receive the typed
authoring context. Use `.extend()` only for an imported/prebuilt declaration,
a shared factory the constructor cannot access, or an earlier-stage type
dependency.

When `initialState` is an object, declare store-dependent fields in the same
constructor. When `initialState` is a factory, stage fields that consume its
inferred store type in a following `.extend()`:

```tsx
const FeaturePlugin = definePlatePlugin('feature', {
  initialState: ({ editor }) => ({ enabled: editor.read.isEmpty() }),
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
`defineExtension(...)`; Plate-owned capabilities stay on the plugin root.
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
const Plugin = definePlatePlugin('counter', {
  options: { count: 0 },
  selectors: ({ getOptions }) => ({
    doubled: () => getOptions().count * 2,
  }),
});

editor.plugin(Plugin).setOption('count', 1);
const count = usePluginOption(Plugin, 'count');

// After
const Plugin = definePlatePlugin('counter', {
  initialState: { count: 0 },
  selectors: {
    doubled: (state) => state.count * 2,
  },
});

editor.plugin(Plugin).store.set({ count: 1 });
const count = usePluginStore(Plugin, 'count');
```

Declare cross-plugin schema and render targets with the plugin's top-level
`targetPlugins` field.

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
elements and paths through descriptor-aware `useElement(FooPlugin)`,
`useOptionalElement(FooPlugin)`, `usePath`, and `useOptionalPath` hooks. Infer
component elements with `PlateElementProps<typeof FooPlugin>` and static/RSC
elements with `PliteElementProps<typeof BaseFooPlugin>`. Infer live and static
text and leaf component props from the same plugin descriptors with
`PlateTextProps`, `PlateLeafProps`, `PliteTextProps`, and `PliteLeafProps`.
Pass exactly one required plugin descriptor to these component prop aliases.
Leaf props include optional transient fields inferred from the owning plugin's
`decorate` callback; text props remain persisted-schema-only.
Pass plugin descriptors directly to wrapper and element-selector contracts:
`RenderNodeWrapper<typeof FooPlugin>`,
`RenderStaticNodeWrapper<typeof BaseFooPlugin>`, and
`useElementSelector(FooPlugin, selector)` infer their element and plugin
context without a manual `DefinitionOf` extraction.
Use `RenderElementProps`, `RenderTextProps`, and `RenderLeafProps` for
schema-agnostic renderer infrastructure.
Remove the parallel `StyledPlate*Props` and `StyledPlite*Props` aliases; pass
polymorphic HTML props directly to the matching node primitive.
Remove unchecked type-only `useElement<FooElement>()` and
`useOptionalElement<FooElement>()` calls.
Context editor hooks reject caller-only generics. A closed generated application
uses `useEditor(EditorKit)` or `useActiveEditor(EditorKit)` to infer and
runtime-verify its exact contract. Otherwise resolve exact plugin capabilities
through `editor.plugin(FooPlugin)` or `useEditorPlugin(FooPlugin)`, and let
selector hooks infer only their selected result.

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

// Compiled descriptor
const foo = editor.plugin(FooPlugin);
foo.name;
foo.schema.type; // element plugin
foo.inject.nodeProps;
foo.render;

const bold = editor.plugin(BoldPlugin);
bold.schema.key;
bold.read.isActive();
bold.update.toggle();

// Dynamic runtime name
const dynamicPlugin = editor.plugin(plugin);

if (dynamicPlugin.installed) {
  dynamicPlugin.name;
  dynamicPlugin.schema.type; // throws when the installed plugin is not an element
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
definePlatePlugin('link', {
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

Replace context-hook editor assertions with descriptor portals:

```tsx
// Before
const editor = useEditor<PlateEditor<readonly [typeof FooPlugin]>>();

// After
const editor = useEditor();
const foo = editor.plugin(FooPlugin);
```

Rename static HTML rendering:

```tsx
// Before
import { serializeHtml } from 'platejs/static';

// After
import { renderStaticHtml } from 'platejs/static';
```

Replace `inject.targetPlugins` with top-level `targetPlugins`:

```tsx
definePlatePlugin('align', {
  targetPlugins: [PLUGINS.paragraph],
  inject: { nodeProps: { styleKey: 'textAlign' } },
});
```

Replace `inject.targetPluginToInject` with a typed foreign codec contribution,
`codecs: ({ defineCodecs }) =>
defineCodecs(TargetPlugin, { 'text/html': ... })`, or use
`override.plugins[name]` for package-owned adaptation of an installed peer.

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
`override.plugins[name]` to adapt an already-installed peer; missing targets are
ignored, topology is immutable, required dependencies cannot be disabled, and
target configuration wins.

Replace `parsers.html.deserializer`, serializer declarations, and injected HTML
node-rule projections with schema-inferred `codecs['text/html']` contributions
in the constructor callback. Keep whole-input HTML hooks on the same codec:

```tsx
definePlatePlugin('docx', {
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': { query, transformData, transformFragment },
    }),
});

const BoldPlugin = definePlatePlugin('bold', {
  schema: { mark: property.boolean() },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => true,
        encode: ({ value }) => (value ? { tag: 'strong' } : null),
        match: [{ tag: ['strong', 'b'] }],
      },
    }),
});
```

Use the flat `PLUGINS` catalog for built-in capability names. Resolve persisted
element types and property keys through schema-owning plugin context or the
installed plugin's flat `schema.type` / `schema.key`; use explicit persisted
literals only for copied registry data and document fixtures. Use typed node
fields or semantic plugin methods for additional properties.
