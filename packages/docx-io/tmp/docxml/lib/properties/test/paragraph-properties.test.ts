import { describe } from 'std/testing/bdd';

import { hpt, pt, twip } from '../../utilities/src/length.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../../utilities/src/namespaces.ts';
import { createXmlRoundRobinTest } from '../../utilities/src/tests.ts';
import {
	type ParagraphProperties,
	paragraphPropertiesFromNode,
	paragraphPropertiesToNode,
} from '../src/paragraph-properties.ts';

const test = createXmlRoundRobinTest<ParagraphProperties>(
	paragraphPropertiesFromNode,
	paragraphPropertiesToNode
);

describe('Paragraph formatting', () => {
	test(
		`<w:pPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:pStyle w:val="Header" />
			<w:spacing w:after="200" w:line="276" w:lineRule="auto" />
			<w:outlineLvl w:val="3" />
			<w:shd w:val="pct45" w:color="FFFF00" w:fill="B2A1C7" />
			<w:ind w:start="1440" w:end="1440" />
			<w:pBdr>
				<w:top w:val="single" w:sz="24" w:space="1" w:color="FF0000" />
			</w:pBdr>
			<w:rPr>
				<w:b />
				<w:vertAlign w:val="subscript" />
				<w:i />
				<w:lang w:val="en-GB" />
				<w:sz w:val="19" />
			</w:rPr>			
			<w:tabs>
				<w:tab w:val="right" w:leader="dot" w:pos="10" />
				<w:tab w:val="left" w:leader="dot" w:pos="100" />
			</w:tabs>
			<w:pageBreakBefore w:val="false"/>
		</w:pPr>`,
		{
			alignment: null,

			// This test fails due to a naming collision with the "style" property on TextProperties
			style: 'Header',

			shading: {
				background: 'B2A1C7',
				foreground: 'FFFF00',
				pattern: 'pct45',
			},
			outlineLvl: 3,
			indentation: {
				start: twip(1440),
				end: twip(1440),
				startChars: null,
				endChars: null,
				hanging: null,
				hangingChars: null,
				firstLine: null,
				firstLineChars: null,
			},
			spacing: {
				before: null,
				after: twip(200),
				line: twip(276),
				lineRule: 'auto',
				afterAutoSpacing: false,
				beforeAutoSpacing: false,
			},
			borders: {
				top: {
					type: 'single',
					width: pt(3),
					spacing: 1,
					color: 'FF0000',
				},
				left: null,
				bottom: null,
				right: null,
				between: null,
			},
			pilcrow: {
				isBold: { simple: true },
				isItalic: { simple: true },
				verticalAlign: 'subscript',
				language: 'en-GB',
				fontSize: { simple: hpt(19) },
			},
			tabs: [
				{
					type: 'right',
					leader: 'dot',
					position: twip(10),
				},
				{
					type: 'left',
					leader: 'dot',
					position: twip(100),
				},
			],
			pageBreakBefore: false,
		}
	);

	describe('Paragraph style with "zero" outline level', () => {
		test(
			`<w:pPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:outlineLvl w:val="0" />
			</w:pPr>`,
			{
				outlineLvl: 0,
			}
		);
	});

	describe('Legacy "left"/"right"', () => {
		test(
			`<w:pPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:ind w:left="1440" w:right="1440" />
			</w:pPr>`,
			{
				indentation: {
					start: twip(1440),
					end: twip(1440),
				},
			}
		);
	});

	describe('Change Information properties', () => {
		const date = new Date();

		// Node with author, id and date
		test(
			`
			<w:pPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:pPrChange w:id="99" w:date="${date.toISOString()}" w:author="Inés"> 
					<w:pPr>
						<w:pStyle w:val="Header" />
					</w:pPr>
				</w:pPrChange>
			</w:pPr>`,
			{
				change: {
					id: 99,
					date: date,
					style: 'Header',
					author: 'Inés',
				},
			}
		);

		// Node with id and date, but without author
		test(
			`
            <w:pPr ${ALL_NAMESPACE_DECLARATIONS}>
                <w:pPrChange w:id="99" w:date="${date.toISOString()}"> 
                    <w:pPr>
                        <w:pStyle w:val="Header" />
                    </w:pPr>
                </w:pPrChange>
                </w:pPr>`,
			{
				change: {
					id: 99,
					date: date,
					style: 'Header',
				},
			}
		);

		// Node with id and author, but without date
		test(
			`
                <w:pPr ${ALL_NAMESPACE_DECLARATIONS}>
                    <w:pPrChange w:id="99" w:author="Inés"> 
                        <w:pPr>
                            <w:pStyle w:val="Header" />
                        </w:pPr>
                    </w:pPrChange>
                    </w:pPr>`,
			{
				change: {
					id: 99,
					author: 'Inés',
					style: 'Header',
				},
			}
		);

		// Node with id, but without date and author
		test(
			`
                <w:pPr ${ALL_NAMESPACE_DECLARATIONS}>
                    <w:pPrChange w:id="99"> 
                        <w:pPr>
                            <w:pStyle w:val="Header" />
                        </w:pPr>
                    </w:pPrChange>
                    </w:pPr>`,
			{
				change: {
					id: 99,
					style: 'Header',
				},
			}
		);
	});
});
