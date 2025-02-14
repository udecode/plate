import type {
  NodeEntry,
  SlateEditor,
  TElement,
  Text,
} from '@udecode/plate';

import { SUGGESTION_KEYS } from '../BaseSuggestionPlugin';
import { findSuggestionProps } from '../queries';

export const removeNodesSuggestion = (
  editor: SlateEditor,
  nodes: NodeEntry<TElement | Text>[]
) => {
  if (nodes.length === 0) return;

  const { id, createdAt: createdAt } = findSuggestionProps(editor, {
    at: editor.selection!,
    type: 'remove',
  });

  nodes.forEach(([, blockPath]) => {
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
