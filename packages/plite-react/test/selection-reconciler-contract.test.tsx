import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { Editor } from '@platejs/plite/internal';
import {
  DOMCoverage,
  EDITOR_TO_ELEMENT,
  EDITOR_TO_KEY_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  IS_NODE_MAP_DIRTY,
  NODE_TO_ELEMENT,
} from '@platejs/plite-dom/internal';
import { applyDOMCoverageSelectionPolicy } from '../src/editable/dom-coverage-selection';
import {
  createEditableInputController,
  createEditableInputControllerState,
} from '../src/editable/input-controller';
import {
  applyEditableClick,
  applyEditableMouseDown,
  syncSelectionForBeforeInput,
  useEditableSelectionReconciler,
} from '../src/editable/selection-reconciler';
import { ReactEditor } from '../src/plugin/react-editor';
import { createReactEditor } from '../src/plugin/with-react';

test('beforeinput preserves pending native text repair selection over mismatched DOM selection', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const textHost = document.createElement('span');
  const leaf = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode('one');
  const domSelection = document.getSelection();

  if (!domSelection) {
    throw new Error('Expected document selection');
  }

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  leaf.append(string);
  textHost.append(leaf);
  root.append(textHost);
  document.body.append(root);

  Editor.replace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
    selection: {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    },
  });

  const modelSelection = Editor.getSelection(editor);

  try {
    domSelection.removeAllRanges();
    domSelection.setBaseAndExtent(text, 0, text, 0);
    vi.spyOn(ReactEditor, 'hasSelectableTarget').mockReturnValue(true);

    const result = syncSelectionForBeforeInput({
      allowDOMSelectionImport: true,
      data: 'x',
      editor,
      editorElement: root,
      event: { getTargetRanges: () => [] } as unknown as InputEvent,
      inputType: 'insertText',
      isCompositionChange: false,
      native: true,
      pendingNativeTextInputRepairPathKey: '1,0',
      preferModelSelectionForInput: false,
      root: document,
      selection: modelSelection,
    });

    expect(result.native).toBe(false);
    expect(result.selection).toEqual(modelSelection);
    expect(Editor.getSelection(editor)).toEqual(modelSelection);
  } finally {
    root.remove();
    domSelection.removeAllRanges();
    vi.restoreAllMocks();
  }
});

test('beforeinput ignores stale backward target range while model owns insert', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode('This abcdefmixed block carries ');
  const targetRange = document.createRange();
  const domSelection = document.getSelection();

  if (!domSelection) {
    throw new Error('Expected document selection');
  }

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);
  document.body.append(root);

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'This abcdefmixed block carries ' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 'This abcdef'.length },
      focus: { path: [0, 0], offset: 'This abcdef'.length },
    },
  });

  const modelSelection = Editor.getSelection(editor);

  try {
    targetRange.setStart(text, 1);
    targetRange.setEnd(text, 1);
    domSelection.removeAllRanges();
    domSelection.setBaseAndExtent(text, 1, text, 1);
    vi.spyOn(ReactEditor, 'hasSelectableTarget').mockReturnValue(true);

    const result = syncSelectionForBeforeInput({
      allowDOMSelectionImport: true,
      data: 'g',
      editor,
      editorElement: root,
      event: {
        getTargetRanges: () => [targetRange],
      } as unknown as InputEvent,
      inputType: 'insertText',
      isCompositionChange: false,
      native: false,
      preferModelSelectionForInput: true,
      root: document,
      selection: modelSelection,
    });

    expect(result.native).toBe(false);
    expect(result.selection).toEqual(modelSelection);
    expect(Editor.getSelection(editor)).toEqual(modelSelection);
  } finally {
    root.remove();
    domSelection.removeAllRanges();
    vi.restoreAllMocks();
  }
});

test('mouse down clears stale model-owned text input guards without reclassifying the click', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  });
  const target = document.createElement('span');
  const calls: Array<{
    activeIntent: string | null;
    guard: number;
    preferModelSelection: boolean;
    selectionSource: string;
  }> = [];

  inputController.state.activeIntent = 'composition';
  inputController.state.modelOwnedTextInputGuard = 1;
  inputController.state.selectionSource = 'model-owned';

  applyEditableMouseDown({
    editor,
    event: {
      preventDefault: vi.fn(),
      target,
    } as any,
    inputController,
    onMouseDown: () => {
      calls.push({
        activeIntent: inputController.state.activeIntent,
        guard: inputController.state.modelOwnedTextInputGuard ?? 0,
        preferModelSelection:
          inputController.preferModelSelectionForInputRef.current,
        selectionSource: inputController.state.selectionSource,
      });
    },
  });

  expect(calls).toEqual([
    {
      activeIntent: 'composition',
      guard: 0,
      preferModelSelection: false,
      selectionSource: 'dom-current',
    },
  ]);
  expect(inputController.state.selectionChangeOrigin).toBe('native-user');
});

