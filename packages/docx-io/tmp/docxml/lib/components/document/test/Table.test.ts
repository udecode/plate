/** @jsx jsx */
import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { Archive } from '../../../classes/src/Archive.ts';
import type { ComponentContext } from '../../../classes/src/Component.ts';
import { create } from '../../../utilities/src/dom.ts';
import { twip } from '../../../utilities/src/length.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';
import { Table } from '../src/Table.ts';

const emptyContext: ComponentContext = {
	archive: new Archive(),
	relationships: null,
};

describe('Table', () => {
	//    +---------+----+
	//    |0        |1   |
	//    |         +----+
	//    |         |2   |
	//    +---------+    |
	//    |3        |    |
	//    +---------+----+
	const table = Table.fromNode(
		create(`
			<w:tbl xmlns:w="${NamespaceUri.w}">
				<w:tblGrid>
					<w:gridCol w:w="960"/>
					<w:gridCol w:w="960"/>
					<w:gridCol w:w="960"/>
					<w:gridCol w:w="960"/>
					<w:tblGridChange w:id="1">
						<w:tblGrid>
							<w:gridCol w:w="480"/>
							<w:gridCol w:w="480"/>
							<w:gridCol w:w="480"/>
							<w:gridCol w:w="480"/>
						</w:tblGrid>
					</w:tblGridChange>
				</w:tblGrid>
				<w:tr>
					<w:tc>
						<w:tcPr>
							<w:gridSpan w:val="2" />
							<w:vMerge w:val="restart" />
						</w:tcPr>
						<w:p>
							<w:pPr>
								<w:rPr />
							</w:pPr>
							<w:r>
								<w:rPr />
								<w:t xml:space="preserve">A1/B1/A2/B2</w:t>
							</w:r>
						</w:p>
					</w:tc>
					<w:tc>
						<w:p>
							<w:pPr>
								<w:rPr />
							</w:pPr>
							<w:r>
								<w:rPr />
								<w:t xml:space="preserve">C1</w:t>
							</w:r>
						</w:p>
					</w:tc>
				</w:tr>
				<w:tr>
					<w:tc>
						<w:tcPr>
							<w:gridSpan w:val="2" />
							<w:vMerge w:val="continue" />
						</w:tcPr>
						<w:p />
					</w:tc>
					<w:tc>
						<w:tcPr>
							<w:vMerge w:val="restart" />
						</w:tcPr>
						<w:p>
							<w:pPr>
								<w:rPr />
							</w:pPr>
							<w:r>
								<w:rPr />
								<w:t xml:space="preserve">C2/C3</w:t>
							</w:r>
						</w:p>
					</w:tc>
				</w:tr>
				<w:tr>
					<w:tc>
						<w:tcPr>
							<w:gridSpan w:val="2" />
						</w:tcPr>
						<w:p>
							<w:pPr>
								<w:rPr />
							</w:pPr>
							<w:r>
								<w:rPr />
								<w:t xml:space="preserve">A3/B3</w:t>
							</w:r>
						</w:p>
					</w:tc>
					<w:tc>
						<w:tcPr>
							<w:vMerge w:val="continue" />
						</w:tcPr>
						<w:p />
					</w:tc>
				</w:tr>
				<w:tr>
					<w:tc>
						<w:p>
							<w:pPr>
								<w:rPr />
							</w:pPr>
							<w:r>
								<w:rPr />
								<w:t xml:space="preserve">A4</w:t>
							</w:r>
						</w:p>
					</w:tc>
					<w:tc>
						<w:p>
							<w:pPr>
								<w:rPr />
							</w:pPr>
							<w:r>
								<w:rPr />
								<w:t xml:space="preserve">B4</w:t>
							</w:r>
						</w:p>
					</w:tc>
					<w:tc>
						<w:p>
							<w:pPr>
								<w:rPr />
							</w:pPr>
							<w:r>
								<w:rPr />
								<w:t xml:space="preserve">C4</w:t>
							</w:r>
						</w:p>
					</w:tc>
				</w:tr>
			</w:tbl>
		`),
		emptyContext
	);
	it('Table grid has been defined', () => {
		expect(table.props.columnWidths).toEqual([
			twip(960),
			twip(960),
			twip(960),
			twip(960),
		]);
	});

	it('Table grid has been changed', () => {
		expect(table.props.columnWidthChange?.cols).toEqual([
			twip(480),
			twip(480),
			twip(480),
			twip(480),
		]);
	});

	it('Row 0 has the correct amount of cells', () =>
		expect(table.children[0].children).toHaveLength(2));

	it('Row 1 has the correct amount of cells', () =>
		expect(table.children[1].children).toHaveLength(1));

	it('Row 2 has the correct amount of cells', () =>
		expect(table.children[2].children).toHaveLength(1));

	it('Cell 0 (rowspan and colspan) is parsed correctly', () => {
		const cell = table.children[0].children[0];
		expect(cell.props.colSpan).toBe(2);
		expect(cell.props.rowSpan).toBe(2);
		expect(cell.children).toHaveLength(1);
	});

	it('Cell 1 (no spans) is parsed correctly', () => {
		const cell = table.children[0].children[1];
		expect(cell.props.colSpan).toBe(1);
		expect(cell.props.rowSpan).toBe(1);
		expect(cell.children).toHaveLength(1);
	});

	it('Cell 2 (rowspan) is parsed correctly', () => {
		const cell = table.children[1].children[0];
		expect(cell.props.colSpan).toBe(1);
		expect(cell.props.rowSpan).toBe(2);
		expect(cell.children).toHaveLength(1);
	});

	it('Cell 3 (colspan) is parsed correctly', () => {
		const cell = table.children[2].children[0];
		expect(cell.props.colSpan).toBe(2);
		expect(cell.props.rowSpan).toBe(1);
		expect(cell.children).toHaveLength(1);
	});
});
