import { SlatePluginsState, State } from '../types/SlatePluginsStore';
import { slatePluginsStore } from './useSlatePluginsStore';

const set = slatePluginsStore.setState;

export const getStateById = (state: SlatePluginsState, id: string) => {
  return state[id] ?? {};
};

export const mergeState = (stateToMerge: Partial<State>, stateId: string) => {
  set((state) => ({
    [stateId]: { ...getStateById(state, stateId), ...stateToMerge },
  }));
};

export const getSetStateByKey = <T>(key: string, stateId: string) => (
  value: T,
  id = stateId
) =>
  set((state) => ({
    [id]: { ...getStateById(state, id), [key]: value },
  }));
