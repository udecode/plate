import { useCallback, useSyncExternalStore } from 'react';

import type {
  AnnotationSnapshot,
  AnnotationStore,
  ResolvedAnnotation,
} from '../../annotations';

/** Read one resolved annotation by id from an explicit store. */
export function useAnnotation<TData = unknown>(
  store: AnnotationStore<TData>,
  id: string
): ResolvedAnnotation<TData> | null {
  const subscribe = useCallback(
    (listener: () => void) => store.subscribeAnnotation(id, listener),
    [id, store]
  );
  const getSnapshot = useCallback(() => store.getAnnotation(id), [id, store]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Read the current annotation snapshot from an explicit store. */
export function useAnnotations<TData = unknown>(
  store: AnnotationStore<TData>
): AnnotationSnapshot<TData> {
  const subscribe = useCallback(
    (listener: () => void) => store.subscribe(listener),
    [store]
  );
  const getSnapshot = useCallback(() => store.getSnapshot(), [store]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
