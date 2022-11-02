import { Thread } from '@udecode/plate-comments';

export const generateThreadLink = (thread: Thread) => {
  const url = new URL(window.location.href);
  url.searchParams.set('thread', thread.id);
  return url.toString();
};
