import {
  defineEditorSchema,
  type Descendant,
  type Range,
  schema,
} from 'plitejs';
import type { ClipboardEvent, DragEvent } from 'react';

import {
  DOMCoverage,
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from '../../src/dom/internal';
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

const mountEditorRoot = (editor: ReactRuntimeEditor) => {
  const root = document.createElement('div');

  root.setAttribute('contenteditable', 'true');
  root.setAttribute('data-plite-editor', 'true');
  Object.defineProperty(root, 'isContentEditable', {
    configurable: true,
    value: true,
  });
  document.body.append(root);

  EDITOR_TO_ELEMENT.set(editor, root);
  EDITOR_TO_WINDOW.set(editor, window);
  ELEMENT_TO_NODE.set(root, editor);
  NODE_TO_ELEMENT.set(editor, root);

  return root;
};

const mountVisibleDragTarget = (root: HTMLElement) => {
  const target = document.createElement('p');

  target.setAttribute('data-plite-node', 'element');
  target.setAttribute('data-plite-path', '1');
  root.append(target);

  return target;
};

const mountInternalControlDragTarget = (root: HTMLElement) => {
  const host = document.createElement('p');
  const button = document.createElement('button');

  host.setAttribute('data-plite-node', 'element');
  host.setAttribute('data-plite-path', '0');
  button.type = 'button';
  button.textContent = 'Internal control';
  host.append(button);
  root.append(host);

  return button;
};

const decodeFragmentPayload = (payload: string) =>
  JSON.parse(decodeURIComponent(window.atob(payload)));

const createHiddenSelectionEditor = () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 'Hidden alpha'.length, path: [0, 1, 0] },
    },
  });

  DOMCoverage.registerBoundary(editor, {
    anchor: { nodeKey: getNodeKey(editor, [0, 0]), type: 'summary-slot' },
    boundaryId: 'section-body',
    copyPolicy: 'model',
    coveredPathRanges: [{ kind: 'text', anchor: [0, 1], focus: [0, 1] }],
    coveredRuntimeRanges: [
      {
        kind: 'text',
        anchor: getNodeKey(editor, [0, 1]),
        focus: getNodeKey(editor, [0, 1]),
      },
    ],
    findPolicy: 'native',
    ownerPath: [0],
    ownerNodeKey: getNodeKey(editor, [0]),
    reason: 'app-collapse',
    selectionPolicy: 'skip',
    state: 'intentionally-hidden',
    version: 1,
  });

  return editor;
};

const createStagedSelectionEditor = () => {
  const editor = createEditor();

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

  DOMCoverage.registerBoundary(editor, {
    anchor: { nodeKey: getNodeKey(editor, [1]), type: 'placeholder' },
    boundaryId: 'rendering-staged:pending',
    copyPolicy: 'materialize',
    coveredPathRanges: [{ kind: 'text', anchor: [1], focus: [1] }],
    coveredRuntimeRanges: [
      {
        kind: 'text',
        anchor: getNodeKey(editor, [1]),
        focus: getNodeKey(editor, [1]),
      },
    ],
    findPolicy: 'native',
    ownerPath: [],
    ownerNodeKey: null,
    reason: 'rendering-staged',
    selectionPolicy: 'materialize',
    state: 'pending-mount',
    version: 1,
  });

  return editor;
};

const cleanupEditorRoot = (editor: ReactRuntimeEditor, root: HTMLElement) => {
  DOMCoverage.clear(editor);
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
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target,
  }) as unknown as ClipboardEvent<HTMLDivElement>;

const createDragEvent = (target: EventTarget, dataTransfer: FakeDataTransfer) =>
  ({
    dataTransfer,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target,
  }) as unknown as DragEvent<HTMLDivElement>;

