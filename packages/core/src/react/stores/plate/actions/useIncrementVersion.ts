import React from 'react';

import type { PlateChangeKey } from '../../../../lib/types/PlateStore';

import {
  type PlateId,
  type UsePlateEditorStoreOptions,
  usePlateActions,
} from '../createPlateStore';

export const useIncrementVersion = (
  key: PlateChangeKey,
  id?: PlateId,
  options: UsePlateEditorStoreOptions = {}
) => {
  const previousVersionRef = React.useRef(1);

  const set = usePlateActions(id, {
    debugHookName: 'useIncrementVersion',
    ...options,
  })[key]();

  return React.useCallback(() => {
    const nextVersion = previousVersionRef.current + 1;
    set(nextVersion);
    previousVersionRef.current = nextVersion;
  }, [set]);
};
