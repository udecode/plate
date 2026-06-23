import { useEditorSelector } from 'platejs/react';

import type { BaseCommentConfig } from '../../lib';

export const useCommentId = () =>
  useEditorSelector((editor) => {
    if (!editor.selection) return;
    if (editor.api.isExpanded()) return;
    const commentApi = (editor.api as unknown as BaseCommentConfig['api'])
      .comment;

    const commentNode = commentApi.node();

    if (!commentNode) return;

    const [commentLeaf] = commentNode;

    return commentApi.nodeId(commentLeaf);
  }, []);
