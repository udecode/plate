import { useEditorSelector } from '@platejs/core/react';

import { BaseCommentPlugin } from '../../lib';

export const useCommentId = () =>
  useEditorSelector((editor) => {
    if (!editor.read.selection() || editor.read.selection.isExpanded()) return;
    const { api } = editor.plugin(BaseCommentPlugin);

    const commentNode = api.node();

    if (!commentNode) return;

    const [commentLeaf] = commentNode;

    return api.nodeId(commentLeaf);
  }, []);
