import { type SlateEditor, nanoid } from '@udecode/plate-common';

import { BaseSuggestionPlugin, SUGGESTION_KEYS } from '../BaseSuggestionPlugin';
import { findSuggestionId } from '../queries/findSuggestionId';

export const addSuggestionMark = (editor: SlateEditor) => {
  if (!editor.selection) return;

  const id = findSuggestionId(editor, editor.selection) ?? nanoid();

  if (!editor.marks?.[BaseSuggestionPlugin.key]) {
    editor.addMark(BaseSuggestionPlugin.key, true);
  }
  if (!editor.marks?.[SUGGESTION_KEYS.id]) {
    editor.addMark(SUGGESTION_KEYS.id, id);
  }
};
