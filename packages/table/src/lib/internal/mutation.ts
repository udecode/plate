import type { PlateNodeInsertOptions } from '@platejs/core';
import type {
  Descendant,
  EditorCoreUpdateTransaction,
  Element,
  Path,
  Range,
  Text,
} from '@platejs/plite';
import { ElementApi } from '@platejs/plite';
import { failInvariant } from '@platejs/plite/internal';
import cloneDeep from 'lodash/cloneDeep.js';

import type { TableCellElement, TableRowElement } from '../BaseTablePlugin';
import { getColSpan, getRowSpan, setSpan } from './codec';
import { createDetachedTableContext, type TableContext } from './context';
import {
  compileTableGrid,
  getTableColumnSizes,
  type TableGridAnchor,
  type TableGridProblem,
} from './grid';

type MutableDescendant = MutableElement | Text;
type TableMutationTransaction = Omit<
  Pick<EditorCoreUpdateTransaction, 'nodes' | 'selection'>,
  'nodes'
> & {
  nodes: Omit<EditorCoreUpdateTransaction['nodes'], 'insert'> & {
    insert: <TNode extends Descendant>(
      nodes: TNode | readonly TNode[],
      options?: PlateNodeInsertOptions
    ) => void;
  };
};
type MutableElement = {
  children: MutableDescendant[];
  type: string;
  [key: string]: unknown;
};
type DeepMutable<T> = T extends (...args: any[]) => unknown
  ? T
  : T extends ReadonlyArray<infer TValue>
    ? Array<DeepMutable<TValue>>
    : T extends object
      ? { -readonly [TKey in keyof T]: DeepMutable<T[TKey]> }
      : T;
type RuntimeTableCellElement = Omit<TableCellElement, 'type'> & {
  type: string;
};
type MutableCell = DeepMutable<RuntimeTableCellElement>;
type MutableTable = DeepMutable<Element>;

const cloneMutableDescendant = (node: Descendant): MutableDescendant =>
  ElementApi.isElement(node) ? cloneMutableElement(node) : cloneDeep(node);

const cloneMutableElement = (element: Element): MutableElement => ({
  ...cloneDeep(element),
  children: element.children.map(cloneMutableDescendant),
});

const cloneMutableCell = (cell: RuntimeTableCellElement): MutableCell =>
  cloneDeep(cell) as MutableCell;

const cloneMutableTable = (table: Element): MutableTable =>
  cloneDeep(table) as MutableTable;

const isMutableElement = (node: MutableDescendant): node is MutableElement =>
  ElementApi.isElement(node);

export type TableCellFactory = (options: {
  children?: TableCellElement['children'];
  col: number;
  header: boolean;
  row: number;
  sourceRow?: TableRowElement;
}) => RuntimeTableCellElement;

export type TableOperation =
  | Readonly<{
      kind: 'insert-node';
      node: Element;
      options?: Omit<PlateNodeInsertOptions, 'at' | 'select'>;
      path: Path;
    }>
  | Readonly<{
      kind: 'remove-node';
      path: Path;
    }>
  | Readonly<{
      kind: 'remove-table';
      path: Path;
    }>
  | Readonly<{
      children: readonly Descendant[];
      kind: 'replace-children';
      path: Path;
    }>
  | Readonly<{
      kind: 'set-node';
      path: Path;
      properties: Readonly<Record<string, unknown>>;
    }>
  | Readonly<{
      keys: readonly string[];
      kind: 'unset-node';
      path: Path;
    }>;

export type TableMutationPlan = Readonly<{
  kind: 'plan';
  operations: readonly TableOperation[];
  selection?: Range;
}>;

export type TableMutationDiagnostic =
  | Readonly<{
      anchorKey?: string;
      anchorPath?: Path;
      kind: 'missing-anchor';
    }>
  | Readonly<{
      cellKeys: readonly string[];
      kind: 'invalid-selection';
      reason: 'duplicate-key' | 'empty' | 'non-rectangular' | 'unknown-key';
    }>
  | Readonly<{
      kind: 'invalid-table';
      problems: readonly TableGridProblem[];
      reason: 'repair-stalled';
    }>;

type TableTarget = Readonly<{
  anchorKey?: string;
  anchorPath?: Path;
}>;

type InsertColumnIntent = TableTarget &
  Readonly<{
    atColumn?: number;
    before?: boolean;
    createCell: TableCellFactory;
    header?: boolean;
    initialTableWidth?: number;
    kind: 'insert-column';
    minColumnWidth?: number;
    select?: boolean;
  }>;

type InsertRowIntent = TableTarget &
  Readonly<{
    before?: boolean;
    createCell: TableCellFactory;
    header?: boolean;
    kind: 'insert-row';
    rowType: string;
    select?: boolean;
  }>;

type InsertTableIntent = Readonly<{
  kind: 'insert-table';
  options?: PlateNodeInsertOptions;
}>;

type RemoveColumnIntent = TableTarget &
  Readonly<{
    columnCount?: number;
    kind: 'remove-column';
    selectionRow?: number;
    selectionRows?: readonly [number, number];
    startCol?: number;
  }>;

