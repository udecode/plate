import { htmlBrToNewLine } from './htmlBrToNewLine';

describe('htmlBrToNewLine', () => {
  describe('when br', () => {
    const input = document.createElement('br');
    const output = '\n';

    it('returns a newline', () => {
      expect(htmlBrToNewLine(input)).toEqual(output);
    });
  });

  describe('when not br', () => {
    const input = document.createElement('div');
    const output = undefined;

    it('returns undefined', () => {
      expect(htmlBrToNewLine(input)).toEqual(output);
    });
  });
});
