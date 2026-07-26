# P0 dossier: hard-cut global priority

Planning only. This is the final dossier for the global-priority cut. It does
not edit or supersede the parent plan.

## Decision

**P0 — delete `EditorExtension.priority` and `PluginBase.priority` across Plite
and Plate.**

Keep numeric priority only on a declaration whose own compiler arbitrates
multiple matching claims:

- Plate shortcuts;
- Plate input rules;
- Plate MIME/product codecs;
- Plate HTML codec rules.

Everything else uses the compiled dependency order and stable source order for
ordered aggregation. Singular ownership conflicts fail compilation or are
resolved by the owning descriptor's terminal application configuration.

Do not replace global priority with named bands, command priority, `before`,
`after`, order-only dependencies, or per-capability plugin ranks.

This packet is P0 because the public contract lies today: “higher priority is
registered and executed first” is not true across API merge, clipboard,
lifecycle, component, codec, and middleware paths. One scalar can alter
unrelated editor behavior. Every new capability inherits that defect.

## Scope boundary

The P0 cut and the typed graph are related but distinct:

| Packet                 | Priority | Exact job                                                                                                         |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| Global-priority cut    | **P0**   | Delete the global scalar and every fallback/winner rule derived from it.                                          |
| Descriptor-owned graph | **P2**   | Replace Plite string required/conflict edges with descriptor identity and hard-cut misleading `peerDependencies`. |

The P0 cut can compile against the current dependency graph. The final public
examples below show the accepted long-term descriptor graph so the parent plan
does not teach an API scheduled for deletion. Do not merge extension outputs,
optional dependencies, service lookup, or host-codec transport into this P0.

## Current evidence

### Plite global owner

Public:

```ts
export type EditorExtension = {
  conflicts?: readonly string[];
  dependencies?: readonly string[];
  name: string;
  peerDependencies?: readonly string[];
  priority?: number;
};
```

`packages/plite/src/interfaces/editor.ts:2097-2143`

Publication sorts the complete extension records by global priority before
dependency traversal:

```ts
for (const record of [...records.values()].sort(
  (left, right) =>
    (right.extension.priority ?? 0) - (left.extension.priority ?? 0) ||
    left.order - right.order
)) {
  visit(record);
}
```

`packages/plite/src/core/editor-extension.ts:1236-1270`

That order registers commands, API capabilities, clipboard middleware, fields,
effects, schema contributions, facets, corrections, commit/node/text/
transaction listeners, query middleware, selections, state groups, and
transaction groups:
`packages/plite/src/core/editor-extension.ts:819-1031,1575-1612`.

The same ordered contributions then have contradictory effective directions:

- command and query pipelines start at the front:
  `packages/plite/src/core/command-registry.ts:108-205`;
  `packages/plite/src/core/query-middleware.ts:124-205`;
- clipboard starts from the end:
  `packages/plite/src/create-editor.ts:150-197`;
- API object capabilities use left-to-right `Object.assign`, so later entries
  overwrite earlier ones; scalar capabilities select `.at(-1)`:
  `packages/plite/src/create-editor.ts:138-148`;
- activation and reverse cleanup use a different record sequence:
  `packages/plite/src/core/editor-extension.ts:2027-2066`;
- introspection reports first-install `order`, not effective priority order:
  `packages/plite/src/core/editor-extension.ts:183-193,1174-1183`.

The tests encode global command priority and priority-vs-dependency behavior:

- `packages/plite/test/command-spec.test.ts:1073-1133`;
- `packages/plite/test/extension-methods-contract.ts:442-471`;
- `packages/plite/test/transaction-contract.ts:1358-1457`.

### Plate global owner

Public:

```ts
export type PluginBase<C extends AnyPluginConfig = PluginConfig> = {
  dependencies: NonNullable<C["dependencies"]>;
  /**
   * Defines the order in which plugins are registered and executed.
   * @default 100
   */
  priority: number;
};
```

`packages/core/src/lib/plugin/PluginConfig.ts:184-225`

Every plugin receives `priority: 100`:
`packages/core/src/lib/plugin/createBasePlugin.ts:889-918`.

The dependency-graph ready queue sorts by global priority and then source:

