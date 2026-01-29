import { Map as YMap } from 'yjs';

export const addYComment = (yArray, ydoc, event) => {
  const { comment } = event;
  const yComment = new YMap(Object.entries(comment));

  ydoc.transact(
    () => {
      yArray.push([yComment]);
    },
    { user: superdoc.user },
  );
};

export const updateYComment = (yArray, ydoc, event) => {
  const { comment } = event;
  const yComment = new YMap(Object.entries(comment));
  const commentIndex = getCommentIndex(yArray, comment);
  if (commentIndex === -1) return;

  ydoc.transact(
    () => {
      yArray.delete(commentIndex, 1);
      yArray.insert(commentIndex, [yComment]);
    },
    { user: superdoc.user },
  );
};

export const deleteYComment = (yArray, ydoc, event) => {
  const { comment } = event;
  const commentIndex = getCommentIndex(yArray, comment);
  if (commentIndex === -1) return;

  ydoc.transact(
    () => {
      yArray.delete(commentIndex, 1);
    },
    { user: superdoc.user },
  );
};

export const getCommentIndex = (yArray, comment) => {
  const baseArray = yArray.toJSON();
  return baseArray.findIndex((c) => c.commentId === comment.commentId);
};
