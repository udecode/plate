import { useEditorSelector } from '@udecode/plate/react';

import { BaseCommentsPlugin } from '../../lib';

export const useCommentId = () => {
  return useEditorSelector((editor) => {
    if (!editor.selection) return;
    if (editor.api.isExpanded()) return;
    const api = editor.getApi(BaseCommentsPlugin);

    const commentNode = api.comment.node();

    if (!commentNode) return;

    const [commentLeaf] = commentNode;

    return api.comment.nodeId(commentLeaf);
  }, []);
};
