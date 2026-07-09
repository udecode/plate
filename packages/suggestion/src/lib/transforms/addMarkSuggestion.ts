import { type BaseEditor, nanoid } from '@platejs/core';
import {
  type EditorUpdateTransaction,
  type Node,
  TextApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { getInlineSuggestionData, getSuggestionKey } from '../..';
import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';

const getAddMarkProps = () => {
  const defaultProps = {
    id: nanoid(),
    createdAt: Date.now(),
  };

  return defaultProps;
};

export const addMarkSuggestion = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  key: string,
  value: any
) => {
  editor.plugin(BaseSuggestionPlugin).api.withoutSuggestions(() => {
    const { id, createdAt } = getAddMarkProps();

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

    tx.nodes.set(
      {
        [key]: value,
        [getSuggestionKey(id)]: {
          id,
          createdAt,
          newProperties: {
            [key]: value,
          },
          type: 'update',
          userId: editor.plugin(BaseSuggestionPlugin).getOptions()
            .currentUserId,
        },
        [KEYS.suggestion]: true,
      },
      {
        match,
        split: true,
      }
    );
  });
};
