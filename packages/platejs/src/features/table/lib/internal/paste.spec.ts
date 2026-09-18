import { ContentSlice, type Element, NodeApi } from '../../../../core';
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
  getTablePasteElement,
  planPreparedTablePaste,
  prepareTablePaste,
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

const prepare = (source: Element) => {
  const prepared = prepareTablePaste(ContentSlice.closed([source]), {
    createCell,
    createRow,
    tableType: 'table',
  });

  if (!prepared) throw new Error('Expected a structural table slice');

  return prepared;
};

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
      startCol: 0,
      startRow: 0,
      ...options,
    }
  );

  expect(result.kind).toBe('plan');
  if (result.kind !== 'plan') throw new Error(JSON.stringify(result));

  const output = applyTableMutationPlanToTable(target, [0], {
    ...result,
    operations: [
      ...result.operations,
      ...result.placementGroups.flatMap((group) =>
        group.placements.map(({ at, content }) => ({
          children: content,
          kind: 'replace-children' as const,
          path: at,
        }))
      ),
    ],
  });

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

describe('structural table paste classification', () => {
  it.each([
    { openStart: 1, openEnd: 0 },
    { openStart: 0, openEnd: 1 },
    { openStart: 2, openEnd: 2 },
  ])('declines an open table slice ($openStart, $openEnd)', (depths) => {
    const slice = ContentSlice.fromJSON({
      content: [table([row([cell('table')])])],
      ...depths,
    });

    expect(getTablePasteElement(slice, types)).toBeNull();
    expect(
      prepareTablePaste(slice, { ...types, createCell, createRow })
    ).toBeNull();
  });

  it.each(['before', 'after', 'both'] as const)(
    'declines a table with ordinary siblings %s',
    (position) => {
      const sibling = () => ({
        type: 'paragraph',
        children: [{ text: 'keep me' }],
      });
      const slice = ContentSlice.closed([
        ...(position !== 'after' ? [sibling()] : []),
        table([row([cell('table')])]),
        ...(position !== 'before' ? [sibling()] : []),
      ]);

      expect(getTablePasteElement(slice, types)).toBeNull();
      expect(
        prepareTablePaste(slice, { ...types, createCell, createRow })
      ).toBeNull();
    }
  );

  it('declines multiple tables, row lists and cell lists', () => {
    for (const content of [
      [table([row([cell('one')])]), table([row([cell('two')])])],
      [row([cell('one')]), row([cell('two')])],
      [cell('one'), cell('two')],
    ]) {
      const slice = ContentSlice.closed(content);

      expect(getTablePasteElement(slice, types)).toBeNull();
      expect(
        prepareTablePaste(slice, { ...types, createCell, createRow })
      ).toBeNull();
    }
  });

  it('accepts the single closed table by its configured type', () => {
    const slice = ContentSlice.closed([
      table([row([cell('table')])], { type: 'customTable' }),
    ]);

    expect(
      getTablePasteElement(slice, { ...types, tableType: 'customTable' }) ===
        slice.content[0]
    ).toBe(true);
    expect(getTablePasteElement(slice, types)).toBeNull();
    expect(
      prepareTablePaste(slice, { ...types, createCell, createRow })
    ).toBeNull();

    const prepared = prepareTablePaste(slice, {
      createCell,
      createRow,
      tableType: 'customTable',
    });

    expect(prepared).toMatchObject({ height: 1, width: 1 });
    if (!prepared || 'kind' in prepared) {
      throw new Error(JSON.stringify(prepared));
    }
    expect(prepared.slice).toBe(slice);
  });

  it('diagnoses an empty structural table instead of declining it', () => {
    const slice = ContentSlice.closed([table([])]);

    expect(getTablePasteElement(slice, types) === slice.content[0]).toBe(true);
    expect(
      prepareTablePaste(slice, { ...types, createCell, createRow })
    ).toEqual({
      kind: 'invalid-source',
      reason: 'empty',
    });
  });
});

