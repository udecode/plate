import { describe } from 'std/testing/bdd';

import { opt, pt } from '../../utilities/src/length.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../../utilities/src/namespaces.ts';
import { createXmlRoundRobinTest } from '../../utilities/src/tests.ts';
import {
	type TableConditionalProperties,
	tableConditionalPropertiesFromNode,
	tableConditionalPropertiesToNode,
} from '../src/table-conditional-properties.ts';

const test = createXmlRoundRobinTest<TableConditionalProperties>(
	(x) => tableConditionalPropertiesFromNode(x as NonNullable<typeof x>),
	tableConditionalPropertiesToNode
);

describe('Table conditional formatting', () => {
	test(
		`<w:tblStylePr ${ALL_NAMESPACE_DECLARATIONS} w:type="wholeTable">
			<w:pPr>
				<w:pBdr>
					<w:top w:val="single" w:sz="24" w:space="1" w:color="FF0000" />
				</w:pBdr>
			</w:pPr>
			<w:rPr>
				<w:b />
			</w:rPr>
			<w:tblPr>
				<w:tblBorders>
					<w:top w:sz="8" w:space="1" w:color="red" />
				</w:tblBorders>
			</w:tblPr>
			<w:tcPr>
				<w:tcBorders>
					<w:top w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
					<w:start w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
					<w:bottom w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
					<w:end w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
					<w:tl2br w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
				</w:tcBorders>
			</w:tcPr>
		</w:tblStylePr>`,
		{
			type: 'wholeTable',
			paragraph: {
				borders: {
					top: {
						type: 'single',
						width: pt(3),
						spacing: 1,
						color: 'FF0000',
					},
				},
			},
			text: {
				isBold: { simple: true },
			},
			table: {
				borders: {
					top: {
						type: null,
						width: pt(1),
						spacing: 1,
						color: 'red',
					},
				},
			},
			cell: {
				borders: {
					top: {
						type: 'double',
						width: opt(24),
						spacing: 0,
						color: 'FF0000',
					},
					start: {
						type: 'double',
						width: opt(24),
						spacing: 0,
						color: 'FF0000',
					},
					bottom: {
						type: 'double',
						width: opt(24),
						spacing: 0,
						color: 'FF0000',
					},
					end: {
						type: 'double',
						width: opt(24),
						spacing: 0,
						color: 'FF0000',
					},
					tl2br: {
						type: 'double',
						width: opt(24),
						spacing: 0,
						color: 'FF0000',
					},
				},
			},
		}
	);
});
