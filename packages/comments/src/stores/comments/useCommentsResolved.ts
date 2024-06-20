import type { TComment } from '../../types';

import { useCommentsSelectors } from './CommentsProvider';

export const useCommentsResolved = () => {
  const comments = useCommentsSelectors().commentsList();

  const res: TComment[] = [];

  Object.keys(comments).forEach((key) => {
    // @ts-ignore
    const comment = comments[key];

    if (comment?.isResolved) {
      res.push(comment);
    }
  });

  return res;
};
