import cloneDeep from 'lodash/cloneDeep.js';

import {
  type ContentSlice,
  type Descendant,
  type Element,
  type Path,
  type Range,
  ElementApi,
} from '../../../../core';
import type { TableCellElement, TableRowElement } from '../BaseTablePlugin';
import { getColSpan, getRowSpan, setSpan } from './codec';
import { createDetachedTableContext, type TableContext } from './context';
import {
  getTableColumnSizes,
  type TableGrid,
  type TableGridAnchor,
  type TableGridProblem,
} from './grid';
import {
  applyTableMutationPlanToTable,
  planTableMutation,
  resizeTableColumnSizes,
  type TableCellFactory,
  type TableMutationDiagnostic,
  type TableOperation,
} from './mutation';
import type { TableSelectionBounds } from './selection';

export type PreparedTablePaste = Readonly<{
  grid: TableGrid;
  height: number;
  slice: ContentSlice;
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
      sourceCellKey?: string;
    }>
  | Readonly<{
      kind: 'invalid-target';
      problems?: readonly TableGridProblem[];
      reason:
        | 'collision'
        | 'empty'
        | 'overflow'
        | 'repair-stalled'
        | 'shape-mismatch';
    }>;

export type PreparedTablePastePlan = Readonly<{
  kind: 'plan';
  operations: readonly TableOperation[];
  placementGroups: readonly TablePastePlacementGroup[];
  selection: Range;
}>;

export type TablePastePlacementGroup = Readonly<{
  placements: ReadonlyArray<
    Readonly<{
      at: Path;
      content: TableCellElement['children'];
    }>
  >;
  source: ContentSlice;
}>;

type DeepMutable<T> = T extends (...args: any[]) => unknown
  ? T
  : T extends ReadonlyArray<infer TValue>
    ? Array<DeepMutable<TValue>>
    : T extends object
      ? { -readonly [TKey in keyof T]: DeepMutable<T[TKey]> }
      : T;

type MutableCell = DeepMutable<TableCellElement>;

type PrepareTablePasteOptions = Readonly<{
  createCell: TableCellFactory;
  createRow: (row: number) => TableRowElement;
  tableType: string;
}>;

export type PlanPreparedTablePasteOptions = Readonly<{
  createCell: TableCellFactory;
  createRow: (row: number) => TableRowElement;
  disableExpand?: boolean;
  fillBounds?: TableSelectionBounds;
  initialTableWidth?: number;
  minColumnWidth?: number;
  root?: string;
  startCol: number;
  startRow: number;
}>;

type Placement = Readonly<{
  cell: TableCellElement;
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

const freezePath = (path: readonly number[]): Path => Object.freeze([...path]);

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
    createRow?: (row: number) => TableRowElement;
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
    });
  }

  return Object.freeze({
    context: createDetachedTableContext(table, context.tablePath),
    operations: repair.operations,
  });
};

export const getTablePasteElement = (
  slice: ContentSlice,
  { tableType }: Readonly<{ tableType: string }>
): Element | null => {
  if (
    slice.openStart !== 0 ||
    slice.openEnd !== 0 ||
    slice.content.length !== 1
  ) {
    return null;
  }

  const [table] = slice.content;

  return ElementApi.isElement(table) && table.type === tableType ? table : null;
};

/** Returns null when the complete slice belongs to ordinary content fitting. */
export const prepareTablePaste = (
  slice: ContentSlice,
  { createCell, createRow, tableType }: PrepareTablePasteOptions
): PreparedTablePaste | TablePasteDiagnostic | null => {
  const table = getTablePasteElement(slice, { tableType });

  if (!table) return null;

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
    slice,
    width: grid.width,
  });
};

