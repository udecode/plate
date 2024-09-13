import { BaseCommentsPlugin } from '../BaseCommentsPlugin';

export const isCommentKey = (key: string) =>
  key.startsWith(`${BaseCommentsPlugin.key}_`);