test('beforeinput returns same-path pending native text repair DOM range without importing it', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode('oXXXne');
  const domSelection = document.getSelection();

  if (!domSelection) {
    throw new Error('Expected document selection');
  }

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);
  document.body.append(root);

  Editor.replace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  const modelSelection = Editor.getSelection(editor);

  try {
    domSelection.removeAllRanges();
    domSelection.setBaseAndExtent(text, 4, text, 4);
    vi.spyOn(ReactEditor, 'hasSelectableTarget').mockReturnValue(true);

    const result = syncSelectionForBeforeInput({
      allowDOMSelectionImport: true,
      data: 'X',
      editor,
      editorElement: root,
      event: {
        getTargetRanges: () => {
          throw new Error('pending native repair should skip target ranges');
        },
      } as unknown as InputEvent,
      inputType: 'insertText',
      isCompositionChange: false,
      native: true,
      pendingNativeTextInputRepairOffset: 4,
      pendingNativeTextInputRepairPathKey: '0,0',
      preferModelSelectionForInput: false,
      root: document,
      selection: modelSelection,
    });

    expect(result.native).toBe(true);
    expect(result.selection).toEqual({
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    });
    expect(Editor.getSelection(editor)).toEqual(modelSelection);
  } finally {
    root.remove();
    domSelection.removeAllRanges();
    vi.restoreAllMocks();
  }
});

test('beforeinput imports same-path native selection when pending repair owns a different offset', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode('oXXXne');
  const domSelection = document.getSelection();

  if (!domSelection) {
    throw new Error('Expected document selection');
  }

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);
  document.body.append(root);

  Editor.replace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  try {
    domSelection.removeAllRanges();
    domSelection.setBaseAndExtent(text, 2, text, 2);
    vi.spyOn(ReactEditor, 'hasSelectableTarget').mockReturnValue(true);

    const result = syncSelectionForBeforeInput({
      allowDOMSelectionImport: true,
      data: 'Y',
      editor,
      editorElement: root,
      event: { getTargetRanges: () => [] } as unknown as InputEvent,
      inputType: 'insertText',
      isCompositionChange: false,
      native: true,
      pendingNativeTextInputRepairOffset: 4,
      pendingNativeTextInputRepairPathKey: '0,0',
      preferModelSelectionForInput: false,
      root: document,
      selection: Editor.getSelection(editor),
    });

    expect(result.native).toBe(false);
    expect(result.selection).toEqual(Editor.getSelection(editor));
  } finally {
    root.remove();
    domSelection.removeAllRanges();
    vi.restoreAllMocks();
  }
});

test('beforeinput imports backward native text caret when no pending repair owns it', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode('oXXXne');
  const domSelection = document.getSelection();

  if (!domSelection) {
    throw new Error('Expected document selection');
  }

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);
  document.body.append(root);

  Editor.replace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'oXXXne' }] }],
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  const modelSelection = Editor.getSelection(editor);

  try {
    domSelection.removeAllRanges();
    domSelection.setBaseAndExtent(text, 3, text, 3);
    vi.spyOn(ReactEditor, 'hasSelectableTarget').mockReturnValue(true);

    const result = syncSelectionForBeforeInput({
      allowDOMSelectionImport: true,
      data: 'X',
      editor,
      editorElement: root,
      event: { getTargetRanges: () => [] } as unknown as InputEvent,
      inputType: 'insertText',
      isCompositionChange: false,
      native: true,
      preferModelSelectionForInput: false,
      root: document,
      selection: modelSelection,
    });

    expect(result.native).toBe(false);
    expect(result.selection).toEqual({
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
  } finally {
    root.remove();
    domSelection.removeAllRanges();
    vi.restoreAllMocks();
  }
});

test('beforeinput ignores repair-induced backward text caret when no pending repair owns it', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode('This abcdefmixed block carries ');
  const domSelection = document.getSelection();

  if (!domSelection) {
    throw new Error('Expected document selection');
  }

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);
  document.body.append(root);

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'This abcdefmixed block carries ' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 'This abcdef'.length },
      focus: { path: [0, 0], offset: 'This abcdef'.length },
    },
  });

  const modelSelection = Editor.getSelection(editor);

  try {
    domSelection.removeAllRanges();
    domSelection.setBaseAndExtent(text, 0, text, 0);
    vi.spyOn(ReactEditor, 'hasSelectableTarget').mockReturnValue(true);

    const result = syncSelectionForBeforeInput({
      allowDOMSelectionImport: true,
      data: 'g',
      editor,
      editorElement: root,
      event: { getTargetRanges: () => [] } as unknown as InputEvent,
      inputType: 'insertText',
      isCompositionChange: false,
      native: false,
      preferModelSelectionForInput: false,
      root: document,
      selection: modelSelection,
      selectionChangeOrigin: 'repair-induced',
    });

    expect(result.native).toBe(false);
    expect(result.selection).toEqual(modelSelection);
    expect(Editor.getSelection(editor)).toEqual(modelSelection);
  } finally {
    root.remove();
    domSelection.removeAllRanges();
    vi.restoreAllMocks();
  }
});

