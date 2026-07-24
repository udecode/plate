---
"@platejs/markdown": major
---

- Accept `BaseEditor` in exported Markdown helpers
- Return `EditorDocumentValue` from Markdown deserialization and accept the
  same document shape for serialization
- Preserve image alt text and rich MDX media children in caption content roots
- Configure parser, serializer, and rule behavior through `MarkdownPlugin.options`
- Remove the public parser and memoization escape hatch

**Migration:** Install `MarkdownPlugin`, configure Markdown behavior through
`options`, and keep `children` and `roots` together when reading, replacing, or
serializing a document:

```tsx
MarkdownPlugin.configure({
  options: {
    remarkPlugins: [remarkGfm],
  },
});

const document = editor.api.markdown.deserialize(markdown);

editor.update.value.replace(document);
editor.api.markdown.serialize({ value: document });
```
