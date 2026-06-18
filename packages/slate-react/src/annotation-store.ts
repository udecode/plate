import type {
  EditorCommit,
  Range,
  RuntimeId,
  Editor as SlateEditor,
} from '@platejs/slate';
import { Editor } from './editable/runtime-editor-api';
import type {
  SlateProjectionEntry,
  SlateProjectionStore,
} from './hooks/use-slate-projection-entries';

export interface SlateAnnotationAnchor {
  /** Resolve the annotation against the current committed editor snapshot. */
  resolve: () => Range | null;
  /** Release local anchor resources when the application removes it. */
  unref?: () => Range | null;
}

/** A durable, identified range owned by app or collaboration state. */
export interface SlateAnnotation<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
> {
  anchor: SlateAnnotationAnchor;
  data?: TData;
  id: string;
  projection?: TProjection;
}

/** The latest resolved form of one annotation. */
export interface SlateResolvedAnnotation<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
> {
  data?: TData;
  id: string;
  projection?: TProjection;
  range: Range | null;
}

/** Ordered annotation ids plus resolved annotations by id. */
export interface SlateAnnotationSnapshot<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
> {
  allIds: readonly string[];
  byId: ReadonlyMap<string, SlateResolvedAnnotation<TData, TProjection>>;
}

export type SlateAnnotationProjectionData<
  TProjection extends Record<string, unknown> = Record<string, unknown>,
> = TProjection & {
  annotationId: string;
};

/** Refresh all annotations, no annotations, or a known subset of ids. */
export type SlateAnnotationRefreshOptions = Readonly<{
  ids?: readonly string[];
  reason?: 'annotation' | 'external' | 'refresh';
}>;

export type SlateAnnotationStoreMetrics = Readonly<{
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

/**
 * Store that resolves app-owned annotations and exposes both sidebar snapshots
 * and text projection data.
 */
export interface SlateAnnotationStore<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
> {
  destroy: () => void;
  getAnnotation: (
    id: string
  ) => SlateResolvedAnnotation<TData, TProjection> | null;
  getMetrics: () => SlateAnnotationStoreMetrics;
  getSnapshot: () => SlateAnnotationSnapshot<TData, TProjection>;
  projectionStore: SlateProjectionStore<
    SlateAnnotationProjectionData<TProjection>
  >;
  refresh: (options?: SlateAnnotationRefreshOptions) => void;
  subscribe: (listener: () => void) => () => void;
  subscribeAnnotation: (id: string, listener: () => void) => () => void;
}

const EMPTY_ANNOTATION_IDS: readonly string[] = Object.freeze([]);
const EMPTY_ANNOTATION_BY_ID = new Map<string, SlateResolvedAnnotation>();
const EMPTY_ANNOTATION_SNAPSHOT = Object.freeze({
  allIds: EMPTY_ANNOTATION_IDS,
  byId: EMPTY_ANNOTATION_BY_ID,
}) as SlateAnnotationSnapshot<any, any>;
const EMPTY_PROJECTION_SNAPSHOT = Object.freeze({}) as Readonly<
  Record<string, readonly SlateProjectionEntry<SlateAnnotationProjectionData>[]>
>;
const EMPTY_PROJECTION_ENTRIES = Object.freeze(
  []
) as readonly SlateProjectionEntry<SlateAnnotationProjectionData>[];
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
}) as SlateAnnotationStoreMetrics;

const INVALID_ANNOTATION_RANGE_ERROR =
  /Cannot project a range outside the committed snapshot|Point offset .* is outside text bounds/;

const isInvalidAnnotationRangeError = (error: unknown) =>
  error instanceof Error && INVALID_ANNOTATION_RANGE_ERROR.test(error.message);

const addMappedListener = (
  listeners: Map<string, Set<() => void>>,
  id: string,
  listener: () => void
) => {
  let listenersForId = listeners.get(id);

  if (!listenersForId) {
    listenersForId = new Set();
    listeners.set(id, listenersForId);
  }

  listenersForId.add(listener);

  return () => {
    listenersForId.delete(listener);

    if (listenersForId.size === 0) {
      listeners.delete(id);
    }
  };
};

const notifyListeners = (listeners: Iterable<() => void>) => {
  for (const listener of listeners) {
    listener();
  }
};

const notifyMappedListeners = (
  listeners: Map<string, Set<() => void>>,
  ids: readonly string[]
) => {
  for (const id of ids) {
    notifyListeners(listeners.get(id) ?? []);
  }
};

