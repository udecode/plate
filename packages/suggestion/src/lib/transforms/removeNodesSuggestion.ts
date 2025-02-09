import {
  type RemoveNodesOptions,
  type SlateEditor,
  NodeApi,
} from '@udecode/plate';

import { BaseSuggestionPlugin, SUGGESTION_KEYS } from '../BaseSuggestionPlugin';
import { findSuggestionProps } from '../queries';
import { getSuggestionKey } from '../utils';

export const removeNodesSuggestion = (
  editor: SlateEditor,
  options?: RemoveNodesOptions
) => {
  const nodes = [...editor.api.nodes(options)];

  if (nodes.length === 0) return;

  const { id, createdAt: createdAt } = findSuggestionProps(editor, {
    at: editor.selection!,
    type: 'remove',
  });

  nodes.forEach(([, blockPath]) => {
    const children = NodeApi.children(editor, blockPath);

    children.forEach(([, path]) => {
      editor.tf.setNodes(
        {
          [BaseSuggestionPlugin.key]: true,
          [getSuggestionKey(id)]: {
            id,
            createdAt: createdAt,
            type: 'remove',
            userId: editor.getOptions(BaseSuggestionPlugin).currentUserId,
          },
        },
        { at: path }
      );
    });

    editor.tf.setNodes(
      {
        [SUGGESTION_KEYS.lineBreak]: {
          id,
          type: 'remove',
        },
      },
      { at: blockPath }
    );
  });
};
