import { TText, Value } from '@udecode/plate-core';

export interface CommentUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface TComment {
  id: string;

  value: Value;

  createdAt: number;

  userId: string;

  threadId?: string;
  isResolved?: boolean;
}

// TODO: check TThreadElement, TThread
export interface TCommentText extends TText {
  comment?: boolean;
  comments?: Record<string, boolean>;
}

export interface CommentsPlugin {}