test('beforeinput ignores text host target ranges while the node map is dirty', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode('one');
  const domSelection = document.getSelection();

  if (!domSelection) {
    throw new Error('Expected document selection');
  }

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);
  document.body.append(root);

  Editor.replace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
    selection: {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    },
  });

  const modelSelection = Editor.getSelection(editor);
  const targetRange = {
    collapsed: false,
    endContainer: text,
    endOffset: 3,
    startContainer: text,
    startOffset: 0,
  } as unknown as StaticRange;

  try {
    domSelection.removeAllRanges();
    vi.spyOn(ReactEditor, 'hasSelectableTarget').mockReturnValue(true);
    IS_NODE_MAP_DIRTY.set(editor, true);

    const result = syncSelectionForBeforeInput({
      allowDOMSelectionImport: true,
      data: '. ',
      editor,
      editorElement: root,
      event: {
        getTargetRanges: () => [targetRange],
      } as unknown as InputEvent,
      inputType: 'insertText',
      isCompositionChange: false,
      native: false,
      preferModelSelectionForInput: true,
      root: document,
      selection: modelSelection,
    });

    expect(result.selection).toEqual(modelSelection);
    expect(Editor.getSelection(editor)).toEqual(modelSelection);
  } finally {
    IS_NODE_MAP_DIRTY.delete(editor);
    root.remove();
    domSelection.removeAllRanges();
    vi.restoreAllMocks();
  }
});

test('beforeinput keeps current text host target ranges while the node map is dirty', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode('one');
  const domSelection = document.getSelection();

  if (!domSelection) {
    throw new Error('Expected document selection');
  }

  Editor.replace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
    selection: {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    },
  });

  const runtimeId = Editor.getRuntimeId(editor, [0, 0]);

  if (!runtimeId) {
    throw new Error('Expected text runtime id');
  }

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  textHost.setAttribute('data-plite-runtime-id', runtimeId);
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);
  document.body.append(root);

  const targetRange = {
    collapsed: false,
    endContainer: text,
    endOffset: 3,
    startContainer: text,
    startOffset: 0,
  } as unknown as StaticRange;
  const targetPliteRange = {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 3 },
  };

  try {
    domSelection.removeAllRanges();
    IS_NODE_MAP_DIRTY.set(editor, true);

    const result = syncSelectionForBeforeInput({
      allowDOMSelectionImport: true,
      data: '. ',
      editor,
      editorElement: root,
      event: {
        getTargetRanges: () => [targetRange],
      } as unknown as InputEvent,
      inputType: 'insertText',
      isCompositionChange: false,
      native: false,
      preferModelSelectionForInput: true,
      root: document,
      selection: Editor.getSelection(editor),
    });

    expect(result.selection).toEqual(targetPliteRange);
    expect(Editor.getSelection(editor)).toEqual(targetPliteRange);
  } finally {
    IS_NODE_MAP_DIRTY.delete(editor);
    root.remove();
    domSelection.removeAllRanges();
  }
});

