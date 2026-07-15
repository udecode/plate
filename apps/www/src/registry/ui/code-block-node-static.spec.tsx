import * as React from 'react';

import { render } from '@testing-library/react';
import { afterAll, describe, expect, it, mock } from 'bun:test';

mock.module('platejs/static', () => ({
  PliteElement: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="plite-element" {...props}>
      {children}
    </div>
  ),
  PliteLeaf: ({ children, className }: any) => (
    <span className={className}>{children}</span>
  ),
}));

describe('CodeBlockElementStatic', () => {
  afterAll(() => {
    mock.restore();
  });

  it('renders the persisted code block language label', async () => {
    const { CodeBlockElementStatic } = await import(
      `./code-block-node-static?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <CodeBlockElementStatic
        attributes={{}}
        element={
          {
            children: [{ text: '' }],
            lang: 'python',
            type: 'code_block',
          } as any
        }
      >
        <span>print("hello")</span>
      </CodeBlockElementStatic>
    );

    expect(view.getByText('Python')).toBeTruthy();
  });

  it('can hide the language label at the component boundary', async () => {
    const { CodeBlockElementStatic } = await import(
      `./code-block-node-static?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <CodeBlockElementStatic
        attributes={{}}
        element={
          {
            children: [{ text: '' }],
            lang: 'python',
            type: 'code_block',
          } as any
        }
        showLanguageLabel={false}
      >
        <span>print("hello")</span>
      </CodeBlockElementStatic>
    );

    expect(view.queryByText('Python')).toBeNull();
  });
});
