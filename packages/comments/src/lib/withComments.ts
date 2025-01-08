import type { ExtendEditorTransforms } from '@udecode/plate';

import {
  type BaseCommentsConfig,
  BaseCommentsPlugin,
} from './BaseCommentsPlugin';
import { removeCommentMark } from './transforms/removeCommentMark';
import { getCommentCount } from './utils';

export const withComments: ExtendEditorTransforms<BaseCommentsConfig> = ({
  editor,
  tf: { insertBreak, normalizeNode },
}) => {
  return {
    insertBreak() {
      removeCommentMark(editor);

      insertBreak();
    },

    normalizeNode(entry) {
      const [node, path] = entry;

      // Unset CommentsPlugin.key prop when there is no comments
      if (node[BaseCommentsPlugin.key] && getCommentCount(node as any) < 1) {
        editor.tf.unsetNodes(BaseCommentsPlugin.key, { at: path });

        return;
      }

      normalizeNode(entry);
    },
  };
};
