import { PathApi, type Range, RangeApi, type RootKey } from '@platejs/slate';
import {
  cloneSlateViewBoundaryProjectedPoint,
  createSlateViewBoundaryGraph,
  getSlatePointRoot,
  getSlateViewBoundaryOwnerKey,
  getSlateViewBoundaryPointRoot,
  rootSlatePoint,
  SlateViewBoundaryGraph,
  type SlateViewBoundaryGraphModel,
  type SlateViewBoundaryPoint,
  type SlateViewBoundaryRangeSegments,
} from './view-boundary-graph';

export type SlateViewSelection = Readonly<{
  anchor: SlateViewBoundaryPoint;
  focus: SlateViewBoundaryPoint;
  segments: SlateViewBoundaryRangeSegments;
}>;

export type SlateViewSelectionCollapseEdge =
  | 'anchor'
  | 'end'
  | 'focus'
  | 'start';

const EDITOR_TO_VIEW_SELECTION = new WeakMap<object, SlateViewSelection>();
const EDITOR_TO_VIEW_SELECTION_STORE_KEY = new WeakMap<object, object>();
const VIEW_SELECTION_LISTENERS = new WeakMap<object, Set<() => void>>();
const HISTORY_BATCH_TO_VIEW_SELECTION = new WeakMap<
  object,
  Readonly<{
    redo: SlateViewSelection | null;
    undo: SlateViewSelection | null;
  }>
>();

const cloneProjectedPoint = cloneSlateViewBoundaryProjectedPoint;

export const setSlateViewSelectionStoreKey = (
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

const getProjectedPointOwnerKey = (projectedPoint: SlateViewBoundaryPoint) =>
  projectedPoint.owner
    ? getSlateViewBoundaryOwnerKey(projectedPoint.owner)
    : null;

const isProjectedPointEqual = (
  left: SlateViewBoundaryPoint,
  right: SlateViewBoundaryPoint
) =>
  getProjectedPointOwnerKey(left) === getProjectedPointOwnerKey(right) &&
  left.point.offset === right.point.offset &&
  getSlateViewBoundaryPointRoot(left) ===
    getSlateViewBoundaryPointRoot(right) &&
  PathApi.equals(left.point.path, right.point.path);

export const createSlateViewSelection = (
  graph: SlateViewBoundaryGraphModel,
  range: Readonly<{
    anchor: SlateViewBoundaryPoint;
    focus: SlateViewBoundaryPoint;
  }>
): SlateViewSelection => {
  const anchor = cloneProjectedPoint(range.anchor);
  const focus = cloneProjectedPoint(range.focus);

  return Object.freeze({
    anchor,
    focus,
    segments: SlateViewBoundaryGraph.segmentRange(graph, {
      anchor,
      focus,
    }),
  });
};

export const createMainRootSlateViewSelection = (
  selection: Range,
  fallbackRoot: RootKey = 'main'
): SlateViewSelection | null => {
  const [start, end] = RangeApi.edges(selection);
  const startIndex = start.path[0];
  const endIndex = end.path[0];
  const startRoot = getSlatePointRoot(start, fallbackRoot);
  const endRoot = getSlatePointRoot(end, fallbackRoot);

  if (typeof startIndex !== 'number' || typeof endIndex !== 'number') {
    return null;
  }

  const graph =
    startIndex === endIndex && startRoot === endRoot
      ? createSlateViewBoundaryGraph([{ path: [startIndex], root: startRoot }])
      : createSlateViewBoundaryGraph([
          { path: [startIndex], root: startRoot },
          { path: [endIndex], root: endRoot },
        ]);

  return createSlateViewSelection(graph, {
    anchor: {
      point: rootSlatePoint(
        selection.anchor,
        getSlatePointRoot(selection.anchor, fallbackRoot)
      ),
    },
    focus: {
      point: rootSlatePoint(
        selection.focus,
        getSlatePointRoot(selection.focus, fallbackRoot)
      ),
    },
  });
};

export const extendSlateViewSelection = (
  graph: SlateViewBoundaryGraphModel,
  selection: SlateViewSelection,
  focus: SlateViewBoundaryPoint
): SlateViewSelection =>
  createSlateViewSelection(graph, {
    anchor: selection.anchor,
    focus,
  });

export const isSlateViewSelectionCollapsed = (selection: SlateViewSelection) =>
  isProjectedPointEqual(selection.anchor, selection.focus);

export const collapseSlateViewSelection = (
  selection: SlateViewSelection,
  edge: SlateViewSelectionCollapseEdge
): SlateViewBoundaryPoint => {
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

export const readSlateViewSelection = (
  editor: object
): SlateViewSelection | null =>
  EDITOR_TO_VIEW_SELECTION.get(getViewSelectionStoreKey(editor)) ?? null;

export const writeSlateViewSelection = (
  editor: object,
  selection: SlateViewSelection | null,
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

export const subscribeSlateViewSelection = (
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

export const saveSlateViewSelectionHistoryEntry = (
  editor: EditorWithHistory,
  entry: Readonly<{
    redo: SlateViewSelection | null;
    undo: SlateViewSelection | null;
  }>
) => {
  const batch = getHistoryBatch(editor, 'undos');

  if (batch) {
    HISTORY_BATCH_TO_VIEW_SELECTION.set(batch, entry);
  }
};

export const readSlateViewSelectionHistoryEntry = (
  editor: EditorWithHistory,
  direction: HistoryDirection
): SlateViewSelection | null | undefined => {
  const batch = getHistoryBatch(
    editor,
    direction === 'undo' ? 'undos' : 'redos'
  );
  const entry = batch ? HISTORY_BATCH_TO_VIEW_SELECTION.get(batch) : undefined;

  return entry?.[direction];
};
