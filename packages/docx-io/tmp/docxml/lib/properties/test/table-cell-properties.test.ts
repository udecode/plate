import { describe } from 'std/testing/bdd';

import { parse } from '../../utilities/src/dom.ts';
import { opt, twip } from '../../utilities/src/length.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../../utilities/src/namespaces.ts';
import { createXmlRoundRobinTest } from '../../utilities/src/tests.ts';
import { evaluateXPathToFirstNode } from '../../utilities/src/xquery.ts';
import {
	type TableCellProperties,
	tableCellPropertiesFromNode,
	tableCellPropertiesToNode,
} from '../src/table-cell-properties.ts';

const test = createXmlRoundRobinTest<TableCellProperties>(
	tableCellPropertiesFromNode,
	(n: TableCellProperties) => tableCellPropertiesToNode(n, false)
);

const date = new Date();

describe('Table cell formatting', () => {
	const dom = parse(`<w:tbl ${ALL_NAMESPACE_DECLARATIONS}>
		<w:tblPr>
			<w:tblStyle w:val="TableGrid" />
		</w:tblPr>
		<w:tblGrid>
			<w:gridCol w:w="1701" />
			<w:gridCol w:w="1701" />
			<w:gridCol w:w="1701" />
		</w:tblGrid>
		<w:tr>
			<w:tc id="colspanning-cell">
				<w:tcPr>
					<w:tcW w:w="1701" w:type="dxa" />
					<w:gridSpan w:val="2" />
					<w:shd w:val="pct45" w:color="FFFF00" w:fill="B2A1C7" />
					<w:vMerge w:val="restart" />
					<w:tcBorders>
						<w:top w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
						<w:start w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
						<w:bottom w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
						<w:end w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
						<w:tl2br w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
					</w:tcBorders>
					<w:tcPrChange w:id="8" w:author="Eva" w:date="${date}">
						<w:tcPr>
							<w:tcW w:w="3402" w:type="dxa" />
						</w:tcPr>
					</w:tcPrChange>
				</w:tcPr>
				<w:p>
					<w:pPr />
					<w:r>
						<w:t xml:space="preserve">A1/B1/A2/B2</w:t>
					</w:r>
				</w:p>
			</w:tc>
			<w:tc>
				<w:tcPr>
					<w:tcW w:w="1701" w:type="dxa" />
				</w:tcPr>
				<w:p>
					<w:pPr />
					<w:r>
						<w:t xml:space="preserve">C1</w:t>
					</w:r>
				</w:p>
			</w:tc>
		</w:tr>
		<w:tr>
			<w:tc>
				<w:tcPr>
					<w:tcW w:w="1700.7874015748032" w:type="dxa" />
					<w:gridSpan w:val="2" />
					<w:vMerge w:val="continue" />
				</w:tcPr>
				<w:p />
			</w:tc>
			<w:tc>
				<w:tcPr>
					<w:tcW w:w="1701" w:type="dxa" />
					<w:vMerge w:val="restart" />
				</w:tcPr>
				<w:p>
					<w:pPr />
					<w:r>
						<w:t xml:space="preserve">C2/C3</w:t>
					</w:r>
				</w:p>
			</w:tc>
		</w:tr>
	</w:tbl>`);
	test(
		evaluateXPathToFirstNode(
			`//*[@id="colspanning-cell"]/w:tcPr`,
			dom
		) as Node,
		{
			colSpan: 2,
			// Rowspan would have been "1" if other cells are not succesfully taken into account:
			rowSpan: 2,
			shading: {
				background: 'B2A1C7',
				foreground: 'FFFF00',
				pattern: 'pct45',
			},
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
				tr2bl: null,
				insideH: null,
				insideV: null,
			},
			change: {
				id: 8,
				author: 'Eva',
				date: date,
				width: twip(3402),
			},
		}
	);

	describe('Legacy "left"/"right"', () => {
		test(
			`<w:tcPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:tcBorders>
					<w:left w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
					<w:right w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
				</w:tcBorders>
			</w:tcPr>`,
			{
				borders: {
					start: {
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
					top: null,
					bottom: null,
					tl2br: null,
					tr2bl: null,
					insideH: null,
					insideV: null,
				},
			}
		);
	});

	describe('verticalAlignment', () => {
		const options: TableCellProperties['verticalAlignment'][] = [
			'bottom',
			'center',
			'top',
		];
		options.forEach((alignment) => {
			test(
				`<w:tcPr ${ALL_NAMESPACE_DECLARATIONS}>
					<w:vAlign w:val="${alignment}"/>
				</w:tcPr>`,
				{
					verticalAlignment: alignment,
				}
			);
		});
	});

	describe('Table cell insertion', () => {
		const date = new Date();
		test(
			`<w:tcPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:cellIns w:id="1" w:author="Luis" w:date="${date.toISOString()}"/>
			</w:tcPr>`,
			{
				insertion: { author: 'Luis', date: date, id: 1 },
			}
		);
		test(
			`<w:tcPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:cellIns w:id="2"/>
			</w:tcPr>`,
			{
				insertion: { id: 2 },
			}
		);
	});

	describe('Table cell deletion', () => {
		const date = new Date();
		test(
			`<w:tcPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:cellDel w:id="1" w:author="Luis" w:date="${date.toISOString()}"/>
			</w:tcPr>`,
			{
				deletion: { author: 'Luis', date: date, id: 1 },
			}
		);
		test(
			`<w:tcPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:cellDel w:id="2" />
			</w:tcPr>`,
			{
				deletion: { id: 2 },
			}
		);
	});
});
