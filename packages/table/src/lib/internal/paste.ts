import type { BaseEditor } from '@platejs/core';
import {
  ContentSlice,
  type Descendant,
  DocumentChange,
  type EditorCoreUpdateTransaction,
  type EditorDocumentValue,
  type Path,
  type Range,
  type Value,
} from '@platejs/plite';
import { ElementApi } from '@platejs/plite';
import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '@platejs/utils';
import cloneDeep from 'lodash/cloneDeep.js';

import { createDetachedTableContext, type TableContext } from './context';
import { getColSpan, getRowSpan, setSpan } from './codec';
import type { TableGrid, TableGridAnchor, TableGridProblem } from './grid';
import {
  applyTableMutationPlan,
  applyTableMutationPlanToTable,
  planTableMutation,
  type TableCellFactory,
  type TableMutationDiagnostic,
  type TableOperation,
} from './mutation';
import type { TableSelectionBounds, TableSelectionView } from './selection';

export type TablePasteSource = 'csv' | 'html' | 'model' | 'tsv';

export type PreparedTablePaste = Readonly<{
  grid: TableGrid;
  height: number;
  source: TablePasteSource;
  width: number;
}>;

export type TablePasteDiagnostic =
  | Readonly<{
      kind: 'invalid-source';
      reason:
        | 'content-rejected'
        | 'empty'
        | 'malformed-exact'
        | 'repair-stalled';
      sourceCellId?: string;
    }>
  | Readonly<{
      kind: 'invalid-target';
      problems?: readonly TableGridProblem[];
      reason: 'collision' | 'empty' | 'repair-stalled';
    }>
  | Readonly<{
      kind: 'stale-drag';
      reason:
        | 'duplicate-id'
        | 'editor-mismatch'
        | 'invalid-grid'
        | 'missing-id'
        | 'missing-table'
        | 'version-mismatch';
    }>;

export type PreparedTablePastePlan = Readonly<{
  kind: 'plan';
  operations: readonly TableOperation[];
  selection: Range;
}>;

export type TableDragCapture = Readonly<{
  bounds: TableSelectionBounds;
  cellIds: readonly string[];
  editor: BaseEditor;
  root?: string;
  tableId: string;
  tablePath: Path;
  version: number;
}>;

export type TableCellDropPlan = Readonly<{
  change: DocumentChange;
  kind: 'plan';
  selection: Range;
}>;

type MutableCell = TTableCellElement & { children: Descendant[] };

type PrepareTablePasteOptions = Readonly<{
  createCell: TableCellFactory;
  createRow: (row: number) => TTableRowElement;
  source: TablePasteSource;
}>;

export type PlanPreparedTablePasteOptions = Readonly<{
  createCell: TableCellFactory;
  createRow: (row: number) => TTableRowElement;
  disableExpand?: boolean;
  fillBounds?: TableSelectionBounds;
  fitChildren: (
    cell: TTableCellElement,
    children: readonly Descendant[]
  ) => readonly Descendant[] | null;
  root?: string;
  startCol: number;
  startRow: number;
}>;

type TablePasteElementTypes = Readonly<{
  cellTypes: readonly string[];
  rowType: string;
  tableType: string;
}>;

type Placement = Readonly<{
  cell: TTableCellElement;
  col: number;
  colSpan: number;
  row: number;
  rowSpan: number;
}>;

const repairableProblem = (problem: TableGridProblem) =>
  problem.kind === 'collision' ||
  problem.kind === 'invalid-col-span' ||
  problem.kind === 'invalid-row-span' ||
  problem.kind === 'row-span-overflow' ||
  problem.kind === 'uncovered-slot';

const freezePath = (path: readonly number[]): Path =>
  Object.freeze([...path]) as Path;

const absolutePath = (
  context: TableContext,
  relativePath: readonly number[]
): Path => freezePath(context.tablePath.concat(relativePath));

const mapRepairDiagnostic = (
  diagnostic: TableMutationDiagnostic,
  owner: 'source' | 'target'
): TablePasteDiagnostic => {
  if (owner === 'source') {
    return Object.freeze({
      kind: 'invalid-source',
      reason: 'repair-stalled',
    });
  }

  return Object.freeze({
    kind: 'invalid-target',
    ...(diagnostic.kind === 'invalid-table'
      ? { problems: diagnostic.problems }
      : {}),
    reason: 'repair-stalled',
  });
};

