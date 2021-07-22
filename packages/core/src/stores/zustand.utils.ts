import { PlateState, PlateStates } from '../types/PlateStore';
import { plateStore } from './plate/plate.store';

const set = plateStore.setState;

export const getStateById = (state: PlateStates, id: string) => {
  return state[id] ?? {};
};

export const mergeState = (
  stateToMerge: Partial<PlateState>,
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
