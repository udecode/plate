import { deserializeBreak } from 'deserializers/utils/deserializeBreak';

describe('when deserializeBreak', () => {
  describe('when the element is br', () => {
    it('should return a break', () => {
      expect(deserializeBreak(document.createElement('br'))).toBe('\n');
    });
  });

  describe('when the element is not br', () => {
    it('should be undefined', () => {
      expect(deserializeBreak(document.createElement('div'))).toBeUndefined();
    });
  });
});
