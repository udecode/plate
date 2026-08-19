---
"@platejs/markdown": major
---

Resolve `withBlockId` through `ElementIdPlugin`. Serialization rejects the
option when persisted element identity is not installed, and deserialization
restores persisted IDs from block wrappers.

Export `MarkdownPluginState` as the complete mutable state contract for
`MarkdownPlugin`.

- Expose editor-bound conversion only through
  `editor.api.markdown.{deserialize,deserializeInline,serialize}`
- Remove the duplicate editor-bound `deserializeMd`, `deserializeInlineMd`,
  `serializeMd`, `serializeInlineMd`, and `buildRules` exports
- Return `EditorDocumentValue` from Markdown deserialization and accept the
  same document shape for serialization
- Preserve Markdown image alt text as the image `alt` property and the visible
  direct caption children; preserve rich MDX media content in those children
- Seed Markdown conversion and rule behavior through
  `MarkdownPlugin.initialState`
- Resolve feature codecs directly by their owning plugin name, without reverse
  name/type translation
- Name custom MDX element tags with each plugin's resolved application schema
  type; fixed MDAST, HTML, and MDX syntax remains literal
- Resolve every generated Plate paragraph through the installed application
  schema type; use the default `paragraph` identity only when no paragraph
  plugin is installed
- Key one-operation decode overrides by installed plugin capability name even
  when the application schema uses a different persisted element type
- Keep typed `audio`, `file`, and `video` rule keys in the canonical Markdown
  node-name union, and reject persisted-tag aliases after a codec claims a
  decode source
- Rename the public `PlateType` and `StrictPlateType` format-node unions to
  `MarkdownNodeName` and `StrictMarkdownNodeName`; remove the exported
  `mdastToPlate` and `plateToMdast` lookup helpers
- Use one `tableCell` Plate type for GFM table cells; header semantics stay on
  the cell's `header` property
- Round-trip `<sub>` and `<sup>` through one `script: 'sub' | 'sup'` text
  property
- Map structural ordered-list starts to forced `listRestart` boundaries and
  serialize active `listStart` or `listRestart` values as MDAST starts
- Remove `MarkdownPlugin.parser`, `DeserializeMdOptions.memoize`, and
  `DeserializeMdOptions.parser`
- Remove exported conversion internals: `customMdxDeserialize`,
  `getCustomMark`, `getDeserializerByKey`, `getMergedOptionsDeserialize`,
  `getMergedOptionsSerialize`, `getSerializerByKey`, `getStyleValue`,
  `markdownToSlateNodesSafely`, and `unreachable`
- Remove React peer and runtime dependencies from the base Markdown package

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
editor.api.markdown.serialize({ value: document });
```

Use `MarkdownNodeName` for custom rule filters. Persisted custom MDX tags must
match the configured application schema type before conversion.

Serialize semantic list fields and one parameterized heading model.
