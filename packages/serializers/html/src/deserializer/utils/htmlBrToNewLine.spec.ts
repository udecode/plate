import { htmlBrToNewLine } from './htmlBrToNewLine';

describe('', () => {
  describe('when br', () => {
    const input = document.createElement('br');
    const output = '\n';

    it('should be \n', () => {
      expect(htmlBrToNewLine(input)).toEqual(output);
    });
  });

  describe('when not br', () => {
    const input = document.createElement('div');
    const output = undefined;

    it('should be undefined', () => {
      expect(htmlBrToNewLine(input)).toEqual(output);
    });
  });
});
