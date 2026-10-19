import {
  createZustandStore as createVanillaZustandStore,
  type ZustandStoreApi,
  type ZustandStoreOptions,
} from '../../lib/libs/zustand';
import { useZustandSelector } from '../internal/useZustandSelector';

export type ReactZustandStoreApi<TState extends object> =
  ZustandStoreApi<TState> &
    Readonly<{
      useState: <TKey extends keyof TState>(
        key: TKey
      ) => readonly [TState[TKey], (value: TState[TKey]) => void];
      useStore: <TValue = TState>(
        selector?: (state: TState) => TValue
      ) => TValue;
      useValue: {
        (key: 'state'): TState;
        <TKey extends keyof TState>(key: TKey): TState[TKey];
      };
    }>;

export function createZustandStore<TState extends object>(
  initialState: TState,
  options: ZustandStoreOptions = {}
): ReactZustandStoreApi<TState> {
  const api = createVanillaZustandStore(initialState, options);
  const useStore = <TValue = TState>(
    selector: (state: TState) => TValue = (state) => state as unknown as TValue
  ) => useZustandSelector(api.store, selector);
  function useValue(key: 'state'): TState;
  function useValue<TKey extends keyof TState>(key: TKey): TState[TKey];
  function useValue(key: keyof TState | 'state') {
    return useStore((state) => (key === 'state' ? state : state[key]));
  }

  return {
    ...api,
    useState: (key) => [useValue(key), (value) => api.set(key, value)],
    useStore,
    useValue,
  };
}
