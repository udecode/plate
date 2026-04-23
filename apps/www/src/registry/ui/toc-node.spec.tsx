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

const ButtonMock = mock(({ children, className, ...props }: any) => (
  <button type="button" {...props} className={className}>
    {children}
  </button>
));

const useTocElementMock = mock();
const useTocElementStateMock = mock();

mock.module('platejs/react', () => ({
  PlateElement: PlateElementMock,
}));

mock.module('@platejs/toc/react', () => ({
  useTocElement: useTocElementMock,
  useTocElementState: useTocElementStateMock,
}));

mock.module('@/components/ui/button', () => ({
  Button: ButtonMock,
}));

describe('toc node rendering', () => {
  beforeEach(() => {
    PlateElementMock.mockClear();
    ButtonMock.mockClear();
    useTocElementMock.mockReset();
    useTocElementStateMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('marks only the active heading row as current', async () => {
    useTocElementStateMock.mockReturnValue({
      activeContentId: 'benefits',
      headingList: [
        { depth: 1, id: 'intro', title: 'Intro' },
        { depth: 2, id: 'benefits', title: 'Benefits' },
      ],
    });
    useTocElementMock.mockReturnValue({
      props: {
        onClick: mock(),
      },
    });

    const { TocElement } = await import(
      `./toc-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <TocElement attributes={{}} element={{ children: [{ text: '' }] } as any}>
        <span />
      </TocElement>
    );

    const intro = view.getByRole('button', { name: 'Intro' });
    const benefits = view.getByRole('button', { name: 'Benefits' });

    expect(intro.getAttribute('aria-current')).toBeNull();
    expect(benefits.getAttribute('aria-current')).toBe('location');
    expect(view.container.querySelectorAll('[aria-current]').length).toBe(1);
  });
});
