import {
  insertNodes,
  isSelectionExpanded,
  nanoid,
  PlateEditor,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { KEY_SUGGESTION_ID, MARK_SUGGESTION } from '../constants';
import { findSuggestionId } from '../queries/findSuggestionId';
import { TSuggestionText } from '../types';
import { deleteFragmentSuggestion } from './deleteFragmentSuggestion';

export const insertTextSuggestion = <V extends Value>(
  editor: PlateEditor<V>,
  text: string
) => {
  withoutNormalizing(editor, () => {
    const id = findSuggestionId(editor, editor.selection!) ?? nanoid();

    if (isSelectionExpanded(editor)) {
      deleteFragmentSuggestion(editor);
    }
    insertNodes<TSuggestionText>(
      editor,
      { text, [MARK_SUGGESTION]: true, [KEY_SUGGESTION_ID]: id },
      {
        at: editor.selection!,
        select: true,
      }
    );
  });
};
