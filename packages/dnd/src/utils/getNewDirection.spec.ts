import { getNewDirection } from './getNewDirection';

describe('getNewDirection', () => {
  it.each([
    {
      dir: undefined,
      expected: undefined,
      previousDir: '',
      title: 'returns undefined when there is no previous direction to clear',
    },
    {
      dir: undefined,
      expected: '',
      previousDir: 'top',
      title:
        'returns an empty line marker when the previous direction should clear',
    },
    {
      dir: 'top',
      expected: undefined,
      previousDir: 'top',
      title: 'returns undefined when the direction did not change',
    },
    {
      dir: 'bottom',
      expected: 'bottom',
      previousDir: 'top',
      title: 'returns the new vertical direction when it changes',
    },
    {
      dir: 'right',
      expected: 'right',
      previousDir: 'left',
      title: 'returns the new horizontal direction when it changes',
    },
  ])('$title', ({ dir, expected, previousDir }) => {
    expect(getNewDirection(previousDir, dir)).toBe(expected);
  });
});
