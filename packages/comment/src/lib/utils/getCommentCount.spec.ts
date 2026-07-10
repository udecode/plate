import { getCommentCount } from './getCommentCount';
import type { TCommentText } from '@platejs/utils';

describe('getCommentCount', () => {
  it('counts real comment ids but ignores the draft and transient markers', () => {
    expect(
      getCommentCount({
        comment: true,
        commentTransient: true,
        comment_alpha: true,
        comment_beta: true,
        comment_draft: true,
        text: 'hello',
      } satisfies TCommentText)
    ).toBe(2);
  });
});