const repairTable = (
  context: TableContext,
  {
    createCell,
    createRow,
    extendRowSpans,
    owner,
  }: Readonly<{
    createCell: TableCellFactory;
    createRow?: (row: number) => TTableRowElement;
    extendRowSpans?: boolean;
    owner: 'source' | 'target';
  }>
):
  | Readonly<{
      context: TableContext;
      operations: readonly TableOperation[];
    }>
  | TablePasteDiagnostic => {
  if (!context.grid.problems.some(repairableProblem)) {
    return Object.freeze({ context, operations: Object.freeze([]) });
  }

  const repair = planTableMutation(context, {
    createCell,
    ...(createRow ? { createRow } : {}),
    ...(extendRowSpans ? { extendRowSpans: true } : {}),
    kind: 'repair',
  });

  if (repair.kind !== 'plan') return mapRepairDiagnostic(repair, owner);

  const table = applyTableMutationPlanToTable(
    context.table,
    context.tablePath,
    repair
  );

  if (!table) {
    return Object.freeze({
      kind: owner === 'source' ? 'invalid-source' : 'invalid-target',
      reason: 'repair-stalled',
    }) as TablePasteDiagnostic;
  }

  return Object.freeze({
    context: createDetachedTableContext(table, context.tablePath),
    operations: repair.operations,
  });
};

export const getTablePasteElement = (
  slice: ContentSlice,
  { cellTypes, rowType, tableType }: TablePasteElementTypes
): TTableElement | null => {
  const content = [...slice.content];
  const table = content.find(
    (node) => ElementApi.isElement(node) && node.type === tableType
  );

  if (table) return table as TTableElement;

  if (
    content.length > 0 &&
    content.every((node) => ElementApi.isElement(node) && node.type === rowType)
  ) {
    return {
      children: content as TTableRowElement[],
      type: tableType,
    } as TTableElement;
  }

  if (
    content.length > 0 &&
    content.every(
      (node) => ElementApi.isElement(node) && cellTypes.includes(node.type)
    )
  ) {
    return {
      children: [
        {
          children: content as TTableCellElement[],
          type: rowType,
        },
      ],
      type: tableType,
    } as TTableElement;
  }

  return null;
};

export const createOrdinaryTablePasteElement = (
  children: readonly Descendant[],
  {
    cell,
    rowType,
    tableType,
  }: Readonly<{
    cell: TTableCellElement;
    rowType: string;
    tableType: string;
  }>
): TTableElement => {
  const {
    colSpan: _colSpan,
    id: _id,
    rowSpan: _rowSpan,
    ...cellProps
  } = cloneDeep(cell);

  return {
    children: [
      {
        children: [
          {
            ...cellProps,
            children: cloneDeep(children),
          },
        ],
        type: rowType,
      },
    ],
    type: tableType,
  };
};

export const prepareTablePaste = (
  table: TTableElement,
  { createCell, createRow, source }: PrepareTablePasteOptions
): PreparedTablePaste | TablePasteDiagnostic => {
  const repaired = repairTable(createDetachedTableContext(table), {
    createCell,
    createRow,
    extendRowSpans: true,
    owner: 'source',
  });

  if ('kind' in repaired) return repaired;

  const { grid } = repaired.context;

  if (grid.height === 0 || grid.width === 0 || grid.anchors.length === 0) {
    return Object.freeze({
      kind: 'invalid-source',
      reason: 'empty',
    });
  }

  return Object.freeze({
    grid,
    height: grid.height,
    source,
    width: grid.width,
  });
};

const cloneUnitCell = (
  context: TableContext,
  createCell: TableCellFactory,
  rows: ReadonlyMap<number, TTableRowElement>,
  row: number,
  col: number
): MutableCell => {
  const existing = context.grid.slots[row]?.[col];

  if (existing?.row === row && existing.col === col) {
    const cell = cloneDeep(existing.cell) as MutableCell;

    setSpan(cell, 'rowSpan', 1);
    setSpan(cell, 'colSpan', 1);

    return cell;
  }

  const sourceRow = rows.get(row);

  return cloneDeep(
    createCell({
      col,
      header:
        !!sourceRow &&
        sourceRow.children.length > 0 &&
        (sourceRow.children as readonly TTableCellElement[]).every(
          (cell) => cell.type === 'th'
        ),
      row,
      ...(sourceRow ? { sourceRow } : {}),
    })
  ) as MutableCell;
};

const firstTextPoint = (
  nodes: readonly Descendant[],
  path: readonly number[],
  edge: 'end' | 'start'
): Readonly<{ offset: number; path: Path }> | null => {
  const indexes =
    edge === 'start'
      ? nodes.map((_, index) => index)
      : nodes.map((_, index) => index).reverse();

  for (const index of indexes) {
    const node = nodes[index] as Descendant;
    const nextPath = path.concat(index);

    if (typeof node.text === 'string') {
      return Object.freeze({
        offset: edge === 'start' ? 0 : node.text.length,
        path: freezePath(nextPath),
      });
    }

    if (!Array.isArray(node.children)) continue;

    const point = firstTextPoint(
      node.children as readonly Descendant[],
      nextPath,
      edge
    );

    if (point) return point;
  }

  return null;
};

