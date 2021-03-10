import { createEditor } from 'slate';
import createVanillaStore from 'zustand/vanilla';
import { SlatePluginsStore, State } from '../types/SlatePluginsStore';
import { pipe } from '../utils/pipe';
import { withRandomKey } from '../with/randomKeyEditor';
import { getInitialState } from './getInitialState';
import { getSetter } from './getSetter';

/**
 * Slate plugins zustand store.
 */
export const slatePluginsStore = createVanillaStore<SlatePluginsStore>(
  (set, get) => ({
    byId: {},
    setEditor: getSetter<State['editor']>({
      set,
      key: 'editor',
    }),
    setPlugins: getSetter<State['plugins']>({
      set,
      key: 'plugins',
    }),
    setValue: getSetter<State['value']>({
      set,
      key: 'value',
    }),
    setElementKeys: getSetter<State['elementKeys']>({
      set,
      key: 'elementKeys',
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
    setOptions: getSetter<State['options']>({
      set,
      key: 'options',
    }),
    setOption: ({ value, optionKey, pluginKey }, id = 'main') =>
      set((state) => {
        let rest = state.byId[id];
        if (!rest) {
          rest = getInitialState();
        }
        const { options } = rest;
        const optionsByKey = options[pluginKey];

        return {
          byId: {
            ...state.byId,
            [id]: {
              ...rest,
              options: {
                ...options,
                [pluginKey]: {
                  ...optionsByKey,
                  [optionKey]: value,
                },
              },
            },
          },
        };
      }),
    setWithPlugins: (value, id = 'main') => {
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

      const editorSingleton = createEditor();

      const editor = pipe(editorSingleton, withRandomKey, ...value) as any;
      editor.id = id;

      get().setEditor(editor, id);
    },
  })
);
