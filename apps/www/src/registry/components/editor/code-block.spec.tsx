import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { render } from '@testing-library/react';
import type { CodeBlockElement } from 'platejs';
import type { Editor } from 'platejs/react';
import * as React from 'react';

const useReadOnlyMock = mock(() => true);
const mockPlugin = (name: string) => ({
  name,
  configure: mock(() => ({ name })),
});

let currentElement: CodeBlockElement;
const editor = {} as Editor;

mock.module('platejs', () => ({
  BaseCodeBlockPlugin: mockPlugin('codeBlock'),
  CodeBlockRules: { markdown: mock(() => ({})) },
  NodeApi: {
    string: () => 'code',
  },
}));

mock.module('platejs/react', () => ({
  CodeBlockPlugin: mockPlugin('codeBlock'),
  CodeHighlightPlugin: mockPlugin('codeHighlight'),
  CodeLinePlugin: mockPlugin('codeLine'),
  PlateElement: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="plate-element" {...props}>
      {children}
    </div>
  ),
  PlateLeaf: ({ children, className }: any) => (
    <span className={className}>{children}</span>
  ),
  useEditor: () => ({
    update: {
      nodes: {
        set: mock(),
      },
    },
  }),
  useElement: () => currentElement,
  useEditorReadOnly: () => useReadOnlyMock(),
}));

mock.module('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

mock.module('@/components/ui/command', () => ({
  Command: ({ children }: any) => <div>{children}</div>,
  CommandEmpty: ({ children }: any) => <div>{children}</div>,
  CommandGroup: ({ children }: any) => <div>{children}</div>,
  CommandInput: (props: any) => <input {...props} />,
  CommandItem: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  CommandList: ({ children }: any) => <div>{children}</div>,
}));

mock.module('./floating-popover', () => ({
  FloatingPopover: ({ children }: any) => <>{children}</>,
  FloatingPopoverContent: ({ children }: any) => <div>{children}</div>,
  FloatingPopoverTrigger: ({ children }: any) => <>{children}</>,
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

describe('CodeBlockElement', () => {
  beforeEach(() => {
    currentElement = {
      children: [{ text: '' }],
      language: 'javascript',
      type: 'codeBlock',
    };
    useReadOnlyMock.mockClear();
    useReadOnlyMock.mockReturnValue(true);
  });

  afterAll(() => {
    mock.restore();
  });

  it('renders the persisted language label in read-only mode', async () => {
    const { CodeBlockElement } = await import(
      `./code-block?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <CodeBlockElement
        attributes={{}}
        editor={editor}
        element={currentElement}
      >
        <span>const value = 1;</span>
      </CodeBlockElement>
    );

    expect(view.getByText('JavaScript')).toBeTruthy();
    expect(view.queryByRole('combobox')).toBeNull();
  });

  it('can hide the read-only language label at the component boundary', async () => {
    const { CodeBlockElement } = await import(
      `./code-block?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <CodeBlockElement
        attributes={{}}
        editor={editor}
        element={currentElement}
        showLanguageLabel={false}
      >
        <span>const value = 1;</span>
      </CodeBlockElement>
    );

    expect(view.queryByText('JavaScript')).toBeNull();
  });
});
