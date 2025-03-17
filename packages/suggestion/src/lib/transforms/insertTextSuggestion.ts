import type { SlateEditor } from '@udecode/plate';

import type { TSuggestionText } from '../types';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { findSuggestionProps } from '../queries';
import { getSuggestionKey } from '../utils';
import { deleteFragmentSuggestion } from './deleteFragmentSuggestion';

export const insertTextSuggestion = (editor: SlateEditor, text: string) => {
  editor.tf.withoutNormalizing(() => {
    let resId: string | undefined;
    const { id, createdAt: createdAt } = findSuggestionProps(editor, {
      at: editor.selection!,
      type: 'insert',
    });

    if (editor.api.isExpanded()) {
      resId = deleteFragmentSuggestion(editor);
    }

    editor.getApi(BaseSuggestionPlugin).suggestion.withoutSuggestions(() => {
      editor.tf.insertNodes<TSuggestionText>(
        {
          [getSuggestionKey(resId ?? id)]: {
            id: resId ?? id,
            createdAt: createdAt,
            type: 'insert',
            userId: editor.getOptions(BaseSuggestionPlugin).currentUserId!,
          },
          suggestion: true,
          text,
        },
        {
          at: editor.selection!,
          select: true,
        }
      );
    });
  });
};
