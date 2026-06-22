import type { TCommentText } from 'platejs';

import { getCommentCount } from './getCommentCount';

describe('getCommentCount', () => {
  it('counts real comment ids but ignores the draft and transient markers', () => {
    const leaf: TCommentText = {
      comment: true,
      commentTransient: true,
      comment_alpha: true,
      comment_beta: true,
      comment_draft: true,
      text: 'hello',
    };

    expect(getCommentCount(leaf)).toBe(2);
  });
});
