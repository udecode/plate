import {
  type EditorCommit,
  RangeApi,
  type Range,
  type NodeKey,
  type Editor as EditorType,
} from '..';
import {
  subscribeAnnotationChanges,
  type PliteAnnotationStore,
  type PliteResolvedAnnotation,
} from './annotation-store';
import {
  failInvariant,
  getSelectionDOMRange,
  getSnapshot as editorGetSnapshot,
} from './editable/runtime-editor-api';
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

export type PliteWidgetTarget =
  | {
      annotationId: string;
      type: 'annotation';
    }
  | {
      type: 'node';
      nodeKey: NodeKey;
    }
  | {
      type: 'selection';
    };

/** UI descriptor targeted at an annotation, node key, or selection. */
export type PliteWidget<
  T extends Record<string, unknown> = Record<string, never>,
> = {
  data?: T;
  id: string;
  target: PliteWidgetTarget;
};

/** Latest resolved widget state for rendering floating or side-panel UI. */
export type PliteResolvedWidget<
  T extends Record<string, unknown> = Record<string, never>,
  TAnnotation extends Record<string, unknown> = Record<string, never>,
> = PliteWidget<T> & {
  annotation: PliteResolvedAnnotation<TAnnotation> | null;
  available: boolean;
  range: Range | null;
};

/** Ordered widget ids plus resolved widgets by id. */
export type PliteWidgetSnapshot<
  T extends Record<string, unknown> = Record<string, never>,
  TAnnotation extends Record<string, unknown> = Record<string, never>,
> = Readonly<{
  allIds: readonly string[];
  byId: ReadonlyMap<string, PliteResolvedWidget<T, TAnnotation>>;
}>;

/** Store that resolves app-owned widgets and notifies per-widget subscribers. */
export type PliteWidgetStore<
  T extends Record<string, unknown> = Record<string, never>,
  TAnnotation extends Record<string, unknown> = Record<string, never>,
> = {
  readonly editor: EditorType;
  destroy: () => void;
  getMetrics: () => PliteWidgetStoreMetrics;
  getSourceStatus: () => PliteViewSourceStatus;
  getSnapshot: () => PliteWidgetSnapshot<T, TAnnotation>;
  getWidget: (id: string) => PliteResolvedWidget<T, TAnnotation> | null;
  refresh: () => void;
  retry: () => void;
  subscribe: (listener: () => void) => () => void;
  subscribeWidget: (id: string, listener: () => void) => () => void;
};

export type PliteWidgetStoreOptions = Readonly<{
  id?: string;
  onError?: PliteViewSourceErrorSink;
}>;

/** Diagnostic counters for widget projection and subscriber fan-out. */
export type PliteWidgetStoreMetrics = Readonly<{
  changedWidgetCount: number;
  fullFallbackCount: number;
  recomputeCount: number;
  widgetResolveCount: number;
  widgetSubscriberWakeCount: number;
}>;

const EMPTY_METRICS = Object.freeze({
  changedWidgetCount: 0,
  fullFallbackCount: 0,
  recomputeCount: 0,
  widgetResolveCount: 0,
  widgetSubscriberWakeCount: 0,
}) as PliteWidgetStoreMetrics;

const isAvailableSelection = (range: Range | null) => !!range;

const areWidgetTargetsEqual = (
  left: PliteWidgetTarget,
  right: PliteWidgetTarget
) => {
  if (left.type !== right.type) return false;

  switch (left.type) {
    case 'annotation': {
      return (
        right.type === 'annotation' && left.annotationId === right.annotationId
      );
    }
    case 'node': {
      return right.type === 'node' && left.nodeKey === right.nodeKey;
    }
    case 'selection': {
      return true;
    }
  }

  return failInvariant('Unexpected widget anchor type');
};

const areWidgetInputsEqual = <T extends Record<string, unknown>>(
  left: PliteWidget<T>,
  right: PliteWidget<T>
) =>
  left.id === right.id &&
  areWidgetTargetsEqual(left.target, right.target) &&
  areMappedViewDataEqual(left.data, right.data);

