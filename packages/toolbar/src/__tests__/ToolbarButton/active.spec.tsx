import React from 'react';
import { render } from '@testing-library/react';

import { ToolbarButton } from '@/plate/toolbar/ToolbarButton';

it('should render', () => {
  const { getByTestId } = render(
    <ToolbarButton data-testid="ToolbarButton" icon={null} active />
  );

  expect(getByTestId('ToolbarButton')).toBeVisible();
});
