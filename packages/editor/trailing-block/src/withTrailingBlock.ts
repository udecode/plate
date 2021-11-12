import { getLastNode, insertNodes, queryNode } from '@udecode/plate-common';
import { TElement, WithOverride } from '@udecode/plate-core';
import { Path } from 'slate';
import { TrailingBlockPlugin } from './createTrailingBlockPlugin';

/**
 * Add a trailing block when the last node type is not `type` and when the editor has .
 */
export const withTrailingBlock = (): WithOverride<{}, TrailingBlockPlugin> => (
  editor,
  { type, level, ...query }
) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([currentNode, currentPath]) => {
    if (!currentPath.length) {
      const lastChild = getLastNode(editor, level!);

      const lastChildNode = lastChild?.[0];

      if (
        !lastChildNode ||
        (lastChildNode.type !== type && queryNode(lastChild, query))
      ) {
        const at = lastChild ? Path.next(lastChild[1]) : [0];

        insertNodes<TElement>(
          editor,
          {
            type: type!,
            children: [{ text: '' }],
          },
          { at }
        );
        return;
      }
    }

    return normalizeNode([currentNode, currentPath]);
  };

  return editor;
};
