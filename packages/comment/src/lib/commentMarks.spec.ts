import type { CommentText } from './BaseCommentPlugin';
import { getCommentCount, getCommentKeys } from './commentMarks';

const comment = {
  comment: true,
  commentTransient: true,
  comment_alpha: true,
  comment_beta: true,
  comment_draft: true,
  text: 'hello',
} satisfies CommentText;

describe('comment marks', () => {
  it('returns only comment-prefixed keys in insertion order', () => {
    expect(getCommentKeys(comment)).toEqual([
      'comment_alpha',
      'comment_beta',
      'comment_draft',
    ]);
  });

  it('counts real comment ids but ignores the draft and transient markers', () => {
    expect(getCommentCount(comment)).toBe(2);
  });
});
