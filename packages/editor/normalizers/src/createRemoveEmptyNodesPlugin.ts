import { createPlugin, isElement, WithOverride } from '@udecode/plate-core';
import castArray from 'lodash/castArray';
import { Node, NodeEntry, Transforms } from 'slate';

export interface RemoveEmptyNodesPlugin {
  types?: string | string[];
}

/**
 * Remove nodes with empty text.
 */
export const withRemoveEmptyNodes = (): WithOverride<
  {},
  RemoveEmptyNodesPlugin
> => (editor, { types: _types }) => {
  const types = castArray(_types);

  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]: NodeEntry) => {
    if (
      isElement(node) &&
      node.type &&
      types.includes(node.type) &&
      Node.string(node) === ''
    ) {
      Transforms.removeNodes(editor, { at: path });
      return;
    }

    normalizeNode([node, path]);
  };

  return editor;
};

/**
 * @see {@link withRemoveEmptyNodes}
 */
export const createRemoveEmptyNodesPlugin = createPlugin<RemoveEmptyNodesPlugin>(
  {
    key: 'removeEmptyNodes',
    withOverrides: withRemoveEmptyNodes(),
  }
);
