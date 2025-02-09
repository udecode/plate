import type { SlateEditor } from '@udecode/plate';

import { BaseSuggestionPlugin, SUGGESTION_KEYS } from '../BaseSuggestionPlugin';
import { findSuggestionProps } from '../queries/findSuggestionId';

// TODO: Refactor
export const addSuggestionMark = (editor: SlateEditor) => {
  if (!editor.selection) return;

  const { id, createdAt: createdAt } = findSuggestionProps(editor, {
    at: editor.selection,
    type: 'update',
  });

  if (!editor.marks?.[BaseSuggestionPlugin.key]) {
    editor.tf.addMark(BaseSuggestionPlugin.key, true);
  }
  if (!editor.marks?.[SUGGESTION_KEYS.id]) {
    editor.tf.addMark(SUGGESTION_KEYS.id, id);
  }
  if (!editor.marks?.[SUGGESTION_KEYS.createdAt]) {
    editor.tf.addMark(SUGGESTION_KEYS.createdAt, createdAt);
  }
};
