import { type WithOverride, unsetNodes } from '@udecode/plate-common/server';

import type { CommentsPluginOptions } from './types';

import { MARK_COMMENT } from './constants';
import { removeCommentMark } from './transforms/removeCommentMark';
import { getCommentCount } from './utils/getCommentCount';

export const withComments: WithOverride<CommentsPluginOptions> = (
  editor,
  _plugin
) => {
  const { insertBreak, normalizeNode } = editor;

  editor.insertBreak = () => {
    removeCommentMark(editor);

    insertBreak();
  };

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // Unset MARK_COMMENT prop when there is no comments
    if (node[MARK_COMMENT] && getCommentCount(node as any) < 1) {
      unsetNodes(editor, MARK_COMMENT, { at: path });

      return;
    }

    normalizeNode(entry);
  };

  return editor;
};