const countMappedListeners = (
  listeners: Map<string, Set<() => void>>,
  ids: readonly string[]
) => ids.reduce((count, id) => count + (listeners.get(id)?.size ?? 0), 0);

const areRangesEqual = (left: Range | null, right: Range | null) => {
  if (left === right) return true;
  if (!left || !right) return false;

  return (
    left.anchor.offset === right.anchor.offset &&
    left.focus.offset === right.focus.offset &&
    left.anchor.path.length === right.anchor.path.length &&
    left.focus.path.length === right.focus.path.length &&
    left.anchor.path.every(
      (segment, index) => segment === right.anchor.path[index]
    ) &&
    left.focus.path.every(
      (segment, index) => segment === right.focus.path[index]
    )
  );
};

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

const annotationProjectionDataSources = new WeakMap<object, unknown>();

const createAnnotationProjectionData = <
  TProjection extends Record<string, unknown>,
>(
  annotation: SlateResolvedAnnotation<unknown, TProjection>
) => {
  const data = {
    ...(annotation.projection ?? {}),
    annotationId: annotation.id,
  } as SlateAnnotationProjectionData<TProjection>;

  annotationProjectionDataSources.set(data, annotation.projection);

  return data;
};

const getAnnotationProjectionDataSource = (data: unknown) => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const key = data as object;

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
        (left as SlateAnnotationProjectionData | undefined)?.annotationId ===
          (right as SlateAnnotationProjectionData | undefined)?.annotationId &&
        Object.is(leftSource.source, rightSource.source)
    );
  }

  return areDataEqual(left, right);
};

const projectAnnotationRange = (editor: SlateEditor, range: Range) => {
  try {
    return Editor.projectRange(editor, range);
  } catch (error) {
    if (isInvalidAnnotationRangeError(error)) {
      return null;
    }

    throw error;
  }
};

const resolveAnnotationRange = (
  editor: SlateEditor,
  anchor: SlateAnnotationAnchor
) => {
  const range = anchor.resolve();

  if (!range) {
    return null;
  }

  return projectAnnotationRange(editor, range) ? range : null;
};

const buildAnnotationSnapshot = <
  TData,
  TProjection extends Record<string, unknown>,
>(
  editor: SlateEditor,
  annotations: readonly SlateAnnotation<TData, TProjection>[]
): SlateAnnotationSnapshot<TData, TProjection> => {
  if (annotations.length === 0) {
    return EMPTY_ANNOTATION_SNAPSHOT;
  }

  const allIds = Object.freeze(annotations.map((annotation) => annotation.id));
  const byId = new Map<string, SlateResolvedAnnotation<TData, TProjection>>();

  annotations.forEach((annotation) => {
    byId.set(annotation.id, {
      data: annotation.data,
      id: annotation.id,
      projection: annotation.projection,
      range: resolveAnnotationRange(editor, annotation.anchor),
    });
  });

  return Object.freeze({
    allIds,
    byId,
  });
};

const haveSameAnnotationIds = <
  TData,
  TProjection extends Record<string, unknown>,
>(
  snapshot: SlateAnnotationSnapshot<TData, TProjection>,
  annotations: readonly SlateAnnotation<TData, TProjection>[]
) =>
  snapshot.allIds.length === annotations.length &&
  snapshot.allIds.every((id, index) => id === annotations[index]?.id);

const buildAnnotationSnapshotForCandidates = <
  TData,
  TProjection extends Record<string, unknown>,
>(
  editor: SlateEditor,
  current: SlateAnnotationSnapshot<TData, TProjection>,
  annotations: readonly SlateAnnotation<TData, TProjection>[],
  candidateAnnotationIds: readonly string[] | null
) => {
  if (!candidateAnnotationIds || !haveSameAnnotationIds(current, annotations)) {
    return {
      fullFallback: true,
      resolveCount: annotations.length,
      snapshot: buildAnnotationSnapshot(editor, annotations),
    };
  }

  if (candidateAnnotationIds.length === 0) {
    return {
      fullFallback: false,
      resolveCount: 0,
      snapshot: current,
    };
  }

  const annotationsById = new Map(
    annotations.map((annotation) => [annotation.id, annotation])
  );
  const byId = new Map(current.byId);

  candidateAnnotationIds.forEach((id) => {
    const annotation = annotationsById.get(id);

    if (!annotation) {
      return;
    }

    byId.set(id, {
      data: annotation.data,
      id: annotation.id,
      projection: annotation.projection,
      range: resolveAnnotationRange(editor, annotation.anchor),
    });
  });

  return {
    fullFallback: false,
    resolveCount: candidateAnnotationIds.length,
    snapshot: Object.freeze({
      allIds: current.allIds,
      byId,
    }) as SlateAnnotationSnapshot<TData, TProjection>,
  };
};

