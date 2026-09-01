import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { render, waitFor } from '@testing-library/react';
import * as actualCoreReact from 'platejs/react';
import * as React from 'react';

const createPlateEditorMock = mock();
const overlayPositionsMock = mock();
const EditorContext = React.createContext<any>(null);

let currentOverlayEditor: any;
let currentPositions: any[] = [];
let editableRef: React.RefObject<HTMLDivElement | null>;

mock.module('platejs/react', () => ({
  ...actualCoreReact,
  createEditor: (options: any) => {
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
    const historySnapshot = { redos: [], revision: 0, undos: [] };
    const editor = {
      id: options.id,
      provider: yjsPlugin.initialState.provider,
      read: {
        history: Object.assign(() => historySnapshot, {
          redos: () => [],
          undos: () => [],
        }),
      },
      subscribeCommit: () => () => {},
      update,
    };

    createPlateEditorMock(options, editor);

    return editor;
  },
  Plate: ({ children, editor }: React.PropsWithChildren<{ editor: any }>) => (
    <EditorContext value={editor}>{children}</EditorContext>
  ),
  useEditor: () => React.useContext(EditorContext) ?? currentOverlayEditor,
}));

mock.module('platejs/yjs/react', () => ({
  YjsPlugin: {
    configure: ({ initialState, render: renderSlots }: any) => ({
      initialState,
      name: 'yjs',
      render: renderSlots,
    }),
  },
  useYjsRemoteCursor: (_editor: unknown, clientId: number) =>
    currentPositions.find((position) => position.clientId === clientId)
      ?.cursor ?? null,
  useYjsRemoteCursorGeometry: (
    _editor: unknown,
    clientId: number,
    options: { editableRef: React.RefObject<HTMLElement | null> }
  ) =>
    options.editableRef.current
      ? (currentPositions.find((position) => position.clientId === clientId)
          ?.geometry ?? null)
      : null,
  useYjsRemoteCursorIds: (editor: unknown) => {
    overlayPositionsMock(editor);

    return currentPositions.map((position) => position.clientId);
  },
  useYjsProviderStatus: (editor: any) => editor.provider.status,
  useYjsProviderSynced: (editor: any) => editor.provider.synced,
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
  RemoteCursorLeaf: () => <span data-remote-cursor-leaf="" />,
  RemoteCursorOverlay: () => <div data-remote-cursor-overlay="" />,
}));

describe('CollaborativeEditingDemo', () => {
  beforeEach(() => {
    createPlateEditorMock.mockClear();
    overlayPositionsMock.mockClear();
    currentPositions = [];
    currentOverlayEditor = {};
    editableRef = { current: document.createElement('div') };
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
    for (const [options] of createPlateEditorMock.mock.calls) {
      const yjsPlugin = options.plugins.find(
        (plugin: any) => plugin.name === 'yjs'
      );

      expect(yjsPlugin.render.afterEditable).toBeDefined();
      expect(yjsPlugin.render.leaf).toBeDefined();
    }

    expect(() => view.unmount()).not.toThrow();
    expect(providers[0].listenerCount()).toBe(0);
    expect(providers[1].listenerCount()).toBe(0);
  });

  it('renders remote carets from focus geometry', async () => {
    currentPositions = [
      {
        clientId: 101,
        cursor: {
          data: { color: '#7C3AED', name: 'Ada' },
          selection: {
            anchor: { offset: 2, path: [0, 0] },
            focus: { offset: 2, path: [0, 0] },
          },
        },
        geometry: {
          boundingRect: { height: 12, left: 50, top: 75, width: 0 },
          focusRect: { height: 12, left: 50, top: 75, width: 0 },
          rects: [],
        },
      },
      {
        clientId: 202,
        cursor: {
          data: { color: '#0891B2', name: 'Lin' },
          selection: {
            anchor: { offset: 1, path: [0, 0] },
            focus: { offset: 4, path: [0, 0] },
          },
        },
        geometry: {
          boundingRect: { height: 18, left: 90, top: 120, width: 30 },
          focusRect: { height: 18, left: 120, top: 120, width: 0 },
          rects: [{ height: 18, left: 90, top: 120, width: 30 }],
        },
      },
    ];

    const { RemoteCursorOverlay } = await import(
      `../components/editor/remote-cursor-overlay?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<RemoteCursorOverlay editableRef={editableRef} />);
    const adaCaret = view.container.querySelector(
      '[data-remote-caret][data-client-id="101"]'
    );
    const linCaret = view.container.querySelector(
      '[data-remote-caret][data-client-id="202"]'
    );
    expect(overlayPositionsMock).toHaveBeenCalledWith(currentOverlayEditor);
    expect(view.container.querySelector('[data-remote-selection]')).toBeNull();
    expect(adaCaret?.getAttribute('style')).toContain('left: 50px');
    expect(adaCaret?.getAttribute('style')).toContain('top: 75px');
    expect(adaCaret?.getAttribute('style')).toContain('height: 16px');
    expect(adaCaret?.textContent).toBe('Ada');
    expect(linCaret?.getAttribute('style')).toContain('left: 120px');
    expect(linCaret?.textContent).toBe('Lin');
  });

  it('skips unresolved cursors and sanitizes copied cursor data', async () => {
    currentPositions = [
      {
        clientId: 2,
        cursor: {
          data: { color: 'red', name: '   ' },
          selection: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 0, path: [0, 0] },
          },
        },
        geometry: {
          boundingRect: { height: 20, left: 30, top: 40, width: 0 },
          focusRect: { height: 20, left: 30, top: 40, width: 0 },
          rects: [],
        },
      },
      {
        clientId: 3,
        cursor: {
          data: { color: '#FFFFFF', name: 'Deleted' },
          selection: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 0, path: [0, 0] },
          },
        },
        geometry: null,
      },
    ];

    const { RemoteCursorOverlay } = await import(
      `../components/editor/remote-cursor-overlay?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<RemoteCursorOverlay editableRef={editableRef} />);
    const caret = view.container.querySelector(
      '[data-remote-caret][data-client-id="2"]'
    );

    expect(caret?.getAttribute('style')).toContain('background-color: #DB2777');
    expect(caret?.textContent).toBe('Guest 2');
    expect(view.container.querySelector('[data-client-id="3"]')).toBeNull();
  });

  it('renders no cursors until the exact Editable is mounted', async () => {
    editableRef = { current: null };
    currentPositions = [
      {
        clientId: 2,
        cursor: {
          selection: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 0, path: [0, 0] },
          },
        },
        geometry: {
          focusRect: { height: 20, left: 30, top: 40, width: 0 },
          rects: [],
        },
      },
    ];

    const { RemoteCursorOverlay } = await import(
      `../components/editor/remote-cursor-overlay?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<RemoteCursorOverlay editableRef={editableRef} />);

    expect(view.container.querySelector('[data-remote-caret]')).toBeNull();
  });
});
