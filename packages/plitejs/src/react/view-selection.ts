import { PathApi, type Range, RangeApi, type RootKey } from '..';
import {
  type EditorRuntimeCarrier,
  hasEditorRuntime,
} from '../core/editor-runtime';
import { readEditorHistoryHeadIdentity } from '../core/public-state';
import {
  getPlacementGeneration,
  subscribeCommittedPlacement,
} from '../core/view-carets';
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

type ViewSelectionEntry = {
  readonly selection: PliteViewSelection;
  /**
   * The placement generation the selection shows at: the first placement its
   * writer's `place` committed, or the current one. `null` while `place` runs.
   */
  shownAt: number | null;
};

const EDITOR_TO_VIEW_SELECTION = new WeakMap<object, ViewSelectionEntry>();
const VIEW_SELECTION_PLACEMENTS = new WeakMap<object, () => void>();
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

const isCurrent = (editor: object, entry: ViewSelectionEntry) =>
  entry.shownAt === null ||
  !hasEditorRuntime(editor) ||
  getPlacementGeneration(editor) === entry.shownAt;

const forget = (key: object) => {
  EDITOR_TO_VIEW_SELECTION.delete(key);
  VIEW_SELECTION_PLACEMENTS.get(key)?.();
  VIEW_SELECTION_PLACEMENTS.delete(key);
};

const PENDING_NOTIFICATIONS = new WeakSet<object>();

/** A listener that edits must see the placement's publish finished. */
const notifyAfterPublish = (key: object) => {
  if (PENDING_NOTIFICATIONS.has(key)) return;

  PENDING_NOTIFICATIONS.add(key);
  queueMicrotask(() => {
    PENDING_NOTIFICATIONS.delete(key);
    notifyViewSelectionListeners(key);
  });
};

/** A newer placement anywhere ends the selection, so paint follows the reader. */
const watchPlacements = (key: object, editor: EditorRuntimeCarrier) => {
  if (VIEW_SELECTION_PLACEMENTS.has(key)) return;

  VIEW_SELECTION_PLACEMENTS.set(
    key,
    subscribeCommittedPlacement(editor, (generation) => {
      const entry = EDITOR_TO_VIEW_SELECTION.get(key);

      if (!entry) {
        forget(key);
        return;
      }
      if (entry.shownAt === null) entry.shownAt = generation;
      else if (entry.shownAt !== generation) {
        forget(key);
        notifyAfterPublish(key);
      }
    })
  );
};

/** Pure, so render-time snapshots may call it. */
export const readPliteViewSelection = (
  editor: object
): PliteViewSelection | null => {
  const entry = EDITOR_TO_VIEW_SELECTION.get(getViewSelectionStoreKey(editor));

  return entry && isCurrent(editor, entry) ? entry.selection : null;
};

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

export type PliteViewSelectionWrite = Readonly<{
  notify?: boolean;
}>;

export type PliteViewSelectionShow = PliteViewSelectionWrite &
  (
    | Readonly<{
        /** Places the anchor caret, or the range when it stays in one root. */
        place: () => void;
        placedAt?: never;
      }>
    | Readonly<{
        place?: never;
        placedAt: number;
      }>
  );

type WritePliteViewSelection = {
  (editor: object, selection: null, options?: PliteViewSelectionWrite): boolean;
  (
    editor: object,
    selection: PliteViewSelection | null,
    options: PliteViewSelectionShow
  ): boolean;
};

export const writePliteViewSelection: WritePliteViewSelection = (
  editor: object,
  selection: PliteViewSelection | null,
  options: Readonly<{
    notify?: boolean;
    place?: () => void;
    placedAt?: number;
  }> = {}
) => {
  const key = getViewSelectionStoreKey(editor);
  const previous = EDITOR_TO_VIEW_SELECTION.get(key);
  const wasShown = !!previous && isCurrent(editor, previous);
  const shouldNotify = options.notify !== false;
  const end = () => {
    forget(key);
    if (wasShown && shouldNotify) notifyViewSelectionListeners(key);
  };

  if (
    options.placedAt !== undefined &&
    hasEditorRuntime(editor) &&
    options.placedAt !== getPlacementGeneration(editor)
  ) {
    return false;
  }
  if (!selection) {
    end();
    options.place?.();
    return false;
  }
  if (
    wasShown &&
    previous.selection === selection &&
    options.placedAt === previous.shownAt
  ) {
    return true;
  }

  const entry: ViewSelectionEntry = {
    selection,
    shownAt: options.placedAt ?? null,
  };

  EDITOR_TO_VIEW_SELECTION.set(key, entry);
  if (!hasEditorRuntime(editor)) {
    options.place?.();
    if (shouldNotify) notifyViewSelectionListeners(key);
    return EDITOR_TO_VIEW_SELECTION.get(key) === entry;
  }
  watchPlacements(key, editor);
  try {
    options.place?.();
  } catch (error) {
    if (EDITOR_TO_VIEW_SELECTION.get(key) === entry) end();
    throw error;
  }
  if (EDITOR_TO_VIEW_SELECTION.get(key) !== entry) return false;

  entry.shownAt ??= getPlacementGeneration(editor);
  if (getPlacementGeneration(editor) !== entry.shownAt) {
    end();
    return false;
  }
  if (shouldNotify) notifyViewSelectionListeners(key);
  return EDITOR_TO_VIEW_SELECTION.get(key) === entry;
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
