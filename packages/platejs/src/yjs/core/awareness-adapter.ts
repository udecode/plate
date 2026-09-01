import * as Y from 'yjs';

import type { Anchor, Point, Range } from '../../core';
import { normalizeRootKey, RangeApi } from '../../core';
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
  yjsRelativePositionToPlitePoint,
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
  readonly awareness?: YjsAwarenessLike;
  readonly awarenessDataField: string;
  readonly awarenessSelectionField: string;
  readonly canSendSelection: () => boolean;
  readonly clientId: number | string;
  readonly doc: Y.Doc;
  readonly editor: YjsEditor;
  readonly isConnected: () => boolean;
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
  readonly clearSelection: () => void;
  readonly currentSelection: () => Range | null;
  readonly destroy: () => void;
  readonly getMetrics: () => YjsRemoteCursorCacheMetrics;
  readonly handleAwarenessChange: (event: YjsAwarenessChange) => void;
  readonly publishMappedRoots: (
    roots: ReadonlySet<string>,
    options?: Readonly<{ fallbackRoots?: ReadonlySet<string> }>
  ) => void;
  readonly rebuild: () => void;
  readonly remoteCursor: (
    clientId: number
  ) => YjsRemoteCursor<TCursorData> | null;
  readonly remoteCursorIds: () => readonly number[];
  readonly remoteCursors: () => ReadonlyArray<YjsRemoteCursor<TCursorData>>;
  readonly sendCursorData: (data: TCursorData | null) => void;
  readonly sendSelection: (
    range?: Range | null,
    data?: TCursorData | null
  ) => void;
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
  rawSelection: YjsAwarenessRelativeSelection | null;
};

const CURSORS_AT_PATH = Symbol('platejs/yjs/cursors-at-path');

type IndexedYjsAwarenessAdapter<TCursorData extends YjsRemoteCursorData> =
  YjsAwarenessAdapter<TCursorData> & {
    readonly [CURSORS_AT_PATH]: (
      path: readonly number[]
    ) => ReadonlyArray<YjsRemoteCursor<TCursorData>>;
  };

export const getYjsRemoteCursorsAtPath = <
  TCursorData extends YjsRemoteCursorData,
