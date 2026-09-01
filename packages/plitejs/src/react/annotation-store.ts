import {
  type Anchor,
  type EditorCommit,
  RangeApi,
  type Range,
  type NodeKey,
  type Editor as EditorType,
} from '..';
import {
  projectRange as editorProjectRange,
  subscribeCommit as editorSubscribeCommit,
} from './editable/runtime-editor-api';
import type {
  PliteProjectionEntry,
  PliteProjectionStore,
} from './hooks/use-plite-projection-entries';
import {
  areMappedViewDataEqual,
  createMappedViewStoreKernel,
  createViewSourceFaultBoundary,
} from './mapped-view-store';
import { createStableIdMappedSource } from './stable-id-mapped-source';
import type {
  PliteViewSourceErrorSink,
  PliteViewSourceStatus,
} from './view-source';

export interface PliteAnnotationAnchor extends Pick<
  Anchor<Range>,
  'release' | 'resolve'
> {
  /** Resolve the annotation against the current committed editor snapshot. */
  resolve: () => Range | null;
}

/** A durable, identified range owned by app or collaboration state. */
export interface PliteAnnotation<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
> {
  anchor: PliteAnnotationAnchor;
  data?: TData;
  id: string;
  projection?: TProjection;
}

/** The latest resolved form of one annotation. */
export interface PliteResolvedAnnotation<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
> {
  data?: TData;
  id: string;
  projection?: TProjection;
  range: Range | null;
}

/** Ordered annotation ids plus resolved annotations by id. */
export interface PliteAnnotationSnapshot<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
> {
  allIds: readonly string[];
  byId: ReadonlyMap<string, PliteResolvedAnnotation<TData, TProjection>>;
}

export type PliteAnnotationProjectionData<
  TProjection extends Record<string, unknown> = Record<string, unknown>,
> = TProjection & {
  annotationId: string;
};

/** Refresh all annotations, no annotations, or a known subset of ids. */
export type PliteAnnotationRefreshOptions = Readonly<{
  ids?: readonly string[];
  reason?: 'annotation' | 'external' | 'refresh';
}>;

export type PliteAnnotationStoreMetrics = Readonly<{
  annotationProjectCount: number;
  annotationResolveCount: number;
  annotationSubscriberWakeCount: number;
  changedAnnotationCount: number;
  changedRuntimeBucketCount: number;
  fullFallbackCount: number;
  projectionSubscriberWakeCount: number;
  recomputeCount: number;
  runtimeSubscriberWakeCount: number;
}>;

export type PliteAnnotationStoreOptions = Readonly<{
  id?: string;
  onError?: PliteViewSourceErrorSink;
}>;

/**
 * Store that resolves app-owned annotations and exposes both sidebar snapshots
 * and text projection data.
 */
export interface PliteAnnotationStore<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
> {
  destroy: () => void;
  getAnnotation: (
    id: string
  ) => PliteResolvedAnnotation<TData, TProjection> | null;
  getMetrics: () => PliteAnnotationStoreMetrics;
  getSourceStatus: () => PliteViewSourceStatus;
  getSnapshot: () => PliteAnnotationSnapshot<TData, TProjection>;
  projectionStore: PliteProjectionStore<
    PliteAnnotationProjectionData<TProjection>
  >;
  refresh: (options?: PliteAnnotationRefreshOptions) => void;
  retry: () => void;
  subscribe: (listener: () => void) => () => void;
  subscribeAnnotation: (id: string, listener: () => void) => () => void;
}

const annotationChangeSubscriptions = new WeakMap<
  object,
  (listener: (ids: readonly string[]) => void) => () => void
>();

/** Private batched dependency notification; foreign stores require a full read. */
export const subscribeAnnotationChanges = (
  store: Pick<PliteAnnotationStore, 'subscribe'>,
  listener: (ids: readonly string[] | null) => void
) => {
  const subscribe = annotationChangeSubscriptions.get(store);

  return subscribe
    ? subscribe(listener)
    : store.subscribe(() => listener(null));
};

const EMPTY_PROJECTION_ENTRIES = Object.freeze([]) as ReadonlyArray<
  PliteProjectionEntry<PliteAnnotationProjectionData>
>;
const EMPTY_METRICS = Object.freeze({
  annotationProjectCount: 0,
  annotationResolveCount: 0,
  annotationSubscriberWakeCount: 0,
  changedAnnotationCount: 0,
  changedRuntimeBucketCount: 0,
  fullFallbackCount: 0,
  projectionSubscriberWakeCount: 0,
  recomputeCount: 0,
  runtimeSubscriberWakeCount: 0,
}) as PliteAnnotationStoreMetrics;

const INVALID_ANNOTATION_RANGE_ERROR =
  /Cannot project a range outside the committed snapshot|Point offset .* is outside text bounds/;

