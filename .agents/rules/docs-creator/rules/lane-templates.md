# Lane Templates

## Lane Templates

### Install / Get Started

Entry docs like `content/docs/index.mdx`, `content/docs/installation.mdx`.

Required shape:

1. Short opening: what Plate is or what the guide does.
2. If there are multiple starts, add a compact branch selector that links to
   exact sections.
3. Recommended path first.
4. Alternative paths after.
5. Next steps / where to go next.

Voice moves:

- Choose for the reader when there's an obvious best path.
- "Let's start with the fastest setup" beats "Several setup options are available".
- Keep branching shallow.
- Link the exact next leaf, not a vague hub.
- Use `<Steps>` with `###` step headings for actual procedures.
- Show a working command, then the smallest real file edit that proves the
  install worked.

### Component / Registry Item

Pages like Plate UI component docs or registry-item docs should follow the
shadcn component shape unless Plate source proves a different ownership model.

Required shape:

1. Frontmatter title and description.
2. Real `<ComponentPreview name="..." />` immediately after the frontmatter when
   the demo exists.
3. `## Installation` with `<CodeTabs>`:
   - `Command` tab for the CLI command
   - `Manual` tab with `<Steps>` only when manual install is realistic
   - `<ComponentSource>` for the source file being copied
4. `## Usage` with imports first, then the smallest working JSX.
5. `## Examples` with one visible variant per `###` section.
6. Optional `## RTL`, `## Composition`, or other behavior sections when the
   source/demo actually supports them.
7. `## API Reference` last with compact prop/option tables.

Voice moves:

- Preview before explanation when the component is visual.
- One sentence before each variant preview is enough.
- Use exact registry names and file paths.
- Do not add `<PackageInfo>` to UI component pages unless the package itself is
  the thing being taught.
- Do not fake a manual path. If the CLI is the only supported path, say that.

### Guide / System

Pages like `plugin-rules.mdx`, `plugin-input-rules.mdx`.

Required shape:

1. Opening (3 sentences max, per Structural Rules).
2. Immediate inline disambiguation if a sibling concept exists.
3. Ownership model.
4. Quick start.
5. Deeper mechanics.
6. API reference last.

Voice moves:

- Open with what the system is and what it is not.
- Ownership table early, not buried in prose.
- Happy path before the full primitive catalog.
- If something is explicit, say "explicit" — never imply hidden defaults.
- End each mechanics section with a one-line landing.
- If the guide explains a pipeline, use predictable section names for each
  stage. Example: `Runtime Pipeline`, `Break Behavior`, `Delete Behavior`,
  `Merge Behavior`, `Normalize Behavior`, `Selection Behavior`, `Recipes`,
  `API Reference`.
- Keep the concept guide above the details but below the reference. It should
  make reference pages easier to use, not replace them.

### Behavior / Runtime Concept

Pages like `editing-behavior.mdx`.

Use this lane when behavior crosses multiple source files, plugins, or docs
lanes. The reader needs the lifecycle, not a dump of every option.

Required shape:

1. Opening with sibling disambiguation. Example: "Use Plugin Rules for
   declarative node policy; use Editor Methods for imperative transforms."
2. `## Choose the Right Surface` or equivalent decision table.
3. `## Runtime Pipeline` with owner map.
4. One section per pipeline stage.
5. `## Recipes` for common outcomes.
6. `## API Reference` linking to the canonical references.

Source audit:

- Read the public reference docs.
- Read the core dispatcher or override layer.
- Read the transform implementation that actually mutates the document.
- Read feature-package defaults for examples.
- Read UI/registry code only when the behavior is UI-owned.

Voice moves:

- Say which stage owns the behavior.
- Keep primitive APIs in reference links, not repeated in prose.
- Use tables for decision paths and stage behavior.
- If two terms sound similar, split them early. Example: document-level merge
  rules are not table cell merge commands.
- End with what the reader can now decide or configure.

### Plugin / Feature

Plugin and feature pages are headless first. The package/plugin owns the
feature; Plate UI components are render examples unless the source proves they
own behavior.

Required shape:

1. Short opening or a real `<ComponentPreview name="..." />` if the demo exists.
2. `<PackageInfo>` with features derived from source, not marketing bullets.
3. `## Kit Usage` when a kit exists:
   - wrap procedural setup in `<Steps>`
   - use `### Installation` and `### Add Kit`
   - include `<ComponentSource name="actual-kit-name" />`
   - list relevant kit components from `apps/www/src/registry/registry-kits.ts`
   - show `createEditor({ plugins: [...RelevantKit] })` from `platejs/react`
4. `## Manual Usage`:
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
   - never teach `render.node` as a public plugin-authoring surface
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
   - teach clipboard ingress only as a direct `clipboardHandler(...)` entry in
     `contributions`, never as a root `clipboard` field; teach only
     `clipboardHandler(handler)`, with the handler transaction contextually
     inferred from the owning extension or Plate stage, and never pass an
     editor to the helper
   - teach Plite owner-local capabilities as `read` and `update`, pure
     core-read policy as `readMiddleware`, and config-free `validate`
