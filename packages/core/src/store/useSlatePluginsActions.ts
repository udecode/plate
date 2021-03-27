import { useMemo } from 'react';
import { createEditor } from 'slate';
import { SlatePluginsActions, State } from '../types/SlatePluginsStore';
import { pipe } from '../utils/pipe';
import { withSlatePlugins } from '../utils/withSlatePlugins';
import { getInitialState } from './getInitialState';
import { slatePluginsStore } from './useSlatePluginsStore';
import { getSetStateByKey } from './zustand.utils';

const s = slatePluginsStore;
const get = s.getState;
const set = s.setState;

export const useSlatePluginsActions = (storeId = 'main'): SlatePluginsActions =>
  useMemo(() => {
    const setEditor: SlatePluginsActions['setEditor'] = getSetStateByKey<
      State['editor']
    >('editor', storeId);

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
        const { editor } = get()[id] as any;
        const { plugins } = get()[id];

        setEditor(
          pipe(
            createEditor(),
            withSlatePlugins({ id, plugins, options: editor?.options })
          ),
          id
        );
      },
      setPlugins: getSetStateByKey<State['plugins']>('plugins', storeId),
      setValue: getSetStateByKey<State['value']>('value', storeId),
      setPluginKeys: getSetStateByKey<State['pluginKeys']>(
        'pluginKeys',
        storeId
      ),
    };
  }, [storeId]);
