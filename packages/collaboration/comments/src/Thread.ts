import { Comment } from './Comment';

export interface Thread {
  id: any;
  comments: Comment[];
  isResolved: boolean;
}

export function isFirstComment(thread: Thread, comment: Comment): boolean {
  return thread.comments.indexOf(comment) === 0;
}
