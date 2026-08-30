import {
  createEditor as createCoreEditor,
  createEditorView,
  defineEditorSchema,
  schema,
  type RootKey,
} from 'plitejs';
import { dom } from 'plitejs/dom';

import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  IS_NODE_MAP_DIRTY,
  NODE_TO_ELEMENT,
} from '../../src/dom/internal';
import {
  getSelection as editorGetSelection,
  replace as editorReplace,
} from '../../src/internal';
import {
  EditableDOMRuntime,
  findMountedEditableDOMRuntime,
  getMountedEditableDOMRuntime,
} from '../../src/react/editable/editable-dom-runtime';
import {
  isInteractiveInternalTarget,
  isNestedEditableDOMTarget,
} from '../../src/react/editable/input-controller';
import { createEditableInputController } from '../../src/react/editable/input-state';
import { writeCollapsedModelSelectionDOMPreference } from '../../src/react/editable/model-selection-dom-preference';
import {
  applyEditableDOMSelectionChange,
  armModelOwnedTextInputGuard,
  completeEditableSelectionChangeImport,
  executeEditableSelectionExport,
  executeEditableSelectionImport,
  getPendingNativeTextInputRepairSelectionChangePolicy,
  isEditableModelSelectionPreferredForInput,
  isSelectionInEditorView,
  isStaleModelOwnedTextInputDOMRange,
  prepareEditableSelectionChangeImport,
  setEditableModelSelectionPreference,
  shouldApplyDOMSelectionChange,
  shouldForceModelOwnedTextInput,
  shouldImportChangedExpandedDOMSelection,
  shouldSuppressCollapsedSelectionMoveDOMRange,
  syncEditableDOMSelectionToEditor as syncRuntimeDOMSelectionToEditor,
} from '../../src/react/editable/selection-controller';
import { ReactEditor } from '../../src/react/plugin/react-editor';
import { createEditor, react } from '../../src/react/plugin/with-react';
import { createPliteProjectionGraph } from '../../src/react/projection-graph';
import {
  createPliteViewSelection,
  readPliteViewSelection,
  writePliteViewSelection,
} from '../../src/react/view-selection';

const testRuntimes = new Set<EditableDOMRuntime>();
const syncEditableDOMSelectionToEditor = (
  options: Parameters<typeof syncRuntimeDOMSelectionToEditor>[0]
) => {
  const root =
    options.editorElement ??
    EDITOR_TO_ELEMENT.get(options.editor) ??
    (() => {
      try {
        return ReactEditor.assertDOMNode(options.editor, options.editor);
      } catch {
        return null;
      }
    })();
  const mountedRuntime = root
    ? findMountedEditableDOMRuntime(root)
    : getMountedEditableDOMRuntime(options.editor);

  if (!mountedRuntime) {
    const runtime = new EditableDOMRuntime({ editor: options.editor });

    if (root instanceof HTMLDivElement) runtime.setRoot(root);
    runtime.connect();
    testRuntimes.add(runtime);
  }

  syncRuntimeDOMSelectionToEditor(options);
};

afterEach(() => {
  for (const runtime of testRuntimes) runtime.destroy();
  testRuntimes.clear();
});

const PROJECTED_SELECTION_ROOT: RootKey = 'selection-controller:projected-root';

const projectedSelectionSchema = defineEditorSchema(
  'schema:selection-controller-projected-selection',
  {
    elements: {
      paragraph: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
      'content-card': {
        content: schema.content.open(),
        contentRoots: {
          body: schema.content.not(schema.content.text()),
        },
        void: 'editable-island',
      },
    },
    id: 'selection-controller-projected-selection',
    root: schema.content.not(schema.content.text()),
    unknown: 'preserve',
    version: 1,
  }
);

const markEditable = (element: HTMLElement) => {
  Object.defineProperty(element, 'isContentEditable', {
    configurable: true,
    value: true,
  });
};

test('selection import executes only for import-dom policy', () => {
  let calls = 0;
  const importSelection = () => {
    calls += 1;
  };

  expect(
    executeEditableSelectionImport({
      importSelection,
      selectionPolicy: { kind: 'preserve-model', reason: 'model-owned' },
    })
  ).toBe(false);
  expect(calls).toBe(0);

  expect(
    executeEditableSelectionImport({
      importSelection,
      selectionPolicy: { kind: 'import-dom', reason: 'native-selection' },
    })
  ).toBe(true);
  expect(calls).toBe(1);
});

test('model-owned text input guard rejects stale native collapsed ranges', () => {
  const modelSelection = {
    kind: 'text',
    anchor: { path: [0, 0], offset: 8 },
    focus: { path: [0, 0], offset: 8 },
  };
  const staleRange = {
    kind: 'text',
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  };

  expect(
    isStaleModelOwnedTextInputDOMRange({
      activeIntent: 'text-insert',
      modelOwnedTextInputGuard: 1,
      modelSelection,
      range: staleRange,
      selectionSource: 'model-owned',
    })
  ).toBe(true);
  expect(
    isStaleModelOwnedTextInputDOMRange({
      activeIntent: 'text-insert',
      modelOwnedTextInputGuard: 0,
      modelSelection,
      range: staleRange,
      selectionSource: 'model-owned',
    })
  ).toBe(true);
  expect(
    isStaleModelOwnedTextInputDOMRange({
      activeIntent: 'text-insert',
      modelOwnedTextInputGuard: 0,
      modelSelection,
      range: staleRange,
      selectionSource: 'dom-current',
    })
  ).toBe(false);
  expect(
    isStaleModelOwnedTextInputDOMRange({
      activeIntent: 'text-insert',
      modelOwnedTextInputGuard: 0,
      modelSelection,
      range: staleRange,
      recentTextInputRepairEcho: {
        expiresAt: 1000,
        pathKey: '0,0',
        selectionOffset: 8,
        text: 'This abc',
      },
      selectionSource: 'dom-current',
    })
  ).toBe(true);
  expect(
    isStaleModelOwnedTextInputDOMRange({
      activeIntent: 'native-selection-move',
      modelOwnedTextInputGuard: 1,
      modelSelection,
      range: staleRange,
      selectionSource: 'dom-current',
    })
  ).toBe(false);
  expect(
    isStaleModelOwnedTextInputDOMRange({
      activeIntent: 'text-insert',
      modelOwnedTextInputGuard: 1,
      modelSelection,
      range: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 9 },
        focus: { path: [0, 0], offset: 9 },
      },
      selectionSource: 'model-owned',
    })
  ).toBe(false);
  expect(
    isStaleModelOwnedTextInputDOMRange({
      activeIntent: 'text-insert',
      modelOwnedTextInputGuard: 1,
      modelSelection,
      range: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 9 },
        focus: { path: [0, 0], offset: 9 },
      },
      selectionSource: 'model-owned',
      textInputOwnership: 'model',
    })
  ).toBe(true);
  expect(
    isStaleModelOwnedTextInputDOMRange({
      activeIntent: 'text-insert',
      modelOwnedTextInputGuard: 0,
      modelSelection,
      range: {
        kind: 'text',
        anchor: { path: [12, 0], offset: 4 },
        focus: { path: [12, 0], offset: 4 },
      },
      selectionSource: 'model-owned',
    })
  ).toBe(true);
  expect(
    isStaleModelOwnedTextInputDOMRange({
      activeIntent: 'native-selection-move',
      modelOwnedTextInputGuard: 1,
      modelSelection,
      range: {
        kind: 'text',
        anchor: { path: [12, 0], offset: 4 },
        focus: { path: [12, 0], offset: 4 },
      },
      selectionSource: 'model-owned',
    })
  ).toBe(false);
});

