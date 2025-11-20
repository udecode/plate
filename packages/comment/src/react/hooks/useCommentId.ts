import { useEditorSelector } from 'platejs/react';

import { BaseCommentPlugin } from '../../lib';

export const useCommentId = () =>
  useEditorSelector((editor) => {
    if (!editor.selection) return;
    if (editor.api.isExpanded()) return;
    const api = editor.getApi(BaseCommentPlugin);

    const commentNode = api.comment.node();

    if (!commentNode) return;

    const [commentLeaf] = commentNode;

    return api.comment.nodeId(commentLeaf);
  }, []);
