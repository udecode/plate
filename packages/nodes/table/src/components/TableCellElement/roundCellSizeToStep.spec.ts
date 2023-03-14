import { roundCellSizeToStep } from './roundCellSizeToStep';

describe('roundCellSizeToStep', () => {
  describe('when step is not set', () => {
    it('returns the size', () => {
      expect(roundCellSizeToStep(10.6, undefined)).toBe(10.6);
    });
  });

  describe('when step is set', () => {
    it('rounds the size to the nearest step', () => {
      expect(roundCellSizeToStep(14.9, 10)).toBe(10);
      expect(roundCellSizeToStep(15.1, 10)).toBe(20);
    });
  });
});
