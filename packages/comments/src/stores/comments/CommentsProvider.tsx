import { createAtomStore } from '@udecode/plate-common';
import { type Value, getNodeString } from '@udecode/plate-common/server';

import type { CommentUser, ReplyContent, TComments, TReply } from '../../types';

import { getCommentsById } from '../../utils/getRepliesByCommentsId';

export interface CommentsStoreState {
  /** Id of the active comment. If null, no comment is active. */
  activeCommentId: null | string;

  addingCommentId: null | string;

  /** Comments data. */
  commentsList: TComments[];

  editingReplyId: null | string;

  editingValue: Value | null;

  focusTextarea: boolean;

  /** Id of the current user. */
  myUserId: null | string;

  newValue: Value;

  onCommentAdd:
    | ((comments: TComments, content: ReplyContent, myUserId: string) => void)
    | null;

  onCommentDelete:
    | ((reply: TReply, comments: TComments, myUserId: string) => void)
    | null;
  onCommentUpdate:
    | ((
        reply: TReply,
        comments: TComments,
        content: ReplyContent,
        myUserId: string
      ) => void)
    | null;
  openMenuReplyId: null | string;
  /** Users data. */
  users: Record<string, CommentUser>;
}

export const { CommentsProvider, commentsStore, useCommentsStore } =
  createAtomStore(
    {
      activeCommentId: null,
      addingCommentId: null,
      commentsList: [],
      editingReplyId: null,
      editingValue: [{ children: [{ text: '' }], type: 'p' }],
      focusTextarea: false,
      myUserId: null,
      newValue: [{ children: [{ text: '' }], type: 'p' }],
      onCommentAdd: null,
      onCommentDelete: null,
      onCommentUpdate: null,
      openMenuReplyId: null,
      users: {},
    } as CommentsStoreState,
    {
      name: 'comments',
    }
  );

export const useCommentsStates = () => useCommentsStore().use;

export const useCommentsSelectors = () => useCommentsStore().get;

export const useCommentsActions = () => useCommentsStore().set;

export const DEFAULT_REPLY_CONTENT = [{ children: [{ text: '' }], type: 'p' }];

export const useActiveComments = () => {
  const activeId = useCommentsSelectors().activeCommentId();
  const commentsList = useCommentsSelectors().commentsList();

  if (activeId) return getCommentsById(commentsList, activeId);
};

export const useCommentsEditingReply = (): ReplyContent => {
  const replyContentRich = useCommentsSelectors().editingValue();

  if (!replyContentRich) return ['', DEFAULT_REPLY_CONTENT];

  const replyContent = getNodeString(replyContentRich[0]);

  return [replyContent, replyContentRich];
};

export const useIsEditingReply = (id: null | string) => {
  const editingId = useCommentsSelectors().editingReplyId();

  return editingId === id;
};

export const useIsReplyMenuOpen = (id: null | string) => {
  const openMenuReplyId = useCommentsSelectors().openMenuReplyId();

  return openMenuReplyId === id;
};

export const useCommentsNewReply = (): ReplyContent => {
  const replyContentRich = useCommentsSelectors().newValue();

  if (!replyContentRich) return ['', DEFAULT_REPLY_CONTENT];

  const replyContent = getNodeString(replyContentRich[0]);

  return [replyContent, replyContentRich];
};

export const useCommentReplies = (commentId: string): TReply[] => {
  const comments = useCommentsSelectors().commentsList();

  return getCommentsById(comments, commentId)?.replies ?? [];
};

export const useUserById = (id: null | string): CommentUser | null => {
  const users = useCommentsSelectors().users();

  if (!id) return null;

  return users[id];
};

export const useMyUser = (): CommentUser | null => {
  const users = useCommentsSelectors().users();
  const myUserId = useCommentsSelectors().myUserId();

  if (!myUserId) return null;

  return users[myUserId];
};

export const useNewCommentText = () => {
  const editingValue = useCommentsSelectors().newValue();

  return getNodeString(editingValue?.[0]);
};

export const useResetNewCommentValue = () => {
  const setNewValue = useCommentsActions().newValue();

  return () => {
    setNewValue([{ children: [{ text: '' }], type: 'p' }]);
  };
};
