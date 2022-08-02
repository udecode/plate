import { TRange } from '../slate/index';
import { createPluginFactory } from '../utils/plate/createPluginFactory';

export const KEY_SELECTION = 'selection';

export const createSelectionPlugin = createPluginFactory({
  key: KEY_SELECTION,
  withOverrides: (editor) => {
    const { apply } = editor;

    editor.apply = (operation) => {
      if (operation.type === 'set_selection') {
        const { properties } = operation;

        editor.prevSelection = properties as TRange | null;
      }

      apply(operation);
    };

    return editor;
  },
});
