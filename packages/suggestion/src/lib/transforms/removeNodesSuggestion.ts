import type { NodeEntry, SlateEditor, TElement, Text } from '@udecode/plate';

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
        [BaseSuggestionPlugin.key]: {
          id,
          createdAt,
          type: 'remove',
        },
      },
      { at: blockPath }
    );
  });
};
