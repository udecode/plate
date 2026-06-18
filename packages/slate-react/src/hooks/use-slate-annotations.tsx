import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from 'react';
import type {
  SlateAnnotationSnapshot,
  SlateAnnotationStore,
  SlateResolvedAnnotation,
} from '../annotation-store';

const EMPTY_SNAPSHOT = Object.freeze({
  allIds: Object.freeze([]),
  byId: new Map(),
}) as SlateAnnotationSnapshot<any, any>;

const subscribeEmpty = () => () => {};

const getEmptySnapshot = <
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
>() => EMPTY_SNAPSHOT as SlateAnnotationSnapshot<TData, TProjection>;

export const SlateAnnotationStoreContext = createContext<SlateAnnotationStore<
  any,
  any
> | null>(null);

const useResolvedSlateAnnotationStore = <
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
>(
  store?: SlateAnnotationStore<TData, TProjection> | null
) => {
  const contextStore = useContext(SlateAnnotationStoreContext);

  return (store ?? contextStore) as SlateAnnotationStore<
    TData,
    TProjection
  > | null;
};

/** Read one resolved annotation by id. */
export function useSlateAnnotation<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
>(
  id: string,
  store?: SlateAnnotationStore<TData, TProjection> | null
): SlateResolvedAnnotation<TData, TProjection> | null {
  const resolvedStore = useResolvedSlateAnnotationStore(store);
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
export function useSlateAnnotations<
  TData = unknown,
  TProjection extends Record<string, unknown> = Record<string, unknown>,
>(
  store?: SlateAnnotationStore<TData, TProjection> | null
): SlateAnnotationSnapshot<TData, TProjection> {
  const resolvedStore = useResolvedSlateAnnotationStore(store);
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