const areResolvedWidgetsEqual = <
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  left: PliteResolvedWidget<T, TAnnotation>,
  right: PliteResolvedWidget<T, TAnnotation>
) =>
  areWidgetInputsEqual(left, right) &&
  left.annotation === right.annotation &&
  left.available === right.available &&
  RangeApi.equals(left.range, right.range);

type WidgetTargetIndex = {
  annotationIds: Map<string, string[]>;
  nodeKeys: Map<NodeKey, string[]>;
  selectionIds: string[];
};

const indexWidgetTargets = <T extends Record<string, unknown>>(
  widgets: ReadonlyArray<PliteWidget<T>>
): WidgetTargetIndex => {
  const index: WidgetTargetIndex = {
    annotationIds: new Map(),
    nodeKeys: new Map(),
    selectionIds: [],
  };

  for (const widget of widgets) {
    const { target } = widget;

    if (target.type === 'selection') {
      index.selectionIds.push(widget.id);
    } else if (target.type === 'node') {
      const ids = index.nodeKeys.get(target.nodeKey) ?? [];

      ids.push(widget.id);
      index.nodeKeys.set(target.nodeKey, ids);
    } else {
      const ids = index.annotationIds.get(target.annotationId) ?? [];

      ids.push(widget.id);
      index.annotationIds.set(target.annotationId, ids);
    }
  }

  return index;
};

/**
 * Commit-activated widget store used by React ownership hooks.
 *
 * @internal
 */
export type ActivatablePliteWidgetStore<
  T extends Record<string, unknown> = Record<string, never>,
  TAnnotation extends Record<string, unknown> = Record<string, never>,
> = PliteWidgetStore<T, TAnnotation> & {
  activate: () => void;
};

