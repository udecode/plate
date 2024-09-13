import {
  type SlateEditor,
  type TNodeEntry,
  BaseParagraphPlugin,
  setNodes,
  unsetNodes,
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
  setNodes(
    editor,
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
  unsetNodes(
    editor,
    [BaseIndentListPlugin.key, BaseIndentPlugin.key, INDENT_LIST_KEYS.checked],
    {
      at: path,
    }
  );
