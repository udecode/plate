import { htmlTextNodeToString } from './htmlTextNodeToString';

describe('htmlTextNodeToString', () => {
  describe('when empty div element', () => {
    it('should be undefined', () => {
      const input = document.createElement('div');
      const output = undefined;

      expect(htmlTextNodeToString(input)).toEqual(output);
    });
  });

  describe('when text node with text', () => {
    it('should be text', () => {
      const input = document.createTextNode('test');
      const output = 'test';

      expect(htmlTextNodeToString(input)).toEqual(output);
    });
  });
});
