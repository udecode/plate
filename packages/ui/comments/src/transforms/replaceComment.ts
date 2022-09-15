import { Comment } from '../types';
import { replaceElementMatchingById } from './replaceElementMatchingById';

export const replaceComment = (
  comments: Comment[],
  newComment: Comment
): Comment[] => {
  return replaceElementMatchingById(comments, newComment);
};
