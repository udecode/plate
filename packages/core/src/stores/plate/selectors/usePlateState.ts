import { useCallback } from 'react';
import shallow from 'zustand/shallow';
import { usePlateStore } from '../plate.store';
import { getPlateState } from './getPlateState';

export const usePlateState = (id?: string | null) =>
  usePlateStore(
    useCallback(() => getPlateState(id), [id]),
    shallow
  );