type RemoveRowIntent = TableTarget &
  Readonly<{
    kind: 'remove-row';
    rowCount?: number;
    selectionCol?: number;
    startRow?: number;
  }>;

type RemoveTableIntent = Readonly<{
  kind: 'remove-table';
}>;

type MergeIntent = Readonly<{
  cellKeys: readonly string[];
  createCell: TableCellFactory;
  kind: 'merge';
}>;

type SplitIntent = TableTarget &
  Readonly<{
    createCell: TableCellFactory;
    kind: 'split';
    rowType: string;
  }>;

type RepairIntent = Readonly<{
  createCell: TableCellFactory;
  createRow?: (row: number) => TableRowElement;
  extendRowSpans?: boolean;
  kind: 'repair';
}>;

export type TableIntent =
  | InsertColumnIntent
  | InsertRowIntent
  | InsertTableIntent
  | MergeIntent
  | RemoveColumnIntent
  | RemoveRowIntent
  | RemoveTableIntent
  | RepairIntent
  | SplitIntent;

type MutableOperation =
  | {
      kind: 'insert-node';
      node: Element;
      options?: Omit<PlateNodeInsertOptions, 'at' | 'select'>;
      path: Path;
    }
  | {
      kind: 'remove-node';
      path: Path;
    }
  | {
      kind: 'remove-table';
      path: Path;
    }
  | {
      children: readonly Descendant[];
      kind: 'replace-children';
      path: Path;
    }
  | {
      kind: 'set-node';
      path: Path;
      properties: Record<string, unknown>;
    }
  | {
      keys: string[];
      kind: 'unset-node';
      path: Path;
    };

const deepFreeze = <T>(value: T): T => {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);

  for (const child of Object.values(value)) deepFreeze(child);

  return value;
};

const freezePath = (path: readonly number[]): Path => Object.freeze([...path]);

const freezeOperation = (operation: MutableOperation): TableOperation => {
  const frozen = cloneDeep(operation);

  if ('path' in frozen) frozen.path = freezePath(frozen.path);

  return deepFreeze(frozen);
};

const freezePlan = (
  operations: readonly MutableOperation[],
  selection?: Range
): TableMutationPlan =>
  deepFreeze({
    kind: 'plan' as const,
    operations: operations.map(freezeOperation),
    ...(selection ? { selection: cloneDeep(selection) } : {}),
  });

const missingAnchor = (target: TableTarget): TableMutationDiagnostic =>
  deepFreeze({
    ...(target.anchorKey ? { anchorKey: target.anchorKey } : {}),
    ...(target.anchorPath ? { anchorPath: freezePath(target.anchorPath) } : {}),
    kind: 'missing-anchor' as const,
  });

const invalidSelection = (
  cellKeys: readonly string[],
  reason: TableMutationDiagnostic extends infer T
    ? T extends { kind: 'invalid-selection'; reason: infer R }
      ? R
      : never
    : never
): TableMutationDiagnostic =>
  deepFreeze({
    cellKeys: [...cellKeys],
    kind: 'invalid-selection' as const,
    reason,
  });

const targetAnchor = (
  context: TableContext,
  target: TableTarget
): TableGridAnchor | undefined => {
  if (target.anchorKey) return context.grid.byKey.get(target.anchorKey);
  if (!target.anchorPath) return undefined;

  const relative =
    target.anchorPath.length === 2
      ? target.anchorPath
      : target.anchorPath.slice(context.tablePath.length);

  return context.grid.byPath.get(relative.join(','));
};

const absolutePath = (
  context: TableContext,
  relativePath: readonly number[]
): Path => freezePath(context.tablePath.concat(relativePath));

const comparePaths = (left: readonly number[], right: readonly number[]) => {
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index++) {
    const difference = (left[index] ?? -1) - (right[index] ?? -1);

    if (difference !== 0) return difference;
  }

  return 0;
};

const spanOperations = (
  context: TableContext,
  anchor: TableGridAnchor,
  key: 'colSpan' | 'rowSpan',
  span: number
): MutableOperation[] => {
  const path = absolutePath(context, anchor.path);

  return span > 1
    ? [{ kind: 'set-node', path, properties: { [key]: span } }]
    : [{ keys: [key], kind: 'unset-node', path }];
};

const cellIsHeader = (cell: RuntimeTableCellElement) => cell.header === true;

const rowIsHeader = (row: TableRowElement) =>
  row.children.length > 0 &&
  (row.children as readonly TableCellElement[]).every(cellIsHeader);

