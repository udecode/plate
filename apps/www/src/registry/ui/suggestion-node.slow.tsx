import * as React from 'react';

import { render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const useEditorPluginMock = mock();
const usePluginOptionMock = mock();

mock.module('@platejs/suggestion/react', () => ({
  SuggestionPlugin: { key: 'suggestion' },
}));

mock.module('platejs/react', () => ({
  PlateLeaf: ({ children }: any) => <span>{children}</span>,
  useEditorPlugin: (...args: any[]) => useEditorPluginMock(...args),
  usePluginOption: (...args: any[]) => usePluginOptionMock(...args),
}));

mock.module('lucide-react', () => ({
  CornerDownLeftIcon: (props: any) => (
    <i {...props} data-testid="line-break-icon" />
  ),
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

describe('SuggestionLineBreakContent', () => {
  beforeEach(() => {
    useEditorPluginMock.mockReset();
    usePluginOptionMock.mockReset();

    useEditorPluginMock.mockReturnValue({
      setOption: () => {},
    });
    usePluginOptionMock.mockReturnValue(null);
  });

  afterAll(() => {
    mock.restore();
  });

  it('renders line break suggestions without creating a flex wrapper around the paragraph content', async () => {
    const { SuggestionLineBreakContent } = await import(
      `./suggestion-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <p data-testid="paragraph">
        <SuggestionLineBreakContent
          suggestionData={{
            createdAt: 0,
            id: 'line-break-1',
            isLineBreak: true,
            type: 'insert',
            userId: 'alice',
          }}
        >
          <span data-testid="content">Hello world</span>
        </SuggestionLineBreakContent>
      </p>
    );

    const rootSpan = view.container.querySelector('p > span');

    expect(rootSpan?.className).not.toContain('inline-flex');
    expect(view.container.querySelector('p > div')).toBeNull();
    expect(view.getByTestId('content').textContent).toBe('Hello world');
  });

  it('renders line break badges inside the final list item instead of after the whole list', async () => {
    const { SuggestionLineBreakContent } = await import(
      `./suggestion-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <SuggestionLineBreakContent
        suggestionData={{
          createdAt: 0,
          id: 'line-break-2',
          isLineBreak: true,
          type: 'insert',
          userId: 'alice',
        }}
      >
        <ul data-testid="list">
          <li data-testid="item">
            <span data-testid="item-text">Edit existing text</span>
          </li>
        </ul>
      </SuggestionLineBreakContent>
    );

    const list = view.getByTestId('list');
    const item = view.getByTestId('item');
    const icon = view.getByTestId('line-break-icon');

    expect(list.nextElementSibling).toBeNull();
    expect(item.contains(icon)).toBe(true);
    expect(view.getByTestId('item-text').textContent).toBe(
      'Edit existing text'
    );
  });

  it('passes lineBreakBadge to wrapped component children', async () => {
    const { SuggestionLineBreakContent } = await import(
      `./suggestion-node?test=${Math.random().toString(36).slice(2)}`
    );

    const Wrapper = ({
      children,
      lineBreakBadge,
    }: {
      children?: React.ReactNode;
      lineBreakBadge?: React.ReactNode;
    }) => (
      <div data-testid="wrapper">
        <span data-testid="wrapper-text">{children}</span>
        {lineBreakBadge}
      </div>
    );

    const view = render(
      <SuggestionLineBreakContent
        suggestionData={{
          createdAt: 0,
          id: 'line-break-3',
          isLineBreak: true,
          type: 'insert',
          userId: 'alice',
        }}
      >
        <Wrapper>Wrapped text</Wrapper>
      </SuggestionLineBreakContent>
    );

    const wrapper = view.getByTestId('wrapper');
    const icon = view.getByTestId('line-break-icon');

    expect(wrapper.nextElementSibling).toBeNull();
    expect(wrapper.contains(icon)).toBe(true);
    expect(view.getByTestId('wrapper-text').textContent).toBe('Wrapped text');
  });

  it('renders remove line break badges without a filled red background', async () => {
    const { SuggestionLineBreakContent } = await import(
      `./suggestion-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <SuggestionLineBreakContent
        suggestionData={{
          createdAt: 0,
          id: 'line-break-4',
          isLineBreak: true,
          type: 'remove',
          userId: 'alice',
        }}
      >
        <span data-testid="content">Removed break</span>
      </SuggestionLineBreakContent>
    );

    const icon = view.getByTestId('line-break-icon');
    const badge = icon.parentElement;

    expect(badge?.className).toContain('text-red-700');
    expect(badge?.className).not.toContain('bg-red-100');
  });
});
