Paragraphs are the bread and butter of text processors like MS Word and Google Docs. Paragraphs are
the most common top-level building block of an OOXML/DOCX document.

For example, headings and list items are both paragraphs, but with different style properties.

[👉 Read more about styling paragraphs as lists and list items](./lists.md)

You'll probably use the `Paragraph` component all over the place, and get acquinted with its
formatting options.

```tsx
<Paragraph
	alignment="center"
	spacing={{
		before: cm(1),
		after: cm(1),
	}}
	indentation={{
		firstLine: cm(2),
	}}
	shading={{
		background: 'yellow',
		foreground: 'orange',
		pattern: 'diagStripe',
	}}
>
	…
</Paragraph>
```

[👉 Jump to the type definition of paragraph properties](https://github.com/fontoxml/docxml/blob/develop/src/properties/paragraph-properties.ts#L20)
