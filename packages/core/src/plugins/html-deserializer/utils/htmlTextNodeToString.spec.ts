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
      const output = null;

      expect(htmlTextNodeToString(input)).toEqual(output);
    });
  });

  describe('when text node with text and \n characters', () => {
    it('should strip \n characters from start and end', () => {
      const input = document.createTextNode('\n\n\ntest\n\ntest\n\n');
      const output = 'test test';

      expect(htmlTextNodeToString(input)).toEqual(output);
    });
  });

  describe('when htmlTextNodeToString', () => {
    const text = `${'\n'} ${'\t'} hello     ${'\n'}world!`;
    const baseInput = (whiteSpace): Text => {
      const textNode = document.createTextNode(text);
      const parentDom = document.createElement('div');
      parentDom.style.whiteSpace = whiteSpace;

      parentDom.append(textNode);

      return textNode;
    };

    it('white-space: normal', () => {
      expect(htmlTextNodeToString(baseInput('normal'))).toEqual(`hello world!`);
    });

    it('white-space: nowrap', () => {
      expect(htmlTextNodeToString(baseInput('nowrap'))).toEqual(`hello world!`);
    });

    it('white-space: pre', () => {
      expect(htmlTextNodeToString(baseInput('pre'))).toEqual(text);
    });

    it('white-space: pre-wrap', () => {
      expect(htmlTextNodeToString(baseInput('pre-wrap'))).toEqual(text);
    });

    it('white-space: pre-line', () => {
      expect(htmlTextNodeToString(baseInput('pre-line'))).toEqual(
        `${'\n'} hello ${'\n'}world!`
      );
    });

    it('white-space: break-spaces', () => {
      expect(htmlTextNodeToString(baseInput('break-spaces'))).toEqual(text);
    });
  });
});
