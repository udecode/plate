import { useCallback } from 'react';
import { PlateChangeKey } from '../../../types/index';
import { nanoid } from '../../../types/misc/nanoid';
import { PlateId, usePlateActions } from '../createPlateStore';

export const useUpdatePlateKey = (key: PlateChangeKey, id?: PlateId) => {
  const set = usePlateActions(id)[key]();

  return useCallback(() => {
    set(nanoid());
  }, [set]);
};
