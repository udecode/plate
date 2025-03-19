import {
  type Descendant,
  type SlateEditor,
  type ValueOf,
  ElementApi,
  nanoid,
  TextApi,
} from '@udecode/plate';
import { type ComputeDiffOptions, computeDiff } from '@udecode/plate-diff';

import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';
import { getSuggestionProps } from './transforms';
import { getSuggestionKey } from './utils';

export function diffToSuggestions<E extends SlateEditor>(
  editor: E,
  doc0: Descendant[],
  doc1: Descendant[],
  {
    getDeleteProps = () =>
      getSuggestionProps(editor, nanoid(), {
        suggestionDeletion: true,
      }),
    getInsertProps = () => getSuggestionProps(editor, nanoid()),
    getUpdateProps = (_node, _properties, newProperties) =>
      getSuggestionProps(editor, nanoid(), {
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

      if (TextApi.isText(node) && node[BaseSuggestionPlugin.key]) {
        const api = editor.getApi(BaseSuggestionPlugin);
        const currentNodeData = api.suggestion.suggestionData(node as any);

        if (currentNodeData?.type === 'insert') {
          // Get the previous node if it exists
          const previousNode = index > 0 ? nodes[index - 1] : null;

          if (previousNode?.[BaseSuggestionPlugin.key]) {
            const previousData = api.suggestion.suggestionData(
              previousNode as any
            );

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

              // Return the updated node instead of modifying the original

              const key = getSuggestionKey(currentNodeData.id);
              delete updatedNode[key];

              return updatedNode;
            }
          }
        }

        return node;
      }
      return node;
    });
  };

  return traverseNodes(values) as ValueOf<E>;
}
