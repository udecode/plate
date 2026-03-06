import { htmlTextNodeToString } from './htmlTextNodeToString';

describe('htmlTextNodeToString', () => {
  describe('when empty div element', () => {
    it('returns undefined', () => {
      const input = document.createElement('div');
      const output = undefined;

      expect(htmlTextNodeToString(input)).toEqual(output);
    });
  });

  describe('when text node with text', () => {
    it('returns the text content', () => {
      const input = document.createTextNode('test');
      const output = 'test';

      expect(htmlTextNodeToString(input)).toEqual(output);
    });
  });
});
