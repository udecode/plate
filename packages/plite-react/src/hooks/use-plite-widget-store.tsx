import type { Editor } from '@platejs/plite';
import { useInsertionEffect, useMemo, useRef } from 'react';

import type { PliteAnnotationStore } from '../annotation-store';
import type { PliteViewSourceErrorSink } from '../view-source';
import {
  createDormantPliteWidgetStore,
  type PliteWidget,
  type PliteWidgetStore,
} from '../widget-store';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/** Options for a React-owned widget store. */
export type UsePliteWidgetStoreOptions<
  TAnnotation extends Record<string, unknown> = Record<string, unknown>,
> = {
  annotationStore?: PliteAnnotationStore<TAnnotation> | null;
  id?: string;
  onError?: PliteViewSourceErrorSink;
  /** Explicit invalidation token for a mutable external widget source. */
  revision?: unknown;
};

const createWidgetStoreOwner = <
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  editor: Editor,
  widgets: readonly PliteWidget<T>[],
  options: UsePliteWidgetStoreOptions<TAnnotation>
) => {
  const widgetsCell = { current: widgets };
  const optionsCell = { current: options };
  const store = createDormantPliteWidgetStore(
    editor,
    () => widgetsCell.current,
    options.annotationStore,
    {
      id: options.id,
      onError: (error) => optionsCell.current.onError?.(error),
    }
  );

  return { optionsCell, store, widgetsCell };
};

/**
 * Create a widget store from a React-owned widget value.
 *
 * New array identities refresh automatically. Pass `revision` only when an
 * external mutable source changes without producing a new array.
 */
export function usePliteWidgetStore<
  T extends Record<string, unknown> = Record<string, unknown>,
  TAnnotation extends Record<string, unknown> = Record<string, unknown>,
>(
  editor: Editor,
  widgets: readonly PliteWidget<T>[],
  options: UsePliteWidgetStoreOptions<TAnnotation> = {}
): PliteWidgetStore<T, TAnnotation> {
  const annotationStore = options.annotationStore;
  const sourceId = options.id;
  // Data and callbacks seed a new owner, then publish only after commit.
  const owner = useMemo(
    () => createWidgetStoreOwner(editor, widgets, options),
    [annotationStore, editor, sourceId]
  );
  const { optionsCell, store, widgetsCell } = owner;
  const storeRef = useRef(store);
  const effectVersionRef = useRef(0);

  useInsertionEffect(() => {
    widgetsCell.current = widgets;
    optionsCell.current = options;
    storeRef.current = store;
    store.activate();
  }, [options, optionsCell, store, widgets, widgetsCell]);

  useIsomorphicLayoutEffect(() => {
    store.refresh();
  }, [options.revision, store, widgets, widgetsCell]);

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