const resizeColumnSizes = (
  columnWidths: ReadonlyArray<number | null>,
  index: number,
  columnCount: number,
  initialTableWidth?: number,
  minColumnWidth?: number
) => {
  const currentColumnWidths: Array<number | null> = Array.from(
    { length: columnCount },
    (_, columnIndex): number | null => columnWidths[columnIndex] ?? null
  );
  let sizes: Array<number | null> = Array.from(
    { length: columnCount + 1 },
    (_, outputIndex): number | null => {
      if (outputIndex === index) return null;

      return (
        currentColumnWidths[
          outputIndex > index ? outputIndex - 1 : outputIndex
        ] ?? null
      );
    }
  );

  if (
    initialTableWidth === undefined ||
    !Number.isFinite(initialTableWidth) ||
    initialTableWidth <= 0
  ) {
    return sizes;
  }

  const adjacentWidth =
    currentColumnWidths[index] ?? currentColumnWidths[index - 1];

  if (adjacentWidth !== null && adjacentWidth !== undefined) {
    sizes[index] = adjacentWidth;
  }

  const oldFallbackWidth =
    initialTableWidth / Math.max(currentColumnWidths.length, 1);
  const oldTotal = currentColumnWidths.reduce<number>(
    (total, size) => total + (size ?? oldFallbackWidth),
    0
  );
  const newFallbackWidth = initialTableWidth / sizes.length;
  const newTotal = sizes.reduce<number>(
    (total, size) => total + (size ?? newFallbackWidth),
    0
  );
  const maxTotal = Math.max(oldTotal, initialTableWidth);

  if (newTotal > maxTotal) {
    const unresolvedTotal = sizes.reduce<number>(
      (total, size) => total + (size === null ? newFallbackWidth : 0),
      0
    );
    const knownTotal = sizes.reduce<number>(
      (total, size) => total + (size ?? 0),
      0
    );
    const factor =
      knownTotal === 0
        ? 1
        : Math.max(0, maxTotal - unresolvedTotal) / knownTotal;
    const minimumWidth =
      minColumnWidth === undefined || !Number.isFinite(minColumnWidth)
        ? 1
        : Math.max(1, minColumnWidth);

    sizes = sizes.map((size) =>
      size === null ? null : Math.max(minimumWidth, Math.floor(size * factor))
    );
  }

  return sizes;
};

const firstTextPoint = (
  cell: TableCellElement,
  cellPath: Path,
  edge: 'end' | 'start'
) => {
  const visit = (
    nodes: readonly Descendant[],
    path: number[]
  ): { offset: number; path: Path } | undefined => {
    const indexes =
      edge === 'start'
        ? nodes.map((_, index) => index)
        : nodes.map((_, index) => index).reverse();

    for (const index of indexes) {
      const node = nodes[index];

      if (typeof node.text === 'string') {
        return {
          offset: edge === 'start' ? 0 : node.text.length,
          path: freezePath(path.concat(index)),
        };
      }

      if (!Array.isArray(node.children)) continue;

      const point = visit(
        node.children as readonly Descendant[],
        path.concat(index)
      );

      if (point) return point;
    }

    return undefined;
  };

  return visit(cell.children, [...cellPath]);
};

const selectionForTable = (
  table: Element,
  tablePath: Path,
  target: {
    col?: number;
    edge?: 'end' | 'start';
    key?: string;
    row?: number;
  }
): Range | undefined => {
  const grid = compileTableGrid(table);
  const anchor =
    (target.key ? grid.byKey.get(target.key) : undefined) ??
    grid.slots[target.row ?? 0]?.[target.col ?? 0] ??
    grid.anchors[0];

  if (!anchor) return undefined;

  const point = firstTextPoint(
    anchor.cell,
    freezePath(tablePath.concat(anchor.path)),
    target.edge ?? 'start'
  );

  if (!point) return undefined;

  return deepFreeze({
    anchor: point,
    focus: point,
    kind: 'text' as const,
  });
};

type TableSelectionTarget = Parameters<typeof selectionForTable>[2];

const selectionForTableTargets = (
  table: Element,
  tablePath: Path,
  target:
    | TableSelectionTarget
    | Readonly<{
        anchor: TableSelectionTarget;
        focus: TableSelectionTarget;
      }>
): Range | undefined => {
  if (!('anchor' in target)) {
    return selectionForTable(table, tablePath, target);
  }

  const anchor = selectionForTable(table, tablePath, target.anchor)?.anchor;
  const focus = selectionForTable(table, tablePath, target.focus)?.focus;

  if (!anchor || !focus) return undefined;

  return deepFreeze({
    anchor,
    focus,
    kind: 'text' as const,
  });
};

const planWithSelection = (
  context: TableContext,
  operations: MutableOperation[],
  target?:
    | TableSelectionTarget
    | Readonly<{
        anchor: TableSelectionTarget;
        focus: TableSelectionTarget;
      }>
): TableMutationPlan => {
  const selection = target
    ? (() => {
        const table = applyOperations(
          context.table,
          context.tablePath,
          operations
        );

        return table
          ? selectionForTableTargets(table, context.tablePath, target)
          : undefined;
      })()
    : undefined;

  return freezePlan(operations, selection);
};

