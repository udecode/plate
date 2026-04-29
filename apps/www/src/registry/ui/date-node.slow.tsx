import * as React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const formatDateValueMock = mock(
  (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
);
const getDateDisplayLabelMock = mock(({ date, rawDate }: any) => {
  if (rawDate) return rawDate;
  if (date === '2026-03-23') return 'Today';

  return date;
});
const parseCanonicalDateValueMock = mock(() => new Date(2026, 2, 23));
const plateElementMock = mock();
const useReadOnlyMock = mock();

mock.module('@platejs/date', () => ({
  formatDateValue: formatDateValueMock,
  getDateDisplayLabel: getDateDisplayLabelMock,
  parseCanonicalDateValue: parseCanonicalDateValueMock,
}));

mock.module('platejs/react', () => ({
  PlateElement: (props: any) => {
    plateElementMock(props);

    return <div data-testid="plate-element">{props.children}</div>;
  },
  useReadOnly: useReadOnlyMock,
}));

mock.module('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect }: any) => (
    <button
      data-testid="calendar-select"
      onClick={() => onSelect?.(new Date(2026, 2, 24))}
      type="button"
    >
      pick
    </button>
  ),
}));

mock.module('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <>{children}</>,
  PopoverContent: ({ children }: any) => <>{children}</>,
  PopoverTrigger: ({ children }: any) => <>{children}</>,
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

describe('DateElement', () => {
  beforeEach(() => {
    formatDateValueMock.mockClear();
    getDateDisplayLabelMock.mockClear();
    parseCanonicalDateValueMock.mockClear();
    plateElementMock.mockReset();
    useReadOnlyMock.mockReset();
    useReadOnlyMock.mockReturnValue(false);
  });

  afterAll(() => {
    mock.restore();
  });

  it('renders canonical dates through the shared relative-label helper', async () => {
    const { DateElement } = await import(
      `./date-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <DateElement
        attributes={{}}
        editor={{}}
        element={
          {
            children: [{ text: '' }],
            date: '2026-03-23',
            type: 'date',
          } as any
        }
      >
        {null}
      </DateElement>
    );

    expect(view.getByText('Today')).toBeTruthy();
  });

  it('renders raw fallback text literally', async () => {
    const { DateElement } = await import(
      `./date-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <DateElement
        attributes={{}}
        editor={{}}
        element={
          {
            children: [{ text: '' }],
            rawDate: 'sometime next week',
            type: 'date',
          } as any
        }
      >
        {null}
      </DateElement>
    );

    expect(view.getByText('sometime next week')).toBeTruthy();
  });

  it('writes the canonical date value on calendar selection', async () => {
    const setNodes = mock();
    const { DateElement } = await import(
      `./date-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <DateElement
        attributes={{}}
        editor={{ tf: { setNodes } }}
        element={
          {
            children: [{ text: '' }],
            date: '2026-03-23',
            type: 'date',
          } as any
        }
      >
        {null}
      </DateElement>
    );

    fireEvent.click(view.getByTestId('calendar-select'));

    expect(setNodes).toHaveBeenCalledWith(
      { date: '2026-03-24', rawDate: undefined },
      expect.any(Object)
    );
  });
});
