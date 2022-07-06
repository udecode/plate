import { atom, useAtom } from '../utils/index';

export const SCOPE_PLATE = Symbol('plate');

export const plateIdAtom = atom<string | null>(null);

/**
 * Get plate editor id provided by PlateProvider.
 */
export const usePlateId = (scope = SCOPE_PLATE) => {
  const [plateId] = useAtom(plateIdAtom, scope);

  return plateId;
};
