import { deserializeBreak } from 'deserializers/deserialize-html/utils';

const input = document.createElement('div');

const output = undefined;

it('should be', () => {
  expect(deserializeBreak(input)).toEqual(output);
});
