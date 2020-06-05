import { deserializeHTMLToText } from 'deserializers/deserialize-html/utils';

const input = document.createTextNode('\n');

const output = null;

it('should be', () => {
  expect(deserializeHTMLToText(input)).toEqual(output);
});
