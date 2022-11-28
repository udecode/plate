import { usePlateEditorRef } from '@udecode/plate-core';
import { useCommentsSelectors } from './commentsStore';
import { findCommentNodeById } from './findCommentNodeById';

export const useActiveCommentNode = () => {
  const editor = usePlateEditorRef();

  const id = useCommentsSelectors().activeCommentId();
  if (!id) return null;

  return findCommentNodeById(editor, id);
};
