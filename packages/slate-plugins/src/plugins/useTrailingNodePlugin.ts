import {
  getLastNode,
  queryNode,
  QueryNodeOptions,
} from '@udecode/slate-plugins-common';
import {
  getSlatePluginWithOverrides,
  WithOverride,
} from '@udecode/slate-plugins-core';
import { Path, Transforms } from 'slate';
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
}: WithTrailingNode = {}): WithOverride => (editor) => {
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

/**
 * @see {@link withTrailingNode}
 */
export const useTrailingNodePlugin = getSlatePluginWithOverrides(
  withTrailingNode
);
