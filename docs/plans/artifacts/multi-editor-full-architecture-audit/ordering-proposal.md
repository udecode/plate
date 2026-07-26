# Extension ordering and local precedence

Superseded working draft. The final P0 decision and exact shapes are in
[`ordering-parent-repair.md`](./ordering-parent-repair.md).

Planning evidence only. This packet covers Plite extension order, Plate plugin
order, dependency order, lifecycle order, and capability-local competition. It
does not authorize implementation.

## Verdict

**P1 — rearchitect and hard-cut global extension/plugin `priority`.**

Plite and Plate expose one global number that influences unrelated behavior:
dependency-graph tie breaks, commands, clipboard, queries, codecs, shortcuts,
input rules, render wrappers, component overrides, weak overrides, APIs,
read/update namespaces, listeners, and registration. The number is not a useful
domain concept. Worse, different pipelines consume the same ordered list in
opposite directions, so “higher priority runs first” is not even a coherent
runtime invariant.

The replacement is deliberately smaller:

1. Descriptor dependencies determine required structural order.
2. Canonical caller/source order breaks ties between unrelated descriptors.
3. Every lifecycle and contribution compiler uses one immutable compiled
   extension order.
4. Only actual competing rules keep local `priority`: shortcuts, input rules,
   MIME codecs, and HTML codec rules.
5. Singular ownership conflicts fail compilation instead of silently selecting
   a winner.

Do **not** add `before`, `after`, precedence bands, per-capability plugin ranks,
or fake dependencies used only for ordering. They replace one bad control plane
with a larger one.

Primary ownership:

```text
best-api -> plite-plan -> plate-plan
```

`best-api` freezes the call shape and conflict policy. `plite-plan` owns the
compiled extension graph and lifecycle. `plate-plan` removes Plate lowering,
adopts every plugin/package/product caller, and proves browser behavior.

This is P1, not P0: the current behavior is deterministic and the explicit
production uses of global priority are bounded, so no correctness emergency
blocks other work. It is still foundational authoring debt because every new
capability inherits the same false ordering contract.

## Current-source proof

### Plite

The public extension descriptor exposes string dependencies and one global
priority:

```ts
export type EditorExtension<
  TEditor extends BaseEditor<any> = Editor,
  TOptions = unknown,
  TConfig = unknown
> = {
  // ...
  dependencies?: readonly string[];
  name: string;
  peerDependencies?: readonly string[];
  priority?: number;
  // ...
};
```

Evidence: `packages/plite/src/interfaces/editor.ts:2097-2143`.

Installation initially resolves dependencies and preserves input order
(`packages/plite/src/core/editor-extension.ts:740-817`), but publication sorts
all records by descending priority and first-install order before traversing
dependencies:

```ts
for (const record of [...records.values()].sort(
  (left, right) =>
    (right.extension.priority ?? 0) - (left.extension.priority ?? 0) ||
    left.order - right.order
)) {
  visit(record);
}
```

Evidence: `packages/plite/src/core/editor-extension.ts:1236-1270`.

That one list registers every extension contribution:

- commands, API capabilities, clipboard middleware, fields, effects, schema,
  facets, corrections, commit/node/text/transaction listeners, query
  middleware, selections, state groups, and transaction groups:
  `packages/plite/src/core/editor-extension.ts:819-1031`;
- registry publication: `packages/plite/src/core/editor-extension.ts:1575-1612`;
- configuration validation: `packages/plite/src/core/editor-extension.ts:1715-1755`;
- API factory resolution: `packages/plite/src/core/editor-extension.ts:1826-1855`.

The published diagnostic record drops `priority`
(`packages/plite/src/core/editor-extension.ts:1174-1183`), and
`getCompiledEditorConfiguration` reports first-install order rather than actual
contribution precedence (`packages/plite/src/core/editor-extension.ts:183-193`).
Activation uses `activatedRecords` order and cleanup reverses it, rather than
the publication order (`packages/plite/src/core/editor-extension.ts:2027-2066`).
Plite therefore has multiple observable notions of extension order.

