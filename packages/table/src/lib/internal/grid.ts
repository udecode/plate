import type { EditorStateView, Path } from '@platejs/plite';
import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '@platejs/utils';

import { getColSpan, getRowSpan } from './codec';

export type TableGridProblem =
  | Readonly<{
      cellPath: Path;
      kind: 'collision';
      occupiedCellPath: Path;
      slot: Readonly<{ col: number; row: number }>;
    }>
  | Readonly<{
      cellPath: Path;
      id: string;
      kind: 'duplicate-id';
      previousCellPath: Path;
    }>
  | Readonly<{
      cellPath: Path;
      kind: 'invalid-col-span' | 'invalid-row-span';
      value: unknown;
    }>
  | Readonly<{
      cellPath: Path;
      kind: 'missing-id';
    }>
  | Readonly<{
      actual: number;
      cellPath: Path;
      kind: 'row-span-overflow';
      requested: number;
    }>
  | Readonly<{
      kind: 'uncovered-slot';
      slot: Readonly<{ col: number; row: number }>;
    }>;

export type TableGridAnchor = Readonly<{
  cell: TTableCellElement;
  cellIndex: number;
  col: number;
  colSpan: number;
  id?: string;
  order: number;
  path: Path;
  row: number;
  rowSpan: number;
}>;

export type TableGrid = Readonly<{
  anchors: readonly TableGridAnchor[];
  anchorsByRow: readonly (readonly TableGridAnchor[])[];
  byCell: ReadonlyMap<TTableCellElement, TableGridAnchor>;
  byId: ReadonlyMap<string, TableGridAnchor>;
  byPath: ReadonlyMap<string, TableGridAnchor>;
  height: number;
  problems: readonly TableGridProblem[];
  slots: readonly (readonly (TableGridAnchor | null)[])[];
  width: number;
}>;

export type TableGridCompilerMetrics = Readonly<{
  cacheHitCount: number;
  compileCount: number;
}>;

const cache = new WeakMap<TTableElement, TableGrid>();
let cacheHitCount = 0;
let compileCount = 0;

const isValidSpan = (value: unknown) =>
  value === undefined ||
  (typeof value === 'number' &&
    Number.isInteger(value) &&
    Number.isFinite(value) &&
    value > 0);

const freezePath = (path: readonly number[]): Path =>
  Object.freeze([...path]) as Path;

const freezeMap = <K, V>(map: Map<K, V>): ReadonlyMap<K, V> => {
  const view: ReadonlyMap<K, V> = {
    [Symbol.iterator]: () => map[Symbol.iterator](),
    entries: () => map.entries(),
    forEach: (callback, thisArg) => {
      map.forEach((value, key) => {
        callback.call(thisArg, value, key, view);
      });
    },
    get: (key) => map.get(key),
    has: (key) => map.has(key),
    keys: () => map.keys(),
    get size() {
      return map.size;
    },
    values: () => map.values(),
  };

  return Object.freeze(view);
};

