import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '@platejs/utils';

import { createDetachedTableContext } from './context';
import { compileTableGrid, readTableGridCompilerMetrics } from './grid';
import { planTableMutation, type TableCellFactory } from './mutation';

const TABLE_GRID_BUDGETS = {
  coldDenseP95Ms: {
    large: 25,
    normal: 8,
    pathological: 300,
    stress: 75,
  },
  coldSparseP95Ms: {
    large: 5,
    normal: 3,
    pathological: 50,
    stress: 15,
  },
  hotHitP95Ms: 0.05,
  lookupP95Ms: 50,
  lookupSizeRatio: 2.5,
  retainedHeapBytes: 16 * 1024 * 1024,
  retainedTables: 32,
} as const;

const TABLE_GRID_COHORTS = [
  { name: 'normal', samples: 20, size: 32 },
  { name: 'large', samples: 15, size: 64 },
  { name: 'stress', samples: 10, size: 128 },
  { name: 'pathological', samples: 5, size: 256 },
] as const;

const TABLE_GRID_RETENTION_COHORTS = [
  { name: 'normal', tables: 256 },
  { name: 'stress', tables: 2048 },
  { name: 'pathological', tables: 4096 },
] as const;

const createCell: TableCellFactory = ({ col, row }) => ({
  children: [{ text: '' }],
  id: `created-${row}-${col}`,
  type: 'td',
});

const createDenseTable = (size: number): TTableElement => ({
  children: Array.from(
    { length: size },
    (_, row): TTableRowElement => ({
      children: Array.from(
        { length: size },
        (_, col): TTableCellElement => ({
          children: [{ text: `${row}:${col}` }],
          id: `cell-${row}-${col}`,
          type: 'td',
        })
      ),
      id: `row-${row}`,
      type: 'tr',
    })
  ),
  id: 'table',
  type: 'table',
});

const createSparseTable = (size: number): TTableElement => ({
  children: Array.from(
    { length: size },
    (_, row): TTableRowElement => ({
      children: [
        {
          children: [{ text: `${row}` }],
          colSpan: size,
          id: `cell-${row}-0`,
          type: 'td',
        },
      ],
      id: `row-${row}`,
      type: 'tr',
    })
  ),
  id: 'table',
  type: 'table',
});

const createUncoveredTable = (size: number): TTableElement => {
  const table = createDenseTable(size);

  return {
    ...table,
    children: table.children.map((node, rowIndex) => {
      const row = node as TTableRowElement;

      return {
        ...row,
        children: rowIndex === 0 ? row.children : row.children.slice(0, 1),
      };
    }),
  };
};

const measure = (run: () => void, iterations: number) => {
  const startedAt = performance.now();

  for (let index = 0; index < iterations; index++) run();

  return performance.now() - startedAt;
};

const measureSamples = (runs: readonly (() => void)[]) =>
  runs.map((run) => measure(run, 1));

const percentile = (samples: readonly number[], percentile: number) => {
  const sorted = [...samples].sort((left, right) => left - right);

  return sorted[Math.ceil(sorted.length * percentile) - 1] ?? 0;
};

