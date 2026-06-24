import { PathApi, type Range, RangeApi, type RootKey } from '@platejs/plite';
import {
  clonePliteViewBoundaryProjectedPoint,
  createPliteViewBoundaryGraph,
  getPlitePointRoot,
  getPliteViewBoundaryOwnerKey,
  getPliteViewBoundaryPointRoot,
  rootPlitePoint,
  PliteViewBoundaryGraph,
  type PliteViewBoundaryGraphModel,
  type PliteViewBoundaryPoint,
  type PliteViewBoundaryRangeSegments,
} from './view-boundary-graph';

export type PliteViewSelection = Readonly<{
  anchor: PliteViewBoundaryPoint;
  focus: PliteViewBoundaryPoint;
  segments: PliteViewBoundaryRangeSegments;
}>;

export type PliteViewSelectionCollapseEdge =
  | 'anchor'
  | 'end'
  | 'focus'
  | 'start';

const EDITOR_TO_VIEW_SELECTION = new WeakMap<object, PliteViewSelection>();
const EDITOR_TO_VIEW_SELECTION_STORE_KEY = new WeakMap<object, object>();
const VIEW_SELECTION_LISTENERS = new WeakMap<object, Set<() => void>>();
const HISTORY_BATCH_TO_VIEW_SELECTION = new WeakMap<
  object,
  Readonly<{
    redo: PliteViewSelection | null;
    undo: PliteViewSelection | null;
  }>
>();

const cloneProjectedPoint = clonePliteViewBoundaryProjectedPoint;

export const setPliteViewSelectionStoreKey = (
  editor: object,
  storeKey: object
) => {
  EDITOR_TO_VIEW_SELECTION_STORE_KEY.set(editor, storeKey);
};

const getViewSelectionStoreKey = (editor: object): object =>
  EDITOR_TO_VIEW_SELECTION_STORE_KEY.get(editor) ?? editor;

const notifyViewSelectionListeners = (storeKey: object) => {
  VIEW_SELECTION_LISTENERS.get(storeKey)?.forEach((listener) => {
    listener();
  });
};

const getProjectedPointOwnerKey = (projectedPoint: PliteViewBoundaryPoint) =>
  projectedPoint.owner
    ? getPliteViewBoundaryOwnerKey(projectedPoint.owner)
    : null;

const isProjectedPointEqual = (
  left: PliteViewBoundaryPoint,
  right: PliteViewBoundaryPoint
) =>
  getProjectedPointOwnerKey(left) === getProjectedPointOwnerKey(right) &&
  left.point.offset === right.point.offset &&
  getPliteViewBoundaryPointRoot(left) ===
    getPliteViewBoundaryPointRoot(right) &&
  PathApi.equals(left.point.path, right.point.path);

export const createPliteViewSelection = (
  graph: PliteViewBoundaryGraphModel,
  range: Readonly<{
    anchor: PliteViewBoundaryPoint;
    focus: PliteViewBoundaryPoint;
  }>
): PliteViewSelection => {
  const anchor = cloneProjectedPoint(range.anchor);
  const focus = cloneProjectedPoint(range.focus);

  return Object.freeze({
    anchor,
    focus,
    segments: PliteViewBoundaryGraph.segmentRange(graph, {
      anchor,
      focus,
    }),
  });
};

export const createMainRootPliteViewSelection = (
  selection: Range,
  fallbackRoot: RootKey = 'main'
): PliteViewSelection | null => {
  const [start, end] = RangeApi.edges(selection);
  const startIndex = start.path[0];
  const endIndex = end.path[0];
  const startRoot = getPlitePointRoot(start, fallbackRoot);
  const endRoot = getPlitePointRoot(end, fallbackRoot);

  if (typeof startIndex !== 'number' || typeof endIndex !== 'number') {
    return null;
  }

  const graph =
    startIndex === endIndex && startRoot === endRoot
      ? createPliteViewBoundaryGraph([{ path: [startIndex], root: startRoot }])
      : createPliteViewBoundaryGraph([
          { path: [startIndex], root: startRoot },
          { path: [endIndex], root: endRoot },
        ]);

  return createPliteViewSelection(graph, {
    anchor: {
      point: rootPlitePoint(
        selection.anchor,
        getPlitePointRoot(selection.anchor, fallbackRoot)
      ),
    },
    focus: {
      point: rootPlitePoint(
        selection.focus,
        getPlitePointRoot(selection.focus, fallbackRoot)
      ),
    },
  });
};

