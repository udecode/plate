import { useCallback } from 'react';
import shallow from 'zustand/shallow';
import { usePlateStore } from '../plate.store';
import { getPlateState } from './getPlateState';

export const useStoreState = (id?: string | null) =>
  usePlateStore(
    useCallback((state) => getPlateState(state, id), [id]),
    shallow
  );
