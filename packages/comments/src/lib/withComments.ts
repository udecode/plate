import type { OverrideEditor } from '@udecode/plate';

import type { BaseCommentsConfig } from './BaseCommentsPlugin';
import type { TCommentText } from './types';

import { BaseCommentsPlugin } from './BaseCommentsPlugin';
import { getCommentCount, getDraftCommentKey } from './utils';

export const withComments: OverrideEditor<BaseCommentsConfig> = ({
  editor,
  tf: { normalizeNode },
}) => ({
  transforms: {
    normalizeNode(entry) {
      const [node, path] = entry;

      if (
        node[BaseCommentsPlugin.key] &&
        !node[getDraftCommentKey()] &&
        getCommentCount(node as TCommentText) < 1
      ) {
        editor.tf.unsetNodes(BaseCommentsPlugin.key, { at: path });

        return;
      }

      return normalizeNode(entry);
    },
  },
});