export const extendPliteViewSelection = (
  graph: PliteViewBoundaryGraphModel,
  selection: PliteViewSelection,
  focus: PliteViewBoundaryPoint
): PliteViewSelection =>
  createPliteViewSelection(graph, {
    anchor: selection.anchor,
    focus,
  });

export const isPliteViewSelectionCollapsed = (selection: PliteViewSelection) =>
  isProjectedPointEqual(selection.anchor, selection.focus);

export const collapsePliteViewSelection = (
  selection: PliteViewSelection,
  edge: PliteViewSelectionCollapseEdge
): PliteViewBoundaryPoint => {
  switch (edge) {
    case 'anchor':
      return cloneProjectedPoint(selection.anchor);
    case 'focus':
      return cloneProjectedPoint(selection.focus);
    case 'start':
      return cloneProjectedPoint(
        selection.segments.backward ? selection.focus : selection.anchor
      );
    case 'end':
      return cloneProjectedPoint(
        selection.segments.backward ? selection.anchor : selection.focus
      );
  }
};

export const readPliteViewSelection = (
  editor: object
): PliteViewSelection | null =>
  EDITOR_TO_VIEW_SELECTION.get(getViewSelectionStoreKey(editor)) ?? null;

export const writePliteViewSelection = (
  editor: object,
  selection: PliteViewSelection | null,
  options: { notify?: boolean } = {}
) => {
  const key = getViewSelectionStoreKey(editor);
  const previous = EDITOR_TO_VIEW_SELECTION.get(key) ?? null;
  const shouldNotify = options.notify !== false;

  if (!selection) {
    EDITOR_TO_VIEW_SELECTION.delete(key);
    if (previous && shouldNotify) {
      notifyViewSelectionListeners(key);
    }
    return;
  }

  EDITOR_TO_VIEW_SELECTION.set(key, selection);
  if (previous !== selection && shouldNotify) {
    notifyViewSelectionListeners(key);
  }
};

export const subscribePliteViewSelection = (
  editor: object,
  listener: () => void
) => {
  const key = getViewSelectionStoreKey(editor);
  const listeners = VIEW_SELECTION_LISTENERS.get(key) ?? new Set<() => void>();

  listeners.add(listener);
  VIEW_SELECTION_LISTENERS.set(key, listeners);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      VIEW_SELECTION_LISTENERS.delete(key);
    }
  };
};

type HistoryStackName = 'redos' | 'undos';

type HistoryDirection = 'redo' | 'undo';

type EditorWithHistory = {
  read: <T>(fn: (state: unknown) => T) => T;
};

const getHistoryBatch = (
  editor: EditorWithHistory,
  stackName: HistoryStackName
): object | null =>
  editor.read((state) => {
    const stack = (
      state as {
        history?: {
          redos?: () => readonly object[];
          undos?: () => readonly object[];
        };
      }
    ).history?.[stackName]?.();

    return stack?.at(-1) ?? null;
  });

export const savePliteViewSelectionHistoryEntry = (
  editor: EditorWithHistory,
  entry: Readonly<{
    redo: PliteViewSelection | null;
    undo: PliteViewSelection | null;
  }>
) => {
  const batch = getHistoryBatch(editor, 'undos');

  if (batch) {
    HISTORY_BATCH_TO_VIEW_SELECTION.set(batch, entry);
  }
};

export const readPliteViewSelectionHistoryEntry = (
  editor: EditorWithHistory,
  direction: HistoryDirection
): PliteViewSelection | null | undefined => {
  const batch = getHistoryBatch(
    editor,
    direction === 'undo' ? 'undos' : 'redos'
  );
  const entry = batch ? HISTORY_BATCH_TO_VIEW_SELECTION.get(batch) : undefined;

  return entry?.[direction];
};
