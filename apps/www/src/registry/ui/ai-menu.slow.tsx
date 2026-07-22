import * as React from 'react';

import { act, render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';
import type { PlateEditor } from 'platejs/react';

const useEditorChatMock = mock();
const useEditorPluginMock = mock();
const useLastAssistantMessageMock = mock();
const useIsSelectingMock = mock();
const useFocusedLastMock = mock();
const useHotkeysMock = mock();
const usePluginOptionMock = mock();
const useEditorMock = mock();
const toDOMNodeMock = mock();
const setBlockSelectionMock = mock();
const isAtBlockEndMock = mock();

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
  SUGGESTION_TRANSIENT_KEY: 'suggestion',
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
  ElementApi: {
    isElement: (node: unknown) =>
      !!node && typeof node === 'object' && 'children' in node,
  },
  KEYS: {},
  NodeApi: {},
  TextApi: {
    isText: () => false,
  },
  isHotkey: () => () => false,
}));

mock.module('platejs/react', () => ({
  useEditorPlugin: useEditorPluginMock,
  useEditor: useEditorMock,
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

describe('AIMenu slow contracts', () => {
  const originalSetTimeout = globalThis.setTimeout;

  beforeEach(() => {
    useEditorChatMock.mockReset();
    useEditorPluginMock.mockReset();
    useLastAssistantMessageMock.mockReset();
    useIsSelectingMock.mockReset();
    useFocusedLastMock.mockReset();
    useHotkeysMock.mockReset();
    usePluginOptionMock.mockReset();
    useEditorMock.mockReset();
    toDOMNodeMock.mockReset();
    setBlockSelectionMock.mockReset();
    isAtBlockEndMock.mockReset();

    globalThis.setTimeout = ((callback: TimerHandler) => {
      if (typeof callback === 'function') callback();

      return 0 as unknown as ReturnType<typeof setTimeout>;
    }) as unknown as typeof setTimeout;

    useEditorChatMock.mockImplementation(() => {});
    useLastAssistantMessageMock.mockReturnValue(undefined);
    useIsSelectingMock.mockReturnValue(false);
    useFocusedLastMock.mockReturnValue(false);
    useHotkeysMock.mockImplementation(() => {});
    const editor = {
      api: {
        dom: {
          resolveDOMNode: toDOMNodeMock,
        },
      },
      plugin: () => ({ api: { set: setBlockSelectionMock } }),
      read: {
        nodes: {
          block: () => [
            { id: 'block', children: [{ text: 'text' }], type: 'p' },
            [0],
          ],
          isEmpty: () => false,
        },
        selection: {
          isAtBlockEnd: isAtBlockEndMock,
        },
      },
    } as unknown as PlateEditor;

    useEditorMock.mockReturnValue(editor);

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
        hide: () => {},
        node: () => {},
        show: () => {},
        stop: () => {},
        submit: async () => {},
      },
      editor,
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

  it('selects the current non-empty block when the cursor is not at its end', async () => {
    isAtBlockEndMock.mockReturnValue(false);
    toDOMNodeMock.mockReturnValue(document.createElement('div'));
    const { AIMenu } = await import(
      `./ai-menu?test=${Math.random().toString(36).slice(2)}`
    );

    render(<AIMenu />);
    act(() => useEditorChatMock.mock.calls[0][0].onOpenCursor());

    expect(setBlockSelectionMock).toHaveBeenCalledWith('block');
  });

  it('keeps block selection clear when the cursor is at its block end', async () => {
    isAtBlockEndMock.mockReturnValue(true);
    toDOMNodeMock.mockReturnValue(document.createElement('div'));
    const { AIMenu } = await import(
      `./ai-menu?test=${Math.random().toString(36).slice(2)}`
    );

    render(<AIMenu />);
    act(() => useEditorChatMock.mock.calls[0][0].onOpenCursor());

    expect(setBlockSelectionMock).not.toHaveBeenCalled();
  });
});
