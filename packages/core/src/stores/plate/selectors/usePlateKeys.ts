import { useCallback } from 'react';
import { usePlateStore } from '../plate.store';
import { getPlateState } from './getPlateState';

export const getPlateKeys = <T = {}>(id?: string | null) =>
  getPlateState<T>(id)?.pluginKeys;

export const usePlateKeys = (id?: string | null) =>
  usePlateStore(useCallback(() => getPlateKeys(id), [id]));
