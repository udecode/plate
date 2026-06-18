import type {
  Descendant,
  EditorCommit,
  EditorCommitSource,
  EditorSnapshot,
  Path,
  Point,
  ProjectedRangeSegment,
  Range,
  RuntimeId,
} from '@platejs/slate';
import { NodeApi, RangeApi } from '@platejs/slate';
import { Editor, projectRangeInSnapshot } from './editable/runtime-editor-api';
import { recordSlateReactRender } from './render-profiler';

export type SlateRangeProjection<T = unknown> = {
  data?: T;
  key: string;
  range: Range;
};

export type SlateProjection<T = unknown> = SlateRangeProjection<T>;

export type SlateProjectionSlice<T = unknown> = {
  data?: T;
  end: number;
  key: string;
  start: number;
};

export type SlateProjectionEntry<T = unknown> = SlateProjectionSlice<T>;

export type SlateSourceDirtinessClass =
  | 'always'
  | 'selection'
  | 'text'
  | 'mark'
  | 'node'
  | 'annotation'
  | 'external';

export type SlateSourceDirtinessContext = {
  change?: EditorCommit;
  forceInvalidate?: boolean;
  reason: 'annotation' | 'editor' | 'external' | 'refresh';
  requiresDOMSelectionExport?: boolean;
  snapshot: EditorSnapshot;
  sourceId?: string;
};

export type SlateCustomSourceDirtiness = (
  context: SlateSourceDirtinessContext
) => boolean;

export type SlateProjectionRuntimeScope =
  | readonly RuntimeId[]
  | ((context: SlateSourceDirtinessContext) => readonly RuntimeId[] | null);

export type SlateProjectionSourceReadContext = SlateSourceDirtinessContext & {
  runtimeScope: readonly RuntimeId[] | null;
};

export type SlateProjectionSource<T = unknown> = (
  snapshot: EditorSnapshot,
  context: SlateProjectionSourceReadContext
) => readonly SlateProjection<T>[];

export type SlateSourceDirtiness =
  | SlateSourceDirtinessClass
  | readonly SlateSourceDirtinessClass[]
  | SlateCustomSourceDirtiness;

export type SlateProjectionStoreOptions = {
  dirtiness?: SlateSourceDirtiness;
  runtimeScope?: SlateProjectionRuntimeScope;
  sourceId?: string;
};

export type SlateProjectionStoreRefreshOptions = {
  change?: EditorCommit;
  forceInvalidate?: boolean;
  reason?: SlateSourceDirtinessContext['reason'];
  /**
   * Request an Editable repair after a projection refresh that changes DOM
   * materialization around the model selection.
   *
   * Decoration-only refreshes should leave this unset so overlay updates stay
   * local to subscribed text runtimes.
   */
  requiresDOMSelectionExport?: boolean;
  sourceId?: string;
};

export type SlateProjectionRefreshResult = Readonly<{
  changedRuntimeIds: readonly RuntimeId[];
  changedSourceId?: string;
  didChange: boolean;
  reason: SlateSourceDirtinessContext['reason'];
  requiresDOMSelectionExport: boolean;
}>;

export type SlateProjectionRefreshListener = (
  result: SlateProjectionRefreshResult
) => void;

export type SlateProjectionStoreSnapshot<T = unknown> = Readonly<
  Record<RuntimeId, readonly SlateProjectionSlice<T>[]>
>;

export type SlateProjectionStoreMetrics = Readonly<{
  changedRuntimeBucketCount: number;
  fullFallbackCount: number;
  globalSubscriberWakeCount: number;
  invalidRangeDropCount: number;
  projectedRangeCount: number;
  recomputeCount: number;
  runtimeSubscriberWakeCount: number;
  sourceReadCount: number;
  sourceSubscriberWakeCount: number;
}>;

