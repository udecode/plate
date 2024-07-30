import {
  type PlateEditor,
  insertNodes,
  isSelectionExpanded,
  nanoid,
  withoutNormalizing,
} from '@udecode/plate-common/server';

import type { TSuggestionText } from '../types';

import { findSuggestionId } from '../queries/findSuggestionId';
import { deleteFragmentSuggestion } from './deleteFragmentSuggestion';
import { getSuggestionProps } from './getSuggestionProps';

export const insertTextSuggestion = (editor: PlateEditor, text: string) => {
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
