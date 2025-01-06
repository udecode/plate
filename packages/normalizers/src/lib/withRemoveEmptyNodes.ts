import { type ExtendEditor, ElementApi, NodeApi } from '@udecode/plate-common';
import castArray from 'lodash/castArray.js';

import type { RemoveEmptyNodesConfig } from './RemoveEmptyNodesPlugin';

/** Remove nodes with empty text. */
export const withRemoveEmptyNodes: ExtendEditor<RemoveEmptyNodesConfig> = ({
  editor,
  getOptions,
}) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]) => {
    const types = castArray(getOptions().types ?? []);

    if (
      ElementApi.isElement(node) &&
      node.type &&
      types.includes(node.type) &&
      NodeApi.string(node) === ''
    ) {
      editor.tf.removeNodes({ at: path });

      return;
    }

    normalizeNode([node, path]);
  };

  return editor;
};
