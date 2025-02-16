import { useEditorSelector } from '@udecode/plate/react';

import { BaseCommentsPlugin, getCommentLastId } from '../../lib';

export const useCommentId = () => {
  return useEditorSelector((editor) => {
    if (!editor.selection) return;
    if (editor.api.isExpanded()) return;

    const commentNode = editor.getApi(BaseCommentsPlugin).comment.node();

    if (!commentNode) return;

    const [commentLeaf] = commentNode;

    return getCommentLastId(commentLeaf);
  }, []);
};
