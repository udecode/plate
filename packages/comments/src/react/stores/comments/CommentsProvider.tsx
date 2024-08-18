import {
  type Value,
  type WithPartial,
  getNodeString,
  nanoid,
} from '@udecode/plate-common';
import { createAtomStore } from '@udecode/plate-common/react';

import type { CommentUser, TComment } from '../../../lib/types';

export interface CommentsStoreState {
  /** Id of the active comment. If null, no comment is active. */
  activeCommentId: null | string;

  addingCommentId: null | string;

  /** Comments data. */
  comments: Record<string, TComment>;

  focusTextarea: boolean;

  /** Id of the current user. */
  myUserId: null | string;

  newValue: Value;

  onCommentAdd: ((value: WithPartial<TComment, 'userId'>) => void) | null;

  onCommentDelete: ((id: string) => void) | null;
  onCommentUpdate:
    | ((value: Partial<Omit<TComment, 'id'>> & Pick<TComment, 'id'>) => void)
    | null;
  /** Users data. */
  users: Record<string, CommentUser>;
}

export const { CommentsProvider, commentsStore, useCommentsStore } =
  createAtomStore(
    {
      activeCommentId: null,
      addingCommentId: null,
      comments: {},
      focusTextarea: false,
      myUserId: null,
      newValue: [{ children: [{ text: '' }], type: 'p' }],
      onCommentAdd: null,
      onCommentDelete: null,
      onCommentUpdate: null,
      users: {},
    } as CommentsStoreState,
    {
      name: 'comments',
    }
  );

export const useCommentsStates = () => useCommentsStore().use;

export const useCommentsSelectors = () => useCommentsStore().get;

export const useCommentsActions = () => useCommentsStore().set;

export const useCommentById = (id?: null | string): TComment | null => {
  const comments = useCommentsSelectors().comments();

  if (!id) return null;

  return comments[id];
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

export const useUpdateComment = (id?: null | string) => {
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

  return (value: WithPartial<TComment, 'createdAt' | 'id' | 'userId'>) => {
    const id = value.id ?? nanoid();

    const newComment: WithPartial<TComment, 'userId'> = {
      createdAt: Date.now(),
      id,
      userId: myUserId ?? undefined,
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

  return (id: null | string) => {
    if (!id) return;

    delete comments[id];

    setComments({
      ...comments,
    });
  };
};
