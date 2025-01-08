import {
  type ExtendEditorTransforms,
  NodeApi,
  isDefined,
} from '@udecode/plate';

import {
  type BaseIndentListConfig,
  BaseIndentListPlugin,
} from '../BaseIndentListPlugin';
import { outdentList } from '../transforms';

export const withDeleteBackwardIndentList: ExtendEditorTransforms<
  BaseIndentListConfig
> = ({ editor, tf: { deleteBackward } }) => {
  return {
    deleteBackward(unit) {
      const nodeEntry = editor.api.above();

      if (!nodeEntry) return deleteBackward(unit);

      const listNode = nodeEntry[0];

      if (editor.api.isCollapsed() && NodeApi.string(listNode))
        return deleteBackward(unit);
      if (isDefined(listNode[BaseIndentListPlugin.key])) {
        return outdentList(editor);
      }

      return deleteBackward(unit);
    },
  };
};
