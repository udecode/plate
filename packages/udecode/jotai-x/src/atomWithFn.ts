import { atom } from 'jotai';

import type { WritableAtom } from 'jotai/vanilla';

type WrapFn<T> = T extends (...args: infer _A) => infer _R ? { __fn: T } : T;

const wrapFn = <T>(fnOrValue: T): WrapFn<T> =>
  (typeof fnOrValue === 'function' ? { __fn: fnOrValue } : fnOrValue) as any;

type UnwrapFn<T> = T extends { __fn: infer U } ? U : T;

const unwrapFn = <T>(wrappedFnOrValue: T): UnwrapFn<T> =>
  (wrappedFnOrValue &&
  typeof wrappedFnOrValue === 'object' &&
  '__fn' in wrappedFnOrValue
    ? wrappedFnOrValue.__fn
    : wrappedFnOrValue) as any;

/**
 * Jotai atoms don't allow functions as values by default. This function is a
 * drop-in replacement for `atom` that wraps functions in an object while
 * leaving non-functions unchanged. The wrapper object should be completely
 * invisible to consumers of the atom.
 */
export const atomWithFn = <T>(initialValue: T): WritableAtom<T, [T], void> => {
  const baseAtom = atom(wrapFn(initialValue));

  return atom(
    (get) => unwrapFn(get(baseAtom)) as T,
    (_get, set, value) => set(baseAtom, wrapFn(value))
  );
};
