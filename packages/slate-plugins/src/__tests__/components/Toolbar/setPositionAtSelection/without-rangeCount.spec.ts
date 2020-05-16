import { setPositionAtSelection } from 'components/utils';

const input = document.createElement('div');

const output = '';

it('should be', () => {
  setPositionAtSelection(input);
  expect(input.style.opacity).toEqual(output);
});