describe('PreparedTablePaste Wordgard oracle', () => {
  beforeEach(() => {
    generatedId = 0;
  });

  it('1. delegates ordinary content inside one cell', () => {
    const slice = ContentSlice.closed([{ text: '?' }]);

    expect(getTablePasteElement(slice, types)).toBeNull();
  });

  it('delegates ordinary rich content as a complete slice', () => {
    const slice = ContentSlice.closed([
      { type: 'paragraph', children: [{ text: '!', bold: true }] },
      { type: 'image', url: 'image.png', children: [{ text: '' }] },
    ]);

    expect(
      prepareTablePaste(slice, { ...types, createCell, createRow })
    ).toBeNull();
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

  it('8. splits a merged cell crossing a selection border', () => {
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

  it('9. clips and repeats a partial source tile', () => {
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

  it('keeps each repeated source tile as an independent placement group', () => {
    const source = table([row([cell('x'), cell('y')])]);
    const prepared = prepare(source);

    if ('kind' in prepared) throw new Error(JSON.stringify(prepared));

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
        startCol: 0,
        startRow: 0,
      }
    );

    expect(result.kind).toBe('plan');
    if (result.kind !== 'plan') throw new Error(JSON.stringify(result));
    expect(result.placementGroups).toHaveLength(4);
    expect(
      result.placementGroups.every((group) => group.source === prepared.slice)
    ).toBe(true);
    expect(
      result.placementGroups.flatMap((group) => group.placements)
    ).toHaveLength(8);
  });

  it('keeps source content unfitted until the transaction owns destination roots', () => {
    const prepared = prepare(table([row([cell('x')])]));

    if ('kind' in prepared) throw new Error(JSON.stringify(prepared));

    const result = planPreparedTablePaste(
      createDetachedTableContext(table([row([cell('a')])]), [0]),
      prepared,
      {
        createCell,
        createRow,
        startCol: 0,
        startRow: 0,
      }
    );

    expect(result.kind).toBe('plan');
    if (result.kind !== 'plan') throw new Error(JSON.stringify(result));
    expect(result.placementGroups[0]?.source).toBe(prepared.slice);
    expect(result.placementGroups[0]?.placements[0]?.content).toEqual([
      { text: 'x' },
    ]);
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
        startCol: 62,
        startRow: 62,
      }
    );

    expect(result.kind).toBe('plan');
    if (result.kind !== 'plan') return;

    expect(result.operations).toHaveLength(0);
    expect(
      result.placementGroups.flatMap((group) =>
        group.placements.map(({ at }) => at)
      )
    ).toEqual([
      [0, 62, 62],
      [0, 62, 63],
      [0, 63, 62],
      [0, 63, 63],
    ]);
  });

  it('retains the complete source root graph through preparation and planning', () => {
    const source = table([
      row([
        cell('', {
          children: [
            {
              type: 'portal',
              childRoots: { body: 'source-owned' },
              children: [{ text: '' }],
            },
          ],
        }),
        cell('y'),
      ]),
    ]);
    const slice = ContentSlice.fromJSON({
      content: [source],
      openStart: 0,
      openEnd: 0,
      roots: {
        'source-owned': [
          {
            type: 'portal',
            childRoots: { body: 'nested-owned' },
            children: [{ text: '' }],
          },
        ],
        'nested-owned': [
          {
            type: 'paragraph',
            children: [{ text: 'keep root text', bold: true }],
          },
        ],
      },
    });
    const prepared = prepareTablePaste(slice, {
      ...types,
      createCell,
      createRow,
    });

    if (!prepared || 'kind' in prepared) {
      throw new Error(JSON.stringify(prepared));
    }

    expect(prepared.slice).toBe(slice);

    const target = table([row([cell('a'), cell('b')])]);
    const result = planPreparedTablePaste(
      createDetachedTableContext(target, [0]),
      prepared,
      {
        createCell,
        createRow,
        startCol: 0,
        startRow: 0,
      }
    );

    if (result.kind !== 'plan') throw new Error(JSON.stringify(result));

    expect(result.placementGroups[0]?.source).toBe(slice);
    expect(result.placementGroups[0]?.placements[0]?.content).toEqual(
      (NodeApi.get(source, [0, 0]) as TableCellElement).children
    );
  });

  it('splits arbitrary spans crossing all four destination boundaries', () => {
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
