import { isNodeType, QueryOptions } from 'common';
import { getLastNode } from 'common/queries/getLastNode';
import { TransformEditor } from 'common/transforms/withTransforms';
import { PARAGRAPH } from 'elements/paragraph';
import { Editor, Path } from 'slate';

export interface WithTrailingNode extends QueryOptions {
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
export const withTrailingNode = ({
  type = PARAGRAPH,
  level = 1,
  ...query
}: WithTrailingNode = {}) => <T extends Editor & TransformEditor>(
  editor: T
) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([currentNode, currentPath]) => {
    if (!currentPath.length) {
      const [lastNode, lastPath] = getLastNode(editor, level);

      if (lastNode.type !== type && isNodeType(lastNode, query)) {
        editor.insertNodes(
          {
            type,
            children: [{ text: '' }],
          },
          { at: Path.next(lastPath) }
        );
      }
    }

    return normalizeNode([currentNode, currentPath]);
  };

  return editor;
};
