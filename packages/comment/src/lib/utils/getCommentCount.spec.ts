import { getCommentCount } from './getCommentCount';

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
      } as any)
    ).toBe(2);
  });
});
