import { type SlateEditor, type TNode, KEYS, nanoid, TextApi } from 'platejs';

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
  editor: SlateEditor,
  key: string,
  value: any
) => {
  editor.getApi(BaseSuggestionPlugin).suggestion.withoutSuggestions(() => {
    const { id, createdAt } = getAddMarkProps();

    const match = (n: TNode) => {
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

    editor.tf.setNodes(
      {
        [key]: value,
        [getSuggestionKey(id)]: {
          id,
          createdAt,
          newProperties: {
            [key]: value,
          },
          type: 'update',
          userId: editor.getOptions(BaseSuggestionPlugin).currentUserId,
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
