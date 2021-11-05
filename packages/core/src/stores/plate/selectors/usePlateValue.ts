import { useCallback } from 'react';
import { usePlateStore } from '../plate.store';
import { getPlateState } from './getPlateState';

export const getPlateValue = <T = {}>(id?: string | null) =>
  getPlateState<T>(id)?.value;

export const usePlateValue = (id?: string | null) =>
  usePlateStore(useCallback(() => getPlateValue(id), [id]));
