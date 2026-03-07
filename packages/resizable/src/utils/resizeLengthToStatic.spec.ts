import { resizeLengthToStatic } from './resizeLengthToStatic';

describe('resizeLengthToStatic', () => {
  it('returns a number as is', () => {
    expect(resizeLengthToStatic(5, 20)).toBe(5);
  });

  it('convert a string to a static length', () => {
    expect(resizeLengthToStatic('50%', 20)).toBe(10);
  });
});
