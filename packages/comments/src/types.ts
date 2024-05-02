import { TText, Value } from '@udecode/plate-common/server';

export interface CommentUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface TComment {
  id: string;

  /**
   * Slate value of the document.
   */
  value: Value;

  /**
   * @default Date.now()
   */
  createdAt: number;

  /**
   * Author id.
   */
  userId: string;

  /**
   * Parent comment id it replies to.
   */
  parentId?: string;

  /**
   * Whether the comment is resolved.
   */
  isResolved?: boolean;
}

export interface TCommentText extends TText {
  comment?: boolean;
  comments?: Record<string, boolean>;
}

export interface CommentsPlugin {
  hotkey?: string | string[];
}
