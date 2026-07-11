import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction } from '@platejs/plite';
import type { TSuggestionText } from '@platejs/utils';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { findSuggestionProps } from '../queries';
import { getSuggestionKey } from '../utils';
import { deleteFragmentSuggestionWithTx } from './deleteFragmentSuggestion';

export const insertTextSuggestion = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  text: string
) => {
  let resId: string | undefined;
  const selection = editor.read.selection();

  if (!selection) return;

  const { id, createdAt } = findSuggestionProps(editor, {
    at: selection,
    type: 'insert',
  });

  if (editor.read.selection.isExpanded()) {
    resId = deleteFragmentSuggestionWithTx(editor, tx, {
      moveSelection: true,
    });
  }

  editor.plugin(BaseSuggestionPlugin).api.withoutSuggestions(() => {
    tx.nodes.insert<TSuggestionText>(
      {
        [getSuggestionKey(resId ?? id)]: {
          id: resId ?? id,
          createdAt,
          type: 'insert',
          userId: editor.plugin(BaseSuggestionPlugin).getOptions()
            .currentUserId!,
        },
        suggestion: true,
        text,
      },
      {
        at: editor.read.selection() ?? selection,
        select: true,
      }
    );
  });

  tx.normalize({ force: false });
};