test('beforeinput uses event target range instead of later live DOM selection', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const firstTextHost = document.createElement('span');
  const firstString = document.createElement('span');
  const firstText = document.createTextNode('one');
  const secondTextHost = document.createElement('span');
  const secondString = document.createElement('span');
  const secondText = document.createTextNode('two');
  const domSelection = document.getSelection();

  if (!domSelection) {
    throw new Error('Expected document selection');
  }

  Editor.replace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
    selection: {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    },
  });

  firstTextHost.setAttribute('data-plite-node', 'text');
  firstTextHost.setAttribute('data-plite-path', '0,0');
  firstString.setAttribute('data-plite-string', 'true');
  firstString.append(firstText);
  firstTextHost.append(firstString);

  secondTextHost.setAttribute('data-plite-node', 'text');
  secondTextHost.setAttribute('data-plite-path', '1,0');
  secondString.setAttribute('data-plite-string', 'true');
  secondString.append(secondText);
  secondTextHost.append(secondString);

  root.append(firstTextHost, secondTextHost);
  document.body.append(root);

  const eventTargetRange = {
    collapsed: false,
    endContainer: firstText,
    endOffset: 3,
    startContainer: firstText,
    startOffset: 0,
  } as unknown as StaticRange;
  const eventSelection = {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 3 },
  };

  try {
    domSelection.removeAllRanges();
    domSelection.setBaseAndExtent(secondText, 1, secondText, 1);
    vi.spyOn(ReactEditor, 'hasSelectableTarget').mockReturnValue(true);

    const result = syncSelectionForBeforeInput({
      allowDOMSelectionImport: true,
      data: null,
      editor,
      editorElement: root,
      event: {
        getTargetRanges: () => [eventTargetRange],
      } as unknown as InputEvent,
      inputType: 'deleteContentBackward',
      isCompositionChange: false,
      native: true,
      preferModelSelectionForInput: false,
      root: document,
      selection: Editor.getSelection(editor),
    });

    expect(result.native).toBe(false);
    expect(result.selection).toEqual(eventSelection);
    expect(Editor.getSelection(editor)).toEqual(eventSelection);
  } finally {
    root.remove();
    domSelection.removeAllRanges();
    vi.restoreAllMocks();
  }
});

test('beforeinput resolves block-spanning element target ranges before live selection fallback', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const firstBlock = document.createElement('p');
  const firstTextHost = document.createElement('span');
  const firstLeaf = document.createElement('span');
  const firstString = document.createElement('span');
  const firstText = document.createTextNode('one');
  const secondBlock = document.createElement('p');
  const secondTextHost = document.createElement('span');
  const secondLeaf = document.createElement('span');
  const secondString = document.createElement('span');
  const secondText = document.createTextNode('two');
  const domSelection = document.getSelection();

  if (!domSelection) {
    throw new Error('Expected document selection');
  }

  Editor.replace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
    selection: {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    },
  });

  root.setAttribute('contenteditable', 'true');
  root.setAttribute('data-plite-editor', 'true');
  firstBlock.setAttribute('data-plite-node', 'element');
  firstBlock.setAttribute('data-plite-path', '0');
  firstTextHost.setAttribute('data-plite-node', 'text');
  firstTextHost.setAttribute('data-plite-path', '0,0');
  firstLeaf.setAttribute('data-plite-leaf', 'true');
  firstString.setAttribute('data-plite-string', 'true');
  secondBlock.setAttribute('data-plite-node', 'element');
  secondBlock.setAttribute('data-plite-path', '1');
  secondTextHost.setAttribute('data-plite-node', 'text');
  secondTextHost.setAttribute('data-plite-path', '1,0');
  secondLeaf.setAttribute('data-plite-leaf', 'true');
  secondString.setAttribute('data-plite-string', 'true');

  firstString.append(firstText);
  firstLeaf.append(firstString);
  firstTextHost.append(firstLeaf);
  firstBlock.append(firstTextHost);
  secondString.append(secondText);
  secondLeaf.append(secondString);
  secondTextHost.append(secondLeaf);
  secondBlock.append(secondTextHost);
  root.append(firstBlock, secondBlock);
  document.body.append(root);

  const editableElements = [
    root,
    firstBlock,
    firstTextHost,
    firstLeaf,
    firstString,
    secondBlock,
    secondTextHost,
    secondLeaf,
    secondString,
  ];

  for (const element of editableElements) {
    Object.defineProperty(element, 'isContentEditable', {
      configurable: true,
      value: true,
    });
  }

  const [firstBlockNode] = editor.read((state) => state.nodes.get([0]));
  const [firstTextNode] = editor.read((state) => state.nodes.get([0, 0]));
  const [secondBlockNode] = editor.read((state) => state.nodes.get([1]));
  const [secondTextNode] = editor.read((state) => state.nodes.get([1, 0]));
  const keyToElement = new WeakMap();

  EDITOR_TO_ELEMENT.set(editor, root);
  EDITOR_TO_KEY_TO_ELEMENT.set(editor, keyToElement);
  EDITOR_TO_WINDOW.set(editor, window);
  ELEMENT_TO_NODE.set(root, editor);
  ELEMENT_TO_NODE.set(firstBlock, firstBlockNode);
  ELEMENT_TO_NODE.set(firstTextHost, firstTextNode);
  ELEMENT_TO_NODE.set(secondBlock, secondBlockNode);
  ELEMENT_TO_NODE.set(secondTextHost, secondTextNode);
  NODE_TO_ELEMENT.set(editor, root);
  NODE_TO_ELEMENT.set(firstBlockNode, firstBlock);
  NODE_TO_ELEMENT.set(firstTextNode, firstTextHost);
  NODE_TO_ELEMENT.set(secondBlockNode, secondBlock);
  NODE_TO_ELEMENT.set(secondTextNode, secondTextHost);
  keyToElement.set(editor.api.dom.findKey(firstBlockNode), firstBlock);
  keyToElement.set(editor.api.dom.findKey(firstTextNode), firstTextHost);
  keyToElement.set(editor.api.dom.findKey(secondBlockNode), secondBlock);
  keyToElement.set(editor.api.dom.findKey(secondTextNode), secondTextHost);

  const targetRange = document.createRange();
  targetRange.setStart(firstBlock, 0);
  targetRange.setEnd(secondBlock, secondBlock.childNodes.length);

  try {
    domSelection.removeAllRanges();
    domSelection.setBaseAndExtent(secondText, 1, secondText, 1);

    const result = syncSelectionForBeforeInput({
      allowDOMSelectionImport: true,
      data: null,
      editor,
      editorElement: root,
      event: {
        getTargetRanges: () => [targetRange],
      } as unknown as InputEvent,
      inputType: 'deleteContentBackward',
      isCompositionChange: false,
      native: true,
      preferModelSelectionForInput: false,
      root: document,
      selection: Editor.getSelection(editor),
    });

    const eventSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 3 },
    };

    expect(result.native).toBe(false);
    expect(result.selection).toEqual(eventSelection);
    expect(Editor.getSelection(editor)).toEqual(eventSelection);
  } finally {
    root.remove();
    domSelection.removeAllRanges();
    EDITOR_TO_ELEMENT.delete(editor);
    EDITOR_TO_KEY_TO_ELEMENT.delete(editor);
    EDITOR_TO_WINDOW.delete(editor);
    ELEMENT_TO_NODE.delete(root);
    ELEMENT_TO_NODE.delete(firstBlock);
    ELEMENT_TO_NODE.delete(firstTextHost);
    ELEMENT_TO_NODE.delete(secondBlock);
    ELEMENT_TO_NODE.delete(secondTextHost);
    NODE_TO_ELEMENT.delete(editor);
    NODE_TO_ELEMENT.delete(firstBlockNode);
    NODE_TO_ELEMENT.delete(firstTextNode);
    NODE_TO_ELEMENT.delete(secondBlockNode);
    NODE_TO_ELEMENT.delete(secondTextNode);
  }
});

