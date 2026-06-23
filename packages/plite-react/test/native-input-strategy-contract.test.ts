import { Editor } from '@platejs/plite/internal';
import { IS_NODE_MAP_DIRTY } from '@platejs/plite-dom/internal';
import { canUseNativeSingleCharacterInput } from '../src/editable/native-input-strategy';
import { ReactEditor } from '../src/plugin/react-editor';
import { createReactEditor } from '../src/plugin/with-react';

const createFrameDocument = () => {
  const frame = document.createElement('iframe');
  document.body.append(frame);

  const frameDocument = frame.contentDocument;
  const frameWindow = frame.contentWindow;

  if (!frameDocument || !frameWindow) {
    throw new Error('Expected iframe document');
  }

  return { frame, frameDocument, frameWindow };
};

test('native anchor checks use the editor window NodeFilter realm', () => {
  const { frame, frameDocument, frameWindow } = createFrameDocument();
  const nodeFilterDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    'NodeFilter'
  );
  const textHost = frameDocument.createElement('span');
  const anchor = frameDocument.createElement('a');
  const text = frameDocument.createTextNode('ab');
  const editor = {
    read: vi.fn((callback) =>
      callback({
        marks: { get: () => null },
        view: { root: () => 'main' },
      })
    ),
  } as any;

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-dom-sync', 'true');
  anchor.append(text);
  textHost.append(anchor);
  frameDocument.body.append(textHost);

  Object.defineProperty(globalThis, 'NodeFilter', {
    configurable: true,
    value: undefined,
  });

  vi.spyOn(ReactEditor, 'resolveDOMPoint').mockReturnValue([text, 2]);
  vi.spyOn(ReactEditor, 'getWindow').mockReturnValue(frameWindow);
  vi.spyOn(ReactEditor, 'hasDOMNode').mockReturnValue(true);

  try {
    expect(() =>
      canUseNativeSingleCharacterInput({
        editor,
        eventData: 'x',
        hasAppInputPolicy: false,
        selection: {
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 2 },
        },
      })
    ).not.toThrow();
    expect(
      canUseNativeSingleCharacterInput({
        editor,
        eventData: 'x',
        hasAppInputPolicy: false,
        selection: {
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 2 },
        },
      })
    ).toBe(false);
  } finally {
    if (nodeFilterDescriptor) {
      Object.defineProperty(globalThis, 'NodeFilter', nodeFilterDescriptor);
    } else {
      delete (globalThis as { NodeFilter?: unknown }).NodeFilter;
    }
    frame.remove();
    vi.restoreAllMocks();
  }
});

test('native single-character input allows synced printable ASCII', () => {
  const textHost = document.createElement('span');
  const text = document.createTextNode('a');
  const editor = {
    read: vi.fn((callback) =>
      callback({
        marks: { get: () => null },
        view: { root: () => 'main' },
      })
    ),
  } as any;

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-dom-sync', 'true');
  textHost.append(text);
  document.body.append(textHost);

  vi.spyOn(ReactEditor, 'resolveDOMPoint').mockReturnValue([text, 1]);
  vi.spyOn(ReactEditor, 'getWindow').mockReturnValue(window);
  vi.spyOn(ReactEditor, 'hasDOMNode').mockReturnValue(false);

  try {
    expect(
      canUseNativeSingleCharacterInput({
        editor,
        eventData: '5',
        hasAppInputPolicy: false,
        selection: {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
      })
    ).toBe(true);
    expect(
      canUseNativeSingleCharacterInput({
        editor,
        eventData: 'ä',
        hasAppInputPolicy: false,
        selection: {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
      })
    ).toBe(false);
  } finally {
    textHost.remove();
    vi.restoreAllMocks();
  }
});

test('native single-character input keeps deferred dirty DOM bursts native on the same synced text host', () => {
  const editor = createReactEditor();
  const textHost = document.createElement('span');
  const text = document.createTextNode('XXalpha');

  Editor.replace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'Xalpha' }] }],
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-dom-sync', 'true');
  textHost.setAttribute('data-plite-path', '0,0');
  textHost.append(text);
  document.body.append(textHost);
  IS_NODE_MAP_DIRTY.set(editor, true);

  vi.spyOn(ReactEditor, 'resolveDOMPoint').mockReturnValue([text, 1]);
  vi.spyOn(ReactEditor, 'getWindow').mockReturnValue(window);
  vi.spyOn(ReactEditor, 'hasDOMNode').mockReturnValue(false);

  try {
    expect(
      canUseNativeSingleCharacterInput({
        allowDirtyDOMText: false,
        editor,
        eventData: '5',
        hasAppInputPolicy: false,
        selection: Editor.getSelection(editor),
      })
    ).toBe(false);
    expect(
      canUseNativeSingleCharacterInput({
        allowDirtyDOMText: true,
        editor,
        eventData: '5',
        hasAppInputPolicy: false,
        selection: Editor.getSelection(editor),
      })
    ).toBe(true);
  } finally {
    IS_NODE_MAP_DIRTY.delete(editor);
    textHost.remove();
    vi.restoreAllMocks();
  }
});

test('native single-character input rejects projected text hosts', () => {
  const textHost = document.createElement('span');
  const text = document.createTextNode('a');
  const editor = {
    read: vi.fn((callback) =>
      callback({
        marks: { get: () => null },
        view: { root: () => 'main' },
      })
    ),
  } as any;

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-dom-sync-reason', 'projection');
  textHost.append(text);
  document.body.append(textHost);

  vi.spyOn(ReactEditor, 'resolveDOMPoint').mockReturnValue([text, 1]);
  vi.spyOn(ReactEditor, 'getWindow').mockReturnValue(window);
  vi.spyOn(ReactEditor, 'hasDOMNode').mockReturnValue(false);

  try {
    expect(
      canUseNativeSingleCharacterInput({
        editor,
        eventData: 'x',
        hasAppInputPolicy: false,
        selection: {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
      })
    ).toBe(false);
  } finally {
    textHost.remove();
    vi.restoreAllMocks();
  }
});
