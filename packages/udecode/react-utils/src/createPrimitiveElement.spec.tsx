import React from 'react';

import { render } from '@testing-library/react';

import { createPrimitiveElement } from './createPrimitiveElement';

describe('createPrimitiveElement', () => {
  it('renders the requested intrinsic element', () => {
    const Input = createPrimitiveElement('input');

    const { getByTestId } = render(<Input data-testid="input" />);

    expect(getByTestId('input').tagName).toBe('INPUT');
  });

  it('passes props through to the rendered element', () => {
    const Input = createPrimitiveElement('input');

    const { getByPlaceholderText } = render(
      <Input data-testid="input" placeholder="Name" type="email" />
    );

    expect(getByPlaceholderText('Name').getAttribute('type')).toBe('email');
  });

  it('forwards refs to the intrinsic element', () => {
    const ref = React.createRef<HTMLInputElement>();
    const Input = createPrimitiveElement('input');

    const { getByTestId } = render(<Input ref={ref} data-testid="input" />);

    expect(ref.current).toBe(getByTestId('input') as HTMLInputElement);
  });
});
