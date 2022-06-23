import { CSSProperties } from 'react';
import { ELEMENT_IMAGE, TImageElement } from '@udecode/plate-image';
import { atom, useAtom, useAtomValue, useSetAtom, WritableAtom } from 'jotai';
import { Atom, Scope } from 'jotai/core/atom';

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

export const createScopedSetAtomHook = (scope: Scope) => <
  Value,
  Update,
  Result extends void | Promise<void>
>(
  _atom: WritableAtom<Value, Update, Result>
) => useSetAtom(_atom, scope);

export const useImageAtom = createScopedAtomHook(ELEMENT_IMAGE);
export const useImageSetAtom = createScopedSetAtomHook(ELEMENT_IMAGE);
export const useImageAtomValue = createScopedAtomValueHook(ELEMENT_IMAGE);

export const imageWidthAtom = atom<CSSProperties['width']>(0);
export const imageElementAtom = atom<TImageElement | null>(null);
