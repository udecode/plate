import { type Value, getNodeString } from '@udecode/plate-common';
import { createAtomStore } from '@udecode/plate-common/react';

import type { CommentUser, TComment } from '../../../lib/types';

import {
  useCommentById,
  useCommentsSelectors,
} from '../comments/CommentsProvider';

export const SCOPE_ACTIVE_COMMENT = 'activeComment';

export interface CommentStoreState {
  editingValue: Value | null;
  id: string;
  isMenuOpen: boolean;
}

export const { CommentProvider, commentStore, useCommentStore } =
  createAtomStore(
    {
      editingValue: null,
      id: '',
      isMenuOpen: false,
    } as CommentStoreState,
    {
      name: 'comment',
    }
  );

export const useCommentStates = () => useCommentStore().use;

export const useCommentSelectors = () => useCommentStore().get;

export const useCommentActions = () => useCommentStore().set;

export const useCommentUser = (scope?: string): CommentUser | null => {
  const commentId = useCommentSelectors().id(scope);
  const users = useCommentsSelectors().users();
  const comment = useCommentById(commentId);

  if (!comment) return null;

  return users[comment.userId];
};

export const useCommentReplies = (scope?: string) => {
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

export const useComment = (scope?: string) => {
  const commentId = useCommentSelectors().id(scope);

  return useCommentById(commentId);
};

export const useCommentText = (scope?: string) => {
  const comment = useComment(scope);

  if (!comment) return null;

  return getNodeString(comment.value?.[0]);
};

export const useEditingCommentText = () => {
  const editingValue = useCommentSelectors().editingValue();

  if (!editingValue) return null;

  return getNodeString(editingValue?.[0]);
};
