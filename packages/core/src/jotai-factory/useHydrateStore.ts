import { useEffect } from 'react';
import { isDefined } from '@udecode/utils';
import { useSetAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';

import type {
  AtomRecord,
  UseHydrateAtoms,
  UseSyncAtoms,
} from './createAtomStore';

/**
 * Hydrate atoms with initial values for SSR.
 */
export const useHydrateStore = (
  atoms: AtomRecord<any>,
  initialValues: Parameters<UseHydrateAtoms<any>>[0],
  options: Parameters<UseHydrateAtoms<any>>[1] = {}
) => {
  const values: any[] = [];

  for (const key of Object.keys(atoms)) {
    const initialValue = initialValues[key];

    if (initialValue !== undefined) {
      values.push([
        atoms[key],
        typeof initialValue === 'function'
          ? { fn: initialValue }
          : initialValue,
      ]);
    }
  }

  useHydrateAtoms(values, options);
};

/**
 * Update atoms with new values on changes.
 */
export const useSyncStore = (
  atoms: AtomRecord<any>,
  values: any,
  { store }: Parameters<UseSyncAtoms<any>>[1] = {}
) => {
  for (const key of Object.keys(atoms)) {
    const value = values[key];
    const atom = atoms[key];

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const set = useSetAtom(atom, { store });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (isDefined(value)) {
        set(typeof value === 'function' ? { fn: value } : value);
      }
    }, [set, value]);
  }
};