The shared list also has contradictory winner directions:

- command/query traversal starts at the beginning:
  `packages/plite/src/core/query-middleware.ts:124-205`;
- clipboard traversal starts at the end:
  `packages/plite/src/create-editor.ts:150-197`;
- API capability objects use `Object.assign`, so later objects overwrite
  earlier ones, and scalar capabilities select `.at(-1)`:
  `packages/plite/src/create-editor.ts:138-148`;
- capabilities, listeners, and queries append in registry order:
  `packages/plite/src/core/extension-registry.ts:780-806,900-991`.

The test suite codifies the global knob rather than a single semantic law:

- command priority: `packages/plite/test/command-spec.test.ts:1073-1133`;
- plugin-method command priority:
  `packages/plite/test/extension-methods-contract.ts:442-471`;
- transaction command order:
  `packages/plite/test/transaction-contract.ts:1358-1457`;
- dependency order defeating priority:
  `packages/plite/test/command-spec.test.ts:1101-1133`.

Production coupling is not theoretical:

- `BaseCodeBlockPlugin` returns one Plite extension with `priority: 10` and
  contributes both clipboard middleware and commands:
  `packages/code-block/src/lib/BaseCodeBlockPlugin.ts:211-445`;
- `BaseListPlugin` uses `priority: 100` for commands and a transaction listener:
  `packages/list/src/lib/BaseListPlugin.tsx:1140-1165`.

### Plate

Every Plate plugin exposes a required global priority:

```ts
export type PluginBase<C extends AnyPluginConfig = PluginConfig> = {
  // ...
  /**
   * Defines the order in which plugins are registered and executed.
   * @default 100
   */
  priority: number;
  // ...
};
```

Evidence: `packages/core/src/lib/plugin/PluginConfig.ts:184-225`.
`createBasePlugin` injects `priority: 100` into every descriptor
(`packages/core/src/lib/plugin/createBasePlugin.ts:889-918`). The root Plate
model extension uses `10_000`
(`packages/core/src/lib/editor/withPlite.ts:858-876`), while
`OverridePlugin` uses `-100`
(`packages/core/src/lib/plugins/override/OverridePlugin.ts:488-500`).

The resolver constructs a dependency graph, but its stable Kahn ready queue
sorts by descending global priority and then source index:

```ts
const compareNodeOrder = (left: PluginNode, right: PluginNode) =>
  right.plugin.priority - left.plugin.priority ||
  left.sourceIndex - right.sourceIndex;
```

Evidence: `packages/core/src/internal/plugin/resolvePlugins.ts:1535-1873`.
The behavior is explicitly tested in
`packages/core/src/internal/plugin/pluginSourceResolution.spec.ts:135-160` and
`packages/core/src/internal/plugin/resolvePlugins.spec.tsx:596-695`.

That same number influences unrelated compilers:

| Lane                      | Current use of global plugin priority                         | Evidence                                         |
| ------------------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| Dependency graph          | Ready-node tie break                                          | `resolvePlugins.ts:1810-1873`                    |
| Shortcuts                 | Fallback when shortcut has no local priority                  | `resolvePlugins.ts:1083-1085`                    |
| Input rules               | Fallback when rule has no local priority                      | `resolvePlugins.ts:1128-1177`                    |
| Components                | Chooses the winning component override                        | `resolvePlugins.ts:1296-1343`                    |
| Weak peer overrides       | Sorts weak patches before merging                             | `resolvePlugins.ts:1420-1492`                    |
| MIME codecs               | `pluginPriority` precedes codec-local priority                | `compilePlateCodecs.ts:23-40,83-150`             |
| HTML codecs               | `pluginPriority` precedes rule-local priority                 | `compilePlateHtmlCodec.ts:54-81,650-666,853-909` |
| Render/decorate/listeners | Populates every runtime cache in plugin-list order            | `resolvePlugins.ts:520-597`                      |
| API/read/update factories | Accumulates and overwrites shared groups in plugin-list order | `resolvePlugins.ts:670-931`                      |

The public model already has the right local concepts:

