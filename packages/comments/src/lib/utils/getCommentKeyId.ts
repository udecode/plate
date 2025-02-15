import { BaseCommentsPlugin } from '../BaseCommentsPlugin';

export const getCommentId = (key: string) =>
  key.replace(`${BaseCommentsPlugin.key}_`, '');
