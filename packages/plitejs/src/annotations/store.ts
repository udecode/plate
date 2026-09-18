import {
  type Anchor,
  type Editor as EditorType,
  type EditorCommit,
  type NodeKey,
  RangeApi,
  type Range,
  type Value,
} from '..';
import { readAuthoredView } from '../core/authored-runtime';
import { subscribeEditorViewState } from '../core/public-state';
import { projectRange as editorProjectRange } from '../editor/project-range';
import {
  areMappedViewDataEqual,
  createMappedViewStoreKernel,
  createViewSourceFaultBoundary,
} from '../internal/view/mapped-view-store';
import { createStableIdMappedSource } from '../internal/view/stable-id-mapped-source';
import type {
  ViewSourceErrorSink,
  ViewSourceStatus,
} from '../internal/view/view-source';

export type AnnotationAnchor = Pick<Anchor<Range>, 'release' | 'resolve'>;

export interface Annotation<TData = unknown> {
  anchor: AnnotationAnchor;
  data?: TData;
  id: string;
}

export interface ResolvedAnnotation<TData = unknown> {
  data?: TData;
  id: string;
  range: Range | null;
}

export interface AnnotationSnapshot<TData = unknown> {
  allIds: readonly string[];
  byId: ReadonlyMap<string, ResolvedAnnotation<TData>>;
}

export type AnnotationChange = Readonly<{
  ids: readonly string[];
  nodeKeys: readonly NodeKey[];
  reason: 'annotation' | 'editor' | 'external' | 'refresh';
}>;

export type AnnotationRefreshOptions = Readonly<{
  ids?: readonly string[];
  reason?: 'annotation' | 'external' | 'refresh';
}>;

export type AnnotationStoreMetrics = Readonly<{
  annotationResolveCount: number;
  annotationSubscriberWakeCount: number;
  changedAnnotationCount: number;
  fullFallbackCount: number;
  recomputeCount: number;
}>;

export type AnnotationStoreOptions = Readonly<{
  id?: string;
  onError?: ViewSourceErrorSink;
}>;

export interface AnnotationStore<TData = unknown> {
  destroy: () => void;
  getAnnotation: (id: string) => ResolvedAnnotation<TData> | null;
  getAnnotationsAt: (
    nodeKey: NodeKey
  ) => ReadonlyArray<ResolvedAnnotation<TData>>;
  getMetrics: () => AnnotationStoreMetrics;
  getSourceStatus: () => ViewSourceStatus;
  getSnapshot: () => AnnotationSnapshot<TData>;
  refresh: (options?: AnnotationRefreshOptions) => void;
  retry: () => void;
  subscribe: (listener: () => void) => () => void;
  subscribeAnnotation: (id: string, listener: () => void) => () => void;
  subscribeChanges: (
    listener: (change: AnnotationChange) => void
  ) => () => void;
}

const EMPTY_METRICS = Object.freeze({
  annotationResolveCount: 0,
  annotationSubscriberWakeCount: 0,
  changedAnnotationCount: 0,
  fullFallbackCount: 0,
  recomputeCount: 0,
}) as AnnotationStoreMetrics;

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
  left: Annotation<TData>,
  right: Annotation<TData>
) =>
  left.id === right.id &&
  left.anchor === right.anchor &&
  areMappedViewDataEqual(left.data, right.data);

const areResolvedAnnotationsEqual = <TData>(
  left: ResolvedAnnotation<TData>,
  right: ResolvedAnnotation<TData>
) =>
  left.id === right.id &&
  RangeApi.equals(left.range, right.range) &&
  areMappedViewDataEqual(left.data, right.data);

export type ActivatablePliteAnnotationStore<TData = unknown> =
  AnnotationStore<TData> & {
    activate: () => void;
  };

