import type { PliteDecorationAttributes } from 'platejs';

export const commentDecorationAttributes: PliteDecorationAttributes = {
  className:
    'border-b-2 border-b-highlight/40 bg-highlight/15 [&_[data-comment-id]]:border-b-highlight/80 [&_[data-comment-id]]:bg-highlight/25',
};