test('selection export executes only for export-model policy', () => {
  let calls = 0;
  const exportSelection = () => {
    calls += 1;
  };

  expect(
    executeEditableSelectionExport({
      exportSelection,
      selectionPolicy: { kind: 'import-dom', reason: 'native-selection' },
    })
  ).toBe(false);
  expect(calls).toBe(0);

  expect(
    executeEditableSelectionExport({
      exportSelection,
      selectionPolicy: { kind: 'export-model', reason: 'model-owned' },
    })
  ).toBe(true);
  expect(calls).toBe(1);
});

test('nested editable DOM targets are owned by their closest editor root', () => {
  const outerEditor = document.createElement('div');
  const childEditor = document.createElement('div');
  const childText = document.createTextNode('child');

  outerEditor.setAttribute('data-plite-editor', 'true');
  childEditor.setAttribute('data-plite-editor', 'true');
  childEditor.append(childText);
  outerEditor.append(childEditor);

  expect(isNestedEditableDOMTarget(outerEditor, childText)).toBe(true);
  expect(isNestedEditableDOMTarget(childEditor, childText)).toBe(false);
  expect(isNestedEditableDOMTarget(outerEditor, outerEditor)).toBe(false);
});

test('nested editable DOM targets are interactive boundaries for containing editors', () => {
  const editor = createEditor();
  const outerEditor = document.createElement('div');
  const childEditor = document.createElement('div');
  const childText = document.createTextNode('child');

  outerEditor.setAttribute('data-plite-editor', 'true');
  childEditor.setAttribute('data-plite-editor', 'true');
  childEditor.append(childText);
  outerEditor.append(childEditor);

  vi.spyOn(ReactEditor, 'assertDOMNode').mockReturnValue(outerEditor);

  expect(isInteractiveInternalTarget(editor, childText)).toBe(true);

  vi.restoreAllMocks();
});

test('failed DOM selection export clears the updating guard', () => {
  vi.useFakeTimers();

  const editor = createEditor();
  const editorElement = document.createElement('div');
  const textNode = document.createTextNode('abc');
  const domSelection = document.getSelection();

  if (!domSelection) {
    throw new Error('Expected document selection');
  }

  editorElement.append(textNode);
  document.body.append(editorElement);

  const domRange = document.createRange();
  domRange.setStart(textNode, 0);
  domRange.setEnd(textNode, 1);

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abc' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  vi.spyOn(ReactEditor, 'findDocumentOrShadowRoot').mockReturnValue(document);
  vi.spyOn(ReactEditor, 'assertDOMNode').mockReturnValue(editorElement);
  vi.spyOn(ReactEditor, 'resolveDOMRange').mockReturnValue(domRange);
  vi.spyOn(domSelection, 'setBaseAndExtent').mockImplementation(() => {
    throw new Error('stale DOM bridge');
  });

  const state = {
    isUpdatingSelection: false,
    selectionChangeOrigin: null,
  };

  try {
    syncEditableDOMSelectionToEditor({
      editor,
      scrollSelectionIntoView: vi.fn(),
      partialDOMBackedSelection: false,
      state,
    });

    expect(state.isUpdatingSelection).toBe(true);

    vi.runOnlyPendingTimers();

    expect(state.isUpdatingSelection).toBe(false);
    expect(state.selectionChangeOrigin).toBe('programmatic-export');
  } finally {
    editorElement.remove();
    vi.useRealTimers();
    vi.restoreAllMocks();
  }
});

test('model selection export preserves a focused editor control', () => {
  const editor = createEditor();
  const editorElement = document.createElement('div');
  const input = document.createElement('input');

  editorElement.append(input);
  document.body.append(editorElement);
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abc' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  vi.spyOn(ReactEditor, 'findDocumentOrShadowRoot').mockReturnValue(document);
  const resolveDOMRange = vi.spyOn(ReactEditor, 'resolveDOMRange');
  input.focus();

  try {
    syncEditableDOMSelectionToEditor({
      editor,
      editorElement,
      scrollSelectionIntoView: vi.fn(),
      partialDOMBackedSelection: false,
      state: {
        isUpdatingSelection: false,
        outsideFocusBoundarySettleUntil: 0,
        selectionChangeOrigin: null,
      },
    });

    expect(document.activeElement).toBe(input);
    expect(resolveDOMRange).not.toHaveBeenCalled();
  } finally {
    editorElement.remove();
    vi.restoreAllMocks();
  }
});

