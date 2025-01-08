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
    deleteBackward(options) {
      const nodeEntry = editor.api.above();

      if (!nodeEntry) return deleteBackward(options);

      const listNode = nodeEntry[0];

      if (editor.api.isCollapsed() && NodeApi.string(listNode))
        return deleteBackward(options);
      if (isDefined(listNode[BaseIndentListPlugin.key])) {
        return outdentList(editor);
      }

      return deleteBackward(options);
    },
  };
};
