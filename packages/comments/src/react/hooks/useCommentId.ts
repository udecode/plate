import { useEditorSelector } from '@udecode/plate/react';

import { findCommentNode, getCommentLastId } from '../../lib';

export const useCommentId = () => {
  return useEditorSelector((editor) => {
    if (!editor.selection) return;
    if (editor.api.isExpanded()) return;

    const commentNode = findCommentNode(editor);

    if (!commentNode) return;

    const [commentLeaf] = commentNode;

    return getCommentLastId(commentLeaf);
  }, []);
};
