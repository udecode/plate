import { useCallback } from 'react';
import { usePlateStore } from '../plate.store';
import { getPlateState } from './getPlateState';

export const useStorePlate = (id?: string | null) =>
  usePlateStore(
    useCallback((state) => getPlateState(state, id)?.plugins, [id])
  );
