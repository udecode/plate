import { useMemo, useRef, useState } from 'react';
import type { Editor } from '@platejs/plite';

import type { PliteAnnotationStore } from '../annotation-store';
import {
  createPliteWidgetStore,
  type PliteWidget,
  type PliteWidgetStore,
} from '../widget-store';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';
import type { PliteViewSourceErrorSink } from '../view-source';

/** React-state projector used to refresh a widget store. */
export type PliteWidgetStoreProjector<
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
> = {
  annotationStore?: PliteAnnotationStore<TAnnotation> | null;
  deps: readonly unknown[];
  id?: string;
  onError?: PliteViewSourceErrorSink;
  project: () => readonly PliteWidget<T>[];
};

const isPliteWidgetStoreProjector = <
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  value: readonly PliteWidget<T>[] | PliteWidgetStoreProjector<T, TAnnotation>
): value is PliteWidgetStoreProjector<T, TAnnotation> => !Array.isArray(value);

/**
 * Create a widget store from static widgets or an explicit React-state
 * projector.
 */
export function usePliteWidgetStore<
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  editor: Editor,
  widgetsOrOptions:
    | readonly PliteWidget<T>[]
    | PliteWidgetStoreProjector<T, TAnnotation>,
  annotationStoreArg?: PliteAnnotationStore<TAnnotation> | null
): PliteWidgetStore<T, TAnnotation> {
  const widgetDeps = isPliteWidgetStoreProjector(widgetsOrOptions)
    ? widgetsOrOptions.deps
    : [widgetsOrOptions];
  const widgets = useMemo(
    () =>
      isPliteWidgetStoreProjector(widgetsOrOptions)
        ? widgetsOrOptions.project()
        : widgetsOrOptions,
    // `deps` intentionally owns projector closure freshness.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    widgetDeps
  );
  const annotationStore = isPliteWidgetStoreProjector(widgetsOrOptions)
    ? widgetsOrOptions.annotationStore
    : annotationStoreArg;
  const sourceId = isPliteWidgetStoreProjector(widgetsOrOptions)
    ? widgetsOrOptions.id
    : undefined;
  const onError = isPliteWidgetStoreProjector(widgetsOrOptions)
    ? widgetsOrOptions.onError
    : undefined;
  const [widgetsCell] = useState(() => ({ current: widgets }));

  const store = useMemo(
    () =>
      createPliteWidgetStore(
        editor,
        () => widgetsCell.current,
        annotationStore,
        {
          id: sourceId,
          onError,
        }
      ),
    [annotationStore, editor, onError, sourceId, widgetsCell]
  );
  const storeRef = useRef(store);
  const effectVersionRef = useRef(0);

  storeRef.current = store;

  if (widgetsCell.current !== widgets) {
    widgetsCell.current = widgets;
  }

  useIsomorphicLayoutEffect(() => {
    widgetsCell.current = widgets;
    store.refresh();
  }, [store, widgets, widgetsCell]);

  useIsomorphicLayoutEffect(() => {
    const effectVersion = ++effectVersionRef.current;

    return () => {
      queueMicrotask(() => {
        if (
          storeRef.current !== store ||
          effectVersionRef.current === effectVersion
        ) {
          store.destroy();
        }
      });
    };
  }, [store]);

  return store;
}
