import { describe } from 'std/testing/bdd';

import { hpt, twip } from '../../utilities/src/length.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../../utilities/src/namespaces.ts';
import { createXmlRoundRobinTest } from '../../utilities/src/tests.ts';
import {
	type TextProperties,
	textPropertiesFromNode,
	textPropertiesToNode,
} from '../src/text-properties.ts';

const test = createXmlRoundRobinTest<TextProperties>(
	textPropertiesFromNode,
	textPropertiesToNode
);

const date = new Date();

describe('Text formatting', () => {
	test(
		`<w:rPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:color w:val="red" />
				<w:u w:val="dashLongHeavy" />
				<w:b />
				<w:i />
				<w:shd w:color="orange" w:fill="yellow" w:val="diagStripe" />
				<w:smallCaps />
				<w:caps />
				<w:vertAlign w:val="subscript" />
				<w:lang w:val="en-GB" />
				<w:sz w:val="19" />
				<w:kern w:val="23" />
				<w:spacing w:val="100" />
				<w:rFonts w:cs="Tahoma" w:ascii="Arial" w:hAnsi="Courier New" />
				<w:moveTo w:author="Gabe" w:date="${date.toISOString()}" w:id="1" /> 
				<w:rPrChange w:author="Angel" w:date="${date.toISOString()}" w:id="99" > 
					<w:rPr>
						<w:color w:val="blue" /> 
						<w:b w:val="false" /> 
					</w:rPr>
				</w:rPrChange>
			</w:rPr>`,
		{
			color: 'red',
			isUnderlined: 'dashLongHeavy',
			isBold: { simple: true, complex: false },
			isItalic: { simple: true, complex: false },
			isSmallCaps: true,
			shading: {
				background: 'yellow',
				foreground: 'orange',
				pattern: 'diagStripe',
			},
			isCaps: true,
			verticalAlign: 'subscript',
			language: 'en-GB',
			fontSize: { simple: hpt(19), complex: null },
			minimumKerningFontSize: hpt(23),
			spacing: twip(100),
			font: {
				cs: 'Tahoma',
				ascii: 'Arial',
				hAnsi: 'Courier New',
			},
			moveTo: {
				author: 'Gabe',
				date: date,
				id: 1,
			},
			change: {
				author: 'Angel',
				date: date,
				id: 99,
				color: 'blue',
				isBold: { simple: false, complex: false },
			},
		}
	);

	test(
		`<w:rPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:color w:val="red" />
			<w:b />
			<w:i />
			<w:vertAlign w:val="subscript" />
			<w:moveFrom w:author="Gabe" w:date="${date.toISOString()}" w:id="1" /> 
			<w:rPrChange w:author="Angel" w:date="${date.toISOString()}" w:id="99" > 
				<w:rPr>
					<w:color w:val="blue" /> 
					<w:b w:val="false" /> 
				</w:rPr>
			</w:rPrChange>
		</w:rPr>`,
		{
			color: 'red',
			isBold: { simple: true, complex: false },
			isItalic: { simple: true, complex: false },
			verticalAlign: 'subscript',
			moveFrom: {
				author: 'Gabe',
				date: date,
				id: 1,
			},
			change: {
				author: 'Angel',
				date: date,
				id: 99,
				color: 'blue',
				isBold: { simple: false, complex: false },
			},
		}
	);
});

describe('Complex character formatting', () => {
	test(
		`<w:rPr ${ALL_NAMESPACE_DECLARATIONS}>
					<w:bCs />
					<w:iCs />
					<w:szCs w:val="23" />
				</w:rPr>`,
		{
			isBold: { simple: false, complex: true },
			isItalic: { simple: false, complex: true },
			fontSize: { simple: null, complex: hpt(23) },
		}
	);
});

describe('Insertion property', () => {
	test(
		`
		<w:rPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:ins w:author="Gabe" w:date="${date.toISOString()}" w:id="1" /> 
		</w:rPr>`,
		{
			insertion: {
				author: 'Gabe',
				date: date,
				id: 1,
			},
		}
	);
});

describe('Deletion property', () => {
	test(
		`
		<w:rPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:del w:author="Gabe" w:date="${date.toISOString()}" w:id="1" /> 
		</w:rPr>`,
		{
			deletion: {
				author: 'Gabe',
				date: date,
				id: 1,
			},
		}
	);
});

describe('Change Information properties', () => {
	// Node with author, id and date
	test(
		`
		<w:rPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:moveTo w:author="Gabe" w:date="${date.toISOString()}" w:id="1" /> 
			<w:rPrChange w:author="Angel" w:date="${date.toISOString()}" w:id="99" > 
				<w:rPr>
					<w:color w:val="blue" /> 
					<w:b w:val="false" /> 
				</w:rPr>
			</w:rPrChange>
		</w:rPr>`,
		{
			moveTo: {
				author: 'Gabe',
				date: date,
				id: 1,
			},
			change: {
				author: 'Angel',
				date: date,
				id: 99,
				color: 'blue',
				isBold: { simple: false, complex: false },
			},
		}
	);

	// Node with id and date, but without author
	test(
		`
			<w:rPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:moveTo w:date="${date.toISOString()}" w:id="1" /> 
				<w:rPrChange w:date="${date.toISOString()}" w:id="99" > 
					<w:rPr>
						<w:color w:val="blue" /> 
						<w:b w:val="false" /> 
					</w:rPr>
				</w:rPrChange>
			</w:rPr>`,
		{
			moveTo: {
				date: date,
				id: 1,
			},
			change: {
				date: date,
				id: 99,
				color: 'blue',
				isBold: { simple: false, complex: false },
			},
		}
	);

	// Node with id and author, but without date
	test(
		`
			<w:rPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:moveTo w:author="Gabe" w:id="1" /> 
				<w:rPrChange w:author="Angel"  w:id="99" > 
					<w:rPr>
						<w:color w:val="blue" /> 
						<w:b w:val="false" /> 
					</w:rPr>
				</w:rPrChange>
			</w:rPr>`,
		{
			moveTo: {
				author: 'Gabe',
				id: 1,
			},
			change: {
				id: 99,
				author: 'Angel',
				color: 'blue',
				isBold: { simple: false, complex: false },
			},
		}
	);

	// Node with id, but without date and author
	test(
		`
			<w:rPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:moveTo w:id="1" /> 
				<w:rPrChange w:id="99" > 
					<w:rPr>
						<w:color w:val="blue" /> 
						<w:b w:val="false" /> 
					</w:rPr>
				</w:rPrChange>
				</w:rPr>`,
		{
			moveTo: {
				id: 1,
			},
			change: {
				id: 99,
				color: 'blue',
				isBold: { simple: false, complex: false },
			},
		}
	);
});