const isInvalidAnnotationRangeError = (error: unknown) =>
  error instanceof Error && INVALID_ANNOTATION_RANGE_ERROR.test(error.message);

const annotationProjectionDataSources = new WeakMap<object, unknown>();

const createAnnotationProjectionData = <
  TProjection extends Record<string, unknown>,
>(
  annotation: PliteResolvedAnnotation<unknown, TProjection>
) => {
  const data = {
    ...annotation.projection,
    annotationId: annotation.id,
  } as PliteAnnotationProjectionData<TProjection>;

  annotationProjectionDataSources.set(data, annotation.projection);

  return data;
};

const getAnnotationProjectionDataSource = (data: unknown) => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const key = data;

  return annotationProjectionDataSources.has(key)
    ? { source: annotationProjectionDataSources.get(key) }
    : null;
};

const areAnnotationProjectionDataEqual = (left: unknown, right: unknown) => {
  if (Object.is(left, right)) return true;

  const leftSource = getAnnotationProjectionDataSource(left);
  const rightSource = getAnnotationProjectionDataSource(right);

  if (leftSource || rightSource) {
    return Boolean(
      leftSource &&
      rightSource &&
      (left as PliteAnnotationProjectionData | undefined)?.annotationId ===
        (right as PliteAnnotationProjectionData | undefined)?.annotationId &&
      Object.is(leftSource.source, rightSource.source)
    );
  }

  return areMappedViewDataEqual(left, right);
};

const projectAnnotationRange = (editor: EditorType, range: Range) => {
  try {
    return editorProjectRange(editor, range);
  } catch (error) {
    if (isInvalidAnnotationRangeError(error)) {
      return null;
    }

    throw error;
  }
};

const shouldRefreshForEditorChange = (change: EditorCommit | undefined) => {
  if (!change) {
    return true;
  }

  return change.changed.hasAny('document') || change.changed.hasAny('marks');
};

const areAnnotationInputsEqual = <
  TData,
  TProjection extends Record<string, unknown>,
>(
  left: PliteAnnotation<TData, TProjection>,
  right: PliteAnnotation<TData, TProjection>
) =>
  left.id === right.id &&
  left.anchor === right.anchor &&
  areMappedViewDataEqual(left.data, right.data) &&
  areMappedViewDataEqual(left.projection, right.projection);

const areResolvedAnnotationsEqual = <
  TData,
  TProjection extends Record<string, unknown>,
>(
  left: PliteResolvedAnnotation<TData, TProjection>,
  right: PliteResolvedAnnotation<TData, TProjection>
) =>
  left.id === right.id &&
  RangeApi.equals(left.range, right.range) &&
  areMappedViewDataEqual(left.data, right.data) &&
  areMappedViewDataEqual(left.projection, right.projection);

const areAnnotationProjectionEntriesEqual = (
  left: PliteProjectionEntry,
  right: PliteProjectionEntry
) =>
  left.key === right.key &&
  left.start === right.start &&
  left.end === right.end &&
  areAnnotationProjectionDataEqual(left.data, right.data);

/**
 * Commit-activated annotation store used by React ownership hooks.
 *
 * @internal
 */
export type ActivatablePliteAnnotationStore<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
> = PliteAnnotationStore<TData, TProjection> & {
  activate: () => void;
};

