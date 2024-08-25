import {
  type ExtendEditor,
  getAboveNode,
  getNodeString,
  isCollapsed,
  isDefined,
} from '@udecode/plate-common';

import { type IndentListConfig, IndentListPlugin } from '../IndentListPlugin';
import { outdentList } from '../transforms';

export const withDeleteBackwardIndentList: ExtendEditor<IndentListConfig> = ({
  editor,
}) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (unit) => {
    const nodeEntry = getAboveNode(editor);

    if (!nodeEntry) return deleteBackward(unit);

    const listNode = nodeEntry[0];

    if (isCollapsed(editor.selection) && getNodeString(listNode))
      return deleteBackward(unit);
    if (isDefined(listNode[IndentListPlugin.key])) {
      return outdentList(editor);
    }

    return deleteBackward(unit);
  };

  return editor;
};