const compileTableElement = (table: TTableElement): TableGrid => {
  const cached = cache.get(table);

  if (cached) {
    cacheHitCount++;

    return cached;
  }

  compileCount++;

  const height = table.children.length;
  const slots: (TableGridAnchor | null)[][] = Array.from(
    { length: height },
    () => []
  );
  const anchors: TableGridAnchor[] = [];
  const anchorsByRow: TableGridAnchor[][] = Array.from(
    { length: height },
    () => []
  );
  const byCell = new Map<TTableCellElement, TableGridAnchor>();
  const byId = new Map<string, TableGridAnchor>();
  const byPath = new Map<string, TableGridAnchor>();
  const problems: TableGridProblem[] = [];
  let width = 0;

  table.children.forEach((rowNode, row) => {
    const tableRow = rowNode as TTableRowElement;
    let col = 0;

    (tableRow.children as readonly TTableCellElement[]).forEach(
      (cell, cellIndex) => {
        while (slots[row][col]) col++;

        const cellPath = freezePath([row, cellIndex]);
        const requestedRowSpan = getRowSpan(cell);
        const colSpan = getColSpan(cell);
        const rowSpan = Math.min(requestedRowSpan, Math.max(height - row, 1));

        if (!isValidSpan(cell.colSpan)) {
          problems.push(
            Object.freeze({
              cellPath,
              kind: 'invalid-col-span',
              value: cell.colSpan,
            })
          );
        }
        if (!isValidSpan(cell.rowSpan)) {
          problems.push(
            Object.freeze({
              cellPath,
              kind: 'invalid-row-span',
              value: cell.rowSpan,
            })
          );
        }
        if (requestedRowSpan > rowSpan) {
          problems.push(
            Object.freeze({
              actual: rowSpan,
              cellPath,
              kind: 'row-span-overflow',
              requested: requestedRowSpan,
            })
          );
        }

        const anchor = Object.freeze({
          cell,
          cellIndex,
          col,
          colSpan,
          ...(cell.id ? { id: cell.id } : {}),
          order: anchors.length,
          path: cellPath,
          row,
          rowSpan,
        }) satisfies TableGridAnchor;

        anchors.push(anchor);
        anchorsByRow[row].push(anchor);
        byCell.set(cell, anchor);
        byPath.set(cellPath.join(','), anchor);

        if (cell.id) {
          const previous = byId.get(cell.id);

          if (previous) {
            problems.push(
              Object.freeze({
                cellPath,
                id: cell.id,
                kind: 'duplicate-id',
                previousCellPath: previous.path,
              })
            );
          } else {
            byId.set(cell.id, anchor);
          }
        } else {
          problems.push(Object.freeze({ cellPath, kind: 'missing-id' }));
        }

        for (let rowOffset = 0; rowOffset < rowSpan; rowOffset++) {
          for (let colOffset = 0; colOffset < colSpan; colOffset++) {
            const slotRow = row + rowOffset;
            const slotCol = col + colOffset;
            const occupied = slots[slotRow][slotCol];

            if (occupied) {
              problems.push(
                Object.freeze({
                  cellPath,
                  kind: 'collision',
                  occupiedCellPath: occupied.path,
                  slot: Object.freeze({ col: slotCol, row: slotRow }),
                })
              );
            } else {
              slots[slotRow][slotCol] = anchor;
            }
          }
        }

        col += colSpan;
        width = Math.max(width, col);
      }
    );
  });

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (!slots[row][col]) {
        slots[row][col] = null;
        problems.push(
          Object.freeze({
            kind: 'uncovered-slot',
            slot: Object.freeze({ col, row }),
          })
        );
      }
    }
  }

  const grid = Object.freeze({
    anchors: Object.freeze(anchors),
    anchorsByRow: Object.freeze(anchorsByRow.map((row) => Object.freeze(row))),
    byCell: freezeMap(byCell),
    byId: freezeMap(byId),
    byPath: freezeMap(byPath),
    height,
    problems: Object.freeze(problems),
    slots: Object.freeze(slots.map((row) => Object.freeze(row))),
    width,
  }) satisfies TableGrid;

  cache.set(table, grid);

  return grid;
};

export function compileTableGrid(
  state: Pick<EditorStateView, 'nodes'>,
  tablePath: Path
): TableGrid;
export function compileTableGrid(table: TTableElement): TableGrid;
export function compileTableGrid(
  stateOrTable: Pick<EditorStateView, 'nodes'> | TTableElement,
  tablePath?: Path
): TableGrid {
  if (tablePath !== undefined) {
    const state = stateOrTable as Pick<EditorStateView, 'nodes'>;
    const table = state.nodes.get<TTableElement>(tablePath)?.[0];

    if (!table) {
      throw new Error(`No table found at path ${tablePath}`);
    }

    return compileTableElement(table);
  }

  return compileTableElement(stateOrTable as TTableElement);
}

export const readTableGridCompilerMetrics = (): TableGridCompilerMetrics =>
  Object.freeze({ cacheHitCount, compileCount });
