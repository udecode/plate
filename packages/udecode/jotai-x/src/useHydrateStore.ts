import React from 'react';
import { atom, useSetAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';

import type {
  SimpleWritableAtom,
  SimpleWritableAtomRecord,
  UseHydrateAtoms,
  UseSyncAtoms,
} from './createAtomStore';

/**
 * Hydrate atoms with initial values for SSR.
 */
export const useHydrateStore = (
  atoms: SimpleWritableAtomRecord<any>,
  initialValues: Parameters<UseHydrateAtoms<any>>[0],
  options: Parameters<UseHydrateAtoms<any>>[1] = {}
) => {
  const values = React.useMemo(() => {
    const nextValues: any[] = [];

    for (const key of Object.keys(atoms)) {
      const initialValue = initialValues[key];

      if (initialValue !== undefined) {
        nextValues.push([atoms[key], initialValue]);
      }
    }

    return nextValues;
  }, [atoms, initialValues]);

  useHydrateAtoms(values, options);
};

/**
 * Update atoms with new values on changes.
 */
export const useSyncStore = (
  atoms: SimpleWritableAtomRecord<any>,
  values: any,
  {
    skipInitialValues,
    store: storeOption,
  }: Parameters<UseSyncAtoms<any>>[1] = {}
) => {
  const atomEntries = React.useMemo(
    () => Object.entries(atoms) as [string, SimpleWritableAtom<any>][],
    [atoms]
  );
  const syncAtom = React.useMemo(
    () =>
      atom(
        null,
        (
          _get,
          set,
          nextValues: { previousValues?: any; values: typeof values }
        ) => {
          const previousValues = nextValues.previousValues;

          for (const [key, writableAtom] of atomEntries) {
            const value = nextValues.values[key];

            if (value === undefined || value === null) continue;
            if (previousValues && Object.is(previousValues[key], value)) {
              continue;
            }

            set(writableAtom, value);
          }
        }
      ),
    [atomEntries]
  );
  const syncValues = useSetAtom(syncAtom, { store: storeOption });
  const previousValuesRef = React.useRef(skipInitialValues);

  React.useEffect(() => {
    syncValues({
      previousValues: previousValuesRef.current,
      values,
    });

    previousValuesRef.current = values;
  }, [syncValues, values]);
};
