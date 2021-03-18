import { createEditor } from 'slate';
import createVanillaStore from 'zustand/vanilla';
import { SlatePluginsStore, State } from '../types/SlatePluginsStore';
import { pipe } from '../utils/pipe';
import { withSlatePlugins } from '../with/withSlatePlugins';
import { getInitialState } from './getInitialState';
import { getSetter, setStateById } from './getSetter';

/**
 * Slate plugins zustand store.
 */
export const slatePluginsStore = createVanillaStore<SlatePluginsStore>(
  (set, get) => ({
    byId: {},
    setEditor: (
      { options = {}, withOverrides = [], editor: _editor },
      id = 'main'
    ) => {
      // const stateById = get().byId[id];

      // FIXME: redo is not working
      // const editorSingleton = stateById.editor
      //   ? (stateById.editor as Editor)
      //   : createEditor();

      // Clone the original methods of the editor
      // const editorMethods: FunctionProperties<Editor> = {
      //   insertBreak: editorSingleton.insertBreak,
      //   isVoid: editorSingleton.isVoid,
      //   insertNode: editorSingleton.insertNode,
      //   addMark: editorSingleton.addMark,
      //   apply: editorSingleton.apply,
      //   deleteBackward: editorSingleton.deleteBackward,
      //   deleteForward: editorSingleton.deleteForward,
      //   deleteFragment: editorSingleton.deleteFragment,
      //   getFragment: editorSingleton.getFragment,
      //   insertFragment: editorSingleton.insertFragment,
      //   insertText: editorSingleton.insertText,
      //   isInline: editorSingleton.isInline,
      //   normalizeNode: editorSingleton.normalizeNode,
      //   onChange: editorSingleton.onChange,
      //   removeMark: editorSingleton.removeMark,
      // };
      //
      // for (const [key, method] of Object.entries(editorMethods)) {
      //   editorSingleton[key] = method;
      // }

      let editor: any;
      if (_editor) {
        editor = _editor;
      } else {
        const editorSingleton = createEditor();

        editor = pipe(
          editorSingleton,
          withSlatePlugins,
          ...withOverrides
        ) as any;
        editor.withOverrides = withOverrides;
      }

      editor.id = id;
      editor.options = options;

      return setStateById({ editor }, { id, set });
    },
    setPlugins: getSetter<State['plugins']>({
      set,
      key: 'plugins',
    }),
    setValue: getSetter<State['value']>({
      set,
      key: 'value',
    }),
    setPluginKeys: getSetter<State['pluginKeys']>({
      set,
      key: 'pluginKeys',
    }),
    setInitialState: (id = 'main') =>
      set((state) => {
        if (state.byId[id]) return state;

        return {
          byId: {
            ...state.byId,
            [id]: getInitialState(),
          },
        };
      }),
    resetEditorKey: (id = 'main') => {
      console.log('reset');
      const editor = get().byId[id].editor ?? createEditor();

      const { withOverrides, options } = editor as any;

      get().setEditor({ withOverrides, options }, id);
    },
  })
);
