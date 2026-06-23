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
} from '@platejs/plite';
import { NodeApi, RangeApi } from '@platejs/plite';
import { Editor, projectRangeInSnapshot } from './editable/runtime-editor-api';
import { recordPliteReactRender } from './render-profiler';

export type PliteRangeProjection<T = unknown> = {
  data?: T;
  key: string;
  range: Range;
};

export type PliteProjection<T = unknown> = PliteRangeProjection<T>;

export type PliteProjectionSlice<T = unknown> = {
  data?: T;
  end: number;
  key: string;
  start: number;
};

export type PliteProjectionEntry<T = unknown> = PliteProjectionSlice<T>;

export type PliteSourceDirtinessClass =
  | 'always'
  | 'selection'
  | 'text'
  | 'mark'
  | 'node'
  | 'annotation'
  | 'external';

export type PliteSourceDirtinessContext = {
  change?: EditorCommit;
  forceInvalidate?: boolean;
  reason: 'annotation' | 'editor' | 'external' | 'refresh';
  requiresDOMSelectionExport?: boolean;
  snapshot: EditorSnapshot;
  sourceId?: string;
};

export type PliteCustomSourceDirtiness = (
  context: PliteSourceDirtinessContext
) => boolean;

export type PliteProjectionRuntimeScope =
  | readonly RuntimeId[]
  | ((context: PliteSourceDirtinessContext) => readonly RuntimeId[] | null);

export type PliteProjectionSourceReadContext = PliteSourceDirtinessContext & {
  runtimeScope: readonly RuntimeId[] | null;
};

export type PliteProjectionSource<T = unknown> = (
  snapshot: EditorSnapshot,
  context: PliteProjectionSourceReadContext
) => readonly PliteProjection<T>[];

export type PliteSourceDirtiness =
  | PliteSourceDirtinessClass
  | readonly PliteSourceDirtinessClass[]
  | PliteCustomSourceDirtiness;

export type PliteProjectionStoreOptions = {
  dirtiness?: PliteSourceDirtiness;
  runtimeScope?: PliteProjectionRuntimeScope;
  sourceId?: string;
};

