import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { render } from '@testing-library/react';
import type { DateElement } from 'platejs/date';
import * as React from 'react';

const getDateDisplayLabelMock = mock((value: string) => {
  if (value === '2026-03-23') return 'Today';

  return value;
});

mock.module('platejs/static', () => ({
  PliteElement: ({ children }: React.ComponentProps<'span'>) => (
    <span>{children}</span>
  ),
}));
mock.module('platejs/date', () => ({
  BaseDatePlugin: {
    configure: mock(() => ({ name: 'date' })),
    name: 'date',
  },
  getDateDisplayLabel: getDateDisplayLabelMock,
}));

describe('DateElementStatic', () => {
  beforeEach(() => {
    getDateDisplayLabelMock.mockClear();
  });

  afterAll(() => {
    mock.restore();
  });

  it('renders canonical dates through the shared relative-label helper', async () => {
    const { DateElementStatic } = await import(
      `./date-static?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <DateElementStatic
        attributes={{}}
        element={
          {
            children: [{ text: '' }],
            value: '2026-03-23',
            type: 'date',
          } satisfies DateElement
        }
      >
        {null}
      </DateElementStatic>
    );

    expect(view.getByText('Today')).toBeTruthy();
  });

  it('renders raw fallback text literally', async () => {
    const { DateElementStatic } = await import(
      `./date-static?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <DateElementStatic
        attributes={{}}
        element={
          {
            children: [{ text: '' }],
            value: 'sometime next week',
            type: 'date',
          } satisfies DateElement
        }
      >
        {null}
      </DateElementStatic>
    );

    expect(view.getByText('sometime next week')).toBeTruthy();
  });
});