test('beforeinput does not import only the first range from multiple target ranges', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const firstTextHost = document.createElement('span');
  const firstString = document.createElement('span');
  const firstText = document.createTextNode('one');
  const secondTextHost = document.createElement('span');
  const secondString = document.createElement('span');
  const secondText = document.createTextNode('two');
  const domSelection = document.getSelection();

  if (!domSelection) {
    throw new Error('Expected document selection');
  }

  Editor.replace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    },
  });

  firstTextHost.setAttribute('data-plite-node', 'text');
  firstTextHost.setAttribute('data-plite-path', '0,0');
  firstString.setAttribute('data-plite-string', 'true');
  firstString.append(firstText);
  firstTextHost.append(firstString);

  secondTextHost.setAttribute('data-plite-node', 'text');
  secondTextHost.setAttribute('data-plite-path', '1,0');
  secondString.setAttribute('data-plite-string', 'true');
  secondString.append(secondText);
  secondTextHost.append(secondString);

  root.append(firstTextHost, secondTextHost);
  document.body.append(root);

  const firstTargetRange = {
    collapsed: false,
    endContainer: firstText,
    endOffset: 3,
    startContainer: firstText,
    startOffset: 1,
  } as unknown as StaticRange;
  const secondTargetRange = {
    collapsed: false,
    endContainer: secondText,
    endOffset: 2,
    startContainer: secondText,
    startOffset: 0,
  } as unknown as StaticRange;
  const modelSelection = Editor.getSelection(editor);

  try {
    domSelection.removeAllRanges();
    domSelection.setBaseAndExtent(firstText, 1, secondText, 2);
    vi.spyOn(ReactEditor, 'hasSelectableTarget').mockReturnValue(true);

    const result = syncSelectionForBeforeInput({
      allowDOMSelectionImport: true,
      data: null,
      editor,
      editorElement: root,
      event: {
        getTargetRanges: () => [firstTargetRange, secondTargetRange],
      } as unknown as InputEvent,
      inputType: 'deleteContentBackward',
      isCompositionChange: false,
      native: true,
      preferModelSelectionForInput: false,
      root: document,
      selection: modelSelection,
    });

    expect(result.native).toBe(true);
    expect(result.selection).toEqual(modelSelection);
    expect(Editor.getSelection(editor)).toEqual(modelSelection);
  } finally {
    root.remove();
    domSelection.removeAllRanges();
    vi.restoreAllMocks();
  }
});

