import { CommentsPlugin } from '../CommentsPlugin';

export const getCommentKey = (id: string) => `${CommentsPlugin.key}_${id}`;
