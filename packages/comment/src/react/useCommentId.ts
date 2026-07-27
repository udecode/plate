import { useEditorSelector } from '@platejs/core/react';

import { BaseCommentPlugin } from '../lib';

export const useCommentId = () =>
  useEditorSelector((editor) => {
    if (!editor.read.selection() || editor.read.selection.isExpanded()) return;
    const { api, read } = editor.plugin(BaseCommentPlugin);
    const commentNode = read.node();

    if (!commentNode) return;

    return api.nodeId(commentNode[0]);
  });
