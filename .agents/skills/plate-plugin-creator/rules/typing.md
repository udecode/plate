# Typing

## Inference First

Default to:

- `createSlatePlugin`
- `createPlatePlugin`

Step up to:

- `createTSlatePlugin`
- `createTPlatePlugin`

only when you need explicit `PluginConfig` control for exported options, API,
transforms, or selectors.

## Use Context, Not Threaded Editors

Plugin callbacks already receive rich context. Prefer:

- `editor`
- `plugin`
- `type`
- `api`
- `tf`
- `getOptions`
- `setOption`
- `setOptions`

Do not teach people to pass `SlateEditor` through callback signatures, helper
inputs, or public option callbacks when this context is already present.

## Keys Are Shared Contracts

For shipped/shared plugin surfaces, prefer `KEYS` from
`packages/utils/src/lib/plate-keys.ts`:

```ts
key: KEYS.blockSelection
targetPlugins: [KEYS.p]
editor.getType(KEYS.codeBlock)
```

This is the default for real package/plugin code because:

- cross-plugin references stay coherent
- renames have one owner
- tests and wrappers stop drifting on string literals

Use raw literals only when the plugin is tiny and truly local, or when you are
in a test fixture that is intentionally not modeling the shared contract.

## Avoid Bad Annotations

These are usually noise, not help:

```ts
extendTransforms(({ editor }: { editor: SlateEditor }) => ...)
targetPluginToInject: ({ editor }: { editor: SlateEditor }) => ...
```

If inference fails, prefer fixing the plugin config shape with `createT*` or a
real exported `PluginConfig` alias before spraying manual editor annotations.

## Choose The Right API Lane

- `extendApi` / `extendTransforms`
  Use when the surface semantically belongs to that plugin.
- `extendEditorApi` / `extendEditorTransforms`
  Use when you intentionally want merged editor convenience.

The distinction is real. Do not blur it because one version is shorter to type.

## When Explicit Types Are Worth It

Use explicit plugin config aliases when the plugin exports a meaningful contract
that callers should understand and TypeScript should preserve.

Good fits:

- `BaseCommentConfig`
- `CodeBlockConfig`
- `CopilotPluginConfig`

Also keep literal option types stable when they matter:

```ts
options: {
  trigger: '@' as const,
}
```

## Source Of Truth Hierarchy

When files disagree, trust them in this order:

1. `packages/core/src/lib/plugin/*`
2. `packages/core/src/react/plugin/*`
3. `packages/core/type-tests/*`
4. current plugin packages that still agree with 1-3
5. old package precedent
