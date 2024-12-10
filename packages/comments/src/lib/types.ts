import type { TDescendant, TText, Value } from '@udecode/plate-common';

export interface CommentUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface TComment {
  id: string;

  /** @default Date.now() */
  createdAt: number;

  /** Author id. */
  userId: string;

  /** Slate value of the document. */
  value: Value;

  /** The fragment of text that the comment was originally added to. */
  initialFragment?: TDescendant[];

  /** Whether the comment is resolved. */
  isResolved?: boolean;

  /** Parent comment id it replies to. */
  parentId?: string;
}

export interface TCommentText extends TText {
  comment?: boolean;
  comments?: Record<string, boolean>;
}
