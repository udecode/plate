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
  .extend(({ plugin }) => ({
    update: ({ tx }) => ({
      insertFooPair: (firstId: string, secondId: string) => {
        tx[plugin.name].insertFoo(firstId);
        tx[plugin.name].insertFoo(secondId);
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

Inside a later tx stage, call an earlier tx method through the active
`tx[plugin.name]` group. Do not use `editor.plugin(...).update`,
`context.update`, or another one-shot update there; it would open a nested
transaction.

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
const codeBlockType = editor.plugin(PLUGINS.codeBlock).type;
const boldKey = editor.plugin(PLUGINS.bold).key;
tx.nodes.insert({ type: codeBlockType, children: [{ text: '' }] });
tx.nodes.set({ [boldKey]: true });
```

There are no grouped heading aliases: spell out `PLUGINS.h1` through
`PLUGINS.h6` where a group is actually needed, and list those items directly
instead of spreading a literal array. Function and property names must
keep roles honest: use `plugin` for an exact descriptor-or-string lookup input
and `name` after runtime normalization for capability work. Element `type` and
property `key` default to the plugin name when omitted, but they are independent
immutable contracts. Exact portals expose only the schema identity they own;
behavior plugins expose neither. Copied registry data and deliberate fixtures
use explicit persisted literals, never `PLUGINS` as a storage catalog.

Raw literals are for genuinely local/internal plugins and deliberate test
fixtures.

Use `editor.plugin(plugin)` whenever a descriptor is available so the portal
keeps exact capabilities. A genuine runtime string uses the same `plugin`
parameter and returns an erased portal whose `installed` field is the sole
non-throwing capability-availability check. When uninstalled, its `.type` and
`.key` preserve an exact descriptor's authored/default identity or use a
runtime string as the conventional identity; read them directly instead of
adding an `installed` fallback. Other missing portal fields throw. Never pass `{ name }`
as a public lookup input.

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