const pointForPlacement = (
  placement: Placement,
  rowChildren: ReadonlyMap<number, readonly TTableCellElement[]>,
  tablePath: Path,
  edge: 'end' | 'start',
  root?: string
) => {
  const children = rowChildren.get(placement.row);
  const cellIndex = children?.indexOf(placement.cell) ?? -1;

  if (cellIndex < 0) return null;

  const point = firstTextPoint(
    placement.cell.children,
    tablePath.concat(placement.row, cellIndex),
    edge
  );

  if (!point) return null;

  return Object.freeze({
    offset: point.offset,
    path: point.path,
    ...(root === undefined ? {} : { root }),
  });
};

const targetDimensions = (
  context: TableContext,
  prepared: PreparedTablePaste,
  options: PlanPreparedTablePasteOptions
) => {
  const startRow = options.fillBounds?.minRow ?? options.startRow;
  const startCol = options.fillBounds?.minCol ?? options.startCol;
  const requestedHeight = options.fillBounds
    ? options.fillBounds.maxRow - options.fillBounds.minRow + 1
    : prepared.height;
  const requestedWidth = options.fillBounds
    ? options.fillBounds.maxCol - options.fillBounds.minCol + 1
    : prepared.width;
  const endRow = options.disableExpand
    ? Math.min(context.grid.height, startRow + requestedHeight)
    : startRow + requestedHeight;
  const endCol = options.disableExpand
    ? Math.min(context.grid.width, startCol + requestedWidth)
    : startCol + requestedWidth;

  return Object.freeze({ endCol, endRow, startCol, startRow });
};

const planUnitTablePaste = (
  context: TableContext,
  prepared: PreparedTablePaste,
  options: PlanPreparedTablePasteOptions,
  bounds: Readonly<{
    endCol: number;
    endRow: number;
    startCol: number;
    startRow: number;
  }>
): PreparedTablePastePlan | TablePasteDiagnostic | null => {
  if (
    bounds.endRow > context.grid.height ||
    bounds.endCol > context.grid.width ||
    prepared.grid.anchors.some(
      (anchor) => anchor.rowSpan !== 1 || anchor.colSpan !== 1
    )
  ) {
    return null;
  }

  for (let row = bounds.startRow; row < bounds.endRow; row++) {
    for (let col = bounds.startCol; col < bounds.endCol; col++) {
      const anchor = context.grid.slots[row]?.[col];

      if (
        !anchor ||
        anchor.row !== row ||
        anchor.col !== col ||
        anchor.rowSpan !== 1 ||
        anchor.colSpan !== 1
      ) {
        return null;
      }
    }
  }

  const fitted = new Map<TableGridAnchor, readonly Descendant[]>();
  const operations: TableOperation[] = [];
  let anchorPoint: ReturnType<typeof firstTextPoint> = null;
  let focusPoint: ReturnType<typeof firstTextPoint> = null;

  for (let row = bounds.startRow; row < bounds.endRow; row++) {
    for (let col = bounds.startCol; col < bounds.endCol; col++) {
      const target = context.grid.slots[row]?.[col];
      const source =
        prepared.grid.slots[(row - bounds.startRow) % prepared.height]?.[
          (col - bounds.startCol) % prepared.width
        ];

      if (!target || !source) {
        return Object.freeze({ kind: 'invalid-source', reason: 'empty' });
      }

      let children = fitted.get(source);

      if (!children) {
        const nextChildren = options.fitChildren(
          target.cell,
          source.cell.children
        );

        if (nextChildren === null) {
          return Object.freeze({
            kind: 'invalid-source',
            reason: 'content-rejected',
            ...(source.id ? { sourceCellId: source.id } : {}),
          });
        }

        children = Object.freeze(cloneDeep(nextChildren));
        fitted.set(source, children);
      }

      const path = absolutePath(context, target.path);

      operations.push(
        Object.freeze({
          children: Object.freeze(cloneDeep(children)),
          kind: 'replace-children',
          path,
        })
      );

      if (row === bounds.startRow && col === bounds.startCol) {
        anchorPoint = firstTextPoint(children, path, 'start');
      }
      if (row === bounds.endRow - 1 && col === bounds.endCol - 1) {
        focusPoint = firstTextPoint(children, path, 'end');
      }
    }
  }

  if (!anchorPoint || !focusPoint) {
    return Object.freeze({
      kind: 'invalid-source',
      reason: 'content-rejected',
    });
  }

  return Object.freeze({
    kind: 'plan',
    operations: Object.freeze(operations),
    selection: Object.freeze({
      anchor: Object.freeze({
        ...anchorPoint,
        ...(options.root === undefined ? {} : { root: options.root }),
      }),
      focus: Object.freeze({
        ...focusPoint,
        ...(options.root === undefined ? {} : { root: options.root }),
      }),
      kind: 'text' as const,
    }),
  });
};

