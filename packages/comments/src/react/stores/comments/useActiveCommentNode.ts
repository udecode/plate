import { useEditorRef, usePluginOption } from '@udecode/plate/react';

import { findCommentNodeById } from '../../../lib';
import { CommentsPlugin } from '../../CommentsPlugin';

export const useActiveCommentNode = () => {
  const editor = useEditorRef();

  const id = usePluginOption(CommentsPlugin, 'activeCommentId');

  if (!id) return null;

  return findCommentNodeById(editor, id);
};
