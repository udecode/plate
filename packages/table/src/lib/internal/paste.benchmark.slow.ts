import type {
  TableCellElementWithId,
  TableElementWithId,
  TableRowElementWithId,
} from '../__tests__/tableTestTypes';
import type { TableElement } from '../BaseTablePlugin';
import { createDetachedTableContext } from './context';
import type { TableCellFactory } from './mutation';
import { planPreparedTablePaste, prepareTablePaste } from './paste';

const TABLE_PASTE_COHORTS = [
  { budgetMs: 2, samples: 20, size: 1 },
  { budgetMs: 20, samples: 12, size: 32 },
  { budgetMs: 75, samples: 8, size: 64 },
  { budgetMs: 300, samples: 5, size: 128 },
] as const;

let createdCellKey = 0;

const createCell: TableCellFactory = ({ header }) => ({
  children: [{ text: '' }],
  id: `created-${(createdCellKey += 1) - 1}`,
  type: header ? 'th' : 'td',
});

const createRow = (row: number): TableRowElementWithId => ({
  children: [],
  id: `created-row-${row}`,
  type: 'tableRow',
});

const denseTable = (size: number, prefix: string): TableElementWithId => ({
  children: Array.from({ length: size }, (_, row): TableRowElementWithId => ({
    children: Array.from(
      { length: size },
      (innerValue, col): TableCellElementWithId => ({
        children: [{ text: `${row}:${col}` }],
        id: `${prefix}-cell-${row}-${col}`,
        type: 'tableCell',
      })
    ),
    id: `${prefix}-row-${row}`,
    type: 'tableRow',
  })),
  id: `${prefix}-table`,
  type: 'table',
});

const percentile = (samples: readonly number[], value: number) => {
  const sorted = [...samples].sort((left, right) => left - right);

  return sorted[Math.ceil(sorted.length * value) - 1] ?? 0;
};

const measure = (run: () => void, iterations = 1) => {
  const startedAt = performance.now();

  for (let index = 0; index < iterations; index++) run();

  return performance.now() - startedAt;
};

const prepare = (table: TableElement) =>
  prepareTablePaste(table, {
    createCell,
    createRow,
    source: 'model',
  });

const collectGarbage = async () => {
  const runtime = globalThis as typeof globalThis & {
    Bun?: { gc: (force?: boolean) => void };
  };

  expect(runtime.Bun?.gc).toBeFunction();

  for (let attempt = 0; attempt < 4; attempt++) {
    runtime.Bun?.gc(true);
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  }
};

describe('PreparedTablePaste benchmark', () => {
  it.each([...TABLE_PASTE_COHORTS])(
    'prepares a dense $size x $size source within its source-slot budget',
    ({ budgetMs, samples, size }) => {
      const durations = Array.from({ length: samples }, (_, sample) => {
        const source = denseTable(size, `${size}-${sample}`);

        return measure(() => {
          const result = prepare(source);

          expect('kind' in result).toBe(false);
        });
      });

      expect(percentile(durations, 0.95)).toBeLessThan(budgetMs);
    }
  );

  it('keeps a hot 4 x 4 plan local across 64 and 256 square targets', () => {
    const prepared = prepare(denseTable(4, 'source'));

    if ('kind' in prepared) throw new Error(JSON.stringify(prepared));

    const durationFor = (size: number) => {
      const context = createDetachedTableContext(
        denseTable(size, `target-${size}`),
        [0]
      );
      const run = () => {
        const result = planPreparedTablePaste(context, prepared, {
          createCell,
          createRow,
          fitChildren: (_cell, children) => children,
          startCol: 16,
          startRow: 16,
        });

        expect(result.kind).toBe('plan');
        if (result.kind === 'plan') {
          expect(result.operations).toHaveLength(16);
          expect(result.operations.every(({ path }) => path.length === 3)).toBe(
            true
          );
        }
      };

      run();

      return measure(run, 100);
    };
    const small = durationFor(64);
    const large = durationFor(256);

    expect(large / Math.max(small, 0.001)).toBeLessThan(2.5);
  });

  it('fits repeated and clipped sources once per used source anchor', () => {
    const one = prepare(denseTable(1, 'one'));
    const block = prepare(denseTable(32, 'block'));

    if ('kind' in one || 'kind' in block) {
      throw new Error('Expected prepared sources');
    }

    const context = createDetachedTableContext(denseTable(64, 'target'), [0]);
    let oneFits = 0;
    let blockFits = 0;
    const repeated = planPreparedTablePaste(context, one, {
      createCell,
      createRow,
      fillBounds: { maxCol: 31, maxRow: 31, minCol: 0, minRow: 0 },
      fitChildren: (_cell, children) => {
        oneFits += 1;
        return children;
      },
      startCol: 0,
      startRow: 0,
    });
    const clipped = planPreparedTablePaste(context, block, {
      createCell,
      createRow,
      fillBounds: { maxCol: 47, maxRow: 47, minCol: 0, minRow: 0 },
      fitChildren: (_cell, children) => {
        blockFits += 1;
        return children;
      },
      startCol: 0,
      startRow: 0,
    });

    expect(repeated.kind).toBe('plan');
    expect(clipped.kind).toBe('plan');
    expect(oneFits).toBe(1);
    expect(blockFits).toBe(32 * 32);
  });

  it('bounds a four-boundary span fallback by affected rows', () => {
    const target: TableElementWithId = {
      children: [
        {
          children: [
            {
              children: [{ text: 'merged' }],
              colSpan: 64,
              id: 'merged',
              rowSpan: 64,
              type: 'tableCell',
            },
          ],
          id: 'row-0',
          type: 'tableRow',
        },
        ...Array.from({ length: 63 }, (_, row): TableRowElementWithId => ({
          children: [],
          id: `row-${row + 1}`,
          type: 'tableRow',
        })),
      ],
      id: 'target',
      type: 'table',
    };
    const prepared = prepare(denseTable(4, 'source'));

    if ('kind' in prepared) throw new Error(JSON.stringify(prepared));

    const result = planPreparedTablePaste(
      createDetachedTableContext(target, [0]),
      prepared,
      {
        createCell,
        createRow,
        fitChildren: (_cell, children) => children,
        startCol: 30,
        startRow: 30,
      }
    );

    expect(result.kind).toBe('plan');
    if (result.kind !== 'plan') return;

    expect(result.operations.length).toBeLessThanOrEqual(64);
    expect(result.operations.every(({ path }) => path.length === 2)).toBe(true);
  });

  it('does not retain transient preparations or plans', async () => {
    const prepared = prepare(denseTable(4, 'source'));
    const context = createDetachedTableContext(denseTable(64, 'target'), [0]);

    if ('kind' in prepared) throw new Error(JSON.stringify(prepared));

    await collectGarbage();
    const before = process.memoryUsage().heapUsed;

    for (let index = 0; index < 2000; index++) {
      planPreparedTablePaste(context, prepared, {
        createCell,
        createRow,
        fitChildren: (_cell, children) => children,
        startCol: index % 60,
        startRow: index % 60,
      });
    }

    await collectGarbage();

    expect(process.memoryUsage().heapUsed - before).toBeLessThan(
      32 * 1024 * 1024
    );
  });
});
