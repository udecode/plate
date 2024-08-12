import {
  type WithOverride,
  getNodeString,
  isElement,
  removeNodes,
} from '@udecode/plate-common';
import castArray from 'lodash/castArray.js';

import type { RemoveEmptyNodesPluginOptions } from './RemoveEmptyNodesPlugin';

/** Remove nodes with empty text. */
export const withRemoveEmptyNodes: WithOverride<
  RemoveEmptyNodesPluginOptions
> = ({
  editor,
  plugin: {
    options: { types: _types },
  },
}) => {
  const types = castArray(_types);

  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]) => {
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
