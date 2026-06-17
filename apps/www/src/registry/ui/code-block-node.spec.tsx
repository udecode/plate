import * as React from 'react';

import { render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const isLangSupportedMock = mock((_lang?: string) => false);
const useReadOnlyMock = mock(() => true);

let currentElement: any;

mock.module('@platejs/code-block', () => ({
  formatCodeBlock: mock(),
  isLangSupported: (lang?: string) => isLangSupportedMock(lang),
}));

mock.module('platejs', () => ({
  NodeApi: {
    string: () => 'code',
  },
}));

mock.module('platejs/react', () => ({
  PlateElement: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="plate-element" {...props}>
      {children}
    </div>
  ),
  PlateLeaf: ({ children, className }: any) => (
    <span className={className}>{children}</span>
  ),
  useEditorRef: () => ({
    tf: {
      setNodes: mock(),
    },
  }),
  useElement: () => currentElement,
  useReadOnly: () => useReadOnlyMock(),
}));

mock.module('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
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

mock.module('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <>{children}</>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <>{children}</>,
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

describe('CodeBlockElement', () => {
  beforeEach(() => {
    currentElement = {
      children: [{ text: '' }],
      lang: 'javascript',
      type: 'code_block',
    };
    isLangSupportedMock.mockClear();
    useReadOnlyMock.mockClear();
    useReadOnlyMock.mockReturnValue(true);
  });

  afterAll(() => {
    mock.restore();
  });

  it('renders the persisted language label in read-only mode', async () => {
    const { CodeBlockElement } = await import(
      `./code-block-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <CodeBlockElement
        attributes={{}}
        editor={{} as any}
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
      `./code-block-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <CodeBlockElement
        attributes={{}}
        editor={{} as any}
        element={currentElement}
        showLanguageLabel={false}
      >
        <span>const value = 1;</span>
      </CodeBlockElement>
    );

    expect(view.queryByText('JavaScript')).toBeNull();
  });
});