test('native selection drag keeps DOM selection and scroll under browser ownership', () => {
  vi.useFakeTimers();

  const editor = createEditor();
  const editorElement = document.createElement('div');
  const textNode = document.createTextNode('abc');
  const domSelection = document.getSelection();

  if (!domSelection) {
    throw new Error('Expected document selection');
  }

  editorElement.append(textNode);
  document.body.append(editorElement);

  const domRange = document.createRange();
  domRange.setStart(textNode, 0);
  domRange.setEnd(textNode, 1);

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abc' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  domSelection.removeAllRanges();
  domSelection.addRange(domRange);

  vi.spyOn(ReactEditor, 'findDocumentOrShadowRoot').mockReturnValue(document);
  vi.spyOn(ReactEditor, 'assertDOMNode').mockReturnValue(editorElement);
  vi.spyOn(ReactEditor, 'resolveDOMRange').mockReturnValue(domRange);
  const removeAllRanges = vi.spyOn(domSelection, 'removeAllRanges');
  const addRange = vi.spyOn(domSelection, 'addRange');
  const setBaseAndExtent = vi.spyOn(domSelection, 'setBaseAndExtent');
  const runtime = new EditableDOMRuntime({ editor });

  runtime.setRoot(editorElement);
  runtime.connect();
  testRuntimes.add(runtime);

  try {
    const state = {
      isUpdatingSelection: false,
      outsideFocusBoundarySettleUntil: 0,
      selectionChangeOrigin: null,
    };

    runtime.inputController.state.isNativeSelectionDragActive = true;
    editorElement.scrollTop = 100;

    syncEditableDOMSelectionToEditor({
      editor,
      options: { forceModelExport: true, preserveScroll: true },
      scrollSelectionIntoView: vi.fn(),
      partialDOMBackedSelection: false,
      state,
    });

    expect(removeAllRanges).not.toHaveBeenCalled();
    expect(addRange).not.toHaveBeenCalled();
    expect(setBaseAndExtent).not.toHaveBeenCalled();
    expect(state.isUpdatingSelection).toBe(false);
    expect(state.selectionChangeOrigin).toBeNull();

    runtime.domPhaseScheduler.flush();
    expect(editorElement.scrollTop).toBe(100);

    runtime.inputController.state.isNativeSelectionDragActive = false;
    syncEditableDOMSelectionToEditor({
      editor,
      options: { forceModelExport: true, preserveScroll: true },
      scrollSelectionIntoView: vi.fn(),
      partialDOMBackedSelection: false,
      state,
    });

    expect(removeAllRanges).toHaveBeenCalledTimes(1);
    expect(addRange).toHaveBeenCalledWith(domRange);
    expect(setBaseAndExtent).toHaveBeenCalledWith(textNode, 0, textNode, 1);
  } finally {
    editorElement.remove();
    domSelection.removeAllRanges();
    vi.useRealTimers();
    vi.restoreAllMocks();
  }
});

test('view selection export clears stale native selection ranges', () => {
  vi.useFakeTimers();

  const editor = createEditor();
  const editorElement = document.createElement('div');
  const staleText = document.createTextNode('stale native highlight');
  const domSelection = document.getSelection();

  if (!domSelection) {
    throw new Error('Expected document selection');
  }

  editorElement.setAttribute('data-plite-editor', 'true');
  editorElement.append(staleText);
  document.body.append(editorElement);

  const staleRange = document.createRange();
  staleRange.setStart(staleText, 0);
  staleRange.setEnd(staleText, staleText.textContent.length);
  domSelection.removeAllRanges();
  domSelection.addRange(staleRange);

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'model selection' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 'model selection'.length },
    },
  });
  writePliteViewSelection(
    editor,
    createPliteViewSelection(
      createPliteProjectionGraph([{ path: [0], root: 'main' }]),
      {
        kind: 'text',
        anchor: { point: { path: [0, 0], offset: 0 } },
        focus: { point: { path: [0, 0], offset: 'model selection'.length } },
      }
    )
  );

  vi.spyOn(ReactEditor, 'findDocumentOrShadowRoot').mockReturnValue(document);
  vi.spyOn(ReactEditor, 'assertDOMNode').mockReturnValue(editorElement);

  const state = {
    isUpdatingSelection: false,
    selectionChangeOrigin: null,
  };

  try {
    syncEditableDOMSelectionToEditor({
      editor,
      scrollSelectionIntoView: vi.fn(),
      partialDOMBackedSelection: false,
      state,
    });

    expect(domSelection.rangeCount).toBe(0);
    expect(state.isUpdatingSelection).toBe(true);

    vi.runOnlyPendingTimers();

    expect(state.isUpdatingSelection).toBe(false);
    expect(state.selectionChangeOrigin).toBe('programmatic-export');
  } finally {
    editorElement.remove();
    domSelection.removeAllRanges();
    vi.useRealTimers();
    vi.restoreAllMocks();
  }
});

test('model selection export is owned by the matching root view only', () => {
  const runtime = createCoreEditor({
    initialValue: {
      children: [{ type: 'paragraph', children: [{ text: 'main' }] }],
      roots: { child: [{ type: 'paragraph', children: [{ text: 'child' }] }] },
    },
  });
  const mainEditor = createEditorView(runtime);
  const childEditor = createEditorView(runtime, { root: 'child' });

  childEditor.update((tx) => {
    tx.selection.set({
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  const childSelection = childEditor.read((state: any) => state.selection());

  expect(isSelectionInEditorView(mainEditor, childSelection)).toBe(false);
  expect(isSelectionInEditorView(childEditor, childSelection)).toBe(true);

  const resolveDOMRange = vi.spyOn(ReactEditor, 'resolveDOMRange');

  syncEditableDOMSelectionToEditor({
    editor: mainEditor,
    scrollSelectionIntoView: vi.fn(),
    partialDOMBackedSelection: false,
    state: {
      isUpdatingSelection: false,
      selectionChangeOrigin: null,
    },
  });

  expect(resolveDOMRange).not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

test('model selection export preserves preferred collapsed DOM point', () => {
  vi.useFakeTimers();

  const editor = createEditor();
  const editorElement = document.createElement('div');
  const firstLine = document.createTextNode('first line');
  const secondLine = document.createTextNode('second line');
  const domSelection = document.getSelection();
  const selection = {
    kind: 'text',
    anchor: { path: [0, 0], offset: firstLine.textContent.length },
    focus: { path: [0, 0], offset: firstLine.textContent.length },
  };

  if (!domSelection) {
    throw new Error('Expected document selection');
  }

  editorElement.setAttribute('data-plite-editor', 'true');
  editorElement.append(firstLine, secondLine);
  document.body.append(editorElement);

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          { text: `${firstLine.textContent}${secondLine.textContent}` },
        ],
      },
    ],
    selection,
  });

  vi.spyOn(ReactEditor, 'findDocumentOrShadowRoot').mockReturnValue(document);
  vi.spyOn(ReactEditor, 'assertDOMNode').mockReturnValue(editorElement);
  vi.spyOn(ReactEditor, 'resolveDOMRange').mockImplementation(() => {
    const fallbackRange = document.createRange();

    fallbackRange.setStart(firstLine, firstLine.textContent.length);
    fallbackRange.setEnd(firstLine, firstLine.textContent.length);

    return fallbackRange;
  });

  const runtime = new EditableDOMRuntime({ editor });

  runtime.setRoot(editorElement);
  runtime.connect();
  testRuntimes.add(runtime);

  writeCollapsedModelSelectionDOMPreference(editor, selection, {
    node: secondLine,
    offset: 0,
  });

  try {
    syncEditableDOMSelectionToEditor({
      editor,
      scrollSelectionIntoView: vi.fn(),
      partialDOMBackedSelection: false,
      state: {
        isUpdatingSelection: false,
        outsideFocusBoundarySettleUntil: 0,
        selectionChangeOrigin: null,
      },
    });

    expect(domSelection.anchorNode).toBe(secondLine);
    expect(domSelection.anchorOffset).toBe(0);
  } finally {
    editorElement.remove();
    vi.useRealTimers();
    vi.restoreAllMocks();
  }
});

test('native editor-owned selectionchange clears model preference before DOM import', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: null,
      selectionSource: 'model-owned',
    },
  });

  expect(
    prepareEditableSelectionChangeImport({
      domSelectionBelongsToEditor: true,
      inputController,
      selectionChangeOrigin: 'native-user',
    })
  ).toBe(true);
  expect(inputController.preferModelSelectionForInputRef.current).toBe(false);
  expect(inputController.state.selectionSource).toBe('dom-current');
});

