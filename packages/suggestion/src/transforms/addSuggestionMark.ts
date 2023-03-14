import { nanoid, PlateEditor, Value } from '@udecode/plate-common';
import { KEY_SUGGESTION_ID, MARK_SUGGESTION } from '../constants';
import { SuggestionEditorProps } from '../types';

export const addSuggestionMark = <V extends Value = Value>(
  editor: PlateEditor<V> & SuggestionEditorProps
  // {
  //   isDeletion,
  // }: {
  //   isDeletion?: boolean;
  // } = {}
) => {
  if (editor.activeSuggestionId) return;

  if (!editor.marks?.[MARK_SUGGESTION]) {
    editor.addMark(MARK_SUGGESTION, true);
  }

  if (!editor.marks?.[KEY_SUGGESTION_ID]) {
    editor.addMark(KEY_SUGGESTION_ID, nanoid());
  }
};
