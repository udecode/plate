Like OOXML, list numbering is a property on each paragraph that represents a list item. Unlike HTML, there is no tag or component for the list itself.

To use numbering, first ensure that there is a numbering style, and then reference it from a paragraph;

```tsx
/** @jsx Docx.jsx */
import Docx, { Paragraph, Text, cm } from 'docxml';

const docx = Docx.fromNothing();

const numbering = docx.document.numbering.add({
	type: 'hybridMultilevel',
	levels: [
		{ alignment: 'left', format: 'lowerLetter', start: 1, affix: '(%1)' },
		{
			alignment: 'left',
			format: 'decimal',
			start: 1,
			affix: '%1.',
			paragraph: { indentation: { left: cm(3) } },
		},
		// More of these objects for each list level
	],
});

docx.document.set(
	<Paragraph listItem={{ numbering, depth: 0 }}>
		<Text>This is a list item on the first level</Text>
	</Paragraph>,
);

await docx.toFile('list-item.docx');
```

To reset numbering across lists you must create a whole new abstract numbering, and a new numbering instance, and then reference that from your new list. Counterintuitive as it is, this is what MS Word does too. Reusing abstract numbering across distinct lists is an improvement that `docxml` could make in the future.
