import type { OverrideEditor, TCommentText } from 'platejs';

import { KEYS } from 'platejs';

import type { BaseCommentConfig } from './BaseCommentPlugin';

import { getCommentCount, getDraftCommentKey } from './utils';

export const withComment: OverrideEditor<BaseCommentConfig> = ({
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
