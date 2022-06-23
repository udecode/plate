import { TElement } from '@udecode/plate-core';
import { atom } from 'jotai';
import {
  createScopedAtomHook,
  createScopedAtomValueHook,
} from '../ImageElement/imageAtoms';

export const elementAtom = atom<TElement | null>(null);

export const SCOPE_NODE = Symbol('node');

export const useNodeAtom = createScopedAtomHook(SCOPE_NODE);
export const useNodeAtomValue = createScopedAtomValueHook(SCOPE_NODE);

export const useElement = <T extends TElement = TElement>() => {
  const value = useNodeAtomValue(elementAtom);

  if (!value)
    throw new Error(
      `The \`useElement\` hook must be used inside the node component's context`
    );

  return value as T;
};
