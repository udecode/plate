import { type OverrideEditor, isDefined, KEYS, NodeApi } from '@udecode/plate';

import type { BaseListConfig } from '../BaseListPlugin';

import { outdentList } from '../transforms';

export const withDeleteBackwardList: OverrideEditor<BaseListConfig> = ({
  editor,
  tf: { deleteBackward },
}) => {
  return {
    transforms: {
      deleteBackward(unit) {
        const nodeEntry = editor.api.above();

        if (!nodeEntry) return deleteBackward(unit);

        const listNode = nodeEntry[0];

        if (editor.api.isCollapsed() && NodeApi.string(listNode))
          return deleteBackward(unit);
        if (isDefined(listNode[KEYS.listType])) {
          return outdentList(editor);
        }

        return deleteBackward(unit);
      },
    },
  };
};
