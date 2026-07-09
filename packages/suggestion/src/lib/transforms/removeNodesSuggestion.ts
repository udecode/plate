import type { BaseEditor } from '@platejs/core';
import type {
  EditorUpdateTransaction,
  Element,
  NodeEntry,
  Text,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { findSuggestionProps } from '../queries';

export const removeNodesSuggestion = (
  editor: BaseEditor,
  nodes: NodeEntry<Element | Text>[]
) => {
  editor.update((tx) => {
    removeNodesSuggestionWithTx(editor, tx, nodes);
  });
};

export const removeNodesSuggestionWithTx = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  nodes: NodeEntry<Element | Text>[]
) => {
  if (nodes.length === 0) return;

  const { id, createdAt } = findSuggestionProps(editor, {
    at: editor.read.selection()!,
    type: 'remove',
  });

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
};
