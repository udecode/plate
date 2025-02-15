import { TextApi } from '@udecode/plate';
import { useEditorRef } from '@udecode/plate/react';

import { getDraftCommentKey } from '../../lib';
import { CommentsPlugin } from '../CommentsPlugin';

export const useAddCommentMark = () => {
  const editor = useEditorRef();

  return () => {
    if (!editor.api.isExpanded()) return;

    editor.tf.setNodes(
      {
        [CommentsPlugin.key]: true,
        [getDraftCommentKey()]: true,
      },
      { match: TextApi.isText, split: true }
    );
  };
};