- shortcut-local `priority`:
  `packages/core/src/lib/plugin/BasePlugin.ts:1869-1886`,
  `packages/core/src/react/plugin/PlatePlugin.ts:1103-1123`;
- input-rule-local `priority`:
  `packages/core/src/lib/plugins/input-rules/types.ts:1-104`;
- HTML-rule-local `priority`:
  `packages/core/src/lib/plugin/BasePlugin.ts:426-429`;
- MIME-codec-local `priority`:
  `packages/core/src/lib/plugin/BasePlugin.ts:673-682`.

Those priorities correspond to a real question: when two rules match the same
input, which rule gets the first chance? The global plugin number does not.

Current docs teach the coupling:

- `content/docs/(guides)/plugin.mdx:355-365`;
- `content/docs/(guides)/plugin-shortcuts.mdx:36,203-225`;
- `content/docs/(guides)/plugin-components.mdx:223`;
- `content/docs/api/core/plate-plugin.mdx:261,346`.

## Donor comparison ledger

| Donor mechanism                                                                                                                                        | Exact evidence                                                                                                                                     | Plite/Plate classification                                                                                                                                                                                        | Verdict                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Wordgard has five global extension precedence bands and flattens configuration through them. Fields, facets, commands, and keymaps inherit that order. | `../wordgard/src/state/state.ts:594-779`; `../wordgard/src/command/command.ts:4-96`; `../wordgard/src/editor/keymap.ts:16-18,107-118`              | **Inferior**, despite nicer names than arbitrary integers. It is still one cross-capability knob. Wordgard's narrower surface hides part of the coupling that Plate makes visible.                                | **Reject** the global bands.                                                      |
| Wordgard parser rules own local precedence independent of extension bands.                                                                             | `../wordgard/src/doc/parse.ts:66-169`                                                                                                              | **Equivalent direction**, cleaner ownership. Plate already has local HTML/MIME/input/shortcut priorities.                                                                                                         | **Keep/steal the ownership rule**, not Wordgard's numeric range.                  |
| Lexical extensions declare dependencies; the builder topologically orders the graph without a global extension priority.                               | `../lexical/packages/lexical/src/extension-core/types.ts:148-188`; `../lexical/packages/lexical-extension/src/LexicalBuilder.ts:260-382`           | **Lexical superior** to current global plugin priority.                                                                                                                                                           | **Steal** descriptor graph plus stable source order.                              |
| Lexical commands use five command-priority buckets.                                                                                                    | `../lexical/packages/lexical/src/LexicalEditor.ts:351-366,930-981`; `../lexical/packages/lexical/src/LexicalUpdates.ts:782-821`                    | **Different tradeoff, rejected.** Buckets are justified for Lexical's event-like command bus, but Plite commands are typed policy with explicit `next`; a local bucket would encourage hidden interception order. | **Reject** command-local priority.                                                |
| Lexical transforms are explicitly unordered.                                                                                                           | `../lexical/packages/lexical/src/LexicalEditor.ts:1097-1140`                                                                                       | **Different tradeoff.** Plite corrections need deterministic compilation and convergence, but not author-controlled rank.                                                                                         | **Keep** deterministic compiled order; reject public ranking.                     |
| ProseMirror plugin-array order determines prop lookup, keymaps, state fields, filtering, and append-transaction order.                                 | `../prosemirror-view/src/index.ts:288-314,603-615`; `../prosemirror-keymap/src/keymap.ts:73-77`; `../prosemirror-state/src/state.ts:45-60,123-167` | **Inferior as a complete model.** It is simpler than global integers but still lets one array position alter unrelated state and view behavior.                                                                   | **Keep only** stable caller order as the tie break between unrelated descriptors. |
| ProseMirror parse rules own local priority.                                                                                                            | `../prosemirror-model/src/from_dom.ts:54-68,277-314`                                                                                               | **Equivalent direction.**                                                                                                                                                                                         | **Keep** capability-local parse priority.                                         |

## Material proposal: one compiled structural order

### Current Plite public shape

One integer silently couples every contribution from an extension:

