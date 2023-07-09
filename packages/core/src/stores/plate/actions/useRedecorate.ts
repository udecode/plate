import { useCallback } from 'react';

import { PlateId } from '../createPlateStore';
import { useUpdatePlateKey } from './useUpdatePlateKey';

export const useRedecorate = (id?: PlateId) => {
  const updateDecorate = useUpdatePlateKey('keyDecorate', id);

  return useCallback(() => {
    updateDecorate();
  }, [updateDecorate]);
};
