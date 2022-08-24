import { Thread } from '@xolvio/plate-comments';
import {
  OnAddThread,
  OnCancelCreateThread,
  OnResolveThread,
  OnSaveComment,
  OnSubmitComment,
  RetrieveUser,
  ThreadPosition,
} from '../../types';

export type UseCommentsParams = {
  retrieveUser: RetrieveUser;
};

export type UseCommentsReturnType = {
  thread: Thread | null;
  position: ThreadPosition;
  onAddThread: OnAddThread;
  onSaveComment: OnSaveComment;
  onSubmitComment: OnSubmitComment;
  onCancelCreateThread: OnCancelCreateThread;
  onResolveThread: OnResolveThread;
};
