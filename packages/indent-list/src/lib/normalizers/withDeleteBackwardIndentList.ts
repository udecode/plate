import {
  type ExtendEditor,
  getNodeString,
  isCollapsed,
  isDefined,
} from '@udecode/plate-common';

import {
  type BaseIndentListConfig,
  BaseIndentListPlugin,
} from '../BaseIndentListPlugin';
import { outdentList } from '../transforms';

export const withDeleteBackwardIndentList: ExtendEditor<
  BaseIndentListConfig
> = ({ editor }) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (unit) => {
    const nodeEntry = editor.api.above();

    if (!nodeEntry) return deleteBackward(unit);

    const listNode = nodeEntry[0];

    if (isCollapsed(editor.selection) && getNodeString(listNode))
      return deleteBackward(unit);
    if (isDefined(listNode[BaseIndentListPlugin.key])) {
      return outdentList(editor);
    }

    return deleteBackward(unit);
  };

  return editor;
};
