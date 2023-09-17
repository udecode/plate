import { useCallback } from 'react';

import { PlateId } from '../createPlateStore';
import { useIncrementVersion } from './useIncrementVersion';

export const useRedecorate = (id?: PlateId) => {
  const updateDecorate = useIncrementVersion('versionDecorate', id);

  return useCallback(() => {
    updateDecorate();
  }, [updateDecorate]);
};
