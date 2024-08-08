import type { TRange } from '@udecode/slate';

import { createPlugin } from '../utils';

export const KEY_PREV_SELECTION = 'prevSelection';

export const PrevSelectionPlugin = createPlugin({
  handlers: {
    onKeyDown: ({ editor, event }) => {
      // React 16.x needs this event to be persistented due to it's event pooling implementation.
      // https://reactjs.org/docs/legacy-event-pooling.html
      event.persist();
      editor.currentKeyboardEvent = event;
    },
  },
  key: KEY_PREV_SELECTION,
  withOverrides: ({ editor }) => {
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