const planInsertColumn = (
  context: TableContext,
  intent: InsertColumnIntent
): TableMutationPlan | TableMutationDiagnostic => {
  const selected = targetAnchor(context, intent);

  if (!selected) return missingAnchor(intent);

  const insertCol =
    intent.atColumn ??
    (intent.before ? selected.col : selected.col + selected.colSpan);
  const firstColumn = insertCol === 0;
  const checkingCol =
    intent.atColumn === undefined
      ? firstColumn
        ? 0
        : intent.before
          ? selected.col
          : selected.col + selected.colSpan - 1
      : Math.max(0, insertCol - 1);
  const affected = new Set<TableGridAnchor>();

  for (let row = 0; row < context.grid.height; row++) {
    const anchor = context.grid.slots[row]?.[checkingCol];

    if (anchor) affected.add(anchor);
  }

  const operations: MutableOperation[] = [];

  for (const anchor of affected) {
    const crossesBoundary =
      (intent.atColumn !== undefined || !intent.before) &&
      !firstColumn &&
      anchor.col + anchor.colSpan - 1 >= insertCol;

    if (crossesBoundary) {
      operations.push(
        ...spanOperations(context, anchor, 'colSpan', anchor.colSpan + 1)
      );
      continue;
    }

    const sourceRow = context.table.children[anchor.row] as TableRowElement;
    const header = intent.header ?? rowIsHeader(sourceRow);
    const cell = intent.createCell({
      col: insertCol,
      header,
      row: anchor.row,
      sourceRow,
    });
    const nextCell = cloneMutableCell(cell);

    setSpan(nextCell, 'rowSpan', anchor.rowSpan);

    operations.push({
      kind: 'insert-node',
      node: nextCell,
      path: absolutePath(context, [
        anchor.row,
        anchor.cellIndex +
          (firstColumn || (intent.atColumn === undefined && intent.before)
            ? 0
            : 1),
      ]),
    });
  }

  operations.sort((left, right) => {
    if (left.kind !== 'insert-node' || right.kind !== 'insert-node') return 0;

    return comparePaths(left.path, right.path);
  });

  const currentColSizes = getTableColumnSizes(context.table);

  if (currentColSizes) {
    operations.push({
      kind: 'set-node',
      path: freezePath(context.tablePath),
      properties: {
        columnWidths: resizeColumnSizes(
          currentColSizes,
          insertCol,
          context.grid.width,
          intent.initialTableWidth,
          intent.minColumnWidth
        ),
      },
    });
  }

  return planWithSelection(
    context,
    operations,
    intent.select ? { col: insertCol, row: selected.row } : undefined
  );
};

const planInsertRow = (
  context: TableContext,
  intent: InsertRowIntent
): TableMutationPlan | TableMutationDiagnostic => {
  const selected = targetAnchor(context, intent);

  if (!selected) return missingAnchor(intent);

  const insertRow = intent.before
    ? selected.row
    : selected.row + selected.rowSpan;
  const firstRow = insertRow === 0;
  const checkingRow = firstRow
    ? 0
    : intent.before
      ? selected.row - 1
      : selected.row + selected.rowSpan - 1;
  const affected = new Set(
    (context.grid.slots[checkingRow] ?? []).filter(
      (anchor): anchor is TableGridAnchor => !!anchor
    )
  );
  const operations: MutableOperation[] = [];
  const newCells: Array<{ cell: RuntimeTableCellElement; col: number }> = [];

  for (const anchor of affected) {
    if (anchor.row + anchor.rowSpan - 1 >= insertRow && !firstRow) {
      operations.push(
        ...spanOperations(context, anchor, 'rowSpan', anchor.rowSpan + 1)
      );
      continue;
    }

    const sourceRow = context.table.children[anchor.row] as TableRowElement;
    const header = intent.header ?? rowIsHeader(sourceRow);
    const cell = cloneMutableCell(
      intent.createCell({
        col: anchor.col,
        header,
        row: insertRow,
        sourceRow,
      })
    );

    setSpan(cell, 'colSpan', anchor.colSpan);
    newCells.push({ cell, col: anchor.col });
  }

  operations.push({
    kind: 'insert-node',
    node: {
      children: newCells
        .sort((left, right) => left.col - right.col)
        .map(({ cell }) => cell),
      type: intent.rowType,
    },
    path: absolutePath(context, [insertRow]),
  });

  return planWithSelection(
    context,
    operations,
    intent.select ? { col: 0, row: insertRow } : undefined
  );
};

const planInsertTable = (
  context: TableContext,
  intent: InsertTableIntent
): TableMutationPlan => {
  const options = intent.options ?? {};

  return freezePlan(
    [
      {
        kind: 'insert-node',
        node: context.table,
        options: {
          ...(options.hanging === undefined
            ? {}
            : { hanging: options.hanging }),
          ...(options.mode === undefined ? {} : { mode: options.mode }),
          ...(options.split === undefined ? {} : { split: options.split }),
          ...(options.voids === undefined ? {} : { voids: options.voids }),
        },
        path: freezePath(context.tablePath),
      },
    ],
    options.select
      ? selectionForTable(context.table, context.tablePath, {
          col: 0,
          row: 0,
        })
      : undefined
  );
};

