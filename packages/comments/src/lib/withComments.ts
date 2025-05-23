import type { OverrideEditor } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

import type { BaseCommentsConfig } from './BaseCommentsPlugin';
import type { TCommentText } from './types';

import { getCommentCount, getDraftCommentKey } from './utils';

export const withComments: OverrideEditor<BaseCommentsConfig> = ({
  editor,
  tf: { normalizeNode },
}) => ({
  transforms: {
    normalizeNode(entry) {
      const [node, path] = entry;

      if (
        node[KEYS.comment] &&
        !node[getDraftCommentKey()] &&
        getCommentCount(node as TCommentText) < 1
      ) {
        editor.tf.unsetNodes(KEYS.comment, { at: path });

        return;
      }

      return normalizeNode(entry);
    },
  },
});