const createPliteAnnotationStoreInternal = <
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
>(
  editor: EditorType,
  source:
    | ReadonlyArray<PliteAnnotation<TData, TProjection>>
    | (() => ReadonlyArray<PliteAnnotation<TData, TProjection>>),
  options: PliteAnnotationStoreOptions,
  dormant: boolean
): ActivatablePliteAnnotationStore<TData, TProjection> => {
  const getAnnotations = typeof source === 'function' ? source : () => source;
  const faultBoundary = createViewSourceFaultBoundary({
    id: options.id ?? 'annotations',
    onError: options.onError,
  });
  let mappedResolveCount = 0;
  let mappedProjectCount = 0;
  const createMappedSource = (
    annotations: ReadonlyArray<PliteAnnotation<TData, TProjection>>
  ) =>
    createStableIdMappedSource<
      PliteAnnotation<TData, TProjection>,
      PliteResolvedAnnotation<TData, TProjection>,
      PliteProjectionEntry<PliteAnnotationProjectionData<TProjection>>
    >(annotations, {
      getId: (annotation) => annotation.id,
      isEntityEqual: areResolvedAnnotationsEqual,
      isItemEqual: areAnnotationInputsEqual,
      isOutputEqual: areAnnotationProjectionEntriesEqual,
      map: (annotation) => {
        mappedResolveCount += 1;
        const resolvedRange = annotation.anchor.resolve();
        const projected = resolvedRange
          ? projectAnnotationRange(editor, resolvedRange)
          : null;
        const range = projected ? resolvedRange : null;

        if (range) mappedProjectCount += 1;

        const resolved = Object.freeze({
          data: annotation.data,
          id: annotation.id,
          projection: annotation.projection,
          range,
        }) as PliteResolvedAnnotation<TData, TProjection>;
        const projectionData = createAnnotationProjectionData(resolved);

        return {
          entity: resolved,
          outputs:
            projected?.map((segment) => ({
              key: segment.key,
              value: Object.freeze({
                data: projectionData,
                end: segment.end,
                key: annotation.id,
                start: segment.start,
              }),
            })) ?? [],
        };
      },
    });
  const initialAnnotationsResult = dormant
    ? ({
        ok: true,
        value: [] as ReadonlyArray<PliteAnnotation<TData, TProjection>>,
      } as const)
    : faultBoundary.run('read', getAnnotations);
  const initialMappedResult = initialAnnotationsResult.ok
    ? faultBoundary.run('resolve', () =>
        createMappedSource(initialAnnotationsResult.value)
      )
    : ({ ok: false } as const);
  if (!initialMappedResult.ok) {
    mappedResolveCount = 0;
    mappedProjectCount = 0;
  }
  const mappedSource = initialMappedResult.ok
    ? initialMappedResult.value
    : createMappedSource([]);
  let currentAnnotations =
    initialMappedResult.ok && initialAnnotationsResult.ok
      ? initialAnnotationsResult.value
      : null;
  const toAnnotationSnapshot = () => {
    const snapshot = mappedSource.getSnapshot();

    return Object.freeze({
      allIds: snapshot.allIds,
      byId: snapshot.byId,
    }) as PliteAnnotationSnapshot<TData, TProjection>;
  };
  const getProjectionSnapshot = () =>
    mappedSource.getSnapshot().byOutputKey as Readonly<
      Record<
        NodeKey,
        ReadonlyArray<
          PliteProjectionEntry<PliteAnnotationProjectionData<TProjection>>
        >
      >
    >;
  const annotationsStore = createMappedViewStoreKernel(toAnnotationSnapshot());
  const projectionsStore = createMappedViewStoreKernel(getProjectionSnapshot());
  let metrics = Object.freeze({
    ...EMPTY_METRICS,
    annotationProjectCount: mappedProjectCount,
    annotationResolveCount: mappedResolveCount,
  }) as PliteAnnotationStoreMetrics;
  let activated = !dormant;
  let destroyed = false;

  const refreshCandidates = (
    candidateAnnotationIds: readonly string[] | null = null,
    forceAll = candidateAnnotationIds === null,
    editorChange = false
  ) => {
    const annotationsResult = faultBoundary.run('read', getAnnotations);

    if (!annotationsResult.ok) return;

    const previousResolveCount = mappedResolveCount;
    const previousProjectCount = mappedProjectCount;
    const mappedResult = faultBoundary.run('resolve', () =>
      mappedSource.refresh(annotationsResult.value, {
        ...(editorChange &&
        candidateAnnotationIds &&
        annotationsResult.value === currentAnnotations
          ? { changedIds: candidateAnnotationIds }
          : { forceAll, forceIds: candidateAnnotationIds ?? undefined }),
      })
    );

    if (!mappedResult.ok) return;
    currentAnnotations = annotationsResult.value;

    const annotationChangedIds = mappedResult.value.changedEntityIds;
    const projectionChangedNodeKeys = mappedResult.value
      .changedOutputKeys as readonly NodeKey[];

    metrics = Object.freeze({
      ...metrics,
      annotationProjectCount:
        metrics.annotationProjectCount +
        (mappedProjectCount - previousProjectCount),
      annotationResolveCount:
        metrics.annotationResolveCount +
        (mappedResolveCount - previousResolveCount),
      fullFallbackCount:
        metrics.fullFallbackCount +
        (mappedResult.value.fullFallback || forceAll ? 1 : 0),
    });

    if (
      annotationChangedIds.length === 0 &&
      projectionChangedNodeKeys.length === 0 &&
      !mappedResult.value.orderChanged
    ) {
      return;
    }

    const annotationSubscriberWakeCount =
      annotationChangedIds.length > 0 || mappedResult.value.orderChanged
        ? annotationsStore.subscriberCount() +
          annotationsStore.countKeySubscribers(annotationChangedIds)
        : 0;
    const projectionSubscriberWakeCount =
      projectionChangedNodeKeys.length > 0
        ? projectionsStore.subscriberCount()
        : 0;
    const runtimeSubscriberWakeCount = projectionsStore.countKeySubscribers(
      projectionChangedNodeKeys
    );

    metrics = Object.freeze({
      ...metrics,
      annotationSubscriberWakeCount:
        metrics.annotationSubscriberWakeCount + annotationSubscriberWakeCount,
      changedAnnotationCount:
        metrics.changedAnnotationCount + annotationChangedIds.length,
      changedRuntimeBucketCount:
        metrics.changedRuntimeBucketCount + projectionChangedNodeKeys.length,
      projectionSubscriberWakeCount:
        metrics.projectionSubscriberWakeCount + projectionSubscriberWakeCount,
      recomputeCount: metrics.recomputeCount + 1,
      runtimeSubscriberWakeCount:
        metrics.runtimeSubscriberWakeCount + runtimeSubscriberWakeCount,
    });

    if (annotationChangedIds.length > 0 || mappedResult.value.orderChanged) {
      annotationsStore.publish(toAnnotationSnapshot(), annotationChangedIds);
    }

    if (projectionChangedNodeKeys.length > 0) {
      projectionsStore.publish(
        getProjectionSnapshot(),
        projectionChangedNodeKeys
      );
    }
  };

  const subscribeToEditor = () =>
    editorSubscribeCommit(editor, (change) => {
      if (destroyed || !shouldRefreshForEditorChange(change)) return;

      const candidateAnnotationIds = change
        ? Array.from(
            new Set([
              ...mappedSource.getIdsForOutputKeys(
                change.changed.nodeKeysAll('decoration')
              ),
              ...(change.changed.hasAny('document')
                ? mappedSource.getIdsWithoutOutputs()
                : []),
            ])
          )
        : null;

      if (candidateAnnotationIds && candidateAnnotationIds.length === 0) {
        return;
      }

      refreshCandidates(
        candidateAnnotationIds,
        candidateAnnotationIds === null,
        true
      );
    });
  let unsubscribeEditor = activated ? subscribeToEditor() : null;

  const refresh = (innerOptions: PliteAnnotationRefreshOptions = {}) => {
    if (!activated || destroyed) return;

    if (innerOptions.ids && innerOptions.ids.length === 0) {
      return;
    }

    refreshCandidates(innerOptions.ids ?? null, innerOptions.ids === undefined);
  };

  const publicStore: ActivatablePliteAnnotationStore<TData, TProjection> = {
    activate() {
      if (activated || destroyed) return;

      activated = true;
      refreshCandidates(null, true);
      unsubscribeEditor = subscribeToEditor();
    },
    destroy() {
      if (destroyed) return;

      destroyed = true;
      annotationChangeSubscriptions.delete(publicStore);
      unsubscribeEditor?.();
      annotationsStore.destroy();
      projectionsStore.destroy();
    },
    getAnnotation(id) {
      return annotationsStore.getSnapshot().byId.get(id) ?? null;
    },
    getMetrics() {
      return metrics;
    },
    getSourceStatus() {
      return faultBoundary.getStatus();
    },
    getSnapshot() {
      return annotationsStore.getSnapshot();
    },
    projectionStore: {
      getRuntimeSnapshot(nodeKey) {
        return (
          projectionsStore.getSnapshot()[nodeKey] ?? EMPTY_PROJECTION_ENTRIES
        );
      },
      getSnapshot() {
        return projectionsStore.getSnapshot();
      },
      subscribe(listener) {
        return projectionsStore.subscribe(listener);
      },
      subscribeNodeKey(nodeKey, listener) {
        return projectionsStore.subscribeKey(nodeKey, listener);
      },
    },
    refresh,
    retry() {
      if (!activated || destroyed) return;

      faultBoundary.activate();
      refreshCandidates(null, true);
    },
    subscribe(listener) {
      return annotationsStore.subscribe(listener);
    },
    subscribeAnnotation(id, listener) {
      return annotationsStore.subscribeKey(id, listener);
    },
  };

  annotationChangeSubscriptions.set(
    publicStore,
    annotationsStore.subscribeChanges
  );
  return publicStore;
};

export function createPliteAnnotationStore<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
>(
  editor: EditorType,
  source:
    | ReadonlyArray<PliteAnnotation<TData, TProjection>>
    | (() => ReadonlyArray<PliteAnnotation<TData, TProjection>>),
  options: PliteAnnotationStoreOptions = {}
): PliteAnnotationStore<TData, TProjection> {
  return createPliteAnnotationStoreInternal(editor, source, options, false);
}

/**
 * Create an inert candidate for commit-owned React activation.
 *
 * @internal
 */
export const createDormantPliteAnnotationStore = <
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
>(
  editor: EditorType,
  source:
    | ReadonlyArray<PliteAnnotation<TData, TProjection>>
    | (() => ReadonlyArray<PliteAnnotation<TData, TProjection>>),
  options: PliteAnnotationStoreOptions = {}
) => createPliteAnnotationStoreInternal(editor, source, options, true);
