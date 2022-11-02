import { Comment, Thread } from '../types';

export const isFirstComment = (thread: Thread, comment: Comment) => {
  return thread.comments.indexOf(comment) === 0;
};
