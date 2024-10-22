import type { SlateEditor } from '@udecode/plate-common';

export const undoAI = (editor: SlateEditor) => {
  if ((editor.history.undos.at(-1) as any)?.ai) {
    editor.undo();
    editor.history.redos.pop();
  }
};
