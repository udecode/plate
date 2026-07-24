# Typing

## Contents

- Builder inference
- Owner context
- Staged capabilities
- Type-owner repair
- Public contracts and plugin exports
- Locals, tests, keys, and literals
- Source hierarchy

## Builder Inference First

Default to inferred plugin chains:

```ts
export const BaseFooPlugin = createBasePlugin({
  key: KEYS.foo,
})
  .extendApi(({ editor, getOptions }) => ({
    // inferred
  }))
  .extendTx(({ editor, getOptions }) => (tx) => ({
    // inferred
  }));
```

Pass an explicit config generic only when exported options, API, tx, selectors,
or state define a real public contract.

Do not create:

```ts
type FooConfig = PluginConfig<"foo">;

export const BaseFooPlugin: BasePlugin<FooConfig> = createBasePlugin<FooConfig>(
  { key: KEYS.foo }
);
```

An empty config alias and an annotated plugin export both hide whether the
builder inferred correctly.

## Context, Not Ferry Types

Plugin callbacks already expose the typed owner context:

- `editor`
- `plugin`
- `type`
- `api`
- `update`
- `getOptions`
- `getOption`
- `setOption`
- `setOptions`
- active `tx` where the callback is transaction-backed

Keep one-owner behavior inline and capture those values. Do not move a callback
into another file by inventing context/config/extension ferry types or threading
`BaseEditor`, resolved plugin type, options, and `tx` through helper signatures.

## Stage Capabilities, Not Plumbing

A plugin chain is a typed capability dependency graph. Put a reusable
plugin-owned capability in an earlier builder stage, then consume the
accumulated inferred surface from later stages:

```ts
export const BaseFooPlugin = createBasePlugin({
  key: KEYS.foo,
  options: {
    labels: [{ id: "alpha", value: "Alpha" }],
  },
})
  .extendApi(({ getOptions }) => ({
    getLabel: (id: string) =>
      getOptions().labels.find((label) => label.id === id)?.value,
  }))
  .extendTx(({ api }) => (tx) => ({
    insertFoo: (id: string) => {
      const label = api.getLabel(id);

      if (!label) return;

      tx.nodes.insert({
        children: [{ text: label }],
        type: KEYS.foo,
      });
    },
  }))
  .extendTx(({ plugin }) => (tx) => ({
    insertFooPair: (firstId: string, secondId: string) => {
      tx[plugin.key].insertFoo(firstId);
      tx[plugin.key].insertFoo(secondId);
    },
  }));

export const FooConsumerPlugin = createBasePlugin({
  key: "fooConsumer",
  dependencies: [BaseFooPlugin],
}).extendApi(({ editor }) => ({
  hasLabel: (id: string) => editor.api.foo.getLabel(id) !== undefined,
}));
```

Repeated `.extendApi()` / `.extendTx()` calls are correct when their order
expresses a real capability dependency. They preserve local inference and make
the accumulated capability visible to required dependents.

Stage only an honest scoped capability such as the dependent-facing `getLabel`
query above. Do not publish a private implementation fragment merely to share
it across builder stages. Keep one-use machinery lexical; keep a shared pure
domain algorithm private; coalesce stages or name a builder gap when private
runtime context would otherwise require plumbing.

Inside a later tx stage, call an earlier tx method through the active
`tx[plugin.key]` group. Do not use `editor.plugin(...).update`,
`context.update`, or another one-shot update there; it would open a nested
transaction.

New methods should accept domain inputs such as `value`, `entry`, `at`, or
operation options. Do not invent function parameters for `editor`, `api`,
`read`, `tx`, `getOptions`, resolved plugin option values, or resolved type
when the builder context can capture or stage them.

Keep an explicit state/read-view parameter only at an honest composition
boundary where the same query must observe an uncommitted transaction snapshot.
Prove that boundary with an active-transaction test; never replace it with
stale `editor.read` merely to remove a parameter.

Do not add:

```ts
extendTx(({ editor }: { editor: BaseEditor }) => (tx) => ...)
targetParserToInject: ({ editor }: { editor: BaseEditor }) => ...
const plugin: BasePlugin<FooConfig> = createBasePlugin(...)
const plugin = createBasePlugin(...) as BasePlugin<FooConfig>
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

- exported options/API/tx/selectors/state that callers consume;
- a recursive type;
- a contract reused by multiple independent owners;
- a deliberate external boundary or adapter;
- an otherwise uninferrable local such as an empty array or deliberate
  narrowing/widening.

For a real API or transaction contract, type the builder:

```ts
type FooApi = {
  getValue: () => string;
};

type FooTx = {
  insertFoo: (options: InsertFooOptions) => void;
};

export const BaseFooPlugin = createBasePlugin({
  key: KEYS.foo,
})
  .extendApi<FooApi>(({ editor }) => ({
    getValue: () => editor.read.string(),
  }))
  .extendTx<FooTx>(({ editor }) => (tx) => ({
    insertFoo: (options) => {
      // `options` and `tx` are contextual
    },
  }));
```

The `extendTx` generic is the returned command object, not the factory function.
Omit the generic when the full contract can be inferred.

## Plugin Export Law

The exported plugin value must infer from:

- `createBasePlugin(...)`;
- `createPlatePlugin(...)`;
- `toPlatePlugin(...)`;
- chained `.extend*` calls.

Never annotate or cast that result merely to preserve a desired type. If the
chain widens, loses dependencies, or drops API/tx capability, repair the owning
builder generic and add a Core compile-only inference test.

## Locals, Tests, And Examples

Do not annotate locals whose initializer should infer:

```ts
// Bad
const entries: NodeEntry<FooElement>[] = editor
  .plugin(FooPlugin)
  .api.getEntries();

// Good
const entries = editor.plugin(FooPlugin).api.getEntries();
```

The same law applies to tests and examples:

- keep inline editor/plugin construction;
- do not extract `plugins`, `options`, or wrapper factories to placate types;
- do not define local `{ children; selection }` fixture aliases;
- use source-owned test-utils types when an explicit boundary is unavoidable;
- repair source typing when inline setup fails.

## Keys And Literal Options

Use shared `KEYS` for shipped plugins and cross-plugin contracts:

```ts
key: KEYS.blockSelection;
targetPluginKeys: [KEYS.p];
editor.getType(KEYS.codeBlock);
```

Raw literals are for genuinely local/internal plugins and deliberate test
fixtures.

Preserve meaningful literal option types at the option owner:

```ts
options: {
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
