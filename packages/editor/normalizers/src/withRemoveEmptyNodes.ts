import {
  getNodeString,
  isElement,
  removeNodes,
  TNodeEntry,
  Value,
  WithOverride,
} from '@udecode/plate-core';
import castArray from 'lodash/castArray';
import { RemoveEmptyNodesPlugin } from './createRemoveEmptyNodesPlugin';

/**
 * Remove nodes with empty text.
 */
export const withRemoveEmptyNodes: WithOverride<
  Value,
  {},
  RemoveEmptyNodesPlugin
> = (editor, { options: { types: _types } }) => {
  const types = castArray(_types);

  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]: TNodeEntry) => {
    if (
      isElement(node) &&
      node.type &&
      types.includes(node.type) &&
      getNodeString(node) === ''
    ) {
      removeNodes(editor, { at: path });
      return;
    }

    normalizeNode([node, path]);
  };

  return editor;
};
