import {
  getLastNodeByLevel,
  insertElements,
  PlateEditor,
  queryNode,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { TrailingBlockPlugin } from './createTrailingBlockPlugin';

/**
 * Add a trailing block when the last node type is not `type` and when the editor has .
 */
export const withTrailingBlock = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  {
    type,
    options: { level, ...query },
  }: WithPlatePlugin<TrailingBlockPlugin, V, E>
) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([currentNode, currentPath]) => {
    if (!currentPath.length) {
      const lastChild = getLastNodeByLevel(editor, level!);

      const lastChildNode = lastChild?.[0];

      if (
        !lastChildNode ||
        (lastChildNode.type !== type && queryNode(lastChild, query))
      ) {
        const at = lastChild ? Path.next(lastChild[1]) : [0];

        console.log(editor.children);
        insertElements(editor, editor.blockFactory({}, at), { at });
        return;
      }
    }

    return normalizeNode([currentNode, currentPath]);
  };

  return editor;
};
