import type {
  EditorStateView,
  ElementEntry,
  Location,
  Path,
  Range,
  Value,
} from '@platejs/plite';
import { PathApi, PointApi, RangeApi } from '@platejs/plite';
import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '@platejs/utils';

import { createDetachedTableContext, type TableContext } from './context';
import type { TableGrid, TableGridAnchor } from './grid';

export type TableSelectionBounds = Readonly<{
  maxCol: number;
  maxRow: number;
  minCol: number;
  minRow: number;
}>;

export type TableSelectionExpansion = 'endpoint-union' | 'span-closure';

export type TableSelectionView = Readonly<{
  anchor: TableGridAnchor;
  anchors: readonly TableGridAnchor[];
  bounds: TableSelectionBounds;
  cellIds: readonly string[];
  cellEntries: readonly ElementEntry<TTableCellElement>[];
  complete: boolean;
  context: TableContext;
  focus: TableGridAnchor;
  grid: TableGrid;
  hasCellId: (id: string) => boolean;
  root?: string;
  selection: Range;
  table: TTableElement;
  tablePath: Path;
  version: number;
}>;

type ReadTableSelectionOptions = Readonly<{
  at?: Location;
  cellTypes: readonly string[];
  expansion?: TableSelectionExpansion;
  tableType: string;
}>;

export type TableSelectionViewMetrics = Readonly<{
  cacheHitCount: number;
  compileCount: number;
  projectionSlotCount: number;
}>;

type SelectionViewCacheEntry = Readonly<{
  key: string;
  view: TableSelectionView | null;
  version: number;
}>;

const selectionViewCache = new WeakMap<object, SelectionViewCacheEntry>();
let cacheHitCount = 0;
let compileCount = 0;
let projectionSlotCount = 0;

const isTransactionState = (state: object) =>
  'anchor' in state && 'changes' in state && 'refs' in state;

export const getTableSelectionBounds = (
  anchors: readonly TableGridAnchor[]
): TableSelectionBounds | null => {
  if (anchors.length === 0) return null;

  return anchors.reduce<TableSelectionBounds>(
    (bounds, anchor) => ({
      maxCol: Math.max(bounds.maxCol, anchor.col + anchor.colSpan - 1),
      maxRow: Math.max(bounds.maxRow, anchor.row + anchor.rowSpan - 1),
      minCol: Math.min(bounds.minCol, anchor.col),
      minRow: Math.min(bounds.minRow, anchor.row),
    }),
    {
      maxCol: Number.NEGATIVE_INFINITY,
      maxRow: Number.NEGATIVE_INFINITY,
      minCol: Number.POSITIVE_INFINITY,
      minRow: Number.POSITIVE_INFINITY,
    }
  );
};

const closeBoundsOverSpans = (
  context: TableContext,
  initialBounds: TableSelectionBounds
): TableSelectionBounds => {
  let bounds = initialBounds;
  const queue: { col: number; row: number }[] = [];
  const enqueueAddedSlots = (
    previous: TableSelectionBounds | null,
    next: TableSelectionBounds
  ) => {
    const enqueueRows = (minRow: number, maxRow: number) => {
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = next.minCol; col <= next.maxCol; col++) {
          queue.push({ col, row });
        }
      }
    };
    const enqueueColumns = (minCol: number, maxCol: number) => {
      const minRow = Math.max(next.minRow, previous?.minRow ?? next.minRow);
      const maxRow = Math.min(next.maxRow, previous?.maxRow ?? next.maxRow);

      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          queue.push({ col, row });
        }
      }
    };

    if (!previous) {
      enqueueRows(next.minRow, next.maxRow);
    } else {
      enqueueRows(next.minRow, previous.minRow - 1);
      enqueueRows(previous.maxRow + 1, next.maxRow);
      if (next.minCol < previous.minCol) {
        enqueueColumns(next.minCol, previous.minCol - 1);
      }
      if (next.maxCol > previous.maxCol) {
        enqueueColumns(previous.maxCol + 1, next.maxCol);
      }
    }
  };

  enqueueAddedSlots(null, bounds);

  for (const { col, row } of queue) {
    projectionSlotCount++;

    const cell = context.anchorAt(row, col);

    if (!cell) continue;

    const next = {
      maxCol: Math.max(bounds.maxCol, cell.col + cell.colSpan - 1),
      maxRow: Math.max(bounds.maxRow, cell.row + cell.rowSpan - 1),
      minCol: Math.min(bounds.minCol, cell.col),
      minRow: Math.min(bounds.minRow, cell.row),
    };

    if (
      next.minRow !== bounds.minRow ||
      next.maxRow !== bounds.maxRow ||
      next.minCol !== bounds.minCol ||
      next.maxCol !== bounds.maxCol
    ) {
      enqueueAddedSlots(bounds, next);
      bounds = next;
    }
  }

  return bounds;
};

const getAnchorsWithinBounds = (
  context: TableContext,
  bounds: TableSelectionBounds
) => {
  const anchors: TableGridAnchor[] = [];
  const seen = new Set<TableGridAnchor>();
  let complete = true;

  for (let row = bounds.minRow; row <= bounds.maxRow; row++) {
    for (let col = bounds.minCol; col <= bounds.maxCol; col++) {
      projectionSlotCount++;

      const anchor = context.anchorAt(row, col);

      if (!anchor) {
        complete = false;
      } else if (!seen.has(anchor)) {
        seen.add(anchor);
        anchors.push(anchor);
      }
    }
  }

  return { anchors, complete };
};