```ts
import {
  createEditor,
  defineCommand,
  defineEditorExtension,
} from "@platejs/plite";

type InsertTextInput = { text: string };

const insertText = defineCommand<InsertTextInput>("example.insert-text", {
  build: ({ input, state }) =>
    state.transaction((tx) => {
      tx.text.insert(input.text);
    }),
});

const LowPolicy = defineEditorExtension({
  name: "example.low-policy",
  priority: 10,
  commands: ({ around }) => [
    around(insertText, ({ input, next }) =>
      next({ text: input.text.toLowerCase() })
    ),
  ],
  clipboard: {
    insertData: (data, { next }) => next(data),
  },
  api: {
    example: {
      policy: "low",
    },
  },
});

const HighPolicy = defineEditorExtension({
  name: "example.high-policy",
  priority: 100,
  commands: ({ around }) => [
    around(insertText, ({ input, next }) => next({ text: `${input.text}!` })),
  ],
  clipboard: {
    insertData: (data, { next }) => next(data),
  },
  api: {
    example: {
      policy: "high",
    },
  },
});

const editor = createEditor({
  extensions: [LowPolicy, HighPolicy],
});
```

The author cannot read that code and infer all effective winners. Commands start
from the priority-sorted front; clipboard starts from the back; API objects are
overwritten from left to right.

### Proposed Plite public shape

Remove `priority`. Dependencies express actual requirements. Unrelated
extensions preserve canonical caller order.

```ts
import {
  createEditor,
  defineCommand,
  defineEditorExtension,
} from "@platejs/plite";

type InsertTextInput = { text: string };

const insertText = defineCommand<InsertTextInput>("example.insert-text", {
  build: ({ input, state }) =>
    state.transaction((tx) => {
      tx.text.insert(input.text);
    }),
});

const FirstPolicy = defineEditorExtension({
  name: "example.first-policy",
  commands: ({ around }) => [
    around(insertText, ({ input, next }) => next({ text: `${input.text}!` })),
  ],
  clipboard: {
    insertData: (data, { next }) => next(data),
  },
});

const SecondPolicy = defineEditorExtension({
  name: "example.second-policy",
  commands: ({ around }) => [
    around(insertText, ({ input, next }) =>
      next({ text: input.text.toLowerCase() })
    ),
  ],
  clipboard: {
    insertData: (data, { next }) => next(data),
  },
});

const Feature = defineEditorExtension({
  name: "example.feature",
  dependencies: [FirstPolicy],
});

const editor = createEditor({
  extensions: [FirstPolicy, SecondPolicy, Feature],
});
```

This example assumes the separate accepted descriptor-owned dependency packet:
`dependencies: [FirstPolicy]`, not `dependencies: [FirstPolicy.name]`. If that
packet is not yet merged, this priority cut must land in the same coherent
Plite plan, not preserve string dependencies as a bridge.

The public order law is exact:

- dependencies compile before dependents;
- unrelated root extensions retain caller order;
- a pipeline with `next` traverses compiled extension order;
- reverse cleanup is the only deliberate reverse traversal;
- duplicate singular ownership is a compile error.

There is no public order-only dependency and no command priority.

### Current Plate public shape

The plugin's global number affects its graph position and every contribution,
while some nested capabilities add a second number:

```tsx
import { createPlateEditor, createPlatePlugin } from "@platejs/core/react";

const ParagraphPlugin = createPlatePlugin({
  key: "paragraph",
});

const FeaturePlugin = createPlatePlugin({
  key: "feature",
  dependencies: [ParagraphPlugin],
  priority: 500,
  shortcuts: {
    open: {
      keys: "mod+k",
      handler: () => true,
    },
  },
  override: {
    components: {
      paragraph: () => <p data-feature="on" />,
    },
  },
});

const editor = createPlateEditor({
  plugins: [ParagraphPlugin, FeaturePlugin],
});
```

Changing `500` to fix a component or shortcut conflict also changes plugin
resolution, codecs, wrappers, listeners, weak patches, APIs, reads, updates,
and the lowered Plite extension.

### Proposed Plate public shape

