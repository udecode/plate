import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useSyncExternalStore,
} from 'react';

import type {
  PliteAnnotationSnapshot,
  PliteAnnotationStore,
  PliteResolvedAnnotation,
} from '../../annotations';

const EMPTY_SNAPSHOT = Object.freeze({
  allIds: Object.freeze([]),
  byId: new Map(),
}) as PliteAnnotationSnapshot;

const subscribeEmpty = () => () => {};

const getEmptySnapshot = <TData = unknown,>() =>
  EMPTY_SNAPSHOT as PliteAnnotationSnapshot<TData>;

export const PliteAnnotationStoreContext =
  createContext<PliteAnnotationStore | null>(null);

/** Provide one annotation store to annotation reader hooks. */
export const PliteAnnotationProvider = <TData,>({
  children,
  store,
}: {
  children: ReactNode;
  store: PliteAnnotationStore<TData>;
}) => (
  <PliteAnnotationStoreContext value={store}>
    {children}
  </PliteAnnotationStoreContext>
);

const useResolvedPliteAnnotationStore = <TData = unknown,>(
  store?: PliteAnnotationStore<TData> | null
) => {
  const contextStore = useContext(PliteAnnotationStoreContext);

  return (store ?? contextStore) as PliteAnnotationStore<TData> | null;
};

/** Read one resolved annotation by id. */
export function usePliteAnnotation<TData = unknown>(
  id: string,
  store?: PliteAnnotationStore<TData> | null
): PliteResolvedAnnotation<TData> | null {
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
export function usePliteAnnotations<TData = unknown>(
  store?: PliteAnnotationStore<TData> | null
): PliteAnnotationSnapshot<TData> {
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