const buildProjectionSnapshot = <
  TData,
  TProjection extends Record<string, unknown>,
>(
  editor: SlateEditor,
  annotationSnapshot: SlateAnnotationSnapshot<TData, TProjection>
): Readonly<
  Record<
    RuntimeId,
    readonly SlateProjectionEntry<SlateAnnotationProjectionData<TProjection>>[]
  >
> => {
  if (annotationSnapshot.allIds.length === 0) {
    return EMPTY_PROJECTION_SNAPSHOT as Readonly<
      Record<
        RuntimeId,
        readonly SlateProjectionEntry<
          SlateAnnotationProjectionData<TProjection>
        >[]
      >
    >;
  }

  const projectionByRuntimeId: Record<
    string,
    readonly SlateProjectionEntry<SlateAnnotationProjectionData<TProjection>>[]
  > = Object.create(null);

  annotationSnapshot.allIds.forEach((annotationId) => {
    const annotation = annotationSnapshot.byId.get(annotationId);

    if (!annotation?.range) {
      return;
    }

    const projected = projectAnnotationRange(editor, annotation.range);

    if (!projected) {
      return;
    }

    projected.forEach((segment) => {
      const entries = [
        ...(projectionByRuntimeId[segment.runtimeId] ?? []),
        {
          data: createAnnotationProjectionData(annotation),
          end: segment.end,
          key: annotationId,
          start: segment.start,
        },
      ] as const;
      projectionByRuntimeId[segment.runtimeId] = entries;
    });
  });

  Object.keys(projectionByRuntimeId).forEach((runtimeId) => {
    projectionByRuntimeId[runtimeId] = Object.freeze(
      projectionByRuntimeId[runtimeId]!
    );
  });

  return Object.freeze(projectionByRuntimeId);
};

const buildProjectionSnapshotForCandidates = <
  TData,
  TProjection extends Record<string, unknown>,
>(
  editor: SlateEditor,
  current: Readonly<
    Record<
      RuntimeId,
      readonly SlateProjectionEntry<
        SlateAnnotationProjectionData<TProjection>
      >[]
    >
  >,
  annotationSnapshot: SlateAnnotationSnapshot<TData, TProjection>,
  candidateAnnotationIds: readonly string[] | null
) => {
  if (!candidateAnnotationIds) {
    return {
      fullFallback: true,
      projectCount: countProjectedAnnotations(annotationSnapshot),
      snapshot: buildProjectionSnapshot(editor, annotationSnapshot),
    };
  }

  if (candidateAnnotationIds.length === 0) {
    return {
      fullFallback: false,
      projectCount: 0,
      snapshot: current,
    };
  }

  const candidateSet = new Set(candidateAnnotationIds);
  const annotationOrder = new Map(
    annotationSnapshot.allIds.map((id, index) => [id, index])
  );
  const nextProjectionByRuntimeId: Record<
    RuntimeId,
    SlateProjectionEntry<SlateAnnotationProjectionData<TProjection>>[]
  > = Object.create(null);

  Object.entries(current).forEach(([runtimeId, entries]) => {
    const remainingEntries = entries.filter(
      (entry) => !candidateSet.has(entry.data?.annotationId ?? '')
    );

    if (remainingEntries.length > 0) {
      nextProjectionByRuntimeId[runtimeId] = [...remainingEntries];
    }
  });

  const candidateById = new Map<
    string,
    SlateResolvedAnnotation<TData, TProjection>
  >();

  candidateAnnotationIds.forEach((id) => {
    const annotation = annotationSnapshot.byId.get(id);

    if (annotation) {
      candidateById.set(id, annotation);
    }
  });

  const candidateProjectionSnapshot = buildProjectionSnapshot(editor, {
    allIds: Object.freeze([...candidateById.keys()]),
    byId: candidateById,
  });

  Object.entries(candidateProjectionSnapshot).forEach(
    ([runtimeId, entries]) => {
      nextProjectionByRuntimeId[runtimeId] = [
        ...(nextProjectionByRuntimeId[runtimeId] ?? []),
        ...entries,
      ];
    }
  );

  Object.keys(nextProjectionByRuntimeId).forEach((runtimeId) => {
    const entries = nextProjectionByRuntimeId[runtimeId]!;

    entries.sort((left, right) => {
      const leftOrder =
        annotationOrder.get(left.data?.annotationId ?? '') ??
        Number.MAX_SAFE_INTEGER;
      const rightOrder =
        annotationOrder.get(right.data?.annotationId ?? '') ??
        Number.MAX_SAFE_INTEGER;

      return leftOrder - rightOrder;
    });

    nextProjectionByRuntimeId[runtimeId] = Object.freeze(
      entries
    ) as SlateProjectionEntry<SlateAnnotationProjectionData<TProjection>>[];
  });

  return {
    fullFallback: false,
    projectCount: countProjectedAnnotations({
      allIds: Object.freeze([...candidateById.keys()]),
      byId: candidateById,
    }),
    snapshot: Object.freeze(nextProjectionByRuntimeId),
  };
};

