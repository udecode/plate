import { ContentSlice, type Element, NodeApi } from '@platejs/plite';

import type {
  TableCellElementWithId,
  TableRowElementWithId,
} from '../__tests__/tableTestTypes';
import type { TableCellElement, TableRowElement } from '../BaseTablePlugin';
import { createDetachedTableContext } from './context';
import { compileTableGrid } from './grid';
import {
  applyTableMutationPlanToTable,
  type TableCellFactory,
} from './mutation';
import {
  createOrdinaryTablePasteElement,
  getTablePasteElement,
  planPreparedTablePaste,
  prepareTablePaste,
  type TablePasteSource,
} from './paste';

let generatedId = 0;

const cell = (
  text: string,
  options: Partial<TableCellElementWithId> = {}
): TableCellElementWithId => ({
  children: [{ text }],
  id: options.id ?? `cell-${(generatedId += 1) - 1}`,
  type: 'tableCell',
  ...options,
});

const row = (
  children: readonly TableCellElement[],
  options: Partial<TableRowElementWithId> = {}
): TableRowElementWithId => ({
  children: [...children],
  id: options.id ?? `row-${(generatedId += 1) - 1}`,
  type: 'tableRow',
  ...options,
});

const table = (
  rows: readonly TableRowElement[],
  options: Partial<Element> = {}
): Element => ({
  children: [...rows],
  id: options.id ?? `table-${(generatedId += 1) - 1}`,
  type: 'table',
  ...options,
});

const createCell: TableCellFactory = ({ header }) =>
  cell('', { ...(header ? { header: true } : {}), type: 'tableCell' });

const createRow = () => row([]);

const prepare = (source: Element) =>
  prepareTablePaste(source, {
    createCell,
    createRow,
    source: 'model',
  });

const paste = (
  target: Element,
  source: Element,
  options: Partial<Parameters<typeof planPreparedTablePaste>[2]> = {}
) => {
  const prepared = prepare(source);

  if ('kind' in prepared) throw new Error(JSON.stringify(prepared));

  const result = planPreparedTablePaste(
    createDetachedTableContext(target, [0]),
    prepared,
    {
      createCell,
      createRow,
      fitChildren: (_cell, children) => children,
      startCol: 0,
      startRow: 0,
      ...options,
    }
  );

  expect(result.kind).toBe('plan');
  if (result.kind !== 'plan') throw new Error(JSON.stringify(result));

  const output = applyTableMutationPlanToTable(target, [0], result);

  expect(output).not.toBeNull();

  return { output: output!, plan: result, prepared };
};

const logicalText = (value: Element) => {
  const grid = compileTableGrid(value);

  return grid.slots.map((slots) =>
    slots.map((anchor) => (anchor ? NodeApi.string(anchor.cell) : null))
  );
};

const types = {
  cellTypes: ['tableCell'],
  rowType: 'tableRow',
  tableType: 'table',
} as const;

const tableWithSpan = (
  height: number,
  width: number,
  span: {
    maxCol: number;
    maxRow: number;
    minCol: number;
    minRow: number;
  }
) =>
  table(
    Array.from({ length: height }, (_, rowIndex) => {
      const cells: TableCellElement[] = [];

      for (let colIndex = 0; colIndex < width; colIndex++) {
        const insideSpan =
          rowIndex >= span.minRow &&
          rowIndex <= span.maxRow &&
          colIndex >= span.minCol &&
          colIndex <= span.maxCol;

        if (!insideSpan) {
          cells.push(cell(`${rowIndex}:${colIndex}`));
          continue;
        }
        if (rowIndex === span.minRow && colIndex === span.minCol) {
          cells.push(
            cell('merged', {
              colSpan: span.maxCol - span.minCol + 1,
              rowSpan: span.maxRow - span.minRow + 1,
            })
          );
        }
      }

      return row(cells);
    })
  );

