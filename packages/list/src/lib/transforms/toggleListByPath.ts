import { type NodeEntry, type SlateEditor, KEYS } from '@udecode/plate';

export const toggleListByPath = (
  editor: SlateEditor,
  [node, path]: NodeEntry,
  listStyleType: string
) => {
  editor.tf.setNodes(
    {
      [KEYS.indent]: node.indent ?? 1,
      // TODO: normalized if not todo remove this property.
      [KEYS.listChecked]: false,
      [KEYS.listType]: listStyleType,
      type: KEYS.p,
    },
    {
      at: path,
    }
  );
};

export const toggleListByPathUnSet = (
  editor: SlateEditor,
  [, path]: NodeEntry
) =>
  editor.tf.unsetNodes([KEYS.listType, KEYS.indent, KEYS.listChecked], {
    at: path,
  });
