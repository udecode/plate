---
"@platejs/markdown": major
---

- Move Markdown parsing and serialization from `SlateEditor` to `BaseEditor`
- Return immutable Markdown slices and fit them through the compiled editor schema
- Configure parser, serializer, and rule behavior through
  `MarkdownPlugin.options`
- Keep deserialization state local to each call and hard-cut the public parser/memoization escape hatch

**Migration:** Pass a v54 Plate editor to exported Markdown helpers, install
`MarkdownPlugin` for editor host-codec parsing and serialization, configure
Markdown behavior through `options`, and use the editor-level Markdown API:

```tsx
MarkdownPlugin.configure({
  options: {
    remarkPlugins: [remarkGfm],
  },
});

editor.api.markdown.serialize();
editor.api.markdown.deserialize(markdown);
```
