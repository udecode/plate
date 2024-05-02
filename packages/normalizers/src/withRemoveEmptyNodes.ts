import {
  getNodeString,
  isElement,
  PlateEditor,
  removeNodes,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common/server';
import castArray from 'lodash/castArray.js';

import { RemoveEmptyNodesPlugin } from './createRemoveEmptyNodesPlugin';

/**
 * Remove nodes with empty text.
 */
export const withRemoveEmptyNodes = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  { options: { types: _types } }: WithPlatePlugin<RemoveEmptyNodesPlugin, V, E>
) => {
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
