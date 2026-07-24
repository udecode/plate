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

  it('drops an exact host empty-leaf marker', () => {
    const host = document.createElement('span');

    host.setAttribute('data-plite-string', 'true');
    host.textContent = '\uFEFF';

    expect(htmlTextNodeToString(host.firstChild!)).toBe('');
  });

  it('preserves zero-width no-break spaces outside host markers', () => {
    expect(htmlTextNodeToString(document.createTextNode('\uFEFF'))).toBe(
      '\uFEFF'
    );
  });
});
