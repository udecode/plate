import { removeHtmlSurroundings } from './removeHtmlSurroundings';

describe('removeHtmlSurroundings', () => {
  it('Does nothing when there is nothing around <html>', () => {
    const input = '<html>asd</html>';
    const expected = input;

    expect(removeHtmlSurroundings(input)).toBe(expected);
  });

  it('Removes everything around <html>', () => {
    const input = 'a  b  <html>asd</html>  c d';
    const expected = '<html>asd</html>';

    expect(removeHtmlSurroundings(input)).toBe(expected);
  });

  it('Does not touch nested <html> strings', () => {
    const input = 'a  b  <html>asd<html>xxx</html>asd</html>  c d';
    const expected = '<html>asd<html>xxx</html>asd</html>';

    expect(removeHtmlSurroundings(input)).toBe(expected);
  });
});
