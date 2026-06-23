import { useMemo, useRef, useState } from 'react';
import type { Editor } from '@platejs/plite';

import {
  createPliteAnnotationStore,
  type PliteAnnotation,
  type PliteAnnotationStore,
} from '../annotation-store';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/** React-state projector used to refresh an annotation store. */
export type PliteAnnotationStoreProjector<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
> = {
  deps: readonly unknown[];
  project: () => readonly PliteAnnotation<TData, TProjection>[];
};

const isPliteAnnotationStoreProjector = <
  TData,
  TProjection extends Record<string, unknown>,
>(
  value:
    | readonly PliteAnnotation<TData, TProjection>[]
    | PliteAnnotationStoreProjector<TData, TProjection>
): value is PliteAnnotationStoreProjector<TData, TProjection> =>
  !Array.isArray(value);

/**
 * Create an annotation store from static annotations or a React-state projector.
 *
 * Projector `deps` own refresh freshness. The hook refreshes the store after
 * commits to the annotation input and destroys it when the component unmounts.
 */
export function usePliteAnnotationStore<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
>(
  editor: Editor,
  annotationsOrOptions:
    | readonly PliteAnnotation<TData, TProjection>[]
    | PliteAnnotationStoreProjector<TData, TProjection>
): PliteAnnotationStore<TData, TProjection> {
  const annotationDeps = isPliteAnnotationStoreProjector(annotationsOrOptions)
    ? annotationsOrOptions.deps
    : [annotationsOrOptions];
  const annotations = useMemo(
    () =>
      isPliteAnnotationStoreProjector(annotationsOrOptions)
        ? annotationsOrOptions.project()
        : annotationsOrOptions,
    // `deps` intentionally owns projector closure freshness.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    annotationDeps
  );
  const [annotationsCell] = useState(() => ({ current: annotations }));

  const store = useMemo(
    () => createPliteAnnotationStore(editor, () => annotationsCell.current),
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