export const planPreparedTablePaste = (
  initialContext: TableContext,
  prepared: PreparedTablePaste,
  options: PlanPreparedTablePasteOptions
): PreparedTablePastePlan | TablePasteDiagnostic => {
  const repaired = repairTable(initialContext, {
    createCell: options.createCell,
    owner: 'target',
  });

  if ('kind' in repaired) return repaired;

  const context = repaired.context;
  const { endCol, endRow, startCol, startRow } = targetDimensions(
    context,
    prepared,
    options
  );

  if (
    startRow < 0 ||
    startCol < 0 ||
    endRow <= startRow ||
    endCol <= startCol
  ) {
    return Object.freeze({ kind: 'invalid-target', reason: 'empty' });
  }

  if (repaired.operations.length === 0) {
    const unitPlan = planUnitTablePaste(context, prepared, options, {
      endCol,
      endRow,
      startCol,
      startRow,
    });

    if (unitPlan) return unitPlan;
  }

  const finalHeight = Math.max(context.grid.height, endRow);
  const finalWidth = Math.max(context.grid.width, endCol);
  const rows = new Map<number, TTableRowElement>();

  for (let row = 0; row < context.table.children.length; row++) {
    rows.set(row, context.table.children[row] as TTableRowElement);
  }
  for (let row = context.table.children.length; row < finalHeight; row++) {
    rows.set(row, cloneDeep(options.createRow(row)));
  }

  const intersecting = new Set<TableGridAnchor>();

  for (let row = startRow; row < Math.min(endRow, context.grid.height); row++) {
    for (
      let col = startCol;
      col < Math.min(endCol, context.grid.width);
      col++
    ) {
      const anchor = context.grid.slots[row]?.[col];

      if (anchor) intersecting.add(anchor);
    }
  }

  const rowsToRebuild = new Set<number>();

  for (let row = startRow; row < endRow; row++) rowsToRebuild.add(row);

  for (const anchor of intersecting) {
    for (let row = anchor.row; row < anchor.row + anchor.rowSpan; row++) {
      rowsToRebuild.add(row);
    }
  }

  if (finalWidth > context.grid.width) {
    for (let row = 0; row < finalHeight; row++) rowsToRebuild.add(row);
  }

  const placementsByRow = new Map<number, Placement[]>();
  const plannedSlots = new Map<string, Placement>();
  const destinationSlots = new Map<string, Placement>();
  let collision = false;
  const addPlacement = (
    cell: TTableCellElement,
    row: number,
    col: number,
    rowSpan = getRowSpan(cell),
    colSpan = getColSpan(cell),
    destination = false
  ) => {
    const placement = Object.freeze({
      cell,
      col,
      colSpan,
      row,
      rowSpan,
    });
    const rowPlacements = placementsByRow.get(row) ?? [];

    rowPlacements.push(placement);
    placementsByRow.set(row, rowPlacements);

    for (let rowOffset = 0; rowOffset < rowSpan; rowOffset++) {
      for (let colOffset = 0; colOffset < colSpan; colOffset++) {
        const key = `${row + rowOffset},${col + colOffset}`;

        if (plannedSlots.has(key)) collision = true;
        plannedSlots.set(key, placement);
        if (destination) destinationSlots.set(key, placement);
      }
    }
  };

  for (const row of rowsToRebuild) {
    for (const anchor of context.grid.anchorsByRow[row] ?? []) {
      if (!intersecting.has(anchor)) {
        addPlacement(
          anchor.cell,
          anchor.row,
          anchor.col,
          anchor.rowSpan,
          anchor.colSpan
        );
      }
    }
  }

  for (const anchor of intersecting) {
    for (let row = anchor.row; row < anchor.row + anchor.rowSpan; row++) {
      for (let col = anchor.col; col < anchor.col + anchor.colSpan; col++) {
        const inside =
          row >= startRow && row < endRow && col >= startCol && col < endCol;

        if (inside) continue;

        const cell = cloneUnitCell(context, options.createCell, rows, row, col);

        addPlacement(cell, row, col, 1, 1);
      }
    }
  }

  const fitted = new Map<
    TableGridAnchor,
    readonly Descendant[] | TablePasteDiagnostic
  >();

  for (
    let tileRow = 0;
    tileRow < endRow - startRow;
    tileRow += prepared.height
  ) {
    for (
      let tileCol = 0;
      tileCol < endCol - startCol;
      tileCol += prepared.width
    ) {
      for (const sourceAnchor of prepared.grid.anchors) {
        const row = startRow + tileRow + sourceAnchor.row;
        const col = startCol + tileCol + sourceAnchor.col;

        if (row >= endRow || col >= endCol) continue;

        const rowSpan = Math.min(sourceAnchor.rowSpan, endRow - row);
        const colSpan = Math.min(sourceAnchor.colSpan, endCol - col);
        const cell = cloneUnitCell(context, options.createCell, rows, row, col);
        let children = fitted.get(sourceAnchor);

        if (!children) {
          const nextChildren = options.fitChildren(
            cell,
            sourceAnchor.cell.children
          );

          children =
            nextChildren === null
              ? Object.freeze({
                  kind: 'invalid-source' as const,
                  reason: 'content-rejected' as const,
                  ...(sourceAnchor.id ? { sourceCellId: sourceAnchor.id } : {}),
                })
              : Object.freeze(cloneDeep(nextChildren));
          fitted.set(sourceAnchor, children);
        }

        if (!Array.isArray(children)) {
          return children as TablePasteDiagnostic;
        }

        cell.children = cloneDeep(children);
        setSpan(cell, 'rowSpan', rowSpan);
        setSpan(cell, 'colSpan', colSpan);
        addPlacement(cell, row, col, rowSpan, colSpan, true);
      }
    }
  }

  for (const row of rowsToRebuild) {
    const minFillCol = row >= context.grid.height ? 0 : context.grid.width;

    for (let col = minFillCol; col < finalWidth; col++) {
      if (plannedSlots.has(`${row},${col}`)) continue;

      const cell = cloneUnitCell(context, options.createCell, rows, row, col);

      addPlacement(cell, row, col, 1, 1);
    }
  }

  if (collision) {
    return Object.freeze({ kind: 'invalid-target', reason: 'collision' });
  }

  const rowChildren = new Map<number, readonly TTableCellElement[]>();
  const operations: TableOperation[] = [...repaired.operations];

  for (const row of [...rowsToRebuild].sort((left, right) => left - right)) {
    const children = Object.freeze(
      [...(placementsByRow.get(row) ?? [])]
        .sort((left, right) => left.col - right.col)
        .map(({ cell }) => cell)
    );

    rowChildren.set(row, children);

    if (row < context.table.children.length) {
      operations.push(
        Object.freeze({
          children,
          kind: 'replace-children',
          path: absolutePath(context, [row]),
        })
      );
    } else {
      const sourceRow = rows.get(row);

      if (!sourceRow) {
        return Object.freeze({ kind: 'invalid-target', reason: 'empty' });
      }

      operations.push(
        Object.freeze({
          kind: 'insert-node',
          node: {
            ...sourceRow,
            children,
          },
          path: absolutePath(context, [row]),
        })
      );
    }
  }

  const anchorPlacement = destinationSlots.get(`${startRow},${startCol}`);
  const focusPlacement = destinationSlots.get(`${endRow - 1},${endCol - 1}`);

  if (!anchorPlacement || !focusPlacement) {
    return Object.freeze({ kind: 'invalid-target', reason: 'empty' });
  }

  const anchor = pointForPlacement(
    anchorPlacement,
    rowChildren,
    context.tablePath,
    'start',
    options.root
  );
  const focus = pointForPlacement(
    focusPlacement,
    rowChildren,
    context.tablePath,
    'end',
    options.root
  );

  if (!anchor || !focus) {
    return Object.freeze({
      kind: 'invalid-source',
      reason: 'content-rejected',
    });
  }

  return Object.freeze({
    kind: 'plan',
    operations: Object.freeze(operations),
    selection: Object.freeze({
      anchor,
      focus,
      kind: 'text' as const,
    }),
  });
};

