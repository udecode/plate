import { type SlateEditor, RangeApi } from 'platejs';

// Selection placeholder constants
const SELECTION_START_PLACEHOLDER = '<Selection>';
const SELECTION_END_PLACEHOLDER = '</Selection>';

export const withSelectionPlaceholder = (editor: SlateEditor) => {
  if (!editor.selection) return;

  if (editor.api.isExpanded()) {
    const [start, end] = RangeApi.edges(editor.selection);

    editor.tf.withoutNormalizing(() => {
      editor.tf.insertText(SELECTION_END_PLACEHOLDER, {
        at: end,
      });

      editor.tf.insertText(SELECTION_START_PLACEHOLDER, {
        at: start,
      });
    });
  }
};
