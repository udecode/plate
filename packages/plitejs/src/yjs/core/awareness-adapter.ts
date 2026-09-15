import * as Y from 'yjs';

import {
  bindAuthoredRange,
  readAuthoredView,
  type NativeAuthoredRangeBinding,
} from '../../core/authored-runtime';
import { registerEditorViewLifetimeCleanup } from '../../core/editor-view-lifetime';
import { toInternalRoot as normalizeRootKey } from '../../core/public-root';
import { snapshotEditorJsonValue } from '../../core/value-codec';
import type { Anchor, Point, Range } from '../../index';
import { RangeApi } from '../../index';
import {
  createYjsAwarenessSelection,
  yjsAwarenessSelectionsEqual,
} from './awareness';
import {
  readYjsAwarenessRelativeSelection,
  type YjsAwarenessRelativeSelection,
} from './awareness-relative-selection';
import { getYjsLength, getYjsNodeIf } from './document';
import type { YjsEditor } from './editor-types';
import { areJsonLikeValuesEqual } from './json-equality';
import { isRecord } from './record';
import {
  yjsRelativePositionToPoint,
  yjsRelativeRangesEqual,
} from './selection';
import type {
  YjsAwarenessChange,
  YjsAwarenessLike,
  YjsAwarenessState,
  YjsRemoteCursor,
  YjsRemoteCursorData,
} from './types';

type YjsAwarenessAdapterOptions<TCursorData extends YjsRemoteCursorData> = {
  readonly awareness: YjsAwarenessLike;
  readonly canSyncSelection: () => boolean;
  readonly editor: YjsEditor;
  readonly rootFor: (root: string) => Y.XmlElement | null;
  readonly validateCursorData: (value: unknown) => value is TCursorData;
};

export type YjsRemoteCursorCacheMetrics = Readonly<{
  clientDecodeCount: number;
  clientPublicationCount: number;
  cursorResolutionPassCount: number;
  endpointConversionCount: number;
  fullFallbackCount: number;
  idsPublicationCount: number;
}>;

export type YjsAwarenessAdapter<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
> = {
  readonly claimSelection: () => void;
  readonly forView: (view: YjsEditor) => YjsAwarenessAdapter<TCursorData>;
  readonly clearSelection: () => void;
  readonly currentSelection: () => Range | null;
  readonly destroy: () => void;
  readonly getMetrics: () => YjsRemoteCursorCacheMetrics;
  readonly handleAwarenessChange: (event: YjsAwarenessChange) => void;
  readonly publishMappedRoots: (
    roots: ReadonlySet<string>,
    options?: Readonly<{ fallbackRoots?: ReadonlySet<string> }>
  ) => void;
  readonly publishOwnedSelection: () => void;
  readonly rebuild: () => void;
  readonly remoteCursor: (
    clientId: number
  ) => YjsRemoteCursor<TCursorData> | null;
  readonly remoteCursorIds: () => readonly number[];
  readonly remoteCursors: () => ReadonlyArray<YjsRemoteCursor<TCursorData>>;
  readonly setCursorData: (data: TCursorData | null) => void;
  readonly syncSelection: () => void;
  readonly subscribeCursor: (
    clientId: number,
    listener: () => void
  ) => () => void;
  readonly subscribeCursors: (listener: () => void) => () => void;
  readonly subscribeIds: (listener: () => void) => () => void;
};

type CachedCursor<TCursorData extends YjsRemoteCursorData> = {
  anchor: Anchor<Point> | null;
  cursor: YjsRemoteCursor<TCursorData>;
  focus: Anchor<Point> | null;
  rawSelection:
    | YjsAwarenessRelativeSelection
    | Readonly<{ authored: unknown; root: string }>
    | null;
  views: WeakMap<
    YjsEditor,
    {
      binding: NativeAuthoredRangeBinding | undefined;
      cursor: YjsRemoteCursor<TCursorData>;
    }
  >;
};

const EMPTY_CLIENT_IDS = Object.freeze([]) as readonly number[];
const EMPTY_CURSORS = Object.freeze([]) as readonly YjsRemoteCursor[];

