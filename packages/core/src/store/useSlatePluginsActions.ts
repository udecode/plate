import { useMemo } from 'react';
import { createEditor } from 'slate';
import shallow from 'zustand/shallow';
import { SlatePluginsActions, State } from '../types/SlatePluginsStore';
import { SPEditor } from '../types/SPEditor';
import { pipe } from '../utils/pipe';
import { withSlatePlugins } from '../utils/withSlatePlugins';
import {
  slatePluginsStore,
  useSlatePluginsStore,
} from './useSlatePluginsStore';
import { getSetStateByKey } from './zustand.utils';

const { getState: get, setState: set } = slatePluginsStore;

export const useSlatePluginsActions = (
  storeId?: string | null
): SlatePluginsActions => {
  const storeKeys = useSlatePluginsStore((s) => Object.keys(s), shallow);

  const stateId: string | undefined = storeId ?? storeKeys[0];

  return useMemo(() => {
    const setEditor: SlatePluginsActions['setEditor'] = getSetStateByKey<
      State['editor']
    >('editor', stateId);

    const setValue = getSetStateByKey<State['value']>('value', stateId);

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
          value = [{ children: [{ text: '' }] }],
          plugins = [],
          pluginKeys = [],
        } = {},
        id = stateId
      ) =>
        id &&
        set((state) => {
          if (state[id]) return;

          state[id] = {
            enabled,
            plugins,
            pluginKeys,
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
            withSlatePlugins({
              id,
              plugins,
              options: (editor as SPEditor).options,
            })
          ),
          id
        );
      },
      setEnabled: getSetStateByKey<State['enabled']>('enabled', stateId),
      setPlugins: getSetStateByKey<State['plugins']>('plugins', stateId),
      setPluginKeys: getSetStateByKey<State['pluginKeys']>(
        'pluginKeys',
        stateId
      ),
    };
  }, [stateId]);
};
