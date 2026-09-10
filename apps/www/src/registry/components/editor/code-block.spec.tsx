import {
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test';

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import type { CodeBlockElement } from 'platejs';
import * as React from 'react';

const useReadOnlyMock = mock(() => true);
const mockPlugin = (name: string) => ({
  name,
  configure: mock(() => ({ name })),
});

let currentElement: CodeBlockElement;
const editor = {} as React.ComponentProps<
  typeof import('./code-block').CodeBlockElement
>['editor'];
const pluginContext = {} as React.ComponentProps<
  typeof import('./code-block').CodeBlockElement
>;

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
  PlateElement: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="plate-element" {...props}>
      {children}
    </div>
  ),
  PlateLeaf: ({ children, className }: any) => (
    <span className={className}>{children}</span>
  ),
  useEditor: () => ({
    read: { nodes: { path: () => [0] }, text: { string: () => 'code' } },
    update: {
      nodes: {
        set: mock(),
      },
    },
  }),
  useElement: () => currentElement,
  usePath: () => [0],
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

mock.module('@/registry/components/editor/floating-popover', () => ({
  FloatingPopover: ({ children }: any) => <>{children}</>,
  FloatingPopoverContent: ({ children }: any) => <div>{children}</div>,
  FloatingPopoverTrigger: ({ children }: any) => <>{children}</>,
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

describe('CodeBlockElement', () => {
  it('confirms copying only after the clipboard write succeeds', async () => {
    let complete: (() => void) | undefined;
    const write = spyOn(navigator.clipboard, 'writeText').mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          complete = resolve;
        })
    );
    const { CodeBlockElement } = await import('./code-block');
    const view = render(
      <CodeBlockElement
        {...pluginContext}
        attributes={{ 'data-plite-node': 'element' }}
        editor={editor}
        element={currentElement}
      >
        <span>code</span>
      </CodeBlockElement>
    );
    try {
      fireEvent.click(view.getByRole('button', { name: 'Copy' }));
      expect(view.container.querySelector('.lucide-check')).toBeNull();
      await act(async () => {
        complete?.();
      });
      expect(view.container.querySelector('.lucide-check')).not.toBeNull();
      expect(write).toHaveBeenCalledWith('code');
    } finally {
      view.unmount();
      write.mockRestore();
    }
  });

  it('allows retry after a denied clipboard write', async () => {
    const write = spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
      new Error('Clipboard permission denied')
    );
    const { CodeBlockElement } = await import('./code-block');
    const view = render(
      <CodeBlockElement
        {...pluginContext}
        attributes={{ 'data-plite-node': 'element' }}
        editor={editor}
        element={currentElement}
      >
        <span>code</span>
      </CodeBlockElement>
    );
    try {
      fireEvent.click(view.getByRole('button', { name: 'Copy' }));
      await waitFor(() => {
        expect(
          view.getByRole('button', { name: 'Copy failed. Try again.' })
        ).toBeTruthy();
      });
      expect(view.container.querySelector('.lucide-check')).toBeNull();
      write.mockResolvedValue(undefined);
      fireEvent.click(
        view.getByRole('button', { name: 'Copy failed. Try again.' })
      );
      await waitFor(() => {
        expect(view.container.querySelector('.lucide-check')).not.toBeNull();
      });
    } finally {
      view.unmount();
      write.mockRestore();
    }
  });

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
