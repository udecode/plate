import { nanoid, PlateEditor, Value } from '@udecode/plate-core';
import { KEY_SUGGESTION_ID, MARK_SUGGESTION } from '../constants';
import { SuggestionEditorProps } from '../types';

export const addSuggestionMark = <V extends Value = Value>(
  editor: PlateEditor<V> & SuggestionEditorProps
) => {
  console.log(editor.activeSuggestionId);
  if (editor.activeSuggestionId) return;
  console.log(editor.marks);
  console.log(editor.mark);
  if (!editor.marks?.[MARK_SUGGESTION]) {
    editor.addMark(MARK_SUGGESTION, true);
  }

  if (!editor.marks?.[KEY_SUGGESTION_ID]) {
    editor.addMark(KEY_SUGGESTION_ID, nanoid());
  }
};
