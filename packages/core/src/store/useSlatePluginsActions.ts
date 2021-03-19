import { useMemo } from 'react';
import { createEditor } from 'slate';
import { withSlatePlugins } from '../plugins/useSlatePluginsPlugin';
import { SlatePluginsActions, State } from '../types/SlatePluginsStore';
import { pipe } from '../utils/pipe';
import { getInitialState } from './getInitialState';
import { slatePluginsStore } from './useSlatePluginsStore';
import { getSetStateByKey, mergeState } from './zustand.utils';

const s = slatePluginsStore;
const get = s.getState;
const set = s.setState;

export const useSlatePluginsActions = (storeId = 'main'): SlatePluginsActions =>
  useMemo(() => {
    const setEditor: SlatePluginsActions['setEditor'] = (
      { options = {}, plugins = [], editor: _editor },
      id = storeId
    ) => {
      let editor: any = _editor ?? createEditor();
      editor = pipe(editor, withSlatePlugins({ id, plugins, options }));

      return mergeState({ editor }, id);
    };

    return {
      setEditor,
      clearState: (id = storeId) => {
        return set((state) => {
          delete state[id];

          return state;
        });
      },
      setInitialState: (id = storeId) =>
        set((state) =>
          state[id]
            ? state
            : {
                [id]: getInitialState(),
              }
        ),
      resetEditorKey: (id = storeId) => {
        console.log('reset');
        const editor = get()[id].editor ?? createEditor();
        const { plugins } = get()[id];

        const { options } = editor as any;

        setEditor({ plugins, options }, id);
      },
      setPlugins: getSetStateByKey<State['plugins']>('plugins', storeId),
      setValue: getSetStateByKey<State['value']>('value', storeId),
      setPluginKeys: getSetStateByKey<State['pluginKeys']>(
        'pluginKeys',
        storeId
      ),
    };
  }, [storeId]);
