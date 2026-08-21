import { afterAll, describe, expect, it, mock } from 'bun:test';

import type { CodeBlockElement } from '@platejs/code-block';
import { render } from '@testing-library/react';
import * as React from 'react';

const element = {
  children: [{ text: '' }],
  language: 'python',
  type: 'codeBlock',
} satisfies CodeBlockElement;

const mockPlugin = (name: string) => ({
  name,
  configure: mock(() => ({ name })),
});

mock.module('@platejs/code-block', () => ({
  BaseCodeBlockPlugin: mockPlugin('codeBlock'),
  BaseCodeHighlightPlugin: mockPlugin('codeHighlight'),
  BaseCodeLinePlugin: mockPlugin('codeLine'),
}));

mock.module('platejs/static', () => ({
  PliteElement: ({
    attributes,
    children,
    className,
  }: React.ComponentProps<'div'> & {
    attributes?: React.ComponentProps<'div'>;
  }) => (
    <div className={className} data-testid="plite-element" {...attributes}>
      {children}
    </div>
  ),
  PliteLeaf: ({ children, className }: React.ComponentProps<'span'>) => (
    <span className={className}>{children}</span>
  ),
}));

describe('CodeBlockElementStatic', () => {
  afterAll(() => {
    mock.restore();
  });

  it('renders the persisted code block language label', async () => {
    const { CodeBlockElementStatic } = await import(
      `./code-block-static?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <CodeBlockElementStatic attributes={{}} element={element}>
        <span>print("hello")</span>
      </CodeBlockElementStatic>
    );

    expect(view.getByText('Python')).toBeTruthy();
  });

  it('can hide the language label at the component boundary', async () => {
    const { CodeBlockElementStatic } = await import(
      `./code-block-static?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <CodeBlockElementStatic
        attributes={{}}
        element={element}
        showLanguageLabel={false}
      >
        <span>print("hello")</span>
      </CodeBlockElementStatic>
    );

    expect(view.queryByText('Python')).toBeNull();
  });
});
