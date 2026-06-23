import type { Element, Text } from '@platejs/slate';
import type { NodeEntry, SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

import { findSuggestionProps } from '../queries';

export const removeNodesSuggestion = (
  editor: SlateEditor,
  nodes: NodeEntry<Element | Text>[]
) => {
  if (nodes.length === 0) return;

  const { id, createdAt } = findSuggestionProps(editor, {
    at: editor.selection!,
    type: 'remove',
  });

  editor.update((tx) => {
    nodes.forEach(([, blockPath]) => {
      tx.nodes.set(
        {
          [KEYS.suggestion]: {
            id,
            createdAt,
            type: 'remove',
          },
        },
        { at: blockPath }
      );
    });
  });
};
