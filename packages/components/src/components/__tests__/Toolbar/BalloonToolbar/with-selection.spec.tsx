import * as React from 'react';
import { render } from '@testing-library/react';
import { SlatePlugins } from '../../../../../../core/src/components/SlatePlugins';
import { BalloonToolbar } from '../../../Toolbar/BalloonToolbar/BalloonToolbar';

const Editor = () => (
  <SlatePlugins>
    <BalloonToolbar>test</BalloonToolbar>
  </SlatePlugins>
);

it('should not be visible', () => {
  const { getByTestId } = render(<Editor />);

  expect(getByTestId('Toolbar')).not.toBeVisible();
});