export type PliteProjectionStoreRefreshOptions = {
  change?: EditorCommit;
  forceInvalidate?: boolean;
  reason?: PliteSourceDirtinessContext['reason'];
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

export type PliteProjectionRefreshResult = Readonly<{
  changedRuntimeIds: readonly RuntimeId[];
  changedSourceId?: string;
  didChange: boolean;
  reason: PliteSourceDirtinessContext['reason'];
  requiresDOMSelectionExport: boolean;
}>;

export type PliteProjectionRefreshListener = (
  result: PliteProjectionRefreshResult
) => void;

export type PliteProjectionStoreSnapshot<T = unknown> = Readonly<
  Record<RuntimeId, readonly PliteProjectionSlice<T>[]>
>;

export type PliteProjectionStoreMetrics = Readonly<{
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

export type PliteProjectionStore<T = unknown> = {
  destroy: () => void;
  getMetrics: () => PliteProjectionStoreMetrics;
  getRuntimeSnapshot: (
    runtimeId: RuntimeId
  ) => readonly PliteProjectionSlice<T>[];
  getSnapshot: () => PliteProjectionStoreSnapshot<T>;
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

const EMPTY_SNAPSHOT = Object.freeze(
  Object.create(null)
) as PliteProjectionStoreSnapshot<unknown>;

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
}) as PliteProjectionStoreMetrics;

const EMPTY_RUNTIME_SNAPSHOT = Object.freeze(
  []
) as readonly PliteProjectionSlice<unknown>[];
const EMPTY_RUNTIME_IDS = Object.freeze([]) as readonly RuntimeId[];

const profileProjectionStorePhase = <T>(id: string, run: () => T): T => {
  if (!globalThis.__PLITE_REACT_RENDER_PROFILER__) {
    return run();
  }

  const startedAt = performance.now();

  try {
    return run();
  } finally {
    recordPliteReactRender({
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
  context: PliteSourceDirtinessContext;
}): PliteProjectionRefreshResult => ({
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
  dirtiness: PliteSourceDirtinessClass
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
  dirtiness: PliteSourceDirtiness | undefined
): readonly EditorCommitSource[] => {
  if (!dirtiness || typeof dirtiness === 'function') {
    return ['commit'];
  }

  const sources = new Set<EditorCommitSource>();
  const entries = isPliteSourceDirtinessList(dirtiness)
    ? dirtiness
    : [dirtiness];

  entries.forEach((entry) => {
    addEditorSourceForDirtinessClass(sources, entry);
  });

  return [...sources];
};

const isPliteSourceDirtinessList = (
  value: PliteSourceDirtiness
): value is readonly PliteSourceDirtinessClass[] => Array.isArray(value);

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
  left: readonly PliteProjectionSlice<T>[],
  right: readonly PliteProjectionSlice<T>[]
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
  left: PliteProjectionStoreSnapshot,
  right: PliteProjectionStoreSnapshot
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
  dirtiness: PliteSourceDirtinessClass,
  context: PliteSourceDirtinessContext
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

export const isPliteSourceDirty = (
  dirtiness: PliteSourceDirtiness | undefined,
  context: PliteSourceDirtinessContext
) => {
  if (!dirtiness) return true;
  if (typeof dirtiness === 'function') {
    return dirtiness(context);
  }
  if (isPliteSourceDirtinessList(dirtiness)) {
    return dirtiness.some((entry) => matchesDirtinessClass(entry, context));
  }
  return matchesDirtinessClass(dirtiness, context);
};

const getRuntimeScope = (
  runtimeScope: PliteProjectionRuntimeScope | undefined,
  context: PliteSourceDirtinessContext
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
  runtimeScope: PliteProjectionRuntimeScope | undefined,
  context: PliteSourceDirtinessContext
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
  projections: readonly PliteProjection<T>[],
  runtimeScope: readonly RuntimeId[] | null
): {
  invalidRangeDropCount: number;
  projectedRangeCount: number;
  snapshot: PliteProjectionStoreSnapshot<T>;
} => {
  if (projections.length === 0) {
    return {
      invalidRangeDropCount: 0,
      projectedRangeCount: 0,
      snapshot: EMPTY_SNAPSHOT as PliteProjectionStoreSnapshot<T>,
    };
  }

  const projectionByRuntimeId: Record<string, PliteProjectionSlice<T>[]> =
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
    ) as PliteProjectionSlice<T>[];
  });

  return {
    invalidRangeDropCount,
    projectedRangeCount,
    snapshot: Object.freeze(
      projectionByRuntimeId
    ) as PliteProjectionStoreSnapshot<T>,
  };
};

export const createPliteProjectionStore = <T>(
  editor: Editor,
  source: PliteProjectionSource<T>,
  options: PliteProjectionStoreOptions = {}
): PliteProjectionStore<T> => {
  const listeners = new Set<() => void>();
  const runtimeListeners = new Map<RuntimeId, Set<() => void>>();
  const sourceListeners = new Map<string, Set<() => void>>();
  const refreshListeners = new Set<PliteProjectionRefreshListener>();
  let destroyed = false;
  const initialSnapshot = Editor.getSnapshot(editor);
  const initialContext = {
    reason: 'refresh',
    snapshot: initialSnapshot,
    sourceId: options.sourceId,
  } satisfies PliteSourceDirtinessContext;
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
  }) as PliteProjectionStoreMetrics;
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

  const emitProjectionRefresh = (result: PliteProjectionRefreshResult) => {
    if (!result.didChange) {
      return;
    }

    refreshListeners.forEach((listener) => {
      listener(result);
    });
  };

  const recompute = (
    context: PliteSourceDirtinessContext
  ): PliteProjectionRefreshResult => {
    if (!isPliteSourceDirty(options.dirtiness, context)) {
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
          | readonly PliteProjectionSlice<T>[]
          | undefined) ??
        (EMPTY_RUNTIME_SNAPSHOT as readonly PliteProjectionSlice<T>[])
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
