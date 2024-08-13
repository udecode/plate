import {
  ParagraphPlugin,
  type PlateEditor,
  type TNodeEntry,
  setNodes,
  unsetNodes,
} from '@udecode/plate-common';
import { IndentPlugin } from '@udecode/plate-indent';

import { KEY_LIST_CHECKED, IndentListPlugin } from '../IndentListPlugin';

export const toggleIndentListByPath = (
  editor: PlateEditor,
  [node, path]: TNodeEntry,
  listStyleType: string
) => {
  setNodes(
    editor,
    {
      [IndentPlugin.key]: node.indent ?? 1,
      // TODO: normalized if not todo remove this property.
      [KEY_LIST_CHECKED]: false,
      [IndentListPlugin.key]: listStyleType,
      type: ParagraphPlugin.key,
    },
    {
      at: path,
    }
  );
};

export const toggleIndentListByPathUnSet = (
  editor: PlateEditor,
  [, path]: TNodeEntry
) =>
  unsetNodes(editor, [IndentListPlugin.key, IndentPlugin.key, KEY_LIST_CHECKED], {
    at: path,
  });