const planRemoveColumn = (
  context: TableContext,
  intent: RemoveColumnIntent
): TableMutationPlan | TableMutationDiagnostic => {
  const selected =
    intent.startCol === undefined ? targetAnchor(context, intent) : undefined;

  if (intent.startCol === undefined && !selected) return missingAnchor(intent);

  const start =
    intent.startCol ??
    (selected ?? failInvariant('Expected value to be defined')).col;
  const count =
    intent.columnCount ??
    (selected ?? failInvariant('Expected value to be defined')).colSpan;
  const end = start + count - 1;

  if (count >= context.grid.width) {
    return freezePlan([
      { kind: 'remove-table', path: freezePath(context.tablePath) },
    ]);
  }

  const operations: MutableOperation[] = [];
  const removals: MutableOperation[] = [];

  for (const anchor of context.grid.anchors) {
    const anchorEnd = anchor.col + anchor.colSpan - 1;
    const overlap = Math.min(anchorEnd, end) - Math.max(anchor.col, start) + 1;

    if (overlap <= 0) continue;

    if (anchor.col < start || anchorEnd > end) {
      operations.push(
        ...spanOperations(context, anchor, 'colSpan', anchor.colSpan - overlap)
      );
    } else {
      removals.push({
        kind: 'remove-node',
        path: absolutePath(context, anchor.path),
      });
    }
  }

  removals.sort((left, right) => {
    if (left.kind !== 'remove-node' || right.kind !== 'remove-node') return 0;

    return comparePaths(right.path, left.path);
  });
  operations.push(...removals);

  const currentColSizes = getTableColumnSizes(context.table);

  if (currentColSizes) {
    const columnWidths = Array.from(
      { length: context.grid.width },
      (_, index) => currentColSizes[index] ?? null
    );

    columnWidths.splice(start, count);
    operations.push({
      kind: 'set-node',
      path: freezePath(context.tablePath),
      properties: { columnWidths },
    });
  }

  const targetCol = Math.min(start, context.grid.width - count - 1);

  return planWithSelection(
    context,
    operations,
    intent.selectionRows
      ? {
          anchor: {
            col: targetCol,
            edge: 'end',
            row: intent.selectionRows[0],
          },
          focus: {
            col: targetCol,
            edge: 'end',
            row: intent.selectionRows[1],
          },
        }
      : {
          col: targetCol,
          row: intent.selectionRow ?? selected?.row ?? 0,
        }
  );
};

const planRemoveRow = (
  context: TableContext,
  intent: RemoveRowIntent
): TableMutationPlan | TableMutationDiagnostic => {
  const selected =
    intent.startRow === undefined ? targetAnchor(context, intent) : undefined;

  if (intent.startRow === undefined && !selected) return missingAnchor(intent);

  const start =
    intent.startRow ??
    (selected ?? failInvariant('Expected value to be defined')).row;
  const count =
    intent.rowCount ??
    (selected ?? failInvariant('Expected value to be defined')).rowSpan;
  const end = start + count - 1;

  if (count >= context.grid.height) {
    return freezePlan([]);
  }

  const operations: MutableOperation[] = [];
  const moved: Array<{
    anchor: TableGridAnchor;
    cell: RuntimeTableCellElement;
  }> = [];

  for (const anchor of context.grid.anchors) {
    const anchorEnd = anchor.row + anchor.rowSpan - 1;
    const overlap = Math.min(anchorEnd, end) - Math.max(anchor.row, start) + 1;

    if (overlap <= 0) continue;

    if (anchor.row < start) {
      operations.push(
        ...spanOperations(context, anchor, 'rowSpan', anchor.rowSpan - overlap)
      );
    } else if (anchorEnd > end) {
      const cell = cloneMutableCell(anchor.cell);

      setSpan(cell, 'rowSpan', anchor.rowSpan - overlap);
      moved.push({ anchor, cell });
    }
  }

  const targetRowIndex = end + 1;

  if (moved.length > 0) {
    const targetRow = context.table.children[targetRowIndex] as
      | TableRowElement
      | undefined;

    if (targetRow) {
      const cells = [
        ...(targetRow.children as readonly TableCellElement[]).map(
          (cell, index) => ({
            cell,
            col:
              context.grid.byCell.get(cell)?.col ??
              context.grid.byPath.get(`${targetRowIndex},${index}`)?.col ??
              Number.MAX_SAFE_INTEGER,
          })
        ),
        ...moved.map(({ anchor, cell }) => ({ cell, col: anchor.col })),
      ]
        .sort((left, right) => left.col - right.col)
        .map(({ cell }) => cell);

      operations.push({
        children: cells,
        kind: 'replace-children',
        path: absolutePath(context, [targetRowIndex]),
      });
    }
  }

  for (let row = end; row >= start; row--) {
    operations.push({
      kind: 'remove-node',
      path: absolutePath(context, [row]),
    });
  }

  return planWithSelection(context, operations, {
    col: intent.selectionCol ?? selected?.col ?? 0,
    row: Math.min(start, context.grid.height - count - 1),
  });
};

const nodeHasContent = (node: Descendant): boolean => {
  if (typeof node.text === 'string') {
    return node.text.length > 0;
  }

  return (
    Array.isArray(node.children) &&
    (node.children as readonly Descendant[]).some(nodeHasContent)
  );
};

