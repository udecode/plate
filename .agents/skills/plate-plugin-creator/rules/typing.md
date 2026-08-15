# Typing

## Contents

- Builder inference
- Capability boundaries
- Owner context
- Staged capabilities
- Type-owner repair
- Public contracts and plugin exports
- Locals, tests, names, and literals
- Source hierarchy

## Builder Inference First

Default to inferred plugin chains:

```ts
export const BaseFooPlugin = defineBasePlugin(PLUGINS.foo, {
  api: ({ editor, store }) => ({
    // inferred
  }),
  initialState: {
    enabled: true,
  },
  update: ({ tx }) => ({
    // inferred
  }),
});
```

Do not pass caller-supplied generics to the plugin factory. When initial state,
API, read, update, or selectors need a real exported contract, type that
capability's return boundary and let the factory infer the complete definition.

Do not create:

```ts
type FooConfig = PluginConfig<"foo">;

export const BaseFooPlugin: BasePlugin<FooConfig> =
  defineBasePlugin<FooConfig>(PLUGINS.foo, {});
```

An empty config alias and an annotated plugin export both hide whether the
builder inferred correctly.

Keep every inference stage in the direct exported chain:

```ts
export const BaseFooPlugin = defineBasePlugin(PLUGINS.foo, {
  api: () => ({ createText: () => 'Foo' }),
}).extend(({ api }) => ({
  update: ({ tx }) => ({
    insert: () => tx.text.insert(api.createText()),
  }),
}));
```

Never create `fooSchemaPlugin` or `FooPluginBase` merely so the next line can
extend it or so a type query can name it. Audit references rather than names.
When a later capability needs the schema-derived shape, keep the chain direct
and use an honest stage:

```ts
type InsertFooOptionsFor<T extends Element> = NodeInsertNodesOptions<T>;

export const BaseFooPlugin = defineBasePlugin('foo', {
  schema: { element: schema.element.textBlock() },
}).extend(({ plugin, schema: { type } }) => {
  type Foo = ElementOf<typeof plugin>;

  return {
    update: ({ tx }) => ({
      insert: (options?: InsertFooOptionsFor<Foo>) => {
        tx.nodes.insert({ children: [{ text: '' }], type }, options);
      },
    }),
  };
});

export type FooElement = ElementOf<typeof BaseFooPlugin>;
export type InsertFooOptions = InsertFooOptionsFor<FooElement>;
```

The helper generic stays private, the public aliases derive from the final
descriptor, and the node option never widens to `Element`, `Node`, or an
omitted generic. When final-plugin declaration emit still recurses, type only
the smallest private domain or hook-stage boundary and keep the exported plugin
inferred.

Never give a recursive owner a package-private structural AST mirror. A known
element owner uses `ElementOf<typeof FinalPlugin>`. A property capability uses
`ElementWith<typeof Plugin, RequiredLocalIds>` or `TextWith`; aliases, prefixes,
defaults, and value domains stay descriptor-derived. An algorithm that accepts
malformed or open-world input uses broad `Element` / `Text` and narrows every
consumed property at runtime. Fix remaining declaration recursion in Core or at
the declaration boundary.

A generic plugin factory constrained to a required element or mark schema must
infer a required flat `schema.type` or `schema.key`. If that handle becomes
optional merely because `name` is generic, fix `PluginAuthorSchemaView`; do not
assert, guard, cast, or copy the identity in the package.

A factory bound to a plugin may infer the exact installed-plugin editor inside
its author callback. Its public factory and emitted value must still project to
the smallest portable public type. If declaration emit names
`InternalBaseEditorWithInstalledPlugins`, repair the Core return boundary.
Never publish a package-local `BaseEditor<typeof Plugin>` alias, reconstructed
factory options/rule interface, annotation, or cast to hide that leak.

TS7056 never earns a package-local declaration bridge. Preserve the direct
inferred export, compact the honest dependency source, and route any remaining
failure to the owning Core generic or declaration boundary. Do not add
`@plate-plugin-declaration-stage`, a private definition carrier, an annotated
staging alias, a widened dependency, a cast, or a public subset type. Existing
marked stages are transitional debt with a direct-build deletion gate and block
current-doctrine package attestation until removed.

## Capability Boundaries

Use the canonical protocol from `plate-plugin-creator`:

| Field          | Typed job                                                                    |
| -------------- | ---------------------------------------------------------------------------- |
| `initialState` | descriptor defaults for mutable editor-local state                           |
| `store`        | live state reads, writes, subscriptions, and named selector evaluation       |
| `selectors`    | pure projections of readonly store state plus domain arguments               |
| `api`          | stable plugin services not bound to a supplied document snapshot or active tx |
| `read`         | pure, replayable queries over the supplied document state                    |
| `update`       | document reads and writes through the active transaction                     |
| native fields  | flat Plite capabilities such as `commands`, `on`, and `readMiddleware`         |
| `codecs`       | format declarations                                                           |

The published `api` object is immutable; that does not make every API method
pure. Document queries still belong in `read`, pure store projections belong in
`selectors`, and document mutations belong in `update`.

## Context, Not Ferry Types

Plugin callbacks already expose the typed owner context:

- `editor`
- `plugin`
- `name`
- `installed`
- `api`
- `read`
- `update`
- `store`
- `defineCodecs`
- active `tx` where the callback is transaction-backed

Keep one-owner behavior inline and capture those values. Do not move a callback
into another file by inventing context/descriptor ferry types or threading
`BaseEditor`, resolved plugin name, store state, and `tx` through helper
signatures.

Use those current-owner values directly:

```ts
BaseFooPlugin.extend(({ api, name, read, store, update }) => ({
  on: {
    focus: () => {
      if (!read.isActive()) return;

      store.set({ focused: true });
      api.notify(name);
      update.refresh();
    },
  },
}));
```

Do not rediscover the current owner through `editor.plugin(...)`, current-name
root API/read/update groups, standalone plugin lookup helpers, or
`editor.plugin(...).name`. Keep `editor` for editor-wide substrate, another plugin,
or transaction metadata unavailable on scoped `update`. Inside an active
transaction, use `tx`.

Apply this only where the callback contract supplies owner context. Shortcut,
input-rule, state-value, render-prop, and similar specialized callbacks may
only expose `editor`; an exact typed portal is correct there. Do not split or
wrap a coherent declaration solely to capture a shortcut, and do not mistake
an editor-wide extension such as `editor.api.dom` for the plugin-scoped `api`.

`defineCodecs` is the one inline inference anchor for codec maps:

```ts
export const BaseFooPlugin = defineBasePlugin(PLUGINS.foo, {
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => true,
        decodeOnly: true,
        match: [{ tag: 'strong' }],
      },
    }),  schema: { mark: property.boolean() },
});
```

Use `defineCodecs(map)` for self/product codecs and
`defineCodecs(TargetPlugin, map)` for foreign codecs. The foreign overload
injects `TargetPlugin`; do not add `target` to the rule. Keep the map
MIME-keyed. Its `'text/html'` value is one schema-aware rule or a non-empty
ordered tuple. Direct `codecs: { ... }`, casts, and callback annotations bypass
the owner inference and are invalid.

A custom Plate-owned MDX element codec binds its final schema identity once:

```ts
codecs: ({ defineCodecs, schema: { type } }) =>
  defineCodecs({
    'text/markdown': {
      from: type,
      kind: 'node',
      decode: ({ node }) => ({ children: node.children, type }),
      encode: ({ node }) => ({
        attributes: [],
        children: node.children,
        name: type,
        type: 'mdxJsxFlowElement',
      }),
    },
  })
```

Use the resolved `type` for `from`, the decoded element, and the encoded MDX
tag. Fixed external format names remain literal. Do not use the capability
name, an authored default type, or a compatibility alias for persisted tags.
Structural Plate wrappers and unknown-node fallbacks also resolve their
installed schema type; only external format nodes keep literal identities.
Operation decode overrides use the plugin capability name after codec-owner
resolution; encode overrides use the persisted schema type or key.
If a compiled owner claims the decode source and returns `undefined`, do not
fall through to a persisted-type override alias. Foreign target codecs do not
own configurable custom MDX identity.
Decode-only codecs still prove `from` and decoded identity; encode-only codecs
still prove the emitted tag. Phrasing-only wrappers decode source phrasing
children directly because decoded wrapper elements are not identity witnesses.
A fixed external source never licenses a literal decoded Plate type. Parsed
attributes precede structural fields so they cannot replace `children` or the
resolved schema type.

Plate constructors and justified `.extend()` stages contextually type flat
Plite-native fields:

