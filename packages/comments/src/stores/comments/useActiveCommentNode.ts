import { usePlateEditorRef } from '@udecode/plate-common';
import { findCommentNodeById } from '../../queries/index';
import { useCommentsSelectors } from './CommentsProvider';

export const useActiveCommentNode = () => {
  const editor = usePlateEditorRef();

  const id = useCommentsSelectors().activeCommentId();
  if (!id) return null;

  return findCommentNodeById(editor, id);
};