```ts
const compareReady = (
  a: PluginGraphNode & { resolved: AnyBasePlugin },
  b: PluginGraphNode & { resolved: AnyBasePlugin }
) =>
  b.resolved.priority - a.resolved.priority ||
  a.origin.sourceIndex - b.origin.sourceIndex;
```

`packages/core/src/internal/plugin/resolvePlugins.ts:1535-1873`

The same field currently controls:

| Current consumer                | Exact current behavior                                       | Evidence                                         |
| ------------------------------- | ------------------------------------------------------------ | ------------------------------------------------ |
| Plugin DAG                      | Ready-node global-priority tie break                         | `resolvePlugins.ts:1810-1873`                    |
| Shortcut compiler input         | Missing shortcut priority inherits plugin priority           | `resolvePlugins.ts:1083-1085`                    |
| Input-rule compiler input       | Missing rule priority inherits plugin priority               | `resolvePlugins.ts:1128-1177`                    |
| Component override              | Highest-priority plugin writer wins                          | `resolvePlugins.ts:1296-1343`                    |
| Weak peer override              | Weakest priority merges first, highest remains authoritative | `resolvePlugins.ts:1420-1492`                    |
| MIME/product codec              | Plugin priority sorts before codec-local priority            | `compilePlateCodecs.ts:23-40,132-150`            |
| HTML codec                      | Plugin priority sorts before rule-local priority             | `compilePlateHtmlCodec.ts:54-81,295-298,650-666` |
| Render/decorate/listener caches | Priority-sorted plugin list populates every cache            | `resolvePlugins.ts:520-597`                      |
| API/read/update groups          | Priority-sorted factories merge through shared objects       | `resolvePlugins.ts:670-931`                      |

Special production values prove global priority is structural machinery, not
rare customization:

- internal root: `10_000`,
  `packages/core/src/lib/editor/withPlite.ts:858-876`;
- `OverridePlugin`: `-100`,
  `packages/core/src/lib/plugins/override/OverridePlugin.ts:488-500`;
- every ordinary plugin: `100`,
  `packages/core/src/lib/plugin/createBasePlugin.ts:889-918`.

Feature packages also couple unrelated resources:

- `BaseCodeBlockPlugin` has HTML-rule-local `priority: 10` at
  `packages/code-block/src/lib/BaseCodeBlockPlugin.ts:207` **and** a global
  Plite extension `priority: 10` covering commands plus clipboard at
  `packages/code-block/src/lib/BaseCodeBlockPlugin.ts:211-445`;
- `BaseListPlugin` has HTML-rule-local `priority: 40` at
  `packages/list/src/lib/BaseListPlugin.tsx:513` **and** a global extension
  `priority: 100` covering commands plus transaction observation at
  `packages/list/src/lib/BaseListPlugin.tsx:1140-1165`.

The local HTML priorities survive. The global extension priorities do not.

## Executable current public shape: Plite

This uses only current public imports and APIs. Despite installation order
`[LowercasePolicy, EmphasisPolicy]`, `priority: 100` makes `EmphasisPolicy`
wrap first.

```ts
import {
  createEditor,
  defineCommand,
  defineEditorExtension,
} from "@platejs/plite";

type InsertInput = { text: string };

const Insert = defineCommand<InsertInput>("example.insert", {
  build: ({ input, state }) =>
    state.transaction((tx) => {
      tx.text.insert(input.text);
    }),
});

const LowercasePolicy = defineEditorExtension({
  name: "example.lowercase",
  priority: 10,
  commands: ({ around }) => [
    around(Insert, ({ input, next }) =>
      next({ text: input.text.toLowerCase() })
    ),
  ],
});

const EmphasisPolicy = defineEditorExtension({
  name: "example.emphasis",
  priority: 100,
  commands: ({ around }) => [
    around(Insert, ({ input, next }) => next({ text: `${input.text}!` })),
  ],
});

const editor = createEditor({
  extensions: [LowercasePolicy, EmphasisPolicy] as const,
  initialSelection: {
    kind: "text",
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 0, path: [0, 0] },
  },
  initialValue: [
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ],
});

editor.update.command(Insert, { text: "HELLO" });
```

The number on either extension also reorders every other contribution that
extension may add. The command use case cannot justify that reach.

## Executable proposed public shape: Plite

No global priority. The normal path is ordinary array order. The explicit
advanced path is dependency identity, not another ranking API.

