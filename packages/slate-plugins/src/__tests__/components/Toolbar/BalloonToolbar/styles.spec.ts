import { getBalloonToolbarStyles } from 'components/Toolbar';

it('should render', () => {
  getBalloonToolbarStyles('', {}, false, 1, 'bottom');
  expect(1).toBe(1);
});
