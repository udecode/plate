import { deserializeHTMLToBreak } from 'deserializers/deserialize-html/utils';

const input = document.createElement('br');

const output = '\n';

it('should be', () => {
  expect(deserializeHTMLToBreak(input)).toEqual(output);
});
