import { useMemo, useRef, useState } from 'react';
import type { Editor } from '@platejs/slate';

import type { SlateAnnotationStore } from '../annotation-store';
import {
  createSlateWidgetStore,
  type SlateWidget,
  type SlateWidgetStore,
} from '../widget-store';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/** React-state projector used to refresh a widget store. */
export type SlateWidgetStoreProjector<
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
> = {
  annotationStore?: SlateAnnotationStore<TAnnotation> | null;
  deps: readonly unknown[];
  project: () => readonly SlateWidget<T>[];
};

const isSlateWidgetStoreProjector = <
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  value: readonly SlateWidget<T>[] | SlateWidgetStoreProjector<T, TAnnotation>
): value is SlateWidgetStoreProjector<T, TAnnotation> => !Array.isArray(value);

/**
 * Create a widget store from static widgets or an explicit React-state
 * projector.
 */
export function useSlateWidgetStore<
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  editor: Editor,
  widgetsOrOptions:
    | readonly SlateWidget<T>[]
    | SlateWidgetStoreProjector<T, TAnnotation>,
  annotationStoreArg?: SlateAnnotationStore<TAnnotation> | null
): SlateWidgetStore<T, TAnnotation> {
  const widgetDeps = isSlateWidgetStoreProjector(widgetsOrOptions)
    ? widgetsOrOptions.deps
    : [widgetsOrOptions];
  const widgets = useMemo(
    () =>
      isSlateWidgetStoreProjector(widgetsOrOptions)
        ? widgetsOrOptions.project()
        : widgetsOrOptions,
    // `deps` intentionally owns projector closure freshness.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    widgetDeps
  );
  const annotationStore = isSlateWidgetStoreProjector(widgetsOrOptions)
    ? widgetsOrOptions.annotationStore
    : annotationStoreArg;
  const [widgetsCell] = useState(() => ({ current: widgets }));

  const store = useMemo(
    () =>
      createSlateWidgetStore(
        editor,
        () => widgetsCell.current,
        annotationStore
      ),
    [annotationStore, editor, widgetsCell]
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
