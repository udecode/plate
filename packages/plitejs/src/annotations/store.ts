import {
  type Anchor,
  type Editor as EditorType,
  type EditorCommit,
  type NodeKey,
  RangeApi,
  type Range,
  type Value,
} from '..';
import { subscribeCommit as editorSubscribeCommit } from '../core/listener-state';
import { projectRange as editorProjectRange } from '../editor/project-range';
import {
  areMappedViewDataEqual,
  createMappedViewStoreKernel,
  createViewSourceFaultBoundary,
} from '../internal/view/mapped-view-store';
import { createStableIdMappedSource } from '../internal/view/stable-id-mapped-source';
import type {
  PliteViewSourceErrorSink,
  PliteViewSourceStatus,
} from '../internal/view/view-source';

export interface PliteAnnotationAnchor extends Pick<
  Anchor<Range>,
  'release' | 'resolve'
> {
  resolve: () => Range | null;
}

export interface PliteAnnotation<TData = unknown> {
  anchor: PliteAnnotationAnchor;
  data?: TData;
  id: string;
}

export interface PliteResolvedAnnotation<TData = unknown> {
  data?: TData;
  id: string;
  range: Range | null;
}

export interface PliteAnnotationSnapshot<TData = unknown> {
  allIds: readonly string[];
  byId: ReadonlyMap<string, PliteResolvedAnnotation<TData>>;
}

export type PliteAnnotationChange = Readonly<{
  ids: readonly string[];
  nodeKeys: readonly NodeKey[];
  reason: 'annotation' | 'editor' | 'external' | 'refresh';
}>;

export type PliteAnnotationRefreshOptions = Readonly<{
  ids?: readonly string[];
  reason?: 'annotation' | 'external' | 'refresh';
}>;

export type PliteAnnotationStoreMetrics = Readonly<{
  annotationResolveCount: number;
  annotationSubscriberWakeCount: number;
  changedAnnotationCount: number;
  fullFallbackCount: number;
  recomputeCount: number;
}>;

export type PliteAnnotationStoreOptions = Readonly<{
  id?: string;
  onError?: PliteViewSourceErrorSink;
}>;

export interface PliteAnnotationStore<TData = unknown> {
  destroy: () => void;
  getAnnotation: (id: string) => PliteResolvedAnnotation<TData> | null;
  getAnnotationsAt: (
    nodeKey: NodeKey
  ) => ReadonlyArray<PliteResolvedAnnotation<TData>>;
  getMetrics: () => PliteAnnotationStoreMetrics;
  getSourceStatus: () => PliteViewSourceStatus;
  getSnapshot: () => PliteAnnotationSnapshot<TData>;
  refresh: (options?: PliteAnnotationRefreshOptions) => void;
  retry: () => void;
  subscribe: (listener: () => void) => () => void;
  subscribeAnnotation: (id: string, listener: () => void) => () => void;
  subscribeChanges: (
    listener: (change: PliteAnnotationChange) => void
  ) => () => void;
}

const EMPTY_METRICS = Object.freeze({
  annotationResolveCount: 0,
  annotationSubscriberWakeCount: 0,
  changedAnnotationCount: 0,
  fullFallbackCount: 0,
  recomputeCount: 0,
}) as PliteAnnotationStoreMetrics;

const INVALID_ANNOTATION_RANGE_ERROR =
  /Cannot project a range outside the committed snapshot|Point offset .* is outside text bounds/;

const projectAnnotationRange = (editor: EditorType, range: Range) => {
  try {
    return editorProjectRange(editor, range);
  } catch (error) {
    if (
      error instanceof Error &&
      INVALID_ANNOTATION_RANGE_ERROR.test(error.message)
    ) {
      return null;
    }

    throw error;
  }
};

const shouldRefreshForEditorChange = (change: EditorCommit | undefined) =>
  !change ||
  change.changed.hasAny('document') ||
  change.changed.hasAny('marks');

const areAnnotationInputsEqual = <TData>(
  left: PliteAnnotation<TData>,
  right: PliteAnnotation<TData>
) =>
  left.id === right.id &&
  left.anchor === right.anchor &&
  areMappedViewDataEqual(left.data, right.data);

