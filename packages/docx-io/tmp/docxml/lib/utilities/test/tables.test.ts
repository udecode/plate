import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { Cell } from '../../components/document/src/Cell.ts';
import { Row } from '../../components/document/src/Row.ts';
import { Table } from '../../components/document/src/Table.ts';
import { TableGridModel } from '../src/tables.ts';

function getAllCells(table: Table) {
	return table.children.reduce<Cell[]>(
		(cells, row) => [...cells, ...row.children],
		[]
	);
}
describe('Table grid models', () => {
	describe('Simple table', () => {
		// +----+----+----+
		// |0   |1   |2   |
		// +----+----+----+
		// |3   |4   |5   |
		// +----+----+----+
		// |6   |7   |8   |
		// +----+----+----+
		const table = new Table(
			{},
			new Row({}, new Cell({}), new Cell({}), new Cell({})),
			new Row({}, new Cell({}), new Cell({}), new Cell({}))
		);
		const model = new TableGridModel(table);
		const cells = getAllCells(table);
		it('getCellInfo()', () => {
			const cellSizes = cells.map((node) => model.getCellInfo(node));
			expect(cellSizes).toEqual([
				{ row: 0, column: 0, colspan: 1, rowspan: 1 },
				{ row: 0, column: 1, colspan: 1, rowspan: 1 },
				{ row: 0, column: 2, colspan: 1, rowspan: 1 },
				{ row: 1, column: 0, colspan: 1, rowspan: 1 },
				{ row: 1, column: 1, colspan: 1, rowspan: 1 },
				{ row: 1, column: 2, colspan: 1, rowspan: 1 },
			]);
		});
		it('getNodeAtCell()', () => {
			expect(model.getNodeAtCell(0, 0)).toBe(cells[0]);
			expect(model.getNodeAtCell(1, 0)).toBe(cells[1]);
			expect(model.getNodeAtCell(2, 0)).toBe(cells[2]);
			expect(model.getNodeAtCell(3, 0)).toBeNull();
			expect(model.getNodeAtCell(0, 1)).toBe(cells[3]);
			expect(model.getNodeAtCell(1, 1)).toBe(cells[4]);
			expect(model.getNodeAtCell(2, 1)).toBe(cells[5]);
			expect(model.getNodeAtCell(3, 1)).toBeNull();
			expect(model.getNodeAtCell(4, 0)).toBeNull();
		});
	});

	describe('Rectangular table with colspans', () => {
		// +---------+----+
		// |0        |1   |
		// +----+----+----+
		// |2   |3        |
		// +----+---------+
		const table = new Table(
			{},
			new Row({}, new Cell({ colSpan: 2 }), new Cell({})),
			new Row({}, new Cell({}), new Cell({ colSpan: 2 }))
		);
		const model = new TableGridModel(table);
		const cells = getAllCells(table);
		it('getCellInfo()', () => {
			const cellSizes = cells.map((node) => model.getCellInfo(node));
			expect(cellSizes).toEqual([
				{ row: 0, column: 0, colspan: 2, rowspan: 1 },
				{ row: 0, column: 2, colspan: 1, rowspan: 1 },
				{ row: 1, column: 0, colspan: 1, rowspan: 1 },
				{ row: 1, column: 1, colspan: 2, rowspan: 1 },
			]);
		});
		it('getNodeAtCell()', () => {
			expect(model.getNodeAtCell(0, 0)).toBe(cells[0]);
			expect(model.getNodeAtCell(1, 0)).toBe(cells[0]);
			expect(model.getNodeAtCell(2, 0)).toBe(cells[1]);
			expect(model.getNodeAtCell(3, 0)).toBeNull();

			expect(model.getNodeAtCell(0, 1)).toBe(cells[2]);
			expect(model.getNodeAtCell(1, 1)).toBe(cells[3]);
			expect(model.getNodeAtCell(2, 1)).toBe(cells[3]);
			expect(model.getNodeAtCell(3, 1)).toBeNull();

			expect(model.getNodeAtCell(4, 0)).toBeNull();
		});
	});

	describe('Rectangular table with rowspans', () => {
		//    +----+----+
		//    |0   |1   |
		//    |    +----|
		//    |    |2   |
		//    +----|    |
		//    |3   |    |
		//    +----+----+
		const table = new Table(
			{},
			new Row({}, new Cell({ rowSpan: 2 }), new Cell({})),
			new Row({}, new Cell({ rowSpan: 2 })),
			new Row({}, new Cell({}))
		);
		const model = new TableGridModel(table);
		const cells = getAllCells(table);
		it('getCellInfo()', () => {
			const cellSizes = cells.map((node) => model.getCellInfo(node));
			expect(cellSizes).toEqual([
				{ row: 0, column: 0, colspan: 1, rowspan: 2 },
				{ row: 0, column: 1, colspan: 1, rowspan: 1 },
				{ row: 1, column: 1, colspan: 1, rowspan: 2 },
				{ row: 2, column: 0, colspan: 1, rowspan: 1 },
			]);
		});
		it('getNodeAtCell()', () => {
			expect(model.getNodeAtCell(0, 0)).toBe(cells[0]);
			expect(model.getNodeAtCell(1, 0)).toBe(cells[1]);
			expect(model.getNodeAtCell(2, 0)).toBeNull();
			expect(model.getNodeAtCell(0, 1)).toBe(cells[0]);
			expect(model.getNodeAtCell(1, 1)).toBe(cells[2]);
			expect(model.getNodeAtCell(2, 1)).toBeNull();
			expect(model.getNodeAtCell(0, 2)).toBe(cells[3]);
			expect(model.getNodeAtCell(1, 2)).toBe(cells[2]);
			expect(model.getNodeAtCell(2, 2)).toBeNull();
			expect(model.getNodeAtCell(0, 3)).toBeNull();
		});
	});

	describe('Rectangular table with colspans and rowspans', () => {
		//    +---------+----+
		//    |0        |1   |
		//    |         +----+
		//    |         |2   |
		//    +---------+    |
		//    |3        |    |
		//    +---------+----+
		const table = new Table(
			{},
			new Row({}, new Cell({ colSpan: 2, rowSpan: 2 }), new Cell({})),
			new Row({}, new Cell({ rowSpan: 2 })),
			new Row({}, new Cell({ colSpan: 2 })),
			new Row({})
		);
		const model = new TableGridModel(table);
		const cells = getAllCells(table);
		it('getCellInfo()', () => {
			const cellSizes = cells.map((node) => model.getCellInfo(node));
			expect(cellSizes).toEqual([
				{ row: 0, column: 0, colspan: 2, rowspan: 2 },
				{ row: 0, column: 2, colspan: 1, rowspan: 1 },
				{ row: 1, column: 2, colspan: 1, rowspan: 2 },
				{ row: 2, column: 0, colspan: 2, rowspan: 1 },
			]);
		});
		it('getNodeAtCell()', () => {
			expect(model.getNodeAtCell(0, 0)).toBe(cells[0]);
			expect(model.getNodeAtCell(1, 0)).toBe(cells[0]);
			expect(model.getNodeAtCell(2, 0)).toBe(cells[1]);
			expect(model.getNodeAtCell(3, 0)).toBeNull();
			expect(model.getNodeAtCell(0, 1)).toBe(cells[0]);
			expect(model.getNodeAtCell(1, 1)).toBe(cells[0]);
			expect(model.getNodeAtCell(2, 1)).toBe(cells[2]);
			expect(model.getNodeAtCell(3, 1)).toBeNull();
			expect(model.getNodeAtCell(0, 2)).toBe(cells[3]);
			expect(model.getNodeAtCell(1, 2)).toBe(cells[3]);
			expect(model.getNodeAtCell(2, 2)).toBe(cells[2]);
			expect(model.getNodeAtCell(3, 2)).toBeNull();
			expect(model.getNodeAtCell(0, 3)).toBeNull();
		});
	});
});
