/** @jsx API.jsx */

import API, { cm, Paragraph, Section } from '../mod.ts';

const api = API.fromNothing();

const numbering = api.document.numbering.add({
	type: 'hybridMultilevel',
	levels: [
		{
			alignment: 'left',
			format: 'decimalZero',
			start: 1,
			affix: '%1',
		},
		{
			alignment: 'left',
			format: 'lowerRoman',
			start: 1,

			// @NOTE Breaking change, this option was previously called "text"
			affix: '%1',

			// @NOTE New level option "paragraph" lets you style any of the paragraph
			//      properties
			paragraph: {
				indentation: {
					start: cm(1),
				},
				shading: {
					background: 'yellow',
				},
			},

			// @NOTE New level option "text" lets you style any of the text properties of the
			//       numbering text/bullet itself
			text: {
				color: 'pink',
			},
		},
		{
			alignment: 'left',
			format: 'lowerLetter',
			start: 1,
			affix: '%1',
			paragraph: {
				indentation: {
					start: cm(2),
				},
			},
		},
	],
});

api.document.set(
	<Section>
		<Paragraph listItem={{ numbering, depth: 0 }}>List item #1</Paragraph>
		<Paragraph listItem={{ numbering, depth: 0 }}>List item #2</Paragraph>
		<Paragraph listItem={{ numbering, depth: 0 }}>List item #3</Paragraph>
		<Paragraph listItem={{ numbering, depth: 1 }}>List item #3.1</Paragraph>
		<Paragraph listItem={{ numbering, depth: 1 }}>List item #3.2</Paragraph>
		<Paragraph listItem={{ numbering, depth: 2 }}>
			List item #3.2.1
		</Paragraph>
		<Paragraph listItem={{ numbering, depth: 2 }}>
			List item #3.2.2
		</Paragraph>
		<Paragraph listItem={{ numbering, depth: 2 }}>
			List item #3.2.3
		</Paragraph>
		<Paragraph listItem={{ numbering, depth: 1 }}>List item #3.3</Paragraph>
		<Paragraph listItem={{ numbering, depth: 0 }}>List item #4</Paragraph>
	</Section>
);

api.toFile('lists.docx');
