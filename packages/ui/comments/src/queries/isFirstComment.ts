import { Comment, Thread } from '../utils/types';

export function isFirstComment(thread: Thread, comment: Comment): boolean {
  return thread.comments.indexOf(comment) === 0;
}
