import { type SlateEditor, type TNode, nanoid, TextApi } from '@udecode/plate';

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
      if (n[BaseSuggestionPlugin.key]) {
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
        [BaseSuggestionPlugin.key]: true,
        [getSuggestionKey(id)]: {
          id: id,
          createdAt: createdAt,
          newProperties: {
            [key]: value,
          },
          type: 'update',
          userId: editor.getOptions(BaseSuggestionPlugin).currentUserId,
        },
      },
      {
        match,
        split: true,
      }
    );
  });
};
