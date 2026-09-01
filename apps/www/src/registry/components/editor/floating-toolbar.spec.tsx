import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { act, render } from '@testing-library/react';
import * as React from 'react';

let clickOutside: () => void;
const floatingUpdate = mock();
const setFloating = mock();
const useWidgetFloatingMock = mock();
let floatingOptions: { onOpenChange: (open: boolean) => void };
let editorFocused = true;
let selectedNodeCount = 0;
let selectionExpanded = true;
let selectionRange: unknown;
let toolbarOverlayOpenChange: (open: boolean) => void;
const editableRef = { current: document.createElement('div') };

const selection = Object.assign(() => selectionRange, {
  isExpanded: () => selectionExpanded,
  nodes: () => Array.from({ length: selectedNodeCount }),
});

const editor = {
  read: {
    lastCommit: () => null,
    selection,
    text: { string: () => (selectionExpanded ? 'selected' : '') },
    view: { isFocused: () => editorFocused },
  },
};

mock.module('platejs/ai/react', () => ({
  AIChatPlugin: { name: 'aiChat' },
}));

mock.module('platejs/react', () => ({
  BoldPlugin: { name: 'bold' },
  CodePlugin: { name: 'code' },
  definePlatePlugin: (name: string, definition: object) => ({
    ...definition,
    name,
  }),
  ItalicPlugin: { name: 'italic' },
  StrikethroughPlugin: { name: 'strikethrough' },
  UnderlinePlugin: { name: 'underline' },
  useEditor: () => editor,
  useEditorFocused: () => editorFocused,
  useEditorId: () => 'editor-1',
  useEditorReadOnly: () => false,
  useEditorSelector: (
    selector: (editor: any, previous?: unknown) => unknown
  ) => {
    const previousRef = React.useRef<unknown>(undefined);
    const value = selector(editor, previousRef.current);

    previousRef.current = value;

    return value;
  },
  usePluginStore: () => false,
  useComposedRef: () => mock(),
  useSelectionGeometry: () => ({
    boundingRect: new DOMRect(),
    focusRect: null,
    rects: [],
  }),
}));

mock.module('@floating-ui/react', () => ({
  flip: () => ({}),
  offset: () => ({}),
}));

mock.module('@/registry/hooks/use-widget-floating', () => ({
  useWidgetFloating: (_geometry: unknown, options: typeof floatingOptions) => {
    floatingOptions = options;
    useWidgetFloatingMock(options);

    return {
      refs: { setFloating },
      style: {},
      update: floatingUpdate,
    };
  },
}));

mock.module('@/registry/hooks/use-on-click-outside', () => ({
  useOnClickOutside: (callback: () => void) => {
    clickOutside = callback;

    return mock();
  },
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

mock.module('./link', () => ({
  linkPlugin: { name: 'link' },
}));

const ButtonStub = ({ children }: React.PropsWithChildren) => (
  <button type="button">{children}</button>
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

mock.module('@/registry/components/editor/toolbar', () => ({
  Toolbar: ({
    children,
    onOverlayOpenChange,
    ...props
  }: React.ComponentProps<'div'> & {
    onOverlayOpenChange?: (open: boolean) => void;
  }) => {
    toolbarOverlayOpenChange = onOverlayOpenChange ?? (() => {});

    return <div {...props}>{children}</div>;
  },
  ToolbarButton: ({ children }: React.PropsWithChildren) => (
    <button type="button">{children}</button>
  ),
  ToolbarGroup: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
}));

describe('FloatingToolbar', () => {
  beforeEach(() => {
    editorFocused = true;
    selectedNodeCount = 0;
    selectionExpanded = true;
    selectionRange = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    };
    floatingUpdate.mockClear();
    setFloating.mockClear();
    useWidgetFloatingMock.mockClear();
  });

  afterAll(() => {
    mock.restore();
  });

  it('is a complete afterEditable component by default', async () => {
    const { FloatingToolbar, FloatingToolbarPlugin } = await import(
      `./floating-toolbar?test=${Math.random().toString(36).slice(2)}`
    );

    expect(FloatingToolbarPlugin.render.afterEditable).toBe(FloatingToolbar);

    const view = render(<FloatingToolbar editableRef={editableRef} />);

    expect(view.getByText('Ask AI')).toBeTruthy();
  });

  it('does not mount text toolbar work for node selections', async () => {
    selectedNodeCount = 2;

    const { FloatingToolbar } = await import(
      `./floating-toolbar?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <FloatingToolbar editableRef={editableRef}>toolbar</FloatingToolbar>
    );

    expect(view.queryByText('toolbar')).toBeNull();
    expect(useWidgetFloatingMock).not.toHaveBeenCalled();
  });

  it('allows the same range to reopen after a collapsed selection lifecycle', async () => {
    const { FloatingToolbar } = await import(
      `./floating-toolbar?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <FloatingToolbar editableRef={editableRef}>toolbar</FloatingToolbar>
    );

    expect(view.getByText('toolbar')).toBeTruthy();

    act(() => floatingOptions.onOpenChange(false));
    expect(view.queryByText('toolbar')).toBeNull();

    selectionExpanded = false;
    selectionRange = null;
    view.rerender(
      <FloatingToolbar editableRef={editableRef}>toolbar</FloatingToolbar>
    );

    selectionExpanded = true;
    selectionRange = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    };
    view.rerender(
      <FloatingToolbar editableRef={editableRef}>toolbar</FloatingToolbar>
    );

    expect(view.getByText('toolbar')).toBeTruthy();
  });

  it('opens after local editor focus returns from a collapsed popover selection', async () => {
    const { FloatingToolbar } = await import(
      `./floating-toolbar?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <FloatingToolbar editableRef={editableRef}>toolbar</FloatingToolbar>
    );

    expect(view.getByText('toolbar')).toBeTruthy();

    editorFocused = false;
    selectionExpanded = false;
    selectionRange = {
      anchor: { offset: 4, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    };
    view.rerender(
      <FloatingToolbar editableRef={editableRef}>toolbar</FloatingToolbar>
    );

    expect(view.queryByText('toolbar')).toBeNull();

    editorFocused = true;
    view.rerender(
      <FloatingToolbar editableRef={editableRef}>toolbar</FloatingToolbar>
    );

    expect(view.queryByText('toolbar')).toBeNull();

    selectionExpanded = true;
    selectionRange = {
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 9, path: [0, 0] },
    };
    view.rerender(
      <FloatingToolbar editableRef={editableRef}>toolbar</FloatingToolbar>
    );

    expect(view.getByText('toolbar')).toBeTruthy();
  });

  it('keeps an owned toolbar interaction open across editor blur', async () => {
    const { FloatingToolbar } = await import(
      `./floating-toolbar?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <FloatingToolbar editableRef={editableRef}>
        <button type="button">toolbar action</button>
      </FloatingToolbar>
    );

    act(() => toolbarOverlayOpenChange(true));

    editorFocused = false;
    view.rerender(
      <FloatingToolbar editableRef={editableRef}>
        <button type="button">toolbar action</button>
      </FloatingToolbar>
    );

    expect(view.getByText('toolbar action')).toBeTruthy();

    act(() => clickOutside());

    expect(view.queryByText('toolbar action')).toBeNull();
  });
});
