import { Comment } from './Comment.js';

export function generateCommentLink(comment: Comment) {
  const url = new URL(window.location.href);
  url.searchParams.set('comment', comment.id);
  return url.toString();
}
