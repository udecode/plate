// deno-lint-ignore-file jsx-key
/** @jsx Docx.jsx */

import { WatermarkText } from '../lib/components/document/src/WatermarkText.ts';
import Docx, { cm, Image, Paragraph, Section, Text } from '../mod.ts';

const docx = Docx.fromNothing();

const header = docx.document.headers.add('word/header1.xml', [
	<Paragraph>
		<Text>
			<Image
				data={Deno.readFile('test/spacekees.jpeg')}
				width={cm(2)}
				height={cm(2)}
				title="Title"
				alt="Description"
			/>
		</Text>
	</Paragraph>,

	<WatermarkText
		text="ATLAS"
		font="Georgia"
		isItalic
		opacity={0.25}
		horizontalAlign="center"
		verticalAlign="center"
		boxWidth={cm(5)}
		boxHeight={cm(2)}
	/>,
]);
const footer = docx.document.footers.add(
	'word/footer1.xml',
	<Paragraph>SKEET FOOTER</Paragraph>
);

docx.document.set([
	<Section headers={header} footers={footer}>
		<Paragraph>This page has a header and a footer</Paragraph>
		<Paragraph>
			<Text>
				<Image
					data={Deno.readFile('test/spacekees.jpeg')}
					width={cm(2)}
					height={cm(2)}
					title="Title"
					alt="Description"
				/>
			</Text>
		</Paragraph>
	</Section>,
]);

docx.toFile('headers-footers.docx');
