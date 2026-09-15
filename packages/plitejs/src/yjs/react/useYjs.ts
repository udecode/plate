import {
  useCallback,
  useMemo,
  useSyncExternalStore,
  type RefObject,
} from 'react';

import { getEditorRuntimeOwner } from '../../index';
import {
  createRangeGeometryOwner,
  type RangeGeometry,
  type RangeGeometryOwner,
  useRangeGeometryOwner,
} from '../../react/range-geometry';
import type { YjsAwarenessAdapter } from '../core/awareness-adapter';
import { getActiveYjsController } from '../core/controller-registry';
import type {
  YjsAdmissionStatus,
  YjsBaseApi,
  YjsPresenceApi,
  YjsRemoteCursor,
  YjsRemoteCursorData,
} from '../core/types';

type YjsCursorDataForApi<TApi> =
  TApi extends YjsPresenceApi<infer TCursorData>
    ? TCursorData
    : YjsRemoteCursorData;

type YjsEditorRuntimeCarrier = Readonly<{
  id: string;
  read: object;
  update: object;
}>;

type YjsEditorWithApi<TApi> = YjsEditorRuntimeCarrier &
  Readonly<{ api: { yjs: TApi } }>;

type YjsPresenceReadApi = YjsBaseApi &
  Pick<
    YjsPresenceApi,
    'remoteCursor' | 'remoteCursors' | 'subscribeRemoteCursors'
  >;

export const getYjsCursorCache = <
  TCursorData extends Readonly<Record<string, unknown>>,
>(
  editor: YjsEditorRuntimeCarrier
): YjsAwarenessAdapter<TCursorData> => {
  const owner = getEditorRuntimeOwner(editor);
  const controller = getActiveYjsController<TCursorData>(owner);

  if (!controller) {
    throw new Error('Yjs plugin is not active on this editor.');
  }

  return controller.cursorCache(owner);
};

export const createYjsRemoteCursorGeometryOwner = <
  TCursorData extends Readonly<Record<string, unknown>>,
>(
  editor: YjsEditorRuntimeCarrier,
  cache: YjsAwarenessAdapter<TCursorData>,
  clientId: number,
  editableRef: RefObject<HTMLElement | null>
): RangeGeometryOwner => {
  const controller = getActiveYjsController<TCursorData>(
    getEditorRuntimeOwner(editor)
  );

  if (!controller) {
    throw new Error('Yjs plugin is not active on this editor.');
  }

  const api = controller.baseApi();

  return createRangeGeometryOwner(
    getEditorRuntimeOwner(editor),
    {
      read: (view) =>
        api.admissionStatus().state === 'ready'
          ? (cache.forView(view).remoteCursor(clientId)?.selection ?? null)
          : null,
      subscribe: (_view, listener) => {
        const unsubscribeCursor = cache.subscribeCursor(clientId, listener);
        const unsubscribeAdmission = api.subscribeAdmissionStatus(listener);
        let active = true;

        return () => {
          if (!active) return;

          active = false;
          unsubscribeCursor();
          unsubscribeAdmission();
        };
      },
    },
    editableRef
  );
};

export function useYjsAdmissionStatus<TApi extends YjsBaseApi>(
  editor: YjsEditorWithApi<TApi>
): YjsAdmissionStatus {
  const api = editor.api.yjs;

  return useSyncExternalStore(
    api.subscribeAdmissionStatus,
    api.admissionStatus,
    api.admissionStatus
  );
}

export function useYjsRemoteCursor<TApi extends YjsPresenceReadApi>(
  editor: YjsEditorWithApi<TApi>,
  clientId: number
): YjsRemoteCursor<YjsCursorDataForApi<TApi>> | null {
  const api = editor.api.yjs;
  const cache = getYjsCursorCache<YjsCursorDataForApi<TApi>>(editor);
  const getSnapshot = useCallback(
    () =>
      api.admissionStatus().state === 'ready'
        ? cache.remoteCursor(clientId)
        : null,
    [api, cache, clientId]
  );
  const subscribe = useCallback(
    (listener: () => void) => {
      const unsubscribeCursor = cache.subscribeCursor(clientId, listener);
      const unsubscribeAdmission = api.subscribeAdmissionStatus(listener);
      let active = true;

      return () => {
        if (!active) return;

        active = false;
        unsubscribeCursor();
        unsubscribeAdmission();
      };
    },
    [api, cache, clientId]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useYjsRemoteCursorIds<TApi extends YjsPresenceReadApi>(
  editor: YjsEditorWithApi<TApi>
): readonly number[] {
  const api = editor.api.yjs;
  const cache = getYjsCursorCache<YjsCursorDataForApi<TApi>>(editor);
  const getSnapshot = useCallback(
    () =>
      api.admissionStatus().state === 'ready'
        ? cache.remoteCursorIds()
        : EMPTY_REMOTE_CURSOR_IDS,
    [api, cache]
  );
  const subscribe = useCallback(
    (listener: () => void) => {
      const unsubscribeIds = cache.subscribeIds(listener);
      const unsubscribeAdmission = api.subscribeAdmissionStatus(listener);
      let active = true;

      return () => {
        if (!active) return;

        active = false;
        unsubscribeIds();
        unsubscribeAdmission();
      };
    },
    [api, cache]
  );
  const cursors = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return cursors;
}

export function useYjsRemoteCursorGeometry<TApi extends YjsPresenceReadApi>(
  editor: YjsEditorWithApi<TApi>,
  clientId: number,
  { editableRef }: Readonly<{ editableRef: RefObject<HTMLElement | null> }>
): RangeGeometry | null {
  const cache = getYjsCursorCache<YjsCursorDataForApi<TApi>>(editor);
  const owner = useMemo(
    () =>
      createYjsRemoteCursorGeometryOwner(editor, cache, clientId, editableRef),
    [cache, clientId, editableRef, editor]
  );

  return useRangeGeometryOwner(owner);
}

const EMPTY_REMOTE_CURSOR_IDS = Object.freeze([]) as readonly number[];
