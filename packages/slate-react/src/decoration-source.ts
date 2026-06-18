import type { Range, RuntimeId, Editor as SlateEditor } from '@platejs/slate';
import { RangeApi } from '@platejs/slate';

import {
  createSlateProjectionStore,
  type SlateProjection,
  type SlateProjectionRefreshListener,
  type SlateProjectionRefreshResult,
  type SlateProjectionSlice,
  type SlateProjectionSourceReadContext,
  type SlateProjectionStoreMetrics,
  type SlateProjectionStoreOptions,
  type SlateProjectionStoreRefreshOptions,
} from './projection-store';

export type SlateDecoration<T = unknown> = SlateProjection<T>;

export type SlateRangeDecoration<T = unknown> =
  | Range
  | {
      data?: T;
      key?: string;
      range: Range;
    };

export type SlateDecorationSourceReadContext =
  SlateProjectionSourceReadContext & {
    editor: SlateEditor;
  };

export type SlateDecorationSourceOptions<T = unknown> = Omit<
  SlateProjectionStoreOptions,
  'sourceId'
> & {
  id: string;
  read: (
    context: SlateDecorationSourceReadContext
  ) => readonly SlateDecoration<T>[];
};

export type SlateRangeDecorationSourceOptions<T = unknown> = Omit<
  SlateDecorationSourceOptions<T>,
  'read'
> & {
  /**
   * Data attached to every range that does not provide its own data.
   */
  data?: T;
  read: (
    context: SlateDecorationSourceReadContext
  ) => readonly SlateRangeDecoration<T>[];
};

export type SlateDecorationSource<T = unknown> = {
  destroy: () => void;
  getMetrics: () => SlateProjectionStoreMetrics;
  getRuntimeSnapshot: (
    runtimeId: RuntimeId
  ) => readonly SlateProjectionSlice<T>[];
  getSnapshot: () => Readonly<
    Record<RuntimeId, readonly SlateProjectionSlice<T>[]>
  >;
  id: string;
  refresh: (
    options?: SlateProjectionStoreRefreshOptions
  ) => SlateProjectionRefreshResult;
  subscribe: (listener: () => void) => () => void;
  subscribeProjectionRefresh: (
    listener: SlateProjectionRefreshListener
  ) => () => void;
  subscribeRuntimeId: (
    runtimeId: RuntimeId,
    listener: () => void
  ) => () => void;
  subscribeSourceId: (sourceId: string, listener: () => void) => () => void;
};

export type SlateOverlayProjectionStore<T = unknown> = {
  getRuntimeSnapshot?: (
    runtimeId: RuntimeId
  ) => readonly SlateProjectionSlice<T>[];
  getSnapshot: () => Readonly<
    Record<RuntimeId, readonly SlateProjectionSlice<T>[]>
  >;
  refresh?: (
    options?: SlateProjectionStoreRefreshOptions
  ) => SlateProjectionRefreshResult;
  subscribe: (listener: () => void) => () => void;
  subscribeProjectionRefresh?: (
    listener: SlateProjectionRefreshListener
  ) => () => void;
  subscribeRuntimeId?: (
    runtimeId: RuntimeId,
    listener: () => void
  ) => () => void;
  subscribeSourceId?: (sourceId: string, listener: () => void) => () => void;
};

const EMPTY_SNAPSHOT = Object.freeze(Object.create(null)) as Readonly<
  Record<RuntimeId, readonly SlateProjectionSlice<unknown>[]>
>;

const EMPTY_RUNTIME_SNAPSHOT = Object.freeze(
  []
) as readonly SlateProjectionSlice<unknown>[];

const mergeSnapshots = <T>(
  sources: readonly SlateOverlayProjectionStore<T>[]
): Readonly<Record<RuntimeId, readonly SlateProjectionSlice<T>[]>> => {
  if (sources.length === 0) {
    return EMPTY_SNAPSHOT as Readonly<
      Record<RuntimeId, readonly SlateProjectionSlice<T>[]>
    >;
  }

  const merged: Record<RuntimeId, SlateProjectionSlice<T>[]> =
    Object.create(null);

  for (const source of sources) {
    const snapshot = source.getSnapshot();

    for (const [runtimeId, slices] of Object.entries(snapshot)) {
      merged[runtimeId] = [...(merged[runtimeId] ?? []), ...slices];
    }
  }

  const frozen: Record<RuntimeId, readonly SlateProjectionSlice<T>[]> =
    Object.create(null);

  for (const runtimeId of Object.keys(merged)) {
    frozen[runtimeId] = Object.freeze(merged[runtimeId]!);
  }

  return Object.freeze(frozen);
};

const subscribeAll = (
  sources: readonly SlateOverlayProjectionStore[],
  subscribe: (source: SlateOverlayProjectionStore) => () => void
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

export const toSlateRangeDecorations = <T>(
  ranges: readonly SlateRangeDecoration<T>[],
  options: Pick<SlateRangeDecorationSourceOptions<T>, 'data' | 'id'>
): SlateDecoration<T>[] =>
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
  editor: SlateEditor,
  options: SlateDecorationSourceOptions<T>
): SlateDecorationSource<T> => {
  const store = createSlateProjectionStore<T>(
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
  editor: SlateEditor,
  options: SlateRangeDecorationSourceOptions<T>
): SlateDecorationSource<T> => {
  const { data, read, ...sourceOptions } = options;

  return createDecorationSource<T>(editor, {
    ...sourceOptions,
    read: (context) =>
      toSlateRangeDecorations(read(context), {
        data,
        id: options.id,
      }),
  });
};

export const composeDecorationSources = <T = unknown>(
  sources: readonly SlateDecorationSource<T>[] | null | undefined
) => composeProjectionSources(sources);

export const composeProjectionSources = <T = unknown>(
  sources: readonly SlateOverlayProjectionStore<T>[] | null | undefined
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
    readonly SlateProjectionSlice<T>[]
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
          ? (EMPTY_RUNTIME_SNAPSHOT as readonly SlateProjectionSlice<T>[])
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
    subscribeProjectionRefresh(listener: SlateProjectionRefreshListener) {
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