const collectGarbage = async () => {
  const runtime = globalThis as typeof globalThis & {
    Bun?: { gc: (force?: boolean) => void };
  };

  expect(runtime.Bun?.gc).toBeFunction();

  for (let attempt = 0; attempt < 5; attempt++) {
    runtime.Bun?.gc(true);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};

describe('TableMutationPlan benchmark', () => {
  it('keeps a focused column plan below whole-table repair work', () => {
    const size = 64;
    const context = createDetachedTableContext(createDenseTable(size), [0]);
    const repairContext = createDetachedTableContext(
      createUncoveredTable(size),
      [0]
    );
    const insert = () =>
      planTableMutation(context, {
        anchorId: 'cell-0-31',
        createCell,
        kind: 'insert-column',
      });
    const repair = () =>
      planTableMutation(repairContext, {
        createCell,
        kind: 'repair',
      });

    insert();
    const wholeTableRepair = repair();

    const focused = insert();

    expect(focused.kind).toBe('plan');
    if (focused.kind !== 'plan') return;
    expect(wholeTableRepair.kind).toBe('plan');
    if (wholeTableRepair.kind !== 'plan') return;

    expect(focused.operations).toHaveLength(size);
    expect(wholeTableRepair.operations.length).toBeGreaterThan(
      context.grid.anchors.length / 2
    );
    expect(focused.operations.length).toBeLessThan(
      context.grid.anchors.length / 8
    );

    const focusedMs = measure(insert, 12);
    const fallbackMs = measure(repair, 12);

    expect(focusedMs).toBeLessThan(fallbackMs);
  });
});

describe('TableGrid compiler benchmark', () => {
  it('keeps dense and sparse cold compilation inside cohort budgets', () => {
    compileTableGrid(createDenseTable(8));
    compileTableGrid(createSparseTable(8));

    TABLE_GRID_COHORTS.forEach(({ name, samples, size }) => {
      const denseTables = Array.from({ length: samples }, () =>
        createDenseTable(size)
      );
      const sparseTables = Array.from({ length: samples }, () =>
        createSparseTable(size)
      );
      const denseP95 = percentile(
        measureSamples(
          denseTables.map((table) => () => {
            compileTableGrid(table);
          })
        ),
        0.95
      );
      const sparseP95 = percentile(
        measureSamples(
          sparseTables.map((table) => () => {
            compileTableGrid(table);
          })
        ),
        0.95
      );

      expect(denseP95).toBeLessThanOrEqual(
        TABLE_GRID_BUDGETS.coldDenseP95Ms[name]
      );
      expect(sparseP95).toBeLessThanOrEqual(
        TABLE_GRID_BUDGETS.coldSparseP95Ms[name]
      );
    });
  });

  it('makes hot identity hits faster than uncached compilation', () => {
    const size = 128;
    const cachedTable = createDenseTable(size);
    const cachedGrid = compileTableGrid(cachedTable);
    const coldTables = Array.from({ length: 12 }, () => createDenseTable(size));
    const before = readTableGridCompilerMetrics();
    const coldP95 = percentile(
      measureSamples(
        coldTables.map((table) => () => {
          compileTableGrid(table);
        })
      ),
      0.95
    );
    const hotP95 = percentile(
      measureSamples(
        Array.from({ length: 1000 }, () => () => {
          if (compileTableGrid(cachedTable) !== cachedGrid) {
            throw new Error('Hot table-grid lookup changed identity');
          }
        })
      ),
      0.95
    );
    const after = readTableGridCompilerMetrics();

    expect(after.compileCount - before.compileCount).toBe(coldTables.length);
    expect(after.cacheHitCount - before.cacheHitCount).toBe(1000);
    expect(hotP95).toBeLessThanOrEqual(TABLE_GRID_BUDGETS.hotHitP95Ms);
    expect(hotP95).toBeLessThan(coldP95 / 20);
  });

  it('keeps ID and path lookups local as table size grows', () => {
    const lookupIterations = 100_000;
    const sampleCount = 7;
    const readLookupP95 = (size: number) => {
      const grid = compileTableGrid(createDenseTable(size));
      const ids = Array.from(
        { length: lookupIterations },
        (_, index) => `cell-${index % size}-${(index * 17) % size}`
      );
      const paths = Array.from(
        { length: lookupIterations },
        (_, index) => `${index % size},${(index * 17) % size}`
      );
      let lookupMismatch = false;
      const samples = measureSamples(
        Array.from({ length: sampleCount }, () => () => {
          for (let index = 0; index < lookupIterations; index++) {
            const byId = grid.byId.get(ids[index]);
            const byPath = grid.byPath.get(paths[index]);

            if (byId !== byPath) lookupMismatch = true;
          }
        })
      );

      expect(lookupMismatch).toBe(false);

      return percentile(samples, 0.95);
    };

    const normalP95 = readLookupP95(32);
    const largeP95 = readLookupP95(256);

    expect(normalP95).toBeLessThanOrEqual(TABLE_GRID_BUDGETS.lookupP95Ms);
    expect(largeP95).toBeLessThanOrEqual(TABLE_GRID_BUDGETS.lookupP95Ms);
    expect(largeP95).toBeLessThanOrEqual(
      normalP95 * TABLE_GRID_BUDGETS.lookupSizeRatio
    );
  });

  it('does not retain table identities or heap across churn cohorts', async () => {
    await collectGarbage();
    const baselineHeap = process.memoryUsage().heapUsed;
    const retainedCounts: number[] = [];

    for (const { tables } of TABLE_GRID_RETENTION_COHORTS) {
      const references = (() =>
        Array.from({ length: tables }, (_, index) => {
          const table: TTableElement = {
            ...createDenseTable(1),
            id: `retained-${tables}-${index}`,
          };
          compileTableGrid(table);

          return new WeakRef(table);
        }))();

      await collectGarbage();

      const retained = references.filter(
        (reference) => reference.deref() !== undefined
      ).length;

      retainedCounts.push(retained);
      expect(retained).toBeLessThanOrEqual(TABLE_GRID_BUDGETS.retainedTables);
    }

    await collectGarbage();

    expect(
      Math.max(...retainedCounts) - Math.min(...retainedCounts)
    ).toBeLessThanOrEqual(TABLE_GRID_BUDGETS.retainedTables);
    expect(process.memoryUsage().heapUsed - baselineHeap).toBeLessThanOrEqual(
      TABLE_GRID_BUDGETS.retainedHeapBytes
    );
  });
});
