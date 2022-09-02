import { Comment, Thread } from '@udecode/plate-comments';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';
import { FetchContacts, OnReOpenThread, OnResolveThread } from '../../types';

export interface ThreadCommentStyleProps extends ThreadCommentProps {}

export interface ThreadCommentStyles {
  actions: CSSProp;
  authorTimestamp: CSSProp;
  commenterName: CSSProp;
  commentHeader: CSSProp;
  threadCommentText: CSSProp;
  timestamp: CSSProp;
}

export interface ThreadCommentProps extends StyledProps<ThreadCommentStyles> {
  comment: Comment;
  thread: Thread;
  showResolveThreadButton: boolean;
  showReOpenThreadButton: boolean;
  showMoreButton?: boolean;
  showLinkToThisComment: boolean;
  onSaveComment: (comment: Comment) => void;
  onResolveThread: OnResolveThread;
  onReOpenThread: OnReOpenThread;
  onDelete: (comment: Comment) => void;
  fetchContacts: FetchContacts;
}
