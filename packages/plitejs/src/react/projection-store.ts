import type {
  Descendant,
  EditorCommit,
  EditorCommitSource,
  EditorSnapshot,
  NodeKey,
  Path,
  Point,
  ProjectedRangeSegment,
  Range,
} from '..';
import { NodeApi, RangeApi } from '..';
import {
  type Editor,
  getSnapshot as editorGetSnapshot,
  subscribeSource as editorSubscribeSource,
  failInvariant,
  projectRangeInSnapshot,
} from './editable/runtime-editor-api';
import { readKeyedProjectionDelta } from './keyed-projection-delta';
import {
  areMappedViewDataEqual,
  createMappedViewStoreKernel,
  createViewSourceFaultBoundary,
} from './mapped-view-store';
import { recordPliteReactRender } from './render-profiler';
import { createStableIdMappedSource } from './stable-id-mapped-source';
import type {
  PliteViewSourceErrorSink,
  PliteViewSourceStatus,
} from './view-source';

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
  | readonly NodeKey[]
  | ((context: PliteSourceDirtinessContext) => readonly NodeKey[] | null);

export type PliteProjectionSourceReadContext = PliteSourceDirtinessContext & {
  runtimeScope: readonly NodeKey[] | null;
};

export type PliteProjectionSource<T = unknown> = (
  snapshot: EditorSnapshot,
  context: PliteProjectionSourceReadContext
) => ReadonlyArray<PliteProjection<T>>;

export type PliteSourceDirtiness =
  | PliteSourceDirtinessClass
  | readonly PliteSourceDirtinessClass[]
  | PliteCustomSourceDirtiness;

export type PliteProjectionStoreOptions = {
  dirtiness?: PliteSourceDirtiness;
  onError?: PliteViewSourceErrorSink;
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
  changedNodeKeys: readonly NodeKey[];
  changedSourceId?: string;
  didChange: boolean;
  reason: PliteSourceDirtinessContext['reason'];
  requiresDOMSelectionExport: boolean;
}>;

export type PliteProjectionRefreshListener = (
  result: PliteProjectionRefreshResult
) => void;

export type PliteProjectionStoreSnapshot<T = unknown> = Readonly<
  Record<string, ReadonlyArray<PliteProjectionSlice<T>>>
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

export type CompiledProjectionStore<T = unknown> = {
  destroy: () => void;
  getMetrics: () => PliteProjectionStoreMetrics;
  getSourceStatus: () => PliteViewSourceStatus;
  getRuntimeSnapshot: (
    nodeKey: NodeKey
  ) => ReadonlyArray<PliteProjectionSlice<T>>;
  getSnapshot: () => PliteProjectionStoreSnapshot<T>;
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
) as readonly PliteProjectionSlice[];
const EMPTY_RUNTIME_IDS = Object.freeze([]) as readonly NodeKey[];

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
  changedNodeKeys,
  context,
}: {
  changedNodeKeys: readonly NodeKey[];
  context: PliteSourceDirtinessContext;
}): PliteProjectionRefreshResult => ({
  changedNodeKeys,
  ...(context.sourceId ? { changedSourceId: context.sourceId } : {}),
  didChange: changedNodeKeys.length > 0,
  reason: context.reason,
  requiresDOMSelectionExport:
    context.requiresDOMSelectionExport === true && changedNodeKeys.length > 0,
});

const INVALID_PROJECTION_RANGE_ERROR =
  /Cannot project a range outside the committed snapshot|Point offset .* is outside text bounds/;

