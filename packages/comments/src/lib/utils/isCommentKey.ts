import { CommentsPlugin } from '../CommentsPlugin';

export const isCommentKey = (key: string) =>
  key.startsWith(`${CommentsPlugin.key}_`);