```ts
import {
  createEditor,
  defineCommand,
  defineEditorExtension,
} from "@platejs/plite";

type InsertInput = { text: string };

const Insert = defineCommand<InsertInput>("example.insert", {
  build: ({ input, state }) =>
    state.transaction((tx) => {
      tx.text.insert(input.text);
    }),
});

const EmphasisPolicy = defineEditorExtension({
  name: "example.emphasis",
  commands: ({ around }) => [
    around(Insert, ({ input, next }) => next({ text: `${input.text}!` })),
  ],
});

const LowercasePolicy = defineEditorExtension({
  name: "example.lowercase",
  commands: ({ around }) => [
    around(Insert, ({ input, next }) =>
      next({ text: input.text.toLowerCase() })
    ),
  ],
});

const editor = createEditor({
  extensions: [EmphasisPolicy, LowercasePolicy] as const,
  initialSelection: {
    kind: "text",
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 0, path: [0, 0] },
  },
  initialValue: [
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ],
});

editor.update.command(Insert, { text: "HELLO" });
```

Final P2 descriptor graph shape:

```ts
import { defineEditorExtension } from "@platejs/plite";

const Foundation = defineEditorExtension({
  name: "example.foundation",
});

const LegacyFeature = defineEditorExtension({
  name: "example.legacy-feature",
});

const Feature = defineEditorExtension({
  name: "example.feature",
  dependencies: [Foundation],
  conflicts: [LegacyFeature],
});
```

Required dependencies install transitively and precede dependents. Conflicts
are symmetric at graph compilation even when declared on one descriptor.
Hard-cut `peerDependencies`: current Plite peers are required in practice, and
optional capability belongs to explicit product composition rather than a
service locator.

## Executable current public shape: Plate

This current API example deliberately exercises every current fallback. One
global `500` controls plugin graph order, component arbitration, shortcut and
input-rule fallback, and both codec compilers.

```tsx
import { createRuleFactory } from "@platejs/core";
import {
  createPlateEditor,
  createPlatePlugin,
  ParagraphPlugin,
  PlateElement,
  type PlateElementProps,
} from "@platejs/core/react";
import { ContentSlice, schema } from "@platejs/plite";

const FeatureRule = createRuleFactory({
  type: "blockStart",
  trigger: " ",
  match: ">>>",
  node: "feature",
});

function ParagraphElement(props: PlateElementProps) {
  return <PlateElement {...props}>{props.children}</PlateElement>;
}

const FeaturePlugin = createPlatePlugin({
  key: "feature",
  priority: 500,
  schema: {
    element: {
      content: schema.content.open({ default: "text", min: 1 }),
    },
  },
  inputRules: [FeatureRule()],
  shortcuts: {
    insert: {
      keys: "mod+shift+a",
      handler: () => true,
    },
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      "text/html": {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: "aside" }),
        match: [{ tag: "aside" }],
      },
      "text/plain": {
        scope: "document",
        decode: ({ data }) =>
          data.startsWith("aside:")
            ? ContentSlice.closed([
                {
                  type: "feature",
                  children: [{ text: data.slice("aside:".length) }],
                },
              ])
            : null,
      },
    }),
  override: {
    components: {
      [ParagraphPlugin.key]: ParagraphElement,
    },
  },
});

const editor = createPlateEditor({
  plugins: [ParagraphPlugin, FeaturePlugin],
  initialValue: [
    {
      type: ParagraphPlugin.key,
      children: [{ text: "" }],
    },
  ],
});
```

Current inherited values:

- shortcut priority = `500`;
- input-rule priority = `500`;
- product codec order starts with plugin priority `500`;
- HTML rule order starts with plugin priority `500`;
- component override wins when `500` exceeds the paragraph owner's priority.

## Executable proposed public shape: Plate

Global priority disappears. Every competing declaration states local
precedence. The component is configured on its owning descriptor.

