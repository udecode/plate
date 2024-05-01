import { TComment } from '../../../common/types';
import { useCommentsSelectors } from './CommentsProvider';

export const useCommentsResolved = () => {
  const comments = useCommentsSelectors().comments();

  const res: TComment[] = [];

  Object.keys(comments).forEach((key) => {
    const comment = comments[key];
    if (comment?.isResolved) {
      res.push(comment);
    }
  });

  return res;
};
