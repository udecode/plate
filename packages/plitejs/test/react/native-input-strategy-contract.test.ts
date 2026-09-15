import { createEditorView, type Value } from 'plitejs';
import { authored } from 'plitejs/authored';

import {
  IS_NODE_MAP_DIRTY,
  releaseDOMTextFlowRecordIndex,
  setDOMTextFlowRecordIndex,
} from '../../src/dom/internal';
import { replace as editorReplace } from '../../src/internal';
import { applyModelOwnedTextInput } from '../../src/react/editable/mutation-controller';
import {
  canUseNativeSingleCharacterInput,
  getNativeSingleCharacterInputDecision,
} from '../../src/react/editable/native-input-strategy';
import { createReactRuntimeViewEditor } from '../../src/react/hooks/use-plite-runtime';
import { ReactEditor } from '../../src/react/plugin/react-editor';
import { createEditor } from '../../src/react/plugin/with-react';
import { readTextSelection } from './read-text-selection';

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

test.each([
  { intent: 'edit', projection: 'accepted' },
  { intent: 'propose', projection: 'markup' },
] as const)(
  'routes pending marks through model input in an authored $intent view',
  (policy) => {
    const initialValue: Value = [
      { type: 'paragraph', children: [{ text: 'Seed' }] },
    ];
    const source = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue,
    });
    const editor = createReactRuntimeViewEditor(
      createEditorView(source, {
        authored: policy,
      })
    );
    editor.update.selection.set({ path: [0, 0], offset: 4 });
    editor.update.marks.toggle('bold');

    expect(source.read.marks()).toBeNull();
    expect(
      getNativeSingleCharacterInputDecision({
        editor,
        eventData: 'x',
        hasAppDOMInputPolicy: false,
        isCommandNativeEquivalent: () => true,
        selection: readTextSelection(editor),
      })
    ).toEqual({ blocker: 'active-marks', native: false });

    applyModelOwnedTextInput({
      data: 'x',
      editor,
      inputType: 'insertText',
      selection: readTextSelection(editor) ?? undefined,
    });
    expect(editor.read.children()).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'Seed' }, { text: 'x', bold: true }],
      },
    ]);

    editor.update.marks.toggle('bold');
    applyModelOwnedTextInput({
      data: 'y',
      editor,
      inputType: 'insertText',
      selection: readTextSelection(editor) ?? undefined,
    });
    expect(editor.read.children()).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'Seed' }, { text: 'x', bold: true }, { text: 'y' }],
      },
    ]);
  }
);

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
        marks: () => null,
        view: { root: () => 'main' },
      })
    ),
  } as any;

  textHost.setAttribute('data-editor-node', 'text');
  textHost.setAttribute('data-editor-dom-sync', 'true');
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
        hasAppDOMInputPolicy: false,
        isCommandNativeEquivalent: () => true,
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
        hasAppDOMInputPolicy: false,
        isCommandNativeEquivalent: () => true,
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
        marks: () => null,
        view: { root: () => 'main' },
      })
    ),
  } as any;

  textHost.setAttribute('data-editor-node', 'text');
  textHost.setAttribute('data-editor-dom-sync', 'true');
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
        hasAppDOMInputPolicy: false,
        isCommandNativeEquivalent: () => true,
        selection: {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
      })
    ).toBe(true);
    expect(
      canUseNativeSingleCharacterInput({
        editor,
        eventData: '5',
        hasAppDOMInputPolicy: false,
        isCommandNativeEquivalent: () => false,
        selection: {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
      })
    ).toBe(false);
    expect(
      canUseNativeSingleCharacterInput({
        editor,
        eventData: 'ä',
        hasAppDOMInputPolicy: false,
        isCommandNativeEquivalent: () => true,
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
  const editor = createEditor();
  const textHost = document.createElement('span');
  const text = document.createTextNode('XXalpha');

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'Xalpha' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  textHost.setAttribute('data-editor-node', 'text');
  textHost.setAttribute('data-editor-dom-sync', 'true');
  textHost.setAttribute('data-editor-path', '0,0');
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
        hasAppDOMInputPolicy: false,
        isCommandNativeEquivalent: () => true,
        selection: readTextSelection(editor),
      })
    ).toBe(false);
    expect(
      canUseNativeSingleCharacterInput({
        allowDirtyDOMText: true,
        editor,
        eventData: '5',
        hasAppDOMInputPolicy: false,
        isCommandNativeEquivalent: () => true,
        selection: readTextSelection(editor),
      })
    ).toBe(true);
  } finally {
    IS_NODE_MAP_DIRTY.delete(editor);
    textHost.remove();
    vi.restoreAllMocks();
  }
});

test('native input resolves a dirty retained-flow host through its private index', () => {
  const editor = createEditor();
  const textHost = document.createElement('span');
  const text = document.createTextNode('alpha');

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'alpha' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  textHost.setAttribute('data-editor-node', 'text');
  textHost.setAttribute('data-editor-dom-sync', 'true');
  textHost.append(text);
  document.body.append(textHost);
  setDOMTextFlowRecordIndex(textHost, {
    nodeKey: 'retained',
    path: [0, 0],
    segments: [
      {
        bindingHost: null,
        bindingRecord: null,
        domLength: 5,
        end: 5,
        start: 0,
        stringElement: null,
        text: 'alpha',
        textNode: text,
      },
    ],
    text: 'alpha',
  });
  IS_NODE_MAP_DIRTY.set(editor, true);

  vi.spyOn(ReactEditor, 'resolveDOMPoint').mockReturnValue([text, 1]);
  vi.spyOn(ReactEditor, 'getWindow').mockReturnValue(window);
  vi.spyOn(ReactEditor, 'hasDOMNode').mockReturnValue(false);

  try {
    const input = {
      editor,
      eventData: '5',
      hasAppDOMInputPolicy: false,
      isCommandNativeEquivalent: () => true,
      selection: readTextSelection(editor),
    };

    expect(canUseNativeSingleCharacterInput(input)).toBe(true);
    text.nodeValue = 'alXpha';
    expect(canUseNativeSingleCharacterInput(input)).toBe(false);
  } finally {
    IS_NODE_MAP_DIRTY.delete(editor);
    releaseDOMTextFlowRecordIndex(textHost, 'retained');
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
        marks: () => null,
        view: { root: () => 'main' },
      })
    ),
  } as any;

  textHost.setAttribute('data-editor-node', 'text');
  textHost.setAttribute('data-editor-dom-sync-reason', 'decoration');
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
        hasAppDOMInputPolicy: false,
        isCommandNativeEquivalent: () => true,
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
