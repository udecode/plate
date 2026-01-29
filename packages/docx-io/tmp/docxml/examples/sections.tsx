// deno-lint-ignore-file jsx-key
/** @jsx Docx.jsx */

import Docx, { cm, Paragraph, Section, Text } from '../mod.ts';

await Docx.fromJsx([
	<Section pageWidth={cm(20)} pageHeight={cm(20)}>
		<Paragraph>
			<Text>This is a square page</Text>
		</Paragraph>
	</Section>,
	<Section pageWidth={cm(30)} pageHeight={cm(10)}>
		<Paragraph>
			<Text>This is a very landscape page</Text>
		</Paragraph>
	</Section>,
]).toFile('sections.docx');
