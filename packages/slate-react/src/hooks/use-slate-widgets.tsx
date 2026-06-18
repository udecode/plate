import { useCallback, useSyncExternalStore } from 'react';
import type {
  SlateResolvedWidget,
  SlateWidgetSnapshot,
  SlateWidgetStore,
} from '../widget-store';

/** Read one resolved widget by id. */
export function useSlateWidget<
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  store: SlateWidgetStore<T, TAnnotation>,
  id: string
): SlateResolvedWidget<T, TAnnotation> | null {
  const subscribe = useCallback(
    (listener: () => void) => store.subscribeWidget(id, listener),
    [id, store]
  );
  const getSnapshot = useCallback(() => store.getWidget(id), [id, store]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Read the current widget snapshot from a widget store. */
export function useSlateWidgets<
  T extends Record<string, unknown>,
  TAnnotation extends Record<string, unknown>,
>(
  store: SlateWidgetStore<T, TAnnotation>
): SlateWidgetSnapshot<T, TAnnotation> {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );
}
