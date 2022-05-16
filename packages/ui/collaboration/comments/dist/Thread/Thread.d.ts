/// <reference types="react" />
import { StyledProps } from '@udecode/plate-styled-components';
import { Thread as ThreadModel } from '@xolvio/plate-comments';
import { FetchContacts } from '../FetchContacts';
import { OnSaveComment, OnSubmitComment, RetrieveUser } from '../useComments';
export interface CommonThreadAndSideThreadProps {
    thread: ThreadModel;
    onSaveComment: OnSaveComment;
    onSubmitComment: OnSubmitComment;
    onCancelCreateThread: () => void;
    fetchContacts: FetchContacts;
    retrieveUser: RetrieveUser;
}
export declare type ThreadProps = {
    showResolveThreadButton: boolean;
    showReOpenThreadButton: boolean;
    showMoreButton: boolean;
} & StyledProps & CommonThreadAndSideThreadProps;
export declare function Thread({ thread, showResolveThreadButton, showReOpenThreadButton, showMoreButton, onSaveComment, onSubmitComment: onSubmitCommentCallback, onCancelCreateThread, fetchContacts, retrieveUser, ...props }: ThreadProps): JSX.Element;
//# sourceMappingURL=Thread.d.ts.map