import type { BasePlateEditor } from 'platejs';

export const focusEditorAtSelection = (editor: BasePlateEditor) => {
  if (editor.selection) {
    editor.update((tx) => {
      tx.selection.set(editor.selection!);
    });
  }

  editor.api.dom.focus();
};
