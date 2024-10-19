import type { PlateEditor } from '@udecode/plate-common/react';

import { AIChatPlugin } from '../AIChatPlugin';

export const undoAI = (editor: PlateEditor) => {
  const { messages } = editor.getOption(AIChatPlugin, 'chat');

  if (messages.length > 0) {
    editor.undo();
    editor.history.redos.pop();
  } else {
    console.warn('Can not using undoAI when there is no output');
  }
};
