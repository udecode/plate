import { getEditorRuntimeOwner } from '../../core';
import type {
  PliteResolvedWidget,
  PliteWidgetSnapshot,
  PliteWidgetStore,
  PliteViewSourceStatus,
} from '../../react/core';
import type { YjsAwarenessAdapter } from '../core/awareness-adapter';
import { getActiveYjsController } from '../core/controller-registry';
import type { YjsEditor } from '../core/editor-types';
import type { YjsRemoteCursor, YjsRemoteCursorData } from '../core/types';

export type YjsRemoteCursorWidgetData<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
> = {
  readonly clientId: number;
  readonly cursor: YjsRemoteCursor<TCursorData>;
};

const ACTIVE_STATUS = Object.freeze({
  active: true,
  failureCount: 0,
}) satisfies PliteViewSourceStatus;

const stores = new WeakMap<object, PliteWidgetStore<any>>();

export const getYjsCursorCache = <
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
>(
  editor: YjsEditor
): YjsAwarenessAdapter<TCursorData> => {
  const controller = getActiveYjsController(editor);

  if (!controller) {
    throw new Error('Yjs extension is not active on this editor.');
  }

  return controller.cursorCache() as YjsAwarenessAdapter<TCursorData>;
};

const createYjsCursorWidgetStore = <TCursorData extends YjsRemoteCursorData>(
  editor: YjsEditor,
  cache: YjsAwarenessAdapter<TCursorData>
): PliteWidgetStore<YjsRemoteCursorWidgetData<TCursorData>> => {
  type CursorWidget = PliteResolvedWidget<
    YjsRemoteCursorWidgetData<TCursorData>
  >;

  let sourceIds: readonly number[] | null = null;
  let allIds: readonly string[] = Object.freeze([]);
  let snapshot: PliteWidgetSnapshot<
    YjsRemoteCursorWidgetData<TCursorData>
  > | null = null;
  const resolvedById = new Map<
    string,
    Readonly<{ cursor: YjsRemoteCursor<TCursorData>; widget: CursorWidget }>
  >();
  const metrics = {
    changedWidgetCount: 0,
    fullFallbackCount: 0,
    recomputeCount: 0,
    widgetResolveCount: 0,
    widgetSubscriberWakeCount: 0,
  };

  const syncIds = () => {
    const nextIds = cache.remoteCursorIds();

    if (sourceIds === nextIds) return false;

    const nextIdSet = new Set(nextIds.map(String));

    resolvedById.forEach((_value, id) => {
      if (!nextIdSet.has(id)) resolvedById.delete(id);
    });
    sourceIds = nextIds;
    allIds = Object.freeze(nextIds.map(String));
    snapshot = null;

    return true;
  };

  const resolveWidget = (id: string): CursorWidget | null => {
    syncIds();
    const clientId = Number(id);

    if (!Number.isSafeInteger(clientId)) return null;

    const cursor = cache.remoteCursor(clientId);

    if (!cursor) {
      resolvedById.delete(id);

      return null;
    }

    const previous = resolvedById.get(id);

    if (previous?.cursor === cursor) return previous.widget;

    const widget = Object.freeze({
      annotation: null,
      available: cursor.selection !== null,
      data: Object.freeze({ clientId, cursor }),
      id,
      range: cursor.selection,
      target: Object.freeze({ type: 'selection' as const }),
    });

    resolvedById.set(id, { cursor, widget });
    metrics.widgetResolveCount += 1;

    return widget;
  };

  const materializeSnapshot = () => {
    syncIds();

    if (snapshot) return snapshot;

    const byId = new Map<string, CursorWidget>();

    allIds.forEach((id) => {
      const widget = resolveWidget(id);

      if (widget) byId.set(id, widget);
    });
    snapshot = Object.freeze({ allIds, byId });

    return snapshot;
  };

  const refresh = () => {
    sourceIds = null;
    snapshot = null;
    metrics.fullFallbackCount += 1;
    metrics.recomputeCount += 1;
    syncIds();
  };

  syncIds();

  return {
    editor: getEditorRuntimeOwner(editor),
    destroy() {},
    getMetrics: () => Object.freeze({ ...metrics }),
    getSnapshot: materializeSnapshot,
    getSourceStatus: () => ACTIVE_STATUS,
    getWidget: resolveWidget,
    refresh,
    retry: refresh,
    subscribe(listener) {
      return cache.subscribeCursors(() => {
        syncIds();
        snapshot = null;
        metrics.recomputeCount += 1;
        listener();
      });
    },
    subscribeWidget(id, listener) {
      const clientId = Number(id);

      if (!Number.isSafeInteger(clientId)) return () => {};

      return cache.subscribeCursor(clientId, () => {
        snapshot = null;
        metrics.changedWidgetCount += 1;
        metrics.recomputeCount += 1;
        metrics.widgetSubscriberWakeCount += 1;
        listener();
      });
    },
  };
};

export const getYjsCursorWidgetStore = <
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
>(
  editor: YjsEditor
): PliteWidgetStore<YjsRemoteCursorWidgetData<TCursorData>> => {
  const cache = getYjsCursorCache<TCursorData>(editor);
  const current = stores.get(cache);

  if (current) {
    return current as PliteWidgetStore<YjsRemoteCursorWidgetData<TCursorData>>;
  }

  const store = createYjsCursorWidgetStore(editor, cache);

  stores.set(cache, store);

  return store;
};