const areAnnotationSnapshotsEqual = <
  TData,
  TProjection extends Record<string, unknown>,
>(
  left: SlateAnnotationSnapshot<TData, TProjection>,
  right: SlateAnnotationSnapshot<TData, TProjection>
) => {
  if (left === right) return true;
  if (left.allIds.length !== right.allIds.length) return false;

  for (let index = 0; index < left.allIds.length; index += 1) {
    if (left.allIds[index] !== right.allIds[index]) {
      return false;
    }

    const leftAnnotation = left.byId.get(left.allIds[index]!);
    const rightAnnotation = right.byId.get(right.allIds[index]!);

    if (!leftAnnotation || !rightAnnotation) {
      return false;
    }

    if (
      leftAnnotation.id !== rightAnnotation.id ||
      !areRangesEqual(leftAnnotation.range, rightAnnotation.range) ||
      !areDataEqual(leftAnnotation.data, rightAnnotation.data) ||
      !areDataEqual(leftAnnotation.projection, rightAnnotation.projection)
    ) {
      return false;
    }
  }

  return true;
};

const getChangedAnnotationIds = <
  TData,
  TProjection extends Record<string, unknown>,
>(
  left: SlateAnnotationSnapshot<TData, TProjection>,
  right: SlateAnnotationSnapshot<TData, TProjection>
) => {
  const ids = new Set([...left.allIds, ...right.allIds]);
  const changedIds: string[] = [];

  ids.forEach((id) => {
    const leftAnnotation = left.byId.get(id);
    const rightAnnotation = right.byId.get(id);

    if (
      !leftAnnotation ||
      !rightAnnotation ||
      leftAnnotation.id !== rightAnnotation.id ||
      !areRangesEqual(leftAnnotation.range, rightAnnotation.range) ||
      !areDataEqual(leftAnnotation.data, rightAnnotation.data) ||
      !areDataEqual(leftAnnotation.projection, rightAnnotation.projection)
    ) {
      changedIds.push(id);
    }
  });

  return changedIds;
};

const areProjectionSnapshotsEqual = (
  left: Readonly<Record<string, readonly SlateProjectionEntry[]>>,
  right: Readonly<Record<string, readonly SlateProjectionEntry[]>>
) => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) return false;

  for (const runtimeId of leftKeys) {
    if (!right[runtimeId]) {
      return false;
    }

    const leftEntries = left[runtimeId]!;
    const rightEntries = right[runtimeId]!;

    if (leftEntries.length !== rightEntries.length) {
      return false;
    }

    for (let index = 0; index < leftEntries.length; index += 1) {
      const leftEntry = leftEntries[index]!;
      const rightEntry = rightEntries[index]!;

      if (
        leftEntry.key !== rightEntry.key ||
        leftEntry.start !== rightEntry.start ||
        leftEntry.end !== rightEntry.end ||
        !areAnnotationProjectionDataEqual(leftEntry.data, rightEntry.data)
      ) {
        return false;
      }
    }
  }

  return true;
};

