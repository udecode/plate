import {
  getSlatePluginWithOverrides,
  isElement,
  WithOverride,
} from '@udecode/slate-plugins-core';
import castArray from 'lodash/castArray';
import { Node, NodeEntry, Transforms } from 'slate';

/**
 * Remove nodes with empty text.
 */
export const withRemoveEmptyNodes = (options: {
  type: string | string[];
}): WithOverride => (editor) => {
  const types = castArray(options.type);

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
export const getRemoveEmptyNodesPlugin = getSlatePluginWithOverrides(
  withRemoveEmptyNodes
);
