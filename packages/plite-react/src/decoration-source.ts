import type {
  Editor as EditorType,
  Range,
  NodeKey,
  Value,
} from '@platejs/plite';
import { RangeApi } from '@platejs/plite';

import {
  createPliteProjectionStore,
  type PliteProjection,
  type PliteProjectionRefreshListener,
  type PliteProjectionRefreshResult,
  type PliteProjectionSlice,
  type PliteProjectionSourceReadContext,
  type PliteProjectionStoreMetrics,
  type PliteProjectionStoreOptions,
  type PliteProjectionStoreRefreshOptions,
} from './projection-store';
import type { PliteViewSourceStatus } from './view-source';

export type PliteDecoration<T = unknown> = PliteProjection<T>;

export type PliteRangeDecoration<T = unknown> =
  | Range
  | {
      data?: T;
      key?: string;
      range: Range;
    };

export type PliteDecorationSourceReadContext<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = PliteProjectionSourceReadContext & {
  editor: EditorType<V, TExtensions>;
};

export type PliteDecorationSourceOptions<
  T = unknown,
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = Omit<PliteProjectionStoreOptions, 'sourceId'> & {
  id: string;
  read: (
    context: PliteDecorationSourceReadContext<V, TExtensions>
  ) => ReadonlyArray<PliteDecoration<T>>;
};

export type PliteRangeDecorationSourceOptions<
  T = unknown,
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = Omit<PliteDecorationSourceOptions<T, V, TExtensions>, 'read'> & {
  /**
   * Data attached to every range that does not provide its own data.
   */
  data?: T;
  read: (
    context: PliteDecorationSourceReadContext<V, TExtensions>
  ) => ReadonlyArray<PliteRangeDecoration<T>>;
};

export type PliteDecorationSource<T = unknown> = {
  destroy: () => void;
  getMetrics: () => PliteProjectionStoreMetrics;
  getSourceStatus: () => PliteViewSourceStatus;
  getRuntimeSnapshot: (
    nodeKey: NodeKey
  ) => ReadonlyArray<PliteProjectionSlice<T>>;
  getSnapshot: () => Readonly<
    Record<string, ReadonlyArray<PliteProjectionSlice<T>>>
  >;
  id: string;
  refresh: (
    options?: PliteProjectionStoreRefreshOptions
  ) => PliteProjectionRefreshResult;
  retry: () => PliteProjectionRefreshResult;
  subscribe: (listener: () => void) => () => void;
  subscribeProjectionRefresh: (
    listener: PliteProjectionRefreshListener
  ) => () => void;
  subscribeNodeKey: (nodeKey: NodeKey, listener: () => void) => () => void;
  subscribeSourceId: (sourceId: string, listener: () => void) => () => void;
};

export type PliteOverlayProjectionStore<T = unknown> = {
  getRuntimeSnapshot?: (
    nodeKey: NodeKey
  ) => ReadonlyArray<PliteProjectionSlice<T>>;
  getSnapshot: () => Readonly<
    Record<string, ReadonlyArray<PliteProjectionSlice<T>>>
  >;
  refresh?: (
    options?: PliteProjectionStoreRefreshOptions
  ) => PliteProjectionRefreshResult;
  subscribe: (listener: () => void) => () => void;
  subscribeProjectionRefresh?: (
    listener: PliteProjectionRefreshListener
  ) => () => void;
  subscribeNodeKey?: (nodeKey: NodeKey, listener: () => void) => () => void;
  subscribeSourceId?: (sourceId: string, listener: () => void) => () => void;
};

const EMPTY_SNAPSHOT = Object.freeze(Object.create(null)) as Readonly<
  Record<string, readonly PliteProjectionSlice[]>
>;

const EMPTY_RUNTIME_SNAPSHOT = Object.freeze(
  []
) as readonly PliteProjectionSlice[];

const mergeSnapshots = <T>(
  sources: ReadonlyArray<PliteOverlayProjectionStore<T>>
): Readonly<Record<string, ReadonlyArray<PliteProjectionSlice<T>>>> => {
  if (sources.length === 0) {
    return EMPTY_SNAPSHOT as Readonly<
      Record<string, ReadonlyArray<PliteProjectionSlice<T>>>
    >;
  }

  const merged: Record<string, Array<PliteProjectionSlice<T>>> = Object.create(
    null
  );

  for (const source of sources) {
    const snapshot = source.getSnapshot();

    for (const [nodeKey, slices] of Object.entries(snapshot)) {
      merged[nodeKey] = [...(merged[nodeKey] ?? []), ...slices];
    }
  }

  const frozen: Record<
    string,
    ReadonlyArray<PliteProjectionSlice<T>>
  > = Object.create(null);

  for (const nodeKey of Object.keys(merged)) {
    frozen[nodeKey] = Object.freeze(merged[nodeKey]);
  }

  return Object.freeze(frozen);
};

const subscribeAll = (
  sources: readonly PliteOverlayProjectionStore[],
  subscribe: (source: PliteOverlayProjectionStore) => () => void
) => {
  const cleanups = sources.map(subscribe);

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
};

