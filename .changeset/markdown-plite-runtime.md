---
'platejs': major
---

Read Markdown as CommonMark (with GFM, math and emoji through `remarkPlugins`) plus Plate's registered tags, and return every conversion as a result with structured diagnostics. Any string parses: text such as `Array<string>`, `{name}` or `<https://example.com>` stays ordinary Markdown, and unknown HTML stays literal text with a lossless warning.

- Convert through `editor.api.markdown.{parse,parseSlice,parseInline,serialize}` and the standalone `parseMarkdown` and `serializeMarkdown`; remove `deserializeMd`, `deserializeInlineMd`, `serializeMd`, `serializeInlineMd` and `buildRules`
- Write Plate elements and marks as registered tags such as `<callout icon="💡">Tip</callout>`, `<u>`, `<kbd>` and `<span style="color: red;">`; block tags are separated by blank lines and never indented, and output from earlier versions still reads
- Remove `remarkMdx`; Plate tags need no remark plugin, and full MDX source is not supported
- Remove `remarkMention` and `MentionNode`; mentions read and write as `[label](mention:ref)` links, and bare `@name` stays text
- Remove `allowedNodes`, `disallowedNodes`, `allowNode`, `splitLineBreaks`, `withoutMdx`, per-call `remarkPlugins` and per-call `rules`; configure `remarkPlugins` on `MarkdownPlugin`
- Pass `partial: true` when parsing an unfinished stream, such as a streaming AI answer; the final parse stays strict
- Pass the previous `parseSlice` result as `previous` on each parse of a growing stream, the strict final included; complete blocks convert once and keep their node objects, except in a source with a link reference or footnote definition, which parses whole
- Report `markdown-tag-repair` for unbalanced tags, and warn with `markdown-property-omitted` for element and mark properties Markdown cannot carry, such as `textAlign`
- Read a link with a script or other unsafe destination as its label, and an image with an unsafe source as its alt text, reporting `markdown-unsafe-content`; serializing applies the same check
- Stop writing `withBlockId` wrappers; `<block id>` wrappers still read when `ElementIdPlugin` is installed
- Resolve reference-style links and images against their definitions, and keep distinct footnote labels distinct on export
- Keep adjacent marks with different attributes, such as two text colors, as separate spans
- Preserve bare links in headings, consecutive trailing line breaks, list-item line breaks, and sized images in table cells through Markdown round trips
- Author mappings with `markdown: { node: 'blockquote' }` for standard Markdown nodes or `markdown: { tag: type }` for Plate tags; a tag mapping without `decode` and `encode` converts the element's properties as attributes (rename one with `attributes: { url: 'src' }`) and its children by the schema's content model
- In custom callbacks, read attributes with `readTagAttributes()`, write a tag's attributes with `encodeNodeAttributes()` or chosen values with `encodeAttributes()` (both claim what the returned output keeps), claim other represented properties with `preserve(...keys)`, `return refuse(message)` for content a feature cannot represent, and `report({ kind: 'property', ... })` a loss that keeps the content; remove `from`, `parseAttributes` and `propsToAttributes`
- Declare marks with the same selectors, such as `{ node: 'strong' }`, `{ tag: 'kbd' }`, `{ tag: 'sub', value: 'sub' }` or `{ tag: 'span', style: 'color' }`, and write a custom inline wrapper with `wrap`; every mark mapping on one tag applies, so `<span style="color: red; background-color: yellow;">` sets both marks; inherited persisted text properties are exposed as `marks`
- Decode tag attributes by each property's schema kind: `icon="123"` stays the string `"123"`, and malformed values are omitted with a diagnostic
- Remove the `PlateType`, `StrictPlateType` and `MarkdownNodeName` unions and the `mdastToPlate` and `plateToMdast` helpers
- Use one `tableCell` Plate type for GFM table cells; header semantics stay on the cell's `header` property
- Round-trip `<sub>` and `<sup>` through one `script: 'sub' | 'sup'` text property
- Read an ordered list's start as `listStart`, or as `listRestart` when the list directly follows another ordered list, and serialize active `listStart` or `listRestart` values as Markdown starts
- Remove `MarkdownPlugin.parser`, `DeserializeMdOptions.memoize` and `DeserializeMdOptions.parser`
- Remove exported conversion internals: `customMdxDeserialize`, `getCustomMark`, `getDeserializerByKey`, `getMergedOptionsDeserialize`, `getMergedOptionsSerialize`, `getSerializerByKey`, `getStyleValue`, `markdownToSlateNodesSafely` and `unreachable`
- Remove React peer and runtime dependencies from the base Markdown package

**Migration:** Configure `MarkdownPlugin` without `remarkMdx` or `remarkMention`, and branch on the result:

```tsx
MarkdownPlugin.configure({
  initialState: { remarkPlugins: [remarkGfm, remarkMath] },
});

const result = editor.api.markdown.parse(markdown);

if (result.ok) editor.update.value.replace(result.document);
```
