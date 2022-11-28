import { TText, Value } from '@udecode/plate-core';

export interface CommentUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface BaseComment {
  id: string;

  value: Value;

  createdAt: number;

  userId: string;
}

export interface ReplyComment extends BaseComment {
  threadId?: string;
}

export interface ThreadComment extends BaseComment {
  isResolved?: boolean;
}

export type Comment = ThreadComment | ReplyComment;

// TODO: check TThreadElement, TThread
export interface TCommentText extends TText {
  comment?: boolean;
  comments?: Record<string, boolean>;
}

export interface CommentsPlugin {}
