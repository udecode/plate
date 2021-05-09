import {
  SlatePluginsState,
  SlatePluginsStates,
} from '../types/SlatePluginsStore';
import { slatePluginsStore } from './slate-plugins/slate-plugins.store';

const set = slatePluginsStore.setState;

export const getStateById = (state: SlatePluginsStates, id: string) => {
  return state[id] ?? {};
};

export const mergeState = (
  stateToMerge: Partial<SlatePluginsState>,
  stateId?: string
) =>
  stateId &&
  set((state) => ({
    [stateId]: { ...getStateById(state, stateId), ...stateToMerge },
  }));

export const getSetStateByKey = <T>(key: string, stateId?: string) => (
  value: T,
  id = stateId
) =>
  id &&
  set((state) => {
    if (!state[id]) return;

    return {
      [id]: { ...getStateById(state, id), [key]: value },
    };
  });