```ts
defineBasePlugin('foo', {
  commands: ({ handle, store }) => [
    // store and nested callbacks remain inferred
  ],});
```

Keep Plate-context capture inside the authoring callback and extract domain
inputs. A public identity helper that only recovers this nested type is leaked
compiler machinery: fix the owning generic instead of adding an annotation,
cast, `any`, alias, or replacement helper. Independently reusable standalone
descriptors use Plite's `defineExtension`; their factories receive domain
inputs, not Plate plugin context.

## Stage Capabilities, Not Plumbing

A plugin chain is a typed capability dependency graph. Put a reusable
plugin-owned capability in an earlier builder stage, then consume the
accumulated inferred surface from later stages:

```ts
export const BaseFooPlugin = defineBasePlugin(PLUGINS.foo, {
  initialState: {
    labels: [{ id: 'alpha', value: 'Alpha' }],
  },
  selectors: {
    getLabel: (state, id: string) =>
      state.labels.find((label) => label.id === id)?.value,
  },
})
  .extend(({ store, type }) => ({
    update: ({ tx }) => ({
      insertFoo: (id: string) => {
        const label = store.get('getLabel', id);

        if (!label) return;

        tx.nodes.insert({
          children: [{ text: label }],
          type,
        });
      },
    }),
  }))
  .extend(() => ({
    update: ({ tx }) => ({
      insertFooPair: (firstId: string, secondId: string) => {
        tx.plugin(BaseFooPlugin).insertFoo(firstId);
        tx.plugin(BaseFooPlugin).insertFoo(secondId);
      },
    }),
  }));

export const FooConsumerPlugin = defineBasePlugin('fooConsumer', {
  api: ({ editor }) => ({
    hasLabel: (id: string) =>
      editor.plugin(BaseFooPlugin).store.get('getLabel', id) !== undefined,
  }),  dependencies: [BaseFooPlugin],
});
```

Keep independent contributions together in the constructor. Repeated
`.extend()` calls are correct only when their order expresses a real capability
dependency. They preserve local inference and make the accumulated capability
visible to required dependents.

Repeated fields do not all share one merge law. `api`, `read`, and `update`
accumulate inferred object capabilities across honest stages. Replacement
declarations such as the `commands` array must have one ordered owner factory
unless a later stage intentionally replaces the complete earlier declaration.
Do not treat `.extend()` as array concatenation.

The first `.extend()` is justified because its update consumes the selector
type introduced by the constructor. The second is justified because it reuses
the first update through the active transaction. Stage only honest capabilities
that consumers or later stages should discover; do not publish private
implementation fragments merely to move them between callbacks.

Inside a later tx stage, call an earlier tx method through
`tx.plugin(Plugin)`. Generated closed editors may use the direct
`tx.pluginName` group. Do not use computed `tx[plugin.name]`,
`tx.extension(...)`, `editor.plugin(...).update`, `context.update`, or another
one-shot update there; those either erase descriptor typing or open a nested
transaction. Raw Plite keeps direct named transaction groups and has no
descriptor portal.

New methods should accept domain inputs such as `value`, `entry`, `at`, or
operation options. Do not invent function parameters for `editor`, `api`,
`read`, `tx`, `store`, resolved plugin state values, or resolved name
when the builder context can capture or stage them.

Keep an explicit state/read-view parameter only at an honest composition
boundary where the same query must observe an uncommitted transaction snapshot.
Prove that boundary with an active-transaction test; never replace it with
stale `editor.read` merely to remove a parameter.

Do not add:

```ts
.extend(({ editor }: { editor: BaseEditor }) => ({
  update: ({ tx }) => ({ ... }),
}))
targetParserToInject: ({ editor }: { editor: BaseEditor }) => ...
const plugin: BasePlugin<FooDefinition> = defineBasePlugin(...)
const plugin = defineBasePlugin(...) as BasePlugin<FooDefinition>
```

## Repair The Type Owner

If inference fails:

1. Identify the builder, source API, test-utils, or external boundary that owns
   the missing type.
2. Repair its generic/contextual signature.
3. Keep the call site inline and inferred.

Do not “fix” inference with:

- a decorative `PluginConfig` alias;
- explicit callback parameter annotations;
- local variable annotations that repeat the initializer;
- `Parameters<typeof fn>` plumbing;
- casts or `as any`;
- `satisfies` on a builder result;
- local fixture-shape aliases in tests;
- an editor-locked helper extraction.