```tsx
import { createRuleFactory } from "@platejs/core";
import {
  createPlateEditor,
  createPlatePlugin,
  ParagraphPlugin,
  PlateElement,
  type PlateElementProps,
} from "@platejs/core/react";
import { ContentSlice, schema } from "@platejs/plite";

const FeatureRule = createRuleFactory({
  type: "blockStart",
  trigger: " ",
  match: ">>>",
  node: "feature",
});

function ParagraphElement(props: PlateElementProps) {
  return <PlateElement {...props}>{props.children}</PlateElement>;
}

const ConfiguredParagraphPlugin = ParagraphPlugin.configure({
  component: ParagraphElement,
});

const FeaturePlugin = createPlatePlugin({
  key: "feature",
  schema: {
    element: {
      content: schema.content.open({ default: "text", min: 1 }),
    },
  },
  inputRules: [FeatureRule({ priority: 30 })],
  shortcuts: {
    insert: {
      keys: "mod+shift+a",
      priority: 20,
      handler: () => true,
    },
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      "text/html": {
        priority: 10,
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: "aside" }),
        match: [{ tag: "aside" }],
      },
      "text/plain": {
        priority: 5,
        scope: "document",
        decode: ({ data }) =>
          data.startsWith("aside:")
            ? ContentSlice.closed([
                {
                  type: "feature",
                  children: [{ text: data.slice("aside:".length) }],
                },
              ])
            : null,
      },
    }),
});

const editor = createPlateEditor({
  plugins: [ConfiguredParagraphPlugin, FeaturePlugin],
  initialValue: [
    {
      type: ParagraphPlugin.key,
      children: [{ text: "" }],
    },
  ],
});
```

The common plugin still has no rank. The four numbers answer four local,
independent questions and can change without moving the plugin graph,
components, APIs, or another compiler.

## Current internal shape

### Plite

```ts
type ExtensionRecord = {
  extension: EditorExtension;
  order: number;
};

type RegisteredEditorExtension = {
  conflicts: readonly string[];
  dependencies: readonly string[];
  name: string;
  order: number;
  peerDependencies: readonly string[];
};

const ordered = [...records.values()].sort(
  (left, right) =>
    (right.extension.priority ?? 0) - (left.extension.priority ?? 0) ||
    left.order - right.order
);
```

The registered diagnostic shape omits the priority that determines effective
publication order.

### Plate

```ts
const compareReady = (
  left: PluginGraphNode & { resolved: AnyBasePlugin },
  right: PluginGraphNode & { resolved: AnyBasePlugin }
) =>
  right.resolved.priority - left.resolved.priority ||
  left.origin.sourceIndex - right.origin.sourceIndex;

type CompiledCodecDeclaration = {
  codecPriority: number;
  owner: string;
  pluginPriority: number;
};

type CompiledHtmlRule = {
  owner: string;
  pluginPriority: number;
  rulePriority: number;
};
```

Component and weak-override compilers separately store or compare the same
global number. Shortcut and input-rule compilers copy it into the local
declaration when no local value exists.

## Proposed internal shape

The P0 target:

```ts
type CompiledExtensionNode = Readonly<{
  descriptor: EditorExtensionDescriptor;
  dependencies: readonly EditorExtensionDescriptor[];
  extensionOrder: number;
  sourceOrder: number;
}>;

type CompiledContribution<T> = Readonly<{
  declarationOrder: number;
  extensionOrder: number;
  owner: EditorExtensionDescriptor;
  value: T;
}>;

type CompiledRankedContribution<T> = CompiledContribution<T> &
  Readonly<{
    localPriority: number;
  }>;

type CompiledExtensionGraph = Readonly<{
  byDescriptor: ReadonlyMap<EditorExtensionDescriptor, CompiledExtensionNode>;
  nodes: readonly CompiledExtensionNode[];
}>;
```

The compiler contract:

1. Validate required/conflict/cycle constraints before resource compilation.
2. Topologically order required descriptors.
3. Break unrelated ready-node ties by canonical source order.
4. Assign one immutable `extensionOrder`.
5. Tag every contribution with owner, extension order, and declaration order.
6. Use `localPriority` only in the four ranked resource compilers.
7. Publish graph, resources, schema, APIs, and lifecycle state atomically.
8. Clean up activated descriptors in exact reverse activation order.

Descriptor identity is the in-process key. Stable `name` is diagnostics and
serialization metadata, never a second runtime identity.

The P0 implementation may initially compile current string dependencies into
the same graph. The P2 graph packet replaces those strings with descriptors and
deletes `peerDependencies`; it does not change the ordering laws.

## Complete replacement matrix

