import { deserializeHTMLToText } from 'deserializers/deserialize-html/utils';

const input = document.createTextNode('test');

const output = 'test';

it('should be', () => {
  expect(deserializeHTMLToText(input)).toEqual(output);
});
