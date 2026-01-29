/** @jsx  Docx.jsx */
import {
	type FootnoteProps,
	FootnoteReference,
} from '../lib/components/document/src/FootnoteReference.ts';
import { Text } from '../lib/components/document/src/Text.ts';
import { cm, inch, pt } from '../lib/utilities/src/length.ts';
import Docx, { Cell, Image, Paragraph, Row, Section, Table } from '../mod.ts';

const docxFile = Docx.fromNothing();

const footnoteProps: FootnoteProps = {
	numberingFormat: 'lowerRoman',
	position: 'pageBottom',
	restart: 'continuous',
};

const footnoteReferenceStyleName = 'FootnoteReference';

const footnote1 = await docxFile.document.footnotes.add(
	new Paragraph({}, new Text({}, 'Hello, this is a footnote.')),
	footnoteReferenceStyleName
);
const footnote2 = await docxFile.document.footnotes.add(
	[
		new Paragraph({}, new Text({}, 'And this is an additional footnote.')),
		new Paragraph(
			{},
			new Text({}, 'And it will have more than one paragraph')
		),
	],
	footnoteReferenceStyleName
);

const image = new Image({
	data: Deno.readFile('assets/spacekees.jpeg'),
	width: inch(1),
	height: inch(1),
	title: 'Title',
	alt: 'Alt',
});

const footnote3 = await docxFile.document.footnotes.add(
	new Paragraph({}, new Text({}, image)),
	footnoteReferenceStyleName
);

const footnote4 = await docxFile.document.footnotes.add(
	new Table(
		{
			columnWidths: [cm(3)],
			cellPadding: {
				top: pt(6),
				bottom: pt(6),
				start: pt(6),
				end: pt(6),
			},
			borders: {
				bottom: { color: '666666', width: pt(1), type: 'single' },
				start: { color: '666666', width: pt(1), type: 'single' },
				top: { color: '666666', width: pt(1), type: 'single' },
				end: { color: '666666', width: pt(1), type: 'single' },
				insideH: { color: 'CCCCCC', width: pt(1), type: 'dashed' },
				insideV: { color: 'CCCCCC', width: pt(1), type: 'dashed' },
			},
		},
		new Row(
			{},
			new Cell(
				{},
				new Paragraph(
					{ style: 'Text' },
					new Text({}, 'This is a table cell')
				)
			)
		)
	),
	footnoteReferenceStyleName
);

docxFile.document.styles.add({
	id: 'FootnoteReference',
	name: 'FootnoteReference',
	type: 'character',
	text: {
		verticalAlign: 'superscript',
		fontSize: pt(10),
	},
});

docxFile.document.styles.add({
	id: 'Text',
	name: 'Text',
	type: 'paragraph',
	text: {
		fontSize: pt(9),
	},
});

docxFile.document.settings.set('footnoteProperties', footnoteProps);

docxFile.document.set(
	<Section footnotes={footnoteProps}>
		<Paragraph>
			This is my first paragraph of text with a few footnotes.
			<FootnoteReference
				id={footnote1}
				style={footnoteReferenceStyleName}
			/>
			-
			<FootnoteReference
				id={footnote2}
				style={footnoteReferenceStyleName}
			/>
			-
			<FootnoteReference
				id={footnote3}
				style={footnoteReferenceStyleName}
			/>
			-
			<FootnoteReference
				id={footnote4}
				style={footnoteReferenceStyleName}
			/>
		</Paragraph>
	</Section>
);

await docxFile.toFile('footnotes.docx');