test('selection reconciler clears the updating guard when DOM export throws', () => {
  vi.useFakeTimers();

  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  });
  const state = inputController.state;
  const androidInputManagerRef = { current: null };
  let renderTick = 0;

  Editor.replace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abc' }] }],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  const Harness = () => {
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEditableSelectionReconciler({
      androidInputManagerRef,
      editor,
      inputController,
      rootRef,
      scrollSelectionIntoView: vi.fn(),
      partialDOMBackedSelection: false,
      state,
    });

    return (
      <div data-render-tick={renderTick} ref={rootRef}>
        <span>abc</span>
      </div>
    );
  };

  try {
    const { container, rerender } = render(<Harness />);
    const textNode = container.querySelector('span')?.firstChild;
    const domSelection = document.getSelection();

    if (!textNode || !domSelection) {
      throw new Error('Expected rendered text and document selection');
    }

    const domRange = document.createRange();
    domRange.setStart(textNode, 0);
    domRange.setEnd(textNode, 1);

    domSelection.removeAllRanges();
    domSelection.setBaseAndExtent(textNode, 0, textNode, 0);

    vi.spyOn(ReactEditor, 'findDocumentOrShadowRoot').mockReturnValue(document);
    vi.spyOn(ReactEditor, 'resolvePliteRange').mockReturnValue(null);
    vi.spyOn(ReactEditor, 'hasRange').mockReturnValue(true);
    vi.spyOn(ReactEditor, 'resolveDOMRange').mockReturnValue(domRange);
    vi.spyOn(ReactEditor, 'isComposing').mockReturnValue(false);
    vi.spyOn(domSelection, 'setBaseAndExtent').mockImplementation(() => {
      throw new Error('stale DOM bridge');
    });

    act(() => {
      renderTick++;
      rerender(<Harness />);
    });

    expect(state.isUpdatingSelection).toBe(true);

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(state.isUpdatingSelection).toBe(false);
    expect(state.selectionChangeOrigin).toBe('programmatic-export');
  } finally {
    vi.useRealTimers();
    vi.restoreAllMocks();
  }
});

test('selection reconciler clamps stale DOM range offsets after text shortening', () => {
  vi.useFakeTimers();

  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  });
  const state = inputController.state;
  const androidInputManagerRef = { current: null };
  let renderTick = 0;

  Editor.replace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abcd' }] }],
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  const Harness = () => {
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEditableSelectionReconciler({
      androidInputManagerRef,
      editor,
      inputController,
      rootRef,
      scrollSelectionIntoView: vi.fn(),
      partialDOMBackedSelection: false,
      state,
    });

    return (
      <div data-render-tick={renderTick} ref={rootRef}>
        <span>abc</span>
      </div>
    );
  };

  try {
    const { container, rerender } = render(<Harness />);
    const textNode = container.querySelector('span')?.firstChild;
    const domSelection = document.getSelection();

    if (!textNode || !domSelection) {
      throw new Error(
        'Expected shortened rendered text and document selection'
      );
    }

    domSelection.removeAllRanges();
    domSelection.setBaseAndExtent(textNode, 0, textNode, 0);

    vi.spyOn(ReactEditor, 'findDocumentOrShadowRoot').mockReturnValue(document);
    vi.spyOn(ReactEditor, 'resolvePliteRange').mockReturnValue(null);
    vi.spyOn(ReactEditor, 'hasRange').mockReturnValue(true);
    vi.spyOn(ReactEditor, 'resolveDOMRange').mockReturnValue({
      collapsed: true,
      commonAncestorContainer: textNode,
      endContainer: textNode,
      endOffset: 4,
      startContainer: textNode,
      startOffset: 4,
    } as unknown as Range);
    vi.spyOn(ReactEditor, 'isComposing').mockReturnValue(false);
    const setBaseAndExtent = vi.spyOn(domSelection, 'setBaseAndExtent');

    act(() => {
      renderTick++;
      rerender(<Harness />);
    });

    expect(setBaseAndExtent).toHaveBeenLastCalledWith(textNode, 3, textNode, 3);
    expect(state.selectionChangeOrigin).toBe('programmatic-export');
  } finally {
    vi.useRealTimers();
    vi.restoreAllMocks();
  }
});

