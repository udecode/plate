import { useInsertionEffect, useMemo, useRef } from 'react';

import type { Editor } from '../..';
import {
  createDormantPliteAnnotationStore,
  type PliteAnnotation,
  type PliteAnnotationStore,
} from '../annotation-store';
import type { PliteViewSourceErrorSink } from '../view-source';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/** Options for a React-owned annotation store. */
export type UsePliteAnnotationStoreOptions = {
  id?: string;
  onError?: PliteViewSourceErrorSink;
  /** Explicit invalidation token for a mutable external annotation source. */
  revision?: unknown;
};

const createAnnotationStoreOwner = <
  TData,
  TProjection extends Record<string, unknown>,
>(
  editor: Editor,
  annotations: ReadonlyArray<PliteAnnotation<TData, TProjection>>,
  options: UsePliteAnnotationStoreOptions
) => {
  const annotationsCell = { current: annotations };
  const optionsCell = { current: options };
  const store = createDormantPliteAnnotationStore(
    editor,
    () => annotationsCell.current,
    {
      id: options.id,
      onError: (error) => optionsCell.current.onError?.(error),
    }
  );

  return { annotationsCell, optionsCell, store };
};

/**
 * Create an annotation store from a React-owned annotation value.
 *
 * New array identities refresh automatically. Pass `revision` only when an
 * external mutable source changes without producing a new array.
 */
export function usePliteAnnotationStore<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
>(
  editor: Editor,
  annotations: ReadonlyArray<PliteAnnotation<TData, TProjection>>,
  options: UsePliteAnnotationStoreOptions = {}
): PliteAnnotationStore<TData, TProjection> {
  const sourceId = options.id;
  // Data and callbacks seed a new owner, then publish only after commit.
  const owner = useMemo(
    () => createAnnotationStoreOwner(editor, annotations, options),
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- [P0 behavior-boundary] Editor and source id define owner identity; committed effects publish current annotations and callbacks into that owner.
    [editor, sourceId]
  );
  const { annotationsCell, optionsCell, store } = owner;
  const storeRef = useRef(store);
  const effectVersionRef = useRef(0);

  useInsertionEffect(() => {
    annotationsCell.current = annotations;
    optionsCell.current = options;
    storeRef.current = store;
    store.activate();
  }, [annotations, annotationsCell, options, optionsCell, store]);

  useIsomorphicLayoutEffect(() => {
    store.refresh();
  }, [annotations, annotationsCell, options.revision, store]);

  useIsomorphicLayoutEffect(() => {
    effectVersionRef.current += 1;
    const effectVersion = effectVersionRef.current;

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
