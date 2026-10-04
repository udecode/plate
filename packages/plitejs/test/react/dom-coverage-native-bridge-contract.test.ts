import {
  type Value,
  type TextSelection,
  createEditorView,
  NodeApi,
  SelectionApi,
  defineEditorSchema,
  type Descendant,
  type Range,
  schema,
  setEditorReadOnly,
} from 'plitejs';
import type { ClipboardEvent, DragEvent } from 'react';

import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  IS_FOCUSED,
  NODE_TO_ELEMENT,
} from '../../src/dom/internal';
import { readDropIndicator } from '../../src/dom/utils/drop-indicator';
import {
  getNodeKey as editorGetNodeKey,
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
  string as editorString,
} from '../../src/internal';
import { createEditor } from '../../src/react';
import {
  applyEditableCopy,
  applyEditableCut,
  applyEditableDragOver,
  applyEditableDragStart,
  applyEditableDrop,
  applyEditablePaste,
} from '../../src/react/editable/clipboard-input-strategy';
import { EditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import { createReactRuntimeViewEditor } from '../../src/react/hooks/use-plite-runtime';
import {
  ReactEditor,
  type ReactRuntimeEditor,
} from '../../src/react/plugin/react-editor';

const blockImageSchema = defineEditorSchema('schema:dom-coverage-block-image', {
  elements: { image: { void: 'block' } },
  id: 'dom-coverage-block-image',
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

const blockVideoSchema = defineEditorSchema('schema:dom-coverage-block-video', {
  elements: { video: { void: 'block' } },
  id: 'dom-coverage-block-video',
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

class FakeDataTransfer {
  private readonly data = new Map<string, string>();

  dropEffect = 'none';
  effectAllowed = 'none';

  get types() {
    return Array.from(this.data.keys());
  }

  getData(type: string) {
    return this.data.get(type) ?? '';
  }

  setData(type: string, value: string) {
    this.data.set(type, value);
  }
}

const createChildren = (): Descendant[] => [
  {
    type: 'section',
    children: [
      {
        type: 'summary',
        children: [{ text: 'Summary' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Hidden alpha' }],
      },
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Visible beta' }],
  },
];

const getNodeKey = (editor: ReactRuntimeEditor, path: number[]) => {
  const nodeKey = editorGetNodeKey(editor, path);

  if (!nodeKey) {
    throw new Error(`Missing node key at ${path.join('.')}`);
  }

  return nodeKey;
};

const testRuntimes = new WeakMap<ReactRuntimeEditor, EditableDOMRuntime>();
const getTestRuntime = (editor: ReactRuntimeEditor) => {
  let runtime = testRuntimes.get(editor);
  if (!runtime) {
    runtime = new EditableDOMRuntime({ editor });
    testRuntimes.set(editor, runtime);
  }
  return runtime;
};

const mountEditorRoot = (editor: ReactRuntimeEditor) => {
  const root = document.createElement('div');

  root.setAttribute('contenteditable', 'true');
  root.setAttribute('data-editor', 'true');
  Object.defineProperty(root, 'isContentEditable', {
    configurable: true,
    value: true,
  });
  document.body.append(root);

  const runtime = getTestRuntime(editor);
  runtime.setRoot(root);
  runtime.connect();
  EDITOR_TO_ELEMENT.set(editor, root);
  EDITOR_TO_WINDOW.set(editor, window);
  ELEMENT_TO_NODE.set(root, editor);
  NODE_TO_ELEMENT.set(editor, root);

  return root;
};

const mountVisibleDragTarget = (root: HTMLElement) => {
  const target = document.createElement('p');

  target.setAttribute('data-editor-node', 'element');
  target.setAttribute('data-editor-path', '1');
  root.append(target);

  return target;
};

const mountInternalControlDragTarget = (root: HTMLElement) => {
  const host = document.createElement('p');
  const button = document.createElement('button');

  host.setAttribute('data-editor-node', 'element');
  host.setAttribute('data-editor-path', '0');
  button.type = 'button';
  button.textContent = 'Internal control';
  host.append(button);
  root.append(host);

  return button;
};

const decodeFragmentPayload = (payload: string) =>
  JSON.parse(decodeURIComponent(window.atob(payload)));

const createHiddenSelectionEditor = () => {
  const editor = createEditor<Value>();

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 'Hidden alpha'.length, path: [0, 1, 0] },
    },
  });

  getTestRuntime(editor).domCoverage.registerBoundary({
    anchor: { nodeKey: getNodeKey(editor, [0, 0]), type: 'summary-slot' },
    boundaryId: 'section-body',
    copyPolicy: 'model',
    coveredPathRanges: [{ anchor: [0, 1], focus: [0, 1] }],
    coveredRuntimeRanges: [
      {
        anchor: getNodeKey(editor, [0, 1]),
        focus: getNodeKey(editor, [0, 1]),
      },
    ],
    ownerPath: [0],
    ownerNodeKey: getNodeKey(editor, [0]),
    reason: 'app-collapse',
    selectionPolicy: 'skip',
    state: 'intentionally-hidden',
    version: 1,
  });

  return editor;
};

const createViewportSelectionEditor = () => {
  const editor = createEditor<Value>();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'Mounted alpha' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Pending omega' }],
      },
    ],
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 'Pending omega'.length, path: [1, 0] },
    },
  });

  getTestRuntime(editor).domCoverage.registerBoundary({
    anchor: { nodeKey: getNodeKey(editor, [1]), type: 'placeholder' },
    boundaryId: 'viewport:pending',
    copyPolicy: 'model',
    coveredPathRanges: [{ anchor: [1], focus: [1] }],
    coveredRuntimeRanges: [
      {
        anchor: getNodeKey(editor, [1]),
        focus: getNodeKey(editor, [1]),
      },
    ],
    ownerPath: [],
    ownerNodeKey: null,
    reason: 'viewport-virtualization',
    selectionPolicy: 'materialize',
    state: 'pending-mount',
    version: 1,
  });

  return editor;
};

const cleanupEditorRoot = (editor: ReactRuntimeEditor, root: HTMLElement) => {
  getTestRuntime(editor).destroy();
  EDITOR_TO_ELEMENT.delete(editor);
  EDITOR_TO_WINDOW.delete(editor);
  ELEMENT_TO_NODE.delete(root);
  NODE_TO_ELEMENT.delete(editor);
  root.remove();
};

const createClipboardEvent = (
  target: EventTarget,
  clipboardData: FakeDataTransfer
) =>
  ({
    clipboardData,
    nativeEvent: { clipboardData },
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target,
  }) as unknown as ClipboardEvent<HTMLDivElement>;

const createDragEvent = (target: EventTarget, dataTransfer: FakeDataTransfer) =>
  ({
    dataTransfer,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target,
  }) as unknown as DragEvent<HTMLDivElement>;