const getChangedProjectionRuntimeIds = (
  left: Readonly<Record<string, readonly SlateProjectionEntry[]>>,
  right: Readonly<Record<string, readonly SlateProjectionEntry[]>>
) => {
  const runtimeIds = new Set([...Object.keys(left), ...Object.keys(right)]);
  const changedRuntimeIds: string[] = [];

  runtimeIds.forEach((runtimeId) => {
    const leftEntries = left[runtimeId] ?? EMPTY_PROJECTION_ENTRIES;
    const rightEntries = right[runtimeId] ?? EMPTY_PROJECTION_ENTRIES;

    if (
      !areProjectionSnapshotsEqual(
        { [runtimeId]: leftEntries },
        { [runtimeId]: rightEntries }
      )
    ) {
      changedRuntimeIds.push(runtimeId);
    }
  });

  return changedRuntimeIds;
};

const buildAnnotationRuntimeIds = (
  projectionSnapshot: Readonly<
    Record<
      RuntimeId,
      readonly SlateProjectionEntry<SlateAnnotationProjectionData>[]
    >
  >
) => {
  const runtimeIdsByAnnotationId = new Map<string, Set<RuntimeId>>();

  Object.entries(projectionSnapshot).forEach(([runtimeId, entries]) => {
    entries.forEach((entry) => {
      const annotationId = entry.data?.annotationId;

      if (!annotationId) {
        return;
      }

      let runtimeIds = runtimeIdsByAnnotationId.get(annotationId);

      if (!runtimeIds) {
        runtimeIds = new Set();
        runtimeIdsByAnnotationId.set(annotationId, runtimeIds);
      }

      runtimeIds.add(runtimeId);
    });
  });

  return runtimeIdsByAnnotationId;
};

const getCandidateAnnotationIds = (
  change: EditorCommit | undefined,
  runtimeIdsByAnnotationId: ReadonlyMap<string, ReadonlySet<RuntimeId>>
) => {
  if (!change) {
    return null;
  }

  if (!shouldRefreshForEditorChange(change)) {
    return [];
  }

  if (
    change.fullDocumentChanged ||
    change.rootRuntimeIdsChanged ||
    change.topLevelOrderChanged
  ) {
    return null;
  }

  if (!change.decorationImpactRuntimeIds) {
    return null;
  }

  const impactedRuntimeIds = new Set(change.decorationImpactRuntimeIds);
  const annotationIds: string[] = [];

  runtimeIdsByAnnotationId.forEach((runtimeIds, annotationId) => {
    for (const runtimeId of runtimeIds) {
      if (impactedRuntimeIds.has(runtimeId)) {
        annotationIds.push(annotationId);
        return;
      }
    }
  });

  return annotationIds;
};

const countProjectedAnnotations = <
  TData,
  TProjection extends Record<string, unknown>,
>(
  annotationSnapshot: SlateAnnotationSnapshot<TData, TProjection>
) =>
  annotationSnapshot.allIds.reduce((count, id) => {
    const annotation = annotationSnapshot.byId.get(id);

    return annotation?.range ? count + 1 : count;
  }, 0);

const shouldRefreshForEditorChange = (change: EditorCommit | undefined) => {
  if (!change) {
    return true;
  }

  return (
    change.childrenChanged ||
    change.classes.includes('mark') ||
    change.classes.includes('replace') ||
    change.classes.includes('structural') ||
    change.classes.includes('text')
  );
};

