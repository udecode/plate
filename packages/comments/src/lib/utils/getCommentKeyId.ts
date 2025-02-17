import { BaseCommentsPlugin } from '../BaseCommentsPlugin';

export const getCommentKeyId = (key: string) =>
  key.replace(`${BaseCommentsPlugin.key}_`, '');
