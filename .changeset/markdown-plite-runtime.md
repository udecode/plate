---
'platejs': major
---

Read Markdown as CommonMark (with GFM, math and emoji through `remarkPlugins`) plus Plate's registered tags, and return every conversion as a result with structured diagnostics. Any string parses: text such as `Array<string>`, `{name}` or `<https://example.com>` stays ordinary Markdown, and unknown HTML stays literal text with a diagnostic.

- Convert through `editor.api.markdown.{parse,parseSlice,parseInline,serialize}` and the standalone `parseMarkdown` and `serializeMarkdown`; remove `deserializeMd`, `deserializeInlineMd`, `serializeMd`, `serializeInlineMd` and `buildRules`
- Write Plate elements and marks as registered tags such as `<callout icon="💡">Tip</callout>`, `<u>`, `<kbd>` and `<span style="color: red;">`; block tags are separated by blank lines and never indented, and output from earlier versions still reads
- Remove `remarkMdx`; Plate tags need no remark plugin, and full MDX source is not supported
- Remove `remarkMention` and `MentionNode`; mentions read and write as `[label](mention:ref)` links, and bare `@name` stays text
- Remove `allowedNodes`, `disallowedNodes`, `allowNode`, `splitLineBreaks`, `withoutMdx`, per-call `remarkPlugins` and per-call `rules`; configure `remarkPlugins` on `MarkdownPlugin`
- Pass `partial: true` when parsing an unfinished stream, such as a streaming AI answer; the final parse stays strict
- Report `markdown-tag-repair` for unbalanced tags and `markdown-property-omitted` for element properties Markdown cannot carry, such as `textAlign`
- Stop writing `withBlockId` wrappers; `<block id>` wrappers still read when `ElementIdPlugin` is installed
- Resolve reference-style links and images against their definitions, and keep distinct footnote labels distinct on export
- Keep adjacent marks with different attributes, such as two text colors, as separate spans
- Author mappings with `markdown: { node: 'blockquote' }` for standard Markdown nodes or `markdown: { tag: type }` for Plate tags; read attributes with `readTagAttributes()`, write them with `encodeAttributes()`, and `return refuse(message)` for content a feature cannot represent; remove `from`, `parseAttributes` and `propsToAttributes`
- Write mark mappings with `mark: true`, a `decode` that returns the mark value (`decode: () => true`) and a `wrap` that returns the inline wrapper (`wrap: () => ({ name: 'kbd', type: 'mdxJsxTextElement' })`); every mark mapping on one tag applies, so `<span style="color: red; background-color: yellow;">` sets both marks; inherited persisted text properties are exposed as `marks`
- Decode tag attributes by each property's schema kind: `icon="123"` stays the string `"123"`, and malformed values are omitted with a diagnostic
- Remove the `PlateType`, `StrictPlateType` and `MarkdownNodeName` unions and the `mdastToPlate` and `plateToMdast` helpers
- Use one `tableCell` Plate type for GFM table cells; header semantics stay on the cell's `header` property
- Round-trip `<sub>` and `<sup>` through one `script: 'sub' | 'sup'` text property
- Map structural ordered-list starts to forced `listRestart` boundaries and serialize active `listStart` or `listRestart` values as Markdown starts
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
