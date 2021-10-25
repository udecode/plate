import { useEffect } from 'react';
import { TElement } from '@udecode/plate-core';
import { Atom, useAtom } from 'jotai';
import { elementAtom } from '../table.atoms';

/**
 * Set atom value in useEffect.
 */
export const useStoreAtom = (value: any, atom: Atom<any>) => {
  const [, setValue] = useAtom(atom);

  useEffect(() => {
    (setValue as any)(value);
  }, [setValue, value]);
};

/**
 * Set element atom.
 */
export const useStoreElementAtom = (element: TElement) => {
  useStoreAtom(element, elementAtom);
};
