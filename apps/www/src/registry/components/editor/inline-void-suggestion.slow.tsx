import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import type { DateElement } from '@platejs/date';
import type { LinkElement } from '@platejs/link';
import type { EquationElement } from '@platejs/math';
import type { MentionElement } from '@platejs/mention';
import { render } from '@testing-library/react';
import type { PlateEditor } from 'platejs/react';
import * as React from 'react';

const useFocusedMock = mock();
const useReadOnlyMock = mock();
const useSelectedMock = mock();
const useEditorMock = mock();
const useEditorSelectorMock = mock();
const useElementMock = mock();
const useMountedMock = mock();
const usePluginStoreMock = mock();
const createPluginMock = (name: string) => {
  const plugin = {
    configure: () => plugin,
    name,
  };

  return plugin;
};
const EquationPluginMock = createPluginMock('equation');
const InlineEquationPluginMock = createPluginMock('inlineEquation');

Object.assign(globalThis, { React });

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
      {...attributes!}
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
      {...attributes!}
      data-testid="plate-leaf"
    >
      {children}
    </span>
  ),
  useEditor: useEditorMock,
  useEditorPlugin: () => ({ api: {}, read: {}, store: {} }),
  useEditorRuntimeState: () => {},
  useEditorSelection: () => null,
  useEditorSelector: useEditorSelectorMock,
  useElement: useElementMock,
  useEditorFocused: useFocusedMock,
  usePluginStore: usePluginStoreMock,
  usePlateEditor: () => ({}),
  useEditorReadOnly: useReadOnlyMock,
  useElementSelected: useSelectedMock,
}));

mock.module('@platejs/math/react', () => ({
  EquationPlugin: EquationPluginMock,
  InlineEquationPlugin: InlineEquationPluginMock,
}));

mock.module('@platejs/date', () => ({
  formatDateValue: (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`,
  getDateDisplayLabel: (value: string) => value,
  parseCanonicalDateValue: () => new Date(2026, 3, 13),
}));

mock.module('@platejs/mention', () => ({}));

mock.module('@platejs/suggestion/react', () => ({
  SuggestionPlugin: { name: 'suggestion' },
}));

mock.module('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  buttonVariants: () => '',
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
  useMounted: useMountedMock,
}));

mock.module('@/registry/components/editor/comment', () => ({
  commentPlugin: {},
}));

mock.module('@/registry/components/editor/suggestion', () => ({
  suggestionPlugin: {},
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
    plugin: () => ({
      api: {
        getAttributes: () => ({ href: 'https://example.com' }),
      },
    }),
  } as unknown as PlateEditor;

  beforeEach(() => {
    useFocusedMock.mockReset();
    useReadOnlyMock.mockReset();
    useSelectedMock.mockReset();
    useEditorMock.mockReset();
    useEditorSelectorMock.mockReset();
    useElementMock.mockReset();
    useMountedMock.mockReset();
    usePluginStoreMock.mockReset();

    useFocusedMock.mockReturnValue(false);
    useReadOnlyMock.mockReturnValue(false);
    useSelectedMock.mockReturnValue(false);
    useEditorMock.mockReturnValue(editor);
    useEditorSelectorMock.mockReturnValue(false);
    useMountedMock.mockReturnValue(true);
    usePluginStoreMock.mockReturnValue(null);
  });

  afterAll(() => {
    mock.restore();
  });

  it('styles mention remove suggestions', async () => {
    const { MentionElement } = await import(
      `./mention?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <MentionElement
        attributes={{ 'data-inline-suggestion': 'remove' }}
        editor={editor}
        element={
          {
            children: [{ text: '' }],
            label: 'Ada',
            ref: 'user:42',
            type: 'mention',
          } satisfies MentionElement
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
      `./link?test=${Math.random().toString(36).slice(2)}`
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
          } satisfies LinkElement
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
      `./date?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <DateElement
        attributes={{ 'data-inline-suggestion': 'insert' }}
        editor={editor}
        element={
          {
            children: [{ text: '' }],
            value: '2026-04-13',
            type: 'date',
          } satisfies DateElement
        }
      />
    );

    const trigger = view.container.querySelector('button[draggable="true"]');

    expect(trigger?.className).toContain(
      'in-data-[inline-suggestion=insert]:bg-emerald-100!'
    );
    expect(trigger?.className).toContain(
      'in-data-[inline-suggestion=remove]:bg-red-100!'
    );
    expect(trigger?.getAttribute('draggable')).toBe('true');
    expect(trigger?.getAttribute('type')).toBe('button');
  });

  it('styles inline equation remove suggestions', async () => {
    const element = {
      children: [{ text: '' }],
      latex: 'E = mc^2',
      type: 'inlineEquation',
    } satisfies EquationElement;

    useElementMock.mockReturnValue(element);

    const { InlineEquationElement } = await import(
      `./math?test=${Math.random().toString(36).slice(2)}`
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

    const trigger = view.container.querySelector(
      'button[aria-label="Edit equation"]'
    );

    expect(trigger?.className).toContain(
      'in-data-[inline-suggestion=remove]:bg-red-100!'
    );
    expect(trigger?.getAttribute('type')).toBe('button');
  });
});
