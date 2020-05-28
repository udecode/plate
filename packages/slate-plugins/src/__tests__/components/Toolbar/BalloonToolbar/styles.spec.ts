import { getBalloonToolbarStyles } from 'components/Toolbar';

it('should render', () => {
  // default
  getBalloonToolbarStyles('', {}, 'light', false, 1, 'bottom', true);

  // direction - theme
  getBalloonToolbarStyles('', {}, 'dark', false, 1, 'top', true);
  getBalloonToolbarStyles('', {}, 'light', false, 1, 'top', true);
  getBalloonToolbarStyles('', {}, 'dark', false, 1, 'bottom', true);

  expect(1).toBe(1);
});