const areResolvedAnnotationsEqual = <TData>(
  left: PliteResolvedAnnotation<TData>,
  right: PliteResolvedAnnotation<TData>
) =>
  left.id === right.id &&
  RangeApi.equals(left.range, right.range) &&
  areMappedViewDataEqual(left.data, right.data);

export type ActivatablePliteAnnotationStore<TData = unknown> =
  PliteAnnotationStore<TData> & {
    activate: () => void;
  };

const createPliteAnnotationStoreInternal = <TData>(
  editorInput: unknown,
  source:
    | ReadonlyArray<PliteAnnotation<TData>>
    | (() => ReadonlyArray<PliteAnnotation<TData>>),
  options: PliteAnnotationStoreOptions,
  dormant: boolean
): ActivatablePliteAnnotationStore<TData> => {
  const editor = editorInput as EditorType;
  const getAnnotations = typeof source === 'function' ? source : () => source;
  const faultBoundary = createViewSourceFaultBoundary({
    id: options.id ?? 'annotations',
    onError: options.onError,
  });
  let mappedResolveCount = 0;
  const createMappedSource = (
    annotations: ReadonlyArray<PliteAnnotation<TData>>
  ) =>
    createStableIdMappedSource<
      PliteAnnotation<TData>,
      PliteResolvedAnnotation<TData>,
      true
    >(annotations, {
      getId: (annotation) => annotation.id,
      isEntityEqual: areResolvedAnnotationsEqual,
      isItemEqual: areAnnotationInputsEqual,
      isOutputEqual: Object.is,
      map: (annotation) => {
        mappedResolveCount += 1;
        const resolvedRange = annotation.anchor.resolve();
        const mappedRange = resolvedRange
          ? projectAnnotationRange(editor, resolvedRange)
          : null;
        const range = mappedRange ? resolvedRange : null;

        return {
          entity: Object.freeze({
            data: annotation.data,
            id: annotation.id,
            range,
          }),
          outputs:
            mappedRange?.map((segment) => ({
              key: segment.key,
              value: true as const,
            })) ?? [],
        };
      },
    });
  const initialAnnotationsResult = dormant
    ? ({
        ok: true,
        value: [] as ReadonlyArray<PliteAnnotation<TData>>,
      } as const)
    : faultBoundary.run('read', getAnnotations);
  const initialMappedResult = initialAnnotationsResult.ok
    ? faultBoundary.run('resolve', () =>
        createMappedSource(initialAnnotationsResult.value)
      )
    : ({ ok: false } as const);

  if (!initialMappedResult.ok) mappedResolveCount = 0;

  const mappedSource = initialMappedResult.ok
    ? initialMappedResult.value
    : createMappedSource([]);
  let currentAnnotations =
    initialMappedResult.ok && initialAnnotationsResult.ok
      ? initialAnnotationsResult.value
      : null;
  const toSnapshot = () => {
    const snapshot = mappedSource.getSnapshot();

    return Object.freeze({
      allIds: snapshot.allIds,
      byId: snapshot.byId,
    }) as PliteAnnotationSnapshot<TData>;
  };
  const annotationsStore = createMappedViewStoreKernel(toSnapshot());
  const changeListeners = new Set<(change: PliteAnnotationChange) => void>();
  let metrics = Object.freeze({
    ...EMPTY_METRICS,
    annotationResolveCount: mappedResolveCount,
  });
  let activated = !dormant;
  let destroyed = false;

  const refreshCandidates = (
    candidateIds: readonly string[] | null = null,
    forceAll = candidateIds === null,
    reason: PliteAnnotationChange['reason'] = 'refresh'
  ) => {
    const annotationsResult = faultBoundary.run('read', getAnnotations);

    if (!annotationsResult.ok) return;

    const previousResolveCount = mappedResolveCount;
    const mappedResult = faultBoundary.run('resolve', () =>
      mappedSource.refresh(annotationsResult.value, {
        ...(reason === 'editor' &&
        candidateIds &&
        annotationsResult.value === currentAnnotations
          ? { changedIds: candidateIds }
          : { forceAll, forceIds: candidateIds ?? undefined }),
      })
    );

    if (!mappedResult.ok) return;

    currentAnnotations = annotationsResult.value;
    const changedIds = mappedResult.value.changedEntityIds;
    const changed = changedIds.length > 0 || mappedResult.value.orderChanged;
    const subscriberWakeCount = changed
      ? annotationsStore.subscriberCount() +
        changeListeners.size +
        annotationsStore.countKeySubscribers(changedIds)
      : 0;

    metrics = Object.freeze({
      ...metrics,
      annotationResolveCount:
        metrics.annotationResolveCount +
        (mappedResolveCount - previousResolveCount),
      annotationSubscriberWakeCount:
        metrics.annotationSubscriberWakeCount + subscriberWakeCount,
      changedAnnotationCount:
        metrics.changedAnnotationCount + changedIds.length,
      fullFallbackCount:
        metrics.fullFallbackCount +
        (mappedResult.value.fullFallback || forceAll ? 1 : 0),
      recomputeCount: metrics.recomputeCount + (changed ? 1 : 0),
    });

    if (changed) {
      const change = Object.freeze({
        ids: Object.freeze([...changedIds]),
        nodeKeys: Object.freeze(
          mappedResult.value.affectedOutputKeys.map((key) => key as NodeKey)
        ),
        reason,
      });
      annotationsStore.publish(toSnapshot(), changedIds);
      changeListeners.forEach((listener) => listener(change));
    }
  };

  const subscribeToEditor = () =>
    editorSubscribeCommit(editor, (change) => {
      if (destroyed || !shouldRefreshForEditorChange(change)) return;

      const candidateIds = change
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

      if (candidateIds && candidateIds.length === 0) return;

      refreshCandidates(candidateIds, candidateIds === null, 'editor');
    });
  let unsubscribeEditor = activated ? subscribeToEditor() : null;

  const refresh = (refreshOptions: PliteAnnotationRefreshOptions = {}) => {
    if (!activated || destroyed || refreshOptions.ids?.length === 0) return;

    refreshCandidates(
      refreshOptions.ids ?? null,
      refreshOptions.ids === undefined,
      refreshOptions.reason ?? 'refresh'
    );
  };
  const publicStore: ActivatablePliteAnnotationStore<TData> = {
    activate() {
      if (activated || destroyed) return;

      activated = true;
      refreshCandidates(null, true);
      unsubscribeEditor = subscribeToEditor();
    },
    destroy() {
      if (destroyed) return;

      destroyed = true;
      unsubscribeEditor?.();
      changeListeners.clear();
      annotationsStore.destroy();
    },
    getAnnotation: (id) => annotationsStore.getSnapshot().byId.get(id) ?? null,
    getAnnotationsAt: (nodeKey) =>
      Object.freeze(
        mappedSource
          .getIdsForOutputKeys([nodeKey])
          .flatMap((id) => annotationsStore.getSnapshot().byId.get(id) ?? [])
      ),
    getMetrics: () => metrics,
    getSourceStatus: () => faultBoundary.getStatus(),
    getSnapshot: () => annotationsStore.getSnapshot(),
    refresh,
    retry() {
      if (!activated || destroyed) return;

      faultBoundary.activate();
      refreshCandidates(null, true);
    },
    subscribe: (listener) => annotationsStore.subscribe(listener),
    subscribeAnnotation: (id, listener) =>
      annotationsStore.subscribeKey(id, listener),
    subscribeChanges(listener) {
      if (destroyed) return () => {};

      changeListeners.add(listener);

      return () => {
        changeListeners.delete(listener);
      };
    },
  };

  return publicStore;
};

/** Create an annotation store owned by a non-component framework lifetime. */
export const createPliteAnnotationStore = <
  TData = unknown,
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: EditorType<V, TExtensions>,
  source:
    | ReadonlyArray<PliteAnnotation<TData>>
    | (() => ReadonlyArray<PliteAnnotation<TData>>),
  options: PliteAnnotationStoreOptions = {}
): PliteAnnotationStore<TData> =>
  createPliteAnnotationStoreInternal(editor, source, options, false);

export const createDormantPliteAnnotationStore = <TData = unknown>(
  editor: unknown,
  source:
    | ReadonlyArray<PliteAnnotation<TData>>
    | (() => ReadonlyArray<PliteAnnotation<TData>>),
  options: PliteAnnotationStoreOptions = {}
) => createPliteAnnotationStoreInternal(editor, source, options, true);