test('native selectionchange outside the editor does not clear model preference', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: null,
      selectionSource: 'model-owned',
    },
  });

  expect(
    prepareEditableSelectionChangeImport({
      domSelectionBelongsToEditor: false,
      inputController,
      selectionChangeOrigin: 'native-user',
    })
  ).toBe(false);
  expect(inputController.preferModelSelectionForInputRef.current).toBe(true);
  expect(inputController.state.selectionSource).toBe('model-owned');
});

test('native editor-owned selectionchange with unresolved Plite range keeps model preference', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: null,
      selectionSource: 'model-owned',
    },
  });

  expect(
    prepareEditableSelectionChangeImport({
      domSelectionBelongsToEditor: true,
      domSelectionCanImport: false,
      inputController,
      selectionChangeOrigin: 'native-user',
    })
  ).toBe(false);
  expect(inputController.preferModelSelectionForInputRef.current).toBe(true);
  expect(inputController.state.selectionSource).toBe('model-owned');
});

test('repair-induced editor-owned selectionchange does not clear model preference', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: null,
      selectionSource: 'model-owned',
    },
  });

  expect(
    prepareEditableSelectionChangeImport({
      domSelectionBelongsToEditor: true,
      inputController,
      selectionChangeOrigin: 'repair-induced',
    })
  ).toBe(false);
  expect(inputController.preferModelSelectionForInputRef.current).toBe(true);
  expect(inputController.state.selectionSource).toBe('model-owned');
});

test('changed expanded DOM selection can override stale programmatic origin', () => {
  expect(
    shouldImportChangedExpandedDOMSelection({
      currentSelection: {
        kind: 'text',
        anchor: { path: [0, 1], offset: 8 },
        focus: { path: [0, 1], offset: 8 },
      },
      nextSelection: {
        kind: 'text',
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 8 },
      },
      selectionChangeOrigin: 'programmatic-export',
    })
  ).toBe(true);
});

test('changed expanded DOM selection import publishes a selection commit', () => {
  const editor = createEditor();
  const editorElement = document.createElement('div');
  const textNode = document.createTextNode('selection');
  const nextSelection = {
    kind: 'text' as const,
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 9 },
  };
  const domSelection = {
    anchorNode: textNode,
    anchorOffset: 0,
    focusNode: textNode,
    focusOffset: 9,
    isCollapsed: false,
    rangeCount: 1,
    removeAllRanges: vi.fn(),
    type: 'Range',
  } as unknown as globalThis.Selection;
  const root = {
    activeElement: editorElement,
    getSelection: () => domSelection,
  } as unknown as Document;
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: editorElement,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: 'native-user',
      selectionSource: 'dom-current',
    },
  });

  editorElement.setAttribute('data-plite-editor', 'true');
  editorElement.append(textNode);
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'selection' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 9 },
    },
  });
  IS_NODE_MAP_DIRTY.delete(editor);

  vi.spyOn(ReactEditor, 'assertDOMNode').mockReturnValue(editorElement);
  vi.spyOn(ReactEditor, 'findDocumentOrShadowRoot').mockReturnValue(root);
  const hasSelectableTarget = vi
    .spyOn(ReactEditor, 'hasSelectableTarget')
    .mockReturnValue(true);
  const resolvePliteRange = vi
    .spyOn(ReactEditor, 'resolvePliteRange')
    .mockReturnValue(nextSelection);

  const commits: Array<NonNullable<ReturnType<typeof editor.read.lastCommit>>> =
    [];
  const unsubscribe = editor.subscribe((_snapshot, commit) => {
    if (commit) commits.push(commit);
  });

  try {
    applyEditableDOMSelectionChange({
      androidInputManager: null,
      editor,
      inputController,
      processing: { current: false },
      readOnly: false,
      rerunOnDirtyNodeMap: vi.fn(),
    });

    expect(hasSelectableTarget).toHaveBeenCalledTimes(2);
    expect(resolvePliteRange).toHaveBeenCalledOnce();
    expect(inputController.preferModelSelectionForInputRef.current).toBe(false);
    expect(editorGetSelection(editor)).toEqual(nextSelection);
    expect(commits).toHaveLength(1);
    expect(commits[0]?.selectionChanged).toBe(true);
    expect(commits[0]?.changed.has('selection')).toBe(true);
  } finally {
    unsubscribe();
    vi.restoreAllMocks();
  }
});

