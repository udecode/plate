import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import {
  createAtomStore,
  getJotaiProviderInitialValues,
  getNodeString,
  JotaiProvider,
  nanoid,
  Value,
  WithPartial,
} from '@udecode/plate-common';

import { CommentUser, TComment } from '../../types';

export interface CommentsContext {
  /**
   * Id of the current user.
   */
  myUserId: string | null;

  /**
   * Users data.
   */
  users: Record<string, CommentUser>;

  onCommentAdd: ((value: WithPartial<TComment, 'userId'>) => void) | null;
  onCommentUpdate:
    | ((value: Pick<TComment, 'id'> & Partial<Omit<TComment, 'id'>>) => void)
    | null;
  onCommentDelete: ((id: string) => void) | null;
}

export const SCOPE_COMMENTS = Symbol('comments');

export interface CommentsStoreState {
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
}

export const { commentsStore, useCommentsStore } = createAtomStore(
  {
    /**
     * Comments data.
     */
    comments: {},

    /**
     * Id of the active comment. If null, no comment is active.
     */
    activeCommentId: null,

    addingCommentId: null,

    newValue: [{ type: 'p', children: [{ text: '' }] }],

    focusTextarea: false,
  } satisfies CommentsStoreState as CommentsStoreState,
  {
    name: 'comments',
    scope: SCOPE_COMMENTS,
  }
);

export const CommentsContext = createContext<CommentsContext>({
  myUserId: null,
  users: {},
  onCommentAdd: null,
  onCommentUpdate: null,
  onCommentDelete: null,
});

export interface CommentsProviderProps extends Partial<CommentsContext> {
  initialComments?: CommentsStoreState['comments'];
  children: ReactNode;
}

export function CommentsProvider({
  children,
  initialComments,
  myUserId = null,
  users = {},
  onCommentAdd = null,
  onCommentUpdate = null,
  onCommentDelete = null,
}: CommentsProviderProps) {
  return (
    <JotaiProvider
      initialValues={getJotaiProviderInitialValues(commentsStore, {
        comments: initialComments,
      })}
      scope={SCOPE_COMMENTS}
    >
      <CommentsContext.Provider
        value={{
          myUserId,
          users,
          onCommentAdd,
          onCommentUpdate,
          onCommentDelete,
        }}
      >
        {children}
      </CommentsContext.Provider>
    </JotaiProvider>
  );
}

export const useCommentsStates = () => useCommentsStore().use;
export const useCommentsActions = () => useCommentsStore().set;

export const useCommentsSelectors = () => {
  const context = useContext(CommentsContext);

  const contextGetters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(context).map(([key, value]) => [key, () => value])
      ) as { [K in keyof CommentsContext]: () => CommentsContext[K] },
    [context]
  );

  const storeGetters = useCommentsStore().get;

  // Combine getters from context and store
  return useMemo(
    () => ({
      ...contextGetters,
      ...storeGetters,
    }),
    [contextGetters, storeGetters]
  );
};

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
