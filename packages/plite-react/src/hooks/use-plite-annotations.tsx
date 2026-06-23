import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from 'react';
import type {
  PliteAnnotationSnapshot,
  PliteAnnotationStore,
  PliteResolvedAnnotation,
} from '../annotation-store';

const EMPTY_SNAPSHOT = Object.freeze({
  allIds: Object.freeze([]),
  byId: new Map(),
}) as PliteAnnotationSnapshot<any, any>;

const subscribeEmpty = () => () => {};

const getEmptySnapshot = <
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
>() => EMPTY_SNAPSHOT as PliteAnnotationSnapshot<TData, TProjection>;

export const PliteAnnotationStoreContext = createContext<PliteAnnotationStore<
  any,
  any
> | null>(null);

const useResolvedPliteAnnotationStore = <
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
>(
  store?: PliteAnnotationStore<TData, TProjection> | null
) => {
  const contextStore = useContext(PliteAnnotationStoreContext);

  return (store ?? contextStore) as PliteAnnotationStore<
    TData,
    TProjection
  > | null;
};

/** Read one resolved annotation by id. */
export function usePliteAnnotation<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
>(
  id: string,
  store?: PliteAnnotationStore<TData, TProjection> | null
): PliteResolvedAnnotation<TData, TProjection> | null {
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
export function usePliteAnnotations<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
>(
  store?: PliteAnnotationStore<TData, TProjection> | null
): PliteAnnotationSnapshot<TData, TProjection> {
  const resolvedStore = useResolvedPliteAnnotationStore(store);
  const subscribe = useCallback(
    (listener: () => void) =>
      resolvedStore ? resolvedStore.subscribe(listener) : subscribeEmpty(),
    [resolvedStore]
  );
  const getSnapshot = useCallback(
    () =>
      resolvedStore?.getSnapshot() ?? getEmptySnapshot<TData, TProjection>(),
    [resolvedStore]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
