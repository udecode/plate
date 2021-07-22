import { useMemo } from 'react';
import { createEditor } from 'slate';
import shallow from 'zustand/shallow';
import { PlateActions, PlateState, PlateStates } from '../../types/PlateStore';
import { SPEditor } from '../../types/SPEditor';
import { pipe } from '../../utils/pipe';
import { withPlate } from '../../utils/withPlate';
import { getSetStateByKey, getStateById } from '../zustand.utils';
import { plateStore, usePlateStore } from './plate.store';

const { getState: get, setState: set } = plateStore;

export const usePlateActions = <T extends SPEditor = SPEditor>(
  storeId?: string | null
): PlateActions<T> => {
  const storeKeys = usePlateStore((s) => Object.keys(s), shallow);

  const stateId: string | undefined = storeId ?? storeKeys[0];

  return useMemo(() => {
    const setEditor: PlateActions<T>['setEditor'] = getSetStateByKey<
      PlateState<T>['editor']
    >('editor', stateId);

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
        {
          enabled = true,
          plugins = [],
          pluginKeys = [],
          selection = null,
          value = [{ children: [{ text: '' }] }],
        } = {},
        id = stateId
      ) =>
        id &&
        set((state: PlateStates<T>) => {
          if (state[id]) return;

          state[id] = {
            enabled,
            plugins,
            pluginKeys,
            selection,
            value,
          };
        }),
      resetEditor: (id = stateId) => {
        const state = !!id && get()[id];
        if (!state) return;
        const { editor, plugins } = state;

        setEditor(
          pipe(
            createEditor(),
            withPlate<T>({
              id,
              plugins,
              options: editor?.options,
            })
          ),
          id
        );
      },
      incrementKeyChange: (id = stateId) =>
        set((state) => {
          if (!state[id]) return {};

          const prev = state[id]?.keyChange ?? 1;

          return {
            [id]: { ...getStateById(state, id), keyChange: prev + 1 },
          };
        }),
      setEnabled: getSetStateByKey<PlateState<T>['enabled']>(
        'enabled',
        stateId
      ),
      setPlugins: getSetStateByKey<PlateState<T>['plugins']>(
        'plugins',
        stateId
      ),
      setPluginKeys: getSetStateByKey<PlateState<T>['pluginKeys']>(
        'pluginKeys',
        stateId
      ),
      setSelection: getSetStateByKey<PlateState<T>['selection']>(
        'selection',
        stateId
      ),
    };
  }, [stateId]);
};
