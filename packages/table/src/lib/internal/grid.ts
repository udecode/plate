import {
  ElementApi,
  type EditorStateView,
  type Element,
  type Path,
} from '@platejs/plite';

import type { TableCellElement, TableRowElement } from '../BaseTablePlugin';
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
      kind: 'invalid-col-span' | 'invalid-row-span';
      value: unknown;
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
  cell: TableCellElement;
  cellIndex: number;
  col: number;
  colSpan: number;
  key: string;
  order: number;
  path: Path;
  row: number;
  rowSpan: number;
}>;

export type TableGrid = Readonly<{
  anchors: readonly TableGridAnchor[];
  anchorsByRow: ReadonlyArray<readonly TableGridAnchor[]>;
  byCell: ReadonlyMap<TableCellElement, TableGridAnchor>;
  byKey: ReadonlyMap<string, TableGridAnchor>;
  byPath: ReadonlyMap<string, TableGridAnchor>;
  height: number;
  problems: readonly TableGridProblem[];
  slots: ReadonlyArray<ReadonlyArray<TableGridAnchor | null>>;
  width: number;
}>;

export type TableGridCompilerMetrics = Readonly<{
  cacheHitCount: number;
  compileCount: number;
}>;

const cache = new WeakMap<Element, TableGrid>();
export const TABLE_CELL_OPERATION_KEY = Symbol('tableCellOperationKey');
let cacheHitCount = 0;
let compileCount = 0;

const isValidSpan = (value: unknown) =>
  value === undefined ||
  (typeof value === 'number' &&
    Number.isInteger(value) &&
    Number.isFinite(value) &&
    value > 0);

export const isTableColumnSizes = (
  value: unknown
): value is Array<number | null> =>
  Array.isArray(value) &&
  value.every(
    (size) =>
      size === null ||
      (typeof size === 'number' && Number.isFinite(size) && size > 0)
  );

export const getTableColumnSizes = (node: Element) =>
  isTableColumnSizes(node.columnWidths) ? node.columnWidths : undefined;

const freezePath = (path: readonly number[]): Path => Object.freeze([...path]);

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

const compileTableElement = (
  table: Element,
  getKey?: (cell: TableCellElement, path: Path) => string
): TableGrid => {
  const cached = getKey ? undefined : cache.get(table);

  if (cached) {
    cacheHitCount += 1;

    return cached;
  }

  compileCount += 1;

  const height = table.children.length;
  const slots: Array<Array<TableGridAnchor | null>> = Array.from(
    { length: height },
    () => []
  );
  const anchors: TableGridAnchor[] = [];
  const anchorsByRow: TableGridAnchor[][] = Array.from(
    { length: height },
    () => []
  );
  const byCell = new Map<TableCellElement, TableGridAnchor>();
  const byKey = new Map<string, TableGridAnchor>();
  const byPath = new Map<string, TableGridAnchor>();
  const problems: TableGridProblem[] = [];
  let width = 0;

  table.children.forEach((rowNode, row) => {
    const tableRow = rowNode as TableRowElement;
    let col = 0;

    (tableRow.children as readonly TableCellElement[]).forEach(
      (cell, cellIndex) => {
        while (slots[row][col]) col += 1;

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

        const key =
          getKey?.(cell, cellPath) ??
          (
            cell as TableCellElement & {
              [TABLE_CELL_OPERATION_KEY]?: string;
            }
          )[TABLE_CELL_OPERATION_KEY] ??
          cellPath.join(',');
        const anchor = Object.freeze({
          cell,
          cellIndex,
          col,
          colSpan,
          key,
          order: anchors.length,
          path: cellPath,
          row,
          rowSpan,
        }) satisfies TableGridAnchor;

        anchors.push(anchor);
        anchorsByRow[row].push(anchor);
        byCell.set(cell, anchor);
        byPath.set(cellPath.join(','), anchor);

        byKey.set(key, anchor);

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
    byKey: freezeMap(byKey),
    byPath: freezeMap(byPath),
    height,
    problems: Object.freeze(problems),
    slots: Object.freeze(slots.map((row) => Object.freeze(row))),
    width,
  }) satisfies TableGrid;

  if (!getKey) cache.set(table, grid);

  return grid;
};

export function compileTableGrid(
  state: Pick<EditorStateView, 'key' | 'nodes'>,
  tablePath: Path,
  root?: string
): TableGrid;
export function compileTableGrid(table: Element): TableGrid;
export function compileTableGrid(
  stateOrTable: Element | Pick<EditorStateView, 'key' | 'nodes'>,
  tablePath?: Path,
  root?: string
): TableGrid {
  if (tablePath !== undefined) {
    const state = stateOrTable as Pick<EditorStateView, 'key' | 'nodes'>;
    const table = state.nodes.get(
      root ? { offset: 0, path: tablePath, root } : tablePath,
      { match: ElementApi.isElement }
    )?.[0];

    if (!table) {
      throw new Error(`No table found at path ${tablePath}`);
    }

    return compileTableElement(table, (_cell, path) => {
      const cellPath = tablePath.concat(path);
      const key = state.key(
        root ? { offset: 0, path: cellPath, root } : cellPath
      );

      if (!key) {
        throw new Error(`No table cell key found at path ${cellPath}`);
      }

      return key;
    });
  }

  return compileTableElement(stateOrTable as Element);
}

export const readTableGridCompilerMetrics = (): TableGridCompilerMetrics =>
  Object.freeze({ cacheHitCount, compileCount });
