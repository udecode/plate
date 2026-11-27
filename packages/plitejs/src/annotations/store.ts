import {
  type Anchor,
  type Editor as EditorType,
  type EditorCommit,
  type NamedRootKey,
  type NodeKey,
  RangeApi,
  type Range,
  type Value,
} from '..';
import { getAnchorRuntimeId } from '../core/anchor';
import { getMovedAnchorIds } from '../core/anchor-state';
import { readAuthoredView } from '../core/authored-runtime';
import { notifyObservers } from '../core/lifecycle-error';
import { subscribeEditorViewState } from '../core/public-state';
import { projectRange as editorProjectRange } from '../editor/project-range';
import {
  type AnnotationStoreMetrics,
  registerAnnotationStoreMetrics,
} from '../internal/view/annotation-store-metrics';
import {
  areMappedViewDataEqual,
  createMappedViewStoreKernel,
  createViewSourceFaultBoundary,
} from '../internal/view/mapped-view-store';
import { createStableIdMappedSource } from '../internal/view/stable-id-mapped-source';
import type { ViewSourceErrorSink } from '../internal/view/view-source';

export type AnnotationAnchor = Pick<Anchor<Range>, 'resolve'> & {
  readonly root?: NamedRootKey;
};

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

export type AnnotationStoreOptions = Readonly<{
  /**
   * Resolve an annotation whose range covers no letter and no whole void to
   * `range: null`. It still follows the nodes its range touches, so an edit
   * there that brings content back resolves it again.
   */
  hideEmpty?: boolean;
  id?: string;
  onError?: ViewSourceErrorSink;
}>;

export interface AnnotationStore<TData = unknown> {
  getAnnotation: (id: string) => ResolvedAnnotation<TData> | null;
  getAnnotationsAt: (
    nodeKey: NodeKey
  ) => ReadonlyArray<ResolvedAnnotation<TData>>;
  getSnapshot: () => AnnotationSnapshot<TData>;
  refresh: (options?: AnnotationRefreshOptions) => void;
  subscribe: (listener: () => void) => () => void;
  subscribeAnnotation: (id: string, listener: () => void) => () => void;
  subscribeChanges: (
    listener: (change: AnnotationChange) => void
  ) => () => void;
}

export interface OwnedAnnotationStore<
  TData = unknown,
> extends AnnotationStore<TData> {
  destroy: () => void;
}

const authoredPreview = (editor: EditorType) => {
  const view = readAuthoredView(editor);

  return view && 'preview' in view ? view.preview : null;
};

const EMPTY_METRICS = Object.freeze({
  annotationResolveCount: 0,
  annotationSubscriberWakeCount: 0,
  changedAnnotationCount: 0,
  fullFallbackCount: 0,
  recomputeCount: 0,
}) as AnnotationStoreMetrics;

const assertUniqueAnnotationIds = <TData>(
  annotations: ReadonlyArray<Annotation<TData>>
) => {
  const ids = new Set<string>();

  for (const annotation of annotations) {
    if (ids.has(annotation.id)) {
      throw new Error(`Annotation IDs must be unique: "${annotation.id}".`);
    }

    ids.add(annotation.id);
  }
};

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

const shouldRefreshForEditorChange = (
  change: EditorCommit | undefined,
  root: NamedRootKey | undefined
) =>
  !change ||
  change.changed.has('document', root) ||
  change.changed.has('marks', root);

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

export type PliteAnnotationStoreOwner<TData = unknown> = {
  activate: () => void;
  destroy: () => void;
  getMetrics: () => AnnotationStoreMetrics;
  store: AnnotationStore<TData>;
};

