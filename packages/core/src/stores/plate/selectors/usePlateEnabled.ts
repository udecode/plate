import { useCallback } from 'react';
import { usePlateStore } from '../plate.store';
import { getPlateState } from './getPlateState';

export const getPlateEnabled = <T = {}>(id?: string | null) =>
  getPlateState<T>(id)?.enabled;

export const usePlateEnabled = (id?: string | null) =>
  usePlateStore(useCallback(() => getPlateEnabled(id), [id]));
