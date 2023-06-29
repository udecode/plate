import { TRange } from '@udecode/slate';

import { createPluginFactory } from '../utils/createPluginFactory';

export const KEY_PREV_SELECTION = 'prevSelection';

export const createPrevSelectionPlugin = createPluginFactory({
  key: KEY_PREV_SELECTION,
  handlers: {
    onKeyDown: (editor) => (e) => {
      // React 16.x needs this event to be persistented due to it's event pooling implementation.
      // https://reactjs.org/docs/legacy-event-pooling.html
      e.persist();
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