export const applyPreparedTablePastePlan = <V extends Value>(
  tx: Pick<EditorCoreUpdateTransaction<V>, 'nodes' | 'selection'>,
  plan: PreparedTablePastePlan
) => {
  applyTableMutationPlan(tx, {
    kind: 'plan',
    operations: plan.operations,
    selection: plan.selection,
  });
};

type TableNodeFactory = Readonly<{
  createCell: (options?: {
    children?: Descendant[];
    header?: boolean;
    row?: TTableRowElement;
  }) => TTableCellElement;
  createRow: (options?: { colCount?: number }) => TTableRowElement;
}>;

const rootChildren = (
  value: EditorDocumentValue,
  root?: string
): readonly Descendant[] | null =>
  root === undefined ? value.children : (value.roots?.[root] ?? null);

const nodeAtPath = (
  children: readonly Descendant[],
  path: readonly number[]
): Descendant | null => {
  let nodes = children;
  let node: Descendant | undefined;

  for (const index of path) {
    node = nodes[index];

    if (!node) return null;
    nodes = Array.isArray(node.children)
      ? (node.children as readonly Descendant[])
      : [];
  }

  return node ?? null;
};

const replaceNodeAtPath = (
  children: readonly Descendant[],
  path: readonly number[],
  replacement: Descendant
): readonly Descendant[] | null => {
  const [index, ...rest] = path;

  if (index === undefined || !children[index]) return null;

  const next = [...children];

  if (rest.length === 0) {
    next[index] = replacement;
    return Object.freeze(next);
  }

  const parent = children[index];

  if (!ElementApi.isElement(parent)) return null;

  const nextChildren = replaceNodeAtPath(parent.children, rest, replacement);

  if (!nextChildren) return null;

  next[index] = {
    ...parent,
    children: nextChildren,
  };

  return Object.freeze(next);
};

