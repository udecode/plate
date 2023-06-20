/* eslint-disable react-hooks/rules-of-hooks */
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
// eslint-disable-next-line import/no-unresolved
import { Atom, Scope, SetAtom } from 'jotai/core/atom';

export type GetRecord<O> = {
  [K in keyof O]: (scope?: Scope) => O[K];
};
export type SetRecord<O> = {
  [K in keyof O]: (scope?: Scope) => (value: O[K]) => void;
};
export type UseRecord<O> = {
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
} & {
  [key in keyof Record<UseNameStore<N>, {}>]: (scope?: Scope) => {
    get: GetRecord<T>;
    set: SetRecord<T>;
    use: UseRecord<T>;
  };
};

const capitalizeFirstLetter = (str = '') =>
  str.length > 0 ? str[0].toUpperCase() + str.slice(1) : '';
const getStoreIndex = (name = '') =>
  name.length > 0 ? `${name}Store` : 'store';
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
    ? (initialStore as any)[useInitialStoreIndex]().get
    : ({} as GetRecord<T & IT>);
  const setAtoms = initialStore
    ? (initialStore as any)[useInitialStoreIndex]().set
    : ({} as SetRecord<T & IT>);
  const useAtoms = initialStore
    ? (initialStore as any)[useInitialStoreIndex]().use
    : ({} as UseRecord<T & IT>);
  const atoms = initialStore
    ? (initialStore as any)[initialStoreIndex].atom
    : ({} as AtomRecord<T & IT>);

  Object.keys(initialState as any).forEach((key) => {
    const atomConfig = atom((initialState as any)[key]);

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
    [useStoreIndex]: (scope?: Scope) => {
      if (scope) {
        const getAtomsHook = { ...getAtoms };
        const setAtomsHook = { ...setAtoms };
        const useAtomsHook = { ...useAtoms };

        Object.keys(getAtomsHook).forEach((key) => {
          const get = getAtomsHook[key];
          getAtomsHook[key] = (_scope?: Scope) =>
            get(_scope ?? scope ?? storeScope);
        });
        Object.keys(setAtomsHook).forEach((key) => {
          const set = setAtomsHook[key];
          setAtomsHook[key] = (_scope?: Scope) =>
            set(_scope ?? scope ?? storeScope);
        });
        Object.keys(useAtomsHook).forEach((key) => {
          const use = useAtomsHook[key];
          useAtomsHook[key] = (_scope?: Scope) =>
            use(_scope ?? scope ?? storeScope);
        });

        return {
          get: getAtomsHook,
          set: setAtomsHook,
          use: useAtomsHook,
        };
      }

      return {
        get: getAtoms,
        set: setAtoms,
        use: useAtoms,
      };
    },
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
