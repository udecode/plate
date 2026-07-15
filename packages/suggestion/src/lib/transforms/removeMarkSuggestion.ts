import { type BaseEditor, nanoid } from '@platejs/core';
import {
  type EditorUpdateTransaction,
  type Node,
  TextApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { getInlineSuggestionData, getSuggestionKey } from '../..';
import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';

const getRemoveMarkProps = () => {
  const defaultProps = {
    id: nanoid(),
    createdAt: Date.now(),
  };

  return defaultProps;
};

// TODO remove mark when the text is already marked as a bold by suggestion
export const removeMarkSuggestion = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  key: string
) => {
  const { id, createdAt } = getRemoveMarkProps();

  const match = (n: Node) => {
    if (!TextApi.isText(n)) return false;
    // if the node is already marked as a suggestion, we don't want to remove it unless it's a removeMark suggestion
    if (n[KEYS.suggestion]) {
      const data = getInlineSuggestionData(n);

      if (data?.type === 'update') {
        return true;
      }

      return false;
    }

    return true;
  };

  editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
    tx.nodes.unset(key, {
      match,
    });

    tx.nodes.set(
      {
        [getSuggestionKey(id)]: {
          id,
          createdAt,
          properties: {
            [key]: undefined,
          },
          type: 'update',
          userId: editor.plugin(BaseSuggestionPlugin).getOptions()
            .currentUserId,
        },
        [KEYS.suggestion]: true,
      },
      {
        match,
      }
    );
  });
};