const createPliteWidgetStoreInternal = <
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  editor: EditorType,
  getWidgets: () => ReadonlyArray<PliteWidget<T>>,
  annotationStore: PliteAnnotationStore<TAnnotation> | null | undefined,
  options: PliteWidgetStoreOptions,
  dormant: boolean
): ActivatablePliteWidgetStore<T, TAnnotation> => {
  let destroyed = false;
  const faultBoundary = createViewSourceFaultBoundary({
    id: options.id ?? 'widgets',
    onError: options.onError,
  });
  let mappingEditorSnapshot = editorGetSnapshot(editor);
  let mappingAnnotationSnapshot = annotationStore?.getSnapshot() ?? null;
  const resolveWidget = (widget: PliteWidget<T>) => {
    let annotation: PliteResolvedAnnotation<TAnnotation> | null = null;
    let range: Range | null = null;
    let available = false;

    switch (widget.target.type) {
      case 'annotation': {
        annotation =
          mappingAnnotationSnapshot?.byId.get(widget.target.annotationId) ??
          null;
        range = annotation?.range ?? null;
        available = !!range;
        break;
      }
      case 'node': {
        available = Boolean(
          mappingEditorSnapshot.index.pathOf(widget.target.nodeKey)
        );
        break;
      }
      case 'selection': {
        range = getSelectionDOMRange(editor, mappingEditorSnapshot.selection);
        available = isAvailableSelection(range);
        break;
      }
    }

    return Object.freeze({
      ...widget,
      annotation,
      available,
      range,
    }) as PliteResolvedWidget<T, TAnnotation>;
  };
  const createMappedSource = (widgets: ReadonlyArray<PliteWidget<T>>) =>
    createStableIdMappedSource<
      PliteWidget<T>,
      PliteResolvedWidget<T, TAnnotation>,
      never
    >(widgets, {
      getId: (widget) => widget.id,
      isEntityEqual: areResolvedWidgetsEqual,
      isItemEqual: areWidgetInputsEqual,
      isOutputEqual: Object.is,
      map: (widget) => ({
        entity: resolveWidget(widget),
        outputs: [],
      }),
    });
  const initialWidgetsResult = dormant
    ? ({ ok: true, value: [] as ReadonlyArray<PliteWidget<T>> } as const)
    : faultBoundary.run('read', getWidgets);
  const initialMappedResult = initialWidgetsResult.ok
    ? faultBoundary.run('resolve', () =>
        createMappedSource(initialWidgetsResult.value)
      )
    : ({ ok: false } as const);
  const mappedSource = initialMappedResult.ok
    ? initialMappedResult.value
    : createMappedSource([]);
  let currentWidgets =
    initialMappedResult.ok && initialWidgetsResult.ok
      ? initialWidgetsResult.value
      : [];
  let targetIndex = indexWidgetTargets(currentWidgets);
  const toWidgetSnapshot = () => {
    const snapshot = mappedSource.getSnapshot();

    return Object.freeze({
      allIds: snapshot.allIds,
      byId: snapshot.byId,
    }) as PliteWidgetSnapshot<T, TAnnotation>;
  };
  const store = createMappedViewStoreKernel(toWidgetSnapshot());
  const initialWidgetCount = initialWidgetsResult.ok
    ? initialWidgetsResult.value.length
    : 0;
  let metrics = Object.freeze({
    ...EMPTY_METRICS,
    changedWidgetCount: initialWidgetCount,
    fullFallbackCount: initialWidgetsResult.ok ? 1 : 0,
    recomputeCount: initialWidgetCount > 0 ? 1 : 0,
    widgetResolveCount: initialWidgetCount,
  }) as PliteWidgetStoreMetrics;
  let activated = !dormant;

  const syncWidgets = (
    widgets: ReadonlyArray<PliteWidget<T>>,
    syncOptions: Readonly<{
      changedIds?: readonly string[];
      forceAll?: boolean;
      forceIds?: readonly string[];
    }> = {}
  ) => {
    mappingEditorSnapshot = editorGetSnapshot(editor);
    mappingAnnotationSnapshot = annotationStore?.getSnapshot() ?? null;
    const mappedResult = faultBoundary.run('resolve', () =>
      mappedSource.refresh(widgets, syncOptions)
    );

    if (!mappedResult.ok) return;

    if (!syncOptions.changedIds) targetIndex = indexWidgetTargets(widgets);
    currentWidgets = widgets;

    const changedWidgetIds = mappedResult.value.changedEntityIds;
    metrics = Object.freeze({
      ...metrics,
      fullFallbackCount:
        metrics.fullFallbackCount +
        (mappedResult.value.fullFallback || syncOptions.forceAll ? 1 : 0),
      widgetResolveCount:
        metrics.widgetResolveCount + mappedResult.value.mapped.length,
    });

    if (changedWidgetIds.length === 0 && !mappedResult.value.orderChanged) {
      return;
    }

    const widgetSubscriberWakeCount =
      store.subscriberCount() + store.countKeySubscribers(changedWidgetIds);
    metrics = Object.freeze({
      ...metrics,
      changedWidgetCount: metrics.changedWidgetCount + changedWidgetIds.length,
      recomputeCount: metrics.recomputeCount + 1,
      widgetSubscriberWakeCount:
        metrics.widgetSubscriberWakeCount + widgetSubscriberWakeCount,
    });
    store.publish(toWidgetSnapshot(), changedWidgetIds);
  };

  const readAndSyncWidgets = (
    syncOptions?: Readonly<{
      forceAll?: boolean;
      forceIds?: readonly string[];
    }>
  ) => {
    const widgetsResult = faultBoundary.run('read', getWidgets);

    if (widgetsResult.ok) {
      syncWidgets(widgetsResult.value, syncOptions);
    }
  };

  const getEditorChangeWidgetIds = (change: EditorCommit) => {
    const ids = new Set(
      change.selectionChanged ? targetIndex.selectionIds : []
    );

    if (targetIndex.nodeKeys.size > 0 && change.changed.hasAny('structure')) {
      const snapshot = editorGetSnapshot(editor);
      const widgets = store.getSnapshot().byId;

      for (const nodeKey of change.changed.nodeKeysAll('presence')) {
        const targets = targetIndex.nodeKeys.get(nodeKey);

        if (!targets) continue;
        const available = Boolean(snapshot.index.pathOf(nodeKey));

        for (const id of targets) {
          if (widgets.get(id)?.available !== available) ids.add(id);
        }
      }
    }

    return [...ids];
  };

  const subscribeToEditor = () =>
    editor.subscribeCommit((change) => {
      if (destroyed) {
        return;
      }

      const widgetsResult = faultBoundary.run('read', getWidgets);

      if (!widgetsResult.ok) return;
      const forceIds = getEditorChangeWidgetIds(change);

      if (forceIds.length > 0 || widgetsResult.value !== currentWidgets) {
        syncWidgets(
          widgetsResult.value,
          widgetsResult.value === currentWidgets
            ? { changedIds: forceIds }
            : { forceIds }
        );
      }
    });

  const subscribeToAnnotations = () =>
    annotationStore
      ? subscribeAnnotationChanges(annotationStore, (changedIds) => {
          if (destroyed) {
            return;
          }

          const widgetsResult = faultBoundary.run('read', getWidgets);

          if (!widgetsResult.ok) return;

          const forceIds = [
            ...new Set(
              changedIds === null
                ? [...targetIndex.annotationIds.values()].flat()
                : changedIds.flatMap(
                    (id) => targetIndex.annotationIds.get(id) ?? []
                  )
            ),
          ];

          if (forceIds.length > 0 || widgetsResult.value !== currentWidgets) {
            if (changedIds === null) {
              metrics = Object.freeze({
                ...metrics,
                fullFallbackCount: metrics.fullFallbackCount + 1,
              });
            }
            syncWidgets(
              widgetsResult.value,
              widgetsResult.value === currentWidgets
                ? { changedIds: forceIds }
                : { forceIds }
            );
          }
        })
      : undefined;
  let unsubscribeEditor = activated ? subscribeToEditor() : null;
  let unsubscribeAnnotation = activated ? subscribeToAnnotations() : null;

  return {
    activate() {
      if (activated || destroyed) return;

      activated = true;
      readAndSyncWidgets({ forceAll: true });
      unsubscribeEditor = subscribeToEditor();
      unsubscribeAnnotation = subscribeToAnnotations();
    },
    destroy() {
      if (destroyed) {
        return;
      }

      destroyed = true;
      unsubscribeEditor?.();
      unsubscribeAnnotation?.();
      store.destroy();
    },
    editor,
    getMetrics() {
      return metrics;
    },
    getSourceStatus() {
      return faultBoundary.getStatus();
    },
    getSnapshot() {
      return store.getSnapshot();
    },
    getWidget(id) {
      return store.getSnapshot().byId.get(id) ?? null;
    },
    refresh() {
      if (!activated || destroyed) {
        return;
      }

      readAndSyncWidgets();
    },
    retry() {
      if (!activated || destroyed) return;

      faultBoundary.activate();
      readAndSyncWidgets({ forceAll: true });
    },
    subscribe(listener) {
      return store.subscribe(listener);
    },
    subscribeWidget(id, listener) {
      return store.subscribeKey(id, listener);
    },
  };
};

/** Create a widget store backed by a live widget projector. */
export const createPliteWidgetStore = <
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  editor: EditorType,
  getWidgets: () => ReadonlyArray<PliteWidget<T>>,
  annotationStore?: PliteAnnotationStore<TAnnotation> | null,
  options: PliteWidgetStoreOptions = {}
): PliteWidgetStore<T, TAnnotation> =>
  createPliteWidgetStoreInternal(
    editor,
    getWidgets,
    annotationStore,
    options,
    false
  );

/**
 * Create an inert candidate for commit-owned React activation.
 *
 * @internal
 */
export const createDormantPliteWidgetStore = <
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  editor: EditorType,
  getWidgets: () => ReadonlyArray<PliteWidget<T>>,
  annotationStore?: PliteAnnotationStore<TAnnotation> | null,
  options: PliteWidgetStoreOptions = {}
) =>
  createPliteWidgetStoreInternal(
    editor,
    getWidgets,
    annotationStore,
    options,
    true
  );
