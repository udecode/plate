# Typing

The builders in `packages/core/src/lib/plugin` and `packages/core/src/react/plugin`
and their type tests hold the inference and public-contract law. This
reference keeps the authoring patterns that apply it.

## Contents

- Builder inference
- Owner context
- Type-owner repair
- Public contracts and plugin exports
- Locals, tests, names, and literals
- Source hierarchy

## Builder Inference First

Default to inferred plugin chains, and keep every inference stage in the
direct exported chain:

```ts
export const BaseFooPlugin = createSlatePlugin({
  key: 'foo',
  options: { focused: false, label: 'Foo' },
})
  .extendApi(({ getOption }) => ({
    createText: () => getOption('label'),
  }))
  .extendTransforms(({ api, editor }) => ({
    insert: () => editor.tf.insertText(api.foo.createText()),
  }));
```

Never create `fooSchemaPlugin` or `FooPluginBase` merely so the next line can
extend it or so a type query can name it. Audit references rather than names.

## Context, Not Ferry Types

Plugin callbacks already expose the typed owner context: `editor`, `plugin`,
`type`, `api`, `tf`, `getOption`, `getOptions`, `setOption` and `setOptions`.
Use those current-owner values directly:

```ts
BaseFooPlugin.extendTransforms(({ getOption, setOption, tf }) => ({
  focus: () => {
    if (getOption('focused')) return;

    setOption('focused', true);
    tf.focus();
  },
}));
```

Do not rediscover the current owner through `editor.getApi(BaseFooPlugin)`,
`editor.getOptions(BaseFooPlugin)` or `editor.getType(...)` inside its own
callbacks. Keep `editor` for editor-wide work or another plugin.

Apply this only where the callback contract supplies owner context. Shortcut,
render-prop and similar specialized callbacks may only expose `editor`; an
exact typed lookup is correct there. Do not split or wrap a coherent
declaration solely to capture a shortcut, and do not mistake an editor-wide
API such as `editor.api.dom` for the plugin-scoped `api`.

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

- exported options/API/transforms/selectors contracts that callers consume;
- a recursive type;
- a contract reused by multiple independent owners;
- a deliberate external boundary or adapter;
- an otherwise uninferrable local such as an empty array or deliberate
  narrowing/widening.

For a real API or transform contract, type the builder's return:

```ts
type FooApi = {
  childCount: () => number;
};

export const BaseFooPlugin = createSlatePlugin({ key: 'foo' }).extendApi(
  ({ editor }): FooApi => ({
    childCount: () => editor.children.length,
  })
);
```

Omit the annotation when the full contract can be inferred.

## Plugin Export Law

The exported plugin value must infer from its builder chain. Never annotate or cast that result merely to preserve a desired type. If the
chain widens, loses dependencies, or drops API or transform capability, repair the owning
builder generic and add a Plate foundation compile-only inference test.

## Locals, Tests, And Examples

Do not annotate locals whose initializer should infer:

```ts
// Bad
const options: FooConfig['options'] = editor.getOptions(FooPlugin);

// Good
const options = editor.getOptions(FooPlugin);
```

## Source Hierarchy

When code disagrees, trust:

1. `packages/core/src/lib/plugin/*`;
2. `packages/core/src/react/plugin/*`;
3. `packages/core/type-tests/*`;
4. current packages that agree with those owners;
5. old package precedent.
