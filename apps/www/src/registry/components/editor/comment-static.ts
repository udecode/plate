import type { DecorationAttributes } from 'platejs';

export const commentDecorationAttributes: DecorationAttributes = {
  className:
    'border-b-2 border-b-highlight/40 bg-highlight/15 [&_[data-comment-id]]:border-b-highlight/80 [&_[data-comment-id]]:bg-highlight/25',
};
