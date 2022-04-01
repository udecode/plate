import { useAtom } from 'jotai';
import { plateIdAtom } from '../../plateIdAtom';

/**
 * Get plate editor id provided by PlateProvider.
 */
export const usePlateId = () => {
  const [plateId] = useAtom(plateIdAtom);

  return plateId;
};
