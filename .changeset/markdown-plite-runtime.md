---
"@platejs/markdown": major
---

- Accept `BaseEditor` in exported Markdown helpers
- Return `EditorDocumentValue` from Markdown deserialization and accept the
  same document shape for serialization
- Preserve Markdown image alt text as the image `alt` property and the visible
  direct caption children; preserve rich MDX media content in those children
- Seed Markdown conversion and rule behavior through
  `MarkdownPlugin.initialState`
- Round-trip `<sub>` and `<sup>` through one `script: 'sub' | 'sup'` text
  property
- Remove `MarkdownPlugin.parser`, `DeserializeMdOptions.memoize`, and
  `DeserializeMdOptions.parser`

**Migration:** Install `MarkdownPlugin`, configure Markdown behavior through
`initialState`, and use the root Markdown API when reading, replacing, or
serializing a document:

```tsx
MarkdownPlugin.configure({
  initialState: {
    remarkPlugins: [remarkGfm],
  },
});

const document = editor.api.markdown.deserialize(markdown);

editor.update.value.replace(document);
editor.read.markdown.serialize({ value: document });
```