const planMerge = (
  context: TableContext,
  intent: MergeIntent
): TableMutationPlan | TableMutationDiagnostic => {
  if (intent.cellKeys.length === 0) {
    return invalidSelection(intent.cellKeys, 'empty');
  }
  if (new Set(intent.cellKeys).size !== intent.cellKeys.length) {
    return invalidSelection(intent.cellKeys, 'duplicate-key');
  }

  const requested = intent.cellKeys.map((key) => context.grid.byKey.get(key));

  if (requested.some((anchor) => !anchor)) {
    return invalidSelection(intent.cellKeys, 'unknown-key');
  }

  const anchors = requested as TableGridAnchor[];
  const minRow = Math.min(...anchors.map(({ row }) => row));
  const maxRow = Math.max(
    ...anchors.map(({ row, rowSpan }) => row + rowSpan - 1)
  );
  const minCol = Math.min(...anchors.map(({ col }) => col));
  const maxCol = Math.max(
    ...anchors.map(({ col, colSpan }) => col + colSpan - 1)
  );
  const closure = new Set<TableGridAnchor>();

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const anchor = context.grid.slots[row]?.[col];

      if (anchor) closure.add(anchor);
    }
  }

  if (
    closure.size !== anchors.length ||
    anchors.some((anchor) => !closure.has(anchor))
  ) {
    return invalidSelection(intent.cellKeys, 'non-rectangular');
  }

  const ordered = context.grid.anchors.filter((anchor) => closure.has(anchor));
  const first = ordered[0];
  const content = ordered.flatMap(({ cell }) =>
    cell.children.some(nodeHasContent) ? cloneDeep(cell.children) : []
  );
  const fallback = intent.createCell({
    children: content,
    col: minCol,
    header: cellIsHeader(first.cell),
    row: minRow,
    sourceRow: context.table.children[minRow] as TableRowElement,
  });
  const merged = cloneMutableCell({
    ...fallback,
    ...first.cell,
    children: content.length > 0 ? content : fallback.children,
  });

  setSpan(merged, 'colSpan', maxCol - minCol + 1);
  setSpan(merged, 'rowSpan', maxRow - minRow + 1);

  const operations: MutableOperation[] = [];
  const selectedByRow = new Map<number, Set<number>>();

  for (const anchor of ordered) {
    const indexes = selectedByRow.get(anchor.row) ?? new Set<number>();

    indexes.add(anchor.cellIndex);
    selectedByRow.set(anchor.row, indexes);
  }

  for (const [rowIndex, indexes] of [...selectedByRow].sort(
    ([left], [right]) => right - left
  )) {
    const row = context.table.children[rowIndex] as TableRowElement;
    const children: RuntimeTableCellElement[] = (
      row.children as readonly TableCellElement[]
    ).filter((_, index) => !indexes.has(index));

    if (rowIndex === first.row) {
      const insertionIndex = (row.children as readonly TableCellElement[])
        .slice(0, first.cellIndex)
        .filter((_, index) => !indexes.has(index)).length;

      children.splice(insertionIndex, 0, merged);
    }

    operations.push({
      children,
      kind: 'replace-children',
      path: absolutePath(context, [rowIndex]),
    });
  }

  return planWithSelection(context, operations, {
    edge: 'end',
    key: first.key,
    row: first.row,
    col: first.col,
  });
};

const planSplit = (
  context: TableContext,
  intent: SplitIntent
): TableMutationPlan | TableMutationDiagnostic => {
  const selected = targetAnchor(context, intent);

  if (!selected) return missingAnchor(intent);
  const colSpan = getColSpan(selected.cell);
  const rowSpan = getRowSpan(selected.cell);

  if (colSpan === 1 && rowSpan === 1) return freezePlan([]);

  const operations: MutableOperation[] = [];

  for (
    let rowIndex = selected.row;
    rowIndex < selected.row + rowSpan;
    rowIndex++
  ) {
    const row = context.table.children[rowIndex] as TableRowElement | undefined;
    const existing: RuntimeTableCellElement[] = row
      ? [...(row.children as readonly TableCellElement[])]
      : [];
    const rowAnchors = context.grid.anchorsByRow[rowIndex] ?? [];
    const insertionIndex =
      rowIndex === selected.row
        ? selected.cellIndex
        : (rowAnchors.find((anchor) => anchor.col >= selected.col)?.cellIndex ??
          existing.length);
    const cells: RuntimeTableCellElement[] = [];

    for (let colOffset = 0; colOffset < colSpan; colOffset++) {
      if (rowIndex === selected.row && colOffset === 0) {
        const first = cloneMutableCell(selected.cell);

        setSpan(first, 'colSpan', 1);
        setSpan(first, 'rowSpan', 1);
        cells.push(first);
      } else {
        cells.push(
          intent.createCell({
            col: selected.col + colOffset,
            header: cellIsHeader(selected.cell),
            row: rowIndex,
            sourceRow: row,
          })
        );
      }
    }

    if (rowIndex === selected.row) {
      existing.splice(insertionIndex, 1, ...cells);
    } else {
      existing.splice(insertionIndex, 0, ...cells);
    }

    if (row) {
      operations.push({
        children: existing,
        kind: 'replace-children',
        path: absolutePath(context, [rowIndex]),
      });
    } else {
      operations.push({
        kind: 'insert-node',
        node: { children: cells, type: intent.rowType },
        path: absolutePath(context, [rowIndex]),
      });
    }
  }

  return planWithSelection(context, operations, {
    edge: 'end',
    key: selected.key,
    row: selected.row,
    col: selected.col,
  });
};