test('projected DOM selection import publishes its anchor selection commit', () => {
  const runtime = createCoreEditor({
    extensions: [react({ dom: dom() }), projectedSelectionSchema],
    initialValue: {
      children: [
        { type: 'paragraph', children: [{ text: 'Before' }] },
        {
          type: 'content-card',
          childRoots: { body: PROJECTED_SELECTION_ROOT },
          children: [{ text: '' }],
        },
        { type: 'paragraph', children: [{ text: 'After' }] },
      ],
      roots: {
        [PROJECTED_SELECTION_ROOT]: [
          { type: 'paragraph', children: [{ text: 'Inside' }] },
        ],
      },
    },
  });
  const editor = createEditorView(runtime);
  const childEditor = createEditorView(runtime, {
    root: PROJECTED_SELECTION_ROOT,
  });
  const editorElement = document.createElement('div');
  const mainTextNode = document.createTextNode('Before');
  const ownerElement = document.createElement('div');
  const slotElement = document.createElement('div');
  const childEditorElement = document.createElement('div');
  const childTextNode = document.createTextNode('Inside');
  const domSelection = {
    anchorNode: mainTextNode,
    anchorOffset: 1,
    focusNode: childTextNode,
    focusOffset: 3,
    isCollapsed: false,
    rangeCount: 1,
    removeAllRanges: vi.fn(),
    type: 'Range',
  } as unknown as globalThis.Selection;
  const root = {
    activeElement: editorElement,
    getSelection: () => domSelection,
  } as unknown as Document;
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: editorElement,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: 'native-user',
      selectionSource: 'dom-current',
    },
  });

  editorElement.setAttribute('data-plite-editor', 'true');
  ownerElement.setAttribute('data-plite-node', 'element');
  ownerElement.setAttribute('data-plite-path', '1');
  slotElement.setAttribute('data-plite-content-root-slot', 'body');
  slotElement.setAttribute('data-plite-content-root-owner-path', '1');
  slotElement.setAttribute('data-plite-content-root-owner-root', 'main');
  childEditorElement.setAttribute('data-plite-editor', 'true');
  childEditorElement.setAttribute('data-plite-root', PROJECTED_SELECTION_ROOT);
  childEditorElement.append(childTextNode);
  slotElement.append(childEditorElement);
  ownerElement.append(slotElement);
  editorElement.append(mainTextNode, ownerElement);

  ELEMENT_TO_NODE.set(editorElement, editor);
  ELEMENT_TO_NODE.set(childEditorElement, childEditor);

  vi.spyOn(ReactEditor, 'assertDOMNode').mockReturnValue(editorElement);
  vi.spyOn(ReactEditor, 'findDocumentOrShadowRoot').mockReturnValue(root);
  vi.spyOn(ReactEditor, 'resolvePliteRange').mockImplementation(
    (_editor, domRange) => {
      const startContainer =
        'startContainer' in domRange
          ? domRange.startContainer
          : domRange.anchorNode;
      const point =
        startContainer === mainTextNode
          ? { path: [0, 0], offset: 1 }
          : { path: [0, 0], offset: 3 };

      return { kind: 'text', anchor: point, focus: point };
    }
  );

  const commits: Array<NonNullable<ReturnType<typeof editor.read.lastCommit>>> =
    [];
  const unsubscribe = editor.subscribe((_snapshot, commit) => {
    if (commit) commits.push(commit);
  });

  try {
    applyEditableDOMSelectionChange({
      androidInputManager: null,
      editor,
      inputController,
      processing: { current: false },
      readOnly: false,
      rerunOnDirtyNodeMap: vi.fn(),
    });

    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    expect(readPliteViewSelection(editor)?.focus.point.root).toBe(
      PROJECTED_SELECTION_ROOT
    );
    expect(domSelection.removeAllRanges).toHaveBeenCalledOnce();
    expect(commits).toHaveLength(1);
    expect(commits[0]?.selectionChanged).toBe(true);
    expect(commits[0]?.changed.has('selection')).toBe(true);
  } finally {
    unsubscribe();
    ELEMENT_TO_NODE.delete(editorElement);
    ELEMENT_TO_NODE.delete(childEditorElement);
    vi.restoreAllMocks();
  }
});

test('changed expanded DOM import ignores same, collapsed, and repair ranges', () => {
  const currentSelection = {
    kind: 'text',
    anchor: { path: [0, 1], offset: 8 },
    focus: { path: [0, 1], offset: 8 },
  };

  expect(
    shouldImportChangedExpandedDOMSelection({
      currentSelection,
      nextSelection: currentSelection,
      selectionChangeOrigin: 'programmatic-export',
    })
  ).toBe(false);
  expect(
    shouldImportChangedExpandedDOMSelection({
      currentSelection,
      nextSelection: {
        kind: 'text',
        anchor: { path: [0, 1], offset: 7 },
        focus: { path: [0, 1], offset: 7 },
      },
      selectionChangeOrigin: 'programmatic-export',
    })
  ).toBe(false);
  expect(
    shouldImportChangedExpandedDOMSelection({
      currentSelection,
      nextSelection: {
        kind: 'text',
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 8 },
      },
      selectionChangeOrigin: 'repair-induced',
    })
  ).toBe(false);
});

test('selection-move guard allows native collapse inside expanded selection', () => {
  const currentSelection = {
    kind: 'text',
    anchor: { path: [0, 0], offset: 8 },
    focus: { path: [0, 0], offset: 16 },
  };

  expect(
    shouldSuppressCollapsedSelectionMoveDOMRange({
      activeIntent: 'native-selection-move',
      currentSelection,
      nextSelection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 12 },
        focus: { path: [0, 0], offset: 12 },
      },
    })
  ).toBe(false);
  expect(
    shouldSuppressCollapsedSelectionMoveDOMRange({
      activeIntent: 'native-selection-move',
      currentSelection,
      nextSelection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 20 },
        focus: { path: [0, 0], offset: 20 },
      },
    })
  ).toBe(true);
  expect(
    shouldSuppressCollapsedSelectionMoveDOMRange({
      activeIntent: 'text-insert',
      currentSelection,
      nextSelection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 20 },
        focus: { path: [0, 0], offset: 20 },
      },
    })
  ).toBe(false);
});

test('DOM selectionchange import only accepts native collapsed changes', () => {
  expect(
    shouldApplyDOMSelectionChange({
      changedExpandedDOMSelection: false,
      selectionChangeOrigin: 'native-user',
    })
  ).toBe(true);
  expect(
    shouldApplyDOMSelectionChange({
      changedExpandedDOMSelection: false,
      selectionChangeOrigin: 'programmatic-export',
    })
  ).toBe(false);
  expect(
    shouldApplyDOMSelectionChange({
      changedExpandedDOMSelection: false,
      selectionChangeOrigin: 'repair-induced',
    })
  ).toBe(false);
  expect(
    shouldApplyDOMSelectionChange({
      changedExpandedDOMSelection: true,
      selectionChangeOrigin: 'programmatic-export',
    })
  ).toBe(true);
});

test('model-owned programmatic selectionchange keeps its ownership guard', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: 'programmatic-export',
      selectionSource: 'model-owned',
    },
  });

  completeEditableSelectionChangeImport({
    inputController,
    selectionChangeOrigin: 'programmatic-export',
  });

  expect(inputController.state.selectionChangeOrigin).toBe(
    'programmatic-export'
  );
  expect(inputController.preferModelSelectionForInputRef.current).toBe(true);
});

test('model-owned collapsed programmatic selectionchange skips DOM range resolution', () => {
  const editor = createEditor();
  const editorElement = document.createElement('div');
  const textNode = document.createTextNode('abc');
  const domSelection = document.getSelection();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: 'programmatic-export',
      selectionSource: 'model-owned',
    },
  });

  if (!domSelection) {
    throw new Error('Expected document selection');
  }

  editorElement.setAttribute('data-plite-editor', 'true');
  editorElement.append(textNode);
  document.body.append(editorElement);

  domSelection.setBaseAndExtent(textNode, 1, textNode, 1);

  vi.spyOn(ReactEditor, 'assertDOMNode').mockReturnValue(editorElement);
  vi.spyOn(ReactEditor, 'findDocumentOrShadowRoot').mockReturnValue(document);
  const resolvePliteRange = vi.spyOn(ReactEditor, 'resolvePliteRange');

  try {
    applyEditableDOMSelectionChange({
      androidInputManager: null,
      editor,
      inputController,
      processing: { current: false },
      readOnly: false,
      rerunOnDirtyNodeMap: vi.fn(),
    });

    expect(resolvePliteRange).not.toHaveBeenCalled();
    expect(inputController.preferModelSelectionForInputRef.current).toBe(true);
    expect(inputController.state.selectionSource).toBe('model-owned');
  } finally {
    domSelection.removeAllRanges();
    editorElement.remove();
    vi.restoreAllMocks();
  }
});

