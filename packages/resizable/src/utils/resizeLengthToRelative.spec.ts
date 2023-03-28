import { resizeLengthToRelative } from './resizeLengthToRelative';

describe('resizeLengthToRelative', () => {
  it('should return a string as is', () => {
    expect(resizeLengthToRelative('50%', 20)).toBe('50%');
  });

  it('should convert a number to a relative length', () => {
    expect(resizeLengthToRelative(5, 20)).toBe('25%');
  });
});