const addEditorSourceForDirtinessClass = (
  sources: Set<EditorCommitSource>,
  dirtiness: PliteSourceDirtinessClass
) => {
  switch (dirtiness) {
    case 'always':
    case 'mark': {
      sources.add('commit');
      break;
    }
    case 'selection': {
      sources.add('selection');
      break;
    }
    case 'text': {
      sources.add('text');
      break;
    }
    case 'node': {
      sources.add('node');
      break;
    }
    case 'annotation':
    case 'external': {
      break;
    }
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

const areSlicesEqual = <T>(
  left: PliteProjectionSlice<T>,
  right: PliteProjectionSlice<T>
) =>
  left.key === right.key &&
  left.start === right.start &&
  left.end === right.end &&
  areMappedViewDataEqual(left.data, right.data);

const areProjectionInputsEqual = <T>(
  left: PliteProjection<T>,
  right: PliteProjection<T>
) =>
  left.key === right.key &&
  RangeApi.equals(left.range, right.range) &&
  areMappedViewDataEqual(left.data, right.data);

const matchesDirtinessClass = (
  dirtiness: PliteSourceDirtinessClass,
  context: PliteSourceDirtinessContext
) => {
  if (dirtiness === 'always') return true;
  if (!context.change) return true;

  switch (dirtiness) {
    case 'selection': {
      return context.change.selectionChanged;
    }
    case 'text': {
      return context.change.changed.hasAny('text');
    }
    case 'mark': {
      return context.change.changed.hasAny('marks');
    }
    case 'node': {
      return context.change.changed.hasAny('document');
    }
    case 'annotation': {
      return context.reason === 'annotation';
    }
    case 'external': {
      return context.reason === 'external' || context.reason === 'refresh';
    }
    default: {
      return true;
    }
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

  let node: Descendant | null = children[path[0]] ?? null;

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
  runtimeScope: readonly NodeKey[] | null
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

  runtimeScope.forEach((nodeKey) => {
    const path = snapshot.index.pathOf(nodeKey);

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
  if (!context.change) {
    return true;
  }

  const scopedNodeKeys = getRuntimeScope(runtimeScope, context);

  if (!scopedNodeKeys) {
    return true;
  }

  return scopedNodeKeys.some((nodeKey) =>
    (
      context.change ?? failInvariant('Expected value to be defined')
    ).changed.hasNodeKey(nodeKey, 'decoration')
  );
};

const mapProjection = <T>(
  snapshot: EditorSnapshot,
  projection: PliteProjection<T>,
  runtimeScope: readonly NodeKey[] | null
): Readonly<{
  invalidRangeDropCount: number;
  outputs: ReadonlyArray<
    Readonly<{
      key: NodeKey;
      value: PliteProjectionSlice<T>;
    }>
  >;
  projectedRangeCount: number;
}> => {
  try {
    if ((projection as { range: Range | null }).range === null) {
      return {
        invalidRangeDropCount: 0,
        outputs: Object.freeze([]),
        projectedRangeCount: 0,
      };
    }

    const scopedRanges = getScopedProjectionRanges(
      snapshot,
      projection.range,
      runtimeScope
    );
    const segments = scopedRanges.flatMap<ProjectedRangeSegment>(
      (scopedRange) => [...projectRangeInSnapshot(snapshot, scopedRange)]
    );

    return {
      invalidRangeDropCount: 0,
      outputs: Object.freeze(
        segments.map((segment) => ({
          key: segment.key,
          value: Object.freeze({
            data: projection.data,
            end: segment.end,
            key: projection.key,
            start: segment.start,
          }),
        }))
      ),
      projectedRangeCount: scopedRanges.length,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      INVALID_PROJECTION_RANGE_ERROR.test(error.message)
    ) {
      return {
        invalidRangeDropCount: 1,
        outputs: Object.freeze([]),
        projectedRangeCount: 0,
      };
    }

    throw error;
  }
};

export const createPliteProjectionStore = <T>(
  editor: Editor,
  source: PliteProjectionSource<T>,
  options: PliteProjectionStoreOptions = {}
): CompiledProjectionStore<T> => {
  const refreshListeners = new Set<PliteProjectionRefreshListener>();
  let destroyed = false;
  const sourceId = options.sourceId ?? 'projection';
  const faultBoundary = createViewSourceFaultBoundary({
    id: sourceId,
    onError: options.onError,
  });
  const initialSnapshot = editorGetSnapshot(editor);
  const initialContext = {
    reason: 'refresh',
    snapshot: initialSnapshot,
    sourceId: options.sourceId,
  } satisfies PliteSourceDirtinessContext;
  const initialRuntimeScope = getRuntimeScope(
    options.runtimeScope,
    initialContext
  );
  let mappingSnapshot = initialSnapshot;
  let mappingRuntimeScope = initialRuntimeScope;
  let mappedInvalidRangeDropCount = 0;
  let mappedProjectedRangeCount = 0;
  const readSource = (
    snapshot: EditorSnapshot,
    context: PliteSourceDirtinessContext,
    runtimeScope: readonly NodeKey[] | null
  ) => {
    const sourceResult = faultBoundary.run('read', () =>
      profileProjectionStorePhase(
        options.sourceId
          ? `projection-store.source-read:${options.sourceId}`
          : 'projection-store.source-read',
        () => source(snapshot, { ...context, runtimeScope })
      )
    );

    return sourceResult.ok ? sourceResult.value : null;
  };
  const initialProjections =
    readSource(initialSnapshot, initialContext, initialRuntimeScope) ?? [];
  let keyedProjectionRevision =
    readKeyedProjectionDelta(initialProjections)?.revision ?? null;
  const createMappedSource = (projections: ReadonlyArray<PliteProjection<T>>) =>
    createStableIdMappedSource<
      PliteProjection<T>,
      never,
      PliteProjectionSlice<T>
    >(projections, {
      getId: (projection) => projection.key,
      isItemEqual: areProjectionInputsEqual,
      isOutputEqual: areSlicesEqual,
      map: (projection) => {
        const mapped = mapProjection(
          mappingSnapshot,
          projection,
          mappingRuntimeScope
        );
        mappedInvalidRangeDropCount += mapped.invalidRangeDropCount;
        mappedProjectedRangeCount += mapped.projectedRangeCount;

        return {
          outputs: mapped.outputs,
        };
      },
    });
  const initialMappedResult = faultBoundary.run('project', () =>
    profileProjectionStorePhase(
      options.sourceId
        ? `projection-store.build-snapshot:${options.sourceId}`
        : 'projection-store.build-snapshot',
      () => createMappedSource(initialProjections)
    )
  );
  if (!initialMappedResult.ok) {
    mappedInvalidRangeDropCount = 0;
    mappedProjectedRangeCount = 0;
  }
  const mappedSource = initialMappedResult.ok
    ? initialMappedResult.value
    : createMappedSource([]);
  const store = createMappedViewStoreKernel(
    mappedSource.getSnapshot().byOutputKey as PliteProjectionStoreSnapshot<T>
  );
  let metrics = Object.freeze({
    ...EMPTY_METRICS,
    invalidRangeDropCount: mappedInvalidRangeDropCount,
    projectedRangeCount: mappedProjectedRangeCount,
    sourceReadCount: 1,
  }) as PliteProjectionStoreMetrics;
  const runtimeKey = (nodeKey: NodeKey) => `runtime:${nodeKey}`;
  const sourceKey = (id: string) => `source:${id}`;

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
        changedNodeKeys: EMPTY_RUNTIME_IDS,
        context,
      });
    }

    if (
      !context.forceInvalidate &&
      !isRuntimeScopeDirty(options.runtimeScope, context)
    ) {
      return createProjectionRefreshResult({
        changedNodeKeys: EMPTY_RUNTIME_IDS,
        context,
      });
    }

    const runtimeScope = getRuntimeScope(options.runtimeScope, context);
    const nextProjections = readSource(context.snapshot, context, runtimeScope);

    if (!nextProjections) {
      return createProjectionRefreshResult({
        changedNodeKeys: EMPTY_RUNTIME_IDS,
        context,
      });
    }

    mappingSnapshot = context.snapshot;
    mappingRuntimeScope = runtimeScope;
    const previousInvalidRangeDropCount = mappedInvalidRangeDropCount;
    const previousProjectedRangeCount = mappedProjectedRangeCount;
    const forceAll = context.forceInvalidate === true || runtimeScope !== null;
    const keyedDelta = readKeyedProjectionDelta(nextProjections);
    const changedIds =
      !forceAll && !context.change && keyedDelta
        ? keyedDelta.revision === keyedProjectionRevision
          ? EMPTY_RUNTIME_IDS
          : (keyedDelta.changedKeys ?? undefined)
        : undefined;
    const forceIds = context.change
      ? Array.from(
          new Set([
            ...mappedSource.getIdsForOutputKeys(
              context.change.changed.nodeKeysAll('decoration')
            ),
            ...(context.change.changed.hasAny('document')
              ? mappedSource.getIdsWithoutOutputs()
              : []),
          ])
        )
      : undefined;
    const refreshResult = faultBoundary.run('project', () =>
      profileProjectionStorePhase(
        options.sourceId
          ? `projection-store.map-source:${options.sourceId}`
          : 'projection-store.map-source',
        () =>
          mappedSource.refresh(nextProjections, {
            changedIds,
            forceAll,
            forceIds,
          })
      )
    );

    if (!refreshResult.ok) {
      return createProjectionRefreshResult({
        changedNodeKeys: EMPTY_RUNTIME_IDS,
        context,
      });
    }

    if (keyedDelta) keyedProjectionRevision = keyedDelta.revision;

    const nextSnapshot = mappedSource.getSnapshot()
      .byOutputKey as PliteProjectionStoreSnapshot<T>;
    const fullFallbackCount =
      refreshResult.value.fullFallback || forceAll ? 1 : 0;

    metrics = Object.freeze({
      ...metrics,
      fullFallbackCount: metrics.fullFallbackCount + fullFallbackCount,
      invalidRangeDropCount:
        metrics.invalidRangeDropCount +
        (mappedInvalidRangeDropCount - previousInvalidRangeDropCount),
      projectedRangeCount:
        metrics.projectedRangeCount +
        (mappedProjectedRangeCount - previousProjectedRangeCount),
      sourceReadCount: metrics.sourceReadCount + 1,
    });

    const currentSnapshot = store.getSnapshot();
    const changedNodeKeys: readonly NodeKey[] = context.forceInvalidate
      ? Array.from(
          new Set([
            ...Object.keys(currentSnapshot),
            ...Object.keys(nextSnapshot),
            ...store
              .getSubscribedKeys()
              .filter((key) => key.startsWith('runtime:'))
              .map((key) => key.slice('runtime:'.length)),
          ])
        ).map((nodeKey) => nodeKey as NodeKey)
      : (refreshResult.value.changedOutputKeys as readonly NodeKey[]);

    if (changedNodeKeys.length === 0) {
      return createProjectionRefreshResult({
        changedNodeKeys,
        context,
      });
    }

    const runtimeKeys = changedNodeKeys.map(runtimeKey);
    const runtimeSubscriberWakeCount = store.countKeySubscribers(runtimeKeys);
    const sourceSubscriberWakeCount = options.sourceId
      ? store.countKeySubscribers([sourceKey(options.sourceId)])
      : 0;
    const globalSubscriberWakeCount = store.subscriberCount();

    metrics = Object.freeze({
      ...metrics,
      changedRuntimeBucketCount:
        metrics.changedRuntimeBucketCount + changedNodeKeys.length,
      globalSubscriberWakeCount:
        metrics.globalSubscriberWakeCount + globalSubscriberWakeCount,
      recomputeCount: metrics.recomputeCount + 1,
      runtimeSubscriberWakeCount:
        metrics.runtimeSubscriberWakeCount + runtimeSubscriberWakeCount,
      sourceSubscriberWakeCount:
        metrics.sourceSubscriberWakeCount + sourceSubscriberWakeCount,
    });
    profileProjectionStorePhase(
      options.sourceId
        ? `projection-store.notify:${options.sourceId}`
        : 'projection-store.notify',
      () =>
        store.publish(nextSnapshot, [
          ...runtimeKeys,
          ...(options.sourceId ? [sourceKey(options.sourceId)] : []),
        ])
    );

    const result = createProjectionRefreshResult({
      changedNodeKeys,
      context,
    });

    emitProjectionRefresh(result);

    return result;
  };

  const unsubscribeEditorSources = getEditorSourcesForDirtiness(
    options.dirtiness
  ).map((editorSource) =>
    editorSubscribeSource(
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
      store.destroy();
      refreshListeners.clear();
      unsubscribe();
    },
    getMetrics() {
      return metrics;
    },
    getSourceStatus() {
      return faultBoundary.getStatus();
    },
    getRuntimeSnapshot(nodeKey) {
      return (
        store.getSnapshot()[nodeKey] ??
        (EMPTY_RUNTIME_SNAPSHOT as ReadonlyArray<PliteProjectionSlice<T>>)
      );
    },
    getSnapshot() {
      return store.getSnapshot();
    },
    refresh(refreshOptions = {}) {
      if (
        refreshOptions.sourceId &&
        refreshOptions.sourceId !== options.sourceId
      ) {
        return createProjectionRefreshResult({
          changedNodeKeys: EMPTY_RUNTIME_IDS,
          context: {
            change: refreshOptions.change,
            forceInvalidate: refreshOptions.forceInvalidate,
            reason: refreshOptions.reason ?? 'refresh',
            requiresDOMSelectionExport:
              refreshOptions.requiresDOMSelectionExport,
            snapshot: editorGetSnapshot(editor),
          },
        });
      }

      return recompute({
        change: refreshOptions.change,
        forceInvalidate: refreshOptions.forceInvalidate,
        reason: refreshOptions.reason ?? 'refresh',
        requiresDOMSelectionExport: refreshOptions.requiresDOMSelectionExport,
        snapshot: editorGetSnapshot(editor),
        sourceId: options.sourceId,
      });
    },
    retry() {
      faultBoundary.activate();

      return recompute({
        forceInvalidate: true,
        reason: 'refresh',
        snapshot: editorGetSnapshot(editor),
        sourceId: options.sourceId,
      });
    },
    subscribe(listener) {
      return store.subscribe(listener);
    },
    subscribeProjectionRefresh(listener) {
      refreshListeners.add(listener);
      return () => {
        refreshListeners.delete(listener);
      };
    },
    subscribeNodeKey(nodeKey, listener) {
      return store.subscribeKey(runtimeKey(nodeKey), listener);
    },
    subscribeSourceId(innerSourceId, listener) {
      return store.subscribeKey(sourceKey(innerSourceId), listener);
    },
  };
};
