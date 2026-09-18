import type {
  EditorStateView,
  Element,
  ElementEntry,
  Location,
  Node,
  NodeKey,
  NodeSelection,
  NodeTarget,
  Path,
  Range,
} from '../../../../core';
import {
  ElementApi,
  PathApi,
  PointApi,
  RangeApi,
  SelectionApi,
} from '../../../../core';
import { failInvariant } from '../../internal/failInvariant';
import type { TableCellElement } from '../BaseTablePlugin';
import { createTableContext, type TableContext } from './context';
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
  cellKeys: readonly NodeKey[];
  cellEntries: ReadonlyArray<ElementEntry<TableCellElement>>;
  complete: boolean;
  context: TableContext;
  focus: TableGridAnchor;
  grid: TableGrid;
  hasCellKey: (key: NodeKey) => boolean;
  root?: string;
  selection: NodeSelection | Range;
  table: Element;
  tableKey: NodeKey;
  tablePath: Path;
  version: number;
}>;

type ReadTableSelectionOptions = Readonly<{
  at?: NodeSelection | NodeTarget;
  cellTypes: readonly string[];
  expansion?: TableSelectionExpansion;
  selection?: NodeSelection | Range | null;
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
  const queue: Array<{ col: number; row: number }> = [];
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
    projectionSlotCount += 1;

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
      projectionSlotCount += 1;

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

export const readTableSelection = (
  state: Pick<
    EditorStateView<any, any>,
    'key' | 'nodes' | 'ranges' | 'runtime' | 'selection' | 'view'
  >,
  {
    at,
    cellTypes,
    expansion = 'span-closure',
    selection: currentSelection = state.selection(),
    tableType,
  }: ReadTableSelectionOptions
): TableSelectionView | null => {
  const snapshot = state.runtime.snapshot();
  const cacheable = !isTransactionState(state);
  const cacheKey =
    cacheable && at === undefined
      ? `${tableType}\u0000${expansion}\u0000${cellTypes.join('\u0000')}\u0000${JSON.stringify(currentSelection)}\u0000${state.view.root() ?? ''}`
      : null;
  const cached = cacheKey ? selectionViewCache.get(state) : undefined;

  if (cached?.key === cacheKey && cached.version === snapshot.version) {
    cacheHitCount += 1;

    return cached.view;
  }

  compileCount += 1;

  const isCell = (node: Node): node is TableCellElement =>
    ElementApi.isElement(node) &&
    cellTypes.some((cellType) => cellType === node.type);

  const publish = (view: TableSelectionView | null) => {
    if (cacheKey) {
      selectionViewCache.set(
        state,
        Object.freeze({ key: cacheKey, version: snapshot.version, view })
      );
    }

    return view;
  };
  const requested = at ?? currentSelection;
  const location =
    requested === undefined ||
    requested === null ||
    SelectionApi.isNode(requested) ||
    RangeApi.isRange(requested) ||
    PointApi.isPoint(requested) ||
    PathApi.isPath(requested)
      ? requested
      : state.nodes.path(requested);

  if (!location) return publish(null);

  if (SelectionApi.isNode(location)) {
    const { root } = location;
    const targetAt = (path: Path): Location =>
      root === undefined ? path : { offset: 0, path, root };
    const tableEntries = location.paths.map((path) => {
      const exact = state.nodes.get(targetAt(path), {
        match: ElementApi.isElement,
      });

      if (exact?.[0].type === tableType) return exact;

      return state.nodes.above({ at: targetAt(path), type: tableType });
    });
    const firstTable = tableEntries[0];

    if (
      !firstTable ||
      tableEntries.some(
        (entry) => !entry || !PathApi.equals(entry[1], firstTable[1])
      )
    ) {
      return publish(null);
    }
    const [table, tablePath] = firstTable;
    const context =
      createTableContext(state, tablePath, root) ??
      failInvariant('Expected value to be defined');
    const anchorsForPath = (path: Path): readonly TableGridAnchor[] => {
      if (PathApi.equals(path, tablePath)) return context.grid.anchors;
      const relative = path.slice(tablePath.length);

      if (relative.length === 1) {
        return context.grid.anchorsByRow[relative[0]] ?? [];
      }
      if (relative.length === 2) {
        const anchor = context.anchorAtPath(path);

        return anchor ? [anchor] : [];
      }

      return [];
    };
    const selected = new Set<TableGridAnchor>();

    for (const path of location.paths) {
      const anchors = anchorsForPath(path);

      if (anchors.length === 0) return publish(null);
      anchors.forEach((anchor) => selected.add(anchor));
    }
    const anchors = context.grid.anchors.filter((anchor) =>
      selected.has(anchor)
    );
    const anchorCandidates = anchorsForPath(location.anchorPath);
    const focusCandidates = anchorsForPath(location.focusPath);
    const anchor = anchorCandidates[0];
    const focus = focusCandidates.at(-1);

    if (!anchor || !focus || anchors.length === 0) return publish(null);
    const bounds =
      getTableSelectionBounds(anchors) ??
      failInvariant('Expected value to be defined');
    const covered = getAnchorsWithinBounds(context, bounds);
    const complete =
      covered.complete &&
      covered.anchors.length === anchors.length &&
      covered.anchors.every((candidate) => selected.has(candidate));
    const cellEntries = anchors.map((cell): ElementEntry<TableCellElement> => [
      cell.cell,
      tablePath.concat(cell.path),
    ]);
    const keyAt = (path: Path) =>
      state.key(root === undefined ? path : { offset: 0, path, root }) ??
      failInvariant('Expected node key to be defined');
    const cellKeys = Object.freeze(cellEntries.map(([, path]) => keyAt(path)));
    const cellKeySet = new Set(cellKeys);

    return publish(
      Object.freeze({
        anchor,
        anchors: Object.freeze(anchors),
        bounds: Object.freeze(bounds),
        cellKeys,
        cellEntries: Object.freeze(cellEntries),
        complete,
        context,
        focus,
        grid: context.grid,
        hasCellKey: (key: NodeKey) => cellKeySet.has(key),
        ...(root === undefined ? {} : { root }),
        selection: location,
        table,
        tableKey: keyAt(tablePath),
        tablePath,
        version: snapshot.version,
      })
    );
  }

  const selection = RangeApi.isRange(location)
    ? location
    : PointApi.isPoint(location)
      ? Object.freeze({ anchor: location, focus: location })
      : state.ranges.get(location);

  if (!selection || selection.anchor.root !== selection.focus.root) {
    return publish(null);
  }

  const root =
    selection.anchor.root ??
    (at === undefined
      ? SelectionApi.root(state.selection())
      : state.view.root());
  const inRoot = (point: Range['anchor']) =>
    root === undefined ? point : { ...point, root };

  const readCell = (point: Range['anchor']) =>
    state.nodes.above({
      at: inRoot(point),
      match: isCell,
    });
  const anchorEntry = readCell(selection.anchor);
  const focusEntry = readCell(selection.focus);

  if (!anchorEntry || !focusEntry) return publish(null);

  const readTable = (point: Range['anchor']) =>
    state.nodes.above({
      at: inRoot(point),
      type: tableType,
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
  const context =
    createTableContext(state, tablePath, root) ??
    failInvariant('Expected value to be defined');
  const anchor =
    context.anchorAtPath(anchorEntry[1]) ?? context.anchorOf(anchorEntry[0]);
  const focus =
    context.anchorAtPath(focusEntry[1]) ?? context.anchorOf(focusEntry[0]);

  if (!anchor || !focus) return publish(null);

  const endpointBounds =
    getTableSelectionBounds([anchor, focus]) ??
    failInvariant('Expected value to be defined');
  const bounds =
    expansion === 'span-closure'
      ? closeBoundsOverSpans(context, endpointBounds)
      : endpointBounds;
  const { anchors, complete } = getAnchorsWithinBounds(context, bounds);
  const cellEntries = anchors.map((cell): ElementEntry<TableCellElement> => [
    cell.cell,
    tablePath.concat(cell.path),
  ]);
  const keyAt = (path: Path) =>
    state.key(root === undefined ? path : { offset: 0, path, root }) ??
    failInvariant('Expected node key to be defined');
  const cellKeys = Object.freeze(cellEntries.map(([, path]) => keyAt(path)));
  const cellKeySet = new Set(cellKeys);

  return publish(
    Object.freeze({
      anchor,
      anchors: Object.freeze(anchors),
      bounds: Object.freeze(bounds),
      cellKeys,
      cellEntries: Object.freeze(cellEntries),
      complete,
      context,
      focus,
      grid: context.grid,
      hasCellKey: (key: NodeKey) => cellKeySet.has(key),
      ...(root === undefined ? {} : { root }),
      selection,
      table,
      tableKey: keyAt(tablePath),
      tablePath,
      version: snapshot.version,
    })
  );
};

export const createTableNodeSelection = (
  view: TableSelectionView
): NodeSelection | null => {
  if (view.cellEntries.length <= 1) return null;

  const paths = view.cellEntries.map(([, path]) => path);
  const first = paths[0];
  const anchorPath = view.tablePath.concat(view.anchor.path);
  const focusPath = view.tablePath.concat(view.focus.path);

  if (!first) return null;

  return SelectionApi.nodes([first, ...paths.slice(1)], {
    anchorPath,
    focusPath,
    ...(view.root === undefined ? {} : { root: view.root }),
  });
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

export const projectTableSelection = (view: TableSelectionView): Element => {
  const rows = view.table.children
    .slice(view.bounds.minRow, view.bounds.maxRow + 1)
    .map((row) => ({ children: [] as TableCellElement[], row }));

  for (const anchor of view.anchors) {
    rows[anchor.row - view.bounds.minRow]?.children.push(anchor.cell);
  }

  return {
    ...view.table,
    children: rows.map(({ children, row }) => ({ ...row, children })),
  };
};
