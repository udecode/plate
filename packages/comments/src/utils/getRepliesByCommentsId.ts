import type { TComments } from '../types';

export const getCommentsById = (
  commentsList: TComments[],
  commentsId: string
) => {
  return commentsList.find((comments) => comments.id === commentsId);
};
