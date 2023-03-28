import { resizeLengthToStatic } from './resizeLengthToStatic';

describe('resizeLengthToStatic', () => {
  it('should return a number as is', () => {
    expect(resizeLengthToStatic(5, 20)).toBe(5);
  });

  it('should convert a string to a static length', () => {
    expect(resizeLengthToStatic('50%', 20)).toBe(10);
  });
});
