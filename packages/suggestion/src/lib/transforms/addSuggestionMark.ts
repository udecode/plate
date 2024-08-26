import { type SlateEditor, nanoid } from '@udecode/plate-common';

import { SUGGESTION_KEYS, SuggestionPlugin } from '../SuggestionPlugin';
import { findSuggestionId } from '../queries/findSuggestionId';

export const addSuggestionMark = (editor: SlateEditor) => {
  if (!editor.selection) return;

  const id = findSuggestionId(editor, editor.selection) ?? nanoid();

  if (!editor.marks?.[SuggestionPlugin.key]) {
    editor.addMark(SuggestionPlugin.key, true);
  }
  if (!editor.marks?.[SUGGESTION_KEYS.id]) {
    editor.addMark(SUGGESTION_KEYS.id, id);
  }
};
