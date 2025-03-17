import { type SlateEditor, type TNode, nanoid, TextApi } from '@udecode/plate';

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
export const removeMarkSuggestion = (editor: SlateEditor, key: string) => {
  editor.getApi(BaseSuggestionPlugin).suggestion.withoutSuggestions(() => {
    const { id, createdAt } = getRemoveMarkProps();

    const match = (n: TNode) => {
      if (!TextApi.isText(n)) return false;
      // if the node is already marked as a suggestion, we don't want to remove it unless it's a removeMark suggestion
      if (n[BaseSuggestionPlugin.key]) {
        const data = getInlineSuggestionData(n);

        if (data?.type === 'update') {
          return true;
        }

        return false;
      }

      return true;
    };

    editor.tf.unsetNodes(key, {
      match,
    });

    editor.tf.setNodes(
      {
        [BaseSuggestionPlugin.key]: true,
        [getSuggestionKey(id)]: {
          id: id,
          createdAt: createdAt,
          properties: {
            [key]: undefined,
          },
          type: 'update',
          userId: editor.getOptions(BaseSuggestionPlugin).currentUserId,
        },
      },
      {
        match,
      }
    );
  });
};