test('selection reconciler keeps DOM coverage skip selections model-owned', () => {
  vi.useFakeTimers();

  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  });
  const state = inputController.state;
  const androidInputManagerRef = { current: null };
  let renderTick = 0;

  Editor.replace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'hidden', children: [{ text: 'secret' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [2, 0], offset: 0 },
    },
  });
  DOMCoverage.registerBoundary(editor, {
    anchor: { type: 'placeholder' },
    boundaryId: 'hidden-block',
    copyPolicy: 'model',
    coveredPathRanges: [{ anchor: [1], focus: [1] }],
    coveredRuntimeRanges: [],
    findPolicy: 'native',
    ownerPath: [],
    ownerRuntimeId: null,
    reason: 'app-hidden',
    selectionPolicy: 'skip',
    state: 'intentionally-hidden',
    version: 1,
  });

  const Harness = () => {
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEditableSelectionReconciler({
      androidInputManagerRef,
      editor,
      inputController,
      rootRef,
      scrollSelectionIntoView: vi.fn(),
      partialDOMBackedSelection: false,
      state,
    });

    return (
      <div data-render-tick={renderTick} ref={rootRef}>
        <span>one</span>
        <button type="button">hidden shell</button>
        <span>two</span>
      </div>
    );
  };

  try {
    const { container, rerender } = render(<Harness />);
    const firstText = container.querySelector('span')?.firstChild;
    const domSelection = document.getSelection();

    if (!firstText || !domSelection) {
      throw new Error('Expected rendered text and document selection');
    }

    domSelection.removeAllRanges();
    domSelection.setBaseAndExtent(firstText, 3, firstText, 3);

    vi.spyOn(ReactEditor, 'findDocumentOrShadowRoot').mockReturnValue(document);
    vi.spyOn(ReactEditor, 'resolvePliteRange').mockReturnValue(null);
    vi.spyOn(ReactEditor, 'hasRange').mockReturnValue(true);
    const resolveDOMRange = vi.spyOn(ReactEditor, 'resolveDOMRange');

    act(() => {
      renderTick++;
      rerender(<Harness />);
    });

    expect(domSelection.rangeCount).toBe(0);
    expect(resolveDOMRange).not.toHaveBeenCalled();
    expect(state.selectionChangeOrigin).toBe('programmatic-export');
    expect(state.isUpdatingSelection).toBe(true);

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(state.isUpdatingSelection).toBe(false);
  } finally {
    DOMCoverage.clear(editor);
    vi.useRealTimers();
    vi.restoreAllMocks();
  }
});

test('DOM coverage selection materializes every covered materialize boundary with range roles', () => {
  const editor = createReactEditor();
  const materialized: string[] = [];

  Editor.replace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'anchor' }] },
      { type: 'paragraph', children: [{ text: 'before' }] },
      { type: 'paragraph', children: [{ text: 'middle' }] },
      { type: 'paragraph', children: [{ text: 'after' }] },
      { type: 'paragraph', children: [{ text: 'focus' }] },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 'anchor'.length },
      focus: { path: [4, 0], offset: 0 },
    },
  });

  for (const [boundaryId, path] of [
    ['hidden-anchor', [0]],
    ['hidden-middle', [2]],
    ['hidden-focus', [4]],
  ] as const) {
    DOMCoverage.registerBoundary(editor, {
      anchor: { type: 'placeholder' },
      boundaryId,
      copyPolicy: 'model',
      coveredPathRanges: [{ anchor: path, focus: path }],
      coveredRuntimeRanges: [],
      findPolicy: 'native',
      ownerPath: [],
      ownerRuntimeId: null,
      reason: 'app-hidden',
      selectionPolicy: 'materialize',
      state: 'intentionally-hidden',
      version: 1,
    });
  }

  DOMCoverage.setMaterializeHandler(editor, (boundary, reason, options) => {
    materialized.push(
      `${boundary.boundaryId}:${reason}:${options.rangeRole ?? 'none'}`
    );
    return true;
  });

  const domSelection = document.getSelection();
  const selection = Editor.getSelection(editor);

  try {
    if (!domSelection || !selection) {
      throw new Error('Expected document and editor selection');
    }

    expect(
      applyDOMCoverageSelectionPolicy({
        domSelection,
        editor,
        selection,
      })
    ).toBe(true);
    expect(materialized.sort()).toEqual([
      'hidden-anchor:selection:anchor',
      'hidden-focus:selection:focus',
      'hidden-middle:selection:interior',
    ]);
  } finally {
    DOMCoverage.clear(editor);
  }
});