export const readTableSelection = <V extends Value>(
  state: Pick<EditorStateView<V>, 'nodes' | 'ranges' | 'runtime' | 'selection'>,
  {
    at,
    cellTypes,
    expansion = 'span-closure',
    tableType,
  }: ReadTableSelectionOptions
): TableSelectionView | null => {
  const snapshot = state.runtime.snapshot();
  const cacheable = !isTransactionState(state);
  const cacheKey =
    cacheable && at === undefined
      ? `${tableType}\u0000${expansion}\u0000${cellTypes.join('\u0000')}`
      : null;
  const cached = cacheKey ? selectionViewCache.get(state) : undefined;

  if (cached?.key === cacheKey && cached.version === snapshot.version) {
    cacheHitCount++;

    return cached.view;
  }

  compileCount++;

  const publish = (view: TableSelectionView | null) => {
    if (cacheKey) {
      selectionViewCache.set(
        state,
        Object.freeze({ key: cacheKey, version: snapshot.version, view })
      );
    }

    return view;
  };
  const location = at ?? state.selection();

  if (!location) return publish(null);

  const selection = RangeApi.isRange(location)
    ? location
    : PointApi.isPoint(location)
      ? Object.freeze({ anchor: location, focus: location })
      : state.ranges.get(location);

  if (!selection || selection.anchor.root !== selection.focus.root) {
    return publish(null);
  }

  const readCell = (point: Range['anchor']) =>
    state.nodes.above<TTableCellElement>({
      at: point,
      match: { type: cellTypes },
    });
  const anchorEntry = readCell(selection.anchor);
  const focusEntry = readCell(selection.focus);

  if (!anchorEntry || !focusEntry) return publish(null);

  const readTable = (point: Range['anchor']) =>
    state.nodes.above<TTableElement>({
      at: point,
      match: { type: tableType },
    });
  const anchorTableEntry = readTable(selection.anchor);
  const focusTableEntry = readTable(selection.focus);

  if (
    !anchorTableEntry ||
    !focusTableEntry ||
    !PathApi.equals(anchorTableEntry[1], focusTableEntry[1])
  ) {
    return publish(null);
  }

  const [table, tablePath] = anchorTableEntry;
  const context = createDetachedTableContext(table, tablePath);
  const anchor =
    context.anchorAtPath(anchorEntry[1]) ?? context.anchorOf(anchorEntry[0]);
  const focus =
    context.anchorAtPath(focusEntry[1]) ?? context.anchorOf(focusEntry[0]);

  if (!anchor || !focus) return publish(null);

  const endpointBounds = getTableSelectionBounds([anchor, focus])!;
  const bounds =
    expansion === 'span-closure'
      ? closeBoundsOverSpans(context, endpointBounds)
      : endpointBounds;
  const { anchors, complete } = getAnchorsWithinBounds(context, bounds);
  const cellEntries = anchors.map(
    (cell): ElementEntry<TTableCellElement> => [
      cell.cell,
      tablePath.concat(cell.path),
    ]
  );
  const cellIds = Object.freeze(
    anchors.flatMap(({ id }) => (typeof id === 'string' ? [id] : []))
  );
  const cellIdSet = new Set(cellIds);

  return publish(
    Object.freeze({
      anchor,
      anchors: Object.freeze(anchors),
      bounds: Object.freeze(bounds),
      cellIds,
      cellEntries: Object.freeze(cellEntries),
      complete,
      context,
      focus,
      grid: context.grid,
      hasCellId: (id: string) => cellIdSet.has(id),
      ...(selection.anchor.root === undefined
        ? {}
        : { root: selection.anchor.root }),
      selection,
      table,
      tablePath,
      version: snapshot.version,
    })
  );
};

export const readTableSelectionViewMetrics = (): TableSelectionViewMetrics => ({
  cacheHitCount,
  compileCount,
  projectionSlotCount,
});

export type TableSelectionNeighborDirection =
  | 'above'
  | 'below'
  | 'left'
  | 'next'
  | 'previous'
  | 'right';

export const getTableSelectionNeighbor = (
  context: TableContext,
  anchor: TableGridAnchor,
  direction: TableSelectionNeighborDirection
): TableGridAnchor | null => {
  if (direction === 'next' || direction === 'previous') {
    return (
      context.grid.anchors[anchor.order + (direction === 'next' ? 1 : -1)] ??
      null
    );
  }

  const target =
    direction === 'above'
      ? { col: anchor.col, row: anchor.row - 1 }
      : direction === 'below'
        ? { col: anchor.col, row: anchor.row + anchor.rowSpan }
        : direction === 'left'
          ? { col: anchor.col - 1, row: anchor.row }
          : { col: anchor.col + anchor.colSpan, row: anchor.row };

  return context.anchorAt(target.row, target.col);
};

export type TableSelectionEdge = 'bottom' | 'left' | 'right' | 'top';

export const getTableSelectionExpansion = (
  view: TableSelectionView,
  edge: TableSelectionEdge
): Readonly<{
  anchor: TableGridAnchor;
  focus: TableGridAnchor;
}> | null => {
  const target = getTableSelectionNeighbor(
    view.context,
    view.focus,
    edge === 'top' ? 'above' : edge === 'bottom' ? 'below' : edge
  );

  if (!target) return null;

  return Object.freeze({ anchor: view.anchor, focus: target });
};

export const projectTableSelection = (
  view: TableSelectionView
): TTableElement => {
  const rows = view.table.children
    .slice(view.bounds.minRow, view.bounds.maxRow + 1)
    .map(
      (row) =>
        ({
          ...row,
          children: [],
        }) as TTableRowElement & { children: TTableCellElement[] }
    );

  for (const anchor of view.anchors) {
    rows[anchor.row - view.bounds.minRow]?.children.push(anchor.cell);
  }

  return {
    children: rows,
    type: view.table.type,
  };
};
