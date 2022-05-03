import {
  getNodeString,
  isElement,
  TNodeEntry,
  WithOverride,
} from '@udecode/plate-core';
import castArray from 'lodash/castArray';
import { Transforms } from 'slate';
import { RemoveEmptyNodesPlugin } from './createRemoveEmptyNodesPlugin';

/**
 * Remove nodes with empty text.
 */
export const withRemoveEmptyNodes: WithOverride<{}, RemoveEmptyNodesPlugin> = (
  editor,
  { options: { types: _types } }
) => {
  const types = castArray(_types);

  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]: TNodeEntry) => {
    if (
      isElement(node) &&
      node.type &&
      types.includes(node.type) &&
      getNodeString(node) === ''
    ) {
      Transforms.removeNodes(editor, { at: path });
      return;
    }

    normalizeNode([node, path]);
  };

  return editor;
};
