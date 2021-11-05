import { PlateState } from '../../../types/PlateStore';
import { plateStore } from '../plate.store';
import { getPlateId } from './getPlateId';

/**
 * If id is defined, get the state by id.
 * Else, get the first state.
 */
export const getPlateState = <T = {}>(
  id?: string | null
): PlateState<T> | null => {
  const state = (plateStore.getState() as unknown) as PlateState<T>;

  if (id) return state[id];

  const firstId = getPlateId();
  if (firstId) return state[firstId];

  return null;
};
