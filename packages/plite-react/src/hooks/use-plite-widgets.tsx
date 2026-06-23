import { useCallback, useSyncExternalStore } from 'react';
import type {
  PliteResolvedWidget,
  PliteWidgetSnapshot,
  PliteWidgetStore,
} from '../widget-store';

/** Read one resolved widget by id. */
export function usePliteWidget<
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  store: PliteWidgetStore<T, TAnnotation>,
  id: string
): PliteResolvedWidget<T, TAnnotation> | null {
  const subscribe = useCallback(
    (listener: () => void) => store.subscribeWidget(id, listener),
    [id, store]
  );
  const getSnapshot = useCallback(() => store.getWidget(id), [id, store]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Read the current widget snapshot from a widget store. */
export function usePliteWidgets<
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  store: PliteWidgetStore<T, TAnnotation>
): PliteWidgetSnapshot<T, TAnnotation> {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );
}
