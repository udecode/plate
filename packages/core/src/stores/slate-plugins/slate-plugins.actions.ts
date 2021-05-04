import { useMemo } from 'react';
import { createEditor } from 'slate';
import shallow from 'zustand/shallow';
import {
  SlatePluginsActions,
  SlatePluginsState,
  SlatePluginsStates,
} from '../../types/SlatePluginsStore';
import { SPEditor } from '../../types/SPEditor';
import { pipe } from '../../utils/pipe';
import { withSlatePlugins } from '../../utils/withSlatePlugins';
import { getSetStateByKey } from '../zustand.utils';
import { slatePluginsStore, useSlatePluginsStore } from './slate-plugins.store';

const { getState: get, setState: set } = slatePluginsStore;

export const useSlatePluginsActions = <T extends SPEditor = SPEditor>(
  storeId?: string | null
): SlatePluginsActions<T> => {
  const storeKeys = useSlatePluginsStore((s) => Object.keys(s), shallow);

  const stateId: string | undefined = storeId ?? storeKeys[0];

  return useMemo(() => {
    const setEditorRef: SlatePluginsActions<T>['setEditorRef'] = getSetStateByKey<
      SlatePluginsState<T>['editorRef']
    >('editorRef', stateId);
    const setEditorState: SlatePluginsActions<T>['setEditorState'] = getSetStateByKey<
      SlatePluginsState<T>['editorState']
    >('editorState', stateId);

    const setValue = getSetStateByKey<SlatePluginsState<T>['value']>(
      'value',
      stateId
    );

    return {
      setEditorRef,
      setEditorState,
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
        set((state: SlatePluginsStates<T>) => {
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
        const { editorRef, plugins } = state;

        setEditorRef(
          pipe(
            createEditor(),
            withSlatePlugins<T>({
              id,
              plugins,
              options: editorRef?.options,
            })
          ),
          id
        );
      },
      setEnabled: getSetStateByKey<SlatePluginsState<T>['enabled']>(
        'enabled',
        stateId
      ),
      setPlugins: getSetStateByKey<SlatePluginsState<T>['plugins']>(
        'plugins',
        stateId
      ),
      setPluginKeys: getSetStateByKey<SlatePluginsState<T>['pluginKeys']>(
        'pluginKeys',
        stateId
      ),
      setSelection: getSetStateByKey<SlatePluginsState<T>['selection']>(
        'selection',
        stateId
      ),
    };
  }, [stateId]);
};