| Resource                                | Current global-priority behavior                             | Final owner and law                                                                                              |
| --------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Dependency graph                        | Higher global priority wins ready-node ties                  | Required edges first; stable source order for unrelated ready nodes                                              |
| Activation                              | Separate record sequence                                     | Exact compiled extension order                                                                                   |
| Cleanup                                 | Reverse activation, but activation is not publication truth  | Exact reverse compiled activation order                                                                          |
| Introspection                           | First-install order, omitting effective priority             | Reports compiled `extensionOrder` and descriptor origin                                                          |
| Commands                                | Global extension priority orders `handle`/`around`           | Extension configuration order; explicit `next`; no command priority                                              |
| Clipboard middleware                    | Global order consumed in reverse                             | Host pipeline declares forward configuration order; no priority                                                  |
| Generic query middleware                | Global order                                                 | Separate query hard-cut owns deletion; until then forward configuration order                                    |
| Commit/node/text/transaction listeners  | Global extension order                                       | Stable configuration order for observation; no winner semantics                                                  |
| Corrections                             | Global extension order                                       | Deterministic compiler order and convergence laws; no author rank                                                |
| Schema/facets/fields/effects/selections | Global extension order can affect registration               | Descriptor identity and compiler conflict laws                                                                   |
| API/read/update/tx namespace leaves     | Later merge silently overwrites                              | Disjoint merge; duplicate leaf ownership is a compile error                                                      |
| Render wrappers                         | Global plugin order affects nesting                          | Stable source order with one documented nesting direction                                                        |
| Decorations                             | Global plugin traversal                                      | Stable source order; all contributions aggregate                                                                 |
| React listeners/hooks                   | Global plugin traversal                                      | Stable source order; no writer-winner semantics                                                                  |
| Components                              | Highest global priority wins                                 | Owning descriptor's terminal `.configure({ component })`; conflicting foreign writers fail                       |
| Weak plugin patches                     | Highest priority then earlier source wins overlapping fields | Disjoint merge; `Object.is`-identical overlap coalesces; different overlap fails; target terminal configure wins |
| Shortcuts                               | Local priority falls back to global plugin priority          | **Local shortcut priority**, then extension order, declaration order, ID                                         |
| Input rules                             | Local priority falls back to global plugin priority          | **Local input-rule priority**, then extension order, declaration order                                           |
| MIME/product codecs                     | Plugin priority sorts before codec priority                  | **Local codec priority**, then extension order, declaration order; exclusive overlap fails                       |
| HTML codec rules                        | Plugin priority sorts before rule priority                   | **Local HTML-rule priority**, then extension order, declaration order; equal-rank exclusive overlap fails        |

Source order remains observable only for ordered aggregation and continuation.
It never silently selects a singular winner.

## Exact local precedence owners

### 1. Shortcuts

Keep:

```ts
shortcuts: {
  open: {
    keys: 'mod+k',
    priority: 20,
    handler: () => true,
  },
}
```

Owner:
`packages/core/src/internal/plugin/compilePlateShortcuts.ts:136-171`.

Repair:

- delete `resolvedHotkey.priority ?? plugin.priority`;
- default omitted shortcut priority to `0`;
- sort local priority, extension order, declaration order, stable ID;
- retain finite-number validation.

### 2. Input rules

Keep:

```ts
const rule = createRuleFactory({
  type: "blockStart",
  trigger: " ",
  match: ">>>",
  node: "feature",
});

createPlatePlugin({
  key: "feature",
  inputRules: [rule({ priority: 30 })],
});
```

Owners:

- public factory:
  `packages/core/src/lib/plugins/input-rules/createRuleFactory.ts:1-818`;
- compiler:
  `packages/core/src/internal/plugin/resolvePlugins.ts:1108-1177`.

Repair:

- delete `mergedRule.priority ?? plugin.priority`;
- default omitted rule priority to `0`;
- sort local priority, extension order, declaration order;
- preserve trigger indexes and finite-number validation.

### 3. MIME/product codecs

Keep:

```ts
codecs: ({ defineCodecs }) =>
  defineCodecs({
    "text/plain": {
      priority: 5,
      scope: "document",
      decode,
    },
  });
```

Owner:
`packages/core/src/internal/plugin/compilePlateCodecs.ts:23-150`.

Repair:

