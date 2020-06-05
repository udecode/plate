import { deserializeHTMLToBreak } from 'deserializers/deserialize-html/utils';

const input = document.createElement('div');

const output = undefined;

it('should be', () => {
  expect(deserializeHTMLToBreak(input)).toEqual(output);
});