const createPliteAnnotationStoreInternal = <TData>(
  editorInput: unknown,
  source:
    | ReadonlyArray<Annotation<TData>>
    | (() => ReadonlyArray<Annotation<TData>>),
  options: AnnotationStoreOptions,
  dormant: boolean
): ActivatablePliteAnnotationStore<TData> => {
  const editor = editorInput as EditorType;
  const getAnnotations = typeof source === 'function' ? source : () => source;
  const faultBoundary = createViewSourceFaultBoundary({
    id: options.id ?? 'annotations',
    onError: options.onError,
  });
  let mappedResolveCount = 0;
  const createMappedSource = (annotations: ReadonlyArray<Annotation<TData>>) =>
    createStableIdMappedSource<
      Annotation<TData>,
      ResolvedAnnotation<TData>,
      true
    >(annotations, {
      getId: (annotation) => annotation.id,
      isEntityEqual: areResolvedAnnotationsEqual,
      isItemEqual: areAnnotationInputsEqual,
      isOutputEqual: Object.is,
      map: (annotation) => {
        mappedResolveCount += 1;
        const resolvedRange = annotation.anchor.resolve(editor);
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
        value: [] as ReadonlyArray<Annotation<TData>>,
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
    }) as AnnotationSnapshot<TData>;
  };
  const annotationsStore = createMappedViewStoreKernel(toSnapshot());
  const changeListeners = new Set<(change: AnnotationChange) => void>();
  let metrics = Object.freeze({
    ...EMPTY_METRICS,
    annotationResolveCount: mappedResolveCount,
  });
  let activated = !dormant;
  let destroyed = false;
  let subscriberCount = 0;
  let lastSnapshot = dormant ? null : editor.read.runtime.snapshot();
  let lastProjection = dormant
    ? undefined
    : readAuthoredView(editor)?.projection;

  const refreshCandidates = (
    candidateIds: readonly string[] | null = null,
    forceAll = candidateIds === null,
    reason: AnnotationChange['reason'] = 'refresh'
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
    lastSnapshot = editor.read.runtime.snapshot();
    lastProjection = readAuthoredView(editor)?.projection;
    const changedIds = mappedResult.value.changedEntityIds;
    const changed =
      changedIds.length > 0 ||
      mappedResult.value.orderChanged ||
      mappedResult.value.affectedOutputKeys.length > 0;
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

  const ensureFresh = () => {
    if (!activated || destroyed) return;

    const snapshot = editor.read.runtime.snapshot();
    if (
      snapshot.children !== lastSnapshot?.children ||
      snapshot.index !== lastSnapshot?.index ||
      readAuthoredView(editor)?.projection !== lastProjection
    ) {
      refreshCandidates(null, true, 'editor');
    }
  };
  const subscribeToEditor = () => {
    const unsubscribeCommit = editor.subscribeCommit((change) => {
      if (destroyed || !shouldRefreshForEditorChange(change)) return;
      if (readAuthoredView(editor)?.projection !== lastProjection) {
        refreshCandidates(null, true, 'editor');
        return;
      }

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

      if (candidateIds && candidateIds.length === 0) {
        lastSnapshot = editor.read.runtime.snapshot();
        lastProjection = readAuthoredView(editor)?.projection;
        return;
      }

      refreshCandidates(candidateIds, candidateIds === null, 'editor');
    });
    const unsubscribeView = subscribeEditorViewState(editor, (change) => {
      if (destroyed || change !== 'authored') return;

      ensureFresh();
    });

    return () => {
      unsubscribeCommit();
      unsubscribeView();
    };
  };
  let unsubscribeEditor: (() => void) | null = null;
  const observe = (subscribe: () => () => void) => {
    if (destroyed) return () => {};

    ensureFresh();
    const unsubscribe = subscribe();
    subscriberCount += 1;
    if (activated && subscriberCount === 1) {
      unsubscribeEditor = subscribeToEditor();
    }
    let subscribed = true;
    return () => {
      if (!subscribed) return;
      subscribed = false;
      unsubscribe();
      subscriberCount -= 1;
      if (subscriberCount === 0) {
        unsubscribeEditor?.();
        unsubscribeEditor = null;
      }
    };
  };

  const refresh = (refreshOptions: AnnotationRefreshOptions = {}) => {
    if (!activated || destroyed || refreshOptions.ids?.length === 0) return;

    ensureFresh();
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
      if (subscriberCount > 0) unsubscribeEditor = subscribeToEditor();
    },
    destroy() {
      if (destroyed) return;

      destroyed = true;
      unsubscribeEditor?.();
      unsubscribeEditor = null;
      changeListeners.clear();
      annotationsStore.destroy();
    },
    getAnnotation: (id) => {
      ensureFresh();
      return annotationsStore.getSnapshot().byId.get(id) ?? null;
    },
    getAnnotationsAt: (nodeKey) => {
      ensureFresh();
      return Object.freeze(
        mappedSource
          .getIdsForOutputKeys([nodeKey])
          .flatMap((id) => annotationsStore.getSnapshot().byId.get(id) ?? [])
      );
    },
    getMetrics: () => metrics,
    getSourceStatus: () => faultBoundary.getStatus(),
    getSnapshot: () => {
      ensureFresh();
      return annotationsStore.getSnapshot();
    },
    refresh,
    retry() {
      if (!activated || destroyed) return;

      faultBoundary.activate();
      refreshCandidates(null, true);
    },
    subscribe: (listener) =>
      observe(() => annotationsStore.subscribe(listener)),
    subscribeAnnotation: (id, listener) =>
      observe(() => annotationsStore.subscribeKey(id, listener)),
    subscribeChanges: (listener) =>
      observe(() => {
        changeListeners.add(listener);
        return () => {
          changeListeners.delete(listener);
        };
      }),
  };

  return publicStore;
};

/** Read a lazy view index; editor observation lasts only while subscribed. */
export const createAnnotationStore = <
  TData = unknown,
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: EditorType<V, TPlugins>,
  source:
    | ReadonlyArray<Annotation<TData>>
    | (() => ReadonlyArray<Annotation<TData>>),
  options: AnnotationStoreOptions = {}
): AnnotationStore<TData> =>
  createPliteAnnotationStoreInternal(editor, source, options, false);

export const createDormantPliteAnnotationStore = <TData = unknown>(
  editor: unknown,
  source:
    | ReadonlyArray<Annotation<TData>>
    | (() => ReadonlyArray<Annotation<TData>>),
  options: AnnotationStoreOptions = {}
) => createPliteAnnotationStoreInternal(editor, source, options, true);
