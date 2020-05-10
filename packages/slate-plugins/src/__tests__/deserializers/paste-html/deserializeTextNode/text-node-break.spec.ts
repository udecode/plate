import { deserializeTextNode } from 'deserializers/paste-html/utils';

const input = document.createTextNode('\n');

const output = null;

it('should be', () => {
  expect(deserializeTextNode(input)).toEqual(output);
});
