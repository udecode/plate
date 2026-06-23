import {
  type EditorCommit,
  PointApi,
  type Range,
  type RuntimeId,
  type Editor as PliteEditor,
} from '@platejs/plite';
import type {
  PliteAnnotationStore,
  PliteResolvedAnnotation,
} from './annotation-store';
import { Editor } from './editable/runtime-editor-api';
import { isPliteSourceDirty } from './projection-store';

export type PliteWidgetAnchor =
  | {
      annotationId: string;
      type: 'annotation';
    }
  | {
      type: 'node';
      runtimeId: RuntimeId;
    }
  | {
      type: 'selection';
    };

/** UI descriptor anchored to an annotation, node runtime id, or selection. */
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
  getSnapshot: () => PliteWidgetSnapshot<T, TAnnotation>;
  getWidget: (id: string) => PliteResolvedWidget<T, TAnnotation> | null;
  refresh: () => void;
  subscribe: (listener: () => void) => () => void;
  subscribeWidget: (id: string, listener: () => void) => () => void;
};

/** Diagnostic counters for widget projection and subscriber fan-out. */
export type PliteWidgetStoreMetrics = Readonly<{
  changedWidgetCount: number;
  fullFallbackCount: number;
  recomputeCount: number;
  widgetResolveCount: number;
  widgetSubscriberWakeCount: number;
}>;

const EMPTY_WIDGET_SNAPSHOT = Object.freeze({
  allIds: Object.freeze([]),
  byId: new Map(),
}) as PliteWidgetSnapshot<Record<string, never>, Record<string, never>>;
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

const shouldRecomputeForEditorChange = <T extends Record<string, unknown>>(
  widgets: readonly PliteWidget<T>[],
  change: EditorCommit | undefined,
  editor: PliteEditor
) => {
  if (!change) {
    return true;
  }

  const snapshot = Editor.getSnapshot(editor);

  return widgets.some((widget) => {
    switch (widget.anchor.type) {
      case 'selection':
        return isPliteSourceDirty('selection', {
          change,
          reason: 'editor',
          snapshot,
        });
      case 'node':
        return isPliteSourceDirty('node', {
          change,
          reason: 'editor',
          snapshot,
        });
      case 'annotation':
        return false;
    }

    return false;
  });
};

const buildWidgetSnapshot = <
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  previous: PliteWidgetSnapshot<T, TAnnotation>,
  widgets: readonly PliteWidget<T>[],
  editor: PliteEditor,
  annotationStore?: PliteAnnotationStore<TAnnotation> | null
) => {
  const editorSnapshot = Editor.getSnapshot(editor);
  const annotationSnapshot = annotationStore?.getSnapshot() ?? null;
  const allIds = widgets.map((widget) => widget.id);
  const byId = new Map<string, PliteResolvedWidget<T, TAnnotation>>();

  widgets.forEach((widget) => {
    let annotation: PliteResolvedAnnotation<TAnnotation> | null = null;
    let range: Range | null = null;
    let visible = false;

    switch (widget.anchor.type) {
      case 'annotation': {
        annotation =
          annotationSnapshot?.byId.get(widget.anchor.annotationId) ?? null;
        range = annotation?.range ?? null;
        visible = !!range;
        break;
      }

      case 'node': {
        visible = Boolean(
          editorSnapshot.index.idToPath[widget.anchor.runtimeId]
        );
        break;
      }

      case 'selection': {
        range = editorSnapshot.selection;
        visible = isVisibleSelection(range);
        break;
      }
    }

    byId.set(widget.id, {
      ...widget,
      annotation,
      range,
      visible,
    });
  });

  if (
    previous.allIds.length === allIds.length &&
    previous.allIds.every((id, index) => id === allIds[index]) &&
    allIds.every((id: string) => {
      const next = byId.get(id);
      const current = previous.byId.get(id);

      return (
        next &&
        current &&
        next.anchor === current.anchor &&
        Object.is(next.data, current.data) &&
        next.annotation === current.annotation &&
        sameRange(next.range, current.range) &&
        next.visible === current.visible
      );
    })
  ) {
    return previous;
  }

  return Object.freeze({
    allIds: Object.freeze(allIds),
    byId,
  }) as PliteWidgetSnapshot<T, TAnnotation>;
};

