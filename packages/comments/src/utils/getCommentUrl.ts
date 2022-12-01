export const getCommentUrl = (commentId: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set('comment', commentId);

  return url.toString();
};
