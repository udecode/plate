import { Thread, User } from '@udecode/plate-comments';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';
import {
  FetchContacts,
  OnCancelCreateThread,
  OnReOpenThread,
  OnResolveThread,
  OnSaveComment,
  OnSubmitComment,
  RetrieveUser,
} from '../../types';

export type RetrieveUserByEmailAddressReturnType = User | null;

export type RetrieveUserByEmailAddress = (
  emailAddress: string
) =>
  | RetrieveUserByEmailAddressReturnType
  | Promise<RetrieveUserByEmailAddressReturnType>;

export interface CommonThreadAndSideThreadProps {
  thread: Thread;
  onSaveComment: OnSaveComment;
  onSubmitComment: OnSubmitComment;
  onCancelCreateThread: OnCancelCreateThread;
  onResolveThread: OnResolveThread;
  fetchContacts: FetchContacts;
  retrieveUser: RetrieveUser;
  retrieveUserByEmailAddress: RetrieveUserByEmailAddress;
}

export interface ThreadStyleProps extends ThreadProps {}

export interface ThreadStyles {
  commentHeader: CSSProp;
  authorTimestamp: CSSProp;
  commenterName: CSSProp;
  buttons: CSSProp;
  commentButton: CSSProp;
  cancelButton: CSSProp;
}

export interface ThreadProps
  extends CommonThreadAndSideThreadProps,
    StyledProps<ThreadStyles> {
  assignedTo?: User;
  onReOpenThread?: OnReOpenThread;
  onResolveThread: OnResolveThread;
  retrieveUser: RetrieveUser;
  showMoreButton?: boolean;
  showReOpenThreadButton: boolean;
  showResolveThreadButton: boolean;
  thread: Thread;
}
