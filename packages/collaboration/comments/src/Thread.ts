import { Comment } from './Comment';
import { User } from './User';

export interface Thread {
  id: any;
  comments: Comment[];
  isResolved: boolean;
  createdBy: User;
  assignedTo?: User;
}

export function isFirstComment(thread: Thread, comment: Comment): boolean {
  return thread.comments.indexOf(comment) === 0;
}