test('selectionchange ignores detached DOM endpoints before resolving Plite range', () => {
  const editor = createEditor();
  const editorElement = document.createElement('div');
  const staleTextHost = document.createElement('span');
  const staleTextNode = document.createTextNode('abc');
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: editorElement,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: 'native-user',
      selectionSource: 'dom-current',
    },
  });

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abc' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  editorElement.setAttribute('contenteditable', 'true');
  editorElement.setAttribute('data-plite-editor', 'true');
  staleTextHost.setAttribute('data-plite-node', 'text');
  staleTextHost.setAttribute('data-plite-path', '0,0');
  markEditable(editorElement);
  markEditable(staleTextHost);
  staleTextHost.append(staleTextNode);
  editorElement.append(staleTextHost);
  document.body.append(editorElement);

  EDITOR_TO_ELEMENT.set(editor, editorElement);
  EDITOR_TO_WINDOW.set(editor, window);
  ELEMENT_TO_NODE.set(editorElement, editor);
  NODE_TO_ELEMENT.set(editor, editorElement);

  staleTextHost.remove();

  const staleDOMSelection = {
    anchorNode: staleTextNode,
    anchorOffset: 1,
    focusNode: staleTextNode,
    focusOffset: 1,
    isCollapsed: true,
    rangeCount: 1,
    removeAllRanges: vi.fn(),
    type: 'Caret',
  } as unknown as Selection;
  const fakeRoot = {
    activeElement: editorElement,
    getSelection: () => staleDOMSelection,
  } as unknown as Document;

  expect(staleTextNode.isConnected).toBe(false);
  expect(ReactEditor.hasSelectableTarget(editor, staleTextNode)).toBe(false);

  vi.spyOn(ReactEditor, 'assertDOMNode').mockReturnValue(editorElement);
  vi.spyOn(ReactEditor, 'findDocumentOrShadowRoot').mockReturnValue(fakeRoot);
  const resolvePliteRange = vi.spyOn(ReactEditor, 'resolvePliteRange');

  try {
    applyEditableDOMSelectionChange({
      androidInputManager: null,
      editor,
      inputController,
      processing: { current: false },
      readOnly: false,
      rerunOnDirtyNodeMap: vi.fn(),
    });

    expect(resolvePliteRange).not.toHaveBeenCalled();
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
  } finally {
    editorElement.remove();
    EDITOR_TO_ELEMENT.delete(editor);
    EDITOR_TO_WINDOW.delete(editor);
    ELEMENT_TO_NODE.delete(editorElement);
    NODE_TO_ELEMENT.delete(editor);
    vi.restoreAllMocks();
  }
});

test('selectionchange ignores host-removal collapse outside the editor', () => {
  const editor = createEditor();
  const container = document.createElement('div');
  const editorElement = document.createElement('div');
  const textHost = document.createElement('span');
  const textNode = document.createTextNode('abc');
  const domSelection = document.getSelection();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: editorElement,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: 'native-user',
      selectionSource: 'model-owned',
    },
  });

  if (!domSelection) {
    throw new Error('Expected document selection');
  }

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abc' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  editorElement.setAttribute('contenteditable', 'true');
  editorElement.setAttribute('data-plite-editor', 'true');
  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  markEditable(editorElement);
  markEditable(textHost);
  textHost.append(textNode);
  editorElement.append(textHost);
  container.append(editorElement);
  document.body.append(container);

  EDITOR_TO_ELEMENT.set(editor, editorElement);
  EDITOR_TO_WINDOW.set(editor, window);
  ELEMENT_TO_NODE.set(editorElement, editor);
  NODE_TO_ELEMENT.set(editor, editorElement);

  editorElement.remove();
  domSelection.removeAllRanges();
  const outsideRange = document.createRange();
  outsideRange.setStart(container, 0);
  outsideRange.collapse(true);
  domSelection.addRange(outsideRange);

  vi.spyOn(ReactEditor, 'assertDOMNode').mockReturnValue(editorElement);
  vi.spyOn(ReactEditor, 'findDocumentOrShadowRoot').mockReturnValue(document);
  const resolvePliteRange = vi.spyOn(ReactEditor, 'resolvePliteRange');

  try {
    applyEditableDOMSelectionChange({
      androidInputManager: null,
      editor,
      inputController,
      processing: { current: false },
      readOnly: false,
      rerunOnDirtyNodeMap: vi.fn(),
    });

    expect(resolvePliteRange).not.toHaveBeenCalled();
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    expect(inputController.preferModelSelectionForInputRef.current).toBe(true);
    expect(inputController.state.selectionSource).toBe('model-owned');
  } finally {
    domSelection.removeAllRanges();
    container.remove();
    EDITOR_TO_ELEMENT.delete(editor);
    EDITOR_TO_WINDOW.delete(editor);
    ELEMENT_TO_NODE.delete(editorElement);
    NODE_TO_ELEMENT.delete(editor);
    vi.restoreAllMocks();
  }
});

test('selectionchange ignores removed shadow host empty native selection', () => {
  const editor = createEditor();
  const editorElement = document.createElement('div');
  const host = document.createElement('div');
  const shadowRoot = host.attachShadow({ mode: 'open' });
  const shadowText = document.createTextNode('abc');
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: editorElement,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: 'native-user',
      selectionSource: 'model-owned',
    },
  });

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abc' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  editorElement.setAttribute('contenteditable', 'true');
  editorElement.setAttribute('data-plite-editor', 'true');
  markEditable(editorElement);
  shadowRoot.append(shadowText);
  host.append(editorElement);
  document.body.append(host);

  EDITOR_TO_ELEMENT.set(editor, editorElement);
  EDITOR_TO_WINDOW.set(editor, window);
  ELEMENT_TO_NODE.set(editorElement, editor);
  NODE_TO_ELEMENT.set(editor, editorElement);

  host.remove();

  const emptySelection = {
    anchorNode: null,
    anchorOffset: 0,
    focusNode: null,
    focusOffset: 0,
    isCollapsed: true,
    rangeCount: 0,
    removeAllRanges: vi.fn(),
    type: 'None',
  } as unknown as Selection;
  const fakeRoot = {
    activeElement: editorElement,
    getSelection: () => emptySelection,
  } as unknown as Document;

  vi.spyOn(ReactEditor, 'assertDOMNode').mockReturnValue(editorElement);
  vi.spyOn(ReactEditor, 'findDocumentOrShadowRoot').mockReturnValue(fakeRoot);
  const resolvePliteRange = vi.spyOn(ReactEditor, 'resolvePliteRange');

  try {
    applyEditableDOMSelectionChange({
      androidInputManager: null,
      editor,
      inputController,
      processing: { current: false },
      readOnly: false,
      rerunOnDirtyNodeMap: vi.fn(),
    });

    expect(resolvePliteRange).not.toHaveBeenCalled();
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    expect(inputController.preferModelSelectionForInputRef.current).toBe(true);
    expect(inputController.state.selectionSource).toBe('model-owned');
    expect(emptySelection.removeAllRanges).not.toHaveBeenCalled();
  } finally {
    host.remove();
    EDITOR_TO_ELEMENT.delete(editor);
    EDITOR_TO_WINDOW.delete(editor);
    ELEMENT_TO_NODE.delete(editorElement);
    NODE_TO_ELEMENT.delete(editor);
    vi.restoreAllMocks();
  }
});

