---
'@udecode/plate-core': major
---

- Change `plugin.options` merging behavior from deep merge to shallow merge.
- This affects `.extend()`, `.configure()`, and other methods that modify plugin options.
- This is an **important patch** to v37 that introduced a performance regression when creating an editor.

Before:

```ts
const plugin = createSlatePlugin({
  key: 'test',
  options: { nested: { a: 1 } },
}).extend({
  options: { nested: { b: 1 } },
});

// Result: { nested: { a: 1, b: 1 } }
```

After:

```ts
const plugin = createSlatePlugin({
  key: 'test',
  options: { nested: { a: 1 } },
}).extend(({ getOptions }) => ({
  options: {
    ...getOptions(),
    nested: { ...getOptions().nested, b: 1 },
  },
}));

// Result: { nested: { a: 1, b: 1 } }
```

Migration:

- If you're using nested options and want to preserve the previous behavior, you need to manually spread both the top-level options and the nested objects.
- If you're not using nested options, no changes are required.
