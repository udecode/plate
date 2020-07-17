import { setPositionAtSelection } from '../../../../Toolbar/BalloonToolbar/index';

const input = document.createElement('div');

const output = '';

it('should be', () => {
  setPositionAtSelection(input);
  expect(input.style.top).toEqual(output);
});