const getSortedAwarenessClientIds = (
  awareness: YjsAwarenessLike,
  localClientId: number
): readonly number[] => {
  const clientIds: number[] = [];

  for (const clientId of awareness.getStates().keys()) {
    if (clientId !== localClientId) clientIds.push(clientId);
  }

  if (clientIds.length > 1) clientIds.sort((a, b) => a - b);

  return clientIds;
};

const readRemoteCursorRecordData = <TCursorData extends YjsRemoteCursorData>(
  state: YjsAwarenessState,
  field: string,
  validate: (value: unknown) => value is TCursorData
): TCursorData | undefined => {
  const data = state[field];

  return isRecord(data) && validate(data) ? data : undefined;
};

const areRelativeSelectionsEqual = (
  left: CachedCursor<YjsRemoteCursorData>['rawSelection'],
  right: CachedCursor<YjsRemoteCursorData>['rawSelection']
) =>
  left === right ||
  (left !== null &&
    right !== null &&
    left.root === right.root &&
    ('authored' in left || 'authored' in right
      ? 'authored' in left &&
        'authored' in right &&
        areJsonLikeValuesEqual(left.authored, right.authored)
      : yjsRelativeRangesEqual(left.range, right.range)));

const areCursorDataEqual = (
  left: YjsRemoteCursorData | undefined,
  right: YjsRemoteCursorData | undefined
) =>
  left === right ||
  (left !== undefined &&
    right !== undefined &&
    areJsonLikeValuesEqual(left, right));

const withRoot = (point: Point, root: string): Point =>
  root === 'main' ? point : { ...point, root };

const createRemoteCursor = <TCursorData extends YjsRemoteCursorData>(
  clientId: number,
  selection: Range | null,
  data: TCursorData | undefined
): YjsRemoteCursor<TCursorData> =>
  Object.freeze({
    clientId,
    ...(data === undefined ? {} : { data }),
    selection,
  });

const notify = (listeners: ReadonlySet<() => void>) => {
  for (const listener of listeners) listener();
};

