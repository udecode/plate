import React from 'react';

import { PlateId, UsePlateEditorStoreOptions } from '../createPlateStore';
import { useIncrementVersion } from './useIncrementVersion';

export const useRedecorate = (
  id?: PlateId,
  options: UsePlateEditorStoreOptions = {}
) => {
  const updateDecorate = useIncrementVersion('versionDecorate', id, {
    debugHookName: 'useRedecorate',
    ...options,
  });

  return React.useCallback(() => {
    updateDecorate();
  }, [updateDecorate]);
};