>(
  adapter: YjsAwarenessAdapter<TCursorData>,
  path: readonly number[]
): ReadonlyArray<YjsRemoteCursor<TCursorData>> =>
  (adapter as IndexedYjsAwarenessAdapter<TCursorData>)[CURSORS_AT_PATH](path);

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
  left: YjsAwarenessRelativeSelection | null,
  right: YjsAwarenessRelativeSelection | null
) =>
  left === right ||
  (left !== null &&
    right !== null &&
    left.root === right.root &&
    yjsRelativeRangesEqual(left.range, right.range));

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
  awarenessDataField,
  awarenessSelectionField,
  canSendSelection,
  clientId,
  doc,
  editor,
  isConnected,
  rootFor,
  validateCursorData,
}: YjsAwarenessAdapterOptions<TCursorData>): YjsAwarenessAdapter<TCursorData> => {
  const cursorListeners = new Map<number, Set<() => void>>();
  const cursors = new Map<number, CachedCursor<TCursorData>>();
  const cursorIdsByPath = new Map<string, Set<number>>();
  const cursorPathById = new Map<number, string>();
  const cursorsListeners = new Set<() => void>();
  const idsListeners = new Set<() => void>();
  let cursorIdSet = new Set<number>();
  let cursorIds = EMPTY_CLIENT_IDS;
  let cursorList: ReadonlyArray<YjsRemoteCursor<TCursorData>> | null =
    EMPTY_CURSORS as ReadonlyArray<YjsRemoteCursor<TCursorData>>;
  const metrics = {
    clientDecodeCount: 0,
    clientPublicationCount: 0,
    cursorResolutionPassCount: 0,
    endpointConversionCount: 0,
    fullFallbackCount: 0,
    idsPublicationCount: 0,
  };

  const currentSelection = (): Range | null => editor.read.selection();

  const getLocalAwarenessClientId = (): number =>
    awareness?.doc?.clientID ??
    awareness?.clientID ??
    (typeof clientId === 'number' ? clientId : doc.clientID);

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
    const point = yjsRelativePositionToPlitePoint(root, position);

    return point ? withRoot(point, rootKey) : null;
  };

  const resolveSelection = (
    rawSelection: YjsAwarenessRelativeSelection | null
  ): Readonly<{
    anchor: Anchor<Point> | null;
    focus: Anchor<Point> | null;
    selection: Range | null;
  }> => {
    if (!rawSelection) {
      return { anchor: null, focus: null, selection: null };
    }

    metrics.cursorResolutionPassCount += 1;
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
    if (!awareness || remoteClientId === getLocalAwarenessClientId()) {
      return removeCursor(remoteClientId);
    }

    const state = awareness.getStates().get(remoteClientId);

    if (!state) return removeCursor(remoteClientId);

    metrics.clientDecodeCount += 1;
    const data = readRemoteCursorRecordData(
      state,
      awarenessDataField,
      validateCursorData
    );
    const rawSelection = readYjsAwarenessRelativeSelection(
      state[awarenessSelectionField]
    );
    const current = cursors.get(remoteClientId);

    if (!current) {
      const resolved = resolveSelection(rawSelection);

      cursors.set(remoteClientId, {
        anchor: resolved.anchor,
        cursor: createRemoteCursor(remoteClientId, resolved.selection, data),
        focus: resolved.focus,
        rawSelection,
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

    for (const remoteClientId of changedClientIds) {
      const previousPath = cursorPathById.get(remoteClientId);

      if (previousPath) {
        const ids = cursorIdsByPath.get(previousPath);

        ids?.delete(remoteClientId);
        if (ids?.size === 0) cursorIdsByPath.delete(previousPath);
        cursorPathById.delete(remoteClientId);
      }

      const selection = cursors.get(remoteClientId)?.cursor.selection;

      if (selection && !RangeApi.isCollapsed(selection)) {
        const nextPath = selection.anchor.path.join('.');
        const ids = cursorIdsByPath.get(nextPath) ?? new Set<number>();

        ids.add(remoteClientId);
        cursorIdsByPath.set(nextPath, ids);
        cursorPathById.set(remoteClientId, nextPath);
      }
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

    if (awareness && isConnected()) {
      for (const remoteClientId of getSortedAwarenessClientIds(
        awareness,
        getLocalAwarenessClientId()
      )) {
        decodeClient(remoteClientId);
        changedClientIds.add(remoteClientId);
      }
    }

    publish(changedClientIds);
  };

  const handleAwarenessChange = (event: YjsAwarenessChange) => {
    if (!isConnected()) {
      rebuild();
      return;
    }

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
      let fallback = options.fallbackRoots?.has(root) ?? false;
      const mapped = new Map<
        CachedCursor<TCursorData>,
        Readonly<{ anchor: Point; focus: Point }>
      >();

      if (!fallback) {
        try {
          for (const cached of rootCursors) {
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

      if (fallback && rootCursors.length > 0) {
        metrics.fullFallbackCount += 1;

        for (const cached of rootCursors) {
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

  const clearSelection = (): void => {
    if (!awareness) return;

    const localState = awareness.getLocalState();

    if (
      localState !== null &&
      awarenessSelectionField in localState &&
      localState[awarenessSelectionField] !== null
    ) {
      awareness.setLocalStateField(awarenessSelectionField, null);
    }
  };

  const setLocalStateFieldIfChanged = (field: string, value: unknown): void => {
    if (!awareness) return;

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

  const sendCursorData = (data: TCursorData | null): void => {
    if (data !== null && !validateCursorData(data)) {
      throw new Error('Yjs cursor data does not match its configured schema.');
    }
    setLocalStateFieldIfChanged(awarenessDataField, data);
  };

  const sendSelection = (
    range: Range | null | undefined = currentSelection(),
    data?: TCursorData | null
  ): void => {
    if (!awareness || !canSendSelection()) return;

    if (data !== undefined) sendCursorData(data);

    const nextRange =
      range === null || range === undefined
        ? null
        : sanitizeYjsSelection(range);
    const rootKey =
      nextRange === null ? 'main' : normalizeRootKey(nextRange.anchor.root);
    const root = rootFor(rootKey);
    const nextSelection =
      nextRange === null || root === null
        ? null
        : createYjsAwarenessSelection(root, rootKey, nextRange);
    const currentAwarenessSelection =
      awareness.getLocalState()?.[awarenessSelectionField];

    if (
      !yjsAwarenessSelectionsEqual(currentAwarenessSelection, nextSelection)
    ) {
      awareness.setLocalStateField(awarenessSelectionField, nextSelection);
    }
  };

  const subscribe = (listeners: Set<() => void>, listener: () => void) => {
    listeners.add(listener);

    return () => listeners.delete(listener);
  };

  rebuild();

  return {
    [CURSORS_AT_PATH](path) {
      return Object.freeze(
        [...(cursorIdsByPath.get(path.join('.')) ?? [])].flatMap((id) => {
          const cursor = cursors.get(id)?.cursor;

          return cursor ? [cursor] : [];
        })
      );
    },
    clearSelection,
    currentSelection,
    destroy() {
      for (const cached of cursors.values()) releaseCursorAnchors(cached);
      cursors.clear();
      cursorIdsByPath.clear();
      cursorPathById.clear();
      cursorIdSet.clear();
      cursorListeners.clear();
      cursorsListeners.clear();
      idsListeners.clear();
    },
    getMetrics: () => Object.freeze({ ...metrics }),
    handleAwarenessChange,
    publishMappedRoots,
    rebuild,
    remoteCursor: (remoteClientId) =>
      cursors.get(remoteClientId)?.cursor ?? null,
    remoteCursorIds: () => cursorIds,
    remoteCursors: () => {
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
    sendCursorData,
    sendSelection,
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
  } as IndexedYjsAwarenessAdapter<TCursorData>;
};
