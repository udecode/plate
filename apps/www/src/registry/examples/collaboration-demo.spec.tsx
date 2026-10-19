import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { fireEvent, render, waitFor } from '@testing-library/react';
import * as actualCoreReact from 'platejs/react';
import * as React from 'react';

const createPlateEditorMock = mock();
const collaborationCreateMock = mock((options: any) => ({
  name: 'yjs',
  options,
}));
const yjsMock = mock((options: any) => ({ name: 'yjs', options }));
const overlayPositionsMock = mock();
const EditorContext = React.createContext<any>(null);
let currentOverlayEditor: any;
let currentPositions: any[] = [];
let editableRef: React.RefObject<HTMLDivElement | null>;

mock.module('platejs/react', () => ({
  ...actualCoreReact,
  createEditor: (options: any) => {
    const update = Object.assign(
      (callback: (tx: any) => void) => callback({}),
      {
        history: {
          redo: () => {},
          undo: () => {},
        },
      }
    );
    const historySnapshot = { redos: [], revision: 0, undos: [] };
    const state = {
      history: Object.assign(() => historySnapshot, {
        redos: () => [],
        undos: () => [],
      }),
    };
    const editor = {
      api: {
        yjs: {
          admissionStatus: () => ({ state: 'ready' }),
          clearSelection: mock(),
          retryImport: mock(),
          setCursorData: mock(),
          syncSelection: mock(),
        },
      },
      id: options.id,
      install: mock(() => () => {}),
      read: Object.assign(
        (callback: (value: typeof state) => unknown) => callback(state),
        state
      ),
      subscribeCommit: () => () => {},
      update,
    };

    createPlateEditorMock(options, editor);

    return editor;
  },
  EditorRoot: ({
    children,
    editor,
  }: React.PropsWithChildren<{ editor: any }>) => (
    <EditorContext value={editor}>{children}</EditorContext>
  ),
  useEditor: () => React.useContext(EditorContext) ?? currentOverlayEditor,
}));

mock.module('platejs/yjs/react', () => ({
  YjsPlugin: {
    require: () => ({
      map: () => ({ create: collaborationCreateMock }),
    }),
  },
  useYjsAdmissionStatus: () => ({ state: 'ready' }),
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
}));

mock.module('platejs/yjs', () => ({
  yjs: yjsMock,
}));

mock.module('@/registry/components/editor/basic-nodes', () => ({
  BasicNodesKit: [],
}));

mock.module('@/registry/components/editor/editor', () => ({
  Editor: ({
    'aria-busy': ariaBusy,
    'aria-label': ariaLabel,
    readOnly,
  }: {
    'aria-busy'?: boolean;
    'aria-label': string;
    readOnly?: boolean;
  }) => (
    <div
      aria-busy={ariaBusy}
      aria-label={ariaLabel}
      contentEditable={!readOnly}
      data-read-only={readOnly ? '' : undefined}
    />
  ),
  EditorContainer: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
}));

mock.module('@/registry/components/editor/remote-cursor-overlay', () => ({
  CollaborationPlugin: { create: collaborationCreateMock },
  RemoteCursorOverlay: () => <div data-remote-cursor-overlay="" />,
}));

describe('CollaborativeEditingDemo', () => {
  beforeEach(() => {
    createPlateEditorMock.mockClear();
    collaborationCreateMock.mockClear();
    yjsMock.mockClear();
    overlayPositionsMock.mockClear();
    currentPositions = [];
    currentOverlayEditor = {};
    editableRef = { current: document.createElement('div') };
  });

  afterAll(() => {
    mock.restore();
  });

  it('preseeds one central room before binding two independent peers', async () => {
    const { default: CollaborativeEditingDemo } = await import(
      `./collaboration-demo?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<CollaborativeEditingDemo />);

    await waitFor(() => {
      expect(
        view.container.querySelector('[data-collaboration-demo]')
      ).not.toBeNull();
    });

    expect(createPlateEditorMock).toHaveBeenCalledTimes(3);
    expect(collaborationCreateMock).toHaveBeenCalledTimes(2);
    expect(yjsMock).toHaveBeenCalledTimes(1);

    const [adaCall, linCall] = collaborationCreateMock.mock.calls;
    const seed = yjsMock.mock.calls[0][0];
    const ada = adaCall[0];
    const lin = linCall[0];

    expect(seed.seed).toBe(true);
    expect(seed.initialReady).toBe(true);
    expect(seed.awareness).toBeUndefined();
    expect(ada.seed).toBeUndefined();
    expect(lin.seed).toBeUndefined();
    expect(ada.doc).not.toBe(lin.doc);
    expect(seed.doc).not.toBe(ada.doc);
    expect(seed.doc).not.toBe(lin.doc);
    expect(ada.awareness.doc).toBe(ada.doc);
    expect(lin.awareness.doc).toBe(lin.doc);
    expect(view.container.querySelectorAll('[data-peer]')).toHaveLength(2);
    expect(
      view.container.querySelectorAll('[data-admission-status="ready"]')
    ).toHaveLength(2);

    ada.awareness.setLocalStateField('data', { name: 'Ada' });
    lin.awareness.setLocalStateField('data', { name: 'Lin' });
    expect(ada.awareness.getStates().has(202)).toBe(true);
    expect(lin.awareness.getStates().has(101)).toBe(true);

    const adaCard = view.container.querySelector('[data-peer="ada"]');
    const connectionButton = () =>
      adaCard?.querySelector<HTMLButtonElement>('[data-connection-action]');

    fireEvent.click(connectionButton()!);
    expect(ada.awareness.getStates().has(202)).toBe(false);
    expect(lin.awareness.getStates().has(101)).toBe(false);
    await waitFor(() => {
      expect(connectionButton()?.dataset.connectionAction).toBe('connect');
    });

    fireEvent.click(connectionButton()!);
    await waitFor(() => {
      expect(connectionButton()?.dataset.connectionAction).toBe('disconnect');
    });
    expect(ada.awareness.getStates().has(202)).toBe(true);
    expect(lin.awareness.getStates().has(101)).toBe(true);
    expect(() => view.unmount()).not.toThrow();
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
      `../components/editor/remote-cursor-overlay?test=${Math.random()
        .toString(36)
        .slice(2)}`
    );
    const view = render(
      <RemoteCursorOverlay
        editableRef={editableRef}
        editor={currentOverlayEditor}
      />
    );
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
      `../components/editor/remote-cursor-overlay?test=${Math.random()
        .toString(36)
        .slice(2)}`
    );
    const view = render(
      <RemoteCursorOverlay
        editableRef={editableRef}
        editor={currentOverlayEditor}
      />
    );
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
      `../components/editor/remote-cursor-overlay?test=${Math.random()
        .toString(36)
        .slice(2)}`
    );
    const view = render(
      <RemoteCursorOverlay
        editableRef={editableRef}
        editor={currentOverlayEditor}
      />
    );

    expect(view.container.querySelector('[data-remote-caret]')).toBeNull();
  });
});