Plugin composition uses dependencies and caller order. A competing capability
states its priority locally. A component is configured on the descriptor that
owns the component.

```tsx
import { createPlateEditor, createPlatePlugin } from "@platejs/core/react";

const ParagraphPlugin = createPlatePlugin({
  key: "paragraph",
}).configure({
  component: (props) => (
    <p data-feature="on" {...props.attributes}>
      {props.children}
    </p>
  ),
});

const FeaturePlugin = createPlatePlugin({
  key: "feature",
  dependencies: [ParagraphPlugin],
  shortcuts: {
    open: {
      keys: "mod+k",
      priority: 20,
      handler: () => true,
    },
  },
});

const editor = createPlateEditor({
  plugins: [ParagraphPlugin, FeaturePlugin],
});
```

The shortcut has local priority because two shortcuts can claim the same
keystroke. The plugin does not because a plugin is not one competing action.

For optional weak adaptation, keep the existing descriptor-targeted override
surface, but compile overlapping writes as conflicts:

```ts
const OptionalParagraphBehavior = createPlatePlugin({
  key: "optional-paragraph-behavior",
  override: {
    plugins: {
      paragraph: {
        options: {
          softBreaks: true,
        },
      },
    },
  },
});
```

Rules:

1. Disjoint weak writes merge in source order.
2. Identical overlapping values may coalesce with `Object.is`.
3. Different overlapping values from separate contributors are compile errors.
4. The target descriptor's terminal `.configure()` is applied last and wins.
5. Global priority never resolves the conflict.

### Current internal shape

Plite effectively compiles:

```ts
type ExtensionRecord = {
  extension: EditorExtension;
  order: number;
};

const ordered = [...records.values()].sort(
  (left, right) =>
    (right.extension.priority ?? 0) - (left.extension.priority ?? 0) ||
    left.order - right.order
);
```

Plate repeats a richer variant:

```ts
type PluginNode = {
  plugin: ResolvedPlugin;
  sourceIndex: number;
};

const compareNodeOrder = (left: PluginNode, right: PluginNode) =>
  right.plugin.priority - left.plugin.priority ||
  left.sourceIndex - right.sourceIndex;

type CompiledCodec = {
  codecPriority: number;
  pluginPriority: number;
};
```

Different compilers then reverse, append, or overwrite through those arrays.
There is no single immutable rank that lifecycle, diagnostics, and contribution
pipelines all consume.

### Proposed internal shape

Compile one graph and attach origin metadata to every contribution:

```ts
type CompiledExtensionNode = Readonly<{
  descriptor: EditorExtensionDescriptor;
  dependencies: readonly EditorExtensionDescriptor[];
  sourceOrder: number;
  extensionOrder: number;
}>;

type CompiledContribution<T> = Readonly<{
  value: T;
  owner: EditorExtensionDescriptor;
  extensionOrder: number;
  declarationOrder: number;
}>;

type CompiledRankedContribution<T> = CompiledContribution<T> &
  Readonly<{
    localPriority: number;
  }>;

type CompiledExtensionGraph = Readonly<{
  nodes: readonly CompiledExtensionNode[];
  byDescriptor: ReadonlyMap<EditorExtensionDescriptor, CompiledExtensionNode>;
}>;
```

Compilation is atomic:

```ts
const graph = compileExtensionGraph(rootExtensions, {
  readyNodeOrder: "source",
});

const commands = compileOrderedContributions(graph, "commands");
const clipboard = compileOrderedContributions(graph, "clipboard");
const shortcuts = compileRankedContributions(graph, "shortcuts");
const inputRules = compileRankedContributions(graph, "inputRules");
const codecs = compileRankedContributions(graph, "codecs");
```

The actual compiler need not expose those helper names. The invariants matter:

1. Validate missing dependencies, peer dependencies, conflicts, and cycles
   before any publication.
2. Topologically order descriptor dependencies.
3. Break ready-node ties by canonical source order only.
4. Assign one immutable `extensionOrder`.
5. Derive activation, deactivation, introspection, commands, middleware,
   listeners, schema, state, effects, and host contribution origins from that
   order.
