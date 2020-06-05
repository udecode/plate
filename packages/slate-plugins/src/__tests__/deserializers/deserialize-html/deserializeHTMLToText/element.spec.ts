import { deserializeHTMLToText } from 'deserializers/deserialize-html/utils';

const input = document.createElement('div');

const output = undefined;

it('should be', () => {
  expect(deserializeHTMLToText(input)).toEqual(output);
});
