import React from 'react';

import { render } from '@testing-library/react';

import { withRef } from './withRef';

describe('withRef', () => {
  it('forwards refs to the rendered element', () => {
    const Button = withRef<'button', { label: string }>(
      ({ label, ...props }, ref) => (
        <button ref={ref} {...props}>
          {label}
        </button>
      )
    );
    const ref = React.createRef<HTMLButtonElement>();

    const { getByTestId } = render(
      <Button data-testid="button" label="Click" ref={ref} />
    );

    expect(ref.current).toBe(getByTestId('button') as HTMLButtonElement);
  });

  it('passes props through to the rendered element', () => {
    const Button = withRef<'button', { label: string }>(
      ({ label, ...props }, ref) => (
        <button ref={ref} {...props}>
          {label}
        </button>
      )
    );

    const { getByRole, getByTestId } = render(
      <Button data-testid="button" disabled label="Click" />
    );

    expect(
      (getByRole('button', { name: 'Click' }) as HTMLButtonElement).disabled
    ).toBe(true);
    expect(getByTestId('button').getAttribute('data-testid')).toBe('button');
  });
});
