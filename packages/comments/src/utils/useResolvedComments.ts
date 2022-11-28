import { ThreadComment } from '../types';
import { useCommentsSelectors } from './commentsStore';

export const useResolvedComments = () => {
  const comments = useCommentsSelectors().comments();

  const res: ThreadComment[] = [];

  Object.keys(comments).forEach((key) => {
    const comment = comments[key] as ThreadComment;
    if (comment?.isResolved) {
      res.push(comment);
    }
  });

  return res;
};
