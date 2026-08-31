import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { fireEvent, render } from '@testing-library/react';
import * as PlateReact from 'platejs/react';
import * as React from 'react';

const formatDateValueMock = mock(
  (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
);
const getDateDisplayLabelMock = mock((value: string) => {
  if (value === '2026-03-23') return 'Today';

  return value;
});
const parseCanonicalDateValueMock = mock(() => new Date(2026, 2, 23));
const plateElementMock = mock();
const useReadOnlyMock = mock();
const PopoverMockContext = React.createContext<{
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}>({});
let openOnFocus = false;
let popoverMode: 'passive' | 'passthrough' | 'radix' = 'passthrough';

mock.module('platejs/date', () => ({
  formatDateValue: formatDateValueMock,
  getDateDisplayLabel: getDateDisplayLabelMock,
  parseCanonicalDateValue: parseCanonicalDateValueMock,
}));

mock.module('platejs/react', () => ({
  ...PlateReact,
  PlateElement: (props: any) => {
    plateElementMock(props);

    return <div data-testid="plate-element">{props.children}</div>;
  },
  useEditorReadOnly: useReadOnlyMock,
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
  Popover: ({ children, onOpenChange, open }: any) => {
    const contextValue = React.useMemo(
      () => ({ onOpenChange, open }),
      [onOpenChange, open]
    );

    if (popoverMode === 'passthrough') return <>{children}</>;

    const [trigger, ...content] = React.Children.toArray(children);

    return (
      <PopoverMockContext.Provider value={contextValue}>
        {trigger}
        {open ? content : null}
      </PopoverMockContext.Provider>
    );
  },
  PopoverContent: ({ children }: any) => <>{children}</>,
  PopoverTrigger: ({ children }: any) => {
    const { onOpenChange, open } = React.useContext(PopoverMockContext);

    if (popoverMode !== 'radix') return <>{children}</>;

    const child = React.Children.only(children) as React.ReactElement<any>;

    return React.cloneElement(child, {
      onClick: (event: any) => {
        child.props.onClick?.(event);
        if (!event.defaultPrevented) onOpenChange?.(!open);
      },
      onFocus: (event: any) => {
        child.props.onFocus?.(event);
        if (openOnFocus) onOpenChange?.(true);
      },
      onPointerDown: (event: any) => {
        child.props.onPointerDown?.(event);
      },
    });
  },
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
    openOnFocus = false;
    popoverMode = 'passthrough';
  });

  afterAll(() => {
    mock.restore();
  });

  it('renders canonical dates through the shared relative-label helper', async () => {
    const { DateElement } = await import(
      `./date?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <DateElement
        attributes={{}}
        editor={{}}
        element={
          {
            children: [{ text: '' }],
            value: '2026-03-23',
            type: 'date',
          } as any
        }
      >
        {null}
      </DateElement>
    );

    expect(
      view.getByRole('button', { name: 'Today' }).getAttribute('type')
    ).toBe('button');
  });

  it('renders raw fallback text literally', async () => {
    const { DateElement } = await import(
      `./date?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <DateElement
        attributes={{}}
        editor={{}}
        element={
          {
            children: [{ text: '' }],
            value: 'sometime next week',
            type: 'date',
          } as any
        }
      >
        {null}
      </DateElement>
    );

    expect(view.getByText('sometime next week')).toBeTruthy();
  });

  it('owns first-click opening with a passive popover wrapper', async () => {
    popoverMode = 'passive';
    const { DateElement } = await import(
      `./date?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <DateElement
        attributes={{}}
        editor={{}}
        element={
          {
            children: [{ text: '' }],
            value: '2026-03-23',
            type: 'date',
          } as any
        }
      >
        {null}
      </DateElement>
    );

    expect(view.queryByTestId('calendar-select')).toBeNull();
    fireEvent.click(view.getByRole('button', { name: 'Today' }));
    expect(view.getByTestId('calendar-select')).toBeTruthy();
  });

  it('keeps a gesture that began closed open when focus opens first', async () => {
    openOnFocus = true;
    popoverMode = 'radix';
    const { DateElement } = await import(
      `./date?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <DateElement
        attributes={{}}
        editor={{}}
        element={
          {
            children: [{ text: '' }],
            value: '2026-03-23',
            type: 'date',
          } as any
        }
      >
        {null}
      </DateElement>
    );
    const trigger = view.getByRole('button', { name: 'Today' });

    expect(view.queryByTestId('calendar-select')).toBeNull();
    fireEvent.pointerDown(trigger);
    fireEvent.focus(trigger);
    expect(view.getByTestId('calendar-select')).toBeTruthy();
    fireEvent.click(trigger, { detail: 1 });
    expect(view.getByTestId('calendar-select')).toBeTruthy();

    fireEvent.pointerDown(trigger);
    fireEvent.click(trigger, { detail: 1 });
    expect(view.queryByTestId('calendar-select')).toBeNull();

    fireEvent.pointerDown(trigger);
    fireEvent.focus(trigger);
    expect(view.getByTestId('calendar-select')).toBeTruthy();
    fireEvent.click(trigger, { detail: 1 });
    expect(view.getByTestId('calendar-select')).toBeTruthy();
  });

  it('writes the canonical date value on calendar selection', async () => {
    const setNodes = mock();
    const element = {
      children: [{ text: '' }],
      value: '2026-03-23',
      type: 'date',
    } as any;
    const { DateElement } = await import(
      `./date?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <DateElement
        attributes={{}}
        editor={{ update: { nodes: { set: setNodes } } }}
        element={element}
      >
        {null}
      </DateElement>
    );

    fireEvent.click(view.getByTestId('calendar-select'));

    expect(setNodes).toHaveBeenCalledWith(
      { value: '2026-03-24' },
      { at: element }
    );
  });
});
