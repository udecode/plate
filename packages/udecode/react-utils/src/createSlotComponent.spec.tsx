import React from 'react';

import { render } from '@testing-library/react';

import { createSlotComponent } from './createSlotComponent';

describe('createSlotComponent', () => {
  it('renders the base element by default', () => {
    const Box = createSlotComponent('div');

    const { getByTestId } = render(<Box data-testid="box" />);

    expect(getByTestId('box').tagName).toBe('DIV');
  });

  it('supports overriding the rendered element with as', () => {
    const Box = createSlotComponent('div');

    const { getByTestId } = render(<Box as="section" data-testid="box" />);

    expect(getByTestId('box').tagName).toBe('SECTION');
  });

  it('passes props to the child when rendered asChild', () => {
    const Box = createSlotComponent('div');

    const { getByTestId } = render(
      <Box asChild data-testid="child">
        <button>Click</button>
      </Box>
    );

    expect(getByTestId('child').tagName).toBe('BUTTON');
  });

  it('forwards refs through the asChild path', () => {
    const Box = createSlotComponent('div');
    const ref = React.createRef<HTMLButtonElement>();

    const { getByTestId } = render(
      <Box asChild ref={ref}>
        <button data-testid="child">Click</button>
      </Box>
    );

    expect(ref.current).toBe(getByTestId('child') as HTMLButtonElement);
  });
});