6. Use `localPriority`, then `extensionOrder`, then `declarationOrder` only in
   compilers for real competing rules.
7. Reject duplicate singular API/state/update/method/component ownership
   unless the owner explicitly declares an aggregation contract.
8. Never use list reversal to manufacture a different winner policy. A
   pipeline compiler explicitly declares traversal and cleanup direction.

### Capability matrix after the cut

| Capability                              | Final ordering/conflict law                                                                                       |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Dependency lifecycle                    | Dependency before dependent; cleanup reverses activation                                                          |
| Commands                                | Compiled extension order; `.handle` falls through on `false`; `.around` controls explicit continuation            |
| Clipboard middleware                    | Compiled extension order through explicit `next`                                                                  |
| Query middleware, if retained           | Compiled extension order through explicit `next`; the separate accepted packet hard-cuts generic query middleware |
| Commit/node/text/transaction listeners  | Source order for deterministic observation; listeners must not rely on another listener's mutation                |
| Corrections                             | Compiler-owned deterministic order plus convergence laws; no author priority                                      |
| Schema/facets/fields/effects/selections | Descriptor identity and ownership; conflicts fail                                                                 |
| API/read/update/transaction groups      | Namespaced ownership; duplicate leaf methods fail                                                                 |
| React wrappers/decorators               | Stable source order with documented wrapper nesting direction                                                     |
| Components                              | Owning descriptor's terminal `.configure({ component })`; conflicting weak writers fail                           |
| Weak peer patches                       | Disjoint merge; identical overlap coalesces; conflicting overlap fails; terminal target configure wins            |
| Shortcuts                               | Local priority, then extension order, then declaration order                                                      |
| Input rules                             | Local priority, then extension order, then declaration order                                                      |
| MIME codecs                             | Local codec priority, then extension order, then declaration order; exclusive overlapping claims fail             |
| HTML codec rules                        | Local rule priority, then extension order, then declaration order; equal-rank exclusive overlap fails             |

## Why this is materially better

This is not an aesthetic rename.

- Moving one plugin earlier cannot accidentally replace an API method or HTML
  decoder while fixing a keyboard conflict.
- Diagnostics, activation, contribution compilation, and cleanup share one
  truthful graph.
- Extension authors state requirements as dependencies, not magic numbers.
- Application authors use array order only for unrelated policy chains and
  configure owned singular resources directly.
- Rule authors retain precise local control where multiple matches are the
  actual domain.
- Invalid overlapping ownership fails during atomic compilation instead of
  depending on traversal direction.
- Removing priority sorts reduces compile work; no runtime dispatch machinery
  is added.

It is also stronger than every donor:

- unlike Wordgard, no global precedence band crosses fields, facets, commands,
  and keymaps;
- unlike Lexical, no command bucket becomes a second hidden graph;
- unlike ProseMirror, caller array order is a tie break rather than the only
  conflict model;
- unlike all three, Plate retains descriptor identity, atomic compilation,
  local codec/input compilers, terminal application configuration, React
  ownership, multi-root documents, and typed transaction commands.

## Hard deletions

### Plite

- `EditorExtension.priority`.
- The priority comparator in `getOrderedExtensionRecords`.
- Priority parameters/helpers such as `commandExtension(name, priority, ...)`.
- Tests whose asserted behavior is command/plugin global priority rather than
  dependency or source order.
- Any diagnostic distinction between first-install order and actual compiled
  contribution order.
- Silent last-write behavior for duplicate singular API/state/transaction
  methods.
- Reverse-list winner selection in clipboard/API compilation.

### Plate core

- `PluginBase.priority` and its JSDoc.
- `priority: 100` from `createBasePlugin`.
- Global priority in `.extend()`, `.configure()`, `toPlatePlugin`, root editor
  options, and corresponding type tests.
