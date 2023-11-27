/* eslint-disable react-hooks/rules-of-hooks */

import type { FC } from 'react';
import {
  atom,
  useAtom,
  useAtomValue,
  useSetAtom,
  type PrimitiveAtom,
} from 'jotai';
import type { useHydrateAtoms } from 'jotai/utils';
import type { createStore } from 'jotai/vanilla';

import {
  createAtomProvider,
  getStoreScope,
  useContextStore,
  type ProviderProps,
} from './createAtomProvider';

type WithInitialValue<Value> = {
  init: Value;
};
type Atom<Value> = PrimitiveAtom<Value> & WithInitialValue<Value>;
export type JotaiStore = ReturnType<typeof createStore>;

export type UseAtomOptions = {
  scope?: string;
  store?: JotaiStore;
  delay?: number;
};

type UseAtomOptionsOrScope = UseAtomOptions | string;

export type GetRecord<O> = {
  [K in keyof O]: (options?: UseAtomOptionsOrScope) => O[K];
};
export type SetRecord<O> = {
  [K in keyof O]: (options?: UseAtomOptionsOrScope) => (value: O[K]) => void;
};
export type UseRecord<O> = {
  [K in keyof O]: (options?: UseAtomOptionsOrScope) => [O[K], (value: O[K]) => void];
};
export type AtomRecord<O> = {
  [K in keyof O]: Atom<O[K]>;
};

type UseNameStore<N extends string = ''> = `use${Capitalize<N>}Store`;
type NameStore<N extends string = ''> = N extends '' ? 'store' : `${N}Store`;
type NameProvider<N extends string = ''> = `${Capitalize<N>}Provider`;
export type UseHydrateAtoms<T> = (
  initialValues: Partial<Record<keyof T, any>>,
  options?: Parameters<typeof useHydrateAtoms>[1]
) => void;
export type UseSyncAtoms<T> = (
  values: Partial<Record<keyof T, any>>,
  options?: {
    store?: JotaiStore;
  }
) => void;

export type StoreApi<T extends object, N extends string = ''> = {
  atom: AtomRecord<T>;
  name: N;
  extend: <ET, EN>(
    extendedState: ET,
    options?: Omit<
      CreateAtomStoreOptions<object, EN extends string ? EN : N>,
      'initialStore'
    >
  ) => AtomStoreApi<T & ET, EN extends string ? EN : N>;
};

export type UseStoreApi<T> = (options?: UseAtomOptionsOrScope) => {
  get: GetRecord<T>;
  set: SetRecord<T>;
  use: UseRecord<T>;
};

export type AtomStoreApi<T extends object, N extends string = ''> = {
  name: N;
} & {
  [key in keyof Record<NameProvider<N>, object>]: FC<ProviderProps<T>>;
} & {
  [key in keyof Record<NameStore<N>, object>]: StoreApi<T, N>;
} & {
  [key in keyof Record<UseNameStore<N>, object>]: UseStoreApi<T>;
};

const capitalizeFirstLetter = (str = '') =>
  str.length > 0 ? str[0].toUpperCase() + str.slice(1) : '';
const getProviderIndex = (name = '') =>
  `${capitalizeFirstLetter(name)}Provider`;
const getStoreIndex = (name = '') =>
  name.length > 0 ? `${name}Store` : 'store';
const getUseStoreIndex = (name = '') =>
  `use${capitalizeFirstLetter(name)}Store`;

const withDefaultOptions = <T>(atomRecord: AtomRecord<T>, defaultOptions: UseAtomOptions): AtomRecord<T> =>
  Object.fromEntries(
    Object.entries(atomRecord).map(([key, fn]) => [
      key,
      (options: UseAtomOptions = {}) => (fn as any)({ ...defaultOptions, ...options }),
    ])
  ) as any;

const convertScopeShorthand = (optionsOrScope: UseAtomOptionsOrScope = {}): UseAtomOptions =>
  typeof optionsOrScope === 'string' ? { scope: optionsOrScope } : optionsOrScope;

