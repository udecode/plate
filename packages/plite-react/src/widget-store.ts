import {
  type EditorCommit,
  PointApi,
  type Range,
  type NodeKey,
  type Editor as EditorType,
} from '@platejs/plite';

import type {
  PliteAnnotationStore,
  PliteResolvedAnnotation,
} from './annotation-store';
import { getSnapshot as editorGetSnapshot } from './editable/runtime-editor-api';
import {
  areMappedViewDataEqual,
  createMappedViewStoreKernel,
  createViewSourceFaultBoundary,
} from './mapped-view-store';
import { isPliteSourceDirty } from './projection-store';
import { createStableIdMappedSource } from './stable-id-mapped-source';
import type {
  PliteViewSourceErrorSink,
  PliteViewSourceStatus,
} from './view-source';

export type PliteWidgetAnchor =
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

/** UI descriptor anchored to an annotation, node node key, or selection. */
export type PliteWidget<
  T extends Record<string, unknown> = Record<string, never>,
> = {
  anchor: PliteWidgetAnchor;
  data?: T;
  id: string;
};

/** Latest resolved widget state for rendering floating or side-panel UI. */
export type PliteResolvedWidget<
  T extends Record<string, unknown> = Record<string, never>,
  TAnnotation extends Record<string, unknown> = Record<string, never>,
> = PliteWidget<T> & {
  annotation: PliteResolvedAnnotation<TAnnotation> | null;
  range: Range | null;
  visible: boolean;
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

const sameRange = (left: Range | null, right: Range | null) => {
  if (!left && !right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return (
    PointApi.equals(left.anchor, right.anchor) &&
    PointApi.equals(left.focus, right.focus)
  );
};

const isVisibleSelection = (range: Range | null) =>
  !!range && !PointApi.equals(range.anchor, range.focus);

const areWidgetAnchorsEqual = (
  left: PliteWidgetAnchor,
  right: PliteWidgetAnchor
) => {
  if (left.type !== right.type) return false;

  switch (left.type) {
    case 'annotation':
      return (
        right.type === 'annotation' && left.annotationId === right.annotationId
      );
    case 'node':
      return right.type === 'node' && left.nodeKey === right.nodeKey;
    case 'selection':
      return true;
  }
};

const areWidgetInputsEqual = <T extends Record<string, unknown>>(
  left: PliteWidget<T>,
  right: PliteWidget<T>
) =>
  left.id === right.id &&
  areWidgetAnchorsEqual(left.anchor, right.anchor) &&
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
  sameRange(left.range, right.range) &&
  left.visible === right.visible;

const getEditorChangeWidgetIds = <T extends Record<string, unknown>>(
  widgets: readonly PliteWidget<T>[],
  change: EditorCommit,
  editor: EditorType
) => {
  const snapshot = editorGetSnapshot(editor);
  const selectionDirty = isPliteSourceDirty('selection', {
    change,
    reason: 'editor',
    snapshot,
  });
  const nodesDirty = isPliteSourceDirty('node', {
    change,
    reason: 'editor',
    snapshot,
  });

  return widgets.flatMap((widget) => {
    if (widget.anchor.type === 'selection' && selectionDirty) {
      return [widget.id];
    }
    if (widget.anchor.type === 'node' && nodesDirty) {
      return [widget.id];
    }

    return [];
  });
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
  getWidgets: () => readonly PliteWidget<T>[],
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
    let visible = false;

    switch (widget.anchor.type) {
      case 'annotation': {
        annotation =
          mappingAnnotationSnapshot?.byId.get(widget.anchor.annotationId) ??
          null;
        range = annotation?.range ?? null;
        visible = !!range;
        break;
      }
      case 'node': {
        visible = Boolean(
          mappingEditorSnapshot.index.pathOf(widget.anchor.nodeKey)
        );
        break;
      }
      case 'selection': {
        range = mappingEditorSnapshot.selection;
        visible = isVisibleSelection(range);
        break;
      }
    }

    return Object.freeze({
      ...widget,
      annotation,
      range,
      visible,
    }) as PliteResolvedWidget<T, TAnnotation>;
  };
  const createMappedSource = (widgets: readonly PliteWidget<T>[]) =>
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
    ? ({ ok: true, value: [] as readonly PliteWidget<T>[] } as const)
    : faultBoundary.run('read', getWidgets);
  const initialMappedResult = initialWidgetsResult.ok
    ? faultBoundary.run('resolve', () =>
        createMappedSource(initialWidgetsResult.value)
      )
    : ({ ok: false } as const);
  const mappedSource = initialMappedResult.ok
    ? initialMappedResult.value
    : createMappedSource([]);
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
    widgets: readonly PliteWidget<T>[],
    syncOptions: Readonly<{
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

  const subscribeToEditor = () =>
    editor.subscribeCommit((change) => {
      if (destroyed) {
        return;
      }

      const widgetsResult = faultBoundary.run('read', getWidgets);

      if (!widgetsResult.ok) return;
      const forceIds = getEditorChangeWidgetIds(
        widgetsResult.value,
        change,
        editor
      );

      if (forceIds.length > 0) {
        syncWidgets(widgetsResult.value, { forceIds });
      }
    });

  const subscribeToAnnotations = () =>
    annotationStore?.subscribe(() => {
      if (destroyed) {
        return;
      }

      const widgetsResult = faultBoundary.run('read', getWidgets);

      if (!widgetsResult.ok) return;

      const forceIds = widgetsResult.value.flatMap((widget) =>
        widget.anchor.type === 'annotation' ? [widget.id] : []
      );

      if (forceIds.length > 0) {
        syncWidgets(widgetsResult.value, { forceIds });
      }
    });
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
  getWidgets: () => readonly PliteWidget<T>[],
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
  getWidgets: () => readonly PliteWidget<T>[],
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
