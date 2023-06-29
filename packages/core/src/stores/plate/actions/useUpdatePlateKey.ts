import { useCallback } from 'react';

import { nanoid } from '../../../libs/nanoid';
import { PlateChangeKey } from '../../../types/index';
import { PlateId, usePlateActions } from '../createPlateStore';

export const useUpdatePlateKey = (key: PlateChangeKey, id?: PlateId) => {
  const set = usePlateActions(id)[key]();

  return useCallback(() => {
    set(nanoid());
  }, [set]);
};