- The plugin-priority term in dependency ready-node sorting.
- `pluginPriority` from MIME and HTML compiled codec records/comparators.
- Shortcut and input-rule fallback to plugin priority.
- Priority-based component override arbitration.
- Priority-based weak peer patch arbitration.
- Synthetic `10_000` on the Plate root model extension.
- `priority: -100` as `OverridePlugin`'s fallback mechanism.
- Resolver tests that encode global-priority wins.
- Public docs that tell users to tune plugin priority.

### Feature packages and product code

- `priority: 10` on `BaseCodeBlockPlugin`'s mixed clipboard/command extension.
- `priority: 100` on `BaseListPlugin`'s mixed command/listener extension.
- Any package/plugin global priority discovered by the adoption manifest.
- Component override priority used only to select an application component.
- Redundant local priority that only copied a plugin's old global default.

Do not delete shortcut-, input-rule-, HTML-rule-, or MIME-codec-local priority.

## Adoption plan

### Plite owner

1. Land descriptor-owned dependencies or include them in this coherent break.
2. Replace first-install plus publication re-sorting with one compiled graph.
3. Publish the same `extensionOrder` in introspection records.
4. Route activation, cleanup, command, clipboard, listeners, schema, facets,
   state, transaction groups, and API compilation through origin-tagged
   contributions.
5. Add collision validation before publication.
6. Remove global priority and its tests in the same change.

### Plate core owner

1. Remove priority from public plugin types, defaults, configuration layers,
   root options, and descriptor conversion.
2. Preserve plugin source roles and dependency discovery, but use canonical
   source index as the only ready-node tie break.
3. Lower Plate dependencies to descriptor-owned Plite dependencies without a
   second ordering system.
4. Keep local priority only in shortcut, input-rule, MIME-codec, and HTML-rule
   compilers.
5. Replace component winner selection with owning-descriptor configuration.
6. Replace weak-patch priority wins with compile-time overlap errors and
   terminal target configuration.
7. Reject duplicate API/read/update leaves with owner-rich diagnostics.

### Feature/package owner

- Audit `BaseCodeBlockPlugin` command and clipboard traces independently. Put
  the descriptor in the required composition position; split contributions
  only if they truly have different owners, never just to preserve a number.
- Audit `BaseListPlugin` command and transaction-listener traces.
- Re-home `OverridePlugin` through canonical core plugin composition. Its
  command fallback behavior must not drag unrelated query, render, or codec
  contributions to the end.
- Remove the synthetic root rank; root model ownership is structural.
- Keep local rule priorities in code block, math, list, media, CSV, and other
  matching-rule packages after verifying each tie.

### Product/docs owner

- Migrate `apps/www/src/registry` kits to direct descriptor configuration and
  dependency/source order.
- Rewrite plugin, shortcut, component, input-rule, and codec docs as the final
  contract, without migration prose.
- Update examples to show dependencies, caller order, terminal component
  configuration, and capability-local priority.
- Regenerate barrels only if public export files change.

## Proof contract

### Type proof

- `priority` is rejected on Plite extensions, Plate plugins, `.extend()`,
  `.configure()`, `toPlatePlugin`, and root editor options.
- Descriptor dependencies preserve full editor/plugin inference.
- Shortcut, input-rule, HTML-rule, and MIME-codec local priority remains
  inferred and accepted.
- Duplicate singular API/read/update namespace leaves report both owners at
  compilation.
- Terminal target `.configure()` remains typed after weak contributions.

### Generated graph laws

Generate acyclic descriptor graphs, source orders, and contribution sets:

- every dependency precedes its dependent;
- unrelated roots preserve canonical source order;
- compiler traversal implementation does not change the result for identical
  root and dependency declarations;
- activation, introspection, and contribution origins report the same order;
- cleanup is exactly reverse activation for activated nodes;
- failed validation/configuration publishes no partial graph;
- replacement and transactional reconfiguration clean up only displaced
  descriptors and preserve unaffected order;
- missing, cyclic, conflicting, and duplicate singular owners fail with stable
  descriptor-rich diagnostics.

### Capability proof

- Commands, clipboard, and any retained explicit middleware produce exact
  source-order traces through `next`.
- Shortcut/input-rule winners depend on local priority, then extension order,
  then declaration order; changing an unrelated plugin cannot change the
  winner.
