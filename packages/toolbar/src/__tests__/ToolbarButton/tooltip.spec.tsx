import React from 'react';
import { render } from '@testing-library/react';
import { ToolbarButton } from '../../BalloonToolbar/ToolbarButton';

it('should render', () => {
  const { getByTestId } = render(
    <ToolbarButton
      data-testid="ToolbarButton"
      icon={null}
      active
      tooltip={{ content: 'test' }}
    />
  );
  expect(getByTestId('ToolbarButton')).toBeVisible();
});
