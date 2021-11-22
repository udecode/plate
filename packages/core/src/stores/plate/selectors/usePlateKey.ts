import { useCallback } from 'react';
import { PlateChangeKey } from '../../../types/PlateStore';
import { usePlateStore } from '../plate.store';
import { getPlateState } from './getPlateState';

export const usePlateKey = (key: PlateChangeKey, id?: string | null) =>
  usePlateStore(useCallback(() => getPlateState(id)?.[key], [id, key]));