export type SlateProjectionStore<T = unknown> = {
  destroy: () => void;
  getMetrics: () => SlateProjectionStoreMetrics;
  getRuntimeSnapshot: (
    runtimeId: RuntimeId
  ) => readonly SlateProjectionSlice<T>[];
  getSnapshot: () => SlateProjectionStoreSnapshot<T>;
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

const EMPTY_SNAPSHOT = Object.freeze(
  Object.create(null)
) as SlateProjectionStoreSnapshot<unknown>;

const EMPTY_METRICS = Object.freeze({
  changedRuntimeBucketCount: 0,
  fullFallbackCount: 0,
  globalSubscriberWakeCount: 0,
  invalidRangeDropCount: 0,
  projectedRangeCount: 0,
  recomputeCount: 0,
  runtimeSubscriberWakeCount: 0,
  sourceReadCount: 0,
  sourceSubscriberWakeCount: 0,
}) as SlateProjectionStoreMetrics;

const EMPTY_RUNTIME_SNAPSHOT = Object.freeze(
  []
) as readonly SlateProjectionSlice<unknown>[];
const EMPTY_RUNTIME_IDS = Object.freeze([]) as readonly RuntimeId[];

const profileProjectionStorePhase = <T>(id: string, run: () => T): T => {
  if (!globalThis.__SLATE_REACT_RENDER_PROFILER__) {
    return run();
  }

  const startedAt = performance.now();

  try {
    return run();
  } finally {
    recordSlateReactRender({
      duration: performance.now() - startedAt,
      id,
      kind: 'runtime-time',
    });
  }
};

const createProjectionRefreshResult = ({
  changedRuntimeIds,
  context,
}: {
  changedRuntimeIds: readonly RuntimeId[];
  context: SlateSourceDirtinessContext;
}): SlateProjectionRefreshResult => ({
  changedRuntimeIds,
  ...(context.sourceId ? { changedSourceId: context.sourceId } : {}),
  didChange: changedRuntimeIds.length > 0,
  reason: context.reason,
  requiresDOMSelectionExport:
    context.requiresDOMSelectionExport === true && changedRuntimeIds.length > 0,
});

const INVALID_PROJECTION_RANGE_ERROR =
  /Cannot project a range outside the committed snapshot|Point offset .* is outside text bounds/;

const addEditorSourceForDirtinessClass = (
  sources: Set<EditorCommitSource>,
  dirtiness: SlateSourceDirtinessClass
) => {
  switch (dirtiness) {
    case 'always':
    case 'mark':
      sources.add('commit');
      break;
    case 'selection':
      sources.add('selection');
      break;
    case 'text':
      sources.add('text');
      break;
    case 'node':
      sources.add('node');
      break;
  }
};

const getEditorSourcesForDirtiness = (
  dirtiness: SlateSourceDirtiness | undefined
): readonly EditorCommitSource[] => {
  if (!dirtiness || typeof dirtiness === 'function') {
    return ['commit'];
  }

  const sources = new Set<EditorCommitSource>();
  const entries = isSlateSourceDirtinessList(dirtiness)
    ? dirtiness
    : [dirtiness];

  entries.forEach((entry) => {
    addEditorSourceForDirtinessClass(sources, entry);
  });

  return [...sources];
};

const isSlateSourceDirtinessList = (
  value: SlateSourceDirtiness
): value is readonly SlateSourceDirtinessClass[] => Array.isArray(value);

const isPlainObject = (value: object) => {
  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
};

const isJsonComparable = (
  value: unknown,
  seen = new WeakSet<object>()
): boolean => {
  if (value === null) return true;

  switch (typeof value) {
    case 'boolean':
    case 'string':
      return true;
    case 'number':
      return Number.isFinite(value);
    case 'object': {
      if (seen.has(value)) return false;
      if (Array.isArray(value)) {
        seen.add(value);

        return value.every((entry) => isJsonComparable(entry, seen));
      }
      if (!isPlainObject(value)) return false;

      seen.add(value);

      return Object.values(value).every((entry) =>
        isJsonComparable(entry, seen)
      );
    }
    default:
      return false;
  }
};

const areDataEqual = (left: unknown, right: unknown) => {
  if (Object.is(left, right)) return true;
  if (!isJsonComparable(left) || !isJsonComparable(right)) return false;

  return JSON.stringify(left) === JSON.stringify(right);
};

const areSlicesEqual = <T>(
  left: readonly SlateProjectionSlice<T>[],
  right: readonly SlateProjectionSlice<T>[]
) =>
  left.length === right.length &&
  left.every((slice, index) => {
    const other = right[index];

    return Boolean(
      other &&
        slice.key === other.key &&
        slice.start === other.start &&
        slice.end === other.end &&
        areDataEqual(slice.data, other.data)
    );
  });

const getChangedRuntimeIds = (
  left: SlateProjectionStoreSnapshot,
  right: SlateProjectionStoreSnapshot
) => {
  const runtimeIds = new Set([...Object.keys(left), ...Object.keys(right)]);
  const changedRuntimeIds: RuntimeId[] = [];

  for (const runtimeId of runtimeIds) {
    if (!areSlicesEqual(left[runtimeId] ?? [], right[runtimeId] ?? [])) {
      changedRuntimeIds.push(runtimeId);
    }
  }

  return changedRuntimeIds;
};

const matchesDirtinessClass = (
  dirtiness: SlateSourceDirtinessClass,
  context: SlateSourceDirtinessContext
) => {
  if (dirtiness === 'always') return true;
  if (!context.change) return true;

  switch (dirtiness) {
    case 'selection':
      return context.change.selectionChanged;
    case 'text':
      return context.change.classes.includes('text');
    case 'mark':
      return context.change.classes.includes('mark');
    case 'node':
      return context.change.childrenChanged;
    case 'annotation':
      return context.reason === 'annotation';
    case 'external':
      return context.reason === 'external' || context.reason === 'refresh';
    default:
      return true;
  }
};

export const isSlateSourceDirty = (
  dirtiness: SlateSourceDirtiness | undefined,
  context: SlateSourceDirtinessContext
) => {
  if (!dirtiness) return true;
  if (typeof dirtiness === 'function') {
    return dirtiness(context);
  }
  if (isSlateSourceDirtinessList(dirtiness)) {
    return dirtiness.some((entry) => matchesDirtinessClass(entry, context));
  }
  return matchesDirtinessClass(dirtiness, context);
};

const getRuntimeScope = (
  runtimeScope: SlateProjectionRuntimeScope | undefined,
  context: SlateSourceDirtinessContext
) => {
  if (!runtimeScope) {
    return null;
  }

  return typeof runtimeScope === 'function'
    ? runtimeScope(context)
    : runtimeScope;
};

const getPathKey = (path: Path) => path.join('.');

const getDescendantAtPath = (
  children: readonly Descendant[],
  path: Path
): Descendant | null => {
  if (path.length === 0) {
    return null;
  }

  let node: Descendant | null = children[path[0]!] ?? null;

  for (const index of path.slice(1)) {
    if (!node || !NodeApi.isElement(node)) {
      return null;
    }

    node = node.children[index] ?? null;
  }

  return node;
};

const getBoundaryPoint = (
  node: Descendant,
  path: Path,
  edge: 'end' | 'start'
): Point | null => {
  if (NodeApi.isText(node)) {
    return {
      offset: edge === 'start' ? 0 : node.text.length,
      path: [...path],
    };
  }

  const indexes =
    edge === 'start'
      ? node.children.keys()
      : [...node.children.keys()].reverse();

  for (const index of indexes) {
    const child = node.children[index];
    const point = child && getBoundaryPoint(child, path.concat(index), edge);

    if (point) {
      return point;
    }
  }

  return null;
};

const getScopedNodeRange = (
  snapshot: EditorSnapshot,
  path: Path
): Range | null => {
  const node = getDescendantAtPath(snapshot.children, path);

  if (!node) {
    return null;
  }

  const anchor = getBoundaryPoint(node, path, 'start');
  const focus = getBoundaryPoint(node, path, 'end');

  return anchor && focus ? { anchor, focus } : null;
};

const getScopedProjectionRanges = (
  snapshot: EditorSnapshot,
  range: Range,
  runtimeScope: readonly RuntimeId[] | null
): readonly Range[] => {
  if (!runtimeScope) {
    return [range];
  }

  const ranges: Range[] = [];
  const visitedRangeKeys = new Set<string>();
  const visitedPathKeys = new Set<string>();
  const addScopedPath = (path: Path) => {
    const pathKey = getPathKey(path);

    if (visitedPathKeys.has(pathKey)) {
      return;
    }

    visitedPathKeys.add(pathKey);

    const scopedRange = getScopedNodeRange(snapshot, path);
    const intersection = scopedRange
      ? RangeApi.intersection(range, scopedRange)
      : null;

    if (!intersection) {
      return;
    }

    const rangeKey = `${getPathKey(intersection.anchor.path)}:${intersection.anchor.offset}->${getPathKey(intersection.focus.path)}:${intersection.focus.offset}`;

    if (visitedRangeKeys.has(rangeKey)) {
      return;
    }

    visitedRangeKeys.add(rangeKey);
    ranges.push(intersection);
  };

  runtimeScope.forEach((runtimeId) => {
    const path = snapshot.index.idToPath[runtimeId];

    if (!path) {
      return;
    }

    addScopedPath(path);
  });

  [range.anchor, range.focus].forEach((point) => {
    const topLevelIndex = point.path[0];

    if (typeof topLevelIndex === 'number') {
      addScopedPath([topLevelIndex] as Path);
    }
  });

  return ranges;
};

const isRuntimeScopeDirty = (
  runtimeScope: SlateProjectionRuntimeScope | undefined,
  context: SlateSourceDirtinessContext
) => {
  const decorationImpactRuntimeIds = context.change?.decorationImpactRuntimeIds;

  if (!decorationImpactRuntimeIds) {
    return true;
  }

  const scopedRuntimeIds = getRuntimeScope(runtimeScope, context);

  if (!scopedRuntimeIds) {
    return true;
  }

  const impactedRuntimeIds = new Set(decorationImpactRuntimeIds);

  return scopedRuntimeIds.some((runtimeId) =>
    impactedRuntimeIds.has(runtimeId)
  );
};

const buildProjectionSnapshot = <T>(
  snapshot: EditorSnapshot,
  projections: readonly SlateProjection<T>[],
  runtimeScope: readonly RuntimeId[] | null
): {
  invalidRangeDropCount: number;
  projectedRangeCount: number;
  snapshot: SlateProjectionStoreSnapshot<T>;
} => {
  if (projections.length === 0) {
    return {
      invalidRangeDropCount: 0,
      projectedRangeCount: 0,
      snapshot: EMPTY_SNAPSHOT as SlateProjectionStoreSnapshot<T>,
    };
  }

  const projectionByRuntimeId: Record<string, SlateProjectionSlice<T>[]> =
    Object.create(null);
  let invalidRangeDropCount = 0;
  let projectedRangeCount = 0;

  projections.forEach((projection) => {
    try {
      const scopedRanges = getScopedProjectionRanges(
        snapshot,
        projection.range,
        runtimeScope
      );
      const segments = scopedRanges.flatMap<ProjectedRangeSegment>(
        (scopedRange) => [...projectRangeInSnapshot(snapshot, scopedRange)]
      );
      projectedRangeCount += scopedRanges.length;

      segments.forEach((segment) => {
        const entries = projectionByRuntimeId[segment.runtimeId] ?? [];
        entries.push({
          data: projection.data,
          end: segment.end,
          key: projection.key,
          start: segment.start,
        });
        projectionByRuntimeId[segment.runtimeId] = entries;
      });
    } catch (error) {
      if (
        error instanceof Error &&
        INVALID_PROJECTION_RANGE_ERROR.test(error.message)
      ) {
        invalidRangeDropCount += 1;
        return;
      }

      throw error;
    }
  });

  Object.keys(projectionByRuntimeId).forEach((runtimeId) => {
    projectionByRuntimeId[runtimeId] = Object.freeze(
      projectionByRuntimeId[runtimeId]!
    ) as SlateProjectionSlice<T>[];
  });

  return {
    invalidRangeDropCount,
    projectedRangeCount,
    snapshot: Object.freeze(
      projectionByRuntimeId
    ) as SlateProjectionStoreSnapshot<T>,
  };
};

export const createSlateProjectionStore = <T>(
  editor: Editor,
  source: SlateProjectionSource<T>,
  options: SlateProjectionStoreOptions = {}
): SlateProjectionStore<T> => {
  const listeners = new Set<() => void>();
  const runtimeListeners = new Map<RuntimeId, Set<() => void>>();
  const sourceListeners = new Map<string, Set<() => void>>();
  const refreshListeners = new Set<SlateProjectionRefreshListener>();
  let destroyed = false;
  const initialSnapshot = Editor.getSnapshot(editor);
  const initialContext = {
    reason: 'refresh',
    snapshot: initialSnapshot,
    sourceId: options.sourceId,
  } satisfies SlateSourceDirtinessContext;
  const initialRuntimeScope = getRuntimeScope(
    options.runtimeScope,
    initialContext
  );
  const initialBuild = buildProjectionSnapshot(
    initialSnapshot,
    source(initialSnapshot, {
      ...initialContext,
      runtimeScope: initialRuntimeScope,
    }),
    initialRuntimeScope
  );
  let metrics = Object.freeze({
    ...EMPTY_METRICS,
    invalidRangeDropCount: initialBuild.invalidRangeDropCount,
    projectedRangeCount: initialBuild.projectedRangeCount,
    sourceReadCount: 1,
  }) as SlateProjectionStoreMetrics;
  let snapshot = initialBuild.snapshot;
  const sourceProfileId = options.sourceId
    ? `projection-store.source-read:${options.sourceId}`
    : 'projection-store.source-read';
  const buildProfileId = options.sourceId
    ? `projection-store.build-snapshot:${options.sourceId}`
    : 'projection-store.build-snapshot';
  const diffProfileId = options.sourceId
    ? `projection-store.diff-runtime-ids:${options.sourceId}`
    : 'projection-store.diff-runtime-ids';
  const notifyProfileId = options.sourceId
    ? `projection-store.notify:${options.sourceId}`
    : 'projection-store.notify';

  const emitProjectionRefresh = (result: SlateProjectionRefreshResult) => {
    if (!result.didChange) {
      return;
    }

    refreshListeners.forEach((listener) => {
      listener(result);
    });
  };

  const recompute = (
    context: SlateSourceDirtinessContext
  ): SlateProjectionRefreshResult => {
    if (!isSlateSourceDirty(options.dirtiness, context)) {
      return createProjectionRefreshResult({
        changedRuntimeIds: EMPTY_RUNTIME_IDS,
        context,
      });
    }

    if (
      !context.forceInvalidate &&
      !isRuntimeScopeDirty(options.runtimeScope, context)
    ) {
      return createProjectionRefreshResult({
        changedRuntimeIds: EMPTY_RUNTIME_IDS,
        context,
      });
    }

    const runtimeScope = getRuntimeScope(options.runtimeScope, context);
    const projections = profileProjectionStorePhase(sourceProfileId, () =>
      source(context.snapshot, {
        ...context,
        runtimeScope,
      })
    );
    const nextBuild = profileProjectionStorePhase(buildProfileId, () =>
      buildProjectionSnapshot(context.snapshot, projections, runtimeScope)
    );
    const nextSnapshot = nextBuild.snapshot;
    const fullFallbackCount = context.forceInvalidate || !runtimeScope ? 1 : 0;

    metrics = Object.freeze({
      ...metrics,
      fullFallbackCount: metrics.fullFallbackCount + fullFallbackCount,
      invalidRangeDropCount:
        metrics.invalidRangeDropCount + nextBuild.invalidRangeDropCount,
      projectedRangeCount:
        metrics.projectedRangeCount + nextBuild.projectedRangeCount,
      sourceReadCount: metrics.sourceReadCount + 1,
    });

    const changedRuntimeIds = profileProjectionStorePhase(diffProfileId, () =>
      context.forceInvalidate
        ? Array.from(
            new Set([
              ...Object.keys(snapshot),
              ...Object.keys(nextSnapshot),
              ...runtimeListeners.keys(),
            ])
          )
        : getChangedRuntimeIds(snapshot, nextSnapshot)
    );

    if (changedRuntimeIds.length === 0) {
      return createProjectionRefreshResult({
        changedRuntimeIds,
        context,
      });
    }

    const runtimeSubscriberWakeCount = changedRuntimeIds.reduce(
      (count, runtimeId) =>
        count + (runtimeListeners.get(runtimeId)?.size ?? 0),
      0
    );
    const sourceSubscriberWakeCount = options.sourceId
      ? (sourceListeners.get(options.sourceId)?.size ?? 0)
      : 0;

    snapshot = nextSnapshot;
    metrics = Object.freeze({
      ...metrics,
      changedRuntimeBucketCount:
        metrics.changedRuntimeBucketCount + changedRuntimeIds.length,
      globalSubscriberWakeCount:
        metrics.globalSubscriberWakeCount + listeners.size,
      recomputeCount: metrics.recomputeCount + 1,
      runtimeSubscriberWakeCount:
        metrics.runtimeSubscriberWakeCount + runtimeSubscriberWakeCount,
      sourceSubscriberWakeCount:
        metrics.sourceSubscriberWakeCount + sourceSubscriberWakeCount,
    });
    profileProjectionStorePhase(notifyProfileId, () => {
      listeners.forEach((listener) => {
        listener();
      });
      changedRuntimeIds.forEach((runtimeId) => {
        runtimeListeners.get(runtimeId)?.forEach((listener) => {
          listener();
        });
      });
      if (options.sourceId) {
        sourceListeners.get(options.sourceId)?.forEach((listener) => {
          listener();
        });
      }
    });

    const result = createProjectionRefreshResult({
      changedRuntimeIds,
      context,
    });

    emitProjectionRefresh(result);

    return result;
  };

  const unsubscribeEditorSources = getEditorSourcesForDirtiness(
    options.dirtiness
  ).map((editorSource) =>
    Editor.subscribeSource(
      editor,
      editorSource,
      (nextSnapshot: EditorSnapshot, change?: EditorCommit) => {
        recompute({
          change,
          reason: 'editor',
          snapshot: nextSnapshot,
          sourceId: options.sourceId,
        });
      }
    )
  );
  const unsubscribe = () => {
    unsubscribeEditorSources.forEach((unsubscribeEditorSource) => {
      unsubscribeEditorSource();
    });
  };

  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      listeners.clear();
      runtimeListeners.clear();
      sourceListeners.clear();
      refreshListeners.clear();
      unsubscribe();
    },
    getMetrics() {
      return metrics;
    },
    getRuntimeSnapshot(runtimeId) {
      return (
        (snapshot[runtimeId] as
          | readonly SlateProjectionSlice<T>[]
          | undefined) ??
        (EMPTY_RUNTIME_SNAPSHOT as readonly SlateProjectionSlice<T>[])
      );
    },
    getSnapshot() {
      return snapshot;
    },
    refresh(refreshOptions = {}) {
      if (
        refreshOptions.sourceId &&
        refreshOptions.sourceId !== options.sourceId
      ) {
        return createProjectionRefreshResult({
          changedRuntimeIds: EMPTY_RUNTIME_IDS,
          context: {
            change: refreshOptions.change,
            forceInvalidate: refreshOptions.forceInvalidate,
            reason: refreshOptions.reason ?? 'refresh',
            requiresDOMSelectionExport:
              refreshOptions.requiresDOMSelectionExport,
            snapshot: Editor.getSnapshot(editor),
          },
        });
      }

      return recompute({
        change: refreshOptions.change,
        forceInvalidate: refreshOptions.forceInvalidate,
        reason: refreshOptions.reason ?? 'refresh',
        requiresDOMSelectionExport: refreshOptions.requiresDOMSelectionExport,
        snapshot: Editor.getSnapshot(editor),
        sourceId: options.sourceId,
      });
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    subscribeProjectionRefresh(listener) {
      refreshListeners.add(listener);
      return () => {
        refreshListeners.delete(listener);
      };
    },
    subscribeRuntimeId(runtimeId, listener) {
      const listenersForRuntimeId =
        runtimeListeners.get(runtimeId) ?? new Set();
      listenersForRuntimeId.add(listener);
      runtimeListeners.set(runtimeId, listenersForRuntimeId);

      return () => {
        listenersForRuntimeId.delete(listener);
        if (listenersForRuntimeId.size === 0) {
          runtimeListeners.delete(runtimeId);
        }
      };
    },
    subscribeSourceId(sourceId, listener) {
      const listenersForSourceId = sourceListeners.get(sourceId) ?? new Set();
      listenersForSourceId.add(listener);
      sourceListeners.set(sourceId, listenersForSourceId);

      return () => {
        listenersForSourceId.delete(listener);
        if (listenersForSourceId.size === 0) {
          sourceListeners.delete(sourceId);
        }
      };
    },
  };
};
