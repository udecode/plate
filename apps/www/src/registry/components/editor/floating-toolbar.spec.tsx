import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { act, render } from '@testing-library/react';
import * as React from 'react';

const floatingUpdate = mock();
const setFloating = mock();
let floatingOptions: { onOpenChange: (open: boolean) => void };
let selectionExpanded = true;
let selectionRange: unknown;

const editor = {
  read: {
    lastCommit: () => null,
    selection: {
      isExpanded: () => selectionExpanded,
      primaryRange: () => selectionRange,
    },
    text: { string: () => (selectionExpanded ? 'selected' : '') },
  },
};

mock.module('@platejs/ai/react', () => ({
  AIChatPlugin: { name: 'aiChat' },
}));

mock.module('@platejs/basic-nodes/react', () => ({
  BoldPlugin: { name: 'bold' },
  CodePlugin: { name: 'code' },
  ItalicPlugin: { name: 'italic' },
  StrikethroughPlugin: { name: 'strikethrough' },
  UnderlinePlugin: { name: 'underline' },
}));

mock.module('@platejs/floating', () => ({
  flip: () => ({}),
  getSelectionBoundingClientRect: () => new DOMRect(),
  offset: () => ({}),
  useVirtualFloating: (options: typeof floatingOptions) => {
    floatingOptions = options;

    return {
      refs: { setFloating },
      style: {},
      update: floatingUpdate,
    };
  },
}));

mock.module('@udecode/cn', () => ({
  useComposedRef: () => mock(),
}));

mock.module('@udecode/react-utils', () => ({
  useComposedRef: () => mock(),
  useOnClickOutside: () => mock(),
  useStableFn: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

mock.module('@udecode/utils', () => ({
  isDefined: (value: unknown) => value !== undefined,
  mergeProps: (...values: object[]) => Object.assign({}, ...values),
}));

mock.module('platejs/react', () => ({
  definePlatePlugin: (name: string, definition: object) => ({
    ...definition,
    name,
  }),
  useEditor: () => editor,
  useEditorId: () => 'editor-1',
  useEditorReadOnly: () => false,
  useEditorSelector: (selector: (editor: any) => unknown) => selector(editor),
  useEventEditorValue: () => 'editor-1',
  usePluginStore: () => false,
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

mock.module('./link', () => ({
  linkPlugin: { name: 'link' },
}));

const ButtonStub = ({ children }: React.PropsWithChildren) => (
  <button>{children}</button>
);

mock.module('./ai-toolbar-button', () => ({ AIToolbarButton: ButtonStub }));
mock.module('./comment-toolbar-button', () => ({
  CommentToolbarButton: ButtonStub,
}));
mock.module('./equation-toolbar-button', () => ({
  InlineEquationToolbarButton: ButtonStub,
}));
mock.module('./link-toolbar-button', () => ({
  LinkToolbarButton: ButtonStub,
}));
mock.module('./mark-toolbar-button', () => ({ MarkToolbarButton: ButtonStub }));
mock.module('./more-toolbar-button', () => ({ MoreToolbarButton: ButtonStub }));
mock.module('./suggestion-toolbar-button', () => ({
  SuggestionToolbarButton: ButtonStub,
}));
mock.module('./turn-into-toolbar-button', () => ({
  TurnIntoToolbarButton: ButtonStub,
}));

mock.module('./toolbar', () => ({
  Toolbar: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  ToolbarButton: ({ children }: React.PropsWithChildren) => (
    <button>{children}</button>
  ),
  ToolbarGroup: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
}));

describe('FloatingToolbar', () => {
  beforeEach(() => {
    selectionExpanded = true;
    selectionRange = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    };
    floatingUpdate.mockClear();
    setFloating.mockClear();
  });

  afterAll(() => {
    mock.restore();
  });

  it('allows the same range to reopen after a collapsed selection lifecycle', async () => {
    const { FloatingToolbar } = await import(
      `./floating-toolbar?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<FloatingToolbar>toolbar</FloatingToolbar>);

    expect(view.getByText('toolbar')).toBeTruthy();

    act(() => floatingOptions.onOpenChange(false));
    expect(view.queryByText('toolbar')).toBeNull();

    selectionExpanded = false;
    selectionRange = null;
    view.rerender(<FloatingToolbar>toolbar</FloatingToolbar>);

    selectionExpanded = true;
    selectionRange = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    };
    view.rerender(<FloatingToolbar>toolbar</FloatingToolbar>);

    expect(view.getByText('toolbar')).toBeTruthy();
  });
});
