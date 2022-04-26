import { Comment, Thread } from '@udecode/plate-comments';
export interface UseCommentsResult {
    thread: Thread | null;
    show: boolean;
    position: {
        left: number;
        top: number;
    };
    onSubmitComment: (comment: Comment) => void;
    onAddThread: () => void;
}
export declare function useComments(): any;
//# sourceMappingURL=useComments.d.ts.map