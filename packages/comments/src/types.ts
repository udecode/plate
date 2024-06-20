import type { TText, Value } from '@udecode/plate-common';

export interface CommentUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface TComment {
  /** @default Date.now() */
  createdAt: number;

  id: string;

  /** Author id. */
  userId: string;

  /** Slate value of the document. */
  value: Value;

  /** Whether the comment is resolved. */
  isResolved?: boolean;

  /** Parent comment id it replies to. */
  parentId?: string;
}

export interface TCommentText extends TText {
  comment?: boolean;
  comments?: Record<string, boolean>;
}

export interface CommentsPlugin {
  hotkey?: string | string[];
}

export type ReplyContent = [string, Value];

export interface TComments {
  createdAt: number;
  id: string;
  isResolved: boolean;
  replies: TReply[];
  updatedAt: number;
  documentContent?: string;
  documentContentRich?: Value;
}

export interface TReply {
  commentsId: string;
  createdAt: number;
  id: string;
  isUpdated: boolean;
  updatedAt: number;
  userId: string;
  value: Value;
  emoji?: string;
}
