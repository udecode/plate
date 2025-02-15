import type { TText, Value } from '@udecode/plate';

export interface CommentUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

export type ReplyContent = [string, Value];

export interface TComment {
  id: string;

  /** Slate value of the document. */
  value: Value;

  /** Whether the comment is resolved. */
  isResolved?: boolean;
}

export interface TComments {
  id: string;
  createdAt: number;
  isResolved: boolean;
  replies: TReply[];
  updatedAt: number;
  documentContent?: string;
  documentContentRich?: Value;
}

export interface TCommentText extends TText {
  comment?: boolean;
  comments?: Record<string, boolean>;
}

export interface TReply {
  id: string;
  commentsId: string;
  createdAt: number;
  isUpdated: boolean;
  updatedAt: number;
  userId: string;
  value: Value;
  emoji?: string;
}