type PreparedTableRepair = Readonly<{
  context: TableContext;
  kind: 'prepared-repair';
  operations: readonly MutableOperation[];
  table: Element;
}>;

const isRepairableGridProblem = (problem: TableGridProblem) =>
  problem.kind === 'collision' ||
  problem.kind === 'invalid-col-span' ||
  problem.kind === 'invalid-row-span' ||
  problem.kind === 'row-span-overflow' ||
  problem.kind === 'uncovered-slot';

const prepareTableRepair = (
  initialContext: TableContext,
  intent: RepairIntent
): PreparedTableRepair | TableMutationDiagnostic => {
  const operations: MutableOperation[] = [];
  let context = initialContext;
  let { table } = initialContext;
  const maxPasses = Math.max(
    4,
    context.grid.anchors.length + context.grid.problems.length + 2
  );

  for (let pass = 0; pass < maxPasses; pass++) {
    const repairableProblems = context.grid.problems.filter(
      isRepairableGridProblem
    );

    if (repairableProblems.length === 0) {
      return {
        context,
        kind: 'prepared-repair',
        operations,
        table,
      };
    }

    const step: MutableOperation[] = [];

    if (intent.extendRowSpans) {
      const requiredHeight = repairableProblems.reduce(
        (height, problem) =>
          problem.kind === 'row-span-overflow'
            ? Math.max(height, problem.cellPath[0] + problem.requested)
            : height,
        context.grid.height
      );
      const fallbackRowType = (
        context.table.children.at(-1) as TableRowElement | undefined
      )?.type;

      for (let row = context.grid.height; row < requiredHeight; row++) {
        step.push({
          kind: 'insert-node',
          node: intent.createRow?.(row) ?? {
            children: [],
            type: fallbackRowType ?? 'tableRow',
          },
          path: absolutePath(context, [row]),
        });
      }
    }

    if (step.length === 0) {
      const spanUpdates = new Map<
        string,
        {
          anchor: TableGridAnchor;
          colSpan?: number;
          rowSpan?: number;
        }
      >();
      const updateSpan = (
        problem: Extract<
          TableGridProblem,
          {
            cellPath: Path;
          }
        >,
        key: 'colSpan' | 'rowSpan',
        value: number
      ) => {
        const pathKey = problem.cellPath.join(',');
        const anchor = context.grid.byPath.get(pathKey);

        if (!anchor) return;

        const update = spanUpdates.get(pathKey) ?? { anchor };

        update[key] = value;
        spanUpdates.set(pathKey, update);
      };
      const firstCollision = repairableProblems.find(
        (problem) => problem.kind === 'collision'
      );
      const spanProblems = firstCollision
        ? [firstCollision]
        : repairableProblems;

      for (const problem of spanProblems) {
        switch (problem.kind) {
          case 'collision': {
            updateSpan(problem, 'colSpan', 1);
            updateSpan(problem, 'rowSpan', 1);
            break;
          }
          case 'invalid-col-span': {
            updateSpan(problem, 'colSpan', 1);
            break;
          }
          case 'invalid-row-span': {
            updateSpan(problem, 'rowSpan', 1);
            break;
          }
          case 'row-span-overflow': {
            if (!intent.extendRowSpans) {
              updateSpan(problem, 'rowSpan', problem.actual);
            }
            break;
          }
          case 'uncovered-slot': {
            break;
          }
        }
      }

      for (const { anchor, colSpan, rowSpan } of [...spanUpdates.values()].sort(
        (left, right) => comparePaths(left.anchor.path, right.anchor.path)
      )) {
        if (
          colSpan !== undefined &&
          anchor.cell.colSpan !== (colSpan > 1 ? colSpan : undefined)
        ) {
          step.push(...spanOperations(context, anchor, 'colSpan', colSpan));
        }
        if (
          rowSpan !== undefined &&
          anchor.cell.rowSpan !== (rowSpan > 1 ? rowSpan : undefined)
        ) {
          step.push(...spanOperations(context, anchor, 'rowSpan', rowSpan));
        }
      }
    }

    if (step.length === 0) {
      const uncoveredByRow = new Map<number, number[]>();

      for (const problem of repairableProblems) {
        if (problem.kind !== 'uncovered-slot') continue;

        const columns = uncoveredByRow.get(problem.slot.row) ?? [];

        columns.push(problem.slot.col);
        uncoveredByRow.set(problem.slot.row, columns);
      }

      for (const [row, columns] of [...uncoveredByRow].sort(
        ([left], [right]) => left - right
      )) {
        const sourceRow = context.table.children[row] as TableRowElement;
        const anchors = context.grid.anchorsByRow[row] ?? [];

        columns.sort((left, right) => left - right);
        columns.forEach((col, offset) => {
          const cellIndex =
            anchors.filter((anchor) => anchor.col < col).length + offset;

          step.push({
            kind: 'insert-node',
            node: intent.createCell({
              col,
              header: rowIsHeader(sourceRow),
              row,
              sourceRow,
            }),
            path: absolutePath(context, [row, cellIndex]),
          });
        });
      }
    }

    if (step.length === 0) {
      return deepFreeze({
        kind: 'invalid-table' as const,
        problems: cloneDeep(repairableProblems),
        reason: 'repair-stalled' as const,
      });
    }

    const next = applyOperations(table, context.tablePath, step);

    if (!next) {
      return deepFreeze({
        kind: 'invalid-table' as const,
        problems: cloneDeep(repairableProblems),
        reason: 'repair-stalled' as const,
      });
    }

    operations.push(...step);
    table = next;
    context = createDetachedTableContext(table, context.tablePath);
  }

  return deepFreeze({
    kind: 'invalid-table' as const,
    problems: cloneDeep(context.grid.problems.filter(isRepairableGridProblem)),
    reason: 'repair-stalled' as const,
  });
};

