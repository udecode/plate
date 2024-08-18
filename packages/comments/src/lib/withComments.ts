import { type WithOverride, unsetNodes } from '@udecode/plate-common';

import { CommentsPlugin } from './CommentsPlugin';
import { removeCommentMark } from './transforms/removeCommentMark';
import { getCommentCount } from './utils';

export const withComments: WithOverride = ({ editor }) => {
  const { insertBreak, normalizeNode } = editor;

  editor.insertBreak = () => {
    removeCommentMark(editor);

    insertBreak();
  };

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // Unset CommentsPlugin.key prop when there is no comments
    if (node[CommentsPlugin.key] && getCommentCount(node as any) < 1) {
      unsetNodes(editor, CommentsPlugin.key, { at: path });

      return;
    }

    normalizeNode(entry);
  };

  return editor;
};