export interface CreateAtomStoreOptions<T extends object, N extends string> {
  store?: UseAtomOptions['store'];
  delay?: UseAtomOptions['delay'];
  initialStore?: AtomStoreApi<T, N>;
  name?: N;
  effect?: FC;
}

/**
 * Create an atom store from an initial value.
 * Each property will have a getter and setter.
 *
 * @example
 * const { exampleStore, useExampleStore } = createAtomStore({ count: 1, say: 'hello' }, { name: 'example' as const })
 * const [count, setCount] = useExampleStore().use.count()
 * const say = useExampleStore().get.say()
 * const setSay = useExampleStore().set.say()
 * setSay('world')
 * const countAtom = exampleStore.atom.count
 */
export const createAtomStore = <
  T extends object,
  IT extends object,
  N extends string = '',
>(
  initialState: T,
  {
    delay: delayRoot,
    initialStore,
    name = '' as any,
    effect,
  }: CreateAtomStoreOptions<IT, N> = {}
): AtomStoreApi<T & IT, N> => {
  const useInitialStoreIndex = getUseStoreIndex(initialStore?.name) as UseNameStore<N>;
  const initialStoreIndex = getStoreIndex(initialStore?.name) as NameStore<N>;
  const providerIndex = getProviderIndex(name) as NameProvider<N>;
  const useStoreIndex = getUseStoreIndex(name) as UseNameStore<N>;
  const storeIndex = getStoreIndex(name) as NameStore<N>;

  // FIXME: These constants have type any
  const getAtoms = initialStore
    ? (initialStore[useInitialStoreIndex] as any)().get
    : ({} as GetRecord<T & IT>);
  const setAtoms = initialStore
    ? (initialStore[useInitialStoreIndex] as any)().set
    : ({} as SetRecord<T & IT>);
  const useAtoms = initialStore
    ? (initialStore[useInitialStoreIndex] as any)().use
    : ({} as UseRecord<T & IT>);
  const atoms = initialStore
    ? (initialStore[initialStoreIndex] as any).atom
    : ({} as AtomRecord<T & IT>);

  for (const key of Object.keys(initialState)) {
    const atomConfig = atom(initialState[key as keyof T]);

    atoms[key] = atomConfig;
    getAtoms[key] = (optionsOrScope: UseAtomOptionsOrScope = {}) => {
      const options = convertScopeShorthand(optionsOrScope);
      const contextStore = useContextStore(getStoreScope(name, options.scope));

      return useAtomValue(atomConfig, {
        store: options.store ?? contextStore,
        delay: options.delay ?? delayRoot,
      });
    };
    setAtoms[key] = (optionsOrScope: UseAtomOptionsOrScope = {}) => {
      const options = convertScopeShorthand(optionsOrScope);
      const contextStore = useContextStore(getStoreScope(name, options.scope));

      return useSetAtom(atomConfig, {
        store: options.store ?? contextStore,
      });
    };
    useAtoms[key] = (optionsOrScope: UseAtomOptionsOrScope = {}) => {
      const options = convertScopeShorthand(optionsOrScope);
      const contextStore = useContextStore(getStoreScope(name, options.scope));

      return useAtom(atomConfig, {
        store: options.store ?? contextStore,
        delay: options.delay ?? delayRoot,
      });
    };
  }


  const api: any = {
    [providerIndex]: createAtomProvider(name, atoms, { effect }),
    [useStoreIndex]: (options: UseAtomOptionsOrScope = {}) => ({
      get: withDefaultOptions(getAtoms, convertScopeShorthand(options)),
      set: withDefaultOptions(setAtoms, convertScopeShorthand(options)),
      use: withDefaultOptions(useAtoms, convertScopeShorthand(options)),
    }),
    [storeIndex]: {
      atom: atoms,
      name,
    },
    name,
  };

  return {
    ...api,
    [storeIndex]: {
      ...api[storeIndex],
      extend: (extendedState: any, options: any) =>
        createAtomStore(extendedState, {
          initialStore: api,
          ...options,
        }),
    },
  };
};