const createPliteAnnotationStoreInternal = <TData>(
  editorInput: unknown,
  source:
    | ReadonlyArray<Annotation<TData>>
    | (() => ReadonlyArray<Annotation<TData>>),
  options: AnnotationStoreOptions,
  dormant: boolean
): PliteAnnotationStoreOwner<TData> => {
  const editor = editorInput as EditorType;
  const viewRoot = editor.read.view.root();
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
        if (
          'root' in annotation.anchor &&
          annotation.anchor.root !== viewRoot
        ) {
          return {
            entity: Object.freeze({
              data: annotation.data,
              id: annotation.id,
              range: null,
            }),
            outputs: [],
          };
        }
        mappedResolveCount += 1;
        const resolvedRange = annotation.anchor.resolve(editor);
        const sameRoot =
          resolvedRange !== null &&
          resolvedRange.anchor.root === resolvedRange.focus.root &&
          (resolvedRange.anchor.root === viewRoot ||
            (resolvedRange.anchor.root === undefined &&
              viewRoot !== undefined));
        const mappedRange = sameRoot
          ? projectAnnotationRange(editor, resolvedRange)
          : null;
        const range =
          sameRoot &&
          mappedRange &&
          !(options.hideEmpty && editor.read.ranges.isEmpty(resolvedRange))
            ? resolvedRange
            : null;

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

  if (initialAnnotationsResult.ok) {
    assertUniqueAnnotationIds(initialAnnotationsResult.value);
  }

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
  const annotationsStore = createMappedViewStoreKernel(toSnapshot(), editor);
  const changeListeners = new Set<(change: AnnotationChange) => void>();
  let metrics = Object.freeze({
    ...EMPTY_METRICS,
    annotationResolveCount: mappedResolveCount,
  });
  let activated = !dormant;
  let destroyed = false;
  let subscriberCount = 0;
  let lastSnapshot = dormant ? null : editor.read.runtime.snapshot();
  let lastProjection = dormant ? undefined : authoredPreview(editor);
  let lastSchema = dormant ? undefined : editor.read.schema.identity();
  const markFresh = () => {
    lastSnapshot = editor.read.runtime.snapshot();
    lastProjection = authoredPreview(editor);
    lastSchema = editor.read.schema.identity();
  };
  const schemaChanged = () =>
    options.hideEmpty === true && editor.read.schema.identity() !== lastSchema;

  const refreshCandidates = (
    candidateIds: readonly string[] | null = null,
    forceAll = candidateIds === null,
    reason: AnnotationChange['reason'] = 'refresh'
  ) => {
    const annotationsResult = faultBoundary.run('read', getAnnotations);

    if (!annotationsResult.ok) return;

    if (reason !== 'editor' || annotationsResult.value !== currentAnnotations) {
      assertUniqueAnnotationIds(annotationsResult.value);
    }

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
    markFresh();
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
      notifyObservers(editor, changeListeners, 'commit-listener', (listener) =>
        listener(change)
      );
    }
  };

  const ensureFresh = () => {
    if (!activated || destroyed) return;

    const snapshot = editor.read.runtime.snapshot();
    if (
      snapshot.children !== lastSnapshot?.children ||
      snapshot.index !== lastSnapshot?.index ||
      authoredPreview(editor) !== lastProjection ||
      schemaChanged()
    ) {
      refreshCandidates(null, true, 'editor');
    }
  };
  let anchorIds: Readonly<{
    annotations: ReadonlyArray<Annotation<TData>>;
    byRuntimeId: ReadonlyMap<number, readonly string[]>;
    unidentified: readonly string[];
  }> | null = null;
  const idsOfMovedAnchors = (change: EditorCommit | undefined) => {
    if (!change || !currentAnnotations) return [];
    const moved = getMovedAnchorIds(change);
    if (!moved) return [];
    const movedRuntimeIds: number[] = [];

    for (const anchor of change.changed.anchors()) {
      if (anchor.root !== viewRoot) continue;
      const runtimeId = getAnchorRuntimeId(anchor);

      if (runtimeId !== null && moved.has(runtimeId)) {
        movedRuntimeIds.push(runtimeId);
      }
    }
    if (movedRuntimeIds.length === 0) return [];
    if (anchorIds?.annotations !== currentAnnotations) {
      const byRuntimeId = new Map<number, string[]>();
      const unidentified: string[] = [];

      for (const { anchor, id } of currentAnnotations) {
        if ('root' in anchor && anchor.root !== viewRoot) continue;
        const runtimeId = getAnchorRuntimeId(anchor);

        if (runtimeId === null) {
          unidentified.push(id);
          continue;
        }

        const ids = byRuntimeId.get(runtimeId);

        if (ids) ids.push(id);
        else byRuntimeId.set(runtimeId, [id]);
      }
      anchorIds = {
        annotations: currentAnnotations,
        byRuntimeId,
        unidentified,
      };
    }

    const { byRuntimeId, unidentified } = anchorIds;

    return [
      ...unidentified,
      ...movedRuntimeIds.flatMap(
        (runtimeId) => byRuntimeId.get(runtimeId) ?? []
      ),
    ];
  };
  const subscribeToEditor = () => {
    const unsubscribeCommit = editor.subscribeCommit((change) => {
      if (destroyed) return;
      if (schemaChanged()) {
        refreshCandidates(null, true, 'editor');
        return;
      }
      const moved = idsOfMovedAnchors(change);

      if (
        !shouldRefreshForEditorChange(change, viewRoot) &&
        moved.length === 0
      ) {
        return;
      }
      if (authoredPreview(editor) !== lastProjection) {
        refreshCandidates(null, true, 'editor');
        return;
      }

      const candidateIds = change
        ? Array.from(
            new Set([
              ...mappedSource.getIdsForOutputKeys(
                change.changed.nodeKeys('decoration', viewRoot)
              ),
              ...moved,
              ...(change.changed.has('document', viewRoot)
                ? mappedSource.getIdsWithoutOutputs()
                : []),
            ])
          )
        : null;

      if (candidateIds && candidateIds.length === 0) {
        markFresh();
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

    faultBoundary.activate();
    ensureFresh();
    refreshCandidates(
      refreshOptions.ids ?? null,
      refreshOptions.ids === undefined,
      refreshOptions.reason ?? 'refresh'
    );
  };
  const store: AnnotationStore<TData> = {
    getAnnotation: (id) => {
      ensureFresh();
      return annotationsStore.getSnapshot().byId.get(id) ?? null;
    },
    getAnnotationsAt: (nodeKey) => {
      ensureFresh();
      return Object.freeze(
        mappedSource.getIdsForOutputKeys([nodeKey]).flatMap((id) => {
          const annotation = annotationsStore.getSnapshot().byId.get(id);
          return annotation?.range ? [annotation] : [];
        })
      );
    },
    getSnapshot: () => {
      ensureFresh();
      return annotationsStore.getSnapshot();
    },
    refresh,
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
  const owner: PliteAnnotationStoreOwner<TData> = {
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
    getMetrics: () => metrics,
    store,
  };

  Object.freeze(store);
  Object.freeze(owner);

  registerAnnotationStoreMetrics(store, owner.getMetrics);

  return owner;
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
): OwnedAnnotationStore<TData> => {
  const owner = createPliteAnnotationStoreInternal(
    editor,
    source,
    options,
    false
  );
  const store = Object.freeze({
    ...owner.store,
    destroy: owner.destroy,
  });

  registerAnnotationStoreMetrics(store, owner.getMetrics);

  return store;
};

export const createDormantPliteAnnotationStoreOwner = <TData = unknown>(
  editor: unknown,
  source:
    | ReadonlyArray<Annotation<TData>>
    | (() => ReadonlyArray<Annotation<TData>>),
  options: AnnotationStoreOptions = {}
) => createPliteAnnotationStoreInternal(editor, source, options, true);
