import { CommentsPlugin } from '../CommentsPlugin';

export const getCommentKeyId = (key: string) =>
  key.replace(`${CommentsPlugin.key}_`, '');