const cloneUnitCell = (
  context: TableContext,
  createCell: TableCellFactory,
  rows: ReadonlyMap<number, TableRowElement>,
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
        (sourceRow.children as readonly TableCellElement[]).every(
          (cell) => cell.header === true
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
    const node = nodes[index];
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
  rowChildren: ReadonlyMap<number, readonly TableCellElement[]>,
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
  const endRow = startRow + requestedHeight;
  const endCol = startCol + requestedWidth;

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

  const operations: TableOperation[] = [];
  const groups = new Map<
    string,
    Array<TablePastePlacementGroup['placements'][number]>
  >();
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

      const children = Object.freeze(cloneDeep(source.cell.children));
      const tileRow = Math.floor((row - bounds.startRow) / prepared.height);
      const tileCol = Math.floor((col - bounds.startCol) / prepared.width);
      const groupKey = `${tileRow},${tileCol}`;
      const placements = groups.get(groupKey) ?? [];
      const path = absolutePath(context, target.path);

      placements.push(Object.freeze({ at: path, content: children }));
      groups.set(groupKey, placements);

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
    placementGroups: Object.freeze(
      [...groups.values()].map((placements) =>
        Object.freeze({
          placements: Object.freeze(placements),
          source: prepared.slice,
        })
      )
    ),
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

  const { context } = repaired;
  const { endCol, endRow, startCol, startRow } = targetDimensions(
    prepared,
    options
  );

  if (
    options.fillBounds &&
    ((endRow - startRow) % prepared.height !== 0 ||
      (endCol - startCol) % prepared.width !== 0)
  ) {
    return Object.freeze({
      kind: 'invalid-target',
      reason: 'shape-mismatch',
    });
  }

  if (
    options.disableExpand &&
    (endRow > context.grid.height || endCol > context.grid.width)
  ) {
    return Object.freeze({ kind: 'invalid-target', reason: 'overflow' });
  }

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
  const rows = new Map<number, TableRowElement>();

  for (let row = 0; row < context.table.children.length; row++) {
    rows.set(row, context.table.children[row] as TableRowElement);
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

  if (
    [...intersecting].some(
      (anchor) =>
        anchor.row < startRow ||
        anchor.col < startCol ||
        anchor.row + anchor.rowSpan > endRow ||
        anchor.col + anchor.colSpan > endCol
    )
  ) {
    return Object.freeze({
      kind: 'invalid-target',
      reason: 'shape-mismatch',
    });
  }

  const rowsToRebuild = new Set<number>();

  for (let row = startRow; row < endRow; row++) rowsToRebuild.add(row);

  for (const anchor of intersecting) {
    for (let { row } = anchor; row < anchor.row + anchor.rowSpan; row++) {
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
    cell: TableCellElement,
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
    for (let { row } = anchor; row < anchor.row + anchor.rowSpan; row++) {
      for (let { col } = anchor; col < anchor.col + anchor.colSpan; col++) {
        const inside =
          row >= startRow && row < endRow && col >= startCol && col < endCol;

        if (inside) continue;

        const cell = cloneUnitCell(context, options.createCell, rows, row, col);

        addPlacement(cell, row, col, 1, 1);
      }
    }
  }

  const placementGroups: Array<
    Readonly<{
      placements: ReadonlyArray<
        Readonly<{
          cell: TableCellElement;
          content: TableCellElement['children'];
          row: number;
        }>
      >;
      source: ContentSlice;
    }>
  > = [];

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
      const group: Array<
        Readonly<{
          cell: TableCellElement;
          content: TableCellElement['children'];
          row: number;
        }>
      > = [];

      for (const sourceAnchor of prepared.grid.anchors) {
        const row = startRow + tileRow + sourceAnchor.row;
        const col = startCol + tileCol + sourceAnchor.col;

        if (row >= endRow || col >= endCol) continue;

        const rowSpan = Math.min(sourceAnchor.rowSpan, endRow - row);
        const colSpan = Math.min(sourceAnchor.colSpan, endCol - col);
        const cell = cloneUnitCell(context, options.createCell, rows, row, col);
        const content = Object.freeze(cloneDeep(sourceAnchor.cell.children));

        setSpan(cell, 'rowSpan', rowSpan);
        setSpan(cell, 'colSpan', colSpan);
        addPlacement(cell, row, col, rowSpan, colSpan, true);
        group.push(Object.freeze({ cell, content, row }));
      }

      if (group.length > 0) {
        placementGroups.push(
          Object.freeze({
            placements: Object.freeze(group),
            source: prepared.slice,
          })
        );
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

  const rowChildren = new Map<number, readonly TableCellElement[]>();
  const operations: TableOperation[] = [...repaired.operations];

  if (finalWidth > context.grid.width) {
    let columnWidths: ReadonlyArray<number | null> =
      getTableColumnSizes(context.table) ??
      Array.from({ length: context.grid.width }, () => null);

    for (
      let columnCount = context.grid.width;
      columnCount < finalWidth;
      columnCount++
    ) {
      columnWidths = resizeTableColumnSizes(
        columnWidths,
        columnCount,
        columnCount,
        options.initialTableWidth,
        options.minColumnWidth
      );
    }
    operations.push(
      Object.freeze({
        kind: 'set-node',
        path: absolutePath(context, []),
        properties: Object.freeze({
          columnWidths: Object.freeze([...columnWidths]),
        }),
      })
    );
  }

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
  const resolvedPlacementGroups: TablePastePlacementGroup[] = [];

  for (const group of placementGroups) {
    const placements: Array<TablePastePlacementGroup['placements'][number]> =
      [];

    for (const placement of group.placements) {
      const children = rowChildren.get(placement.row);
      const cellIndex = children?.indexOf(placement.cell) ?? -1;

      if (cellIndex < 0) {
        return Object.freeze({ kind: 'invalid-target', reason: 'empty' });
      }
      placements.push(
        Object.freeze({
          at: absolutePath(context, [placement.row, cellIndex]),
          content: placement.content,
        })
      );
    }
    resolvedPlacementGroups.push(
      Object.freeze({
        placements: Object.freeze(placements),
        source: group.source,
      })
    );
  }

  return Object.freeze({
    kind: 'plan',
    operations: Object.freeze(operations),
    placementGroups: Object.freeze(resolvedPlacementGroups),
    selection: Object.freeze({
      anchor,
      focus,
      kind: 'text' as const,
    }),
  });
};
