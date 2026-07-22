---
"@platejs/markdown": major
---

- Move Markdown parsing and serialization from `SlateEditor` to `BaseEditor`
- Return immutable Markdown slices and fit them through the compiled editor schema
- Bind parser, serializer, and rule settings through versioned immutable `defineMarkdownConfig` policies
- Keep deserialization state local to each call and hard-cut the public parser/memoization escape hatch

**Migration:** Pass a v54 Plate editor to exported Markdown helpers, install
`MarkdownPlugin` for editor host-codec parsing and serialization, and move
Markdown settings from mutable options into an immutable policy:

```tsx
MarkdownPlugin.configure({
  config: defineMarkdownConfig({
    id: 'app:markdown',
    version: 1,
    remarkPlugins: [remarkGfm],
  }),
});
```