const replaceDocumentTable = (
  value: EditorDocumentValue,
  root: string | undefined,
  tablePath: Path,
  table: TTableElement
): EditorDocumentValue | null => {
  const children = rootChildren(value, root);

  if (!children) return null;

  const nextChildren = replaceNodeAtPath(children, tablePath, table);

  if (!nextChildren) return null;

  if (root === undefined) {
    return Object.freeze({
      ...value,
      children: nextChildren as Value,
    });
  }

  return Object.freeze({
    ...value,
    roots: Object.freeze({
      ...value.roots,
      [root]: nextChildren as Value,
    }),
  });
};

const applyFocusedTableOperations = (
  table: TTableElement,
  tablePath: Path,
  operations: readonly TableOperation[]
): TTableElement | null => {
  const rows = [...(table.children as readonly TTableRowElement[])];

  for (const operation of operations) {
    const relative = operation.path.slice(tablePath.length);

    const row = relative[0];

    if (row === undefined) return null;

    if (operation.kind === 'replace-children') {
      const current = rows[row];

      if (!current) return null;

      if (relative.length === 2) {
        const cellIndex = relative[1];
        const cells = [...(current.children as readonly TTableCellElement[])];
        const currentCell =
          cellIndex === undefined ? undefined : cells[cellIndex];

        if (!currentCell || cellIndex === undefined) return null;

        cells[cellIndex] = {
          ...currentCell,
          children: operation.children,
        };
        rows[row] = {
          ...current,
          children: Object.freeze(cells),
        };
        continue;
      }
      if (relative.length !== 1) return null;

      rows[row] = {
        ...current,
        children: operation.children as readonly TTableCellElement[],
      };
      continue;
    }

    if (
      relative.length === 1 &&
      operation.kind === 'insert-node' &&
      ElementApi.isElement(operation.node)
    ) {
      rows.splice(row, 0, operation.node as TTableRowElement);
      continue;
    }

    return null;
  }

  return Object.freeze({
    ...table,
    children: Object.freeze(rows),
  }) as TTableElement;
};

const selectedSourceTable = (
  table: TTableElement,
  capture: TableDragCapture
): TTableElement | TablePasteDiagnostic => {
  const context = createDetachedTableContext(table, capture.tablePath);
  const duplicateSourceId = context.grid.problems.some(
    (problem) => problem.kind === 'duplicate-id'
  );

  if (duplicateSourceId) {
    return Object.freeze({ kind: 'stale-drag', reason: 'duplicate-id' });
  }
  if (context.grid.problems.length > 0) {
    return Object.freeze({ kind: 'stale-drag', reason: 'invalid-grid' });
  }

  const selected = capture.cellIds.map((id) => context.grid.byId.get(id));

  if (selected.some((anchor) => !anchor)) {
    return Object.freeze({ kind: 'stale-drag', reason: 'missing-id' });
  }

  const unique = new Set(selected);

  if (unique.size !== selected.length) {
    return Object.freeze({ kind: 'stale-drag', reason: 'duplicate-id' });
  }

  const anchors = selected as TableGridAnchor[];
  const rows: TTableRowElement[] = [];

  for (let row = capture.bounds.minRow; row <= capture.bounds.maxRow; row++) {
    const sourceRow = table.children[row] as TTableRowElement | undefined;

    if (!sourceRow) {
      return Object.freeze({ kind: 'stale-drag', reason: 'missing-table' });
    }

    rows.push({
      ...sourceRow,
      children: anchors
        .filter((anchor) => anchor.row === row)
        .sort((left, right) => left.col - right.col)
        .map((anchor) => cloneDeep(anchor.cell)),
    });
  }

  return Object.freeze({
    ...table,
    children: Object.freeze(rows),
  }) as TTableElement;
};

