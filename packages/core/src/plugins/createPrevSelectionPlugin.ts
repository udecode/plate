import { TRange } from '../slate/index';
import { createPluginFactory } from '../utils/plate/createPluginFactory';

export const KEY_PREV_SELECTION = 'prevSelection';

export const createPrevSelectionPlugin = createPluginFactory({
  key: KEY_PREV_SELECTION,
  handlers: {
    onKeyDown: (editor) => (e) => {
      editor.currentKeyboardEvent = e;
    },
  },
  withOverrides: (editor) => {
    const { apply } = editor;

    editor.apply = (operation) => {
      if (operation.type === 'set_selection') {
        const { properties } = operation;

        editor.prevSelection = properties as TRange | null;

        apply(operation);

        editor.currentKeyboardEvent = null;

        return;
      }

      apply(operation);
    };

    return editor;
  },
});
