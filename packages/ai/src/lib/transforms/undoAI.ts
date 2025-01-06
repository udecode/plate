import type { SlateEditor } from '@udecode/plate';

export const undoAI = (editor: SlateEditor) => {
  if (
    (editor.history.undos.at(-1) as any)?.ai &&
    editor.api.some({
      at: [],
      match: (n) => !!(n as any).ai,
    })
  ) {
    editor.undo();
    editor.history.redos.pop();
  }
};