export function createSlateAnnotationStore<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
>(
  editor: SlateEditor,
  source:
    | readonly SlateAnnotation<TData, TProjection>[]
    | (() => readonly SlateAnnotation<TData, TProjection>[])
): SlateAnnotationStore<TData, TProjection> {
  const getAnnotations = typeof source === 'function' ? source : () => source;

  const initialAnnotations = getAnnotations();
  let annotationSnapshot = buildAnnotationSnapshot(editor, initialAnnotations);
  let projectionSnapshot = buildProjectionSnapshot(editor, annotationSnapshot);
  let annotationRuntimeIds = buildAnnotationRuntimeIds(projectionSnapshot);
  let metrics = Object.freeze({
    ...EMPTY_METRICS,
    annotationProjectCount: countProjectedAnnotations(annotationSnapshot),
    annotationResolveCount: initialAnnotations.length,
  }) as SlateAnnotationStoreMetrics;
  const listeners = new Set<() => void>();
  const annotationListeners = new Map<string, Set<() => void>>();
  const projectionListeners = new Set<() => void>();
  const runtimeListeners = new Map<string, Set<() => void>>();

  const refreshCandidates = (
    candidateAnnotationIds: readonly string[] | null = null
  ) => {
    const annotations = getAnnotations();
    const annotationBuild = buildAnnotationSnapshotForCandidates(
      editor,
      annotationSnapshot,
      annotations,
      candidateAnnotationIds
    );
    const nextAnnotationSnapshot = annotationBuild.snapshot;
    const projectionBuild = buildProjectionSnapshotForCandidates(
      editor,
      projectionSnapshot,
      nextAnnotationSnapshot,
      candidateAnnotationIds
    );
    const nextProjectionSnapshot = projectionBuild.snapshot;
    const annotationChangedIds = getChangedAnnotationIds(
      annotationSnapshot,
      nextAnnotationSnapshot
    );
    const projectionChangedRuntimeIds = getChangedProjectionRuntimeIds(
      projectionSnapshot,
      nextProjectionSnapshot
    );

    metrics = Object.freeze({
      ...metrics,
      annotationProjectCount:
        metrics.annotationProjectCount + projectionBuild.projectCount,
      annotationResolveCount:
        metrics.annotationResolveCount + annotationBuild.resolveCount,
      fullFallbackCount:
        metrics.fullFallbackCount +
        (annotationBuild.fullFallback || projectionBuild.fullFallback ? 1 : 0),
    });

    if (
      areAnnotationSnapshotsEqual(annotationSnapshot, nextAnnotationSnapshot) &&
      areProjectionSnapshotsEqual(projectionSnapshot, nextProjectionSnapshot)
    ) {
      return;
    }

    annotationSnapshot = nextAnnotationSnapshot;
    projectionSnapshot = nextProjectionSnapshot;
    annotationRuntimeIds = buildAnnotationRuntimeIds(projectionSnapshot);

    metrics = Object.freeze({
      ...metrics,
      annotationSubscriberWakeCount:
        metrics.annotationSubscriberWakeCount +
        (annotationChangedIds.length > 0
          ? listeners.size +
            countMappedListeners(annotationListeners, annotationChangedIds)
          : 0),
      changedAnnotationCount:
        metrics.changedAnnotationCount + annotationChangedIds.length,
      changedRuntimeBucketCount:
        metrics.changedRuntimeBucketCount + projectionChangedRuntimeIds.length,
      projectionSubscriberWakeCount:
        metrics.projectionSubscriberWakeCount +
        (projectionChangedRuntimeIds.length > 0 ? projectionListeners.size : 0),
      recomputeCount: metrics.recomputeCount + 1,
      runtimeSubscriberWakeCount:
        metrics.runtimeSubscriberWakeCount +
        countMappedListeners(runtimeListeners, projectionChangedRuntimeIds),
    });

    if (annotationChangedIds.length > 0) {
      notifyListeners(listeners);
      notifyMappedListeners(annotationListeners, annotationChangedIds);
    }

    if (projectionChangedRuntimeIds.length > 0) {
      notifyListeners(projectionListeners);
      notifyMappedListeners(runtimeListeners, projectionChangedRuntimeIds);
    }
  };

  const unsubscribeEditor = Editor.subscribeCommit(editor, (change) => {
    const candidateAnnotationIds = getCandidateAnnotationIds(
      change,
      annotationRuntimeIds
    );

    if (candidateAnnotationIds && candidateAnnotationIds.length === 0) {
      return;
    }

    refreshCandidates(candidateAnnotationIds);
  });

  const refresh = (options: SlateAnnotationRefreshOptions = {}) => {
    if (options.ids && options.ids.length === 0) {
      return;
    }

    refreshCandidates(options.ids ?? null);
  };

  return {
    destroy() {
      unsubscribeEditor();
      listeners.clear();
      annotationListeners.clear();
      projectionListeners.clear();
      runtimeListeners.clear();
    },
    getAnnotation(id) {
      return annotationSnapshot.byId.get(id) ?? null;
    },
    getMetrics() {
      return metrics;
    },
    getSnapshot() {
      return annotationSnapshot;
    },
    projectionStore: {
      getRuntimeSnapshot(runtimeId) {
        return projectionSnapshot[runtimeId] ?? EMPTY_PROJECTION_ENTRIES;
      },
      getSnapshot() {
        return projectionSnapshot;
      },
      subscribe(listener) {
        projectionListeners.add(listener);
        return () => {
          projectionListeners.delete(listener);
        };
      },
      subscribeRuntimeId(runtimeId, listener) {
        return addMappedListener(runtimeListeners, runtimeId, listener);
      },
    },
    refresh,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    subscribeAnnotation(id, listener) {
      return addMappedListener(annotationListeners, id, listener);
    },
  };
}
