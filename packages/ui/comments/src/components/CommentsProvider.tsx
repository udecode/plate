import React, { ReactNode } from 'react';
import { CommentUser, TComment } from '@udecode/plate-comments';
import {
  createAtomStore,
  getNodeString,
  JotaiProvider,
  nanoid,
  Value,
  WithPartial,
} from '@udecode/plate-core';
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

  editingValue: Value;

  menuRef: React.RefObject<HTMLDivElement> | null;

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

    editingValue: [{ type: 'p', children: [{ text: '' }] }],

    menuRef: null,

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

export const useCurrentUser = (): CommentUser | null => {
  const users = useCommentsSelectors().users();
  const currentUserId = useCommentsSelectors().currentUserId();
  if (!currentUserId) return null;

  return users[currentUserId];
};

export const useEditingCommentText = () => {
  const editingValue = useCommentsSelectors().editingValue();

  return getNodeString(editingValue?.[0]);
};

export const useResetCommentEditingValue = () => {
  const setEditingValue = useCommentsActions().editingValue();

  return () => {
    setEditingValue([{ type: 'p', children: [{ text: '' }] }]);
  };
};

export const useSetComment = (id?: string | null) => {
  const comment = useCommentById(id);

  const [comments, setComments] = useCommentsStates().comments();

  return (value: Partial<TComment>) => {
    if (!value.id) return;

    setComments({
      ...comments,
      [value.id]: { ...comment, ...value } as any,
    });
  };
};

export const useAddRawComment = () => {
  const [comments, setComments] = useCommentsStates().comments();
  const currentUserId = useCommentsSelectors().currentUserId();

  return (id: string) => {
    if (!currentUserId) return;

    setComments({
      ...comments,
      [id]: {
        id,
        userId: currentUserId,
      },
    } as any);
  };
};

export const useAddComment = () => {
  const [comments, setComments] = useCommentsStates().comments();
  const currentUserId = useCommentsSelectors().currentUserId();

  return (value: WithPartial<TComment, 'id' | 'userId' | 'createdAt'>) => {
    if (!currentUserId) return;

    const id = value.id ?? nanoid();

    setComments({
      ...comments,
      [id]: {
        id,
        userId: currentUserId,
        createdAt: Date.now(),
        ...value,
      },
    });
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
