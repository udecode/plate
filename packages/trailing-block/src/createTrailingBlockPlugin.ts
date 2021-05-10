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
  isElement,
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
 * Add a trailing block when the last node type is not `type`.
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
      const entry = getLastNode(editor, level);
      const [lastNode, lastPath] = entry;

      if (
        isElement(lastNode) &&
        lastNode.type !== type &&
        queryNode(entry, query)
      ) {
        insertNodes<TElement>(
          editor,
          {
            type,
            children: [{ text: '' }],
          },
          { at: Path.next(lastPath) }
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