const getChangedWidgetIds = <
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  left: PliteWidgetSnapshot<T, TAnnotation>,
  right: PliteWidgetSnapshot<T, TAnnotation>
) => {
  const ids = new Set([...left.allIds, ...right.allIds]);
  const changedIds: string[] = [];

  ids.forEach((id) => {
    const leftWidget = left.byId.get(id);
    const rightWidget = right.byId.get(id);

    if (
      !leftWidget ||
      !rightWidget ||
      leftWidget.anchor !== rightWidget.anchor ||
      leftWidget.annotation !== rightWidget.annotation ||
      !Object.is(leftWidget.data, rightWidget.data) ||
      !sameRange(leftWidget.range, rightWidget.range) ||
      leftWidget.visible !== rightWidget.visible
    ) {
      changedIds.push(id);
    }
  });

  return changedIds;
};

/** Create a widget store backed by a live widget projector. */
export const createPliteWidgetStore = <
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  editor: PliteEditor,
  getWidgets: () => readonly PliteWidget<T>[],
  annotationStore?: PliteAnnotationStore<TAnnotation> | null
): PliteWidgetStore<T, TAnnotation> => {
  const listeners = new Set<() => void>();
  const widgetListeners = new Map<string, Set<() => void>>();
  let destroyed = false;
  let metrics = EMPTY_METRICS;
  let snapshot = EMPTY_WIDGET_SNAPSHOT as unknown as PliteWidgetSnapshot<
    T,
    TAnnotation
  >;

  const commitSnapshot = (
    nextSnapshot: PliteWidgetSnapshot<T, TAnnotation>
  ) => {
    if (nextSnapshot === snapshot) {
      return;
    }

    const changedWidgetIds = getChangedWidgetIds(snapshot, nextSnapshot);
    snapshot = nextSnapshot;
    metrics = Object.freeze({
      ...metrics,
      changedWidgetCount: metrics.changedWidgetCount + changedWidgetIds.length,
      recomputeCount: metrics.recomputeCount + 1,
      widgetSubscriberWakeCount:
        metrics.widgetSubscriberWakeCount +
        listeners.size +
        countMappedListeners(widgetListeners, changedWidgetIds),
    });
    notifyListeners(listeners);
    notifyMappedListeners(widgetListeners, changedWidgetIds);
  };

  const recomputeSnapshot = () => {
    const widgets = getWidgets();
    const nextSnapshot = buildWidgetSnapshot(
      snapshot,
      widgets,
      editor,
      annotationStore
    );

    metrics = Object.freeze({
      ...metrics,
      fullFallbackCount: metrics.fullFallbackCount + 1,
      widgetResolveCount: metrics.widgetResolveCount + widgets.length,
    });
    commitSnapshot(nextSnapshot);
  };

  const unsubscribeEditor = editor.subscribeCommit((change) => {
    if (destroyed) {
      return;
    }

    const widgets = getWidgets();

    if (!shouldRecomputeForEditorChange(widgets, change, editor)) {
      return;
    }

    const nextSnapshot = buildWidgetSnapshot(
      snapshot,
      widgets,
      editor,
      annotationStore
    );

    metrics = Object.freeze({
      ...metrics,
      fullFallbackCount: metrics.fullFallbackCount + 1,
      widgetResolveCount: metrics.widgetResolveCount + widgets.length,
    });
    commitSnapshot(nextSnapshot);
  });

  const unsubscribeAnnotation = annotationStore?.subscribe(() => {
    if (destroyed) {
      return;
    }

    recomputeSnapshot();
  });

  recomputeSnapshot();

  return {
    destroy() {
      if (destroyed) {
        return;
      }

      destroyed = true;
      unsubscribeEditor();
      unsubscribeAnnotation?.();
      listeners.clear();
      widgetListeners.clear();
    },
    getMetrics() {
      return metrics;
    },
    getSnapshot() {
      return snapshot;
    },
    getWidget(id) {
      return snapshot.byId.get(id) ?? null;
    },
    refresh() {
      if (destroyed) {
        return;
      }

      recomputeSnapshot();
    },
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    subscribeWidget(id, listener) {
      return addMappedListener(widgetListeners, id, listener);
    },
  };
};
