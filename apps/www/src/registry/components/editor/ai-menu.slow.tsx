import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { render } from '@testing-library/react';
import * as EditorRoot from 'platejs';
import * as PlateReact from 'platejs/react';
import * as React from 'react';

const pluginMock = mock();
const useEditorSelectorMock = mock();
const useFocusedLastMock = mock();
const usePluginStoreMock = mock();
const useEditorMock = mock();
const toDOMNodeMock = mock();

const Icon = () => <div />;

mock.module('platejs/ai/react', () => ({
  AIChatPlugin: {},
  AIPlugin: {},
}));

mock.module('platejs/ai', () => ({
  BaseAIPlugin: {
    extend: () => ({}),
  },
}));

mock.module('cmdk', () => ({
  Command: {
    Input: ({
      onValueChange,
      value,
      ...props
    }: React.InputHTMLAttributes<HTMLInputElement> & {
      onValueChange?: (value: string) => void;
    }) => (
      <input
        {...props}
        value={value}
        onChange={(event) => onValueChange?.(event.target.value)}
      />
    ),
  },
}));

mock.module('lucide-react', () => ({
  Album: Icon,
  BadgeHelp: Icon,
  BookOpenCheck: Icon,
  Check: Icon,
  CornerUpLeft: Icon,
  FeatherIcon: Icon,
  ListEnd: Icon,
  ListMinus: Icon,
  ListPlus: Icon,
  Loader2Icon: Icon,
  PauseIcon: Icon,
  PenLine: Icon,
  SmileIcon: Icon,
  Wand: Icon,
  X: Icon,
}));

mock.module('platejs', () => ({
  ...EditorRoot,
  ElementApi: {
    isElement: (node: unknown) =>
      !!node && typeof node === 'object' && 'children' in node,
  },
  PLUGINS: {},
  NodeApi: {},
  SelectionApi: {
    isNode: (selection: { kind?: string } | null) => selection?.kind === 'node',
  },
  TextApi: {
    isText: () => false,
  },
  isHotkey: () => () => false,
}));

mock.module('platejs/react', () => ({
  ...PlateReact,
  useEditorSelector: useEditorSelectorMock,
  useEditor: useEditorMock,
  useEditorRuntimeState: () => {},
  useFocusedLast: useFocusedLastMock,
  usePluginStore: usePluginStoreMock,
}));

mock.module('@/registry/components/editor/plugins-static', () => ({
  BaseEditorKit: [],
}));

mock.module('./editor-static', () => ({
  EditorStatic: () => null,
}));

mock.module('@/components/ui/button', () => ({
  Button: ({ children }: any) => <button type="button">{children}</button>,
}));

mock.module('@/components/ui/command', () => ({
  Command: ({ children }: any) => <div>{children}</div>,
  CommandGroup: ({ children }: any) => <div>{children}</div>,
  CommandItem: ({ children }: any) => <div>{children}</div>,
  CommandList: ({ children }: any) => <div>{children}</div>,
}));

mock.module('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverAnchor: () => <div />,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

mock.module('./ai-menu', () => ({
  AIChatEditor: () => <div />,
}));

describe('AIMenu slow contracts', () => {
  const originalSetTimeout = globalThis.setTimeout;
  beforeEach(() => {
    pluginMock.mockReset();
    useEditorSelectorMock.mockReset();
    useFocusedLastMock.mockReset();
    usePluginStoreMock.mockReset();
    useEditorMock.mockReset();
    toDOMNodeMock.mockReset();

    globalThis.setTimeout = ((callback: TimerHandler) => {
      if (typeof callback === 'function') callback();

      return 0 as unknown as ReturnType<typeof setTimeout>;
    }) as unknown as typeof setTimeout;

    useFocusedLastMock.mockReturnValue(false);
    const editor = {
      api: {
        dom: {
          resolveDOMNode: toDOMNodeMock,
        },
      },
      plugin: pluginMock,
      read: {
        nodes: {
          block: () => [
            { id: 'block', children: [{ text: 'text' }], type: 'paragraph' },
            [0],
          ],
          blocks: () => [],
          isEmpty: () => false,
        },
        selection: Object.assign(() => ({ kind: 'text' }), {
          isAtBlockEnd: () => false,
          isCollapsed: () => true,
          isExpanded: () => false,
          nodes: () => [],
        }),
      },
    } as unknown as PlateReact.Editor;

    useEditorMock.mockReturnValue(editor);
    useEditorSelectorMock.mockImplementation(
      (selector: (currentEditor: PlateReact.Editor) => unknown) =>
        selector(editor)
    );

    usePluginStoreMock.mockImplementation((_plugin: unknown, key: string) => {
      switch (key) {
        case 'mode': {
          return 'insert';
        }
        case 'toolName': {
          return null;
        }
        case 'streaming': {
          return true;
        }
        case 'open': {
          return false;
        }
        case 'chat': {
          return { messages: [], status: 'streaming' };
        }
        default:
      }

      return undefined;
    });

    pluginMock.mockReturnValue({
      api: {
        hide: () => {},
        node: () => {},
        show: () => {},
        stop: () => {},
        submit: async () => {},
      },
      editor,
      read: { node: () => null },
    });
  });

  afterAll(() => {
    globalThis.setTimeout = originalSetTimeout;
    mock.restore();
  });

  it('does not crash when streaming starts before the AI anchor exists', async () => {
    const { AIMenu } = await import(
      `./ai-menu?test=${Math.random().toString(36).slice(2)}`
    );

    expect(() => render(<AIMenu />)).not.toThrow();
    expect(toDOMNodeMock).not.toHaveBeenCalled();
  });

  it('hides the Comment command when no Comments provider is mounted', async () => {
    const { AIMenuItems } = await import(
      `./ai-menu?test=${Math.random().toString(36).slice(2)}`
    );
    const result = render(
      <AIMenuItems input="" setInput={() => {}} setValue={() => {}} />
    );

    expect(result.queryByText('Comment')).toBeNull();
    expect(result.getByText('Continue writing')).toBeTruthy();
  });
});
