import * as React from 'react';

import { render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const PlateElementMock = mock(
  ({ children, as: Comp = 'div', attributes, className, ...props }: any) => (
    <Comp {...attributes} {...props} className={className}>
      {children}
    </Comp>
  )
);

mock.module('platejs/react', () => ({
  PlateElement: PlateElementMock,
}));

describe('heading node rendering', () => {
  beforeEach(() => {
    PlateElementMock.mockClear();
  });

  afterAll(() => {
    mock.restore();
  });

  it('keeps a visible nav-target highlight style on headings', async () => {
    const { H2Element } = await import(
      `./heading-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <H2Element
        attributes={{ 'data-nav-target': 'true' }}
        element={{ children: [{ text: '' }] } as any}
      >
        Heading
      </H2Element>
    );

    const heading = view.container.querySelector('[data-nav-target="true"]');

    expect(heading?.className).toContain(
      'data-[nav-target=true]:bg-(--color-highlight)'
    );
  });
});
