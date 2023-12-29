import React from 'react';

import { PlateId } from '../createPlateStore';
import { useIncrementVersion } from './useIncrementVersion';

export const useRedecorate = (id?: PlateId) => {
  const updateDecorate = useIncrementVersion('versionDecorate', id);

  return React.useCallback(() => {
    updateDecorate();
  }, [updateDecorate]);
};
