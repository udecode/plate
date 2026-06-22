import type { TCommentText } from 'platejs';

import { getCommentKeys } from './getCommentKeys';

describe('getCommentKeys', () => {
  it('returns only comment-prefixed keys and keeps their insertion order', () => {
    const leaf: TCommentText = {
      comment: true,
      commentTransient: true,
      comment_alpha: true,
      comment_draft: true,
      comment_beta: true,
      text: 'hello',
    };

    expect(getCommentKeys(leaf)).toEqual([
      'comment_alpha',
      'comment_draft',
      'comment_beta',
    ]);
  });
});
