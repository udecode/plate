import { useCallback, useRef } from 'react';

import { PlateChangeKey } from '../../../types/index';
import { PlateId, usePlateActions } from '../createPlateStore';

export const useIncrementVersion = (key: PlateChangeKey, id?: PlateId) => {
  const previousVersionRef = useRef(1);

  const set = usePlateActions(id)[key]();

  return useCallback(() => {
    const nextVersion = previousVersionRef.current + 1;
    set(nextVersion);
    previousVersionRef.current = nextVersion;
  }, [set]);
};
