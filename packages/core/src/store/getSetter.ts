import { SetState } from 'zustand';
import {
  SlatePluginsState,
  SlatePluginsStore,
  State,
} from '../types/SlatePluginsStore';
import { getInitialState } from './getInitialState';

export const getStateById = (state: SlatePluginsState, id: string) => {
  return state.byId[id] ?? getInitialState();
};

export const setStateById = (
  state: Partial<State>,
  {
    set,
    id,
  }: {
    set: SetState<SlatePluginsStore>;
    id: string;
  }
) => {
  set((_state) => ({
    byId: {
      ..._state.byId,
      [id]: { ...getStateById(_state, id), ...state },
    },
  }));
};

// TODO: use immer, except for editor as it should be mutable.
export const setStateKeyValueById = ({
  set,
  key,
  value,
  id,
}: {
  set: SetState<SlatePluginsStore>;
  key: string;
  value: any;
  id: string;
}) =>
  set((state) => {
    return {
      byId: {
        ...state.byId,
        [id]: { ...getStateById(state, id), [key]: value },
      },
    };
  });

export const getSetter = <T>({
  set,
  key,
}: {
  set: SetState<SlatePluginsStore>;
  key: string;
}) => (value: T, id = 'main') => setStateKeyValueById({ set, key, value, id });
