import { Comment, Thread, User } from '@udecode/plate-comments';
export declare type OnSubmitComment = (commentText: string) => Promise<void>;
export interface UseCommentsResult {
    thread: Thread | null;
    show: boolean;
    position: ThreadPosition;
    onSubmitComment: OnSubmitComment;
    onAddThread: () => void;
}
export interface ThreadPosition {
    left: number;
    top: number;
}
export declare type RetrieveUser = () => User | Promise<User>;
export declare type OnSaveComment = (comment: Comment) => void;
export declare function useComments({ retrieveUser, }: {
    retrieveUser: RetrieveUser;
}): {
    thread: Thread | null;
    position: ThreadPosition;
    onAddThread: () => void;
    onSaveComment: OnSaveComment;
    onSubmitComment: OnSubmitComment;
    onCancelCreateThread: () => void;
};
//# sourceMappingURL=useComments.d.ts.map