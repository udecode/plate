import React from 'react';

import { render } from '@testing-library/react';

import { PortalBody } from './PortalBody';

describe('PortalBody', () => {
  it('defaults to document.body', () => {
    const { getByTestId } = render(
      <PortalBody>
        <div data-testid="portal">Body</div>
      </PortalBody>
    );

    expect(getByTestId('portal').parentElement).toBe(document.body);
  });

  it('uses the provided element when present', () => {
    const element = document.createElement('div');
    document.body.append(element);

    const { getByTestId } = render(
      <PortalBody element={element}>
        <div data-testid="portal">Custom</div>
      </PortalBody>
    );

    expect(element.contains(getByTestId('portal'))).toBe(true);
  });
});
