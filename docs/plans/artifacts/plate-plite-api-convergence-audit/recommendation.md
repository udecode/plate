# Plate / Plite API convergence recommendation

## Verdict

Plite wins the shared grammar. Plate keeps only jobs that Plite does not have.

The stack needs a verb law, not identical nouns:

| Verb / form | Sole job |
|---|---|
| `define*` | Declare an immutable descriptor, token, schema, command, codec, plugin, or extension. |
| `create*` | Allocate a live/stateful editor, runtime, view, controller, or other resource. |
| `to*` | Cross one layer boundary without pretending to allocate a new model. |
| `.extend()` | Widen one Plate plugin definition during authoring. |
| `.configure()` | Apply one terminal, non-widening app override to a Plate plugin. |
| `editor.install()` | Attach an extension to a live editor and return its uninstall callback. |
| `editor.update.extensions.reconfigure()` | Atomically replace one declared extension slot inside an update. |
| `capability(options)` | Produce an install-ready configured extension for a known capability, for example `history()` or `yjs()`. |

Anything else is vocabulary debt.

## Exact public target

```diff
- const Counter = defineEditorExtension({
+ const Counter = defineExtension({
    name: 'counter',
    read: ({ state }) => ({ value: () => state.field(counterField) }),
  });

- const BaseLinkPlugin = createBasePlugin({
+ const BaseLinkPlugin = defineBasePlugin({
    name: 'link',
    schema: { element: { inline: true } },
  });

- const LinkPlugin = createPlatePlugin({
+ const LinkPlugin = definePlatePlugin({
    name: 'link',
    component: LinkElement,
  });
```

No deprecated aliases. Rename the files and exports too; leaving
`createBasePlugin.ts` behind would teach the rejected grammar to agents.

Stateful constructors keep `create`:

```ts
createEditor({ extensions: [history()] });
createBaseEditor({ plugins: [BaseLinkPlugin] });
createPlateEditor({ plugins: [LinkPlugin] });
createEditorRuntime(options);
createEditorView(runtime, options);
```

Plite keeps `extensions`; Plate keeps `plugins`. Those nouns describe honest
different layers. Renaming both to one word would be fake consistency.

## Configured extension factories

Known-capability factories use the capability name. This is the cleanest form
inside an `extensions` array and avoids both `createXExtension` and
`defineXExtension` boilerplate:

```diff
  createEditor({
    extensions: [
      history(),
      dom(),
      react({ dom: DOMExtension }),
      hostCodecs('app', codecs),
-     createYjsExtension({ doc }),
-     createTriggerComboboxExtension(options),
-     createExcludeDiffFragmentExtension(),
+     yjs({ doc }),
+     triggerCombobox(options),
+     excludeDiffFragment(),
    ],
  });
```

`defineHostCodec(...)` remains correct: it declares one codec value.
`hostCodecs(...)` remains correct: it produces the configured extension that
installs those declarations.

## Authoring stays one object

All native Plite fields remain flat at the Plate plugin root:

```ts
defineBasePlugin({
  name: 'comments',
  dependencies: [BaseSuggestionPlugin],
  schema: commentSchema,
  api: ({ editor }) => ({ ... }),
  read: ({ state }) => ({ ... }),
  update: ({ tx }) => ({ ... }),
  readMiddleware: ({ around }) => [...],
  commands: ({ handle }) => [...],
  corrections: [...],
  stateFields: [...],
  effectTypes: [...],
  facetProviders: [...],
  selectionKinds: [...],
  contributions: [...],
  on: { commit: () => {}, keyDown: () => {} },
  activate: (editor, lifecycle) => {},
  validate: (context) => {},
});
```

Do not restore nested `extension`, `handlers`, `state`, or `tx` authoring
buckets. Plite already has the better pattern here.

## Honest Plate-only fields

Keep these on Plate plugins; forcing them into Plite would pollute the
substrate:

- state: `initialState`, `selectors`, scoped `store`;
- rendering/host: `component`, `render`, `decorate`, `useHooks`, `editOnly`;
- product behavior: `inject`, `inputRules`, `rules`, `shortcuts`,
  `transformInitialValue`;
- schema-aware format declarations: `codecs`;
- serialized node identity: `type`, defaulting to `name`;
- exact target-name ownership: `targetPluginNames`.

`initialValue` is editor document input. `initialState` is plugin-local store
input. The words are close, but the jobs are not. Renaming either creates more
confusion than it removes.

## One Plate-only cut

### Cut `parsers.html`

It is a second HTML extension system beside `codecs` and Plite host codecs.
Move its `query`, `transformData`, and `transformFragment` hooks into the
schema-aware `text/html` codec contract, then delete `parsers`.

```diff
  defineBasePlugin({
    name: 'docx',
-   parsers: {
-     html: { transformData, transformFragment },
-   },
+   codecs: ({ defineCodecs }) =>
+     defineCodecs({
+       'text/html': { transformData, transformFragment },
+     }),
  });
```

## Keep bounded `override.plugins`

