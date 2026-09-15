import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useSyncExternalStore,
} from 'react';

import type {
  AnnotationSnapshot,
  AnnotationStore,
  ResolvedAnnotation,
} from '../../annotations';

const EMPTY_SNAPSHOT = Object.freeze({
  allIds: Object.freeze([]),
  byId: new Map(),
}) as AnnotationSnapshot;

const subscribeEmpty = () => () => {};

const getEmptySnapshot = <TData = unknown,>() =>
  EMPTY_SNAPSHOT as AnnotationSnapshot<TData>;

export const PliteAnnotationStoreContext =
  createContext<AnnotationStore | null>(null);

/** Provide one annotation store to annotation reader hooks. */
export const AnnotationProvider = <TData,>({
  children,
  store,
}: {
  children: ReactNode;
  store: AnnotationStore<TData>;
}) => (
  <PliteAnnotationStoreContext value={store}>
    {children}
  </PliteAnnotationStoreContext>
);

const useResolvedPliteAnnotationStore = <TData = unknown,>(
  store?: AnnotationStore<TData> | null
) => {
  const contextStore = useContext(PliteAnnotationStoreContext);

  return (store ?? contextStore) as AnnotationStore<TData> | null;
};

/** Read one resolved annotation by id. */
export function useAnnotation<TData = unknown>(
  id: string,
  store?: AnnotationStore<TData> | null
): ResolvedAnnotation<TData> | null {
  const resolvedStore = useResolvedPliteAnnotationStore(store);
  const subscribe = useCallback(
    (listener: () => void) =>
      resolvedStore
        ? resolvedStore.subscribeAnnotation(id, listener)
        : subscribeEmpty(),
    [id, resolvedStore]
  );
  const getSnapshot = useCallback(
    () => resolvedStore?.getAnnotation(id) ?? null,
    [id, resolvedStore]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Read the current annotation snapshot from an explicit or provider store. */
export function useAnnotations<TData = unknown>(
  store?: AnnotationStore<TData> | null
): AnnotationSnapshot<TData> {
  const resolvedStore = useResolvedPliteAnnotationStore(store);
  const subscribe = useCallback(
    (listener: () => void) =>
      resolvedStore ? resolvedStore.subscribe(listener) : subscribeEmpty(),
    [resolvedStore]
  );
  const getSnapshot = useCallback(
    () => resolvedStore?.getSnapshot() ?? getEmptySnapshot<TData>(),
    [resolvedStore]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
