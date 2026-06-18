import { useMemo, useRef, useState } from 'react';
import type { Editor } from '@platejs/slate';

import {
  createSlateAnnotationStore,
  type SlateAnnotation,
  type SlateAnnotationStore,
} from '../annotation-store';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/** React-state projector used to refresh an annotation store. */
export type SlateAnnotationStoreProjector<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
> = {
  deps: readonly unknown[];
  project: () => readonly SlateAnnotation<TData, TProjection>[];
};

const isSlateAnnotationStoreProjector = <
  TData,
  TProjection extends Record<string, unknown>,
>(
  value:
    | readonly SlateAnnotation<TData, TProjection>[]
    | SlateAnnotationStoreProjector<TData, TProjection>
): value is SlateAnnotationStoreProjector<TData, TProjection> =>
  !Array.isArray(value);

/**
 * Create an annotation store from static annotations or a React-state projector.
 *
 * Projector `deps` own refresh freshness. The hook refreshes the store after
 * commits to the annotation input and destroys it when the component unmounts.
 */
export function useSlateAnnotationStore<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
>(
  editor: Editor,
  annotationsOrOptions:
    | readonly SlateAnnotation<TData, TProjection>[]
    | SlateAnnotationStoreProjector<TData, TProjection>
): SlateAnnotationStore<TData, TProjection> {
  const annotationDeps = isSlateAnnotationStoreProjector(annotationsOrOptions)
    ? annotationsOrOptions.deps
    : [annotationsOrOptions];
  const annotations = useMemo(
    () =>
      isSlateAnnotationStoreProjector(annotationsOrOptions)
        ? annotationsOrOptions.project()
        : annotationsOrOptions,
    // `deps` intentionally owns projector closure freshness.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    annotationDeps
  );
  const [annotationsCell] = useState(() => ({ current: annotations }));

  const store = useMemo(
    () => createSlateAnnotationStore(editor, () => annotationsCell.current),
    [annotationsCell, editor]
  );
  const storeRef = useRef(store);
  const effectVersionRef = useRef(0);

  storeRef.current = store;

  if (annotationsCell.current !== annotations) {
    annotationsCell.current = annotations;
  }

  useIsomorphicLayoutEffect(() => {
    annotationsCell.current = annotations;
    store.refresh();
  }, [annotations, annotationsCell, store]);

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
