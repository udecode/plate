import { useMemo } from 'react';
import { createEditor, Editor } from 'slate';
import shallow from 'zustand/shallow';
import {
  SlatePluginsActions,
  SlatePluginsState,
  State,
} from '../types/SlatePluginsStore';
import { SPEditor } from '../types/SPEditor';
import { pipe } from '../utils/pipe';
import { withSlatePlugins } from '../utils/withSlatePlugins';
import {
  slatePluginsStore,
  useSlatePluginsStore,
} from './useSlatePluginsStore';
import { getSetStateByKey } from './zustand.utils';

const { getState: get, setState: set } = slatePluginsStore;

export const useSlatePluginsActions = <T extends SPEditor = SPEditor>(
  storeId?: string | null
): SlatePluginsActions<T> => {
  const storeKeys = useSlatePluginsStore((s) => Object.keys(s), shallow);

  const stateId: string | undefined = storeId ?? storeKeys[0];

  return useMemo(() => {
    const setEditor: SlatePluginsActions<T>['setEditor'] = getSetStateByKey<
      State<T>['editor']
    >('editor', stateId);

    const setValue = getSetStateByKey<State<T>['value']>('value', stateId);

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
        set((state: SlatePluginsState<T>) => {
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
          pipe<Editor, T>(
            createEditor(),
            withSlatePlugins<T>({
              id,
              plugins,
              options: editor?.options,
            })
          ),
          id
        );
      },
      setEnabled: getSetStateByKey<State<T>['enabled']>('enabled', stateId),
      setPlugins: getSetStateByKey<State<T>['plugins']>('plugins', stateId),
      setPluginKeys: getSetStateByKey<State<T>['pluginKeys']>(
        'pluginKeys',
        stateId
      ),
    };
  }, [stateId]);
};
