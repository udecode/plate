import {
  ELEMENT_DEFAULT,
  getLastNode,
  queryNode,
  QueryNodeOptions,
} from '@udecode/slate-plugins-common';
import {
  getSlatePluginWithOverrides,
  isElement,
  WithOverride,
} from '@udecode/slate-plugins-core';
import { Path, Transforms } from 'slate';

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
 * Add a trailing block when the last node type is not `type`
 */
export const withTrailingBlock = ({
  type = ELEMENT_DEFAULT,
  level = 1,
  ...query
}: WithTrailingBlock = {}): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([currentNode, currentPath]) => {
    if (!currentPath.length) {
      const entry = getLastNode(editor, level);
      const [lastNode, lastPath] = entry;

      if (
        isElement(lastNode) &&
        lastNode.type !== type &&
        queryNode(entry, query)
      ) {
        Transforms.insertNodes(
          editor,
          {
            type,
            children: [{ text: '' }],
          } as any,
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
export const useTrailingBlockPlugin = getSlatePluginWithOverrides(
  withTrailingBlock
);
