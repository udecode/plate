import { type PlateEditor, nanoid } from '@udecode/plate-common';

import type { SuggestionEditorProps } from '../types';

import { KEY_SUGGESTION_ID, SuggestionPlugin } from '../SuggestionPlugin';
import { findSuggestionId } from '../queries/findSuggestionId';

export const addSuggestionMark = (
  editor: PlateEditor & SuggestionEditorProps
) => {
  if (!editor.selection) return;

  const id = findSuggestionId(editor, editor.selection) ?? nanoid();

  if (!editor.marks?.[SuggestionPlugin.key]) {
    editor.addMark(SuggestionPlugin.key, true);
  }
  if (!editor.marks?.[KEY_SUGGESTION_ID]) {
    editor.addMark(KEY_SUGGESTION_ID, id);
  }
};
