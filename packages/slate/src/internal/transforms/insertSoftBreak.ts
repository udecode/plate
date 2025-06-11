import type { Editor } from '../../interfaces';

/**
 * Insert a soft break at the current selection. If the selection is currently
 * expanded, delete it first.
 */
export const insertSoftBreak = (editor: Editor) => {
  editor.tf.withoutNormalizing(() => {
    if (editor.api.isExpanded()) {
      editor.tf.delete();
    }
    editor.tf.insertText('\n');
  });
};