The objection pass found a real job that direct `.configure()` cannot replace:
an independently installed feature can weakly adapt an optional foreign plugin
without owning the app kit. `SingleLinePlugin` disables an optional trailing
block, and `BaseListPlugin` forwards its configured targets into an optional
Indent plugin. Forcing those decisions into every app is worse AX.

Keep `override.plugins`, but keep its existing hard boundary: it is name-keyed,
optional, and cannot change identity, dependencies, schema, author state, or
nested overrides. When the app owns both descriptors, direct `.configure()` is
still the authoritative path. `targetPluginNames` remains the schema placement
truth; it is not a generic foreign mutation API.

## Composition methods

Keep Plate descriptor stages:

```ts
const FeaturePlugin = defineBasePlugin({ ... })
  .extend(sharedExtension)
  .extend(({ api }) => ({ update: () => ({ ... }) }))
  .configure({ initialState: { ... } });
```

The boundaries are strict:

- constructor: every independent contribution;
- `.extend()`: imported/prebuilt declaration or a genuine earlier-stage type
  dependency;
- `.configure()`: terminal app override, never capability widening.

Do not give Plite extensions matching `.extend()`/`.configure()` methods. Plite
definitions are already complete immutable declarations; Plate's stages are an
opinionated framework job.

## Live editor mutation

`editor.extend()` is the worst remaining collision. It means live
installation, while `Plugin.extend()` means compile-time definition widening.
Rename the live job:

```diff
- const cleanup = editor.extend(history());
+ const uninstall = editor.install(history());

- EditorApi.extend(editor, extension);
+ EditorApi.install(editor, extension);
```

Keep slot replacement explicit and transactional:

```ts
editor.update.extensions.reconfigure(schemaSlot, nextSchema, { migrate });
```

## Editor enhancement alternatives

Hard-cut public `extendBaseEditor` and `extendPlateEditor`. Their constructors
already accept an `editor` input, and no non-test production caller uses the
standalone functions.

```diff
- extendBaseEditor(editor, { plugins });
+ createBaseEditor({ editor, plugins });

- extendPlateEditor(editor, { plugins });
+ createPlateEditor({ editor, plugins });
```

The internal compiler may keep a private apply function, but it must not be a
third public construction spelling.

## Portals

Keep both scoped nouns because the returned capabilities differ:

```ts
editor.extension(HistoryExtension).api;
editor.plugin(TablePlugin).api;
editor.plugin(TablePlugin).read;
editor.plugin(TablePlugin).update;
editor.plugin(TablePlugin).store;
editor.plugin(TablePlugin).type;
```

Plite's extension portal remains descriptor-only and API-only. Plate's plugin
portal may accept a descriptor or name string because dynamic plugin registries
are a real framework job, but descriptor form is the canonical typed path.
Root `editor.api/read/update` remains the aggregate surface in both layers.

## Descriptor nouns and adapters

Keep `EditorExtension`, `BasePlugin`, and `PlatePlugin`. They are not synonyms:

- `EditorExtension`: substrate capability declaration;
- `BasePlugin`: renderer-neutral Plate policy plus static/RSC publication;
- `PlatePlugin`: live React authoring/publication.

Keep `DefinitionOf<typeof Descriptor>` as the only public extractor. Keep
`toPlatePlugin(BasePlugin, adapter?)`; `to` truthfully describes a layer lift
without inventing a second model.

## Ranked implementation packets

1. **P0 — verb hard cut:** `defineEditorExtension` → `defineExtension`,
   `createBasePlugin` → `defineBasePlugin`, `createPlatePlugin` →
   `definePlatePlugin`; rename files, exports, types/tests/docs/examples and add
   no aliases.
2. **P0 — live install hard cut:** `editor.extend` / `EditorApi.extend` →
   `install`; preserve rollback, exact-descriptor identity, uninstall, schema,
   history, and declaration proof.
3. **P1 — extension factory convergence:** retain `history/dom/react/hostCodecs`;
   rename the three `create*Extension` factories to capability nouns.
4. **P1 — construction cleanup:** remove public `extendBaseEditor` and
   `extendPlateEditor`; route existing-editor input through the constructors.
5. **P1 — serialization convergence:** fold `parsers.html` into `codecs`, then
   delete the parallel parser bucket.
6. **P2 — doctrine/docs cleanup:** update Vision/rules/skills only after the API
   decision is accepted; document the verb law and keep all Plate-only fields
   explicitly outside Plite.

## Proof contract

Each hard cut must cover source, package exports, declaration tests, feature
packages, registry/apps, EN/CN current docs, release prose, and packed fixtures.
The factory packet needs exact inference tests with no caller generics. The
install packet needs install/uninstall, replacement, rollback, schema,
contribution, dependency/conflict, and history proof. The parser packet needs
HTML decode/query/data/fragment parity for Juice, Docx, List, and Code Block.

No browser proof is required for this planning artifact. Implementation will
need browser proof because it changes `packages/**`, `content/**`, and registry
consumers.
