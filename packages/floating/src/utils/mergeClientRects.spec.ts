import { makeClientRect } from './makeClientRect';
import { mergeClientRects } from './mergeClientRects';

describe('mergeClientRects', () => {
  const rect1 = makeClientRect({
    bottom: 90,
    left: 10,
    right: 90,
    top: 10,
  });

  describe('when given a single rect', () => {
    it('returns the same rect', () => {
      const merged = mergeClientRects([rect1]);

      expect(merged.top).toBe(10);
      expect(merged.left).toBe(10);
      expect(merged.bottom).toBe(90);
      expect(merged.right).toBe(90);
    });
  });

  describe('when the second rect is above and to the left of the first', () => {
    const rect2 = makeClientRect({
      bottom: 5,
      left: 0,
      right: 5,
      top: 0,
    });

    it('extends the top and left', () => {
      const merged = mergeClientRects([rect1, rect2]);

      expect(merged.top).toBe(0);
      expect(merged.left).toBe(0);
      expect(merged.bottom).toBe(90);
      expect(merged.right).toBe(90);
    });
  });

  describe('when the second rect overlaps the top-left corner of the first', () => {
    const rect2 = makeClientRect({
      bottom: 20,
      left: 0,
      right: 20,
      top: 0,
    });

    it('extends the top and left', () => {
      const merged = mergeClientRects([rect1, rect2]);

      expect(merged.top).toBe(0);
      expect(merged.left).toBe(0);
      expect(merged.bottom).toBe(90);
      expect(merged.right).toBe(90);
    });
  });

  describe('when the second rect is below and to the right of the first', () => {
    const rect2 = makeClientRect({
      bottom: 105,
      left: 100,
      right: 105,
      top: 100,
    });

    it('extends the bottom and right', () => {
      const merged = mergeClientRects([rect1, rect2]);

      expect(merged.top).toBe(10);
      expect(merged.left).toBe(10);
      expect(merged.bottom).toBe(105);
      expect(merged.right).toBe(105);
    });
  });

  describe('when the second rect overlaps the bottom-right corner of the first', () => {
    const rect2 = makeClientRect({
      bottom: 100,
      left: 80,
      right: 100,
      top: 80,
    });

    it('extends the bottom and right', () => {
      const merged = mergeClientRects([rect1, rect2]);

      expect(merged.top).toBe(10);
      expect(merged.left).toBe(10);
      expect(merged.bottom).toBe(100);
      expect(merged.right).toBe(100);
    });
  });

  describe('when the second rect is contained within the first', () => {
    const rect2 = makeClientRect({
      bottom: 80,
      left: 20,
      right: 80,
      top: 20,
    });

    it('returns the first rect', () => {
      const merged = mergeClientRects([rect1, rect2]);

      expect(merged.top).toBe(10);
      expect(merged.left).toBe(10);
      expect(merged.bottom).toBe(90);
      expect(merged.right).toBe(90);
    });
  });

  describe('when the second rect encloses the first', () => {
    const rect2 = makeClientRect({
      bottom: 100,
      left: 0,
      right: 100,
      top: 0,
    });

    it('returns the second rect', () => {
      const merged = mergeClientRects([rect1, rect2]);

      expect(merged.top).toBe(0);
      expect(merged.left).toBe(0);
      expect(merged.bottom).toBe(100);
      expect(merged.right).toBe(100);
    });
  });
});