const clearTableCells = (
  table: TTableElement,
  cellIds: readonly string[],
  keepIds: ReadonlySet<string>,
  createCell: TableNodeFactory['createCell']
): TTableElement => {
  const context = createDetachedTableContext(table);
  const rows = [...(table.children as readonly TTableRowElement[])];
  const nextRows = new Map<number, TTableCellElement[]>();

  for (const id of cellIds) {
    if (keepIds.has(id)) continue;

    const anchor = context.grid.byId.get(id);

    if (!anchor) continue;

    const row = rows[anchor.row];

    if (!row) continue;

    const children =
      nextRows.get(anchor.row) ??
      ([
        ...(row.children as readonly TTableCellElement[]),
      ] as TTableCellElement[]);
    const empty = createCell({
      header: anchor.cell.type === 'th',
      row,
    });

    children[anchor.cellIndex] = {
      ...anchor.cell,
      children: cloneDeep(empty.children),
    };
    nextRows.set(anchor.row, children);
  }

  if (nextRows.size === 0) return table;

  for (const [row, children] of nextRows) {
    rows[row] = {
      ...rows[row],
      children: Object.freeze(children),
    };
  }

  return Object.freeze({
    ...table,
    children: Object.freeze(rows),
  }) as TTableElement;
};

const tableCellSelection = (
  table: TTableElement,
  tablePath: Path,
  root: string | undefined,
  bounds: TableSelectionBounds
): Range | null => {
  const context = createDetachedTableContext(table, tablePath);
  const anchors: TableGridAnchor[] = [];
  const seen = new Set<TableGridAnchor>();

  for (let row = bounds.minRow; row <= bounds.maxRow; row++) {
    for (let col = bounds.minCol; col <= bounds.maxCol; col++) {
      const anchor = context.grid.slots[row]?.[col];

      if (anchor && !seen.has(anchor)) {
        seen.add(anchor);
        anchors.push(anchor);
      }
    }
  }

  const cells = anchors.flatMap((anchor) => {
    const start = firstTextPoint(
      anchor.cell.children,
      tablePath.concat(anchor.path),
      'start'
    );
    const end = firstTextPoint(
      anchor.cell.children,
      tablePath.concat(anchor.path),
      'end'
    );

    if (!start || !end) return [];

    return [
      Object.freeze({
        anchor: Object.freeze({
          ...start,
          ...(root === undefined ? {} : { root }),
        }),
        focus: Object.freeze({
          ...end,
          ...(root === undefined ? {} : { root }),
        }),
        kind: 'text' as const,
      }),
    ];
  });
  const first = cells[0];
  const last = cells.at(-1);

  if (!first || !last) return null;

  return Object.freeze({
    anchor: first.anchor,
    cells: Object.freeze(cells),
    focus: last.focus,
    kind: 'table-cell',
  }) as Range;
};

const targetBoundsForDrop = (
  context: TableContext,
  startRow: number,
  startCol: number,
  prepared: PreparedTablePaste,
  disableExpand: boolean
): TableSelectionBounds => {
  const endRow = disableExpand
    ? Math.min(context.grid.height, startRow + prepared.height)
    : startRow + prepared.height;
  const endCol = disableExpand
    ? Math.min(context.grid.width, startCol + prepared.width)
    : startCol + prepared.width;

  return Object.freeze({
    maxCol: endCol - 1,
    maxRow: endRow - 1,
    minCol: startCol,
    minRow: startRow,
  });
};

