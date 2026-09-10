# Plugin documentation

Plugin and feature pages lead with the supported user-facing result and its
shortest working setup. State package/plugin and UI ownership accurately;
headless ownership does not require architecture-first page order. For a
headless feature, show its working code path without inventing a UI preview.

Required shape:

1. A focused `<ComponentPreview name="..." />` when the feature has a real
   registered demo; otherwise a short opening and working code path.
2. `<PackageInfo>` with features derived from source, not marketing bullets.
3. `## Kit Usage` when a kit exists:
   - wrap procedural setup in `<Steps>`
   - use `### Installation` and `### Add Kit`
   - include `<ComponentSource name="actual-kit-name" />`
   - list relevant kit components from the owning entries in `apps/www/src/registry/registry-features.ts`
     and `apps/www/src/registry/registry-editor.ts`
   - show `createEditor({ plugins: [...RelevantKit] })` from `platejs/react`
4. `## Examples` for distinct tasks and meaningful states, selected through
   [feature coverage](../SKILL.md#cover-the-features-actual-use). Put one useful
   example under each named subsection; omit this section when the primary
   example covers the feature. Link mixed-feature composition to its owner.
5. Integration sections for requirements the reader actually needs, such as
   persistence and recovery. Keep required setup in Kit Usage; put extended
   ownership explanations here or in a linked guide.
6. `## Manual Usage` when it provides a supported alternative; use it as the
   primary setup when no kit exists. Apply only the source checks relevant to
   the documented feature:
   - show the package install command
   - import plugin APIs from `platejs`, `platejs/react`, or the actual
     `platejs/<feature>` entrypoint
   - add the plugin to `createEditor`
   - declare an ordinary node `component` in
     `defineBasePlugin(name, { component })` or
     `definePlatePlugin(name, { component })`
   - replace an existing descriptor's component with one terminal
     `.configure({ component })`
   - keep Base `.extend()` free of `component`; independent defaults belong in
     the constructor
   - use `toPlatePlugin()` at the owning React adapter to publish a reusable
     Plate-layer descriptor or add genuine Plate-only authoring; a terminal
     consumer never inserts conversion merely to set `component`
   - never teach `.withComponent()`
   - never teach a second node-component channel
   - teach renderer attributes and mark placement under `render`, and
     structural composition under `slots`
   - teach codecs as
     `codecs: ({ defineCodecs }) => defineCodecs(map)` in the constructor
   - use `defineCodecs(map)` for self/product maps and
     `defineCodecs(TargetPlugin, map)` for foreign maps; the helper injects the
     target and keeps callback inference local
   - never teach direct `codecs: { ... }`, manual codec `target` fields, a
     global codec helper, casts, or callback annotations
   - document the MIME-keyed map's `'text/html'` value as one rule or a
     non-empty ordered rule tuple; multiple representations stay in that map
   - teach Plite-native fields directly on the Plate plugin root:
     `conflicts`, `readMiddleware`, commands, corrections, declarations,
     contributions, `on`, activation, and validation; never teach a nested
     `extension` wrapper
   - keep Plate-context capture inside the authoring callback and extract
     domain inputs; never teach a context identity helper, callback annotation,
     cast, or `any` to recover erased inference
   - use `defineExtension` imported from `plitejs` only for
     independently reusable standalone Plite descriptors composed as
     dependencies
   - put constructor-accessible fields and their context callbacks directly in
     `defineBasePlugin()` / `definePlatePlugin()`; use `.extend()` only for an
     imported/prebuilt plugin descriptor, a shared factory the constructor cannot
     access, or a real earlier-stage type dependency
   - teach `name` as descriptor identity and `type` as serialized node identity
   - never teach `PluginConfig`, `__config`, `clone()`, `pluginApi`, `getApi`,
     or a second Plite `config` channel
   - teach `DefinitionOf<typeof FooPlugin>` as the sole descriptor-definition
     extractor and name an alias `FooDefinition`; never teach `InferConfig`,
     `FooConfig`, or an unsuffixed alias for an extracted definition
   - teach `api` as a factory at Plite, Base, and Plate layers, even when it
     needs no context: `api: () => ({ ... })`, never `api: { ... }`
   - show one destructured API factory context object, never positional
     `(editor, context)` arguments, and never teach `.configure({ api })`
   - capture view work inside that API factory: its `editor` is the exact
     editor or mounted view exposing the API. Descriptor construction and
     shared plugin stores retain their model lifetime. Use mounted hooks for
     view commands; never imply a base editor chooses a mounted view
   - show one object factory call with no caller generics; do not claim the
     implementation uses one self-referential generic when contextual
     inference requires a private inferred environment plus author input
   - teach the root `EditorExtensionDependencyReference` only as a shallow,
     non-generic `name` plus optional `enabled` reference; never expose the
     internal normalized installed-capability carrier, higher-kinded encoding,
     or recursive exact dependency ancestry
   - teach `EditorExtensionTypeProvider` as the sole public value-sensitive
     capability bridge; never teach its internal carrier or expansion machinery
   - teach typed portals as a static literal-name plus capability-equivalence
     proof and a runtime exact-descriptor-identity proof; never imply that a
     same-name object is an interchangeable runtime token
   - never teach Plate foundation's author-source-to-canonical-lowered normalization
     aliases; plugin authors supply one object and receive one descriptor
   - show low-level React composition as `react({ dom })` with the exact DOM
     descriptor; never teach `react()`, flattened DOM options, caller
     generics, or implementation casts
   - put lifecycle and host/DOM events in one root `on` family with prefixless
     child names: `keyDown`, `paste`, `nodeChange`, `textChange`, and capture
     variants; never teach a `handlers` bucket
   - register a complete before/after Editable or container component directly;
     show a callback only for real custom composition, and pass only the exact
     `editableRef` or `containerRef` supplied by that slot
   - teach clipboard ingress only as a direct `clipboardHandler(...)` entry in
     `contributions`, never as a root `clipboard` field; teach only
     `clipboardHandler(handler)`, with the handler transaction contextually
     inferred from the owning extension or Plate stage, and never pass an
     editor to the helper
   - teach Plite owner-local capabilities as `read` and `update`, pure
     core-read policy as `readMiddleware`, and config-free `validate`
7. Style plugins without distinct components should document their schema
   placement truth. Cross-cut block styles configure
   root `targetPlugins`; render/parser injection is derived and must not
   be taught as a second target configuration. Text styles declare marks and
   do not invent block target lists. Document `inject.nodeProps` only for real
   rendering defaults and mappings.
8. Toolbar sections only when the toolbar affordance exists. Check kit
   dependencies before writing about `*ToolbarButton`, Turn Into, or Insert
   controls.
9. `## Plugins` for actual plugin objects.
10. `## API Reference` for shipped standalone functions or plugin APIs, and
   `## Transforms` only for real `editor.update.<group>.*` surfaces. Give
   standalone operations their exact import paths and arguments; do not invent
   an installed plugin for file conversion. Teach
   `editor.plugin(Plugin).api.*` only when the example is intentionally generic
   package code or needs exact descriptor ownership; teach
   `editor.extension(Extension).api.*` for exact raw Plite ownership. These
   paths expose one descriptor-owned API, never root-merged methods. When that descriptor is
   optional, show `const plugin = editor.plugin(Plugin)` and guard portal access
   with `plugin.installed`; disabled plugins count as absent. Never teach root
   API probing, node/schema/cache inference, or caught portal errors as plugin
   availability checks. Never invent or document `editor.tf`,
   `editor.transforms`, or a competing root mutation namespace.

Preserve existing `<APIOptions>`, `<APIParameters>`, and `<APIReturns>`
formatting when editing a working page. Use
`content/docs/(plugins)/(functionality)/dnd.mdx` as the plugin-page baseline
when no closer sibling fits.
