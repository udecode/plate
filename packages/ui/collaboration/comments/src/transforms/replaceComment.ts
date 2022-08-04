import { Comment } from '@xolvio/plate-comments';
import { replaceElementMatchingById } from './replaceElementMatchingById';

export const replaceComment = (
  comments: Comment[],
  newComment: Comment
): Comment[] => {
  return replaceElementMatchingById(comments, newComment);
};
