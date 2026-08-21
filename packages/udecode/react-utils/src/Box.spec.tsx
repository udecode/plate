import { render } from '@testing-library/react';
import React from 'react';

import { Box } from './Box';

describe('Box', () => {
  it('renders a div by default and accepts an element override', () => {
    const { getByTestId, rerender } = render(<Box data-testid="box" />);

    expect(getByTestId('box').tagName).toBe('DIV');

    rerender(<Box as="section" data-testid="box" />);

    expect(getByTestId('box').tagName).toBe('SECTION');
  });

  it('passes props and refs to its child', () => {
    const ref = React.createRef<HTMLDivElement>();
    const { getByTestId } = render(
      <Box asChild data-testid="child" ref={ref}>
        <button type="button">Click</button>
      </Box>
    );

    expect(getByTestId('child').tagName).toBe('BUTTON');
    expect(ref.current?.tagName).toBe('BUTTON');
  });
});
