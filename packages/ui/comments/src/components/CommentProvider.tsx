import React, { ReactNode } from 'react';
import { CommentUser, TComment } from '@udecode/plate-comments';
import {
  createAtomStore,
  getNodeString,
  JotaiProvider,
  Scope,
} from '@udecode/plate-core';
import { useCommentById, useCommentsSelectors } from './CommentsProvider';
import { useJotaiProviderInitialValues } from './useJotaiProviderInitialValues';

export const SCOPE_COMMENT = Symbol('comment');

export interface CommentStoreState {
  id: string;
  isMenuOpen: boolean;
}

export const { commentStore, useCommentStore } = createAtomStore(
  {
    id: '',
    isMenuOpen: false,
  } as CommentStoreState,
  {
    name: 'comment',
    scope: SCOPE_COMMENT,
  }
);

export const useCommentStates = () => useCommentStore().use;
export const useCommentSelectors = () => useCommentStore().get;
export const useCommentActions = () => useCommentStore().set;

export const CommentProvider = ({
  children,
  scope,
  ...props
}: Partial<CommentStoreState> & { children: ReactNode; scope?: Scope }) => {
  return (
    <JotaiProvider
      initialValues={useJotaiProviderInitialValues(commentStore, props)}
      scope={scope ?? SCOPE_COMMENT}
    >
      {children}
    </JotaiProvider>
  );
};

export const useCommentUser = (scope?: Scope): CommentUser | null => {
  const commentId = useCommentSelectors().id(scope);
  const users = useCommentsSelectors().users();
  const comment = useCommentById(commentId);
  if (!comment) return null;

  return users[comment.userId];
};

export const useCommentReplies = (scope?: Scope) => {
  const commentId = useCommentSelectors().id(scope);
  const comments = useCommentsSelectors().comments();

  const replies: Record<string, TComment> = {};

  Object.keys(comments).forEach((id) => {
    const comment = comments[id];
    if (!comment) return null;

    if (comment.parentId === commentId) {
      replies[id] = comment;
    }
  });

  return replies;
};

export const useComment = (scope?: Scope) => {
  const commentId = useCommentSelectors().id(scope);

  return useCommentById(commentId);
};

export const useCommentText = (scope?: Scope) => {
  const comment = useComment(scope);
  if (!comment) return null;

  return getNodeString(comment.value?.[0]);
};
