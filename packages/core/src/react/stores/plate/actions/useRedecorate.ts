import React from 'react';

import type { UsePlateEditorStoreOptions } from '../createPlateStore';

import { useIncrementVersion } from './useIncrementVersion';

export const useRedecorate = (
  id?: string,
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
