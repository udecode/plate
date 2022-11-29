import React, { ReactNode } from 'react';
import { CommentUser, TComment } from '@udecode/plate-comments';
import { createAtomStore, JotaiProvider } from '@udecode/plate-core';
import { useJotaiProviderInitialValues } from './useJotaiProviderInitialValues';

export const SCOPE_COMMENTS = Symbol('comments');

export interface CommentsStoreState {
  /**
   * Id of the current user.
   */
  currentUserId: string | null;

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

  // commentFactory: (comment: CommentFactoryParam): Comment => {
  //   return {
  //     id: nanoid(),
  //     createdAt: Date.now(),
  //     userId: commentsStore.get.currentUserId() as any,
  //     ...comment,
  //   };
  // },
}

export const { commentsStore, useCommentsStore } = createAtomStore(
  {
    /**
     * Id of the current user.
     */
    currentUserId: null,

    /**
     * Users data.
     */
    users: {},

    /**
     * Comments data.
     */
    comments: {},

    /**
     * Id of the active comment. If null, no comment is active.
     */
    activeCommentId: null,

    addingCommentId: null,

    // commentFactory: (comment: CommentFactoryParam): Comment => {
    //   return {
    //     id: nanoid(),
    //     createdAt: Date.now(),
    //     userId: commentsStore.get.currentUserId() as any,
    //     ...comment,
    //   };
    // },
  } as CommentsStoreState,
  {
    name: 'comments',
    scope: SCOPE_COMMENTS,
  }
);

export const CommentsProvider = ({
  children,
  ...props
}: Partial<CommentsStoreState> & { children: ReactNode }) => {
  return (
    <JotaiProvider
      initialValues={useJotaiProviderInitialValues(commentsStore, props)}
      scope={SCOPE_COMMENTS}
    >
      {children}
    </JotaiProvider>
  );
};

export const useCommentsStates = () => useCommentsStore().use;
export const useCommentsSelectors = () => useCommentsStore().get;
export const useCommentsActions = () => useCommentsStore().set;

export const useCommentById = (id: string | null): TComment | null => {
  const comments = useCommentsSelectors().comments();
  if (!id) return null;

  return comments[id];
};

export const useUserById = (id: string | null): CommentUser | null => {
  const users = useCommentsSelectors().users();
  if (!id) return null;

  return users[id];
};

export const useCurrentUser = (): CommentUser | null => {
  const users = useCommentsSelectors().users();
  const currentUserId = useCommentsSelectors().currentUserId();
  if (!currentUserId) return null;

  return users[currentUserId];
};

export const useSetComment = (id: string | null) => {
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

export const useUnsetComment = (id: string) => {
  const [comments, setComments] = useCommentsStates().comments();

  delete comments[id];

  setComments({
    ...comments,
  });
};
