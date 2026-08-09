import type { Element } from '@platejs/plite';
import type { TableCellElement } from '../BaseTablePlugin';
import type {
  TableCellElementWithId,
  TableRowElementWithId,
} from '../__tests__/tableTestTypes';

import type { TableContext } from './context';
import { compileTableGrid, TABLE_CELL_OPERATION_KEY } from './grid';
import {
  applyTableMutationPlanToTable,
  planTableMutation,
  type TableCellFactory,
  type TableMutationPlan,
} from './mutation';

const cell = <TType extends string = 'tableCell'>(
  id: string,
  options: Omit<Partial<TableCellElementWithId<TType>>, 'type'> & {
    type?: TType;
  } = {}
): TableCellElementWithId<TType> =>
  ({
    [TABLE_CELL_OPERATION_KEY]: id,
    children: [{ text: id }],
    id,
    type: 'tableCell' as TType,
    ...options,
  }) as TableCellElementWithId<TType>;

const table = (rows: readonly (readonly TableCellElement[])[]): Element => ({
  children: rows.map(
    (children, index): TableRowElementWithId => ({
      children: [...children],
      id: `row-${index}`,
      type: 'tableRow',
    })
  ),
  id: 'table',
  type: 'table',
});

const context = (
  value: Element,
  tablePath: readonly number[] = [0]
): TableContext => {
  const grid = compileTableGrid(value);
  const path = [...tablePath];

  return Object.freeze({
    anchorAt: (row, col) => grid.slots[row]?.[col] ?? null,
    anchorAtPath: (cellPath) =>
      grid.byPath.get(cellPath.slice(path.length).join(',')),
    anchorOf: (value) => grid.byCell.get(value),
    entryAt: (row, col) => {
      const anchor = grid.slots[row]?.[col];

      return anchor
        ? ([anchor.cell, path.concat(anchor.path)] as const)
        : undefined;
    },
    grid,
    table: value,
    tablePath: path,
  });
};

const createCell: TableCellFactory = ({ col, header, row }) =>
  cell(`created-${row}-${col}`, {
    children: [{ text: '' }],
    type: header ? 'th' : 'td',
  });

const apply = (
  input: Element,
  plan: TableMutationPlan,
  tablePath: readonly number[] = [0]
) => applyTableMutationPlanToTable(input, tablePath, plan);

const textOf = (value: TableCellElement) =>
  value.children.map((child) => ('text' in child ? child.text : '')).join('');

const seededFactory = (prefix: string): TableCellFactory => {
  let index = 0;

  return ({ header }) =>
    cell(`${prefix}-${index++}`, {
      children: [{ text: '' }],
      type: header ? 'th' : 'td',
    });
};

