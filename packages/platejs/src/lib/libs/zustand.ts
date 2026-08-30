import { create } from 'mutative';
import { createStore, type StoreApi } from 'zustand/vanilla';

export type ZustandStoreOptions = Readonly<{
  mutative?: boolean;
  name?: string;
}>;

export type ZustandStoreApi<TState extends object> = Readonly<{
  get: {
    (): TState;
    (key: 'state'): TState;
    <TKey extends keyof TState>(key: TKey): TState[TKey];
  };
  set: {
    (key: 'state', value: TState): void;
    <TKey extends keyof TState>(
      key: TKey,
      value: TState[TKey] | ((previous: TState[TKey]) => TState[TKey])
    ): void;
  };
  store: StoreApi<TState>;
  subscribe: StoreApi<TState>['subscribe'];
}>;

export function createZustandStore<TState extends object>(
  initialState: TState,
  options: ZustandStoreOptions = {}
): ZustandStoreApi<TState> {
  const store = createStore<TState>(() => initialState);

  function get(): TState;
  function get(key: 'state'): TState;
  function get<TKey extends keyof TState>(key: TKey): TState[TKey];
  function get(key?: keyof TState | 'state') {
    return key === undefined || key === 'state'
      ? store.getState()
      : store.getState()[key];
  }

  function set(key: 'state', value: TState): void;
  function set<TKey extends keyof TState>(
    key: TKey,
    value: TState[TKey] | ((previous: TState[TKey]) => TState[TKey])
  ): void;
  function set(
    key: keyof TState | 'state',
    value: TState | TState[keyof TState] | ((previous: unknown) => unknown)
  ) {
    if (key === 'state') {
      store.setState(value as TState, true);
      return;
    }

    const previous = store.getState()[key];
    const nextValue =
      typeof value === 'function' && typeof previous !== 'function'
        ? (value as (previous: unknown) => unknown)(previous)
        : value;

    if (Object.is(previous, nextValue)) return;

    store.setState(
      options.mutative
        ? create(store.getState(), (draft) => {
            (draft as Record<PropertyKey, unknown>)[key] = nextValue;
          })
        : ({ [key]: nextValue } as Partial<TState>)
    );
  }

  return {
    get,
    set,
    store,
    subscribe: store.subscribe,
  };
}
