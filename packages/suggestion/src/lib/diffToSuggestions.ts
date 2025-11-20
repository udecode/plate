import { type ComputeDiffOptions, computeDiff } from '@platejs/diff';
import {
  type Descendant,
  type SlateEditor,
  type ValueOf,
  ElementApi,
  KEYS,
  TextApi,
} from 'platejs';

import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';
import { getSuggestionProps } from './transforms';
import { getSuggestionKey } from './utils';

export function diffToSuggestions<E extends SlateEditor>(
  editor: E,
  doc0: Descendant[],
  doc1: Descendant[],
  {
    getDeleteProps = (node) =>
      getSuggestionProps(editor, node, {
        suggestionDeletion: true,
      }),
    getInsertProps = (node) => getSuggestionProps(editor, node),
    getUpdateProps = (node, _properties, newProperties) =>
      getSuggestionProps(editor, node, {
        suggestionUpdate: newProperties,
      }),
    isInline = editor.api.isInline,
    ...options
  }: Partial<ComputeDiffOptions> = {}
): ValueOf<E> {
  const values = computeDiff(doc0, doc1, {
    getDeleteProps,
    getInsertProps,
    getUpdateProps,
    isInline,
    ...options,
  }) as ValueOf<E>;

  // Recursively traverse all nodes to process elements and their children
  const traverseNodes = (nodes: Descendant[]): Descendant[] => {
    return nodes.map((node, index) => {
      if (ElementApi.isElement(node) && 'children' in node) {
        // If the node is an element with children, recursively process its children
        return {
          ...node,
          children: traverseNodes(node.children),
        };
      }

      if (TextApi.isText(node) && node[KEYS.suggestion]) {
        return unifyAdjacentSuggestionIds(node, index, nodes, editor);
      }
      return node;
    });
  };

  return traverseNodes(values) as ValueOf<E>;
}

/**
 * Unifies the ID of adjacent insert and remove suggestions. When an insert
 * suggestion follows a remove suggestion, the insert suggestion inherits the ID
 * and creation time from the remove suggestion. This allows the UI to treat
 * them as a single suggestion for display and interaction purposes.
 */
function unifyAdjacentSuggestionIds<E extends SlateEditor>(
  node: Descendant,
  index: number,
  nodes: Descendant[],
  editor: E
): Descendant {
  const api = editor.getApi(BaseSuggestionPlugin);
  const currentNodeData = api.suggestion.suggestionData(node as any);

  if (currentNodeData?.type === 'insert') {
    // Get the previous node if it exists
    const previousNode = index > 0 ? nodes[index - 1] : null;

    if (previousNode?.[KEYS.suggestion]) {
      const previousData = api.suggestion.suggestionData(previousNode as any);

      if (previousData?.type === 'remove') {
        // Create a new node with the updated suggestion data
        const updatedNode = {
          ...node,
          [getSuggestionKey(previousData.id)]: {
            ...currentNodeData,
            id: previousData.id,
            createdAt: previousData.createdAt,
          },
        };

        // Remove the original insert suggestion key to avoid duplication
        const key = getSuggestionKey(currentNodeData.id);
        delete updatedNode[key];

        return updatedNode;
      }
    }
  }

  return node;
}
