import type { TableCellElementWithId } from '../__tests__/tableTestTypes';
import type {
  TableCellElement,
  TableElement,
  TableRowElement,
} from '../BaseTablePlugin';
import {
  compileTableGrid,
  readTableGridCompilerMetrics,
  TABLE_CELL_OPERATION_KEY,
} from './grid';

const cell = (
  id: string,
  options: Pick<TableCellElement, 'colSpan' | 'rowSpan'> = {}
): TableCellElementWithId =>
  ({
    [TABLE_CELL_OPERATION_KEY]: id,
    children: [{ text: id }],
    id,
    ...options,
    type: 'tableCell',
  }) as TableCellElementWithId;

const table = (
  rows: readonly (readonly TableCellElement[])[]
): TableElement => ({
  children: rows.map((children): TableRowElement => ({
    children: [...children],
    type: 'tableRow',
  })),
  type: 'table',
});

describe('compileTableGrid', () => {
  it('compiles one immutable anchor and reverse index for every occupied slot', () => {
    const input = table([
      [cell('a', { colSpan: 2, rowSpan: 2 }), cell('b')],
      [cell('c')],
    ]);
    const grid = compileTableGrid(input);

    expect(grid.width).toBe(3);
    expect(grid.height).toBe(2);
    expect(grid.anchors).toHaveLength(3);
    expect(grid.anchors.map(({ order }) => order)).toEqual([0, 1, 2]);
    expect(grid.slots[0].map((anchor) => anchor?.key)).toEqual(['a', 'a', 'b']);
    expect(grid.slots[1].map((anchor) => anchor?.key)).toEqual(['a', 'a', 'c']);
    expect(grid.byKey.get('c')).toMatchObject({
      col: 2,
      path: [1, 0],
      row: 1,
    });
    expect(grid.byPath.get('1,0')).toBe(grid.byKey.get('c'));
    expect(grid.problems).toEqual([]);
    expect(Object.isFrozen(grid)).toBe(true);
    expect(Object.isFrozen(grid.anchors)).toBe(true);
    expect(Object.isFrozen(grid.byCell)).toBe(true);
    expect(Object.isFrozen(grid.byKey)).toBe(true);
    expect(Object.isFrozen(grid.byPath)).toBe(true);
    expect(Object.isFrozen(grid.slots)).toBe(true);
    expect(Object.isFrozen(grid.slots[0])).toBe(true);
    expect(() =>
      (grid.byKey as Map<string, unknown>).set('escape', {})
    ).toThrow();
    expect(grid.byKey.has('escape')).toBe(false);
  });

  it('reports invalid spans, overflow, and collisions deterministically', () => {
    const invalid = table([
      [
        cell('head'),
        cell('same', { rowSpan: 3 }),
        cell('same', { colSpan: 2 }),
      ],
      [
        cell('collision', { colSpan: 2 }),
        {
          ...cell('invalid'),
          colSpan: 0,
          rowSpan: Number.NaN,
        },
      ],
    ]);
    const first = compileTableGrid(invalid);
    const second = compileTableGrid(invalid);

    expect(first.problems.map((problem) => problem.kind)).toEqual([
      'row-span-overflow',
      'collision',
      'invalid-col-span',
      'invalid-row-span',
      'uncovered-slot',
    ]);
    expect(second).toBe(first);
    expect(second.problems).toEqual(first.problems);
  });

  it('keeps generated valid span grids rectangular and injective', () => {
    for (let seed = 1; seed <= 100; seed++) {
      let random = seed;
      const next = (max: number) => {
        random = (random * 16_807) % 2_147_483_647;

        return random % max;
      };
      const width = 1 + next(8);
      const height = 1 + next(8);
      const occupied = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => false)
      );
      const rows: TableCellElement[][] = Array.from(
        { length: height },
        () => []
      );
      let id = 0;

      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          if (occupied[row][col]) continue;

          let maxColSpan = 0;

          while (col + maxColSpan < width && !occupied[row][col + maxColSpan]) {
            maxColSpan++;
          }

          const colSpan = 1 + next(maxColSpan);
          let maxRowSpan = 1;

          while (row + maxRowSpan < height) {
            let clear = true;

            for (let offset = 0; offset < colSpan; offset++) {
              if (occupied[row + maxRowSpan][col + offset]) {
                clear = false;
                break;
              }
            }
            if (!clear) break;
            maxRowSpan++;
          }

          const rowSpan = 1 + next(maxRowSpan);
          const anchor = cell(`s${seed}:${id++}`, {
            ...(colSpan > 1 ? { colSpan } : {}),
            ...(rowSpan > 1 ? { rowSpan } : {}),
          });

          rows[row].push(anchor);

          for (let rowOffset = 0; rowOffset < rowSpan; rowOffset++) {
            for (let colOffset = 0; colOffset < colSpan; colOffset++) {
              occupied[row + rowOffset][col + colOffset] = true;
            }
          }
        }
      }

      const grid = compileTableGrid(table(rows));

      expect(grid.width).toBe(width);
      expect(grid.height).toBe(height);
      expect(grid.problems).toEqual([]);
      expect(grid.byKey.size).toBe(grid.anchors.length);

      grid.anchors.forEach((anchor) => {
        for (let row = anchor.row; row < anchor.row + anchor.rowSpan; row++) {
          for (let col = anchor.col; col < anchor.col + anchor.colSpan; col++) {
            expect(grid.slots[row][col]).toBe(anchor);
          }
        }
      });
    }
  });

  it('uses one weak identity compilation for repeated hot reads', () => {
    const input = table(
      Array.from({ length: 60 }, (_, row) =>
        Array.from({ length: 60 }, (_, col) => cell(`${row}:${col}`))
      )
    );
    const before = readTableGridCompilerMetrics();
    const cold = compileTableGrid(input);

    for (let index = 0; index < 10_000; index++) {
      expect(compileTableGrid(input)).toBe(cold);
    }

    const after = readTableGridCompilerMetrics();

    expect(after.compileCount - before.compileCount).toBe(1);
    expect(after.cacheHitCount - before.cacheHitCount).toBe(10_000);
  });

  it('does not retain table identities under cache churn', async () => {
    const runtime = globalThis as typeof globalThis & {
      Bun?: { gc: (force?: boolean) => void };
    };
    const references = (() =>
      Array.from({ length: 2000 }, (_, index) => {
        const input = table([[cell(`retained:${index}`)]]);

        compileTableGrid(input);

        return new WeakRef(input);
      }))();

    expect(runtime.Bun?.gc).toBeFunction();

    for (let attempt = 0; attempt < 5; attempt++) {
      runtime.Bun?.gc(true);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const retained = references.filter(
      (reference) => reference.deref() !== undefined
    ).length;

    expect(retained).toBeLessThanOrEqual(20);
  });
});
