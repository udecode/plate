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
});
