import { deserializeHTMLToFragment } from '../../utils/index';

const input = {
  element: document.createElement('div'),
  children: [],
};

const output = undefined;

it('should be', () => {
  expect(deserializeHTMLToFragment(input)).toEqual(output);
});