const getRangeDecorationKey = (sourceId: string, range: Range, index: number) =>
  `${sourceId}:${range.anchor.path.join('.')}:${range.anchor.offset}:${range.focus.path.join('.')}:${range.focus.offset}:${index}`;

export const toPliteRangeDecorations = <T>(
  ranges: ReadonlyArray<PliteRangeDecoration<T>>,
  options: Pick<PliteRangeDecorationSourceOptions<T>, 'data' | 'id'>
): Array<PliteDecoration<T>> =>
  ranges.map((rangeDecoration, index) => {
    const isRange = RangeApi.isRange(rangeDecoration);
    const sourceRange = isRange ? rangeDecoration : rangeDecoration.range;
    const { anchor, focus, ...inlineData } = sourceRange as Range &
      Record<string, unknown>;
    const range = { anchor, focus };
    const hasInlineData = Object.keys(inlineData).length > 0;
    const data = isRange
      ? hasInlineData
        ? typeof options.data === 'object' &&
          options.data !== null &&
          !Array.isArray(options.data)
          ? { ...options.data, ...inlineData }
          : inlineData
        : options.data
      : 'data' in rangeDecoration
        ? rangeDecoration.data
        : options.data;

    return {
      data: data as T | undefined,
      key: isRange
        ? getRangeDecorationKey(options.id, sourceRange, index)
        : (rangeDecoration.key ??
          getRangeDecorationKey(options.id, sourceRange, index)),
      range,
    };
  });

export const createDecorationSource = <
  V extends Value,
  TExtensions extends readonly unknown[],
  T = unknown,
>(
  editor: EditorType<V, TExtensions>,
  options: PliteDecorationSourceOptions<T, V, TExtensions>
): PliteDecorationSource<T> => {
  const store = createPliteProjectionStore<T>(
    editor,
    (snapshot, context) => options.read({ ...context, editor, snapshot }),
    {
      dirtiness: options.dirtiness,
      onError: options.onError,
      runtimeScope: options.runtimeScope,
      sourceId: options.id,
    }
  );

  return Object.freeze({
    ...store,
    id: options.id,
  });
};

export const createRangeDecorationSource = <
  V extends Value,
  TExtensions extends readonly unknown[],
  T = unknown,
>(
  editor: EditorType<V, TExtensions>,
  options: PliteRangeDecorationSourceOptions<T, V, TExtensions>
): PliteDecorationSource<T> => {
  const { data, read, ...sourceOptions } = options;

  return createDecorationSource<V, TExtensions, T>(editor, {
    ...sourceOptions,
    read: (context) =>
      toPliteRangeDecorations(read(context), {
        data,
        id: options.id,
      }),
  });
};

export const composeDecorationSources = <T = unknown>(
  sources: ReadonlyArray<PliteDecorationSource<T>> | null | undefined
) => composeProjectionSources(sources);

export const composeProjectionSources = <T = unknown>(
  sources: ReadonlyArray<PliteOverlayProjectionStore<T>> | null | undefined
) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  if (sources.length === 1) {
    return sources[0];
  }

  let snapshot = mergeSnapshots(sources);
  const runtimeSnapshots = new Map<
    NodeKey,
    ReadonlyArray<PliteProjectionSlice<T>>
  >();

  const invalidate = (listener: () => void) => () => {
    snapshot = mergeSnapshots(sources);
    runtimeSnapshots.clear();
    listener();
  };

  return {
    getRuntimeSnapshot(nodeKey: NodeKey) {
      const cached = runtimeSnapshots.get(nodeKey);

      if (cached) {
        return cached;
      }

      const slices = sources.flatMap(
        (source) =>
          source.getRuntimeSnapshot?.(nodeKey) ??
          source.getSnapshot()[nodeKey] ??
          []
      );
      const nextSnapshot =
        slices.length === 0
          ? (EMPTY_RUNTIME_SNAPSHOT as ReadonlyArray<PliteProjectionSlice<T>>)
          : Object.freeze(slices);

      runtimeSnapshots.set(nodeKey, nextSnapshot);

      return nextSnapshot;
    },
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener: () => void) {
      return subscribeAll(sources, (source) =>
        source.subscribe(invalidate(listener))
      );
    },
    subscribeProjectionRefresh(listener: PliteProjectionRefreshListener) {
      return subscribeAll(sources, (source) =>
        source.subscribeProjectionRefresh
          ? source.subscribeProjectionRefresh(listener)
          : () => {}
      );
    },
    subscribeNodeKey(nodeKey: NodeKey, listener: () => void) {
      return subscribeAll(sources, (source) =>
        source.subscribeNodeKey
          ? source.subscribeNodeKey(nodeKey, invalidate(listener))
          : source.subscribe(invalidate(listener))
      );
    },
    subscribeSourceId(sourceId: string, listener: () => void) {
      return subscribeAll(sources, (source) =>
        source.subscribeSourceId
          ? source.subscribeSourceId(sourceId, invalidate(listener))
          : source.subscribe(invalidate(listener))
      );
    },
  };
};
