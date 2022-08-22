/* eslint-disable react-hooks/rules-of-hooks */
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Atom, Scope, SetAtom } from 'jotai/core/atom';

type GetRecord<O> = {
  [K in keyof O]: (scope?: Scope) => O[K];
};
type SetRecord<O> = {
  [K in keyof O]: (scope?: Scope) => (value: O[K]) => void;
};
type UseRecord<O> = {
  [K in keyof O]: (scope?: Scope) => [O[K], SetAtom<O[K], void>];
};
type AtomRecord<O> = {
  [K in keyof O]: Atom<O[K]>;
};

type UseNameStore<N extends string = ''> = `use${Capitalize<N>}Store`;
type NameStore<N extends string = ''> = N extends '' ? 'store' : `${N}Store`;

export type AtomStoreApi<T, N extends string = ''> = {
  name: N;
} & {
  [key in keyof Record<NameStore<N>, {}>]: {
    atom: AtomRecord<T>;
    scope?: Scope;
    extend: <ET, EN>(
      extendedState: ET,
      options?: Omit<
        CreateAtomStoreOptions<{}, EN extends string ? EN : N>,
        'initialStore'
      >
    ) => AtomStoreApi<T & ET, EN extends string ? EN : N>;
  };
} &
  {
    [key in keyof Record<UseNameStore<N>, {}>]: () => {
      get: GetRecord<T>;
      set: SetRecord<T>;
      use: UseRecord<T>;
    };
  };

const capitalizeFirstLetter = (str = '') =>
  str.length ? str[0].toUpperCase() + str.slice(1) : '';
const getStoreIndex = (name = '') => (name.length ? `${name}Store` : 'store');
const getUseStoreIndex = (name = '') =>
  `use${capitalizeFirstLetter(name)}Store`;

export interface CreateAtomStoreOptions<U, N extends string> {
  scope?: Scope;
  initialStore?: AtomStoreApi<U, N>;
  name?: N;
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
export const createAtomStore = <T, IT, N extends string = ''>(
  initialState: T,
  {
    scope: storeScope,
    initialStore,
    name = '' as any,
  }: CreateAtomStoreOptions<IT, N> = {}
): AtomStoreApi<T & IT, N> => {
  const useInitialStoreIndex = getUseStoreIndex(initialStore?.name);
  const initialStoreIndex = getStoreIndex(initialStore?.name);
  const useStoreIndex = getUseStoreIndex(name);
  const storeIndex = getStoreIndex(name);

  const getAtoms = initialStore
    ? initialStore[useInitialStoreIndex]().get
    : ({} as GetRecord<T & IT>);
  const setAtoms = initialStore
    ? initialStore[useInitialStoreIndex]().set
    : ({} as SetRecord<T & IT>);
  const useAtoms = initialStore
    ? initialStore[useInitialStoreIndex]().use
    : ({} as UseRecord<T & IT>);
  const atoms = initialStore
    ? initialStore[initialStoreIndex].atom
    : ({} as AtomRecord<T & IT>);

  Object.keys(initialState).forEach((key) => {
    const atomConfig = atom(initialState[key]);

    atoms[key] = atomConfig;
    getAtoms[key] = (scope?: Scope) => {
      return useAtomValue(atomConfig, scope ?? storeScope);
    };
    setAtoms[key] = (scope?: Scope) => {
      return useSetAtom(atomConfig, scope ?? storeScope);
    };
    useAtoms[key] = (scope?: Scope) => {
      return useAtom(atomConfig, scope ?? storeScope);
    };
  });

  const api: any = {
    [useStoreIndex]: () => ({
      get: getAtoms,
      set: setAtoms,
      use: useAtoms,
    }),
    [storeIndex]: {
      atom: atoms,
    },
    name,
  };

  return {
    ...api,
    [storeIndex]: {
      ...api[storeIndex],
      scope: storeScope,
      extend: (extendedState: any, options: any) =>
        createAtomStore(extendedState, {
          scope: storeScope,
          initialStore: api,
          ...options,
        }),
    },
  } as any;
};