- delete `pluginPriority` from `CompiledCodecDeclaration`;
- compare codec-local priority first;
- use extension/declaration order only as stable fallthrough order;
- reject equal local-priority exclusive claim overlap with both owners;
- preserve disjoint equal-priority codecs and query-based fallthrough.

### 4. HTML codec rules

Keep:

```ts
codecs: ({ defineCodecs }) =>
  defineCodecs({
    "text/html": {
      priority: 10,
      decode: () => ({}),
      encode: ({ content }) => ({ children: content, tag: "aside" }),
      match: [{ tag: "aside" }],
    },
  });
```

Owner:
`packages/core/src/internal/plugin/compilePlateHtmlCodec.ts:54-81,295-298,650-666,853-909`.

Repair:

- delete `pluginPriority` from `CompiledHtmlRule`;
- compare rule-local priority first;
- use extension/declaration order only for stable fallthrough;
- reject equal local-priority overlapping element/decode/encode claims;
- preserve matcher indexes, schema binding, and safe encode/decode behavior.

No fifth local-priority owner is justified by current source.

## Component and weak-override replacement

### Component

Current:

```ts
const ThemePlugin = createPlatePlugin({
  key: "theme",
  priority: 1_000,
  override: {
    components: {
      [ParagraphPlugin.key]: ParagraphElement,
    },
  },
});
```

Final:

```ts
const ConfiguredParagraphPlugin = ParagraphPlugin.configure({
  component: ParagraphElement,
});
```

The application that chooses the component configures the owning descriptor.
An optional foreign component writer that overlaps another writer is a compile
error; it does not earn local priority.

### Weak plugin patch

Current global arbitration:

```ts
const Contributor = createPlatePlugin({
  key: "contributor",
  priority: 1_000,
  override: {
    plugins: {
      paragraph: {
        options: { softBreaks: true },
      },
    },
  },
});
```

Final optional adaptation:

```ts
const Contributor = createPlatePlugin({
  key: "contributor",
  override: {
    plugins: {
      paragraph: {
        options: { softBreaks: true },
      },
    },
  },
});
```

Compilation law:

1. Disjoint leaf writes merge.
2. Same-reference or `Object.is`-equal writes coalesce.
3. Different overlapping leaf writes from different contributors fail with
   both descriptor keys and the property path.
4. The target descriptor's terminal `.configure()` is applied after weak
   contributions and wins.

## Donor comparison

| Donor       | Mechanism                                                                                                          | Exact evidence                                                                                                                           | Classification                                                                | Verdict                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Wordgard    | Five global precedence bands flatten all extension values; fields/facets, commands, and keymaps inherit the result | `../wordgard/src/state/state.ts:594-779`; `../wordgard/src/command/command.ts:4-96`; `../wordgard/src/editor/keymap.ts:16-18,107-118`    | `reference weaker`                                                            | Reject. Named bands are nicer than integers but retain cross-resource coupling.                                 |
| Wordgard    | Parser rules own local precedence                                                                                  | `../wordgard/src/doc/parse.ts:66-169`                                                                                                    | `equivalent`                                                                  | Keep Plate's local codec/rule priority principle.                                                               |
| Lexical     | Descriptor dependencies and topological build, no global extension priority                                        | `../lexical/packages/lexical/src/extension-core/types.ts:148-188`; `../lexical/packages/lexical-extension/src/LexicalBuilder.ts:260-382` | `reference stronger` for edge identity; local stronger for atomic publication | Steal typed required/conflict identity in P2; keep Plite atomic candidate publication.                          |
| Lexical     | Five command-priority buckets                                                                                      | `../lexical/packages/lexical/src/LexicalEditor.ts:351-366,930-981`; `../lexical/packages/lexical/src/LexicalUpdates.ts:782-821`          | `different tradeoff`                                                          | Reject. Plite typed `handle`/`around` continuation already expresses command policy without another rank.       |
| Lexical     | Transforms explicitly do not promise order                                                                         | `../lexical/packages/lexical/src/LexicalEditor.ts:1097-1140`                                                                             | `different tradeoff`                                                          | Reject for corrections; Plite needs deterministic convergence, not author priority.                             |
| ProseMirror | Plugin array order selects view props and orders state filters/appended transactions                               | `../prosemirror-view/src/index.ts:288-314,603-615`; `../prosemirror-state/src/state.ts:123-167`                                          | `reference weaker` as full conflict model                                     | Keep caller order only as a stable tie break for ordered aggregation. Do not use it to hide singular conflicts. |
| ProseMirror | Parse rules have local priority                                                                                    | `../prosemirror-model/src/from_dom.ts:54-68,277-314`                                                                                     | `equivalent`                                                                  | Keep local parse/codec priority.                                                                                |

