import type { ExtendPlateEditorExtension } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import type { BaseCommentConfig } from './BaseCommentPlugin';

import {
  getCommentCount,
  getDraftCommentKey,
  getTransientCommentKey,
  isCommentText,
} from './utils';

export const withComment: ExtendPlateEditorExtension<
  BaseCommentConfig
> = () => ({
  normalizers: {
    node({ entry: [node, path], next, tx }) {
      if (
        isCommentText(node) &&
        !node[getDraftCommentKey()] &&
        !node[getTransientCommentKey()] &&
        getCommentCount(node) < 1
      ) {
        tx.nodes.unset(KEYS.comment, { at: path });

        return;
      }

      next();
    },
  },
});
