import { useCallback } from 'react';
import { usePlateStore } from '../plate.store';
import { getPlateState } from './getPlateState';

export const useStorePlatePluginKeys = (id?: string | null) =>
  usePlateStore(
    useCallback((state) => getPlateState(state, id)?.pluginKeys, [id])
  );