The target is stronger than all donors: typed descriptor requirements, atomic
publication and rollback, JSON/multi-root state, explicit command
continuation, compiler-owned local competition, terminal application
configuration, and owner-rich conflict errors without a global rank.

## Hard deletions

### Plite

- `EditorExtension.priority`.
- Priority comparison in `getOrderedExtensionRecords`.
- Command helper/test parameters whose only purpose is extension priority.
- Global-priority assertions in command, extension-method, and transaction
  tests.
- Any diagnostic path that reports first-install order instead of compiled
  extension order.
- Clipboard/API reverse-list winner behavior.
- Silent duplicate leaf overwrite in singular API/state/transaction
  namespaces.

### Plate public and compiler

- `PluginBase.priority`.
- `priority: 100` in `createBasePlugin`.
- Global priority from `.extend()`, `.configure()`, `toPlatePlugin`, weak
  overrides, and `CreatePlateEditorOptions`.
- `priority` in erased override/configuration types.
- Priority term in the plugin DAG ready queue.
- Shortcut fallback to plugin priority.
- Input-rule fallback to plugin priority.
- `pluginPriority` in MIME/product codecs.
- `pluginPriority` in HTML codec rules.
- Priority-based component winner records.
- Priority-based weak-override merge order and graph signature.
- Internal root `priority: 10_000`.
- `OverridePlugin` global `priority: -100`.
- Resolver/compiler/type tests that assert global-priority behavior.
- Docs that recommend tuning plugin priority.

### Feature/product adoption

- Global extension `priority: 10` in `BaseCodeBlockPlugin`; retain its separate
  HTML-rule-local priority.
- Global extension `priority: 100` in `BaseListPlugin`; retain its separate
  HTML-rule-local priority.
- Any remaining global plugin or extension priority found by the closure
  manifest.
- Registry component winner plugins replaced by direct target configuration.
- Local rule priority copied only to mimic the old global default when no real
  competing claim exists.

## Adoption

### Plite substrate

1. Compile one dependency/source order and publish it in introspection.
2. Route activation, cleanup, contributions, and diagnostics through that
   order.
3. Make each ordered pipeline explicitly forward or reverse; stop inferring
   winner behavior from array direction.
4. Reject duplicate singular namespace leaves before publication.
5. Delete global priority and replace tests with dependency/source-order laws.

### Plate core

1. Remove priority from descriptor/configuration/override types and defaults.
2. Use canonical source index as the only ready-node tie break.
3. Lower Plate and Plite extension order once, without a second scalar.
4. Repair all four local compilers.
5. Replace component arbitration with direct owner configuration.
6. Replace weak-override arbitration with overlap validation plus terminal
   target configuration.
7. Re-home the root model structurally.
8. Re-home `OverridePlugin` fallback through canonical core composition and
   explicit command continuation; its command position must not move unrelated
   render/query/codec contributions.

### Packages and product

1. Audit `BaseCodeBlockPlugin` command and clipboard traces separately.
2. Audit `BaseListPlugin` command and transaction-listener traces separately.
3. Audit code block, list, math, media, CSV, link, and other local rule values;
   preserve only real same-input competition.
4. Migrate `apps/www/src/registry` components to terminal target
   configuration.
5. Rewrite current docs and examples as the final contract.
6. Update declaration/type fixtures and package-integration proof.

## Proof

### Type proof

- `priority` fails on Plite extensions, Plate plugins, `.extend()`,
  `.configure()`, `toPlatePlugin`, weak patches, and editor root options.
- Shortcut/input-rule/MIME/HTML local `priority` remains inferred and finite.
- Descriptor dependencies preserve config/editor/API inference when P2 lands.
- `peerDependencies` fails when P2 lands.
- Duplicate singular namespace leaves fail with both owner descriptors.
- Direct target `.configure({ component })` preserves exact component props.