const planRepair = (
  context: TableContext,
  intent: RepairIntent
): TableMutationDiagnostic | TableMutationPlan => {
  const repair = prepareTableRepair(context, intent);

  return repair.kind === 'prepared-repair'
    ? freezePlan(repair.operations)
    : repair;
};

export const planTableMutation = (
  context: TableContext,
  intent: TableIntent
): TableMutationDiagnostic | TableMutationPlan => {
  switch (intent.kind) {
    case 'insert-column': {
      return planInsertColumn(context, intent);
    }
    case 'insert-row': {
      return planInsertRow(context, intent);
    }
    case 'insert-table': {
      return planInsertTable(context, intent);
    }
    case 'merge': {
      return planMerge(context, intent);
    }
    case 'remove-column': {
      return planRemoveColumn(context, intent);
    }
    case 'remove-row': {
      return planRemoveRow(context, intent);
    }
    case 'remove-table': {
      return freezePlan([
        { kind: 'remove-table', path: freezePath(context.tablePath) },
      ]);
    }
    case 'repair': {
      return planRepair(context, intent);
    }
    case 'split': {
      return planSplit(context, intent);
    }
  }

  return failInvariant('Unexpected table mutation intent');
};

const mutableNodeAt = (
  table: MutableTable,
  path: readonly number[]
): MutableElement | undefined => {
  let node: MutableElement = table;

  for (const index of path) {
    const next = node.children[index];

    if (!next || !isMutableElement(next)) return undefined;
    node = next;
  }

  return node;
};

const applyOperations = (
  table: Element,
  tablePath: readonly number[],
  operations: ReadonlyArray<MutableOperation | TableOperation>
): Element | null => {
  const next = cloneMutableTable(table);

  for (const operation of operations) {
    if (
      operation.kind === 'remove-table' &&
      comparePaths(operation.path, tablePath) === 0
    ) {
      return null;
    }
    const relative = operation.path.slice(tablePath.length);

    if (operation.kind === 'insert-node') {
      const parent = mutableNodeAt(next, relative.slice(0, -1));
      const index = relative.at(-1);

      if (!parent || index === undefined) {
        throw new Error(`Invalid table insert path ${operation.path}`);
      }

      parent.children.splice(index, 0, cloneMutableElement(operation.node));
      continue;
    }
    if (operation.kind === 'remove-node') {
      const parent = mutableNodeAt(next, relative.slice(0, -1));
      const index = relative.at(-1);

      if (!parent || index === undefined || !parent.children[index]) {
        throw new Error(`Invalid table remove path ${operation.path}`);
      }

      parent.children.splice(index, 1);
      continue;
    }

    const node = mutableNodeAt(next, relative);

    if (!node) {
      throw new Error(`Invalid table operation path ${operation.path}`);
    }

    if (operation.kind === 'replace-children') {
      node.children = operation.children.map(cloneMutableDescendant);
    } else if (operation.kind === 'set-node') {
      Object.assign(node, cloneDeep(operation.properties));
    } else if (operation.kind === 'unset-node') {
      for (const key of operation.keys) {
        delete node[key];
      }
    }
  }

  return next;
};

export const applyTableMutationPlanToTable = (
  table: Element,
  tablePath: readonly number[],
  plan: TableMutationPlan
): Element | null => applyOperations(table, tablePath, plan.operations);

export const applyTableMutationPlan = (
  tx: TableMutationTransaction,
  plan: TableMutationPlan
) => {
  for (const operation of plan.operations) {
    switch (operation.kind) {
      case 'insert-node': {
        tx.nodes.insert(operation.node, {
          ...operation.options,
          at: operation.path,
        });
        break;
      }
      case 'remove-node':
      case 'remove-table': {
        tx.nodes.remove({ at: operation.path });
        break;
      }
      case 'replace-children': {
        tx.nodes.replaceChildren(operation.children, {
          at: operation.path,
        });
        break;
      }
      case 'set-node': {
        tx.nodes.set(operation.properties, { at: operation.path });
        break;
      }
      case 'unset-node': {
        tx.nodes.unset(operation.keys, { at: operation.path });
        break;
      }
    }
  }

  if (plan.selection) tx.selection.set(plan.selection);
};
