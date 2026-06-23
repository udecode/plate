import type { ClipboardEvent, DragEvent } from 'react';
import { type Descendant } from '@platejs/plite';
import { Editor } from '@platejs/plite/internal';
import {
  DOMCoverage,
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from '@platejs/plite-dom/internal';

import { createReactEditor } from '../src';
import {
  applyEditableCopy,
  applyEditableCut,
  applyEditableDragOver,
  applyEditableDragStart,
  applyEditableDrop,
  applyEditablePaste,
} from '../src/editable/clipboard-input-strategy';
import {
  ReactEditor,
  type ReactRuntimeEditor,
} from '../src/plugin/react-editor';

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

const getRuntimeId = (editor: ReactRuntimeEditor, path: number[]) => {
  const runtimeId = Editor.getRuntimeId(editor, path);

  if (!runtimeId) {
    throw new Error(`Missing runtime id at ${path.join('.')}`);
  }

  return runtimeId;
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
  const editor = createReactEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 'Hidden alpha'.length, path: [0, 1, 0] },
    },
  });

  DOMCoverage.registerBoundary(editor, {
    anchor: { runtimeId: getRuntimeId(editor, [0, 0]), type: 'summary-slot' },
    boundaryId: 'section-body',
    copyPolicy: 'model',
    coveredPathRanges: [{ anchor: [0, 1], focus: [0, 1] }],
    coveredRuntimeRanges: [
      {
        anchor: getRuntimeId(editor, [0, 1]),
        focus: getRuntimeId(editor, [0, 1]),
      },
    ],
    findPolicy: 'native',
    ownerPath: [0],
    ownerRuntimeId: getRuntimeId(editor, [0]),
    reason: 'app-collapse',
    selectionPolicy: 'skip',
    state: 'intentionally-hidden',
    version: 1,
  });

  return editor;
};

const createStagedSelectionEditor = () => {
  const editor = createReactEditor();

  Editor.replace(editor, {
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
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 'Pending omega'.length, path: [1, 0] },
    },
  });

  DOMCoverage.registerBoundary(editor, {
    anchor: { runtimeId: getRuntimeId(editor, [1]), type: 'placeholder' },
    boundaryId: 'rendering-staged:pending',
    copyPolicy: 'materialize',
    coveredPathRanges: [{ anchor: [1], focus: [1] }],
    coveredRuntimeRanges: [
      {
        anchor: getRuntimeId(editor, [1]),
        focus: getRuntimeId(editor, [1]),
      },
    ],
    findPolicy: 'native',
    ownerPath: [],
    ownerRuntimeId: null,
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
      expect(Editor.string(editor, [0, 1])).toBe('Pasted alpha');
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
      expect(dataTransfer.effectAllowed).toBe('move');
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
      applyEditableDragOver({
        editor,
        event,
        state: {
          draggedBlock: false,
          draggedRange: null,
          isDraggingInternally: true,
        },
      });

      expect(dataTransfer.dropEffect).toBe('move');
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('drop inserts plain text data at the resolved event range', () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Original text' }],
        },
      ],
      selection: {
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
      expect(Editor.string(editor, [])).toBe('Dropped textOriginal text');
      expect(Editor.getSnapshot(editor).selection).toEqual({
        anchor: { offset: 'Dropped text'.length, path: [0, 0] },
        focus: { offset: 'Dropped text'.length, path: [0, 0] },
      });
    } finally {
      resolveEventRange.mockRestore();
      cleanupEditorRoot(editor, root);
    }
  });

  test('repeated external plain text drops preserve earlier inserted text', () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Original text' }],
        },
      ],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });

    const root = mountEditorRoot(editor);
    const resolveEventRange = jest
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
          state: { isDraggingInternally: false },
        });

        expect(event.preventDefault).toHaveBeenCalled();
        expect(result.command).toMatchObject({ kind: 'insert-data' });
      }

      expect(Editor.string(editor, [])).toBe('First Second Original text');
      expect(Editor.getSnapshot(editor).selection).toEqual({
        anchor: { offset: 'First Second '.length, path: [0, 0] },
        focus: { offset: 'First Second '.length, path: [0, 0] },
      });
    } finally {
      resolveEventRange.mockRestore();
      cleanupEditorRoot(editor, root);
    }
  });

  test('drag and drop on internal controls does not run editor-owned handling', () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Original text' }],
        },
      ],
      selection: {
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
      expect(Editor.string(editor, [])).toBe('Original text');
      expect(Editor.getSnapshot(editor).selection).toEqual({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 'Original text'.length, path: [0, 0] },
      });
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('drop is ignored when the editor is read-only', () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Original text' }],
        },
      ],
      selection: {
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
      expect(Editor.string(editor, [])).toBe('Original text');
      expect(Editor.getSnapshot(editor).selection).toEqual({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 'Original text'.length, path: [0, 0] },
      });
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('paste is ignored when the editor is read-only', () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Original text' }],
        },
      ],
      selection: {
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
      expect(Editor.string(editor, [])).toBe('Original text');
      expect(Editor.getSnapshot(editor).selection).toEqual({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 'Original text'.length, path: [0, 0] },
      });
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('read-only paste prevents native default even when custom handler returns handled', () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Original text' }],
        },
      ],
      selection: {
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
      expect(Editor.string(editor, [])).toBe('Original text');
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('paste is ignored when the application handler owns the event', () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Original text' }],
        },
      ],
      selection: {
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
      expect(Editor.string(editor, [])).toBe('Original text');
      expect(Editor.getSnapshot(editor).selection).toEqual({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 'Original text'.length, path: [0, 0] },
      });
    } finally {
      cleanupEditorRoot(editor, root);
    }
  });

  test('paste uses clipboard data mutated by an unhandled app paste callback', () => {
    const editor = createReactEditor();

    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Original text' }],
        },
      ],
      selection: {
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
      expect(Editor.string(editor, [])).toBe('New text');
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
        `${boundary.boundaryId}:${reason}:${options.range ? Editor.string(editor, options.range) : ''}`
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
        `${boundary.boundaryId}:${reason}:${options.range ? Editor.string(editor, options.range) : ''}`
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
      expect(Editor.string(editor, [1])).toBe('Pasted omega');
      expect(staleDom.textContent).toBe('STALE PENDING DOM');
    } finally {
      staleDom.remove();
      cleanupEditorRoot(editor, root);
    }
  });

  test('cutting a selected block void writes model data, deletes once, and requests model-owned repair', () => {
    const editor = createReactEditor();

    editor.extend({
      elements: [{ type: 'image', void: 'block' }],
      name: 'block-void-cut',
    });
    Editor.replace(editor, {
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
      expect(decodeFragmentPayload(encoded)).toEqual([
        {
          type: 'image',
          url: 'about:blank',
          children: [{ text: '' }],
        },
      ]);
      expect(Editor.getSnapshot(editor).children).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'before' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'after' }],
        },
      ]);
      expect(Editor.getSnapshot(editor).selection).toEqual({
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
