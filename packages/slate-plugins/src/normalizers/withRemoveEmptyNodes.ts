import castArray from 'lodash/castArray';
import { Editor, Node, NodeEntry, Transforms } from 'slate';

/**
 * Remove nodes with empty text.
 */
export const withRemoveEmptyNodes = (options: { type: string | string[] }) => <
  T extends Editor
>(
  editor: T
) => {
  const types = castArray(options.type);

  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]: NodeEntry) => {
    if (
      node.type &&
      types.includes(node.type as string) &&
      Node.string(node) === ''
    ) {
      Transforms.removeNodes(editor, { at: path });
      return;
    }

    normalizeNode([node, path]);
  };

  return editor;
};
