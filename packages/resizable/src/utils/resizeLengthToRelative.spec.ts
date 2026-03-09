import { resizeLengthToRelative } from './resizeLengthToRelative';

describe('resizeLengthToRelative', () => {
  it('returns a string as is', () => {
    expect(resizeLengthToRelative('50%', 20)).toBe('50%');
  });

  it('convert a number to a relative length', () => {
    expect(resizeLengthToRelative(5, 20)).toBe('25%');
  });
});
