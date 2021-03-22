import { setPositionAtSelection } from '../../../../BalloonToolbar/setPositionAtSelection';

const input = document.createElement('div');

const output = '';

it('should be', () => {
  setPositionAtSelection(input);
  expect(input.style.top).toEqual(output);
});
