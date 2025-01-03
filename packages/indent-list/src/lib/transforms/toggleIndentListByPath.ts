import {
  type SlateEditor,
  type TNodeEntry,
  BaseParagraphPlugin,
} from '@udecode/plate-common';
import { BaseIndentPlugin } from '@udecode/plate-indent';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';

export const toggleIndentListByPath = (
  editor: SlateEditor,
  [node, path]: TNodeEntry,
  listStyleType: string
) => {
  editor.tf.setNodes(
    {
      [BaseIndentListPlugin.key]: listStyleType,
      [BaseIndentPlugin.key]: node.indent ?? 1,
      // TODO: normalized if not todo remove this property.
      [INDENT_LIST_KEYS.checked]: false,
      type: BaseParagraphPlugin.key,
    },
    {
      at: path,
    }
  );
};

export const toggleIndentListByPathUnSet = (
  editor: SlateEditor,
  [, path]: TNodeEntry
) =>
  editor.tf.unsetNodes(
    [BaseIndentListPlugin.key, BaseIndentPlugin.key, INDENT_LIST_KEYS.checked],
    {
      at: path,
    }
  );
