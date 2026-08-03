import * as React from 'react';

import { render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';
import type { DateElement } from '@platejs/date';

const getDateDisplayLabelMock = mock(
  ({ date, rawDate }: { date?: string; rawDate?: string }) => {
    if (rawDate) return rawDate;
    if (date === '2026-03-23') return 'Today';

    return date;
  }
);

mock.module('platejs/static', () => ({
  PliteElement: ({ children }: React.ComponentProps<'span'>) => (
    <span>{children}</span>
  ),
}));
mock.module('@platejs/date', () => ({
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
      `./date-node-static?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <DateElementStatic
        attributes={{}}
        element={
          {
            children: [{ text: '' }],
            date: '2026-03-23',
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
      `./date-node-static?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <DateElementStatic
        attributes={{}}
        element={
          {
            children: [{ text: '' }],
            rawDate: 'sometime next week',
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
