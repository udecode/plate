import { useMemo } from 'react';
import { createEditor } from 'slate';
import { SlatePluginsActions, State } from '../types/SlatePluginsStore';
import { SPEditor } from '../types/SPEditor';
import { pipe } from '../utils/pipe';
import { withSlatePlugins } from '../utils/withSlatePlugins';
import { slatePluginsStore } from './useSlatePluginsStore';
import { getSetStateByKey } from './zustand.utils';

const { getState: get, setState: set } = slatePluginsStore;

export const useSlatePluginsActions = (storeId = 'main'): SlatePluginsActions =>
  useMemo(() => {
    const setEditor: SlatePluginsActions['setEditor'] = getSetStateByKey<
      State['editor']
    >('editor', storeId);

    return {
      setEditor,
      clearState: (id = storeId) => {
        set((state) => {
          delete state[id];
          return state;
        });
      },
      setInitialState: (v = {}, id = storeId) =>
        set((state) => {
          const {
            enabled = true,
            value = [{ children: [{ text: '' }] }],
            plugins = [],
            pluginKeys = [],
          } = v;

          return state[id]
            ? state
            : {
                [id]: {
                  enabled,
                  plugins,
                  pluginKeys,
                  value,
                },
              };
        }),
      resetEditor: (id = storeId) => {
        const state = get()[id];
        if (!state) return;
        const { editor, plugins } = get()[id];

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
      setEnabled: getSetStateByKey<State['enabled']>('enabled', storeId),
      setPlugins: getSetStateByKey<State['plugins']>('plugins', storeId),
      setValue: getSetStateByKey<State['value']>('value', storeId),
      setPluginKeys: getSetStateByKey<State['pluginKeys']>(
        'pluginKeys',
        storeId
      ),
    };
  }, [storeId]);
