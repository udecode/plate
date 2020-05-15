import { deserializeFragment } from 'deserializers/deserialize-html/utils';

const input = {
  el: document.createElement('div'),
  children: [],
};

const output = undefined;

it('should be', () => {
  expect(deserializeFragment(input)).toEqual(output);
});