export const createYjsAwarenessAdapter = <
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
>({
  awareness,
  canSyncSelection,
  editor,
  rootFor,
  validateCursorData,
}: YjsAwarenessAdapterOptions<TCursorData>): YjsAwarenessAdapter<TCursorData> => {
  const cursorListeners = new Map<number, Set<() => void>>();
  const cursors = new Map<number, CachedCursor<TCursorData>>();
  const cursorsListeners = new Set<() => void>();
  const idsListeners = new Set<() => void>();
  const viewAdapters = new WeakMap<
    YjsEditor,
    YjsAwarenessAdapter<TCursorData>
  >();
  const viewLists = new WeakMap<
    YjsEditor,
    ReadonlyArray<YjsRemoteCursor<TCursorData>>
  >();
  let cursorIdSet = new Set<number>();
  let cursorIds = EMPTY_CLIENT_IDS;
  let cursorList: ReadonlyArray<YjsRemoteCursor<TCursorData>> | null =
    EMPTY_CURSORS as ReadonlyArray<YjsRemoteCursor<TCursorData>>;
  let selectionOwner: object | null = null;
  let publishOwnedSelection: (() => void) | null = null;
  const metrics = {
    clientDecodeCount: 0,
    clientPublicationCount: 0,
    cursorResolutionPassCount: 0,
    endpointConversionCount: 0,
    fullFallbackCount: 0,
    idsPublicationCount: 0,
  };

  const currentSelection = (): Range | null => editor.read.selection();

  const getLocalAwarenessClientId = (): number => awareness.doc.clientID;

  const isValidYjsSelectionPoint = (point: Range['anchor']): boolean => {
    const root = rootFor(normalizeRootKey(point.root));

    if (root === null) return false;

    const node = getYjsNodeIf(root, point.path);

    return (
      node instanceof Y.XmlText &&
      point.offset >= 0 &&
      point.offset <= getYjsLength(node)
    );
  };

  const sanitizeYjsSelection = (range: Range): Range | null => {
    if (
      normalizeRootKey(range.anchor.root) !== normalizeRootKey(range.focus.root)
    ) {
      return null;
    }

    return isValidYjsSelectionPoint(range.anchor) &&
      isValidYjsSelectionPoint(range.focus)
      ? range
      : null;
  };

  const releaseCursorAnchors = (cursor: CachedCursor<TCursorData>) => {
    cursor.anchor?.release();
    if (cursor.focus !== cursor.anchor) cursor.focus?.release();
    cursor.anchor = null;
    cursor.focus = null;
  };

  const resolveRelativePoint = (
    root: Y.XmlElement,
    rootKey: string,
    position: Y.RelativePosition
  ): Point | null => {
    metrics.endpointConversionCount += 1;
    const point = yjsRelativePositionToPoint(root, position);

    return point ? withRoot(point, rootKey) : null;
  };

  const resolveSelection = (
    rawSelection: CachedCursor<TCursorData>['rawSelection']
  ): Readonly<{
    anchor: Anchor<Point> | null;
    focus: Anchor<Point> | null;
    selection: Range | null;
  }> => {
    if (!rawSelection) {
      return { anchor: null, focus: null, selection: null };
    }

    metrics.cursorResolutionPassCount += 1;
    if ('authored' in rawSelection) {
      try {
        const binding = bindAuthoredRange(editor, {
          saved: rawSelection.authored,
          options: {
            root: rawSelection.root,
            deletion: 'drop',
            association: 'forward',
          },
        });
        return {
          anchor: null,
          focus: null,
          selection: binding?.resolve() ?? null,
        };
      } catch {
        return { anchor: null, focus: null, selection: null };
      }
    }
    const root = rootFor(rawSelection.root);

    if (!root) return { anchor: null, focus: null, selection: null };

    try {
      const sameEndpoint = Y.compareRelativePositions(
        rawSelection.range.anchor,
        rawSelection.range.focus
      );
      const anchorPoint = resolveRelativePoint(
        root,
        rawSelection.root,
        rawSelection.range.anchor
      );
      const focusPoint = sameEndpoint
        ? anchorPoint
        : resolveRelativePoint(
            root,
            rawSelection.root,
            rawSelection.range.focus
          );

      if (!anchorPoint || !focusPoint) {
        return { anchor: null, focus: null, selection: null };
      }

      const anchor = editor.anchor(anchorPoint, {
        association:
          rawSelection.range.anchor.assoc < 0 ? 'backward' : 'forward',
        deletion: 'drop',
        ...(rawSelection.root === 'main' ? {} : { root: rawSelection.root }),
      });
      const focus = sameEndpoint
        ? anchor
        : editor.anchor(focusPoint, {
            association:
              rawSelection.range.focus.assoc < 0 ? 'backward' : 'forward',
            deletion: 'drop',
            ...(rawSelection.root === 'main'
              ? {}
              : { root: rawSelection.root }),
          });

      return {
        anchor,
        focus,
        selection: { anchor: anchorPoint, focus: focusPoint },
      };
    } catch {
      return { anchor: null, focus: null, selection: null };
    }
  };

  const setCursorSelection = (
    cached: CachedCursor<TCursorData>,
    selection: Range | null,
    anchor: Anchor<Point> | null,
    focus: Anchor<Point> | null
  ) => {
    releaseCursorAnchors(cached);
    cached.anchor = anchor;
    cached.focus = focus;

    if (
      cached.cursor.selection === selection ||
      (cached.cursor.selection &&
        selection &&
        RangeApi.equals(cached.cursor.selection, selection))
    ) {
      return false;
    }

    cached.cursor = createRemoteCursor(
      cached.cursor.clientId,
      selection,
      cached.cursor.data
    );

    return true;
  };

  const removeCursor = (remoteClientId: number) => {
    const cached = cursors.get(remoteClientId);

    if (!cached) return false;

    releaseCursorAnchors(cached);
    cursors.delete(remoteClientId);

    return true;
  };

  const decodeClient = (remoteClientId: number) => {
    if (remoteClientId === getLocalAwarenessClientId()) {
      return removeCursor(remoteClientId);
    }

    const state = awareness.getStates().get(remoteClientId);

    if (!state) return removeCursor(remoteClientId);

    metrics.clientDecodeCount += 1;
    const data = readRemoteCursorRecordData(state, 'data', validateCursorData);
    const saved = state.selection;
    let rawSelection: CachedCursor<TCursorData>['rawSelection'] = null;
    try {
      rawSelection =
        isRecord(saved) && typeof saved.root === 'string' && 'authored' in saved
          ? snapshotEditorJsonValue(
              { root: saved.root, authored: saved.authored },
              'Authored awareness selection'
            )
          : readYjsAwarenessRelativeSelection(saved);
    } catch {
      rawSelection = null;
    }
    const current = cursors.get(remoteClientId);

    if (!current) {
      const resolved = resolveSelection(rawSelection);

      cursors.set(remoteClientId, {
        anchor: resolved.anchor,
        cursor: createRemoteCursor(remoteClientId, resolved.selection, data),
        focus: resolved.focus,
        rawSelection,
        views: new WeakMap(),
      });

      return true;
    }

    const selectionChanged = !areRelativeSelectionsEqual(
      current.rawSelection,
      rawSelection
    );
    const dataChanged = !areCursorDataEqual(current.cursor.data, data);

    if (!selectionChanged && !dataChanged) return false;

    if (selectionChanged) {
      const resolved = resolveSelection(rawSelection);

      releaseCursorAnchors(current);
      current.anchor = resolved.anchor;
      current.focus = resolved.focus;
      current.rawSelection = rawSelection;
      current.views = new WeakMap();
      current.cursor = createRemoteCursor(
        remoteClientId,
        resolved.selection,
        data
      );
    } else {
      current.cursor = createRemoteCursor(
        remoteClientId,
        current.cursor.selection,
        data
      );
    }

    return true;
  };

  const publish = (changedClientIds: ReadonlySet<number>) => {
    if (changedClientIds.size === 0) return;

    const idsChanged =
      cursors.size !== cursorIdSet.size ||
      [...changedClientIds].some(
        (changedClientId) =>
          cursors.has(changedClientId) !== cursorIdSet.has(changedClientId)
      );

    if (idsChanged) {
      const nextIds = [...cursors.keys()].sort((a, b) => a - b);

      cursorIds = Object.freeze(nextIds);
      cursorIdSet = new Set(nextIds);
      metrics.idsPublicationCount += 1;
    }

    cursorList = null;
    metrics.clientPublicationCount += changedClientIds.size;

    for (const remoteClientId of changedClientIds) {
      const listeners = cursorListeners.get(remoteClientId);

      if (listeners) notify(listeners);
    }
    if (idsChanged) notify(idsListeners);
    notify(cursorsListeners);
  };

  const rebuild = () => {
    const changedClientIds = new Set(cursors.keys());

    for (const cached of cursors.values()) releaseCursorAnchors(cached);
    cursors.clear();

    for (const remoteClientId of getSortedAwarenessClientIds(
      awareness,
      getLocalAwarenessClientId()
    )) {
      decodeClient(remoteClientId);
      changedClientIds.add(remoteClientId);
    }

    publish(changedClientIds);
  };

  const handleAwarenessChange = (event: YjsAwarenessChange) => {
    const changedClientIds = new Set<number>();

    for (const remoteClientId of event.removed) {
      if (removeCursor(remoteClientId)) changedClientIds.add(remoteClientId);
    }
    for (const remoteClientId of new Set([...event.added, ...event.updated])) {
      if (decodeClient(remoteClientId)) changedClientIds.add(remoteClientId);
    }

    publish(changedClientIds);
  };

  const publishMappedRoots = (
    roots: ReadonlySet<string>,
    options: Readonly<{ fallbackRoots?: ReadonlySet<string> }> = {}
  ) => {
    const changedClientIds = new Set<number>();

    for (const root of roots) {
      const rootCursors = [...cursors.values()].filter(
        (cached) => cached.rawSelection?.root === root
      );
      for (const cached of rootCursors) {
        if (cached.rawSelection && 'authored' in cached.rawSelection) {
          cached.cursor =
            readCursor(cached.cursor.clientId, editor) ?? cached.cursor;
          changedClientIds.add(cached.cursor.clientId);
        }
      }
      const ordinary = rootCursors.filter(
        (cached) => !cached.rawSelection || !('authored' in cached.rawSelection)
      );
      let fallback = options.fallbackRoots?.has(root) ?? false;
      const mapped = new Map<
        CachedCursor<TCursorData>,
        Readonly<{ anchor: Point; focus: Point }>
      >();

      if (!fallback) {
        try {
          for (const cached of ordinary) {
            const anchor = cached.anchor?.resolve() ?? null;
            const focus = cached.focus?.resolve() ?? null;

            if (!anchor || !focus) {
              fallback = true;
              break;
            }
            mapped.set(cached, { anchor, focus });
          }
        } catch {
          fallback = true;
        }
      }

      if (fallback && ordinary.length > 0) {
        metrics.fullFallbackCount += 1;

        for (const cached of ordinary) {
          const resolved = resolveSelection(cached.rawSelection);

          if (
            setCursorSelection(
              cached,
              resolved.selection,
              resolved.anchor,
              resolved.focus
            )
          ) {
            changedClientIds.add(cached.cursor.clientId);
          }
        }
        continue;
      }

      for (const [cached, selection] of mapped) {
        if (
          cached.cursor.selection === null ||
          !RangeApi.equals(cached.cursor.selection, selection)
        ) {
          cached.cursor = createRemoteCursor(
            cached.cursor.clientId,
            selection,
            cached.cursor.data
          );
          changedClientIds.add(cached.cursor.clientId);
        }
      }
    }

    publish(changedClientIds);
  };

  const clearSelectionField = (): void => {
    const localState = awareness.getLocalState();

    if (
      localState !== null &&
      'selection' in localState &&
      localState.selection !== null
    ) {
      awareness.setLocalStateField('selection', null);
    }
  };

  const setLocalStateFieldIfChanged = (field: string, value: unknown): void => {
    const localState = awareness.getLocalState();

    if (
      localState !== null &&
      field in localState &&
      areJsonLikeValuesEqual(localState[field], value)
    ) {
      return;
    }

    awareness.setLocalStateField(field, value);
  };

  const setCursorData = (data: TCursorData | null): void => {
    if (data !== null && !validateCursorData(data)) {
      throw new Error('Yjs cursor data does not match its configured schema.');
    }
    setLocalStateFieldIfChanged('data', data);
  };

  const writeSelection = (view: YjsEditor): void => {
    const selection = view.read.selection();
    if (readAuthoredView(view)) {
      let next = null;
      if (selection) {
        const root = normalizeRootKey(
          selection.anchor.root ?? view.read.view.root()
        );
        try {
          const binding = bindAuthoredRange(view, {
            range: selection,
            options: { root, deletion: 'drop', association: 'forward' },
          });
          if (binding) next = { authored: binding.serialize(), root };
        } catch {
          next = null;
        }
      }
      setLocalStateFieldIfChanged('selection', next);
      return;
    }

    const nextRange =
      selection === null || selection === undefined
        ? null
        : sanitizeYjsSelection(selection);
    const rootKey =
      nextRange === null ? 'main' : normalizeRootKey(nextRange.anchor.root);
    const root = rootFor(rootKey);
    const nextSelection =
      nextRange === null || root === null
        ? null
        : createYjsAwarenessSelection(root, rootKey, nextRange);
    const currentAwarenessSelection = awareness.getLocalState()?.selection;

    if (
      !yjsAwarenessSelectionsEqual(currentAwarenessSelection, nextSelection)
    ) {
      awareness.setLocalStateField('selection', nextSelection);
    }
  };

  const subscribe = (listeners: Set<() => void>, listener: () => void) => {
    listeners.add(listener);

    return () => listeners.delete(listener);
  };

  const readCursor = (
    remoteClientId: number,
    view: YjsEditor
  ): YjsRemoteCursor<TCursorData> | null => {
    const cached = cursors.get(remoteClientId);
    if (!cached) return null;
    if (!cached.rawSelection || !('authored' in cached.rawSelection)) {
      return cached.cursor;
    }
    let current = cached.views.get(view);
    if (!current?.binding) {
      let binding: NativeAuthoredRangeBinding | undefined;
      try {
        binding = bindAuthoredRange(view, {
          saved: cached.rawSelection.authored,
          options: {
            root: cached.rawSelection.root,
            deletion: 'drop',
            association: 'forward',
          },
        });
      } catch {
        binding = undefined;
      }
      current = {
        binding,
        cursor: createRemoteCursor(remoteClientId, null, cached.cursor.data),
      };
      cached.views.set(view, current);
    }
    const selection = current.binding?.resolve() ?? null;
    if (
      current.cursor.data !== cached.cursor.data ||
      (current.cursor.selection === null || selection === null
        ? current.cursor.selection !== selection
        : !RangeApi.equals(current.cursor.selection, selection))
    ) {
      current.cursor = createRemoteCursor(
        remoteClientId,
        selection,
        cached.cursor.data
      );
    }
    return current.cursor;
  };
  const readCursors = (view: YjsEditor) => {
    const current = cursorIds.flatMap((id) => {
      const cursor = readCursor(id, view);
      return cursor ? [cursor] : [];
    });
    const previous = viewLists.get(view);
    if (
      previous?.length === current.length &&
      current.every((cursor, index) => previous[index] === cursor)
    ) {
      return previous;
    }
    const next = Object.freeze(current);
    viewLists.set(view, next);
    return next;
  };

  rebuild();

  const createSelectionMethods = (view: YjsEditor) => {
    const token = {};
    const publishSelection = () => writeSelection(view);
    const claimSelection = () => {
      selectionOwner = token;
      publishOwnedSelection = publishSelection;
    };

    return {
      claimSelection,
      clearSelection: () => {
        claimSelection();
        clearSelectionField();
      },
      syncSelection: () => {
        claimSelection();
        if (canSyncSelection()) publishSelection();
      },
      releaseSelection: () => {
        if (selectionOwner !== token) return;

        selectionOwner = null;
        publishOwnedSelection = null;
        clearSelectionField();
      },
    };
  };

  const rootSelection = createSelectionMethods(editor);

  const adapter: YjsAwarenessAdapter<TCursorData> = {
    claimSelection: rootSelection.claimSelection,
    forView(view) {
      if (view === editor) return adapter;
      const previous = viewAdapters.get(view);
      if (previous) return previous;
      const selection = createSelectionMethods(view);
      registerEditorViewLifetimeCleanup(view, selection.releaseSelection);
      const scoped = Object.freeze<YjsAwarenessAdapter<TCursorData>>({
        ...adapter,
        claimSelection: selection.claimSelection,
        clearSelection: selection.clearSelection,
        currentSelection: () => view.read.selection(),
        remoteCursor: (id) => readCursor(id, view),
        remoteCursors: () => readCursors(view),
        syncSelection: selection.syncSelection,
      });
      viewAdapters.set(view, scoped);
      return scoped;
    },
    clearSelection: rootSelection.clearSelection,
    currentSelection,
    destroy() {
      clearSelectionField();
      selectionOwner = null;
      publishOwnedSelection = null;
      for (const cached of cursors.values()) releaseCursorAnchors(cached);
      cursors.clear();
      cursorIdSet.clear();
      cursorListeners.clear();
      cursorsListeners.clear();
      idsListeners.clear();
    },
    getMetrics: () => Object.freeze({ ...metrics }),
    handleAwarenessChange,
    publishMappedRoots,
    publishOwnedSelection: () => {
      if (selectionOwner !== null && canSyncSelection()) {
        publishOwnedSelection?.();
      }
    },
    rebuild,
    remoteCursor: (remoteClientId) => readCursor(remoteClientId, editor),
    remoteCursorIds: () => cursorIds,
    remoteCursors: () => {
      if (readAuthoredView(editor)) return readCursors(editor);
      if (cursorList === null) {
        cursorList = Object.freeze(
          cursorIds.flatMap((id) => {
            const cursor = cursors.get(id)?.cursor;

            return cursor ? [cursor] : [];
          })
        );
      }

      return cursorList;
    },
    setCursorData,
    subscribeCursor(remoteClientId, listener) {
      const listeners = cursorListeners.get(remoteClientId) ?? new Set();

      listeners.add(listener);
      cursorListeners.set(remoteClientId, listeners);

      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) cursorListeners.delete(remoteClientId);
      };
    },
    subscribeCursors: (listener) => subscribe(cursorsListeners, listener),
    subscribeIds: (listener) => subscribe(idsListeners, listener),
    syncSelection: rootSelection.syncSelection,
  };
  return adapter;
};
