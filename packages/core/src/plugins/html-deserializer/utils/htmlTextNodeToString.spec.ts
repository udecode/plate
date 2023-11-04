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

  describe('when text node with no characters except \n', () => {
    it('should be null', () => {
      const input = document.createTextNode('\n\n\n\n\n');
      const output = '\n\n\n\n\n';

      expect(htmlTextNodeToString(input)).toEqual(output);
    });
  });

  describe('when text node with text and \n characters', () => {
    it('should strip \n characters from start and end', () => {
      const input = document.createTextNode('\n\n\ntest\n\ntest\n\n');
      const output = '\n\n\ntest\n\ntest\n\n';

      expect(htmlTextNodeToString(input)).toEqual(output);
    });
  });
});
