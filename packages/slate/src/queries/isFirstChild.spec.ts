import { isFirstChild } from './isFirstChild';

describe('isFirstChild', () => {
  describe('when first child', () => {
    it('should return true', () => {
      const path = [0, 0, 0];
      expect(isFirstChild(path)).toBe(true);
    });
  });

  describe('when not first child', () => {
    it('should return false', () => {
      const path = [0, 0, 1];
      expect(isFirstChild(path)).toBe(false);
    });
  });
});