export const planTableCellDrop = (
  editor: BaseEditor,
  {
    copy,
    createCell: createTableCell,
    createRow: createTableRow,
    disableExpand,
    source,
    target,
  }: Readonly<{
    copy: boolean;
    createCell: TableNodeFactory['createCell'];
    createRow: TableNodeFactory['createRow'];
    disableExpand: boolean;
    source: TableDragCapture;
    target: TableSelectionView;
  }>
): TableCellDropPlan | TablePasteDiagnostic => {
  if (source.editor !== editor) {
    return Object.freeze({ kind: 'stale-drag', reason: 'editor-mismatch' });
  }

  const version = editor.read.runtime.snapshot().version;

  if (source.version !== version || target.version !== version) {
    return Object.freeze({ kind: 'stale-drag', reason: 'version-mismatch' });
  }
  const targetTableId =
    typeof target.table.id === 'string' ? target.table.id : undefined;

  if (
    !source.tableId ||
    !targetTableId ||
    !target.complete ||
    target.cellIds.length !== target.anchors.length
  ) {
    return Object.freeze({ kind: 'stale-drag', reason: 'missing-id' });
  }
  const duplicateTargetId = target.grid.problems.some(
    (problem) => problem.kind === 'duplicate-id'
  );

  if (duplicateTargetId) {
    return Object.freeze({ kind: 'stale-drag', reason: 'duplicate-id' });
  }
  if (target.grid.problems.length > 0) {
    return Object.freeze({
      kind: 'invalid-target',
      problems: target.grid.problems,
      reason: 'repair-stalled',
    });
  }

  const before = editor.read.value();
  const sourceRoot = rootChildren(before, source.root);
  const targetRoot = rootChildren(before, target.root);
  const currentSource = sourceRoot && nodeAtPath(sourceRoot, source.tablePath);
  const currentTarget = targetRoot && nodeAtPath(targetRoot, target.tablePath);

  if (
    !currentSource ||
    !ElementApi.isElement(currentSource) ||
    currentSource.id !== source.tableId ||
    !currentTarget ||
    !ElementApi.isElement(currentTarget) ||
    currentTarget.id !== targetTableId
  ) {
    return Object.freeze({ kind: 'stale-drag', reason: 'missing-table' });
  }

  const sourceTable = currentSource as TTableElement;
  const targetTable = currentTarget as TTableElement;
  const sourceElement = selectedSourceTable(sourceTable, source);

  if (!ElementApi.isElement(sourceElement)) {
    return sourceElement as TablePasteDiagnostic;
  }

  const createCell: TableCellFactory = ({ children, header, sourceRow }) =>
    createTableCell({
      ...(children ? { children: [...children] } : {}),
      header,
      ...(sourceRow ? { row: sourceRow } : {}),
    });
  const createRow = () => createTableRow({ colCount: 0 });
  const prepared = prepareTablePaste(sourceElement, {
    createCell,
    createRow,
    source: 'model',
  });

  if ('kind' in prepared) return prepared;

  const tableContext = createDetachedTableContext(
    targetTable,
    target.tablePath
  );
  const plan = planPreparedTablePaste(tableContext, prepared, {
    createCell,
    createRow,
    disableExpand,
    fitChildren: (cell, children) =>
      editor.read.slice.fitContent(ContentSlice.closed(children), {
        parent: cell,
        ...(target.root === undefined ? {} : { root: target.root }),
      }),
    ...(target.root === undefined ? {} : { root: target.root }),
    startCol: target.anchor.col,
    startRow: target.anchor.row,
  });

  if (plan.kind !== 'plan') return plan;

  let nextTarget = applyFocusedTableOperations(
    targetTable,
    target.tablePath,
    plan.operations
  );

  if (!nextTarget) {
    return Object.freeze({
      kind: 'invalid-target',
      reason: 'repair-stalled',
    });
  }

  const destinationBounds = targetBoundsForDrop(
    tableContext,
    target.anchor.row,
    target.anchor.col,
    prepared,
    disableExpand
  );
  const destinationIds = new Set<string>();
  const nextTargetContext = createDetachedTableContext(
    nextTarget,
    target.tablePath
  );

  for (
    let row = destinationBounds.minRow;
    row <= destinationBounds.maxRow;
    row++
  ) {
    for (
      let col = destinationBounds.minCol;
      col <= destinationBounds.maxCol;
      col++
    ) {
      const id = nextTargetContext.grid.slots[row]?.[col]?.id;

      if (id) destinationIds.add(id);
    }
  }

  const sameTable =
    source.root === target.root &&
    source.tablePath.length === target.tablePath.length &&
    source.tablePath.every(
      (index, offset) => target.tablePath[offset] === index
    );
  let after: EditorDocumentValue | null;

  if (sameTable) {
    if (!copy) {
      nextTarget = clearTableCells(
        nextTarget,
        source.cellIds,
        destinationIds,
        createTableCell
      );
    }

    after = replaceDocumentTable(
      before,
      target.root,
      target.tablePath,
      nextTarget
    );
  } else {
    const nextSource = copy
      ? sourceTable
      : clearTableCells(
          sourceTable,
          source.cellIds,
          new Set(),
          createTableCell
        );
    const withSource = replaceDocumentTable(
      before,
      source.root,
      source.tablePath,
      nextSource
    );

    after = withSource
      ? replaceDocumentTable(
          withSource,
          target.root,
          target.tablePath,
          nextTarget
        )
      : null;
  }

  if (!after) {
    return Object.freeze({ kind: 'stale-drag', reason: 'missing-table' });
  }

  const selection = tableCellSelection(
    nextTarget,
    target.tablePath,
    target.root,
    destinationBounds
  );

  if (!selection) {
    return Object.freeze({
      kind: 'invalid-target',
      reason: 'empty',
    });
  }

  return Object.freeze({
    change: DocumentChange.between(before, after),
    kind: 'plan',
    selection,
  });
};
