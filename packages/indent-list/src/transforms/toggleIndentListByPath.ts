import {
  ELEMENT_DEFAULT,
  type PlateEditor,
  type TNodeEntry,
  type Value,
  setNodes,
  unsetNodes,
} from '@udecode/plate-common';
import { KEY_INDENT } from '@udecode/plate-indent';

import {
  KEY_LIST_CHECKED,
  KEY_LIST_STYLE_TYPE,
} from '../createIndentListPlugin';

export const toggleIndentListByPath = (
  editor: PlateEditor<Value>,
  [node, path]: TNodeEntry,
  listStyleType: string
) => {
  setNodes(
    editor,
    {
      [KEY_INDENT]: node.indent ?? 1,
      // TODO: normalized if not todo remove this property.
      [KEY_LIST_CHECKED]: false,
      [KEY_LIST_STYLE_TYPE]: listStyleType,
      type: ELEMENT_DEFAULT,
    },
    {
      at: path,
    }
  );
};

export const toggleIndentListByPathUnSet = (
  editor: PlateEditor<Value>,
  [, path]: TNodeEntry
) =>
  unsetNodes(editor, [KEY_LIST_STYLE_TYPE, KEY_INDENT, KEY_LIST_CHECKED], {
    at: path,
  });
