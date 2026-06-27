import type { NodeEntry, SlateEditor, TElement, Text } from 'platejs';

import { KEYS } from 'platejs';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { findSuggestionProps } from '../queries';

export const removeNodesSuggestion = (
  editor: SlateEditor,
  nodes: NodeEntry<TElement | Text>[]
) => {
  if (nodes.length === 0) return;

  const { id, createdAt } = findSuggestionProps(editor, {
    at: editor.selection!,
    type: 'remove',
  });

  nodes.forEach(([, blockPath]) => {
    editor.tf.setNodes(
      {
        [KEYS.suggestion]: {
          id,
          createdAt,
          type: 'remove',
          userId: editor.getOptions(BaseSuggestionPlugin).currentUserId!,
        },
      },
      { at: blockPath }
    );
  });
};
