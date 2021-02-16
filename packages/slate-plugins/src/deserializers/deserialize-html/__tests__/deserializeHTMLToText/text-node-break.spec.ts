import { deserializeHTMLToText } from '../../utils/deserializeHTMLToText';

const input = document.createTextNode('\n');

const output = null;

it('should be', () => {
  expect(deserializeHTMLToText(input)).toEqual(output);
});