## Real Public Contracts

An explicit type is justified for:

- exported initial-state/API/read/update/selectors contracts that callers
  consume;
- a recursive type;
- a contract reused by multiple independent owners;
- a deliberate external boundary or adapter;
- an otherwise uninferrable local such as an empty array or deliberate
  narrowing/widening.

For a real read or update contract, type the builder:

```ts
type FooRead = {
  getChildCount: () => number;
};

type FooTx = {
  insertFoo: (options: InsertFooOptions) => void;
};

export const BaseFooPlugin = defineBasePlugin(PLUGINS.foo, {
  read: ({ state }): FooRead => ({
    getChildCount: () => state.children().length,
  }),  update: ({ tx }): FooTx => ({
    insertFoo: (options) => {
      // `options` and `tx` are contextual
    },
  }),
});
```

The `update` contract describes the command object returned by
`update({ tx })`, not the factory function. Omit it when the full contract can
be inferred.

## Plugin Export Law

The exported plugin value must infer from:

- `defineBasePlugin(...)`;
- `definePlatePlugin(...)`;
- `toPlatePlugin(...)`;
- chained `.extend()` calls.

Never annotate or cast that result merely to preserve a desired type. If the
chain widens, loses dependencies, or drops API/tx capability, repair the owning
builder generic and add a Core compile-only inference test.

## Locals, Tests, And Examples

Do not annotate locals whose initializer should infer:

```ts
// Bad
const entries: NodeEntry<FooElement>[] = editor
  .plugin(FooPlugin)
  .read.getEntries();

// Good
const entries = editor.plugin(FooPlugin).read.getEntries();
```

The same law applies to tests and examples:

- keep inline editor/plugin construction;
- do not extract `plugins`, `initialState`, or wrapper factories to placate
  types;
- do not define local `{ children; selection }` fixture aliases;
- use source-owned test-utils types when an explicit boundary is unavoidable;
- repair source typing when inline setup fails.

## Capability And Schema Identity

Use the shared flat `PLUGINS` catalog only for first-party capability identity.
Resolve persisted identity from the schema-owning context or portal:

```ts
defineBasePlugin(PLUGINS.paragraph, {
  schema: { element: schema.element.textBlock() },
});
targetPlugins: [PLUGINS.paragraph];
const codeBlockType = editor.plugin(CodeBlockPlugin).schema.type;
const boldKey = editor.plugin(BoldPlugin).schema.key;
tx.nodes.insert({ type: codeBlockType, children: [{ text: '' }] });
editor.plugin(BoldPlugin).update.set(true);
```

There are no grouped heading aliases: spell out `PLUGINS.h1` through
`PLUGINS.h6` where a group is actually needed, and list those items directly
instead of spreading a literal array. Function and property names must
keep roles honest: use `plugin` for an exact descriptor-or-string lookup input
and `name` after runtime normalization for capability work. Exact element and
primary-mark portals expose `schema.type` and `schema.key`; behavior and
aggregate-property portals omit `schema`. Additional property handles exist
only in author callbacks and compiler internals. Never expose or index
`schema.properties` from a consumer portal. Copied registry data and
deliberate fixtures use explicit persisted literals, never `PLUGINS` as a
storage catalog.

Raw literals are for genuinely local/internal plugins and deliberate test
fixtures.

Use `editor.plugin(plugin)` whenever a descriptor is available so the portal
keeps exact capabilities. A genuine runtime string uses the same `plugin`
parameter and returns an erased portal whose `installed` field is the sole
non-throwing capability-availability check. An uninstalled plugin has no final
application schema handle; do not invent one from its name. Other missing
portal fields throw. Never pass `{ name }` as a public lookup input.

Preserve meaningful literal state types at the state owner:

```ts
initialState: {
  trigger: '@' as const,
}
```

Do not create a separate type solely to ferry the literal elsewhere.

## `any`

Forbid `any` in production source. A deliberate, local non-type test escape is
the only exception. Do not use `any`, `unknown` casts, or structural guards to
hide a missing typed Plite/Plate API.

## Source Hierarchy

When code disagrees, trust:

1. `packages/core/src/lib/plugin/*`;
2. `packages/core/src/react/plugin/*`;
3. `packages/core/type-tests/*`;
4. current packages that agree with those owners;
5. old package precedent.
