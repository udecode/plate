import {
  ELEMENT_DEFAULT,
  getLastNode,
  insertNodes,
  queryNode,
  QueryNodeOptions,
} from '@udecode/slate-plugins-common';
import {
  getSlatePluginType,
  getSlatePluginWithOverrides,
  SPEditor,
  TElement,
  WithOverride,
} from '@udecode/slate-plugins-core';
import { Path } from 'slate';

export interface WithTrailingBlock extends QueryNodeOptions {
  /**
   * Type of the trailing block
   */
  type?: string;
  /**
   * Level where the trailing node should be, the first level being 0.
   */
  level?: number;
}

/**
 * Add a trailing block when the last node type is not `type` and when the editor has .
 */
export const withTrailingBlock = ({
  type: _type,
  level = 0,
  ...query
}: WithTrailingBlock = {}): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  const type =
    _type ?? getSlatePluginType((editor as any) as SPEditor, ELEMENT_DEFAULT);

  editor.normalizeNode = ([currentNode, currentPath]) => {
    if (!currentPath.length) {
      const lastChild = getLastNode(editor, level);

      const lastChildNode = lastChild?.[0];

      if (
        !lastChildNode ||
        (lastChildNode.type !== type && queryNode(lastChild, query))
      ) {
        const at = lastChild ? Path.next(lastChild[1]) : [0];

        insertNodes<TElement>(
          editor,
          {
            type,
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

/**
 * @see {@link withTrailingNode}
 */
export const createTrailingBlockPlugin = getSlatePluginWithOverrides(
  withTrailingBlock
);
