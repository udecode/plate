import { useCallback } from 'react';
import { usePlateStore } from '../plate.store';
import { getPlateState } from './getPlateState';

export const getPlateSelection = <T = {}>(id?: string | null) =>
  getPlateState<T>(id)?.selection;

/**
 * Get the editor selection which is updated on editor change.
 */
export const usePlateSelection = (id?: string | null) =>
  usePlateStore(useCallback(() => getPlateSelection(id), [id]));
