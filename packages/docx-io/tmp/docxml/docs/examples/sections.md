Sections can be used to determine page size and a few other things. Unlike the actual OOXML structure
itself, in `docxml` sections are components that wrap the section contents. Their use is entirely
optional.

```tsx
/** @jsx Docx.jsx */
import Docx, { cm, Paragraph, Section, Text } from 'docxml';

await Docx.fromJsx(
	<Section pageWidth={cm(20)} pageHeight={cm(20)}>
		<Paragraph>
			<Text>This is a square page</Text>
		</Paragraph>
	</Section>,
).toFile('sections.docx');
```
