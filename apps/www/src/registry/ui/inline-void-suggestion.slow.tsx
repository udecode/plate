import * as React from 'react';

import { render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const useFocusedMock = mock();
const useReadOnlyMock = mock();
const useSelectedMock = mock();
const useEditorRefMock = mock();
const useEditorSelectorMock = mock();
const useElementMock = mock();
const useMountedMock = mock();
const useEquationElementMock = mock();
const useEditorPluginMock = mock();
const usePluginOptionMock = mock();

(globalThis as any).React = React;

mock.module('platejs/react', () => ({
  PlateElement: ({
    attributes,
    children,
    className,
    ...props
  }: React.ComponentProps<'div'> & {
    attributes?: Record<string, unknown>;
  }) => (
    <div
      className={className}
      {...props}
      {...(attributes as Record<string, unknown>)}
      data-testid="plate-element"
    >
      {children}
    </div>
  ),
  PlateLeaf: ({
    attributes,
    children,
    className,
    ...props
  }: React.ComponentProps<'span'> & {
    attributes?: Record<string, unknown>;
  }) => (
    <span
      className={className}
      {...props}
      {...(attributes as Record<string, unknown>)}
      data-testid="plate-leaf"
    >
      {children}
    </span>
  ),
  createPrimitiveComponent: () => () => () => null,
  useEditorPlugin: (...args: any[]) => useEditorPluginMock(...args),
  useEditorRef: (...args: any[]) => useEditorRefMock(...args),
  useEditorSelector: (...args: any[]) => useEditorSelectorMock(...args),
  useElement: (...args: any[]) => useElementMock(...args),
  useFocused: (...args: any[]) => useFocusedMock(...args),
  usePluginOption: (...args: any[]) => usePluginOptionMock(...args),
  useReadOnly: (...args: any[]) => useReadOnlyMock(...args),
  useSelected: (...args: any[]) => useSelectedMock(...args),
}));

mock.module('@platejs/math/react', () => ({
  useEquationElement: (...args: any[]) => useEquationElementMock(...args),
  useEquationInput: () => ({}),
}));

mock.module('@platejs/date', () => ({
  formatDateValue: (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
  getDateDisplayLabel: ({ date, rawDate }: any) => rawDate ?? date,
  parseCanonicalDateValue: () => new Date(2026, 3, 13),
}));

mock.module('@platejs/mention', () => ({
  getMentionOnSelectItem: () => () => {},
}));

mock.module('@platejs/link', () => ({
  getLinkAttributes: () => ({
    href: 'https://example.com',
  }),
}));

mock.module('@platejs/selection/react', () => ({
  BlockSelectionPlugin: { key: 'blockSelection' },
}));

mock.module('@platejs/suggestion/react', () => ({
  SuggestionPlugin: { key: 'suggestion' },
}));

mock.module('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button {...props}>{children}</button>
  ),
}));

mock.module('@/components/ui/calendar', () => ({
  Calendar: () => <div data-testid="calendar" />,
}));

mock.module('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverContent: () => null,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

mock.module('@/registry/hooks/use-mounted', () => ({
  useMounted: (...args: any[]) => useMountedMock(...args),
}));

mock.module('./inline-combobox', () => ({
  InlineCombobox: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  InlineComboboxContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  InlineComboboxEmpty: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  InlineComboboxGroup: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  InlineComboboxInput: () => null,
  InlineComboboxItem: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe('inline void suggestion styling', () => {
  const editor = {
    getApi: () => ({
      suggestion: {
        dataList: (node: any) =>
          Object.keys(node)
            .filter((key) => key.startsWith('suggestion_'))
            .map((key) => node[key]),
        suggestionData: (element: any) => element.suggestion,
      },
    }),
    tf: {
      select: () => {},
      setNodes: () => {},
    },
  } as any;

  beforeEach(() => {
    useFocusedMock.mockReset();
    useReadOnlyMock.mockReset();
    useSelectedMock.mockReset();
    useEditorRefMock.mockReset();
    useEditorSelectorMock.mockReset();
    useEditorPluginMock.mockReset();
    useElementMock.mockReset();
    useMountedMock.mockReset();
    usePluginOptionMock.mockReset();
    useEquationElementMock.mockReset();

    useFocusedMock.mockReturnValue(false);
    useReadOnlyMock.mockReturnValue(false);
    useSelectedMock.mockReturnValue(false);
    useEditorRefMock.mockReturnValue(editor);
    useEditorSelectorMock.mockReturnValue(false);
    useEditorPluginMock.mockReturnValue({
      api: {
        suggestion: {
          dataList: () => [],
          nodeId: () => null,
        },
      },
      setOption: () => {},
    });
    useMountedMock.mockReturnValue(true);
    usePluginOptionMock.mockReturnValue(null);
    useEquationElementMock.mockReturnValue(undefined);
  });

  afterAll(() => {
    mock.restore();
  });

  it('styles mention remove suggestions', async () => {
    const { MentionElement } = await import(
      `./mention-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <MentionElement
        attributes={{ 'data-inline-suggestion': 'remove' }}
        editor={editor}
        element={
          {
            children: [{ text: '' }],
            type: 'mention',
            value: 'Ada',
          } as any
        }
      >
        {null}
      </MentionElement>
    );

    expect(
      view.container
        .querySelector('[data-testid="plate-element"]')
        ?.className.split(' ')
    ).toContain('data-[inline-suggestion=remove]:bg-red-100!');
  });

  it('styles link suggestions through injected inline suggestion data', async () => {
    const { LinkElement } = await import(
      `./link-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <LinkElement
        attributes={{ 'data-inline-suggestion': 'insert' }}
        editor={editor}
        element={
          {
            children: [{ text: 'Docs' }],
            type: 'link',
            url: 'https://example.com',
          } as any
        }
      >
        Docs
      </LinkElement>
    );

    expect(
      view.container
        .querySelector('[data-testid="plate-element"]')
        ?.className.split(' ')
    ).toContain('data-[inline-suggestion=insert]:bg-emerald-100!');
  });

  it('marks the date trigger with a stable slot and ancestor-aware suggestion variants', async () => {
    const { DateElement } = await import(
      `./date-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <DateElement
        attributes={{ 'data-inline-suggestion': 'insert' }}
        editor={editor}
        element={
          {
            children: [{ text: '' }],
            date: '2026-04-13',
            type: 'date',
          } as any
        }
      />
    );

    const trigger = view.container.querySelector('span[draggable="true"]');

    expect(trigger?.className).toContain(
      'in-data-[inline-suggestion=insert]:bg-emerald-100!'
    );
    expect(trigger?.className).toContain(
      'in-data-[inline-suggestion=remove]:bg-red-100!'
    );
    expect(trigger?.getAttribute('draggable')).toBe('true');
  });

  it('styles inline equation remove suggestions', async () => {
    const element = {
      children: [{ text: '' }],
      texExpression: 'E = mc^2',
      type: 'inline_equation',
    } as any;

    useElementMock.mockReturnValue(element);

    const { InlineEquationElement } = await import(
      `./equation-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <InlineEquationElement
        attributes={{ 'data-inline-suggestion': 'remove' }}
        editor={editor}
        element={element}
      >
        {null}
      </InlineEquationElement>
    );

    expect(
      view.container.querySelector('div[contenteditable="false"]')?.className
    ).toContain('in-data-[inline-suggestion=remove]:bg-red-100!');
  });
});
