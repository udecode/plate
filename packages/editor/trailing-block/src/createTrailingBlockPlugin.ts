import {
  ELEMENT_DEFAULT,
  getLastNode,
  insertNodes,
  queryNode,
  QueryNodeOptions,
} from '@udecode/plate-common';
import {
  createPlugin,
  getPlugin,
  getPluginType,
  TElement,
  WithOverride,
} from '@udecode/plate-core';
import { Path } from 'slate';

export interface TrailingBlockPlugin extends QueryNodeOptions {
  /**
   * Level where the trailing node should be, the first level being 0.
   */
  level: number;

  /**
   * Type of the trailing block
   */
  type: string;
}

export const KEY_TRAILING_BLOCK = 'trailingBlock';

/**
 * Add a trailing block when the last node type is not `type` and when the editor has .
 */
export const withTrailingBlock = (): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  const { type, level, ...query } = getPlugin<TrailingBlockPlugin>(
    editor,
    KEY_TRAILING_BLOCK
  );

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
export const createTrailingBlockPlugin = createPlugin<TrailingBlockPlugin>({
  key: KEY_TRAILING_BLOCK,
  withOverrides: withTrailingBlock(),
  level: 0,
  withEditor: (editor) => ({
    type: getPluginType(editor, ELEMENT_DEFAULT),
  }),
});
