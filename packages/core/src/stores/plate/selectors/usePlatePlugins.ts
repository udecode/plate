import { useCallback } from 'react';
import { usePlateStore } from '../plate.store';
import { getPlateState } from './getPlateState';

export const getPlatePlugins = <T = {}>(id?: string | null) =>
  getPlateState<T>(id)?.plugins;

export const usePlatePlugins = (id?: string | null) =>
  usePlateStore(useCallback(() => getPlatePlugins(id), [id]));
