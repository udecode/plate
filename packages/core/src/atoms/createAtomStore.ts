/* eslint-disable react-hooks/rules-of-hooks */
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Scope } from 'jotai/core/atom';

type GetRecord<O> = {
  [K in keyof O]: (scope?: Scope) => O[K];
};
type SetRecord<O> = {
  [K in keyof O]: (value: O[K], scope?: Scope) => void;
};

type UseRecord<O> = {
  [K in keyof O]: (scope?: Scope) => [O[K], (value: O[K]) => void];
};

export type AtomStoreApi<T> = () => {
  get: GetRecord<T>;
  set: SetRecord<T>;
  use: UseRecord<T>;
};

/**
 * Create an atom store from an initial value.
 * Each property will have a getter and setter.
 * @example
 * const useStore = createAtomStore({ count: 1, say: 'hello' })
 * const count = useStore.get.
 */
export const createAtomStore = <T extends object>(
  initialValues: T,
  storeScope?: Scope
): AtomStoreApi<T> => {
  const getAtoms = {} as GetRecord<T>;
  const setAtoms = {} as SetRecord<T>;
  const useAtoms = {} as UseRecord<T>;

  Object.keys(initialValues).forEach((key) => {
    const atomConfig = atom(initialValues[key]);

    getAtoms[key] = (scope?: Scope) =>
      useAtomValue(atomConfig, scope ?? storeScope);
    setAtoms[key] = (scope?: Scope) =>
      useSetAtom(atomConfig, scope ?? storeScope);
    useAtoms[key] = (scope?: Scope) => useAtom(atomConfig, scope ?? storeScope);
  });

  return () => ({
    get: getAtoms,
    set: setAtoms,
    use: useAtoms,
  });
};
