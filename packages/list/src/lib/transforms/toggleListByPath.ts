import { type NodeEntry, type SlateEditor, KEYS } from '@udecode/plate';

import { INDENT_LIST_KEYS } from '../BaseListPlugin';

export const toggleListByPath = (
  editor: SlateEditor,
  [node, path]: NodeEntry,
  listStyleType: string
) => {
  editor.tf.setNodes(
    {
      // TODO: normalized if not todo remove this property.
      [INDENT_LIST_KEYS.checked]: false,
      [INDENT_LIST_KEYS.listStyleType]: listStyleType,
      [KEYS.indent]: node.indent ?? 1,
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
  editor.tf.unsetNodes(
    [INDENT_LIST_KEYS.listStyleType, KEYS.indent, INDENT_LIST_KEYS.checked],
    {
      at: path,
    }
  );
