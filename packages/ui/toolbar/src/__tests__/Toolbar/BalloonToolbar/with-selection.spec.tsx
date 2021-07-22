import * as React from 'react';
import { render } from '@testing-library/react';
import { Plate } from '../../../../../../core/src/components/Plate';
import { BalloonToolbar } from '../../../BalloonToolbar/BalloonToolbar';

const Editor = () => (
  <Plate>
    <BalloonToolbar>test</BalloonToolbar>
  </Plate>
);

it('should not be visible', () => {
  const { getByTestId } = render(<Editor />);

  expect(getByTestId('Toolbar')).toBeVisible();
  // expect(getByTestId('Toolbar')).not.toBeVisible();
});
