import { atom, useAtom } from '../utils/index';

export const plateIdAtom = atom<string | null>(null);

/**
 * Get plate editor id provided by PlateProvider.
 */
export const usePlateId = () => {
  const [plateId] = useAtom(plateIdAtom);

  return plateId;
};