5. Style plugins without distinct components should document their schema
   placement truth. Cross-cut block styles configure
   root `targetPlugins`; render/parser injection is derived and must not
   be taught as a second target configuration. Text styles declare marks and
   do not invent block target lists. Document `inject.nodeProps` only for real
   rendering defaults and mappings.
6. Toolbar sections only when the toolbar affordance exists. Check kit
   dependencies before writing about `*ToolbarButton`, Turn Into, or Insert
   controls.
7. `## Plugins` for actual plugin objects.
8. `## API Reference` and `## Transforms` only for real
   `editor.api.<name>.*` and `editor.update.<group>.*` surfaces. Teach
   `editor.plugin(Plugin).api.*` only when the example is intentionally generic
   package code or needs exact descriptor ownership; teach
   `editor.extension(Extension).api.*` for exact raw Plite ownership. These
   paths expose one descriptor-owned API, never root-merged methods. When that descriptor is
   optional, show `const plugin = editor.plugin(Plugin)` and guard portal access
   with `plugin.installed`; disabled plugins count as absent. Never teach root
   API probing, node/schema/cache inference, or caught portal errors as plugin
   availability checks. Never invent or document `editor.tf`,
   `editor.transforms`, or a competing root mutation namespace.

Voice moves:

- Kit path is the quick path. Say so.
- Keep the headless package contract explicit even when the fast path uses UI.
- Components are render examples, not the feature itself.
- Never document plugin APIs or transforms the source does not actually ship.
- Preserve existing `<APIOptions>`, `<APIParameters>`, and `<APIReturns>`
  formatting when editing a working page.
- Use `content/(plugins)/(functionality)/dnd.mdx` as the primary plugin-page
  structure baseline when the target page has no better sibling.

### Serialization / Conversion

Pages like `html.mdx`, `markdown.mdx`.

Required shape:

1. Explain the two directions up front (A→B and B→A).
2. Split the page by direction.
3. State environment constraints (server vs client, static vs React) before the first example.
4. Show extension points only after the base path is clear.
5. Put the heavy API reference late.

Voice moves:

- "A to B" and "B to A" never share a section.
- Call out server/client/static/React-only boundaries early — in a Callout if required.
- Use correct imports for each environment.
- If round-trip behavior has limits, say so where the user will hit them.

### Workflow / AI

Pages like `ai.mdx`.

Required shape:

1. What the feature enables (one paragraph).
2. Fastest setup path.
3. Runtime architecture or flow.
4. Client vs server split.
5. Optional UI surfaces.
6. Utilities and API reference.

Voice moves:

- Separate required runtime pieces from optional UI sugar. Explicitly.
- Multi-surface flows stay explicit: editor, route, provider, streaming, transforms.
- If the page is passing ~300 lines, add an on-page jump list near the top.
- Don't dump every helper until the main workflow is already clear.

### API Reference

When the page is mostly contract, not onboarding.

Required shape:

1. Short purpose paragraph.
2. Surface grouping.
3. Exact parameters, options, returns.
4. Caveats and constraints.

Voice moves:

- No tutorial cosplay. Shadcn-terse.
- Still one sentence on when to use the API.
- Use `<API>` blocks or a consistent table format.
- Examples minimal and exact.

### Spec / Law / Behavior

Behavior-spec, law, protocol docs.

Required shape:

1. Goal or contract.
2. Explicit owner map.
3. Model before UX chrome.
4. Evidence or source backing.
5. Clear gap markers where evidence is missing.
6. Reference appendix only after the contract is clear.

Voice moves:

- Lock the node model and affinity before writing hover, toolbar, or interaction chrome.
- Treat silence in references as a gap, not an agreement.
- Prefer binary wording over vibes.
- If the docs claim behavior the runtime does not implement, the docs are wrong until the code changes.

This lane is stricter than a normal concept guide. Use it when the doc becomes
the contract for future implementation or review. Use Behavior / Runtime
Concept when the runtime already exists and the reader needs to understand it.

## Writing Voice Examples

**Opening — bad:**

> This guide provides a comprehensive overview of input rules. Input rules are a powerful feature of Plate that enable users to define custom syntax transformations.

**Opening — good:**

> Plugin Input Rules are Plate's runtime for typed editor conversions. As you type, paste, or press Enter, the first matching rule transforms the editor on the spot — `# ` becomes a heading, `**bold**` turns on bold, a pasted URL becomes a link.

---

**Config example — bad:**

> Here is an example of configuring the plugin:
>
> ```tsx
> Plugin.configure({
>   /* options */
> });
> ```

**Config example — good:**

> Reach for `.configure()` when you need more than the default behavior. Let's add a keyboard shortcut:
>
> ```tsx
> Plugin.configure({ shortcuts: { toggle: "mod+alt+s" } });
> ```

---

**Changelog drift — bad:**

> The API has been updated. Previously, options were passed as strings; now they support objects.

**Changelog drift — good:**

> Options are passed as objects. Example: `{ variant: 'paste' }`.

---

**Completion — bad:**

> This concludes the overview. You have now been presented with the available options for configuring input rules.

**Completion — good:**

> Done. You now have a working markdown shortcut — type `# ` and watch the heading land.
