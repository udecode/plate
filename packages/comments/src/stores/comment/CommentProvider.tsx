import React, { ReactNode } from 'react';
import {
  JotaiProvider,
  Scope,
  Value,
  createAtomStore,
  getJotaiProviderInitialValues,
  getNodeString,
} from '@udecode/plate-common';

import { CommentUser, TComment } from '../../types';
import {
  useCommentById,
  useCommentsSelectors,
} from '../comments/CommentsProvider';

export const SCOPE_COMMENT = Symbol('comment');
export const SCOPE_ACTIVE_COMMENT = Symbol('activeComment');

export interface CommentStoreState {
  id: string;
  isMenuOpen: boolean;
  editingValue: Value | null;
}

export const { commentStore, useCommentStore } = createAtomStore(
  {
    id: '',
    isMenuOpen: false,
    editingValue: null,
  } as CommentStoreState,
  {
    name: 'comment',
    scope: SCOPE_COMMENT,
  }
);

export const useCommentStates = () => useCommentStore().use;
export const useCommentSelectors = () => useCommentStore().get;
export const useCommentActions = () => useCommentStore().set;

export function CommentProvider({
  children,
  scope,
  ...props
}: Partial<CommentStoreState> & { children: ReactNode; scope?: Scope }) {
  return (
    <JotaiProvider
      initialValues={getJotaiProviderInitialValues(commentStore, props)}
      scope={scope ?? SCOPE_COMMENT}
    >
      {children}
    </JotaiProvider>
  );
}

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

export const useEditingCommentText = () => {
  const editingValue = useCommentSelectors().editingValue();
  if (!editingValue) return null;

  return getNodeString(editingValue?.[0]);
};
