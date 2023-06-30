import {
  PlateEditor,
  Value,
  insertNodes,
  isSelectionExpanded,
  nanoid,
  withoutNormalizing,
} from '@udecode/plate-common';

import { findSuggestionId } from '../queries/findSuggestionId';
import { TSuggestionText } from '../types';
import { deleteFragmentSuggestion } from './deleteFragmentSuggestion';
import { getSuggestionProps } from './getSuggestionProps';

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
      {
        text,
        ...getSuggestionProps(editor, id),
      },
      {
        at: editor.selection!,
        select: true,
      }
    );
  });
};
