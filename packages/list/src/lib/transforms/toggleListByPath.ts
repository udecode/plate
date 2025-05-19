import {
  type NodeEntry,
  type SlateEditor,
  BaseParagraphPlugin,
} from '@udecode/plate';
import { BaseIndentPlugin } from '@udecode/plate-indent';

import { INDENT_LIST_KEYS } from '../BaseListPlugin';

export const toggleListByPath = (
  editor: SlateEditor,
  [node, path]: NodeEntry,
  listStyleType: string
) => {
  editor.tf.setNodes(
    {
      [BaseIndentPlugin.key]: node.indent ?? 1,
      // TODO: normalized if not todo remove this property.
      [INDENT_LIST_KEYS.checked]: false,
      [INDENT_LIST_KEYS.listStyleType]: listStyleType,
      type: BaseParagraphPlugin.key,
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
    [
      INDENT_LIST_KEYS.listStyleType,
      BaseIndentPlugin.key,
      INDENT_LIST_KEYS.checked,
    ],
    {
      at: path,
    }
  );
