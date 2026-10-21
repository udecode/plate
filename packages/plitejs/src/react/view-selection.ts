import { PathApi, type Range, RangeApi, type RootKey } from '..';
import { hasEditorRuntime } from '../core/editor-runtime';
import { readEditorHistoryHeadIdentity } from '../core/public-state';
import { getViewPresentation } from '../editor-runtime-view';
import type { AnyEditor } from '../interfaces/editor';
import { failInvariant } from './editable/runtime-editor-api';
import {
  clonePliteViewBoundaryPointWithOwner,
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
const VIEW_SELECTION_MOUNTS = new WeakMap<object, number>();
type PliteViewSelectionNotification = Readonly<{
  forceInvalidate?: boolean;
}>;
const VIEW_SELECTION_LISTENERS = new WeakMap<
  object,
  Set<(notification?: PliteViewSelectionNotification) => void>
>();
const HISTORY_GROUP_TO_VIEW_SELECTION = new WeakMap<
  object,
  Readonly<{
    redo: PliteViewSelection | null;
    undo: PliteViewSelection | null;
  }>
>();

const cloneBoundaryPoint = clonePliteViewBoundaryPointWithOwner;

const getViewSelectionStoreKey = (editor: object): object =>
  hasEditorRuntime(editor) ? getViewPresentation(editor) : editor;

const notifyViewSelectionListeners = (
  storeKey: object,
  notification?: PliteViewSelectionNotification
) => {
  Array.from(VIEW_SELECTION_LISTENERS.get(storeKey) ?? []).forEach(
    (listener) => {
      listener(notification);
    }
  );
};

const getViewBoundaryPointOwnerKey = (boundaryPoint: PliteViewBoundaryPoint) =>
  boundaryPoint.owner
    ? getPliteViewBoundaryOwnerKey(boundaryPoint.owner)
    : null;

const isBoundaryPointEqual = (
  left: PliteViewBoundaryPoint,
  right: PliteViewBoundaryPoint
) =>
  getViewBoundaryPointOwnerKey(left) === getViewBoundaryPointOwnerKey(right) &&
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
  const anchor = cloneBoundaryPoint(range.anchor);
  const focus = cloneBoundaryPoint(range.focus);

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
  selection.segments.parts.length === 1 &&
  (selection.segments.parts[0].nodes[0]?.text ||
    (selection.anchor.affinity ?? 'backward') ===
      (selection.focus.affinity ?? 'backward')) &&
  isBoundaryPointEqual(selection.anchor, selection.focus);

export const collapsePliteViewSelection = (
  selection: PliteViewSelection,
  edge: PliteViewSelectionCollapseEdge
): PliteViewBoundaryPoint => {
  switch (edge) {
    case 'anchor': {
      return cloneBoundaryPoint(selection.anchor);
    }
    case 'focus': {
      return cloneBoundaryPoint(selection.focus);
    }
    case 'start': {
      return cloneBoundaryPoint(
        selection.segments.backward ? selection.focus : selection.anchor
      );
    }
    case 'end': {
      return cloneBoundaryPoint(
        selection.segments.backward ? selection.anchor : selection.focus
      );
    }
  }

  return failInvariant('Unexpected view selection collapse edge');
};

export const readPliteViewSelection = (
  editor: object
): PliteViewSelection | null =>
  EDITOR_TO_VIEW_SELECTION.get(getViewSelectionStoreKey(editor)) ?? null;

export const mountPliteViewSelection = (editor: object) => {
  const key = getViewSelectionStoreKey(editor);
  VIEW_SELECTION_MOUNTS.set(key, (VIEW_SELECTION_MOUNTS.get(key) ?? 0) + 1);
  return () => {
    const remaining = (VIEW_SELECTION_MOUNTS.get(key) ?? 1) - 1;
    if (remaining) VIEW_SELECTION_MOUNTS.set(key, remaining);
    else {
      VIEW_SELECTION_MOUNTS.delete(key);
      writePliteViewSelection(editor, null);
    }
  };
};

export const refreshPliteViewSelection = (editor: object) => {
  notifyViewSelectionListeners(getViewSelectionStoreKey(editor), {
    forceInvalidate: true,
  });
};

export const writePliteViewSelection = (
  editor: object,
  selection: PliteViewSelection | null,
  options: { notify?: boolean } = {}
) => {
  const key = getViewSelectionStoreKey(editor);
  const previous = EDITOR_TO_VIEW_SELECTION.get(key) ?? null;
  const shouldNotify = options.notify !== false;
  if (previous === selection) return;

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
  listener: (notification?: PliteViewSelectionNotification) => void
) => {
  const key = getViewSelectionStoreKey(editor);
  const listeners =
    VIEW_SELECTION_LISTENERS.get(key) ??
    new Set<(notification?: PliteViewSelectionNotification) => void>();

  listeners.add(listener);
  VIEW_SELECTION_LISTENERS.set(key, listeners);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      VIEW_SELECTION_LISTENERS.delete(key);
    }
  };
};

type HistoryDirection = 'redo' | 'undo';

type EditorWithHistory = {
  read: <T>(fn: (state: unknown) => T) => T;
};

const getHistoryGroup = (
  editor: EditorWithHistory,
  direction: HistoryDirection
): object | null =>
  readEditorHistoryHeadIdentity(editor as AnyEditor, direction);

export const savePliteViewSelectionHistoryEntry = (
  editor: EditorWithHistory,
  entry: Readonly<{
    redo: PliteViewSelection | null;
    undo: PliteViewSelection | null;
  }>
) => {
  const group = getHistoryGroup(editor, 'undo');

  if (group) {
    HISTORY_GROUP_TO_VIEW_SELECTION.set(group, entry);
  }
};

export const readPliteViewSelectionHistoryGroup = (
  group: object,
  direction: HistoryDirection
) => HISTORY_GROUP_TO_VIEW_SELECTION.get(group)?.[direction];

export const readPliteViewSelectionHistoryEntry = (
  editor: EditorWithHistory,
  direction: HistoryDirection
): PliteViewSelection | null | undefined => {
  const group = getHistoryGroup(editor, direction);

  return group
    ? readPliteViewSelectionHistoryGroup(group, direction)
    : undefined;
};
