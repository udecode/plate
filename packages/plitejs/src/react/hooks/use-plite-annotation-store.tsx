import { useInsertionEffect, useMemo, useRef } from 'react';

import type { Editor, Value } from '../..';
import {
  createDormantPliteAnnotationStoreOwner,
  type Annotation,
  type AnnotationStore,
} from '../../annotations/store';
import type { ViewSourceErrorSink } from '../../internal/view/view-source';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/** Options for a React-owned annotation store. */
export type UseAnnotationStoreOptions = {
  id?: string;
  onError?: ViewSourceErrorSink;
  /** Explicit invalidation token for a mutable external annotation source. */
  revision?: unknown;
};

const createAnnotationStoreOwner = <TData,>(
  editor: unknown,
  annotations: ReadonlyArray<Annotation<TData>>,
  options: UseAnnotationStoreOptions
) => {
  const annotationsCell = { current: annotations };
  const optionsCell = { current: options };
  const storeOwner = createDormantPliteAnnotationStoreOwner(
    editor,
    () => annotationsCell.current,
    {
      id: options.id,
      onError: (error) => optionsCell.current.onError?.(error),
    }
  );

  return { annotationsCell, optionsCell, storeOwner };
};

/**
 * Create an annotation store from a React-owned annotation value.
 *
 * New array identities refresh automatically. Pass `revision` only when an
 * external mutable source changes without producing a new array.
 */
export function useAnnotationStore<
  TData = unknown,
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TPlugins>,
  annotations: ReadonlyArray<Annotation<TData>>,
  options: UseAnnotationStoreOptions = {}
): AnnotationStore<TData> {
  const sourceId = options.id;
  // Data and callbacks seed a new owner, then publish only after commit.
  const owner = useMemo(
    () => createAnnotationStoreOwner(editor, annotations, options),
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- [P0 behavior-boundary] Editor and source id define owner identity; committed effects publish current annotations and callbacks into that owner.
    [editor, sourceId]
  );
  const { annotationsCell, optionsCell, storeOwner } = owner;
  const { store } = storeOwner;
  const storeOwnerRef = useRef(storeOwner);
  const effectVersionRef = useRef(0);

  useInsertionEffect(() => {
    annotationsCell.current = annotations;
    optionsCell.current = options;
    storeOwnerRef.current = storeOwner;
    storeOwner.activate();
  }, [annotations, annotationsCell, options, optionsCell, storeOwner]);

  useIsomorphicLayoutEffect(() => {
    store.refresh();
  }, [annotations, annotationsCell, options.revision, store]);

  useIsomorphicLayoutEffect(() => {
    effectVersionRef.current += 1;
    const effectVersion = effectVersionRef.current;

    return () => {
      queueMicrotask(() => {
        if (
          storeOwnerRef.current !== storeOwner ||
          effectVersionRef.current === effectVersion
        ) {
          storeOwner.destroy();
        }
      });
    };
  }, [storeOwner]);

  return store;
}