describe('PreparedTablePaste Wordgard oracle', () => {
  beforeEach(() => {
    generatedId = 0;
  });

  it('1. delegates ordinary content inside one cell', () => {
    const slice = ContentSlice.closed([{ text: '?' }]);

    expect(getTablePasteElement(slice, types)).toBeNull();
  });

  it('2. repeats ordinary content across a cell selection', () => {
    const target = table([
      row([cell('a'), cell('b'), cell('c')]),
      row([cell('d'), cell('e'), cell('f')]),
    ]);
    const ordinary = createOrdinaryTablePasteElement([{ text: '!' }], {
      cell: cell(''),
      rowType: 'tr',
      tableType: 'table',
    });
    const { output } = paste(target, ordinary, {
      fillBounds: { maxCol: 1, maxRow: 1, minCol: 0, minRow: 0 },
    });

    expect(logicalText(output)).toEqual([
      ['!', '!', 'c'],
      ['!', '!', 'f'],
    ]);
  });

  it('3. expands a bare cell sequence from the active cell', () => {
    const cells = [cell('x'), cell('y')];
    const source = getTablePasteElement(ContentSlice.closed(cells), types);

    expect(source).not.toBeNull();

    const { output } = paste(
      table([row([cell('a'), cell('b'), cell('c')])]),
      source!
    );

    expect(logicalText(output)).toEqual([['x', 'y', 'c']]);
  });

  it('4. grows a table horizontally', () => {
    const { output } = paste(
      table([row([cell('a')]), row([cell('b')])]),
      table([row([cell('x'), cell('y')])])
    );

    expect(logicalText(output)).toEqual([
      ['x', 'y'],
      ['b', ''],
    ]);
  });

  it('5. grows a table vertically', () => {
    const { output } = paste(
      table([row([cell('a'), cell('b')])]),
      table([row([cell('x')]), row([cell('y')])])
    );

    expect(logicalText(output)).toEqual([
      ['x', 'b'],
      ['y', ''],
    ]);
  });

  it('6. recognizes retained open table content', () => {
    const source = table([row([cell('x')]), row([cell('y')])]);
    const slice = ContentSlice.fromJSON({
      content: [source],
      openEnd: 2,
      openStart: 2,
    });
    const opened = getTablePasteElement(slice, types);

    expect(opened).toEqual(source);

    const { output } = paste(table([row([cell('a'), cell('b')])]), opened!);

    expect(logicalText(output)).toEqual([
      ['x', 'b'],
      ['y', ''],
    ]);
  });

  it('7. recognizes a full table', () => {
    const source = table([
      row([cell('x'), cell('y')]),
      row([cell('z'), cell('q')]),
    ]);
    const extracted = getTablePasteElement(
      ContentSlice.closed([source]),
      types
    );

    expect(extracted).toEqual(source);

    const { output } = paste(table([row([cell('a'), cell('b')])]), extracted!, {
      startCol: 1,
    });

    expect(logicalText(output)).toEqual([
      ['a', 'x', 'y'],
      ['', 'z', 'q'],
    ]);
  });

  it('8. splits a merged cell on the left selection border', () => {
    const target = table([
      row([cell('a'), cell('b'), cell('c')]),
      row([cell('d', { colSpan: 2 }), cell('e')]),
      row([cell('f'), cell('g'), cell('h')]),
    ]);
    const { output } = paste(target, table([row([cell('x')])]), {
      fillBounds: { maxCol: 1, maxRow: 2, minCol: 1, minRow: 0 },
    });

    expect(logicalText(output)).toEqual([
      ['a', 'x', 'c'],
      ['d', 'x', 'e'],
      ['f', 'x', 'h'],
    ]);
    expect(compileTableGrid(output).problems).toEqual([]);
  });

  it('9. splits a merged cell on the right selection border', () => {
    const target = table([
      row([cell('a'), cell('b'), cell('c')]),
      row([cell('d'), cell('e', { colSpan: 2 })]),
      row([cell('f'), cell('g'), cell('h')]),
    ]);
    const { output } = paste(target, table([row([cell('x')])]), {
      fillBounds: { maxCol: 1, maxRow: 2, minCol: 1, minRow: 0 },
    });

    expect(logicalText(output)).toEqual([
      ['a', 'x', 'c'],
      ['d', 'x', ''],
      ['f', 'x', 'h'],
    ]);
    expect(compileTableGrid(output).problems).toEqual([]);
  });

  it('10. splits merged cells on vertical selection borders', () => {
    const target = table([
      row([cell('a'), cell('b', { rowSpan: 3 }), cell('c')]),
      row([cell('d'), cell('e')]),
      row([cell('f'), cell('h')]),
    ]);
    const { output } = paste(target, table([row([cell('x')])]), {
      fillBounds: { maxCol: 2, maxRow: 1, minCol: 0, minRow: 1 },
    });

    expect(logicalText(output)).toEqual([
      ['a', 'b', 'c'],
      ['x', 'x', 'x'],
      ['f', '', 'h'],
    ]);
    expect(compileTableGrid(output).problems).toEqual([]);
  });

  it('11. splits spans crossing all four selection boundaries', () => {
    const target = table([
      row([cell('a'), cell('b'), cell('c', { rowSpan: 2 }), cell('d')]),
      row([cell('e'), cell('f'), cell('g')]),
      row([cell('h', { colSpan: 4 })]),
      row([
        cell('i'),
        cell('j', { rowSpan: 2 }),
        cell('k'),
        cell('l', { rowSpan: 2 }),
      ]),
      row([cell('m'), cell('n')]),
    ]);
    const { output } = paste(target, table([row([cell('x')])]), {
      fillBounds: { maxCol: 2, maxRow: 3, minCol: 1, minRow: 1 },
    });

    expect(logicalText(output)).toEqual([
      ['a', 'b', 'c', 'd'],
      ['e', 'x', 'x', 'g'],
      ['h', 'x', 'x', ''],
      ['i', 'x', 'x', 'l'],
      ['m', '', 'n', 'l'],
    ]);
    expect(compileTableGrid(output).problems).toEqual([]);
  });

  it('12. clips and repeats source content to the selection size', () => {
    const target = table([
      row([cell('a'), cell('b')]),
      row([cell('c'), cell('d')]),
      row([cell('e'), cell('f')]),
    ]);
    const source = table([
      row([cell('x'), cell('y')]),
      row([cell('z'), cell('q')]),
    ]);
    const { output } = paste(target, source, {
      fillBounds: { maxCol: 1, maxRow: 2, minCol: 1, minRow: 0 },
    });

    expect(logicalText(output)).toEqual([
      ['a', 'x'],
      ['c', 'z'],
      ['e', 'x'],
    ]);
  });

  it('13. rectangularizes non-rectangular input before planning', () => {
    const source = table([
      row([cell('b'), cell('c'), cell('d')]),
      row([cell('e', { colSpan: 2, rowSpan: 2 })]),
    ]);
    const { output, prepared } = paste(table([row([cell('a')])]), source);

    expect(prepared).toMatchObject({
      height: 3,
      source: 'model',
      width: 3,
    });
    expect(logicalText(output)).toEqual([
      ['b', 'c', 'd'],
      ['e', 'e', ''],
      ['e', 'e', ''],
    ]);
    expect(compileTableGrid(output).problems).toEqual([]);
  });
});

