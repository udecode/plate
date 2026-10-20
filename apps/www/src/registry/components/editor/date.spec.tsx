import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  setSystemTime,
} from 'bun:test';

import { act, fireEvent, render } from '@testing-library/react';
import * as PlateReact from 'platejs/react';
import * as React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

const plateElementMock = mock();
const useReadOnlyMock = mock();
const PopoverMockContext = React.createContext<{
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}>({});
let openOnFocus = false;
let popoverMode: 'passive' | 'passthrough' | 'radix' = 'passthrough';

mock.module('platejs/react', () => ({
  ...PlateReact,
  EditorElement: (props: any) => {
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

// Bun tests run in UTC when TZ is unset, and deleting TZ stops Bun from
// applying a later change, so restore a value instead.
const originalTimeZone = process.env.TZ ?? 'UTC';

const createDateElement = async (value: string) => {
  const { DateElement } = await import(
    `./date?test=${Math.random().toString(36).slice(2)}`
  );

  return (
    <DateElement
      attributes={{}}
      editor={{}}
      element={{ children: [{ text: '' }], type: 'date', value }}
    >
      {null}
    </DateElement>
  );
};

const hydrateLabel = async (html: string, element: React.ReactElement) => {
  const container = document.createElement('div');
  const recoverableErrors: unknown[] = [];

  container.innerHTML = html;
  document.body.append(container);

  const root = await act(async () =>
    hydrateRoot(container, element, {
      onRecoverableError: (error) => recoverableErrors.push(error),
    })
  );
  const label = container.querySelector('button')?.textContent;

  act(() => root.unmount());
  container.remove();

  return { label, recoverableErrors };
};

describe('DateElement', () => {
  beforeEach(() => {
    setSystemTime(new Date(2026, 2, 23, 9));
    plateElementMock.mockReset();
    useReadOnlyMock.mockReset();
    useReadOnlyMock.mockReturnValue(false);
    openOnFocus = false;
    popoverMode = 'passthrough';
  });

  afterEach(() => {
    setSystemTime();
    process.env.TZ = originalTimeZone;
  });

  afterAll(() => {
    mock.restore();
  });

  it.each([
    ['2026-03-22', 'Yesterday'],
    ['2026-03-23', 'Today'],
    ['2026-03-24', 'Tomorrow'],
    ['2026-04-01', 'April 1, 2026'],
    ['2026-02-30', '2026-02-30'],
    ['sometime next week', 'sometime next week'],
  ])('labels %s as %s', async (value, label) => {
    const element = await createDateElement(value);

    expect(render(element).container.querySelector('button')?.textContent).toBe(
      label
    );
  });

  it.each([
    ['2026-03-23', 'Today'],
    ['2026-03-24', 'Tomorrow'],
  ])(
    'labels %s as %s late on March 23 in Los Angeles',
    async (value, label) => {
      process.env.TZ = 'America/Los_Angeles';
      setSystemTime(new Date(2026, 2, 23, 23, 30));
      const element = await createDateElement(value);

      expect(
        render(element).container.querySelector('button')?.textContent
      ).toBe(label);
    }
  );

  it('hydrates server HTML that already holds the relative word', async () => {
    const element = await createDateElement('2026-03-23');
    const html = renderToString(element);

    expect(html).toContain('Today');
    expect(await hydrateLabel(html, element)).toEqual({
      label: 'Today',
      recoverableErrors: [],
    });
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

  it('writes the picked calendar day', async () => {
    process.env.TZ = 'Asia/Tokyo';
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
