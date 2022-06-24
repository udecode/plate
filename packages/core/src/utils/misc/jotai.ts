import { ComponentProps } from 'react';
import { atom, Provider, useAtom, useAtomValue, WritableAtom } from 'jotai';
import { Atom, Scope } from 'jotai/core/atom';

export type JotaiProviderProps = ComponentProps<typeof Provider>;

export type { Scope };

export const JotaiProvider = Provider;

export { atom, useAtom, useAtomValue };

export const createScopedAtomHook = (scope: Scope) => <
  Value,
  Update,
  Result extends void | Promise<void>
>(
  _atom: WritableAtom<Value, Update, Result>
) => useAtom(_atom, scope);

export const createScopedAtomValueHook = (scope: Scope) => <Value>(
  _atom: Atom<Value>
) => useAtomValue(_atom, scope);
