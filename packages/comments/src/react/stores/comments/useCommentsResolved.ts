import { useEditorPlugin } from '@udecode/plate-common/react';

import type { TComment } from '../../../lib/types';

import { CommentsPlugin } from '../../CommentsPlugin';

export const useCommentsResolved = () => {
  const { useOption } = useEditorPlugin(CommentsPlugin);

  const comments = useOption('comments');

  const res: TComment[] = [];

  Object.keys(comments).forEach((key) => {
    const comment = comments[key];

    if (comment?.isResolved) {
      res.push(comment);
    }
  });

  return res;
};
