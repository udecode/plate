import type { SlateEditor } from 'platejs';

export const focusEditorAtSelection = (editor: SlateEditor) => {
  if (editor.selection) {
    editor.update((tx) => {
      tx.selection.set(editor.selection!);
    });
  }

  editor.api.dom.focus();
};
