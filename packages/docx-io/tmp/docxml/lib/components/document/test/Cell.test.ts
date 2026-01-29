import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { Archive } from '../../../classes/src/Archive.ts';
import type { ComponentContext } from '../../../classes/src/Component.ts';
import { create } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';
import {
	evaluateXPathToFirstNode,
	evaluateXPathToNodes,
} from '../../../utilities/src/xquery.ts';
import { Cell } from '../src/Cell.ts';
import { Table } from '../src/Table.ts';

const emptyContext: ComponentContext = {
	archive: new Archive(),
	relationships: null,
};

describe('Cell', () => {
	const dom = create(`<w:tbl xmlns:w="${NamespaceUri.w}">
		<w:tblGrid>
			<w:gridCol w:w="4319" />
			<w:gridCol w:w="4319" />
		</w:tblGrid>
		<w:tr>
			<w:trPr />
			<w:tc xid="cell-1">
				<w:p>
					<w:r>
						<w:t xml:space="preserve">A 1</w:t>
					</w:r>
				</w:p>
			</w:tc>
			<w:tc xid="cell-2">
				<w:p>
					<w:r>
						<w:t xml:space="preserve">B 1</w:t>
					</w:r>
				</w:p>
			</w:tc>
		</w:tr>
		<w:tr>
			<w:trPr />
			<w:tc xid="cell-3">
				<w:tcPr>
					<w:gridSpan w:val="2" />
				</w:tcPr>
				<w:p>
					<w:r>
						<w:t xml:space="preserve">A+B 2</w:t>
					</w:r>
				</w:p>
			</w:tc>
		</w:tr>
	</w:tbl>`);

	describe('Cell 1', () => {
		const cell = Cell.fromNode(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			evaluateXPathToFirstNode('.//*[@xid="cell-1"]', dom)!,
			emptyContext
		);
		it('Colspan', () => expect(cell?.props.colSpan).toBe(1));
		it('Rowspan', () => expect(cell?.props.rowSpan).toBe(1));
	});
	describe('Cell 2', () => {
		const cell = Cell.fromNode(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			evaluateXPathToFirstNode('.//*[@xid="cell-2"]', dom)!,
			emptyContext
		);
		it('Colspan', () => expect(cell?.props.colSpan).toBe(1));
		it('Rowspan', () => expect(cell?.props.rowSpan).toBe(1));
	});
	describe('Cell 3', () => {
		const cell = Cell.fromNode(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			evaluateXPathToFirstNode('.//*[@xid="cell-3"]', dom)!,
			emptyContext
		);
		it('Colspan', () => expect(cell?.props.colSpan).toBe(2));
		it('Rowspan', () => expect(cell?.props.rowSpan).toBe(1));
	});
});

describe('Cell - with colspan', () => {
	const tableNode = create(`
		<w:tbl xmlns:w="${NamespaceUri.w}">
			<w:tblGrid>
				<w:gridCol w:w="1129"/>
				<w:gridCol w:w="2268"/>
				<w:gridCol w:w="4536"/>
				<w:gridCol w:w="1083"/>
			</w:tblGrid>
			<w:tr>
				<w:tc>
					<w:tcPr>
						<w:tcW w:w="1129" w:type="dxa"/>
					</w:tcPr>
					<w:p/>
				</w:tc>
				<w:tc>
					<w:tcPr>
						<w:tcW w:w="7887" w:type="dxa"/>
						<w:gridSpan w:val="3"/>
					</w:tcPr>
				<w:p/>
				</w:tc>
			</w:tr>
			<w:tr>
				<w:tc>
					<w:tcPr>
						<w:tcW w:w="1129" w:type="dxa"/>
					</w:tcPr>
					<w:p/>
				</w:tc>
				<w:tc>
					<w:tcPr>
						<w:tcW w:w="7887" w:type="dxa"/>
						<w:gridSpan w:val="3"/>
					</w:tcPr>
				<w:p/>
				</w:tc>
			</w:tr>
			<w:tr>
				<w:trPr>
				<w:trHeight w:val="949"/>
				</w:trPr>
				<w:tc>
					<w:tcPr>
						<w:tcW w:w="1129" w:type="dxa"/>
					</w:tcPr>
					<w:p/>
				</w:tc>
				<w:tc>
					<w:tcPr>
						<w:tcW w:w="7887" w:type="dxa"/>
						<w:gridSpan w:val="3"/>
					</w:tcPr>
				<w:p/>
				</w:tc>
			</w:tr>
			<w:tr>
				<w:tc>
					<w:tcPr>
						<w:tcW w:w="1129" w:type="dxa"/>
					</w:tcPr>
					<w:p/>
				</w:tc>
				<w:tc>
					<w:tcPr>
						<w:tcW w:w="2268" w:type="dxa"/>
					</w:tcPr>
					<w:p/>
				</w:tc>
				<w:tc>
					<w:tcPr>
						<w:tcW w:w="4536" w:type="dxa"/>
					</w:tcPr>
					<w:p/>
				</w:tc>
				<w:tc>
					<w:tcPr>
						<w:tcW w:w="1083" w:type="dxa"/>
					</w:tcPr>
					<w:p/>
				</w:tc>
			</w:tr>
		</w:tbl>
	`);

	it('cell width', async () => {
		const fromNode = Table.fromNode(tableNode, emptyContext);
		const toNode = await fromNode.toNode([]);

		const originalCellWidths = evaluateXPathToNodes(
			`./descendant::Q{${NamespaceUri.w}}tcW`,
			tableNode
		).map((tcW) => (tcW as Element).getAttributeNS(NamespaceUri.w, 'w'));
		const newCellWidths = evaluateXPathToNodes(
			`./descendant::Q{${NamespaceUri.w}}tcW`,
			toNode
		).map((tcW) => (tcW as Element).getAttributeNS(NamespaceUri.w, 'w'));

		expect(originalCellWidths).toEqual(newCellWidths);
	});
});
