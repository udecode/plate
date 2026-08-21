import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { render } from '@testing-library/react';
import type { Element } from 'platejs';
import * as React from 'react';

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
    const { HeadingElement } = await import(
      `./heading?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <HeadingElement
        attributes={{ 'data-nav-target': 'true' }}
        element={
          {
            children: [{ text: '' }],
            level: 2,
            type: 'heading',
          } satisfies Element
        }
      >
        Heading
      </HeadingElement>
    );

    const heading = view.container.querySelector('[data-nav-target="true"]');

    expect(heading?.className).toContain(
      'data-[nav-target=true]:bg-(--color-highlight)'
    );
  });
});
