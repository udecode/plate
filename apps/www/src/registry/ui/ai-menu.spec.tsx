import * as React from 'react';

import { render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const useEditorChatMock = mock();
const useEditorPluginMock = mock();
const useLastAssistantMessageMock = mock();
const useIsSelectingMock = mock();
const useFocusedLastMock = mock();
const useHotkeysMock = mock();
const usePluginOptionMock = mock();
const useEditorRefMock = mock();
const toDOMNodeMock = mock();

const Icon = () => <div />;

mock.module('@platejs/ai/react', () => ({
  AIChatPlugin: {},
  AIPlugin: {},
  useEditorChat: useEditorChatMock,
  useLastAssistantMessage: useLastAssistantMessageMock,
}));

mock.module('@platejs/comment', () => ({
  getTransientCommentKey: () => 'comment',
}));

mock.module('@platejs/selection/react', () => ({
  BlockSelectionPlugin: {},
  useIsSelecting: useIsSelectingMock,
}));

mock.module('@platejs/suggestion', () => ({
  getTransientSuggestionKey: () => 'suggestion',
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
  KEYS: {},
  NodeApi: {},
  TextApi: {},
  isHotkey: () => () => false,
}));

mock.module('platejs/react', () => ({
  useEditorPlugin: useEditorPluginMock,
  useEditorRef: useEditorRefMock,
  useFocusedLast: useFocusedLastMock,
  useHotkeys: useHotkeysMock,
  usePluginOption: usePluginOptionMock,
}));

mock.module('@/components/ui/button', () => ({
  Button: ({ children }: any) => <button>{children}</button>,
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

mock.module('@/registry/components/editor/plugins/comment-kit', () => ({
  commentPlugin: {},
}));

mock.module('./ai-chat-editor', () => ({
  AIChatEditor: () => <div />,
}));

describe('AIMenu', () => {
  const originalSetTimeout = globalThis.setTimeout;

  beforeEach(() => {
    useEditorChatMock.mockReset();
    useEditorPluginMock.mockReset();
    useLastAssistantMessageMock.mockReset();
    useIsSelectingMock.mockReset();
    useFocusedLastMock.mockReset();
    useHotkeysMock.mockReset();
    usePluginOptionMock.mockReset();
    useEditorRefMock.mockReset();
    toDOMNodeMock.mockReset();

    globalThis.setTimeout = ((callback: (...args: any[]) => void) => {
      callback();

      return 0 as any;
    }) as typeof setTimeout;

    useEditorChatMock.mockImplementation(() => {});
    useLastAssistantMessageMock.mockReturnValue(undefined);
    useIsSelectingMock.mockReturnValue(false);
    useFocusedLastMock.mockReturnValue(false);
    useHotkeysMock.mockImplementation(() => {});
    useEditorRefMock.mockReturnValue({
      api: {
        marks: () => ({}),
      },
      getApi: () => ({
        aiChat: {
          hide: () => {},
          reload: () => {},
          stop: () => {},
          submit: async () => {},
        },
      }),
      getOptions: () => ({
        aiEditor: null,
        mode: 'insert',
        toolName: null,
      }),
      getTransforms: () => ({
        ai: {
          undo: () => {},
        },
        aiChat: {
          accept: () => {},
          hide: () => {},
          replaceSelection: () => {},
        },
      }),
      selection: null,
      tf: {
        focus: () => {},
        unsetNodes: () => {},
      },
    });

    usePluginOptionMock.mockImplementation(
      (_plugin: unknown, option: string) => {
        switch (option) {
          case 'mode':
            return 'insert';
          case 'toolName':
            return null;
          case 'streaming':
            return true;
          case 'open':
            return false;
          case 'chat':
            return { messages: [], status: 'streaming' };
          default:
            return;
        }
      }
    );

    useEditorPluginMock.mockReturnValue({
      api: {
        aiChat: {
          hide: () => {},
          node: () => {},
          show: () => {},
          stop: () => {},
          submit: async () => {},
        },
      },
      editor: {
        api: {
          toDOMNode: toDOMNodeMock,
        },
      },
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
});
