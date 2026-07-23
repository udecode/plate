import type { ExtendPlateEditorExtension, PluginConfig } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import {
  getCommentCount,
  getDraftCommentKey,
  getTransientCommentKey,
  isCommentText,
} from './utils';

export const withComment: ExtendPlateEditorExtension<
  PluginConfig<'comment'>
> = () => ({
  corrections: [
    {
      event: 'properties',
      correct({ entry: [node, path], tx }) {
        if (
          isCommentText(node) &&
          !node[getDraftCommentKey()] &&
          !node[getTransientCommentKey()] &&
          getCommentCount(node) < 1
        ) {
          tx.nodes.unset(KEYS.comment, { at: path });

          return;
        }
      },
    },
  ],
});
