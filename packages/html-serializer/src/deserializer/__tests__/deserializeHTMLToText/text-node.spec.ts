import { deserializeHTMLToText } from '../../utils/deserializeHTMLToText';

const input = document.createTextNode('test');

const output = 'test';

it('should be', () => {
  expect(deserializeHTMLToText(input)).toEqual(output);
});
