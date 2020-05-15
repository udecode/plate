import { deserializeBreak } from 'deserializers/deserialize-html/utils';

const input = document.createElement('br');

const output = '\n';

it('should be', () => {
  expect(deserializeBreak(input)).toEqual(output);
});
