import type { TextUnit } from 'slate';

import {
  type PlateEditor,
  getAboveNode,
  getNodeString,
  isCollapsed,
  isDefined,
} from '@udecode/plate-common';

import { KEY_LIST_STYLE_TYPE } from '../IndentListPlugin';
import { outdentList } from '../transforms';

export const deleteBackwardIndentList = (editor: PlateEditor) => {
  const { deleteBackward } = editor;

  return function (unit: TextUnit) {
    const nodeEntry = getAboveNode(editor);

    if (!nodeEntry) return deleteBackward(unit);

    const listNode = nodeEntry[0];

    if (isCollapsed(editor.selection) && getNodeString(listNode))
      return deleteBackward(unit);
    if (isDefined(listNode[KEY_LIST_STYLE_TYPE])) {
      return outdentList(editor);
    }

    return deleteBackward(unit);
  };
};