const runCrossEditorTextDrop = ({
  copy = false,
  dropPayload = 'source',
  editSource = false,
  failFirstDrop = false,
  lockSource = false,
}: {
  copy?: boolean;
  dropPayload?: 'empty' | 'external' | 'source';
  editSource?: boolean;
  failFirstDrop?: boolean;
  lockSource?: boolean;
} = {}) => {
  const source = createEditor<Value>({
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: 'Alpha Bravo' }],
      },
    ],
  });
  const target = createEditor<Value>({
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: 'Charlie' }],
      },
    ],
  });
  const bystander = createEditor<Value>({
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: 'Echo' }],
      },
    ],
  });

  source.update.selection.set({
    kind: 'text',
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 'Alpha '.length, path: [0, 0] },
  });

  const sourceRoot = mountEditorRoot(source);
  const targetRoot = mountEditorRoot(target);
  const bystanderRoot = mountEditorRoot(bystander);
  const sourceNode = mountVisibleDragTarget(sourceRoot);
  const sourceData = new FakeDataTransfer();
  const dropData =
    dropPayload === 'source' ? sourceData : new FakeDataTransfer();
  const sourceState = {
    draggedBlock: false,
    draggedRange: null,
    isDraggingInternally: false,
  };
  const targetState = {
    draggedBlock: false,
    draggedRange: null,
    isDraggingInternally: false,
  };
  const dropRange: TextSelection = {
    kind: 'text',
    anchor: { offset: 'Charlie'.length, path: [0, 0] },
    focus: { offset: 'Charlie'.length, path: [0, 0] },
  };
  let resolvedDropRange: Range | null = failFirstDrop ? null : dropRange;
  const resolveEventRange = vi
    .spyOn(ReactEditor, 'resolveEventRange')
    .mockImplementation(() => resolvedDropRange);

  sourceNode.setAttribute('data-editor-path', '0');

  if (dropPayload === 'external') {
    dropData.setData('text/plain', 'Delta');
  }
  if (copy) {
    dropData.dropEffect = 'copy';
  }

  try {
    applyEditableDragStart({
      editor: source,
      event: createDragEvent(sourceNode, sourceData),
      readOnly: false,
      state: sourceState,
    });

    if (editSource) {
      source.update((tx) => {
        tx.text.insert('Zulu ', { at: { offset: 0, path: [0, 0] } });
      });
    }
    if (lockSource) {
      setEditorReadOnly(source, true);
    }

    applyEditableDrop({
      editor: target,
      event: createDragEvent(targetRoot, dropData),
      readOnly: false,
      state: targetState,
    });

    if (failFirstDrop) {
      resolvedDropRange = dropRange;
      applyEditableDrop({
        editor: target,
        event: createDragEvent(targetRoot, dropData),
        readOnly: false,
        state: targetState,
      });
    }

    return {
      bystander: editorString(bystander, []),
      source: editorString(source, []),
      target: editorString(target, []),
    };
  } finally {
    resolveEventRange.mockRestore();
    cleanupEditorRoot(source, sourceRoot);
    cleanupEditorRoot(target, targetRoot);
    cleanupEditorRoot(bystander, bystanderRoot);
  }
};

const runSameEditorTextDrop = ({
  dropAt,
  duringDrag,
}: {
  dropAt: Range;
  duringDrag?: (editor: ReactRuntimeEditor) => void;
}) => {
  const editor = createEditor<Value>({
    initialValue: [
      { type: 'paragraph', children: [{ text: 'Alpha Bravo' }] },
      { type: 'paragraph', children: [{ text: 'Charlie' }] },
    ],
  });

  editor.update.selection.set({
    kind: 'text',
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 'Alpha '.length, path: [0, 0] },
  });

  const root = mountEditorRoot(editor);
  const source = mountVisibleDragTarget(root);
  source.setAttribute('data-editor-path', '0');
  const dataTransfer = new FakeDataTransfer();
  const state = {
    draggedBlock: false,
    draggedRange: null,
    isDraggingInternally: false,
  };
  const resolveEventRange = vi
    .spyOn(ReactEditor, 'resolveEventRange')
    .mockReturnValue(dropAt);
  let commits = 0;

  try {
    applyEditableDragStart({
      editor,
      event: createDragEvent(source, dataTransfer),
      readOnly: false,
      state,
    });
    duringDrag?.(editor);

    const unsubscribe = editor.subscribeCommit(() => {
      commits += 1;
    });

    applyEditableDrop({
      editor,
      event: createDragEvent(root, dataTransfer),
      readOnly: false,
      state,
    });
    unsubscribe();

    return {
      commits,
      texts: editor.read
        .children()
        .map((node) =>
          editorString(editor, [editor.read.children().indexOf(node)])
        ),
    };
  } finally {
    resolveEventRange.mockRestore();
    cleanupEditorRoot(editor, root);
  }
};

const endOfCharlie: Range = {
  anchor: { offset: 'Charlie'.length, path: [1, 0] },
  focus: { offset: 'Charlie'.length, path: [1, 0] },
};

const runTwoViewTextDrop = ({ lockSource = false } = {}) => {
  const model = createEditor<Value>({
    initialValue: [
      { type: 'paragraph', children: [{ text: 'Alpha Bravo' }] },
      { type: 'paragraph', children: [{ text: 'Charlie' }] },
    ],
  });
  const sourceView = createReactRuntimeViewEditor(
    createEditorView(model) as never
  ) as ReactRuntimeEditor;
  const targetView = createReactRuntimeViewEditor(
    createEditorView(model) as never
  ) as ReactRuntimeEditor;

  sourceView.update.selection.set({
    kind: 'text',
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 'Alpha '.length, path: [0, 0] },
  });

  const sourceRoot = mountEditorRoot(sourceView);
  const targetRoot = mountEditorRoot(targetView);
  const sourceNode = mountVisibleDragTarget(sourceRoot);
  sourceNode.setAttribute('data-editor-path', '0');
  const dataTransfer = new FakeDataTransfer();
  const resolveEventRange = vi
    .spyOn(ReactEditor, 'resolveEventRange')
    .mockReturnValue(endOfCharlie);

  try {
    applyEditableDragStart({
      editor: sourceView,
      event: createDragEvent(sourceNode, dataTransfer),
      readOnly: false,
      state: {
        draggedBlock: false,
        draggedRange: null,
        isDraggingInternally: false,
      },
    });
    if (lockSource) setEditorReadOnly(sourceView, true);
    applyEditableDrop({
      editor: targetView,
      event: createDragEvent(targetRoot, dataTransfer),
      readOnly: false,
      state: {
        draggedBlock: false,
        draggedRange: null,
        isDraggingInternally: false,
      },
    });

    return model.read
      .children()
      .map((_, index) => editorString(model, [index]));
  } finally {
    resolveEventRange.mockRestore();
    cleanupEditorRoot(sourceView, sourceRoot);
    cleanupEditorRoot(targetView, targetRoot);
  }
};