const runCrossEditorTextDrop = ({
  copy = false,
  dropPayload = 'source',
  editSource = false,
  failFirstDrop = false,
}: {
  copy?: boolean;
  dropPayload?: 'empty' | 'external' | 'source';
  editSource?: boolean;
  failFirstDrop?: boolean;
} = {}) => {
  const source = createEditor({
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: 'Alpha Bravo' }],
      },
    ],
  });
  const target = createEditor({
    initialValue: [
      {
        type: 'paragraph',
        children: [{ text: 'Charlie' }],
      },
    ],
  });
  const bystander = createEditor({
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
  const dropRange: Range = {
    kind: 'text',
    anchor: { offset: 'Charlie'.length, path: [0, 0] },
    focus: { offset: 'Charlie'.length, path: [0, 0] },
  };
  let resolvedDropRange: Range | null = failFirstDrop ? null : dropRange;
  const resolveEventRange = jest
    .spyOn(ReactEditor, 'resolveEventRange')
    .mockImplementation(() => resolvedDropRange);

  sourceNode.setAttribute('data-plite-path', '0');

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

describe('DOM coverage native bridge', () => {
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
      expect(clipboard.getData('application/x-plite-fragment')).not.toBe('');
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
        partialDOMBackedSelection: false,
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
    const state = { isDraggingInternally: false };

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
    const editor = createEditor();

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
    const resolveEventRange = jest
      .spyOn(ReactEditor, 'resolveEventRange')
      .mockReturnValue({
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });

    dataTransfer.setData('text/plain', 'Dropped text');

    try {
      const result = applyEditableDrop({
        editor,
        event,
        readOnly: false,
        state: { isDraggingInternally: false },
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
      extensions: [blockVideoSchema],
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
    const resolveEventRange = jest
      .spyOn(ReactEditor, 'resolveEventRange')
      .mockReturnValue({
        kind: 'text',
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
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [2, 0] },
          focus: { offset: 0, path: [2, 0] },
        },
      });
    } finally {
      resolveEventRange.mockRestore();
      cleanupEditorRoot(editor, root);
    }
  });

  test('internal collapsed text drop does not delete the source character', () => {
    const editor = createEditor();

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
    const draggedRange: Range = {
      kind: 'text',
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    };
    const resolveEventRange = jest
      .spyOn(ReactEditor, 'resolveEventRange')
      .mockReturnValue({
        kind: 'text',
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
    const editor = createEditor({
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
    source.setAttribute('data-plite-path', '0');
    const dataTransfer = new FakeDataTransfer();
    const state = {
      draggedBlock: false,
      draggedRange: null,
      isDraggingInternally: false,
    };
    const resolveEventRange = jest
      .spyOn(ReactEditor, 'resolveEventRange')
      .mockReturnValue({
        kind: 'text',
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

      expect(dataTransfer.getData('application/x-plite-fragment')).not.toBe('');
      applyEditableDrop({
        editor,
        event: createDragEvent(root, dataTransfer),
        readOnly: false,
        state,
      });

      expect(editorString(editor, [])).toBe(
        'editableThis is  plain text, just like a <textarea>!'
      );
      expect(editorGetSnapshot(editor).selection).toEqual({
        kind: 'text',
        anchor: { offset: 8, path: [0, 0] },
        focus: { offset: 8, path: [0, 0] },
      });
    } finally {
      resolveEventRange.mockRestore();
      cleanupEditorRoot(editor, root);
    }
  });

  test('cross-editor expanded text drop removes the captured source range', () => {
    expect(runCrossEditorTextDrop()).toEqual({
      bystander: 'Echo',
      source: 'Bravo',
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

  test('failed cross-editor landing clears source deletion authority', () => {
    expect(runCrossEditorTextDrop({ failFirstDrop: true })).toEqual({
      bystander: 'Echo',
      source: 'Alpha Bravo',
      target: 'CharlieAlpha ',
    });
  });

  test('repeated external plain text drops preserve earlier inserted text', () => {
    const editor = createEditor();

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
    const resolveEventRange = jest
      .spyOn(ReactEditor, 'resolveEventRange')
      .mockReturnValueOnce({
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      })
      .mockReturnValueOnce({
        kind: 'text',
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
          state: { isDraggingInternally: false },
        });

        expect(event.preventDefault).toHaveBeenCalled();
        expect(result.command).toMatchObject({ kind: 'insert-data' });
      }

      expect(editorString(editor, [])).toBe('First Second Original text');
      expect(editorGetSnapshot(editor).selection).toEqual({
        kind: 'text',
        anchor: { offset: 'First Second '.length, path: [0, 0] },
        focus: { offset: 'First Second '.length, path: [0, 0] },
      });
    } finally {
      resolveEventRange.mockRestore();
      cleanupEditorRoot(editor, root);
    }
  });

  test('drag and drop on internal controls does not run editor-owned handling', () => {
    const editor = createEditor();

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
    const dragState = { isDraggingInternally: false };
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
    const editor = createEditor();

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
        state: { isDraggingInternally: false },
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
    const editor = createEditor();

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
        partialDOMBackedSelection: false,
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
    const editor = createEditor();

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
    const onPaste = jest.fn(() => true);

    clipboard.setData('text/plain', 'Pasted text');

    try {
      const result = applyEditablePaste({
        editor,
        event,
        onPaste,
        readOnly: true,
        partialDOMBackedSelection: false,
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
    const editor = createEditor();

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
        partialDOMBackedSelection: false,
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
    const editor = createEditor();

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
        partialDOMBackedSelection: false,
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(result.command).toMatchObject({ kind: 'insert-data' });
      expect(editorString(editor, [])).toBe('New text');
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('copy over a pending staged root group materializes the coverage boundary and writes model data', () => {
    const editor = createStagedSelectionEditor();
    const root = mountEditorRoot(editor);
    const clipboard = new FakeDataTransfer();
    const materialized: string[] = [];
    const staleDom = document.createElement('span');

    staleDom.textContent = 'STALE PENDING DOM';
    document.body.append(staleDom);
    DOMCoverage.setMaterializeHandler(editor, (boundary, reason, options) => {
      materialized.push(
        `${boundary.boundaryId}:${reason}:${options.range ? editorString(editor, options.range) : ''}`
      );
      return true;
    });

    try {
      applyEditableCopy({
        editor,
        event: createClipboardEvent(root, clipboard),
      });

      expect(materialized).toEqual([
        'rendering-staged:pending:copy:Pending omega',
      ]);
      expect(clipboard.getData('text/plain')).toBe('Pending omega');
      expect(clipboard.getData('text/html')).toContain('Pending omega');
      expect(clipboard.getData('text/html')).not.toContain('STALE');
      expect(clipboard.getData('application/x-plite-fragment')).not.toBe('');
    } finally {
      staleDom.remove();
      cleanupEditorRoot(editor, root);
    }
  });

  test('paste over a pending staged root group materializes before mutating the model', () => {
    const editor = createStagedSelectionEditor();
    const root = mountEditorRoot(editor);
    const clipboard = new FakeDataTransfer();
    const materialized: string[] = [];
    const staleDom = document.createElement('span');

    clipboard.setData('text/plain', 'Pasted omega');
    staleDom.textContent = 'STALE PENDING DOM';
    document.body.append(staleDom);
    DOMCoverage.setMaterializeHandler(editor, (boundary, reason, options) => {
      materialized.push(
        `${boundary.boundaryId}:${reason}:${options.range ? editorString(editor, options.range) : ''}`
      );
      return true;
    });

    try {
      const result = applyEditablePaste({
        editor,
        event: createClipboardEvent(root, clipboard),
        readOnly: false,
        partialDOMBackedSelection: false,
      });

      expect(materialized).toEqual([
        'rendering-staged:pending:paste:Pending omega',
      ]);
      expect(result.command).toMatchObject({ kind: 'insert-data' });
      expect(editorString(editor, [1])).toBe('Pasted omega');
      expect(staleDom.textContent).toBe('STALE PENDING DOM');
    } finally {
      staleDom.remove();
      cleanupEditorRoot(editor, root);
    }
  });

  test('cutting a selected block void writes model data, deletes once, and requests model-owned repair', () => {
    const editor = createEditor();

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

      const encoded = clipboard.getData('application/x-plite-fragment');

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
});