- MIME/HTML exclusive claim conflicts fail; disjoint/fallthrough rules retain
  stable order.
- Weak disjoint patches merge, identical overlap coalesces, conflicting overlap
  fails, and target terminal configuration wins.
- Wrapper nesting and decoration aggregation have explicit snapshot tests.
- Listener observation order is deterministic and no listener mutation is used
  as a hidden ordering dependency.

### Browser proof

Use package proof plus focused browser rows before broad closure:

- two plugins claiming the same keyboard shortcut;
- two input rules sharing a trigger;
- HTML/plain-text/VS Code/code-block paste fallback;
- configured component ownership and wrapper nesting;
- runtime transactional plugin reconfiguration;
- Chromium, Firefox, and WebKit for keyboard and paste rows;
- mobile viewport only where the changed shortcut/input route is exposed.

No raw-device claim is required: this packet does not alter native mobile input
semantics.

### Benchmark proof

This proposal makes no new runtime-performance claim. Guard against regression:

- compile 1,000 descriptors with sparse and dense dependency graphs;
- compile 10,000 shortcut/input/codec contributions;
- dispatch deep command and clipboard chains;
- compare allocations and wall time to the current compiler;
- require no material dispatch regression and no greater graph-compile
  complexity than `O(V + E)` plus local contribution sorting.

Removing global sorts should improve or preserve compilation. Do not add caches
or registries unless a benchmark proves they are necessary.

## Dependencies and execution order

1. **`best-api` gate:** freeze descriptor-owned dependency syntax, canonical
   source-order guarantee, local-priority vocabulary, singular conflict
   diagnostics, and weak-override conflict rules.
2. **`plite-plan` primary:** compile one graph, unify lifecycle/introspection
   order, add origin metadata and collision proof, then delete
   `EditorExtension.priority`.
3. **`plate-plan` dependent:** remove `PluginBase.priority`, lower dependencies,
   repair local compilers, components, weak overrides, packages, registry, and
   docs.
4. **Closure:** package/type/generated/browser/benchmark proof, public export
   audit, docs audit, and hard-deletion search.

This packet depends on descriptor-owned dependencies and is helped by the
accepted query-middleware hard cut. It does not depend on schema grammar,
property groups, persistence, collaboration, rendering, or DOM architecture.

## Rejected alternatives

- Keep the integer and improve documentation: impossible because the same
  sorted list has contradictory traversal directions.
- Rename integers to Wordgard-style bands: nicer spelling, same owner error.
- Add Lexical-style command buckets: duplicates descriptor order and weakens
  explicit continuation.
- Make raw plugin array order the entire model: ProseMirror's simpler hidden
  coupling is still hidden coupling.
- Add `before`/`after`: creates order-only edges with no capability contract.
- Encourage fake dependencies to force order: corrupts the dependency graph.
- Add per-capability plugin priorities: multiplies author machinery and still
  permits unrelated contributions to travel together.
- Preserve priority as an internal migration bridge: forbidden and
  unnecessary; adopt all callers in the same vertical change.

## Closure audit

Every donor mechanism relevant to this packet is accounted for:

- Wordgard global precedence bands: rejected.
- Wordgard local parser precedence: retained as the local-rule principle.
- Lexical dependency graph: adopted.
- Lexical command buckets: rejected.
- Lexical unordered transforms: rejected for deterministic Plite corrections.
- ProseMirror global plugin-array precedence: retained only as an unrelated-root
  tie break.
- ProseMirror local parse priority: retained.

Every current owner affected by global priority is listed: Plite graph,
lifecycle, commands, clipboard, queries, APIs, state/transaction groups,
listeners, schema contributions, Plate graph, weak overrides, components,
shortcuts, input rules, MIME/HTML codecs, render/decorate caches, feature
packages, registry, docs, type tests, package tests, browser proof, and
benchmarks.

**Decision-ready recommendation:** accept P1. Delete the global priority fields
from Plite and Plate in one dependency-ordered vertical migration. Keep only
capability-local competition. Add no replacement ordering DSL.
