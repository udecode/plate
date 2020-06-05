import { deserializeHTMLToFragment } from 'deserializers/deserialize-html/utils';

const input = {
  el: document.createElement('div'),
  children: [],
};

const output = undefined;

it('should be', () => {
  expect(deserializeHTMLToFragment(input)).toEqual(output);
});
