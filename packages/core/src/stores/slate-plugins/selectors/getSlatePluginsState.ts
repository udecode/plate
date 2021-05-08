import {
  SlatePluginsState,
  SlatePluginsStates,
} from '../../../types/SlatePluginsStore';
import { SPEditor } from '../../../types/SPEditor';

/**
 * If id is defined, get the state by id.
 * Else, get the first state.
 */
export const getSlatePluginsState = <T extends SPEditor = SPEditor>(
  state: SlatePluginsStates<T>,
  id?: string | null
): SlatePluginsState<T> | undefined => {
  if (id) return state[id];

  const keys = Object.keys(state);
  if (!keys.length) return;

  return state[keys[0]];
};
