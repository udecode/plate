// TODO: use immer, except for editor as it should be mutable.
import { SetState } from 'zustand';
import { SlatePluginsState } from '../types/SlatePluginsState';
import { getInitialState } from './getInitialState';

const setStateById = ({
  set,
  key,
  value,
  id,
}: {
  set: SetState<SlatePluginsState>;
  key: string;
  value: any;
  id: string;
}) =>
  set((state) => {
    let rest = state.byId[id];
    if (!rest) {
      rest = getInitialState();
    }

    return {
      byId: {
        ...state.byId,
        [id]: { ...rest, [key]: value },
      },
    };
  });

export const getSetter = <T>({
  set,
  key,
}: {
  set: SetState<SlatePluginsState>;
  key: string;
}) => (value: T, id = 'main') => setStateById({ set, key, value, id });
