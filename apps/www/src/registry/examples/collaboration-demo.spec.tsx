import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import * as actualCoreReact from '@platejs/core/react';
import { render, waitFor } from '@testing-library/react';
import * as React from 'react';

const createPlateEditorMock = mock();
const overlayPositionsMock = mock();
const EditorContext = React.createContext<any>(null);

let currentOverlayEditor: any;
let currentPositions: any[] = [];

mock.module('platejs/react', () => ({
  ...actualCoreReact,
  createPlateEditor: (options: any) => {
    const yjsPlugin = options.plugins.find(
      (plugin: any) => plugin?.name === 'yjs'
    );
    const update = Object.assign(
      (callback: (tx: any) => void) =>
        callback({
          yjs: {
            connect: () => {},
            disconnect: () => {},
            sendCursorData: () => {},
          },
        }),
      {
        history: {
          redo: () => {},
          undo: () => {},
        },
        yjs: {
          connect: () => {},
          disconnect: () => {},
          sendCursorData: () => {},
        },
      }
    );
    const editor = {
      id: options.id,
      provider: yjsPlugin.initialState.provider,
      read: {
        history: {
          redos: () => [],
          undos: () => [],
        },
      },
      update,
    };

    createPlateEditorMock(options, editor);

    return editor;
  },
  Plate: ({ children, editor }: React.PropsWithChildren<{ editor: any }>) => (
    <EditorContext value={editor}>{children}</EditorContext>
  ),
  useEditor: () => React.useContext(EditorContext) ?? currentOverlayEditor,
  useEditorScrollElement: (editor: any) => editor.api.dom.scroll(),
  useEditorSelector: (selector: (editor: unknown) => unknown) =>
    selector(React.useContext(EditorContext)),
}));

mock.module('@platejs/yjs/react', () => ({
  useYjsRemoteCursorOverlayPositions: (editor: unknown) => {
    overlayPositionsMock(editor);

    return [currentPositions];
  },
  useYjsProviderStatus: (editor: any) => editor.provider.status,
  useYjsProviderSynced: (editor: any) => editor.provider.synced,
  YjsPlugin: {
    configure: ({ initialState }: any) => ({ initialState, name: 'yjs' }),
  },
}));

mock.module('@/registry/components/editor/basic-nodes', () => ({
  BasicNodesKit: [],
}));

mock.module('@/registry/components/editor/editor', () => ({
  Editor: ({ 'aria-label': ariaLabel }: { 'aria-label': string }) => (
    <div aria-label={ariaLabel} contentEditable />
  ),
  EditorContainer: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
}));

mock.module('@/registry/components/editor/remote-cursor-overlay', () => ({
  RemoteCursorOverlay: () => <div data-remote-cursor-overlay="" />,
}));

describe('CollaborativeEditingDemo', () => {
  beforeEach(() => {
    createPlateEditorMock.mockClear();
    overlayPositionsMock.mockClear();
    currentPositions = [];
    const scrollElement = {
      getBoundingClientRect: () => ({ left: 10, top: 20 }),
      scrollLeft: 8,
      scrollTop: 5,
    };
    currentOverlayEditor = {
      api: {
        dom: {
          scroll: () => scrollElement,
        },
      },
    };
  });

  afterAll(() => {
    mock.restore();
  });

  it('creates two independent providers and destroys every room listener', async () => {
    const { default: CollaborativeEditingDemo } = await import(
      `./collaboration-demo?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<CollaborativeEditingDemo />);

    await waitFor(() => {
      expect(
        view.container.querySelector('[data-collaboration-demo]')
      ).not.toBeNull();
    });

    expect(createPlateEditorMock).toHaveBeenCalledTimes(2);

    const editors = createPlateEditorMock.mock.calls.map((call) => call[1]);
    const providers = editors.map((editor) => editor.provider);

    expect(editors[0]).not.toBe(editors[1]);
    expect(providers[0]).not.toBe(providers[1]);
    expect(providers[0].doc).not.toBe(providers[1].doc);
    expect(providers[0].listenerCount()).toBeGreaterThan(0);
    expect(providers[1].listenerCount()).toBeGreaterThan(0);
    expect(view.container.querySelectorAll('[data-peer]')).toHaveLength(2);

    expect(() => view.unmount()).not.toThrow();
    expect(providers[0].listenerCount()).toBe(0);
    expect(providers[1].listenerCount()).toBe(0);
  });

  it('renders remote carets and selections in the editor scroll space', async () => {
    currentPositions = [
      {
        clientId: 101,
        cursor: { data: { color: '#7C3AED', name: 'Ada' } },
        range: {
          anchor: { offset: 2, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
        rect: { height: 12, left: 50, top: 75, width: 10 },
      },
      {
        clientId: 202,
        cursor: { data: { color: '#0891B2', name: 'Lin' } },
        range: {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        },
        rect: { height: 18, left: 90, top: 120, width: 30 },
      },
    ];

    const { RemoteCursorOverlay } = await import(
      `../components/editor/remote-cursor-overlay?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<RemoteCursorOverlay />);
    const adaCaret = view.container.querySelector(
      '[data-remote-caret][data-client-id="101"]'
    );
    const linCaret = view.container.querySelector(
      '[data-remote-caret][data-client-id="202"]'
    );
    const linSelection = view.container.querySelector(
      '[data-remote-selection][data-client-id="202"]'
    );

    expect(overlayPositionsMock).toHaveBeenCalledWith(currentOverlayEditor);
    expect(
      view.container.querySelector(
        '[data-remote-selection][data-client-id="101"]'
      )
    ).toBeNull();
    expect(adaCaret?.getAttribute('style')).toContain('left: 48px');
    expect(adaCaret?.getAttribute('style')).toContain('top: 60px');
    expect(adaCaret?.getAttribute('style')).toContain('height: 16px');
    expect(adaCaret?.textContent).toBe('Ada');
    expect(linSelection?.getAttribute('style')).toContain('left: 88px');
    expect(linSelection?.getAttribute('style')).toContain('width: 30px');
    expect(linCaret?.getAttribute('style')).toContain('left: 118px');
    expect(linCaret?.textContent).toBe('Lin');
  });

  it('skips unresolved cursors and sanitizes copied cursor data', async () => {
    currentPositions = [
      {
        clientId: 2,
        cursor: { data: { color: 'red', name: '   ' } },
        range: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
        rect: { height: 20, left: 30, top: 40, width: 0 },
      },
      {
        clientId: 3,
        cursor: { data: { color: '#FFFFFF', name: 'Deleted' } },
        range: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
        rect: null,
      },
    ];

    const { RemoteCursorOverlay } = await import(
      `../components/editor/remote-cursor-overlay?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<RemoteCursorOverlay />);
    const caret = view.container.querySelector(
      '[data-remote-caret][data-client-id="2"]'
    );

    expect(caret?.getAttribute('style')).toContain('background-color: #DB2777');
    expect(caret?.textContent).toBe('Guest 2');
    expect(view.container.querySelector('[data-client-id="3"]')).toBeNull();
  });

  it('renders no overlay until the editor scroll container is mounted', async () => {
    currentOverlayEditor.api.dom.scroll = () => null;

    const { RemoteCursorOverlay } = await import(
      `../components/editor/remote-cursor-overlay?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<RemoteCursorOverlay />);

    expect(view.container.innerHTML).toBe('');
  });
});
