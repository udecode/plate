import { Comment } from './Comment';
export interface Thread {
    id: any;
    comments: Comment[];
    isResolved: boolean;
}
export declare function isFirstComment(thread: Thread, comment: Comment): boolean;
//# sourceMappingURL=Thread.d.ts.map