describe('DOM coverage native bridge', () => {
  test('an edit before the dragged text still moves the dragged text', () => {
    expect(
      runSameEditorTextDrop({
        dropAt: endOfCharlie,
        duringDrag: (editor) =>
          editor.update((tx) => {
            tx.text.insert('Zulu ', { at: { offset: 0, path: [0, 0] } });
          }),
      }).texts
    ).toEqual(['Zulu Bravo', 'CharlieAlpha ']);
  });

  test('an edit inside the dragged text moves the edited text', () => {
    expect(
      runSameEditorTextDrop({
        dropAt: endOfCharlie,
        duringDrag: (editor) =>
          editor.update((tx) => {
            tx.text.insert('ZZ', { at: { offset: 2, path: [0, 0] } });
          }),
      }).texts
    ).toEqual(['Bravo', 'CharlieAlZZpha ']);
  });

  test('dragged text deleted before the drop is not moved', () => {
    expect(
      runSameEditorTextDrop({
        dropAt: endOfCharlie,
        duringDrag: (editor) =>
          editor.update((tx) => {
            tx.text.delete({
              at: {
                anchor: { offset: 0, path: [0, 0] },
                focus: { offset: 'Alpha '.length, path: [0, 0] },
              },
            });
          }),
      })
    ).toEqual({ commits: 0, texts: ['Bravo', 'Charlie'] });
  });

  test('a drop inside the dragged text changes nothing', () => {
    expect(
      runSameEditorTextDrop({
        dropAt: {
          anchor: { offset: 2, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
      })
    ).toEqual({ commits: 0, texts: ['Alpha Bravo', 'Charlie'] });
  });

  test('two views of one document move the dragged text once', () => {
    expect(runTwoViewTextDrop()).toEqual(['Bravo', 'CharlieAlpha ']);
  });

  test('a source view that turns read-only during the drag is copied from', () => {
    expect(runTwoViewTextDrop({ lockSource: true })).toEqual([
      'Alpha Bravo',
      'CharlieAlpha ',
    ]);
  });

  test('copy writes model-backed data when native selection crosses hidden content', () => {
    const editor = createHiddenSelectionEditor();
    const root = mountEditorRoot(editor);
    const clipboard = new FakeDataTransfer();
    const staleDom = document.createElement('span');

    staleDom.textContent = 'STALE HIDDEN DOM';
    document.body.append(staleDom);

    try {
      applyEditableCopy({
        editor,
        event: createClipboardEvent(root, clipboard),
      });

      expect(clipboard.getData('text/plain')).toBe('Hidden alpha');
      expect(clipboard.getData('text/html')).toContain('Hidden alpha');
      expect(clipboard.getData('text/html')).not.toContain('STALE');
      expect(clipboard.getData('application/x-editor-fragment')).not.toBe('');
    } finally {
      staleDom.remove();
      cleanupEditorRoot(editor, root);
    }
  });

  test('paste over a hidden native selection mutates the model without stale DOM', () => {
    const editor = createHiddenSelectionEditor();
    const root = mountEditorRoot(editor);
    const clipboard = new FakeDataTransfer();
    const staleDom = document.createElement('span');

    clipboard.setData('text/plain', 'Pasted alpha');
    staleDom.textContent = 'STALE HIDDEN DOM';
    document.body.append(staleDom);

    try {
      const result = applyEditablePaste({
        editor,
        event: createClipboardEvent(root, clipboard),
        readOnly: false,
        viewportBackedSelection: false,
      });

      expect(result.command).toMatchObject({ kind: 'insert-data' });
      expect(editorString(editor, [0, 1])).toBe('Pasted alpha');
      expect(staleDom.textContent).toBe('STALE HIDDEN DOM');
    } finally {
      staleDom.remove();
      cleanupEditorRoot(editor, root);
    }
  });

  test('drag start serializes hidden-range selections through the model-backed clipboard path', () => {
    const editor = createHiddenSelectionEditor();
    const root = mountEditorRoot(editor);
    const target = mountVisibleDragTarget(root);
    const dataTransfer = new FakeDataTransfer();
    const state = {
      draggedBlock: false,
      draggedRange: null,
      isDraggingInternally: false,
    };

    try {
      applyEditableDragStart({
        editor,
        event: createDragEvent(target, dataTransfer),
        readOnly: false,
        state,
      });

      expect(state.isDraggingInternally).toBe(true);
      expect(dataTransfer.effectAllowed).toBe('copyMove');
      expect(dataTransfer.getData('text/plain')).toBe('Hidden alpha');
      expect(dataTransfer.getData('text/html')).toContain('Hidden alpha');
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('internal dragover advertises a move drop effect', () => {
    const editor = createHiddenSelectionEditor();
    const root = mountEditorRoot(editor);
    const target = mountVisibleDragTarget(root);
    const dataTransfer = new FakeDataTransfer();
    const event = createDragEvent(target, dataTransfer);

    try {
      const handled = applyEditableDragOver({
        editor,
        event,
        state: {
          draggedBlock: false,
          draggedRange: null,
          isDraggingInternally: true,
        },
      });

      expect(handled).toBe(true);
      expect(dataTransfer.dropEffect).toBe('move');
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('custom dragover ownership suppresses Plite built-ins', () => {
    const editor = createHiddenSelectionEditor();
    const root = mountEditorRoot(editor);
    const target = mountVisibleDragTarget(root);
    const dataTransfer = new FakeDataTransfer();
    const event = createDragEvent(target, dataTransfer);

    try {
      const handled = applyEditableDragOver({
        editor,
        event,
        onDragOver: () => true,
        state: {
          draggedBlock: false,
          draggedRange: null,
          isDraggingInternally: true,
        },
      });

      expect(handled).toBe(false);
      expect(dataTransfer.dropEffect).toBe('none');
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('drop inserts plain text data at the resolved event range', () => {
    const editor = createEditor<Value>();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Original text' }],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });

    const root = mountEditorRoot(editor);
    const dataTransfer = new FakeDataTransfer();
    const event = createDragEvent(root, dataTransfer);
    const resolveEventRange = vi
      .spyOn(ReactEditor, 'resolveEventRange')
      .mockReturnValue({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });

    dataTransfer.setData('text/plain', 'Dropped text');

    try {
      const result = applyEditableDrop({
        editor,
        event,
        readOnly: false,
        state: {
          draggedBlock: false,
          draggedRange: null,
          isDraggingInternally: false,
        },
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.command).toMatchObject({ kind: 'insert-data' });
      expect(editorString(editor, [])).toBe('Dropped textOriginal text');
      expect(editorGetSnapshot(editor).selection).toEqual({
        kind: 'text',
        anchor: { offset: 'Dropped text'.length, path: [0, 0] },
        focus: { offset: 'Dropped text'.length, path: [0, 0] },
      });
    } finally {
      resolveEventRange.mockRestore();
      cleanupEditorRoot(editor, root);
    }
  });

  test('internal block void drop moves the source in one commit', () => {
    const editor = createEditor({
      plugins: [blockVideoSchema],
    });

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Intro' }],
        },
        {
          type: 'video',
          children: [{ text: '' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Target' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Trailing' }],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
    });

    const root = mountEditorRoot(editor);
    const source = mountVisibleDragTarget(root);
    const dataTransfer = new FakeDataTransfer();
    const state = {
      draggedBlock: false,
      draggedRange: null,
      isDraggingInternally: false,
    };
    const resolveEventRange = vi
      .spyOn(ReactEditor, 'resolveEventRange')
      .mockReturnValue({
        anchor: { offset: 'Target'.length, path: [2, 0] },
        focus: { offset: 'Target'.length, path: [2, 0] },
      });

    try {
      applyEditableDragStart({
        editor,
        event: createDragEvent(source, dataTransfer),
        readOnly: false,
        state,
      });

      let commits = 0;
      const unsubscribe = editor.subscribeCommit(() => (commits += 1) - 1);

      applyEditableDrop({
        editor,
        event: createDragEvent(root, dataTransfer),
        readOnly: false,
        state,
      });
      unsubscribe();

      expect(commits).toBe(1);
      expect(editorGetSnapshot(editor)).toMatchObject({
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'Intro' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'Target' }],
          },
          {
            type: 'video',
            children: [{ text: '' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'Trailing' }],
          },
        ],
        selection: { kind: 'node', paths: [[2]] },
      });
    } finally {
      resolveEventRange.mockRestore();
      cleanupEditorRoot(editor, root);
    }
  });

  test('internal collapsed text drop does not delete the source character', () => {
    const editor = createEditor<Value>();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'abcdef' }],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
    });

    const root = mountEditorRoot(editor);
    const dataTransfer = new FakeDataTransfer();
    const draggedRange: TextSelection = {
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };
    const resolveEventRange = vi
      .spyOn(ReactEditor, 'resolveEventRange')
      .mockReturnValue({
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      });

    dataTransfer.setData('text/plain', 'X');

    try {
      applyEditableDrop({
        editor,
        event: createDragEvent(root, dataTransfer),
        readOnly: false,
        state: {
          draggedBlock: false,
          draggedRange,
          isDraggingInternally: true,
        },
      });

      expect(editorString(editor, [])).toBe('abcdXef');
    } finally {
      resolveEventRange.mockRestore();
      cleanupEditorRoot(editor, root);
    }
  });

  test('internal expanded text drop moves the captured source range', () => {
    const text = 'This is editable plain text, just like a <textarea>!';
    const editor = createEditor<Value>({
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text }],
        },
      ],
    });

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 8, path: [0, 0] },
      focus: { offset: 16, path: [0, 0] },
    });

    const root = mountEditorRoot(editor);
    const source = mountVisibleDragTarget(root);
    source.setAttribute('data-editor-path', '0');
    const dataTransfer = new FakeDataTransfer();
    const state = {
      draggedBlock: false,
      draggedRange: null,
      isDraggingInternally: false,
    };
    const resolveEventRange = vi
      .spyOn(ReactEditor, 'resolveEventRange')
      .mockReturnValue({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });

    try {
      applyEditableDragStart({
        editor,
        event: createDragEvent(source, dataTransfer),
        readOnly: false,
        state,
      });

      expect(dataTransfer.getData('application/x-editor-fragment')).not.toBe(
        ''
      );
      applyEditableDrop({
        editor,
        event: createDragEvent(root, dataTransfer),
        readOnly: false,
        state,
      });

      expect(editorString(editor, [])).toBe(
        'editableThis is  plain text, just like a <textarea>!'
      );
      expect(editorGetSnapshot(editor).selection).toMatchObject({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 8, path: [0, 0] },
      });
    } finally {
      resolveEventRange.mockRestore();
      cleanupEditorRoot(editor, root);
    }
  });

  test.each([
    {
      drop: (dataTransfer: FakeDataTransfer) => {
        dataTransfer.dropEffect = 'copy';
        return dataTransfer;
      },
      expected: 'editableThis is editable plain text, just like a <textarea>!',
      name: 'a copy drop inserts and keeps the source range',
    },
  ])('internal expanded text drop: $name', ({ drop, expected }) => {
    const text = 'This is editable plain text, just like a <textarea>!';
    const editor = createEditor<Value>({
      initialValue: [{ type: 'paragraph', children: [{ text }] }],
    });

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 8, path: [0, 0] },
      focus: { offset: 16, path: [0, 0] },
    });

    const root = mountEditorRoot(editor);
    const source = mountVisibleDragTarget(root);
    source.setAttribute('data-editor-path', '0');
    const dataTransfer = new FakeDataTransfer();
    const state = {
      draggedBlock: false,
      draggedRange: null,
      isDraggingInternally: false,
    };
    const resolveEventRange = vi
      .spyOn(ReactEditor, 'resolveEventRange')
      .mockReturnValue({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });

    try {
      applyEditableDragStart({
        editor,
        event: createDragEvent(source, dataTransfer),
        readOnly: false,
        state,
      });
      applyEditableDrop({
        editor,
        event: createDragEvent(root, drop(dataTransfer)),
        readOnly: false,
        state,
      });

      expect(editorString(editor, [])).toBe(expected);
    } finally {
      resolveEventRange.mockRestore();
      cleanupEditorRoot(editor, root);
    }
  });

  test('cross-editor text drop copies and keeps the source', () => {
    expect(runCrossEditorTextDrop()).toEqual({
      bystander: 'Echo',
      source: 'Alpha Bravo',
      target: 'CharlieAlpha ',
    });
  });

  test('cross-editor copy leaves the captured source range intact', () => {
    expect(runCrossEditorTextDrop({ copy: true })).toEqual({
      bystander: 'Echo',
      source: 'Alpha Bravo',
      target: 'CharlieAlpha ',
    });
  });

  test('cross-editor move degrades to copy after a source document edit', () => {
    expect(runCrossEditorTextDrop({ editSource: true })).toEqual({
      bystander: 'Echo',
      source: 'Zulu Alpha Bravo',
      target: 'CharlieAlpha ',
    });
  });

  test('cross-editor move keeps a source that turned read-only during the drag', () => {
    expect(runCrossEditorTextDrop({ lockSource: true })).toEqual({
      bystander: 'Echo',
      source: 'Alpha Bravo',
      target: 'CharlieAlpha ',
    });
  });

  test('empty transfer does not consume a pending cross-editor move', () => {
    expect(runCrossEditorTextDrop({ dropPayload: 'empty' })).toEqual({
      bystander: 'Echo',
      source: 'Alpha Bravo',
      target: 'Charlie',
    });
  });

  test('external transfer does not consume a pending cross-editor move', () => {
    expect(runCrossEditorTextDrop({ dropPayload: 'external' })).toEqual({
      bystander: 'Echo',
      source: 'Alpha Bravo',
      target: 'CharlieDelta',
    });
  });

  test('a repeated drop after a failed landing is consumed', () => {
    expect(runCrossEditorTextDrop({ failFirstDrop: true })).toEqual({
      bystander: 'Echo',
      source: 'Alpha Bravo',
      target: 'Charlie',
    });
  });

  test.each([false, true])(
    'repeated external plain text drops preserve earlier text and repair the caret when focused is %s',
    (focused) => {
      const editor = createEditor<Value>();

      editorReplace(editor, {
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'Original text' }],
          },
        ],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
      });

      const root = mountEditorRoot(editor);
      IS_FOCUSED.set(editor, focused);
      const resolveEventRange = vi
        .spyOn(ReactEditor, 'resolveEventRange')
        .mockReturnValueOnce({
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        })
        .mockReturnValueOnce({
          anchor: { offset: 'First '.length, path: [0, 0] },
          focus: { offset: 'First '.length, path: [0, 0] },
        });

      try {
        for (const text of ['First ', 'Second ']) {
          const dataTransfer = new FakeDataTransfer();
          const event = createDragEvent(root, dataTransfer);

          dataTransfer.setData('text/plain', text);

          const result = applyEditableDrop({
            editor,
            event,
            readOnly: false,
            state: {
              draggedBlock: false,
              draggedRange: null,
              isDraggingInternally: false,
            },
          });

          expect(event.preventDefault).toHaveBeenCalled();
          expect(result.command).toMatchObject({ kind: 'insert-data' });
          expect(result.repair).toEqual({
            focus: true,
            kind: 'repair-caret',
            selectionSourceTransition: {
              preferModelSelection: true,
              reason: 'model-command',
              selectionSource: 'model-owned',
            },
          });
        }

        expect(editorString(editor, [])).toBe('First Second Original text');
        expect(editorGetSnapshot(editor).selection).toEqual({
          kind: 'text',
          anchor: { offset: 'First Second '.length, path: [0, 0] },
          focus: { offset: 'First Second '.length, path: [0, 0] },
        });
      } finally {
        IS_FOCUSED.delete(editor);
        resolveEventRange.mockRestore();
        cleanupEditorRoot(editor, root);
      }
    }
  );

  test('drag and drop on internal controls does not run editor-owned handling', () => {
    const editor = createEditor<Value>();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Original text' }],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 'Original text'.length, path: [0, 0] },
      },
    });

    const root = mountEditorRoot(editor);
    const button = mountInternalControlDragTarget(root);
    const dragData = new FakeDataTransfer();
    const dropData = new FakeDataTransfer();
    const dragState = {
      draggedBlock: false,
      draggedRange: null,
      isDraggingInternally: false,
    };
    const dropEvent = createDragEvent(button, dropData);

    dropData.setData('text/plain', 'Dropped text');

    try {
      applyEditableDragStart({
        editor,
        event: createDragEvent(button, dragData),
        readOnly: false,
        state: dragState,
      });
      const result = applyEditableDrop({
        editor,
        event: dropEvent,
        readOnly: false,
        state: dragState,
      });

      expect(dragState.isDraggingInternally).toBe(false);
      expect(dragData.types).toEqual([]);
      expect(dropEvent.preventDefault).not.toHaveBeenCalled();
      expect(result.command).toBe(null);
      expect(editorString(editor, [])).toBe('Original text');
      expect(editorGetSnapshot(editor).selection).toEqual({
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 'Original text'.length, path: [0, 0] },
      });
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('drop is ignored when the editor is read-only', () => {
    const editor = createEditor<Value>();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Original text' }],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 'Original text'.length, path: [0, 0] },
      },
    });

    const root = mountEditorRoot(editor);
    const dataTransfer = new FakeDataTransfer();
    const event = createDragEvent(root, dataTransfer);

    dataTransfer.setData('text/plain', 'Dropped text');

    try {
      const result = applyEditableDrop({
        editor,
        event,
        readOnly: true,
        state: {
          draggedBlock: false,
          draggedRange: null,
          isDraggingInternally: false,
        },
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.command).toBe(null);
      expect(editorString(editor, [])).toBe('Original text');
      expect(editorGetSnapshot(editor).selection).toEqual({
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 'Original text'.length, path: [0, 0] },
      });
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('paste is ignored when the editor is read-only', () => {
    const editor = createEditor<Value>();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Original text' }],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 'Original text'.length, path: [0, 0] },
      },
    });

    const root = mountEditorRoot(editor);
    const clipboard = new FakeDataTransfer();
    const event = createClipboardEvent(root, clipboard);

    clipboard.setData('text/plain', 'Pasted text');

    try {
      const result = applyEditablePaste({
        editor,
        event,
        readOnly: true,
        viewportBackedSelection: false,
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.command).toBe(null);
      expect(editorString(editor, [])).toBe('Original text');
      expect(editorGetSnapshot(editor).selection).toEqual({
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 'Original text'.length, path: [0, 0] },
      });
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('read-only paste prevents native default even when custom handler returns handled', () => {
    const editor = createEditor<Value>();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Original text' }],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 'Original text'.length, path: [0, 0] },
      },
    });

    const root = mountEditorRoot(editor);
    const clipboard = new FakeDataTransfer();
    const event = createClipboardEvent(root, clipboard);
    const onPaste = vi.fn(() => true);

    clipboard.setData('text/plain', 'Pasted text');

    try {
      const result = applyEditablePaste({
        editor,
        event,
        onPaste,
        readOnly: true,
        viewportBackedSelection: false,
      });

      expect(onPaste).toHaveBeenCalledWith(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.command).toBe(null);
      expect(editorString(editor, [])).toBe('Original text');
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('paste is ignored when the application handler owns the event', () => {
    const editor = createEditor<Value>();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Original text' }],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 'Original text'.length, path: [0, 0] },
      },
    });

    const root = mountEditorRoot(editor);
    const clipboard = new FakeDataTransfer();
    const event = createClipboardEvent(root, clipboard);

    clipboard.setData('text/plain', 'Pasted text');

    try {
      const result = applyEditablePaste({
        editor,
        event,
        onPaste: () => true,
        readOnly: false,
        viewportBackedSelection: false,
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(result.command).toBe(null);
      expect(editorString(editor, [])).toBe('Original text');
      expect(editorGetSnapshot(editor).selection).toEqual({
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 'Original text'.length, path: [0, 0] },
      });
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('paste uses clipboard data mutated by an unhandled app paste callback', () => {
    const editor = createEditor<Value>();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Original text' }],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 'Original text'.length, path: [0, 0] },
      },
    });

    const root = mountEditorRoot(editor);
    const clipboard = new FakeDataTransfer();
    const event = createClipboardEvent(root, clipboard);

    clipboard.setData('text/plain', 'Old text');

    try {
      const result = applyEditablePaste({
        editor,
        event,
        onPaste: (pasteEvent) => {
          pasteEvent.clipboardData.setData('text/plain', 'New text');
          return false;
        },
        readOnly: false,
        viewportBackedSelection: false,
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.command).toMatchObject({ kind: 'insert-data' });
      expect(editorString(editor, [])).toBe('New text');
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('copy over an omitted viewport range writes model data without mounting it', () => {
    const editor = createViewportSelectionEditor();
    const root = mountEditorRoot(editor);
    const clipboard = new FakeDataTransfer();
    const materialized: string[] = [];
    const staleDom = document.createElement('span');

    staleDom.textContent = 'STALE PENDING DOM';
    document.body.append(staleDom);
    getTestRuntime(editor).domCoverage.setMaterializeHandler(
      (boundary, reason, options) => {
        materialized.push(
          `${boundary.boundaryId}:${reason}:${options.range ? editorString(editor, options.range) : ''}`
        );
        return true;
      }
    );

    try {
      applyEditableCopy({
        editor,
        event: createClipboardEvent(root, clipboard),
      });

      expect(materialized).toEqual([]);
      expect(clipboard.getData('text/plain')).toBe('Pending omega');
      expect(clipboard.getData('text/html')).toContain('Pending omega');
      expect(clipboard.getData('text/html')).not.toContain('STALE');
      expect(clipboard.getData('application/x-editor-fragment')).not.toBe('');
    } finally {
      staleDom.remove();
      cleanupEditorRoot(editor, root);
    }
  });

  test('paste over an omitted viewport range mounts it before mutating the model', () => {
    const editor = createViewportSelectionEditor();
    const root = mountEditorRoot(editor);
    const clipboard = new FakeDataTransfer();
    const materialized: string[] = [];
    const staleDom = document.createElement('span');

    clipboard.setData('text/plain', 'Pasted omega');
    staleDom.textContent = 'STALE PENDING DOM';
    document.body.append(staleDom);
    getTestRuntime(editor).domCoverage.setMaterializeHandler(
      (boundary, reason, options) => {
        materialized.push(
          `${boundary.boundaryId}:${reason}:${options.range ? editorString(editor, options.range) : ''}`
        );
        return true;
      }
    );

    try {
      const result = applyEditablePaste({
        editor,
        event: createClipboardEvent(root, clipboard),
        readOnly: false,
        viewportBackedSelection: false,
      });

      expect(materialized).toEqual(['viewport:pending:paste:Pending omega']);
      expect(result.command).toMatchObject({ kind: 'insert-data' });
      expect(editorString(editor, [1])).toBe('Pasted omega');
      expect(staleDom.textContent).toBe('STALE PENDING DOM');
    } finally {
      staleDom.remove();
      cleanupEditorRoot(editor, root);
    }
  });

  test('cutting a selected block void writes model data, deletes once, and requests model-owned repair', () => {
    const editor = createEditor<Value>();

    editor.install(blockImageSchema);
    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'before' }],
        },
        {
          type: 'image',
          url: 'about:blank',
          children: [{ text: '' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'after' }],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
    });

    const root = mountEditorRoot(editor);
    const clipboard = new FakeDataTransfer();
    const event = createClipboardEvent(root, clipboard);

    try {
      const result = applyEditableCut({
        editor,
        event,
        readOnly: false,
      });

      const encoded = clipboard.getData('application/x-editor-fragment');

      expect(event.preventDefault).toHaveBeenCalled();
      expect(encoded).not.toBe('');
      expect(decodeFragmentPayload(encoded)).toEqual({
        slice: {
          content: [
            {
              type: 'image',
              url: 'about:blank',
              children: [{ text: '' }],
            },
          ],
          openEnd: 0,
          openStart: 0,
        },
        version: 1,
      });
      expect(editorGetSnapshot(editor).children).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'before' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'after' }],
        },
      ]);
      expect(editorGetSnapshot(editor).selection).toEqual({
        kind: 'text',
        anchor: { offset: 'before'.length, path: [0, 0] },
        focus: { offset: 'before'.length, path: [0, 0] },
      });
      expect(result.command).toEqual({ kind: 'delete-fragment' });
      expect(result.repair).toEqual({
        focus: true,
        kind: 'repair-caret',
        selectionSourceTransition: {
          preferModelSelection: true,
          reason: 'model-command',
          selectionSource: 'model-owned',
        },
      });
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('cutting a selected inline void publishes deletion and caret as one commit', () => {
    const inlineVoidSchema = defineEditorSchema('schema:cut-inline-void', {
      elements: {
        mention: { void: 'markable-inline' },
        paragraph: {
          content: schema.content.any(
            [schema.content.text(), schema.content.type('mention')],
            { default: 'text', min: 1 }
          ),
        },
      },
      root: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'preserve',
    });
    const editor = createEditor({
      plugins: [inlineVoidSchema],
      initialValue: [{ type: 'paragraph', children: [{ text: '' }] }],
    });
    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'before ' },
            {
              type: 'mention',
              character: 'R2-D2',
              children: [{ text: '', bold: true }],
            },
            { text: ' after' },
          ],
        },
      ],
      selection: {
        kind: 'text',
        anchor: { path: [0, 1, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 0 },
      },
    });
    const root = mountEditorRoot(editor);
    const clipboard = new FakeDataTransfer();
    let commits = 0;
    const unsubscribe = editor.subscribeCommit(() => {
      commits += 1;
    });

    try {
      applyEditableCut({
        editor,
        event: createClipboardEvent(root, clipboard),
        readOnly: false,
      });

      expect(commits).toBe(1);
      const commit = editor.read((state) => state.lastCommit());
      expect(commit?.changed.hasAny('structure')).toBe(true);
      expect(commit?.changes.empty).toBe(false);
      expect(editor.read((state) => state.children())).toEqual([
        { type: 'paragraph', children: [{ text: 'before  after' }] },
      ]);
      expect(editor.read((state) => state.selection())).toEqual({
        anchor: { path: [0, 0], offset: 7 },
        focus: { path: [0, 0], offset: 7 },
      });
      expect(
        decodeFragmentPayload(
          clipboard.getData('application/x-editor-fragment')
        ).slice.content
      ).toEqual([
        {
          type: 'paragraph',
          children: [
            {
              type: 'mention',
              character: 'R2-D2',
              children: [{ text: '', bold: true }],
            },
          ],
        },
      ]);
    } finally {
      unsubscribe();
      cleanupEditorRoot(editor, root);
    }
  });
});

