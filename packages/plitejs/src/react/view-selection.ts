import { PathApi, type Range, RangeApi, type RootKey } from '..';
import { createAuthoredFragmentView } from '../core/authored-fragment-view';
import {
  readAuthoredViewFragmentVersion,
  readAuthoredViewFragments,
} from '../core/authored-runtime';
import { hasEditorRuntime } from '../core/editor-runtime';
import type { AnyEditor } from '../interfaces/editor';
import {
  createContentRootViewBoundaryGraph,
  findContentRootOwners,
} from './editable/content-root-owners';
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
const EDITOR_TO_VIEW_SELECTION_STORE_KEY = new WeakMap<object, object>();
const VIEW_SELECTION_BINDINGS = new WeakMap<
  object,
  {
    editor: AnyEditor;
    release: () => void;
    resolve: () => PliteViewSelection | null;
    version: object | null;
  }
>();
const VIEW_SELECTION_MOUNTS = new WeakMap<object, number>();
const PENDING_VIEW_SELECTION_NOTIFICATIONS = new WeakSet<object>();
type PliteViewSelectionNotification = Readonly<{
  forceInvalidate?: boolean;
}>;
const VIEW_SELECTION_LISTENERS = new WeakMap<
  object,
  Set<(notification?: PliteViewSelectionNotification) => void>
>();
const HISTORY_BATCH_TO_VIEW_SELECTION = new WeakMap<
  object,
  Readonly<{
    redo: PliteViewSelection | null;
    undo: PliteViewSelection | null;
  }>
>();

const cloneBoundaryPoint = clonePliteViewBoundaryPointWithOwner;

export const setPliteViewSelectionStoreKey = (
  editor: object,
  storeKey: object
) => {
  EDITOR_TO_VIEW_SELECTION_STORE_KEY.set(
    editor,
    getViewSelectionStoreKey(storeKey)
  );
};

const getViewSelectionStoreKey = (editor: object): object =>
  EDITOR_TO_VIEW_SELECTION_STORE_KEY.get(editor) ?? editor;

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
  (left.fragmentId ?? null) === (right.fragmentId ?? null) &&
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
): PliteViewSelection | null => {
  const key = getViewSelectionStoreKey(editor);
  const binding = VIEW_SELECTION_BINDINGS.get(key);
  if (binding && hasEditorRuntime(binding.editor)) {
    const version = readAuthoredViewFragmentVersion(binding.editor);
    if (version !== binding.version) {
      binding.version = version;
      PENDING_VIEW_SELECTION_NOTIFICATIONS.add(key);
      const selection = version ? binding.resolve() : null;
      if (selection) EDITOR_TO_VIEW_SELECTION.set(key, selection);
      else {
        binding.release();
        VIEW_SELECTION_BINDINGS.delete(key);
        EDITOR_TO_VIEW_SELECTION.delete(key);
      }
    }
  }
  return EDITOR_TO_VIEW_SELECTION.get(key) ?? null;
};

export const reconcilePliteViewSelection = (editor: object) => {
  const key = getViewSelectionStoreKey(editor);
  readPliteViewSelection(editor);
  if (PENDING_VIEW_SELECTION_NOTIFICATIONS.delete(key)) {
    notifyViewSelectionListeners(key);
  }
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

const bindViewSelection = (
  editor: AnyEditor,
  selection: PliteViewSelection
) => {
  const version = readAuthoredViewFragmentVersion(editor);
  if (!version) return null;
  const releases: Array<() => void> = [];
  const release = () => releases.forEach((dispose) => dispose());
  const bind = (
    boundary: PliteViewBoundaryPoint,
    association: 'backward' | 'forward'
  ) => {
    const descriptor = boundary.fragmentId
      ? selection.segments.parts.find(
          (part) => part.fragment?.id === boundary.fragmentId
        )?.fragment
      : null;
    const fragment = descriptor
      ? readAuthoredViewFragments(editor, descriptor.changeId).find(
          (entry) => entry.id === descriptor.id
        )
      : null;
    if (boundary.fragmentId && !fragment) return null;
    const view = fragment
      ? createAuthoredFragmentView(editor, fragment)
      : editor;
    const anchor = view.anchor(boundary.point, {
      association,
      deletion: 'nearest',
    });
    releases.push(() => anchor.release());
    const { owner } = boundary;
    const ownerAnchor = owner
      ? editor.anchor(owner.ownerPath, {
          ...(owner.ownerRoot === 'main' ? {} : { root: owner.ownerRoot }),
          deletion: 'drop',
        })
      : null;
    if (ownerAnchor) releases.push(() => ownerAnchor.release());
    return () => {
      const point = anchor.resolve();
      const ownerPath = ownerAnchor?.resolve();
      if (!point || (owner && !ownerPath)) return null;
      return {
        ...boundary,
        point,
        ...(owner && ownerPath ? { owner: { ...owner, ownerPath } } : {}),
      };
    };
  };
  try {
    const collapsed = isPliteViewSelectionCollapsed(selection);
    const anchor = bind(
      selection.anchor,
      collapsed || !selection.segments.backward ? 'forward' : 'backward'
    );
    const focus = bind(
      selection.focus,
      collapsed || selection.segments.backward ? 'forward' : 'backward'
    );
    if (!anchor || !focus) {
      release();
      return null;
    }
    return {
      editor,
      version,
      release,
      resolve: () => {
        const start = anchor();
        const end = focus();
        if (!start || !end) return null;
        const graph = createContentRootViewBoundaryGraph(
          editor,
          findContentRootOwners(editor)
        );
        if (
          !PliteViewBoundaryGraph.resolvePointNode(graph, start) ||
          !PliteViewBoundaryGraph.resolvePointNode(graph, end)
        ) {
          return null;
        }
        return createPliteViewSelection(graph, { anchor: start, focus: end });
      },
    };
  } catch (error) {
    release();
    throw error;
  }
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
  const bindingEditor = hasEditorRuntime(key) ? key : editor;
  const binding =
    selection && hasEditorRuntime(bindingEditor)
      ? bindViewSelection(bindingEditor, selection)
      : null;
  VIEW_SELECTION_BINDINGS.get(key)?.release();
  VIEW_SELECTION_BINDINGS.delete(key);
  PENDING_VIEW_SELECTION_NOTIFICATIONS.delete(key);
  if (binding) VIEW_SELECTION_BINDINGS.set(key, binding);

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

export const withPliteViewSelectionHistory = (
  editor: EditorWithHistory,
  direction: HistoryDirection,
  update: () => void
) => {
  const batch = getHistoryBatch(
    editor,
    direction === 'undo' ? 'undos' : 'redos'
  );
  const entry = batch ? HISTORY_BATCH_TO_VIEW_SELECTION.get(batch) : undefined;
  update();
  const inverse = getHistoryBatch(
    editor,
    direction === 'undo' ? 'redos' : 'undos'
  );
  if (entry && inverse) HISTORY_BATCH_TO_VIEW_SELECTION.set(inverse, entry);
};
