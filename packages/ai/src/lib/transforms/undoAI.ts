import { type SlateEditor, someNode } from '@udecode/plate-common';

export const undoAI = (editor: SlateEditor) => {
  if (
    (editor.history.undos.at(-1) as any)?.ai &&
    someNode(editor, {
      at: [],
      match: (n) => !!(n as any).ai,
    })
  ) {
    editor.undo();
    editor.history.redos.pop();
  }
};
