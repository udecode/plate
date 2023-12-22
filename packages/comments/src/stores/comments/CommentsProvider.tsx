import React from 'react';
import {
  createAtomStore,
  getNodeString,
  nanoid,
  Value,
  WithPartial,
} from '@udecode/plate-common';

import { CommentUser, TComment } from '../../types';

export interface CommentsStoreState {
  /**
   * Id of the current user.
   */
  myUserId: string | null;

  /**
   * Users data.
   */
  users: Record<string, CommentUser>;

  /**
   * Comments data.
   */
  comments: Record<string, TComment>;

  /**
   * Id of the active comment. If null, no comment is active.
   */
  activeCommentId: string | null;

  addingCommentId: string | null;

  newValue: Value;

  focusTextarea: boolean;

  onCommentAdd: ((value: WithPartial<TComment, 'userId'>) => void) | null;
  onCommentUpdate: ((value: Pick<TComment, 'id'> & Partial<Omit<TComment, 'id'>>) => void) | null;
  onCommentDelete: ((id: string) => void) | null;
}

export const {
  commentsStore,
  useCommentsStore,
  CommentsProvider,
} = createAtomStore(
  {
    myUserId: null,
    users: {},
    comments: {},
    activeCommentId: null,
    addingCommentId: null,
    newValue: [{ type: 'p', children: [{ text: '' }] }],
    focusTextarea: false,
    onCommentAdd: null,
    onCommentUpdate: null,
    onCommentDelete: null,
  } as CommentsStoreState,
  {
    name: 'comments',
  }
);

export const useCommentsStates = () => useCommentsStore().use;
export const useCommentsSelectors = () => useCommentsStore().get;
export const useCommentsActions = () => useCommentsStore().set;

export const useCommentById = (id?: string | null): TComment | null => {
  const comments = useCommentsSelectors().comments();
  if (!id) return null;

  return comments[id];
};

export const useUserById = (id: string | null): CommentUser | null => {
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
    setNewValue([{ type: 'p', children: [{ text: '' }] }]);
  };
};

export const useUpdateComment = (id?: string | null) => {
  const comment = useCommentById(id);

  const [comments, setComments] = useCommentsStates().comments();

  return (value: Partial<TComment>) => {
    if (!id) return;

    setComments({
      ...comments,
      [id]: { ...comment, ...value } as any,
    });
  };
};

export const useAddRawComment = () => {
  const [comments, setComments] = useCommentsStates().comments();
  const myUserId = useCommentsSelectors().myUserId();

  return (id: string) => {
    if (!myUserId) return;

    setComments({
      ...comments,
      [id]: {
        id,
        userId: myUserId,
      },
    } as any);
  };
};

export const useAddComment = () => {
  const [comments, setComments] = useCommentsStates().comments();
  const myUserId = useCommentsSelectors().myUserId();

  return (value: WithPartial<TComment, 'id' | 'userId' | 'createdAt'>) => {
    const id = value.id ?? nanoid();

    const newComment: WithPartial<TComment, 'userId'> = {
      id,
      userId: myUserId ?? undefined,
      createdAt: Date.now(),
      ...value,
    };

    if (newComment.userId) {
      setComments({
        ...comments,
        [id]: newComment as TComment,
      });
    }

    return newComment;
  };
};

export const useRemoveComment = () => {
  const [comments, setComments] = useCommentsStates().comments();

  return (id: string | null) => {
    if (!id) return;

    delete comments[id];

    setComments({
      ...comments,
    });
  };
};