test('model-owned browser-handle selectionchange keeps its ownership guard', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: 'browser-handle',
      selectionSource: 'model-owned',
    },
  });

  completeEditableSelectionChangeImport({
    inputController,
    selectionChangeOrigin: 'browser-handle',
  });

  expect(inputController.state.selectionChangeOrigin).toBe('browser-handle');
  expect(inputController.preferModelSelectionForInputRef.current).toBe(true);
});

test('repair-induced selectionchange clears its origin after model repair', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: 'repair-induced',
      selectionSource: 'model-owned',
    },
  });

  completeEditableSelectionChangeImport({
    inputController,
    selectionChangeOrigin: 'repair-induced',
  });

  expect(inputController.state.selectionChangeOrigin).toBe(null);
  expect(inputController.preferModelSelectionForInputRef.current).toBe(true);
  expect(inputController.state.selectionSource).toBe('model-owned');
});

test('repair-induced text input selectionchange can keep DOM-current ownership', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: 'repair-induced',
      selectionSource: 'dom-current',
    },
  });

  completeEditableSelectionChangeImport({
    inputController,
    selectionChangeOrigin: 'repair-induced',
  });

  expect(inputController.state.selectionChangeOrigin).toBe(null);
  expect(inputController.preferModelSelectionForInputRef.current).toBe(false);
  expect(inputController.state.selectionSource).toBe('dom-current');
});

test('native selectionchange clears its origin after import handling', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: 'native-user',
      selectionSource: 'dom-current',
    },
  });

  completeEditableSelectionChangeImport({
    inputController,
    selectionChangeOrigin: 'native-user',
  });

  expect(inputController.state.selectionChangeOrigin).toBe(null);
});

test('pending native repair selectionchange policy suppresses stale same-path offsets and allows deliberate selections', () => {
  const samePendingPathSelection = {
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  };
  const otherPathClickSelection = {
    kind: 'text',
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  };
  const samePathExpandedSelection = {
    kind: 'text',
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 2 },
  };

  expect(
    getPendingNativeTextInputRepairSelectionChangePolicy({
      pendingNativeTextInputRepairPathKey: '0,0',
      range: null,
      selectionChangeOrigin: 'native-user',
    })
  ).toBe('suppress');
  expect(
    getPendingNativeTextInputRepairSelectionChangePolicy({
      pendingNativeTextInputRepairDOMOffset: 1,
      pendingNativeTextInputRepairOffset: 1,
      pendingNativeTextInputRepairPathKey: '0,0',
      range: samePendingPathSelection,
      selectionChangeOrigin: 'native-user',
    })
  ).toBe('clear-and-allow');
  expect(
    getPendingNativeTextInputRepairSelectionChangePolicy({
      pendingNativeTextInputRepairDOMOffset: 1,
      pendingNativeTextInputRepairOffset: 2,
      pendingNativeTextInputRepairPathKey: '0,0',
      range: samePendingPathSelection,
      selectionChangeOrigin: 'native-user',
    })
  ).toBe('suppress');
  expect(
    getPendingNativeTextInputRepairSelectionChangePolicy({
      activeIntent: 'text-insert',
      currentSelection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 7 },
        focus: { path: [0, 0], offset: 7 },
      },
      pendingNativeTextInputRepairDOMOffset: 6,
      pendingNativeTextInputRepairOffset: 6,
      pendingNativeTextInputRepairPathKey: '0,0',
      range: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      },
      selectionChangeOrigin: 'native-user',
    })
  ).toBe('suppress');
  expect(
    getPendingNativeTextInputRepairSelectionChangePolicy({
      activeIntent: 'text-insert',
      currentSelection: {
        kind: 'text',
        anchor: { path: [2500, 0], offset: 1 },
        focus: { path: [2500, 0], offset: 1 },
      },
      domSelectionTextBacked: false,
      pendingNativeTextInputRepairPathKey: '0,0',
      range: {
        kind: 'text',
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      },
      selectionChangeOrigin: 'native-user',
    })
  ).toBe('clear-and-allow');
  expect(
    getPendingNativeTextInputRepairSelectionChangePolicy({
      activeIntent: 'text-insert',
      currentSelection: {
        kind: 'text',
        anchor: { path: [2500, 0], offset: 1 },
        focus: { path: [2500, 0], offset: 1 },
      },
      domSelectionTextBacked: false,
      pendingNativeTextInputRepairPathKey: '0,0',
      range: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
      selectionChangeOrigin: 'native-user',
    })
  ).toBe('suppress');
  expect(
    getPendingNativeTextInputRepairSelectionChangePolicy({
      activeIntent: 'text-insert',
      currentSelection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 7 },
        focus: { path: [0, 0], offset: 7 },
      },
      pendingNativeTextInputRepairDOMOffset: 8,
      pendingNativeTextInputRepairOffset: 8,
      pendingNativeTextInputRepairPathKey: '0,0',
      range: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 8 },
        focus: { path: [0, 0], offset: 8 },
      },
      selectionChangeOrigin: 'native-user',
    })
  ).toBe('clear-and-allow');
  expect(
    getPendingNativeTextInputRepairSelectionChangePolicy({
      activeIntent: 'text-insert',
      currentSelection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 7 },
        focus: { path: [0, 0], offset: 7 },
      },
      pendingNativeTextInputRepairPathKey: null,
      range: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      },
      selectionChangeOrigin: 'native-user',
    })
  ).toBe('allow');
  expect(
    getPendingNativeTextInputRepairSelectionChangePolicy({
      activeIntent: 'text-insert',
      currentSelection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 7 },
        focus: { path: [0, 0], offset: 7 },
      },
      pendingNativeTextInputRepairPathKey: null,
      range: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
      selectionChangeOrigin: 'repair-induced',
    })
  ).toBe('suppress');
  expect(
    getPendingNativeTextInputRepairSelectionChangePolicy({
      activeIntent: 'text-insert',
      currentSelection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 7 },
        focus: { path: [0, 0], offset: 7 },
      },
      pendingNativeTextInputRepairPathKey: null,
      range: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 8 },
        focus: { path: [0, 0], offset: 8 },
      },
      selectionChangeOrigin: 'native-user',
    })
  ).toBe('allow');
  expect(
    getPendingNativeTextInputRepairSelectionChangePolicy({
      activeIntent: 'text-insert',
      currentSelection: {
        kind: 'text',
        anchor: { path: [2500, 0], offset: 1 },
        focus: { path: [2500, 0], offset: 1 },
      },
      domSelectionTextBacked: false,
      pendingNativeTextInputRepairPathKey: null,
      range: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
      selectionChangeOrigin: 'native-user',
    })
  ).toBe('allow');
  expect(
    getPendingNativeTextInputRepairSelectionChangePolicy({
      pendingNativeTextInputRepairPathKey: '0,0',
      range: otherPathClickSelection,
      selectionChangeOrigin: 'native-user',
    })
  ).toBe('clear-and-allow');
  expect(
    getPendingNativeTextInputRepairSelectionChangePolicy({
      pendingNativeTextInputRepairPathKey: '0,0',
      range: samePathExpandedSelection,
      selectionChangeOrigin: 'native-user',
    })
  ).toBe('clear-and-allow');
  expect(
    getPendingNativeTextInputRepairSelectionChangePolicy({
      pendingNativeTextInputRepairPathKey: '0,0',
      range: otherPathClickSelection,
      selectionChangeOrigin: 'programmatic-export',
    })
  ).toBe('allow');
});