### Generated graph and publication laws

Generate roots, required edges, conflicts, and contributions:

- every dependency precedes its dependent;
- unrelated ready nodes preserve canonical source order;
- identical declarations produce identical order independent of traversal
  implementation;
- activation, introspection, and contribution metadata agree;
- cleanup is exact reverse activation;
- failed graph/resource/config validation publishes nothing;
- transactional replacement cleans only displaced descriptors;
- missing, cyclic, conflicting, and duplicate singular owners report stable
  descriptor-rich diagnostics.

### Resource-local laws

- Changing shortcut priority changes only shortcut arbitration.
- Changing input-rule priority changes only input-rule arbitration.
- Changing MIME priority changes only that MIME compiler.
- Changing HTML priority changes only that HTML compiler.
- Removing/reordering an unrelated plugin cannot change any local winner.
- Equal exclusive codec/HTML claims fail with both owners.
- Disjoint codec claims retain deterministic fallthrough.
- Commands and clipboard produce exact forward configuration traces through
  `next`.
- Wrapper nesting direction has one explicit snapshot contract.
- Weak disjoint writes merge; equal overlap coalesces; conflicting overlap
  fails; terminal target configuration wins.

### Focused browser proof

- two plugins claim the same shortcut;
- two input rules share a trigger;
- HTML/plain/VS Code/code-block paste fallback;
- direct paragraph/component configuration and render wrapper nesting;
- runtime extension reconfiguration and cleanup;
- Chromium, Firefox, and WebKit for shortcut, input-rule, and paste rows;
- mobile viewport only for changed shortcut/input routes.

Use focused package/browser rows during iteration, then `pnpm check:plite` and
the browser matrix at closure. This packet does not justify a raw-device claim.

### Performance proof

- 1,000-extension sparse and dense DAG compilation;
- 10,000 shortcut/input/codec declarations;
- deep command and clipboard chains;
- before/after allocations and wall time;
- no dispatch regression;
- graph compilation remains `O(V + E)` plus local compiler sorting.

Do not add caches or a new registry unless those benchmarks prove a need.

## Dependencies and owners

| Stage            | Owner                                                 | Entry                              | Exit                                                                                |
| ---------------- | ----------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| Public decision  | `best-api`                                            | This dossier accepted              | No global rank; exact four local owners; component/weak conflict law frozen         |
| Cross-layer plan | `plate-plan` primary                                  | Public decision frozen             | Plate compiler, packages, registry, docs, proof, and deletion ledger complete       |
| Substrate plan   | `plite-plan` dependent                                | Ordering law frozen                | Plite graph/publication/introspection/rollback and priority deletion planned        |
| Descriptor graph | Separate P2, `best-api` → `plite-plan` → `plate-plan` | May land before, with, or after P0 | Typed required/conflict descriptors; transitive install; `peerDependencies` deleted |
| Closure          | `plate-plan` coordinating package owners              | Implementation complete            | Type/generated/package/browser/performance proof and zero forbidden global priority |

The P0 cut has no dependency on extension outputs, host codec transport,
ordered schema grammar, session state, history, Yjs, DOM scheduling, or React
architecture. Clipboard transport and query middleware may be deleted by their
own packets; until then they consume the same explicit configuration order.

## Rejected replacements

- Wordgard five-band global precedence.
- Lexical command-priority buckets.
- ProseMirror plugin-array order as a singular conflict resolver.
- Public `before`/`after`.
- Order-only fake dependencies.
- Per-capability plugin clones or plugin ranks.
- Compatibility aliases or hidden global priority.
- Keeping priority internally during migration.
- Optional dependency/service-locator machinery.
- Bundling generic extension outputs into this cut.

## Closure search

The implementation closes only when source, declarations, tests, docs, and
registry examples have zero global uses of:

```text
EditorExtension.priority
PluginBase.priority
plugin.priority
pluginPriority
priority: 10_000
priority: -100
priority: 100
```

The search must classify, not blindly delete, remaining `priority` tokens.
Slice-fitter search ranks and the four capability-local owners are unrelated
and remain.

**Final recommendation:** accept P0. Hard-cut the global rank in one
cross-layer migration. Keep exactly four capability-local priority owners.
Keep the typed descriptor graph as its own P2 packet. Add no replacement
ordering DSL.
