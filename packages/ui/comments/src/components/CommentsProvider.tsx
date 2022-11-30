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

  editingValue: Value;

  menuRef: React.RefObject<HTMLDivElement> | null;

  // commentFactory: (comment: CommentFactoryParam): Comment => {
  //   return {
  //     id: nanoid(),
  //     createdAt: Date.now(),
  //     userId: commentsStore.get.myUserId() as any,
  //     ...comment,
  //   };
  // },
}

export const { commentsStore, useCommentsStore } = createAtomStore(
  {
    /**
     * Id of the current user.
     */
    myUserId: null,

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
    //     userId: commentsStore.get.myUserId() as any,
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

export const useMyUser = (): CommentUser | null => {
  const users = useCommentsSelectors().users();
  const myUserId = useCommentsSelectors().myUserId();
  if (!myUserId) return null;

  return users[myUserId];
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
    if (!myUserId) return;

    const id = value.id ?? nanoid();

    setComments({
      ...comments,
      [id]: {
        id,
        userId: myUserId,
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
