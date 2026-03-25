import { getCommentKeys } from './getCommentKeys';

describe('getCommentKeys', () => {
  it('returns only comment-prefixed keys and keeps their insertion order', () => {
    expect(
      getCommentKeys({
        comment: true,
        commentTransient: true,
        comment_alpha: true,
        comment_draft: true,
        comment_beta: true,
        text: 'hello',
      } as any)
    ).toEqual(['comment_alpha', 'comment_draft', 'comment_beta']);
  });
});