describe('native block drag', () => {
  const paragraph = (text: string) => ({
    children: [{ text }],
    type: 'paragraph',
  });
  const setup = () => {
    const editor = createEditor<Value>({
      initialValue: [paragraph('a'), paragraph('b'), paragraph('c')],
    });
    const root = mountEditorRoot(editor);
    const hosts = editorGetSnapshot(editor).children.map((node, index) => {
      const host = document.createElement('p');

      host.setAttribute('data-editor-node', 'element');
      host.setAttribute('data-editor-node-key', getNodeKey(editor, [index]));
      host.textContent = NodeApi.string(node);
      root.append(host);
      ELEMENT_TO_NODE.set(host, node);
      NODE_TO_ELEMENT.set(node, host);

      return host;
    });
    const dataTransfer = new FakeDataTransfer();
    const at = (path: number[], offset: number) =>
      vi.spyOn(ReactEditor, 'resolveEventRange').mockReturnValue({
        anchor: { offset, path: [...path, 0] },
        focus: { offset, path: [...path, 0] },
      });
    const state = {
      draggedBlock: false,
      draggedRange: null,
      isDraggingInternally: false,
    };

    return { at, dataTransfer, editor, hosts, root, state };
  };
  const texts = (editor: ReactRuntimeEditor) =>
    editorGetSnapshot(editor).children.map((node) => NodeApi.string(node));

  test('drag.start selects the dragged blocks, marks their hosts and returns inert previews', () => {
    const { dataTransfer, editor, hosts, root } = setup();

    editor.update.selection.set(SelectionApi.nodes([[0], [1]]));

    try {
      const drag = editor.api.dom.drag.start(
        { clientX: 0, clientY: 0, dataTransfer: dataTransfer as never },
        { node: editorGetSnapshot(editor).children[0] as never }
      );

      expect(drag?.previews.map((preview) => preview.textContent)).toEqual([
        'a',
        'b',
      ]);
      expect(
        drag?.previews.some((preview) =>
          preview.hasAttribute('data-editor-node')
        )
      ).toBe(false);
      expect(dataTransfer.effectAllowed).toBe('copyMove');
      expect(
        hosts.map((host) => host.hasAttribute('data-editor-dragging'))
      ).toEqual([true, true, false]);

      document.dispatchEvent(new Event('dragend'));

      expect(
        hosts.some((host) => host.hasAttribute('data-editor-dragging'))
      ).toBe(false);
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('a pointermove after a drag ends a session whose source never received dragend', () => {
    const { dataTransfer, editor, hosts, root, state } = setup();

    try {
      editor.api.dom.drag.start(
        { clientX: 0, clientY: 0, dataTransfer: dataTransfer as never },
        { node: editorGetSnapshot(editor).children[0] as never }
      );
      hosts[0].remove();
      document.dispatchEvent(new Event('pointermove'));

      expect(hosts[0].hasAttribute('data-editor-dragging')).toBe(false);

      applyEditableDragOver({
        editor,
        event: createDragEvent(hosts[2], dataTransfer),
        state,
      });

      expect(readDropIndicator(editor)).toBe(null);
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('a drag releases every document and window listener it adds, however it ends', () => {
    const { at, dataTransfer, editor, hosts, root, state } = setup();
    const range = at([2], 1);

    // jsdom's selector engine adds its hover listeners on the first match.
    document.body.matches('*');

    const listeners: unknown[][] = [];
    const entry = (
      target: EventTarget,
      [type, listener, options]: Parameters<EventTarget['addEventListener']>
    ) => [
      target,
      type,
      listener,
      typeof options === 'boolean' ? options : !!options?.capture,
    ];
    const indexOf = (key: unknown[]) =>
      listeners.findIndex((listener) =>
        listener.every((part, i) => part === key[i])
      );
    const spies = [document, window].flatMap((target) => {
      const { addEventListener, removeEventListener } = target;

      return [
        vi.spyOn(target, 'addEventListener').mockImplementation((...args) => {
          if (indexOf(entry(target, args)) < 0) {
            listeners.push(entry(target, args));
          }
          addEventListener.apply(target, args);
        }),
        vi
          .spyOn(target, 'removeEventListener')
          .mockImplementation((...args) => {
            const index = indexOf(entry(target, args));

            if (index >= 0) listeners.splice(index, 1);
            removeEventListener.apply(target, args);
          }),
      ];
    });
    const live = () => listeners.length;
    const ends = {
      dragend: () => document.dispatchEvent(new Event('dragend')),
      pointermove: () => document.dispatchEvent(new Event('pointermove')),
      drop: () =>
        applyEditableDrop({
          editor,
          event: createDragEvent(hosts[2], dataTransfer),
          readOnly: false,
          state,
        }),
    };

    try {
      const before = live();

      for (const [way, end] of Object.entries(ends)) {
        // The second start ends the first drag's session.
        for (const _ of [0, 1]) {
          editor.api.dom.drag.start(
            { clientX: 0, clientY: 0, dataTransfer: dataTransfer as never },
            { node: editorGetSnapshot(editor).children[0] as never }
          );
        }

        expect(live()).toBeGreaterThan(before);

        end();

        expect({ live: live(), way }).toEqual({ live: before, way });
      }
      expect(texts(editor)).toEqual(['b', 'c', 'a']);
    } finally {
      for (const spy of spies) spy.mockRestore();
      range.mockRestore();
      cleanupEditorRoot(editor, root);
    }
  });

  test('ending a drag clears every painted indicator', () => {
    const { at, dataTransfer, editor, hosts, root, state } = setup();
    const overC = at([2], 1);

    try {
      editor.api.dom.drag.start(
        { clientX: 0, clientY: 0, dataTransfer: dataTransfer as never },
        { node: editorGetSnapshot(editor).children[0] as never }
      );
      applyEditableDragOver({
        editor,
        event: createDragEvent(hosts[2], dataTransfer),
        state,
      });

      expect(readDropIndicator(editor)).not.toBe(null);

      // A cancelled drag ends on the source without a dragleave on the target.
      document.dispatchEvent(new Event('dragend'));

      expect(readDropIndicator(editor)).toBe(null);
    } finally {
      overC.mockRestore();
      cleanupEditorRoot(editor, root);
    }
  });

  test('a block drag settles before a drop handler that claims every drop', () => {
    const { at, dataTransfer, editor, hosts, root, state } = setup();
    const range = at([2], 1);

    try {
      editor.api.dom.drag.start(
        { clientX: 0, clientY: 0, dataTransfer: dataTransfer as never },
        { node: editorGetSnapshot(editor).children[0] as never }
      );
      applyEditableDrop({
        editor,
        event: createDragEvent(hosts[2], dataTransfer),
        onDrop: () => true,
        readOnly: false,
        state,
      });

      expect(texts(editor)).toEqual(['b', 'c', 'a']);
    } finally {
      range.mockRestore();
      cleanupEditorRoot(editor, root);
    }
  });

  test('a dragged block whose host unmounted mid-drag still moves by key', () => {
    const { at, dataTransfer, editor, hosts, root, state } = setup();
    const range = at([2], 1);

    try {
      editor.api.dom.drag.start(
        { clientX: 0, clientY: 0, dataTransfer: dataTransfer as never },
        { node: editorGetSnapshot(editor).children[0] as never }
      );
      hosts[0].remove();
      applyEditableDrop({
        editor,
        event: createDragEvent(hosts[2], dataTransfer),
        readOnly: false,
        state,
      });

      expect(texts(editor)).toEqual(['b', 'c', 'a']);
    } finally {
      range.mockRestore();
      cleanupEditorRoot(editor, root);
    }
  });

  test('a read-only editor starts a copy-only drag', () => {
    const { dataTransfer, editor, hosts, root } = setup();

    setEditorReadOnly(editor, true);

    try {
      editor.api.dom.drag.start(
        { clientX: 0, clientY: 0, dataTransfer: dataTransfer as never },
        { node: editorGetSnapshot(editor).children[0] as never }
      );

      expect(dataTransfer.effectAllowed).toBe('copy');
      expect(hosts[0].hasAttribute('data-editor-dragging')).toBe(true);
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('dragover paints the indicator on an admitted edge and refuses a no-op edge', () => {
    const { at, dataTransfer, editor, hosts, root, state } = setup();

    try {
      editor.api.dom.drag.start(
        { clientX: 0, clientY: 0, dataTransfer: dataTransfer as never },
        { node: editorGetSnapshot(editor).children[0] as never }
      );

      const overC = at([2], 1);
      const admitted = createDragEvent(hosts[2], dataTransfer);

      applyEditableDragOver({ editor, event: admitted, state });
      overC.mockRestore();

      expect(admitted.preventDefault).toHaveBeenCalled();
      expect(readDropIndicator(editor)).toMatchObject({
        edge: 'after',
        key: getNodeKey(editor, [2]),
      });

      const overB = at([1], 0);
      const refused = createDragEvent(hosts[1], dataTransfer);

      applyEditableDragOver({ editor, event: refused, state });
      overB.mockRestore();

      // Block drags always preventDefault to suppress the native text cursor.
      expect(refused.preventDefault).toHaveBeenCalled();
      expect(dataTransfer.dropEffect).toBe('none');
      expect(readDropIndicator(editor)).toBe(null);
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('dragover with browser-initialized dropEffect=copy but no modifier key sets move', () => {
    const { at, dataTransfer, editor, hosts, root, state } = setup();

    try {
      editor.api.dom.drag.start(
        { clientX: 0, clientY: 0, dataTransfer: dataTransfer as never },
        { node: editorGetSnapshot(editor).children[0] as never }
      );

      const overC = at([2], 1);
      // Simulate browser initializing dropEffect to 'copy' before dragover
      dataTransfer.dropEffect = 'copy';
      const event = createDragEvent(hosts[2], dataTransfer);

      applyEditableDragOver({ editor, event, state });
      overC.mockRestore();

      // Block drag copy intent ignores dataTransfer.dropEffect;
      // without a modifier key the effect must be 'move'.
      expect(dataTransfer.dropEffect).toBe('move');
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('self-drop on own block refuses and does not duplicate', () => {
    const { at, dataTransfer, editor, hosts, root, state } = setup();

    try {
      editor.api.dom.drag.start(
        { clientX: 0, clientY: 0, dataTransfer: dataTransfer as never },
        { node: editorGetSnapshot(editor).children[0] as never }
      );

      // Drop back on the dragged block itself
      const overA = at([0], 0);
      const dropEvent = createDragEvent(hosts[0], dataTransfer);

      applyEditableDrop({
        editor,
        event: dropEvent,
        readOnly: false,
        state,
      });
      overA.mockRestore();

      // The block list must be unchanged — no duplication
      expect(texts(editor)).toEqual(['a', 'b', 'c']);
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('indicator line rect is identical for "P1 after" and "P2 before" when adjacent', () => {
    const { at, dataTransfer, editor, hosts, root, state } = setup();

    try {
      editor.api.dom.drag.start(
        { clientX: 0, clientY: 0, dataTransfer: dataTransfer as never },
        { node: editorGetSnapshot(editor).children[0] as never }
      );

      // "P2 after" → indicator between b and c
      const overB = at([1], 1);

      applyEditableDragOver({
        editor,
        event: createDragEvent(hosts[1], dataTransfer),
        state,
      });
      overB.mockRestore();

      const indicatorAfterB = readDropIndicator(editor);

      // "P3 before" → indicator between b and c
      const overC = at([2], 0);

      applyEditableDragOver({
        editor,
        event: createDragEvent(hosts[2], dataTransfer),
        state,
      });
      overC.mockRestore();

      const indicatorBeforeC = readDropIndicator(editor);

      expect(indicatorAfterB).not.toBe(null);
      expect(indicatorBeforeC).not.toBe(null);
      // Both indicators must produce the identical line rectangle
      expect(indicatorAfterB!.line).toEqual(indicatorBeforeC!.line);
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('Alt (macOS) / Ctrl (other) modifier during block drag sets copy dropEffect', () => {
    const { at, dataTransfer, editor, hosts, root, state } = setup();

    try {
      editor.api.dom.drag.start(
        { clientX: 0, clientY: 0, dataTransfer: dataTransfer as never },
        { node: editorGetSnapshot(editor).children[0] as never }
      );

      const overC = at([2], 1);
      // Create an event with the platform copy modifier (altKey for Apple, ctrlKey otherwise).
      // jsdom typically does not identify as Apple, so ctrlKey is the modifier.
      const event = {
        ...createDragEvent(hosts[2], dataTransfer),
        ctrlKey: true,
        altKey: true,
      } as unknown as DragEvent<HTMLDivElement>;

      applyEditableDragOver({ editor, event, state });
      overC.mockRestore();

      expect(dataTransfer.dropEffect).toBe('copy');
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });
});
