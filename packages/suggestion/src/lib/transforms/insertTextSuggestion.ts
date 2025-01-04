import { type SlateEditor, nanoid } from '@udecode/plate-common';

import type { TSuggestionText } from '../types';

import { findSuggestionId } from '../queries/findSuggestionId';
import { deleteFragmentSuggestion } from './deleteFragmentSuggestion';
import { getSuggestionProps } from './getSuggestionProps';

export const insertTextSuggestion = (editor: SlateEditor, text: string) => {
  editor.tf.withoutNormalizing(() => {
    const id = findSuggestionId(editor, editor.selection!) ?? nanoid();

    if (editor.api.isExpanded()) {
      deleteFragmentSuggestion(editor);
    }

    editor.tf.insertNodes<TSuggestionText>(
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
