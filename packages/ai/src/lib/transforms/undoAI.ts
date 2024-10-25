import { type SlateEditor, someNode } from '@udecode/plate-common';

import { BaseAIPlugin } from '../BaseAIPlugin';

export const undoAI = (editor: SlateEditor) => {
  if (
    (editor.history.undos.at(-1) as any)?.ai &&
    someNode(editor, {
      at: [],
      match: (n) => !!n[BaseAIPlugin.key],
    })
  ) {
    editor.undo();
    editor.history.redos.pop();
  }
};