test('native selection handoff clears stale programmatic text input guards', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: 'programmatic-export',
      selectionSource: 'model-owned',
    },
  });

  setEditableModelSelectionPreference({
    inputController,
    preferModelSelection: true,
    reason: 'programmatic-export',
    selectionSource: 'model-owned',
  });

  expect(
    isEditableModelSelectionPreferredForInput({
      inputController,
      inputType: 'insertText',
    })
  ).toBe(false);
  expect(
    isEditableModelSelectionPreferredForInput({
      inputController,
      inputType: 'deleteContentBackward',
    })
  ).toBe(true);
});

test('native selection preference preserves short model-owned input guard', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: null,
      selectionSource: 'model-owned',
    },
  });

  setEditableModelSelectionPreference({
    inputController,
    preferModelSelection: true,
    reason: 'model-command',
    selectionSource: 'model-owned',
  });
  armModelOwnedTextInputGuard({ inputController });

  setEditableModelSelectionPreference({
    inputController,
    preferModelSelection: false,
    reason: 'native-selection',
    selectionSource: 'dom-current',
  });

  expect(inputController.state.modelOwnedTextInputGuard).toBe(0);
  expect(
    shouldForceModelOwnedTextInput({
      inputController,
      inputType: 'insertText',
    })
  ).toBe(false);
});

test('native insertText preserves explicit model-owned input guards', () => {
  for (const reason of [
    'browser-handle',
    'composition',
    'internal-control',
    'model-command',
    'partial-dom-backed',
    'repair-induced',
  ] as const) {
    const inputController = createEditableInputController({
      preferModelSelectionForInputRef: { current: true },
      state: {
        activeIntent: null,
        isComposing: false,
        isDraggingInternally: false,
        isUpdatingSelection: false,
        latestElement: null,
        pendingDOMSelectionImport: false,
        selectionChangeOrigin: null,
        selectionSource: 'model-owned',
      },
    });

    setEditableModelSelectionPreference({
      inputController,
      preferModelSelection: true,
      reason,
      selectionSource: 'model-owned',
    });

    expect(
      isEditableModelSelectionPreferredForInput({
        inputController,
        inputType: 'insertText',
      })
    ).toBe(true);
  }
});

test('model-command text input forces model ownership', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: null,
      selectionSource: 'model-owned',
    },
  });

  setEditableModelSelectionPreference({
    inputController,
    preferModelSelection: true,
    reason: 'model-command',
    selectionSource: 'model-owned',
  });
  armModelOwnedTextInputGuard({ inputController });

  expect(
    shouldForceModelOwnedTextInput({
      inputController,
      inputType: 'insertText',
    })
  ).toBe(true);
});

test('browser-handle and repair-induced text input can keep the native fast path', () => {
  for (const reason of ['browser-handle', 'repair-induced'] as const) {
    const inputController = createEditableInputController({
      preferModelSelectionForInputRef: { current: true },
      state: {
        activeIntent: null,
        isComposing: false,
        isDraggingInternally: false,
        isUpdatingSelection: false,
        latestElement: null,
        pendingDOMSelectionImport: false,
        selectionChangeOrigin: null,
        selectionSource: 'model-owned',
      },
    });

    setEditableModelSelectionPreference({
      inputController,
      preferModelSelection: true,
      reason,
      selectionSource: 'model-owned',
    });

    expect(
      shouldForceModelOwnedTextInput({
        inputController,
        inputType: 'insertText',
      })
    ).toBe(false);
  }
});

test('browser-handle and repair-induced selection preferences clear stale model-owned text guards', () => {
  for (const reason of ['browser-handle', 'repair-induced'] as const) {
    const inputController = createEditableInputController({
      preferModelSelectionForInputRef: { current: true },
      state: {
        activeIntent: null,
        isComposing: false,
        isDraggingInternally: false,
        isUpdatingSelection: false,
        latestElement: null,
        pendingDOMSelectionImport: false,
        selectionChangeOrigin: null,
        selectionSource: 'model-owned',
      },
    });

    setEditableModelSelectionPreference({
      inputController,
      preferModelSelection: true,
      reason: 'model-command',
      selectionSource: 'model-owned',
    });
    armModelOwnedTextInputGuard({ inputController });

    expect(
      shouldForceModelOwnedTextInput({
        inputController,
        inputType: 'insertText',
      })
    ).toBe(true);

    setEditableModelSelectionPreference({
      inputController,
      preferModelSelection: true,
      reason,
      selectionSource: 'model-owned',
    });

    expect(inputController.state.modelOwnedTextInputGuard).toBe(0);
    expect(
      shouldForceModelOwnedTextInput({
        inputController,
        inputType: 'insertText',
      })
    ).toBe(false);
  }
});
