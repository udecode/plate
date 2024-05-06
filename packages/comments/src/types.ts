import type { TText, Value } from '@udecode/plate-common/server';

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
