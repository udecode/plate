import { usePluginOption } from '@udecode/plate/react';

import type { TComment } from '../../../lib/types';

import { CommentsPlugin } from '../../CommentsPlugin';

export const useCommentsResolved = () => {
  const comments = usePluginOption(CommentsPlugin, 'comments');

  const res: TComment[] = [];

  Object.keys(comments).forEach((key) => {
    const comment = comments[key];

    if (comment?.isResolved) {
      res.push(comment);
    }
  });

  return res;
};
