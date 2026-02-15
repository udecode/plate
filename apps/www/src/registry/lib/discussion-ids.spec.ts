import { describe, expect, it } from 'bun:test';

import { getDiscussionCounterSeed } from './discussion-ids';

describe('getDiscussionCounterSeed', () => {
  it('returns 0 for empty list', () => {
    expect(getDiscussionCounterSeed([])).toBe(0);
  });

  it('returns max suffix for contiguous ids', () => {
    const discussions = [{ id: 'discussion1' }, { id: 'discussion2' }];
    expect(getDiscussionCounterSeed(discussions)).toBe(2);
  });

  it('returns max suffix for non-contiguous ids', () => {
    const discussions = [{ id: 'discussion1' }, { id: 'discussion3' }];
    expect(getDiscussionCounterSeed(discussions)).toBe(3);
  });

  it('ignores non-matching ids', () => {
    const discussions = [
      { id: 'alpha1' },
      { id: 'discussion' },
      { id: 'discussion10x' },
    ];
    expect(getDiscussionCounterSeed(discussions)).toBe(0);
  });

  it('handles mixed ids and returns highest match', () => {
    const discussions = [
      { id: 'discussion2' },
      { id: 'alpha1' },
      { id: 'discussion12' },
    ];
    expect(getDiscussionCounterSeed(discussions)).toBe(12);
  });

  it('handles discussion0 as valid', () => {
    const discussions = [{ id: 'discussion0' }];
    expect(getDiscussionCounterSeed(discussions)).toBe(0);
  });

  it('handles very large numbers', () => {
    const discussions = [
      { id: 'discussion1' },
      { id: 'discussion999999' },
      { id: 'discussion100' },
    ];
    expect(getDiscussionCounterSeed(discussions)).toBe(999_999);
  });

  it('handles discussion IDs with leading zeros', () => {
    const discussions = [
      { id: 'discussion01' },
      { id: 'discussion02' },
      { id: 'discussion10' },
    ];
    expect(getDiscussionCounterSeed(discussions)).toBe(10);
  });

  it('ignores negative numbers', () => {
    const discussions = [{ id: 'discussion-5' }];
    expect(getDiscussionCounterSeed(discussions)).toBe(0);
  });

  it('ignores decimal numbers', () => {
    const discussions = [{ id: 'discussion1.5' }];
    expect(getDiscussionCounterSeed(discussions)).toBe(0);
  });

  it('handles IDs with spaces', () => {
    const discussions = [{ id: 'discussion 5' }];
    expect(getDiscussionCounterSeed(discussions)).toBe(0);
  });

  it('ignores IDs with extra text after number', () => {
    const discussions = [{ id: 'discussion5extra' }, { id: 'discussion3' }];
    expect(getDiscussionCounterSeed(discussions)).toBe(3);
  });

  it('handles single discussion ID', () => {
    const discussions = [{ id: 'discussion42' }];
    expect(getDiscussionCounterSeed(discussions)).toBe(42);
  });

  it('handles many discussions in random order', () => {
    const discussions = [
      { id: 'discussion7' },
      { id: 'discussion1' },
      { id: 'discussion15' },
      { id: 'discussion3' },
      { id: 'discussion99' },
      { id: 'discussion50' },
    ];
    expect(getDiscussionCounterSeed(discussions)).toBe(99);
  });

  it('handles duplicate IDs', () => {
    const discussions = [
      { id: 'discussion5' },
      { id: 'discussion5' },
      { id: 'discussion3' },
    ];
    expect(getDiscussionCounterSeed(discussions)).toBe(5);
  });

  it('ignores IDs with wrong prefix case', () => {
    const discussions = [
      { id: 'Discussion5' },
      { id: 'DISCUSSION10' },
      { id: 'discussion3' },
    ];
    expect(getDiscussionCounterSeed(discussions)).toBe(3);
  });

  it('handles IDs that are just the prefix', () => {
    const discussions = [{ id: 'discussion' }, { id: 'discussion5' }];
    expect(getDiscussionCounterSeed(discussions)).toBe(5);
  });

  it('handles empty string IDs', () => {
    const discussions = [{ id: '' }, { id: 'discussion5' }];
    expect(getDiscussionCounterSeed(discussions)).toBe(5);
  });

  it('handles all non-matching IDs', () => {
    const discussions = [
      { id: 'comment1' },
      { id: 'thread2' },
      { id: 'chat3' },
    ];
    expect(getDiscussionCounterSeed(discussions)).toBe(0);
  });

  it('handles NaN result from invalid number', () => {
    const discussions = [{ id: 'discussionABC' }, { id: 'discussion5' }];
    expect(getDiscussionCounterSeed(discussions)).toBe(5);
  });

  it('returns 0 when all IDs have NaN suffixes', () => {
    const discussions = [{ id: 'discussionABC' }, { id: 'discussionXYZ' }];
    expect(getDiscussionCounterSeed(discussions)).toBe(0);
  });
});
