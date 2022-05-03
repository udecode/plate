/// <reference types="react" />
import { Comment, Thread as ThreadModel } from '@udecode/plate-comments';
import { StyledProps } from '@udecode/plate-styled-components';
import { FetchContacts } from '../FetchContacts';
export interface ThreadProps extends StyledProps {
    thread: ThreadModel;
    showResolveThreadButton: boolean;
    showReOpenThreadButton: boolean;
    showMoreButton: boolean;
    onSaveComment: (comment: Comment) => void;
    onSubmitComment: (comment: Comment) => void;
    onCancelCreateThread: () => void;
    fetchContacts: FetchContacts;
}
export declare function Thread({ thread, showResolveThreadButton, showReOpenThreadButton, showMoreButton, onSaveComment, onSubmitComment: onSubmitCommentCallback, onCancelCreateThread, fetchContacts, ...props }: ThreadProps): JSX.Element;
//# sourceMappingURL=Thread.d.ts.map