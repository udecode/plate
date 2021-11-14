import { useMemo } from 'react';
import { createEditor } from 'slate';
import shallow from 'zustand/shallow';
import {
  PlateActions,
  PlateChangeKey,
  PlateState,
  PlateStates,
} from '../../types/PlateStore';
import { withPlate } from '../../utils/withPlate';
import { getSetStateByKey } from '../zustand.utils';
import { getPlateId } from './selectors/getPlateId';
import { getPlateState } from './selectors/getPlateState';
import { plateStore, usePlateStore } from './plate.store';

const { getState: get, setState: set } = plateStore;

export const usePlateActions = <T = {}>(
  storeId?: string | null
): PlateActions<T> => {
  const storeKeys = usePlateStore((s) => Object.keys(s), shallow);

  const stateId: string | undefined = storeId ?? storeKeys[0];

  return useMemo(() => {
    const setEditor = getSetStateByKey('editor', stateId);

    const setValue = getSetStateByKey<PlateState<T>['value']>('value', stateId);

    return {
      setEditor,
      setValue,
      clearState: (id = stateId) =>
        id &&
        set((state) => {
          delete state[id];
        }),
      setInitialState: (
        { enabled = true, value = [{ children: [{ text: '' }] }] } = {},
        id = stateId
      ) =>
        id &&
        set((state: PlateStates<T>) => {
          if (state[id]) return;

          state[id] = {
            enabled,
            value,
          };
        }),
      resetEditor: (id = stateId) => {
        const state = !!id && get()[id];
        if (!state) return;
        const { editor } = state;

        setEditor(
          withPlate(createEditor(), {
            id,
            plugins: editor?.plugins,
          }),
          id
        );
      },
      setEnabled: getSetStateByKey<PlateState<T>['enabled']>(
        'enabled',
        stateId
      ),
    };
  }, [stateId]);
};

export const incrementKey = (key: PlateChangeKey, id = getPlateId()) => {
  const state = getPlateState(id);
  if (!state || !id) return;

  const prev = state[key] ?? 1;

  plateStore.setState({
    [id]: { ...state, [key]: prev + 1 },
  });
};
