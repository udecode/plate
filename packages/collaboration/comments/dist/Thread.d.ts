import { Comment } from './Comment';
import { User } from './User';
export interface Thread {
    id: any;
    comments: Comment[];
    isResolved: boolean;
    createdBy: User;
}
export declare function isFirstComment(thread: Thread, comment: Comment): boolean;
//# sourceMappingURL=Thread.d.ts.map