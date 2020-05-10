import { deserializeTextNode } from 'deserializers/paste-html/utils';

const input = document.createTextNode('test');

const output = 'test';

it('should be', () => {
  expect(deserializeTextNode(input)).toEqual(output);
});