describe('PreparedTablePaste planning contracts', () => {
  beforeEach(() => {
    generatedId = 0;
  });

  it('fits each used source anchor once, not each destination', () => {
    const source = table([row([cell('x'), cell('y')])]);
    const prepared = prepare(source);

    if ('kind' in prepared) throw new Error(JSON.stringify(prepared));

    let fits = 0;
    const result = planPreparedTablePaste(
      createDetachedTableContext(
        table([
          row([cell('a'), cell('b'), cell('c'), cell('d')]),
          row([cell('e'), cell('f'), cell('g'), cell('h')]),
        ]),
        [0]
      ),
      prepared,
      {
        createCell,
        createRow,
        fillBounds: { maxCol: 3, maxRow: 1, minCol: 0, minRow: 0 },
        fitChildren: (_cell, children) => {
          fits += 1;
          return children;
        },
        startCol: 0,
        startRow: 0,
      }
    );

    expect(result.kind).toBe('plan');
    expect(fits).toBe(2);
  });

  it('consumes content rejection as an immutable diagnostic plan result', () => {
    const prepared = prepare(table([row([cell('x')])]));

    if ('kind' in prepared) throw new Error(JSON.stringify(prepared));

    const result = planPreparedTablePaste(
      createDetachedTableContext(table([row([cell('a')])]), [0]),
      prepared,
      {
        createCell,
        createRow,
        fitChildren: () => null,
        startCol: 0,
        startRow: 0,
      }
    );

    expect(result).toEqual({
      kind: 'invalid-source',
      reason: 'content-rejected',
      sourceCellKey: prepared.grid.anchors[0].key,
    });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it('keeps a hot local paste independent of total target row count', () => {
    const source = table([
      row([cell('x'), cell('y')]),
      row([cell('z'), cell('q')]),
    ]);
    const prepared = prepare(source);

    if ('kind' in prepared) throw new Error(JSON.stringify(prepared));

    const target = table(
      Array.from({ length: 128 }, (_, rowIndex) =>
        row(
          Array.from({ length: 128 }, (innerValue, colIndex) =>
            cell(`${rowIndex}:${colIndex}`)
          )
        )
      )
    );
    const result = planPreparedTablePaste(
      createDetachedTableContext(target, [0]),
      prepared,
      {
        createCell,
        createRow,
        fitChildren: (_cell, children) => children,
        startCol: 62,
        startRow: 62,
      }
    );

    expect(result.kind).toBe('plan');
    if (result.kind !== 'plan') return;

    expect(result.operations).toHaveLength(4);
    expect(result.operations.map(({ path }) => path)).toEqual([
      [0, 62, 62],
      [0, 62, 63],
      [0, 63, 62],
      [0, 63, 63],
    ]);
  });

  it('uses source only as diagnostic metadata', () => {
    const source = table([row([cell('x'), cell('y')])]);
    const target = table([row([cell('a'), cell('b')])]);
    const outputs = (
      ['csv', 'html', 'model', 'tsv'] satisfies TablePasteSource[]
    ).map((sourceKind) => {
      const prepared = prepareTablePaste(source, {
        createCell,
        createRow,
        source: sourceKind,
      });

      if ('kind' in prepared) throw new Error(JSON.stringify(prepared));

      const result = planPreparedTablePaste(
        createDetachedTableContext(target, [0]),
        prepared,
        {
          createCell,
          createRow,
          fitChildren: (_cell, children) => children,
          startCol: 0,
          startRow: 0,
        }
      );

      if (result.kind !== 'plan') throw new Error(JSON.stringify(result));

      return result.operations;
    });

    expect(outputs.slice(1)).toEqual([outputs[0], outputs[0], outputs[0]]);
  });

  it('isolates arbitrary spans crossing all four destination boundaries', () => {
    const selection = { maxCol: 3, maxRow: 3, minCol: 2, minRow: 2 };
    let cases = 0;

    for (let minRow = 0; minRow < selection.minRow; minRow++) {
      for (let maxRow = selection.maxRow + 1; maxRow < 6; maxRow++) {
        for (let minCol = 0; minCol < selection.minCol; minCol++) {
          for (let maxCol = selection.maxCol + 1; maxCol < 6; maxCol++) {
            const target = tableWithSpan(6, 6, {
              maxCol,
              maxRow,
              minCol,
              minRow,
            });
            const { output } = paste(target, table([row([cell('x')])]), {
              fillBounds: selection,
            });
            const grid = compileTableGrid(output);

            expect(grid.problems).toEqual([]);
            expect(grid.height).toBe(6);
            expect(grid.width).toBe(6);
            expect(
              grid.slots
                .slice(selection.minRow, selection.maxRow + 1)
                .flatMap((slots) =>
                  slots
                    .slice(selection.minCol, selection.maxCol + 1)
                    .map((anchor) =>
                      anchor ? NodeApi.string(anchor.cell) : null
                    )
                )
            ).toEqual(['x', 'x', 'x', 'x']);
            cases += 1;
          }
        }
      }
    }

    expect(cases).toBe(16);
  });
});
