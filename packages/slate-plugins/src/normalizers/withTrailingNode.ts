import { Editor, Path, Transforms } from 'slate';
import { queryNode, QueryNodeOptions } from '../common';
import { getLastNode } from '../common/queries';
import { ELEMENT_PARAGRAPH } from '../elements/paragraph/defaults';

export interface WithTrailingNode extends QueryNodeOptions {
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
  type = ELEMENT_PARAGRAPH,
  level = 1,
  ...query
}: WithTrailingNode = {}) => <T extends Editor>(editor: T) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([currentNode, currentPath]) => {
    if (!currentPath.length) {
      const entry = getLastNode(editor, level);
      const [lastNode, lastPath] = entry;

      if (lastNode.type !== type && queryNode(entry, query)) {
        Transforms.insertNodes(
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
