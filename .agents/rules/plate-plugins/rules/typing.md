# Typing

`docs/vision/plate.md` (Plugin and component doctrine) and `docs/vision/plite.md`
(Plite API Direction) hold the inference and public-contract law. This
reference keeps the authoring patterns that apply it.

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

Default to inferred plugin chains, and keep every inference stage in the
direct exported chain:

```ts
export const BaseFooPlugin = definePlugin(PLUGINS.foo, {
  api: () => ({ createText: () => 'Foo' }),
}).extend(({ api }) => ({
  update: ({ tx }) => ({
    insert: () => tx.text.insert(api.createText()),
  }),
}));
```

Never create `fooSchemaPlugin` or `FooPluginBase` merely so the next line can
extend it or so a type query can name it. Audit references rather than names.
A generic plugin factory constrained to a required element or mark schema must
infer a required flat `schema.type` or `schema.key`. If that handle becomes
optional merely because `name` is generic, fix `PluginAuthorSchemaView`; do not
assert, guard, cast, or copy the identity in the package.

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
- `defineFormats`
- active `tx` where the callback is transaction-backed

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
an editor-wide plugin such as `editor.api.dom` for the plugin-scoped `api`.

## Format Mappings

If a claiming mapping returns `undefined`, dispatch declines to the next mapping
on that selector; no per-operation override exists. A plugin whose schema
declares a `mark` maps a mark with no flag: declare `{ node: 'strong' }`,
`{ tag: 'kbd' }`, `{ tag: 'sub', value: 'sub' }` or
`{ tag: 'span', style: 'color' }`. A custom mark `decode` returns the mark
value, not decoded children; `wrap` returns a childless wrapper, and mark
mappings take no `priority`. Foreign target mappings do not own configurable
custom tag identity.

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
- casts or `as any`;
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
  setCollapsed: (collapsed: boolean) => void;
};

export const BaseFooPlugin = definePlugin(PLUGINS.foo, {
  read: ({ state }): FooRead => ({
    getChildCount: () => state.children().length,
  }),
  update: ({ tx }): FooTx => ({
    setCollapsed: (collapsed) => {
      // `collapsed` and `tx` are contextual
    },
  }),
});
```

The `update` contract describes the command object returned by
`update({ tx })`, not the factory function. Omit it when the full contract can
be inferred.

## Plugin Export Law

The exported plugin value must infer from its builder chain. Never annotate or cast that result merely to preserve a desired type. If the
chain widens, loses dependencies, or drops API/tx capability, repair the owning
builder generic and add a Plate foundation compile-only inference test.

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

## Source Hierarchy

When code disagrees, trust:

1. `packages/platejs/src/lib/plugin/*`;
2. `packages/platejs/src/react/plugin/*`;
3. `packages/platejs/type-tests/*`;
4. current packages that agree with those owners;
5. old package precedent.