test('selection reconciler preserves visible anchor text across DOM coverage boundaries', () => {
  vi.useFakeTimers();

  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  });
  const state = inputController.state;
  const androidInputManagerRef = { current: null };
  let renderTick = 0;

  Editor.replace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'hidden', children: [{ text: 'secret' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [2, 0], offset: 1 },
    },
  });
  DOMCoverage.registerBoundary(editor, {
    anchor: { type: 'placeholder' },
    boundaryId: 'hidden-block',
    copyPolicy: 'model',
    coveredPathRanges: [{ anchor: [1], focus: [1] }],
    coveredRuntimeRanges: [],
    findPolicy: 'native',
    ownerPath: [],
    ownerRuntimeId: null,
    reason: 'app-hidden',
    selectionPolicy: 'skip',
    state: 'intentionally-hidden',
    version: 1,
  });

  const Harness = () => {
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEditableSelectionReconciler({
      androidInputManagerRef,
      editor,
      inputController,
      rootRef,
      scrollSelectionIntoView: vi.fn(),
      partialDOMBackedSelection: false,
      state,
    });

    return (
      <div data-render-tick={renderTick} data-selection-test-root ref={rootRef}>
        <span data-plite-node="text" data-plite-path="0,0">
          <span data-plite-leaf="true">
            <span data-plite-string="true">one</span>
          </span>
        </span>
        <button type="button">hidden shell</button>
        <span data-plite-node="text" data-plite-path="2,0">
          <span data-plite-leaf="true">
            <span data-plite-string="true">two</span>
          </span>
        </span>
      </div>
    );
  };

  try {
    const { container, rerender } = render(<Harness />);
    const root = container.querySelector(
      '[data-selection-test-root]'
    ) as HTMLElement | null;
    const [firstString, secondString] = container.querySelectorAll(
      '[data-plite-string]'
    );
    const firstElement = firstString?.closest(
      '[data-plite-node]'
    ) as HTMLElement | null;
    const secondElement = secondString?.closest(
      '[data-plite-node]'
    ) as HTMLElement | null;
    const firstText = firstString?.firstChild;
    const secondText = secondString?.firstChild;
    const domSelection = document.getSelection();

    if (
      !root ||
      !firstElement ||
      !secondElement ||
      !firstText ||
      !secondText ||
      !domSelection
    ) {
      throw new Error('Expected rendered text and document selection');
    }

    const [firstNode] = editor.read((state) => state.nodes.get([0, 0]));
    const [secondNode] = editor.read((state) => state.nodes.get([2, 0]));
    const keyToElement = new WeakMap();

    EDITOR_TO_ELEMENT.set(editor, root);
    EDITOR_TO_KEY_TO_ELEMENT.set(editor, keyToElement);
    EDITOR_TO_WINDOW.set(editor, window);
    ELEMENT_TO_NODE.set(root, editor);
    ELEMENT_TO_NODE.set(firstElement, firstNode);
    ELEMENT_TO_NODE.set(secondElement, secondNode);
    NODE_TO_ELEMENT.set(editor, root);
    NODE_TO_ELEMENT.set(firstNode, firstElement);
    NODE_TO_ELEMENT.set(secondNode, secondElement);
    keyToElement.set(editor.api.dom.findKey(firstNode), firstElement);
    keyToElement.set(editor.api.dom.findKey(secondNode), secondElement);

    domSelection.removeAllRanges();
    domSelection.setBaseAndExtent(firstText, 1, firstText, 1);

    vi.spyOn(ReactEditor, 'findDocumentOrShadowRoot').mockReturnValue(document);
    vi.spyOn(ReactEditor, 'resolvePliteRange').mockReturnValue(null);
    vi.spyOn(ReactEditor, 'hasRange').mockReturnValue(true);
    const setBaseAndExtent = vi.spyOn(domSelection, 'setBaseAndExtent');

    act(() => {
      renderTick++;
      rerender(<Harness />);
    });

    expect(setBaseAndExtent).toHaveBeenLastCalledWith(
      firstText,
      1,
      secondText,
      1
    );
    expect(state.selectionChangeOrigin).toBe('programmatic-export');
    expect(state.isUpdatingSelection).toBe(true);

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(state.isUpdatingSelection).toBe(false);
  } finally {
    DOMCoverage.clear(editor);
    EDITOR_TO_ELEMENT.delete(editor);
    EDITOR_TO_KEY_TO_ELEMENT.delete(editor);
    EDITOR_TO_WINDOW.delete(editor);
    NODE_TO_ELEMENT.delete(editor);
    vi.useRealTimers();
    vi.restoreAllMocks();
  }
});

test('read-only triple-click stays native and does not update model selection', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  });

  Editor.replace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abc' }] }],
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  const target = document.createElement('span');
  target.setAttribute('data-plite-node', 'element');
  target.setAttribute('data-plite-path', '0');
  document.body.append(target);

  const update = vi.spyOn(editor, 'update');

  try {
    applyEditableClick({
      editor,
      event: {
        defaultPrevented: false,
        detail: 3,
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        target,
      } as any,
      inputController,
      readOnly: true,
    });

    expect(update).not.toHaveBeenCalled();
    expect(Editor.getSelection(editor)).toEqual({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
  } finally {
    target.remove();
    update.mockRestore();
  }
});
