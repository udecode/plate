import { BaseCommentsPlugin } from '../BaseCommentsPlugin';

export const getCommentKey = (id: string) => `${BaseCommentsPlugin.key}_${id}`;
