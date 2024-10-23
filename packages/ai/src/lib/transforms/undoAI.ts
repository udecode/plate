import { type SlateEditor, someNode } from '@udecode/plate-common';

import { AIPlugin } from '../../react';

export const undoAI = (editor: SlateEditor) => {
  if (
    (editor.history.undos.at(-1) as any)?.ai &&
    someNode(editor, {
      at: [],
      match: (n) => !!n[AIPlugin.key],
    })
  ) {
    editor.undo();
    editor.history.redos.pop();
  }
};
