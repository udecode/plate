import type { Range, RuntimeId, Editor as PliteEditor } from '@platejs/plite';
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

export type PliteDecoration<T = unknown> = PliteProjection<T>;

export type PliteRangeDecoration<T = unknown> =
  | Range
  | {
      data?: T;
      key?: string;
      range: Range;
    };

export type PliteDecorationSourceReadContext =
  PliteProjectionSourceReadContext & {
    editor: PliteEditor;
  };

export type PliteDecorationSourceOptions<T = unknown> = Omit<
  PliteProjectionStoreOptions,
  'sourceId'
> & {
  id: string;
  read: (
    context: PliteDecorationSourceReadContext
  ) => readonly PliteDecoration<T>[];
};

export type PliteRangeDecorationSourceOptions<T = unknown> = Omit<
  PliteDecorationSourceOptions<T>,
  'read'
> & {
  /**
   * Data attached to every range that does not provide its own data.
   */
  data?: T;
  read: (
    context: PliteDecorationSourceReadContext
  ) => readonly PliteRangeDecoration<T>[];
};

export type PliteDecorationSource<T = unknown> = {
  destroy: () => void;
  getMetrics: () => PliteProjectionStoreMetrics;
  getRuntimeSnapshot: (
    runtimeId: RuntimeId
  ) => readonly PliteProjectionSlice<T>[];
  getSnapshot: () => Readonly<
    Record<RuntimeId, readonly PliteProjectionSlice<T>[]>
  >;
  id: string;
  refresh: (
    options?: PliteProjectionStoreRefreshOptions
  ) => PliteProjectionRefreshResult;
  subscribe: (listener: () => void) => () => void;
  subscribeProjectionRefresh: (
    listener: PliteProjectionRefreshListener
  ) => () => void;
  subscribeRuntimeId: (
    runtimeId: RuntimeId,
    listener: () => void
  ) => () => void;
  subscribeSourceId: (sourceId: string, listener: () => void) => () => void;
};

export type PliteOverlayProjectionStore<T = unknown> = {
  getRuntimeSnapshot?: (
    runtimeId: RuntimeId
  ) => readonly PliteProjectionSlice<T>[];
  getSnapshot: () => Readonly<
    Record<RuntimeId, readonly PliteProjectionSlice<T>[]>
  >;
  refresh?: (
    options?: PliteProjectionStoreRefreshOptions
  ) => PliteProjectionRefreshResult;
  subscribe: (listener: () => void) => () => void;
  subscribeProjectionRefresh?: (
    listener: PliteProjectionRefreshListener
  ) => () => void;
  subscribeRuntimeId?: (
    runtimeId: RuntimeId,
    listener: () => void
  ) => () => void;
  subscribeSourceId?: (sourceId: string, listener: () => void) => () => void;
};

const EMPTY_SNAPSHOT = Object.freeze(Object.create(null)) as Readonly<
  Record<RuntimeId, readonly PliteProjectionSlice<unknown>[]>
>;

const EMPTY_RUNTIME_SNAPSHOT = Object.freeze(
  []
) as readonly PliteProjectionSlice<unknown>[];

const mergeSnapshots = <T>(
  sources: readonly PliteOverlayProjectionStore<T>[]
): Readonly<Record<RuntimeId, readonly PliteProjectionSlice<T>[]>> => {
  if (sources.length === 0) {
    return EMPTY_SNAPSHOT as Readonly<
      Record<RuntimeId, readonly PliteProjectionSlice<T>[]>
    >;
  }

  const merged: Record<RuntimeId, PliteProjectionSlice<T>[]> =
    Object.create(null);

  for (const source of sources) {
    const snapshot = source.getSnapshot();

    for (const [runtimeId, slices] of Object.entries(snapshot)) {
      merged[runtimeId] = [...(merged[runtimeId] ?? []), ...slices];
    }
  }

  const frozen: Record<RuntimeId, readonly PliteProjectionSlice<T>[]> =
    Object.create(null);

  for (const runtimeId of Object.keys(merged)) {
    frozen[runtimeId] = Object.freeze(merged[runtimeId]!);
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
  ranges: readonly PliteRangeDecoration<T>[],
  options: Pick<PliteRangeDecorationSourceOptions<T>, 'data' | 'id'>
): PliteDecoration<T>[] =>
  ranges.map((rangeDecoration, index) => {
    const isRange = RangeApi.isRange(rangeDecoration);
    const range = isRange ? rangeDecoration : rangeDecoration.range;
    const data = isRange
      ? options.data
      : 'data' in rangeDecoration
        ? rangeDecoration.data
        : options.data;

    return {
      data,
      key: isRange
        ? getRangeDecorationKey(options.id, range, index)
        : (rangeDecoration.key ??
          getRangeDecorationKey(options.id, range, index)),
      range,
    };
  });

export const createDecorationSource = <T = unknown>(
  editor: PliteEditor,
  options: PliteDecorationSourceOptions<T>
): PliteDecorationSource<T> => {
  const store = createPliteProjectionStore<T>(
    editor,
    (snapshot, context) => options.read({ ...context, editor, snapshot }),
    {
      dirtiness: options.dirtiness,
      runtimeScope: options.runtimeScope,
      sourceId: options.id,
    }
  );

  return Object.freeze({
    ...store,
    id: options.id,
  });
};

export const createRangeDecorationSource = <T = unknown>(
  editor: PliteEditor,
  options: PliteRangeDecorationSourceOptions<T>
): PliteDecorationSource<T> => {
  const { data, read, ...sourceOptions } = options;

  return createDecorationSource<T>(editor, {
    ...sourceOptions,
    read: (context) =>
      toPliteRangeDecorations(read(context), {
        data,
        id: options.id,
      }),
  });
};

export const composeDecorationSources = <T = unknown>(
  sources: readonly PliteDecorationSource<T>[] | null | undefined
) => composeProjectionSources(sources);

export const composeProjectionSources = <T = unknown>(
  sources: readonly PliteOverlayProjectionStore<T>[] | null | undefined
) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  if (sources.length === 1) {
    return sources[0]!;
  }

  let snapshot = mergeSnapshots(sources);
  const runtimeSnapshots = new Map<
    RuntimeId,
    readonly PliteProjectionSlice<T>[]
  >();

  const invalidate = (listener: () => void) => () => {
    snapshot = mergeSnapshots(sources);
    runtimeSnapshots.clear();
    listener();
  };

  return {
    getRuntimeSnapshot(runtimeId: RuntimeId) {
      const cached = runtimeSnapshots.get(runtimeId);

      if (cached) {
        return cached;
      }

      const slices = sources.flatMap(
        (source) =>
          source.getRuntimeSnapshot?.(runtimeId) ??
          source.getSnapshot()[runtimeId] ??
          []
      );
      const nextSnapshot =
        slices.length === 0
          ? (EMPTY_RUNTIME_SNAPSHOT as readonly PliteProjectionSlice<T>[])
          : Object.freeze(slices);

      runtimeSnapshots.set(runtimeId, nextSnapshot);

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
    subscribeRuntimeId(runtimeId: RuntimeId, listener: () => void) {
      return subscribeAll(sources, (source) =>
        source.subscribeRuntimeId
          ? source.subscribeRuntimeId(runtimeId, invalidate(listener))
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
