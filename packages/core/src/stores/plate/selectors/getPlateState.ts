import { PlateState, PlateStates } from '../../../types/PlateStore';
import { PlateEditor, TPlateEditor } from '../../../types/SPEditor';

/**
 * If id is defined, get the state by id.
 * Else, get the first state.
 */
export const getPlateState = <T = TPlateEditor>(
  state: PlateStates<T>,
  id?: string | null
): PlateState<T> | undefined => {
  if (id) return state[id];

  const keys = Object.keys(state);
  if (!keys.length) return;

  return state[keys[0]];
};
