import type { Editor as EditorType, NodeKey, Range, Value } from '..';
import { RangeApi } from '..';
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
  type PliteProjectionStoreSnapshot,
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
  snapshots: ReadonlyArray<PliteProjectionStoreSnapshot<T>>
): Readonly<Record<string, ReadonlyArray<PliteProjectionSlice<T>>>> => {
  if (snapshots.length === 0) {
    return EMPTY_SNAPSHOT as Readonly<
      Record<string, ReadonlyArray<PliteProjectionSlice<T>>>
    >;
  }

  const merged: Record<string, Array<PliteProjectionSlice<T>>> = Object.create(
    null
  );

  for (const snapshot of snapshots) {
    for (const [nodeKey, slices] of Object.entries(snapshot)) {
      merged[nodeKey] ??= [];
      const bucket = merged[nodeKey];
      for (const slice of slices) bucket.push(slice);
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

  let sourceSnapshots:
    | ReadonlyArray<PliteProjectionStoreSnapshot<T>>
    | undefined;
  let snapshot = EMPTY_SNAPSHOT as PliteProjectionStoreSnapshot<T>;
  type CachedInputs = {
    next: WeakMap<ReadonlyArray<PliteProjectionSlice<T>>, CachedInputs>;
    value?: ReadonlyArray<PliteProjectionSlice<T>>;
  };
  const runtimeSnapshots: CachedInputs = { next: new WeakMap() };

  const synchronizeSnapshot = () => {
    const nextSourceSnapshots = sources.map((source) => source.getSnapshot());

    if (
      sourceSnapshots &&
      nextSourceSnapshots.every(
        (nextSnapshot, index) => nextSnapshot === sourceSnapshots?.[index]
      )
    ) {
      return;
    }

    snapshot = mergeSnapshots(nextSourceSnapshots);
    sourceSnapshots = nextSourceSnapshots;
  };

  return {
    getRuntimeSnapshot(nodeKey: NodeKey) {
      const inputs = sources.map((source) => {
        const slices =
          source.getRuntimeSnapshot?.(nodeKey) ??
          source.getSnapshot()[nodeKey] ??
          (EMPTY_RUNTIME_SNAPSHOT as ReadonlyArray<PliteProjectionSlice<T>>);
        return slices.length === 0
          ? (EMPTY_RUNTIME_SNAPSHOT as ReadonlyArray<PliteProjectionSlice<T>>)
          : slices;
      });
      let cached = runtimeSnapshots;
      for (const input of inputs) {
        let next = cached.next.get(input);
        if (!next) {
          next = { next: new WeakMap() };
          cached.next.set(input, next);
        }
        cached = next;
      }
      if (cached.value) return cached.value;
      const slices = inputs.flat();
      const nextSnapshot =
        slices.length === 0
          ? (EMPTY_RUNTIME_SNAPSHOT as ReadonlyArray<PliteProjectionSlice<T>>)
          : Object.freeze(slices);

      // Weak input ownership preserves bucket identity without retaining old node IDs.
      cached.value = nextSnapshot;

      return nextSnapshot;
    },
    getSnapshot() {
      synchronizeSnapshot();
      return snapshot;
    },
    subscribe(listener: () => void) {
      return subscribeAll(sources, (source) => source.subscribe(listener));
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
          ? source.subscribeNodeKey(nodeKey, listener)
          : source.subscribe(listener)
      );
    },
    subscribeSourceId(sourceId: string, listener: () => void) {
      return subscribeAll(sources, (source) =>
        source.subscribeSourceId
          ? source.subscribeSourceId(sourceId, listener)
          : source.subscribe(listener)
      );
    },
  };
};