describe('planTableMutation', () => {
  it('plans table creation through the same mutation dispatcher', () => {
    const input = table([[cell('a')]]);
    const result = planTableMutation(context(input, [3]), {
      kind: 'insert-table',
      options: { select: true },
    });

    expect(result).toMatchObject({
      kind: 'plan',
      operations: [
        {
          kind: 'insert-node',
          node: input,
          path: [3],
        },
      ],
      selection: {
        anchor: { offset: 0, path: [3, 0, 0, 0] },
        focus: { offset: 0, path: [3, 0, 0, 0] },
        kind: 'text',
      },
    });
  });

  it('emits frozen deterministic focused operations for column insertion', () => {
    const input = table([[cell('a', { rowSpan: 2 }), cell('b')], [cell('c')]]);
    const intent = {
      anchorKey: 'b',
      before: true,
      createCell,
      kind: 'insert-column',
    } as const;
    const first = planTableMutation(context(input), intent);
    const second = planTableMutation(context(input), intent);

    expect(first.kind).toBe('plan');
    expect(second.kind).toBe('plan');

    if (first.kind !== 'plan' || second.kind !== 'plan') return;

    expect(first.operations.map(({ kind }) => kind)).toEqual([
      'insert-node',
      'insert-node',
    ]);
    expect(
      first.operations.map((operation) =>
        'path' in operation ? operation.path : null
      )
    ).toEqual([
      [0, 0, 1],
      [0, 1, 0],
    ]);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.operations)).toBe(true);
    expect(first.operations).toEqual(second.operations);

    const output = apply(input, first);

    expect(output && compileTableGrid(output).width).toBe(3);
    expect(output && compileTableGrid(output).height).toBe(2);
    expect(output && compileTableGrid(output).problems).toEqual([]);
  });

  it('extends only anchors crossing an inserted row boundary', () => {
    const input = table([[cell('a', { rowSpan: 2 }), cell('b')], [cell('c')]]);
    const result = planTableMutation(context(input), {
      anchorKey: 'c',
      before: true,
      createCell,
      kind: 'insert-row',
      rowType: 'tr',
    });

    expect(result.kind).toBe('plan');
    if (result.kind !== 'plan') return;

    expect(result.operations.map(({ kind }) => kind)).toEqual([
      'set-node',
      'insert-node',
    ]);

    const output = apply(input, result);
    const grid = output && compileTableGrid(output);

    expect(grid?.height).toBe(3);
    expect(grid?.width).toBe(2);
    expect(grid?.byKey.get('a')?.rowSpan).toBe(3);
    expect(grid?.problems).toEqual([]);
  });

  it('preserves surviving content and ids across insert/remove column', () => {
    const input = table([
      [cell('a'), cell('b')],
      [cell('c'), cell('d')],
    ]);
    const inserted = planTableMutation(context(input), {
      anchorKey: 'a',
      createCell,
      kind: 'insert-column',
    });

    expect(inserted.kind).toBe('plan');
    if (inserted.kind !== 'plan') return;

    const withColumn = apply(input, inserted);
    expect(withColumn).not.toBeNull();
    if (!withColumn) return;

    const insertedIds = compileTableGrid(withColumn)
      .anchors.map(({ key }) => key)
      .filter((id): id is string => !!id && id.startsWith('created-'));
    const removed = planTableMutation(context(withColumn), {
      anchorKey: insertedIds[0],
      kind: 'remove-column',
    });

    expect(removed.kind).toBe('plan');
    if (removed.kind !== 'plan') return;

    const output = apply(withColumn, removed);
    const ids = output
      ? compileTableGrid(output).anchors.map(({ key }) => key)
      : [];

    expect(ids).toEqual(['a', 'b', 'c', 'd']);
    expect(output && compileTableGrid(output).problems).toEqual([]);
  });

  it('moves row-spanning anchors without losing their id or content', () => {
    const input = table([
      [cell('a'), cell('top')],
      [cell('b'), cell('move', { rowSpan: 2 })],
      [cell('c')],
      [cell('d'), cell('e')],
    ]);
    const result = planTableMutation(context(input), {
      anchorKey: 'b',
      kind: 'remove-row',
    });

    expect(result.kind).toBe('plan');
    if (result.kind !== 'plan') return;

    const output = apply(input, result);
    const grid = output && compileTableGrid(output);

    expect(grid?.byKey.get('move')).toMatchObject({ row: 1, rowSpan: 1 });
    expect(grid?.byKey.get('move')?.cell.children).toEqual([{ text: 'move' }]);
    expect(grid?.problems).toEqual([]);
  });

  it('merges and splits through stable first-cell identity', () => {
    const input = table([
      [cell('a'), cell('b')],
      [cell('c'), cell('d')],
    ]);
    const merged = planTableMutation(context(input), {
      cellKeys: ['a', 'b', 'c', 'd'],
      createCell,
      kind: 'merge',
    });

    expect(merged.kind).toBe('plan');
    if (merged.kind !== 'plan') return;

    const mergedTable = apply(input, merged);
    expect(mergedTable).not.toBeNull();
    if (!mergedTable) return;

    const mergedGrid = compileTableGrid(mergedTable);

    expect(mergedGrid.anchors).toHaveLength(1);
    expect(mergedGrid.anchors[0]).toMatchObject({
      colSpan: 2,
      key: 'a',
      rowSpan: 2,
    });
    expect(mergedGrid.anchors[0].cell.children).toEqual([
      { text: 'a' },
      { text: 'b' },
      { text: 'c' },
      { text: 'd' },
    ]);

    const split = planTableMutation(context(mergedTable), {
      anchorKey: 'a',
      createCell,
      kind: 'split',
      rowType: 'tr',
    });

    expect(split.kind).toBe('plan');
    if (split.kind !== 'plan') return;

    const output = apply(mergedTable, split);
    const splitGrid = output && compileTableGrid(output);

    expect(splitGrid?.anchors).toHaveLength(4);
    expect(splitGrid?.byKey.get('a')?.cell.children).toEqual([
      { text: 'a' },
      { text: 'b' },
      { text: 'c' },
      { text: 'd' },
    ]);
    expect(splitGrid?.problems).toEqual([]);
  });

  it('repairs one uncovered grid slot with one focused insertion', () => {
    const input = table([[cell('a'), cell('b')], [cell('c')]]);
    const repaired = planTableMutation(context(input), {
      createCell,
      kind: 'repair',
    });

    expect(repaired.kind).toBe('plan');
    if (repaired.kind !== 'plan') return;

    expect(repaired.operations).toMatchObject([
      {
        kind: 'insert-node',
        path: [0, 1, 1],
      },
    ]);

    const output = apply(input, repaired);
    expect(output).not.toBeNull();
    if (!output) return;

    expect(compileTableGrid(output).problems).toEqual([]);

    const second = planTableMutation(context(output), {
      createCell,
      kind: 'repair',
    });

    expect(second).toMatchObject({ kind: 'plan', operations: [] });
  });

  it('repairs a span collision by changing only the offending cell', () => {
    const input = table([
      [cell('a'), cell('b', { rowSpan: 2 })],
      [cell('c', { colSpan: 2 })],
    ]);
    const repaired = planTableMutation(context(input), {
      createCell,
      kind: 'repair',
    });

    expect(repaired).toMatchObject({
      kind: 'plan',
      operations: [
        {
          keys: ['colSpan'],
          kind: 'unset-node',
          path: [0, 1, 0],
        },
      ],
    });
    if (repaired.kind !== 'plan') return;

    const output = apply(input, repaired);

    expect(output && compileTableGrid(output).problems).toEqual([]);
    expect(output?.children[0].children).toEqual(input.children[0].children);
    expect(
      output && compileTableGrid(output).byKey.get('c')?.cell
    ).toMatchObject({
      children: [{ text: 'c' }],
      id: 'c',
      type: 'tableCell',
    });
  });

  it('recompiles the grid before deciding a later span collision', () => {
    const input = table([
      [
        cell('a'),
        cell('b', { rowSpan: 2 }),
        cell('x'),
        cell('y'),
        cell('d', { rowSpan: 2 }),
      ],
      [cell('c', { colSpan: 3 }), cell('e', { colSpan: 2 })],
    ]);
    const repaired = planTableMutation(context(input), {
      createCell,
      kind: 'repair',
    });

    expect(repaired).toMatchObject({
      kind: 'plan',
      operations: [
        {
          keys: ['colSpan'],
          kind: 'unset-node',
          path: [0, 1, 0],
        },
      ],
    });
    if (repaired.kind !== 'plan') return;

    const output = apply(input, repaired);
    const grid = output && compileTableGrid(output);

    expect(grid?.byKey.get('c')?.colSpan).toBe(1);
    expect(grid?.byKey.get('e')?.colSpan).toBe(2);
    expect(grid?.problems).toEqual([]);
  });

  it('returns deterministic diagnostics without operations for bad targets', () => {
    const input = table([[cell('a')]]);
    const result = planTableMutation(context(input), {
      anchorKey: 'missing',
      kind: 'remove-column',
    });

    expect(result).toEqual({
      anchorKey: 'missing',
      kind: 'missing-anchor',
    });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it('keeps generated command sequences deterministic and structurally valid', () => {
    const seeds = Array.from({ length: 32 }, (_, index) => index + 1);

    for (const initialSeed of seeds) {
      let seed = initialSeed;
      let value = table([
        [cell(`s${seed}-a`), cell(`s${seed}-b`)],
        [cell(`s${seed}-c`), cell(`s${seed}-d`)],
      ]);
      const random = () => {
        seed = (seed * 1_664_525 + 1_013_904_223) >>> 0;

        return seed;
      };

      for (let step = 0; step < 20; step++) {
        const grid = compileTableGrid(value);
        const anchor = grid.anchors[random() % grid.anchors.length];
        const requestedOperation = random() % 4;
        const operation =
          requestedOperation === 2 && grid.width === 1
            ? 0
            : requestedOperation === 3 && grid.height === 1
              ? 1
              : requestedOperation;
        const before = random() % 2 === 0;
        const prefix = `seed-${initialSeed}-step-${step}`;
        const anchorKey = anchor.key;

        expect(anchorKey).toBeDefined();
        if (!anchorKey) continue;

        let first: ReturnType<typeof planTableMutation>;
        let replay: ReturnType<typeof planTableMutation>;

        if (operation === 0) {
          first = planTableMutation(context(value), {
            anchorKey,
            before,
            createCell: seededFactory(prefix),
            kind: 'insert-column',
          });
          replay = planTableMutation(context(value), {
            anchorKey,
            before,
            createCell: seededFactory(prefix),
            kind: 'insert-column',
          });
        } else if (operation === 1) {
          first = planTableMutation(context(value), {
            anchorKey,
            before,
            createCell: seededFactory(prefix),
            kind: 'insert-row',
            rowType: 'tr',
          });
          replay = planTableMutation(context(value), {
            anchorKey,
            before,
            createCell: seededFactory(prefix),
            kind: 'insert-row',
            rowType: 'tr',
          });
        } else if (operation === 2) {
          first = planTableMutation(context(value), {
            anchorKey,
            kind: 'remove-column',
          });
          replay = planTableMutation(context(value), {
            anchorKey,
            kind: 'remove-column',
          });
        } else {
          first = planTableMutation(context(value), {
            anchorKey,
            kind: 'remove-row',
          });
          replay = planTableMutation(context(value), {
            anchorKey,
            kind: 'remove-row',
          });
        }

        expect(first.kind).toBe('plan');
        if (first.kind !== 'plan') continue;

        expect(Object.isFrozen(first)).toBe(true);
        expect(replay).toEqual(first);

        const output = apply(value, first);

        expect(output).not.toBeNull();
        if (!output) continue;

        value = output;
        const nextGrid = compileTableGrid(value);
        const keys = nextGrid.anchors.flatMap(({ key }) => (key ? [key] : []));

        expect(nextGrid.problems).toEqual([]);
        expect(new Set(keys).size).toBe(keys.length);
      }
    }
  });

  it('converges generated malformed grids through deterministic focused plans', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const input = table(
        Array.from({ length: 1 + (seed % 5) }, (_, row) =>
          Array.from({ length: 1 + ((seed + row) % 4) }, (_, col) =>
            cell(`seed-${seed}-${row}-${col}`, {
              ...(col === 0 && (seed + row) % 3 === 0
                ? { rowSpan: 2 + (seed % 3) }
                : {}),
            })
          )
        )
      );
      const first = planTableMutation(context(input), {
        createCell: seededFactory(`repair-${seed}`),
        kind: 'repair',
      });
      const replay = planTableMutation(context(input), {
        createCell: seededFactory(`repair-${seed}`),
        kind: 'repair',
      });

      expect(first.kind).toBe('plan');
      if (first.kind !== 'plan') continue;

      expect(replay).toEqual(first);
      expect(
        first.operations.every(
          ({ kind }) =>
            kind === 'insert-node' ||
            kind === 'set-node' ||
            kind === 'unset-node'
        )
      ).toBe(true);

      const output = apply(input, first);

      expect(output).not.toBeNull();
      if (!output) continue;

      const outputGrid = compileTableGrid(output);

      expect(outputGrid.problems).toEqual([]);
      for (const anchor of compileTableGrid(input).anchors) {
        if (!anchor.key) continue;

        expect(textOf(outputGrid.byKey.get(anchor.key)!.cell)).toBe(
          textOf(anchor.cell)
        );
      }
      expect(
        planTableMutation(context(output), {
          createCell: seededFactory(`repair-${seed}-again`),
          kind: 'repair',
        })
      ).toMatchObject({ kind: 'plan', operations: [] });
    }
  });

  it('preserves geometry, content, and first identity across generated merge/split pairs', () => {
    for (let rowCount = 1; rowCount <= 4; rowCount++) {
      for (let colCount = 1; colCount <= 4; colCount++) {
        if (rowCount * colCount < 2) continue;

        const input = table(
          Array.from({ length: rowCount }, (_, row) =>
            Array.from({ length: colCount }, (_, col) => cell(`r${row}c${col}`))
          )
        );
        const keys = compileTableGrid(input).anchors.flatMap(({ key }) =>
          key ? [key] : []
        );
        const merged = planTableMutation(context(input), {
          cellKeys: keys,
          createCell: seededFactory(`merge-${rowCount}-${colCount}`),
          kind: 'merge',
        });

        expect(merged.kind).toBe('plan');
        if (merged.kind !== 'plan') continue;

        const mergedTable = apply(input, merged);

        expect(mergedTable).not.toBeNull();
        if (!mergedTable) continue;

        const split = planTableMutation(context(mergedTable), {
          anchorKey: keys[0],
          createCell: seededFactory(`split-${rowCount}-${colCount}`),
          kind: 'split',
          rowType: 'tr',
        });

        expect(split.kind).toBe('plan');
        if (split.kind !== 'plan') continue;

        const output = apply(mergedTable, split);
        const grid = output && compileTableGrid(output);

        expect(grid?.height).toBe(rowCount);
        expect(grid?.width).toBe(colCount);
        expect(grid?.anchors).toHaveLength(rowCount * colCount);
        expect(grid?.anchors[0].key).toBe(keys[0]);
        expect(textOf(grid!.anchors[0].cell)).toBe(keys.join(''));
        expect(grid?.problems).toEqual([]);
      }
    }
  });
});
