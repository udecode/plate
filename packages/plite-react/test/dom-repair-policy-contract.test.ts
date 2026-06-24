import { readFileSync } from 'node:fs';
import { replace as editorReplace } from '@platejs/plite/internal';
import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from '@platejs/plite-dom/internal';
import { createReactEditor } from '../src';
import { createRestoreDomManager } from '../src/components/restore-dom/restore-dom-manager';
import {
  beginDOMRepairFrame,
  cancelDOMRepairBefore,
  createDOMRepairFrameState,
  createDOMRepairQueue,
  isDOMRepairFrameCurrent,
} from '../src/editable/dom-repair-queue';
import { beginEditableEventFrame } from '../src/editable/editing-kernel';
import { createEditableInputControllerState } from '../src/editable/input-state';
import { executeEditableRepairPolicy } from '../src/editable/mutation-controller';

const asNodeList = (nodes: Node[]) => nodes as unknown as NodeList;

const createChildListMutation = ({
  addedNodes = [],
  nextSibling = null,
  removedNodes = [],
  target,
}: {
  addedNodes?: Node[];
  nextSibling?: Node | null;
  removedNodes?: Node[];
  target: Node;
}) =>
  ({
    addedNodes: asNodeList(addedNodes),
    attributeName: null,
    attributeNamespace: null,
    nextSibling,
    oldValue: null,
    previousSibling: null,
    removedNodes: asNodeList(removedNodes),
    target,
    type: 'childList',
  }) as MutationRecord;

const createCharacterDataMutation = (target: Node) =>
  ({
    addedNodes: asNodeList([]),
    attributeName: null,
    attributeNamespace: null,
    nextSibling: null,
    oldValue: 'Hello',
    previousSibling: null,
    removedNodes: asNodeList([]),
    target,
    type: 'characterData',
  }) as MutationRecord;

const markEditable = (element: HTMLElement) => {
  Object.defineProperty(element, 'isContentEditable', {
    configurable: true,
    value: true,
  });
};

const mountEditorRoot = (editor: ReturnType<typeof createReactEditor>) => {
  const root = document.createElement('div');

  root.setAttribute('contenteditable', 'true');
  root.setAttribute('data-plite-editor', 'true');
  markEditable(root);
  document.body.append(root);

  EDITOR_TO_ELEMENT.set(editor, root);
  EDITOR_TO_WINDOW.set(editor, window);
  ELEMENT_TO_NODE.set(root, editor);
  NODE_TO_ELEMENT.set(editor, root);

  return root;
};

test('DOM repair exposes focused profiler buckets for huge-document attribution', () => {
  const source = readFileSync('src/editable/dom-repair-queue.ts', 'utf8');

  expect(source).toContain("'collapsed-selection'");
  expect(source).toContain("'lookup-text-host'");
  expect(source).toContain("'set-dom-selection'");
  expect(source).toContain("'scroll-text-host'");
  expect(source).toContain("'scroll-current-selection'");
  expect(source).toContain("'read-current-frame'");
  expect(source).toContain("'read-runtime-selection'");
  expect(source).toContain("'record-kernel-trace'");
  expect(source).toContain('operations: []');
  expect(source).toContain('selectionAfter: selectionBefore');
});

test('repair frame state rejects work scheduled by an older frame', () => {
  const state = createDOMRepairFrameState();

  beginDOMRepairFrame(state, 3);
  expect(isDOMRepairFrameCurrent(state, 3)).toBe(true);

  cancelDOMRepairBefore(state, 4);
  expect(isDOMRepairFrameCurrent(state, 3)).toBe(false);

  beginDOMRepairFrame(state, 4);
  expect(isDOMRepairFrameCurrent(state, 4)).toBe(true);
});

test('stale repair frames cannot replace the active frame', () => {
  const state = createDOMRepairFrameState();

  beginDOMRepairFrame(state, 2);
  cancelDOMRepairBefore(state, 2);
  beginDOMRepairFrame(state, 1);

  expect(isDOMRepairFrameCurrent(state, 1)).toBe(false);
  expect(isDOMRepairFrameCurrent(state, 2)).toBe(true);
});

test('restore manager rolls back structural DOM mutations and leaves text sync mutations', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const paragraph = document.createElement('p');
  const textWrapper = document.createElement('span');
  const text = document.createTextNode('Hello');
  const rogue = document.createElement('span');

  markEditable(paragraph);
  markEditable(textWrapper);
  textWrapper.append(text);
  paragraph.append(textWrapper);
  root.append(paragraph);

  const manager = createRestoreDomManager(editor, { current: true });

  paragraph.remove();
  rogue.textContent = 'rogue';
  root.append(rogue);
  text.nodeValue = 'Bonjour';

  manager.registerMutations([
    createChildListMutation({
      removedNodes: [paragraph],
      target: root,
    }),
    createChildListMutation({
      addedNodes: [rogue],
      target: root,
    }),
    createCharacterDataMutation(text),
  ]);
  manager.restoreDOM();

  expect(root.firstChild).toBe(paragraph);
  expect(root.contains(rogue)).toBe(false);
  expect(text.nodeValue).toBe('Bonjour');

  root.remove();
});

test('native input repair skips already synced local text inside partial DOM roots', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'beta' }],
      },
    ],
    selection: {
      anchor: { path: [1, 0], offset: 5 },
      focus: { path: [1, 0], offset: 5 },
    },
  });

  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode('betax');
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController: {
      preferModelSelectionForInputRef: { current: false },
      state: createEditableInputControllerState(),
    },
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '1,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);

  range.setStart(text, 5);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairDOMInput({ data: 'x', inputType: 'insertText' }, root, 1);
  expect(editor.read((state) => state.text.string([1]))).toBe('betax');

  queue.repairDOMInput({ data: 'x', inputType: 'insertText' }, root, 2);
  expect(editor.read((state) => state.text.string([1]))).toBe('betax');

  root.remove();
});

test('native input repair imports a burst DOM text delta once', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const prefix = 'Release ';
  const burstText = 'abcdefghijklmnop';
  const originalText = `${prefix}readiness memo`;
  const domText = `${prefix}${burstText}readiness memo`;

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: originalText }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: prefix.length },
      focus: { path: [0, 0], offset: prefix.length },
    },
  });

  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode(domText);
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController: {
      preferModelSelectionForInputRef: { current: false },
      state: createEditableInputControllerState(),
    },
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);

  range.setStart(text, prefix.length + burstText.length);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairDOMInput({ data: 'p', inputType: 'insertText' }, root, 1);

  expect(editor.read((state) => state.text.string([0]))).toBe(domText);
  expect(editor.read((state) => state.selection.get())).toEqual({
    anchor: { path: [0, 0], offset: prefix.length + burstText.length },
    focus: { path: [0, 0], offset: prefix.length + burstText.length },
  });

  queue.repairDOMInput({ data: 'p', inputType: 'insertText' }, root, 2);

  expect(editor.read((state) => state.text.string([0]))).toBe(domText);

  root.remove();
});

test('native input repair does not move selection for pathless clicks outside the target text', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const originalText = 'alpha';
  const domText = 'alphax';

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: originalText }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'beta' }],
      },
    ],
    selection: {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    },
  });

  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode(domText);
  const pathlessTarget = document.createElement('button');
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController: {
      preferModelSelectionForInputRef: { current: false },
      state: createEditableInputControllerState(),
    },
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  pathlessTarget.textContent = 'click target';
  root.append(textHost, pathlessTarget);

  range.setStart(pathlessTarget, 0);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairDOMInput(
    {
      data: 'x',
      inputType: 'insertText',
      target: {
        insert: { offset: 5, text: 'x' },
        path: [0, 0],
        preferCapturedInsert: true,
        selectionOffset: 6,
        text: domText,
      },
    },
    root,
    1
  );

  expect(editor.read((state) => state.text.string([0]))).toBe(domText);
  expect(editor.read((state) => state.selection.get())).toEqual({
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });

  root.remove();
});

test('native input repair reconciles captured burst targets against partially synced model text', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const prefix = 'This ';
  const syncedPrefix = 'abc';
  const remainingText = 'def';
  const burstText = `${syncedPrefix}${remainingText}`;
  const suffix = ' note';
  const partialModelText = `${prefix}${syncedPrefix}${suffix}`;
  const domText = `${prefix}${burstText}${suffix}`;
  const nextOffset = prefix.length + burstText.length;

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: partialModelText }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: prefix.length + syncedPrefix.length },
      focus: { path: [0, 0], offset: prefix.length + syncedPrefix.length },
    },
  });

  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode(domText);
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController: {
      preferModelSelectionForInputRef: { current: false },
      state: createEditableInputControllerState(),
    },
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);

  range.setStart(text, nextOffset);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairDOMInput(
    {
      data: remainingText.at(-1)!,
      inputType: 'insertText',
      target: {
        insert: { offset: prefix.length, text: burstText },
        path: [0, 0],
        selectionOffset: nextOffset,
        text: domText,
      },
    },
    root,
    1
  );

  expect(editor.read((state) => state.text.string([0]))).toBe(domText);
  expect(editor.read((state) => state.selection.get())).toEqual({
    anchor: { path: [0, 0], offset: nextOffset },
    focus: { path: [0, 0], offset: nextOffset },
  });

  root.remove();
});

test('native input repair moves model selection when the captured target still owns the DOM caret', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const prefix = 'Release ';
  const burstText = 'abcdefghijklmnop';
  const originalText = `${prefix}readiness memo`;
  const domText = `${prefix}${burstText}readiness memo`;
  const nextOffset = prefix.length + burstText.length;

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: originalText }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode(domText);
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController: {
      preferModelSelectionForInputRef: { current: false },
      state: createEditableInputControllerState(),
    },
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);

  range.setStart(text, nextOffset);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairDOMInput(
    {
      data: burstText.at(-1)!,
      inputType: 'insertText',
      target: {
        path: [0, 0],
        selectionOffset: nextOffset,
        text: domText,
      },
    },
    root,
    1
  );

  expect(editor.read((state) => state.text.string([0]))).toBe(domText);
  expect(editor.read((state) => state.selection.get())).toEqual({
    anchor: { path: [0, 0], offset: nextOffset },
    focus: { path: [0, 0], offset: nextOffset },
  });

  root.remove();
});

test('native input repair guards virtualized DOM replacement selectionchanges', () => {
  vi.useFakeTimers();

  try {
    const editor = createReactEditor();
    const root = mountEditorRoot(editor);
    const inputController = {
      preferModelSelectionForInputRef: { current: false },
      state: createEditableInputControllerState(),
    };

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'abc' }],
        },
      ],
      selection: {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
    });

    const textHost = document.createElement('span');
    const string = document.createElement('span');
    const text = document.createTextNode('aXbc');
    const range = document.createRange();
    const selection = window.getSelection();
    const queue = createDOMRepairQueue({
      editor,
      inputController,
      scrollSelectionIntoView: () => {},
      syncDOMSelectionToEditor: () => {},
    });

    textHost.setAttribute('data-plite-node', 'text');
    textHost.setAttribute('data-plite-path', '0,0');
    string.setAttribute('data-plite-string', 'true');
    string.append(text);
    textHost.append(string);
    root.append(textHost);

    range.setStart(text, 2);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);

    queue.repairDOMInput({ data: 'X', inputType: 'insertText' }, root, 1);

    expect(editor.read((state) => state.text.string([0]))).toBe('aXbc');
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });
    expect(inputController.state.selectionChangeOrigin).toBe('repair-induced');

    vi.advanceTimersByTime(151);

    expect(inputController.state.selectionChangeOrigin).toBe(null);

    root.remove();
  } finally {
    vi.useRealTimers();
  }
});

test('native text repair keeps model authority inside virtualized pages', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const inputController = {
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  };

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'abc' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  const page = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode('aXbc');
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController,
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  page.setAttribute('data-plite-dom-strategy-virtual-row', 'true');
  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  page.append(textHost);
  root.append(page);

  range.setStart(text, 2);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairDOMInput({ data: 'X', inputType: 'insertText' }, root, 1);

  expect(editor.read((state) => state.text.string([0]))).toBe('aXbc');
  expect(editor.read((state) => state.selection.get())).toEqual({
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [0, 0], offset: 2 },
  });
  expect(inputController.preferModelSelectionForInputRef.current).toBe(true);
  expect(inputController.state.selectionSource).toBe('model-owned');
  expect(inputController.state.modelOwnedTextInputGuard).toBeGreaterThan(0);

  root.remove();
});

test('native text repair keeps same virtualized target DOM-owned', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const inputController = {
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  };

  inputController.state.selectionSource = 'model-owned';

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'abc' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  const page = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode('aXbc');
  const range = document.createRange();
  const selection = window.getSelection();
  const setBaseAndExtentSpy = vi.spyOn(Selection.prototype, 'setBaseAndExtent');
  const setTimeoutSpy = vi
    .spyOn(window, 'setTimeout')
    .mockImplementation(() => 1);
  const queue = createDOMRepairQueue({
    editor,
    inputController,
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  page.setAttribute('data-plite-dom-strategy-virtual-row', 'true');
  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  page.append(textHost);
  root.append(page);

  range.setStart(text, 2);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  try {
    queue.repairDOMInput(
      {
        data: 'X',
        inputType: 'insertText',
        target: {
          insert: { offset: 1, text: 'X' },
          path: [0, 0],
          preferCapturedInsert: true,
          selectionOffset: 2,
          text: 'aXbc',
        },
      },
      root,
      1
    );

    expect(editor.read((state) => state.text.string([0]))).toBe('aXbc');
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });
    expect(inputController.preferModelSelectionForInputRef.current).toBe(false);
    expect(inputController.state.selectionSource).toBe('dom-current');
    expect(inputController.state.modelOwnedTextInputGuard).toBe(0);
    expect(setBaseAndExtentSpy).not.toHaveBeenCalled();
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 25);
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);
  } finally {
    setBaseAndExtentSpy.mockRestore();
    setTimeoutSpy.mockRestore();
  }

  root.remove();
});

test('native text repair advances captured virtualized target when DOM offset lags', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const inputController = {
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  };

  inputController.state.selectionSource = 'model-owned';

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'abc' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  const page = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode('aXbc');
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController,
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  page.setAttribute('data-plite-dom-strategy-virtual-row', 'true');
  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  page.append(textHost);
  root.append(page);

  range.setStart(text, 1);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairDOMInput(
    {
      data: 'X',
      inputType: 'insertText',
      target: {
        insert: { offset: 1, text: 'X' },
        path: [0, 0],
        selectionOffset: 2,
        text: 'aXbc',
      },
    },
    root,
    1
  );

  expect(editor.read((state) => state.text.string([0]))).toBe('aXbc');
  expect(editor.read((state) => state.selection.get())).toEqual({
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [0, 0], offset: 2 },
  });
  expect(inputController.preferModelSelectionForInputRef.current).toBe(true);
  expect(inputController.state.selectionSource).toBe('model-owned');

  root.remove();
});

test('native text repair advances captured virtualized target when DOM caret reset to start', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const inputController = {
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  };
  const beforeText = 'Condico uredo ante arca umbra.';
  const insertedText = 'X'.repeat(10);
  const domText = beforeText.slice(0, 1) + insertedText + beforeText.slice(1);
  const nextOffset = 1 + insertedText.length;

  inputController.state.selectionSource = 'model-owned';
  inputController.state.pendingNativeTextInputRepairOffset = nextOffset;
  inputController.state.pendingNativeTextInputRepairPathKey = '0,0';

  editorReplace(editor, {
    children: [
      {
        type: 'heading',
        children: [{ text: beforeText }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  const page = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode(domText);
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController,
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  page.setAttribute('data-plite-dom-strategy-virtual-row', 'true');
  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  page.append(textHost);
  root.append(page);

  range.setStart(text, 0);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairDOMInput(
    {
      data: insertedText.at(-1)!,
      inputType: 'insertText',
      target: {
        insert: { offset: 1, text: insertedText },
        path: [0, 0],
        selectionOffset: nextOffset,
        text: domText,
      },
    },
    root,
    1
  );

  expect(editor.read((state) => state.text.string([0]))).toBe(domText);
  expect(editor.read((state) => state.selection.get())).toEqual({
    anchor: { path: [0, 0], offset: nextOffset },
    focus: { path: [0, 0], offset: nextOffset },
  });
  expect(selection?.anchorOffset).toBe(nextOffset);
  expect(inputController.state.pendingNativeTextInputRepairOffset).toBe(null);
  expect(inputController.state.pendingNativeTextInputRepairPathKey).toBe(null);

  root.remove();
});

test('native text repair keeps model authority when synced virtualized DOM caret lags', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const inputController = {
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  };

  inputController.state.selectionSource = 'dom-current';
  inputController.state.pendingNativeTextInputRepairOffset = 2;
  inputController.state.pendingNativeTextInputRepairPathKey = '0,0';

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'aXbc' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    },
  });

  const page = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode('aXbc');
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController,
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  page.setAttribute('data-plite-dom-strategy-virtual-row', 'true');
  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  page.append(textHost);
  root.append(page);

  range.setStart(text, 1);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairDOMInput(
    {
      data: 'X',
      inputType: 'insertText',
      target: {
        insert: { offset: 1, text: 'X' },
        path: [0, 0],
        selectionOffset: 2,
        text: 'aXbc',
      },
    },
    root,
    1
  );

  expect(editor.read((state) => state.selection.get())).toEqual({
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [0, 0], offset: 2 },
  });
  expect(selection?.anchorOffset).toBe(2);
  expect(inputController.preferModelSelectionForInputRef.current).toBe(true);
  expect(inputController.state.selectionSource).toBe('model-owned');
  expect(inputController.state.modelOwnedTextInputGuard).toBeGreaterThan(0);
  expect(inputController.state.pendingNativeTextInputRepairOffset).toBe(null);
  expect(inputController.state.pendingNativeTextInputRepairPathKey).toBe(null);

  root.remove();
});

test('text insert caret repair keeps model authority in virtualized DOM', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const inputController = {
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  };

  inputController.state.selectionSource = 'dom-current';
  inputController.state.pendingNativeTextInputRepairOffset = 2;
  inputController.state.pendingNativeTextInputRepairPathKey = '0,0';

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'aXbc' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    },
  });

  const page = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode('aXbc');
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController,
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  page.setAttribute('data-plite-dom-strategy-virtual-row', 'true');
  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  page.append(textHost);
  root.append(page);

  range.setStart(text, 0);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairCaretAfterModelTextInsert();

  expect(selection?.anchorOffset).toBe(2);
  expect(inputController.preferModelSelectionForInputRef.current).toBe(true);
  expect(inputController.state.selectionSource).toBe('model-owned');
  expect(inputController.state.modelOwnedTextInputGuard).toBeGreaterThan(0);
  expect(inputController.state.pendingNativeTextInputRepairOffset).toBe(null);
  expect(inputController.state.pendingNativeTextInputRepairPathKey).toBe(null);

  root.remove();
});

test('text insert caret repair keeps model authority for projected DOM sync', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const inputController = {
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  };

  inputController.state.selectionSource = 'dom-current';
  inputController.state.pendingNativeTextInputRepairOffset = 2;
  inputController.state.pendingNativeTextInputRepairPathKey = '0,0';

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'aXbc' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    },
  });

  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode('aXbc');
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController,
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  textHost.setAttribute('data-plite-projected-dom-sync', 'true');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);

  range.setStart(text, 0);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairCaretAfterModelTextInsert();

  expect(selection?.anchorOffset).toBe(2);
  expect(inputController.preferModelSelectionForInputRef.current).toBe(true);
  expect(inputController.state.selectionSource).toBe('model-owned');
  expect(inputController.state.modelOwnedTextInputGuard).toBeGreaterThan(0);
  expect(inputController.state.pendingNativeTextInputRepairOffset).toBe(null);
  expect(inputController.state.pendingNativeTextInputRepairPathKey).toBe(null);

  root.remove();
});

test('text insert caret repair keeps existing model authority for plain DOM text', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const inputController = {
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  };

  inputController.state.selectionSource = 'model-owned';
  inputController.state.pendingNativeTextInputRepairOffset = 2;
  inputController.state.pendingNativeTextInputRepairPathKey = '0,0';

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'aXbc' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    },
  });

  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode('aXbc');
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController,
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);

  range.setStart(text, 0);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairCaretAfterModelTextInsert();

  expect(selection?.anchorOffset).toBe(2);
  expect(inputController.preferModelSelectionForInputRef.current).toBe(true);
  expect(inputController.state.selectionSource).toBe('model-owned');
  expect(inputController.state.modelOwnedTextInputGuard).toBeGreaterThan(0);
  expect(inputController.state.pendingNativeTextInputRepairOffset).toBe(null);
  expect(inputController.state.pendingNativeTextInputRepairPathKey).toBe(null);
  expect(inputController.state.recentTextInputRepairEcho).toBe(null);

  root.remove();
});

test('virtualized text insert caret repair ignores stale frame cancellation when pending matches', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const inputController = {
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  };

  inputController.state.selectionSource = 'model-owned';
  inputController.state.pendingNativeTextInputRepairOffset = 2;
  inputController.state.pendingNativeTextInputRepairPathKey = '0,0';

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'aXbc' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    },
  });

  const page = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode('aXbc');
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController,
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  page.setAttribute('data-plite-dom-strategy-virtual-row', 'true');
  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  page.append(textHost);
  root.append(page);

  range.setStart(text, 0);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  beginEditableEventFrame(editor, {
    eventFamily: 'selectionchange',
    focusOwner: 'editor',
    inputIntent: 'text-insert',
    modelSelectionBefore: editor.read((state) => state.selection.get()),
    selectionSource: 'model-owned',
    targetOwner: 'editor',
  });
  queue.cancelBefore(2);
  queue.repairCaretAfterModelTextInsert();

  expect(selection?.anchorOffset).toBe(2);
  expect(inputController.state.pendingNativeTextInputRepairOffset).toBe(null);
  expect(inputController.state.pendingNativeTextInputRepairPathKey).toBe(null);

  root.remove();
});

test('virtualized text insert caret repair corrects model drift back to pending offset', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const inputController = {
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  };
  const textValue = 'CXXXXXXXXXXondico uredo ante arca umbra.';

  inputController.state.selectionSource = 'model-owned';
  inputController.state.pendingNativeTextInputRepairOffset = 11;
  inputController.state.pendingNativeTextInputRepairPathKey = '0,0';

  editorReplace(editor, {
    children: [
      {
        type: 'heading',
        children: [{ text: textValue }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 12 },
      focus: { path: [0, 0], offset: 12 },
    },
  });

  const page = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode(textValue);
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController,
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  page.setAttribute('data-plite-dom-strategy-virtual-row', 'true');
  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  page.append(textHost);
  root.append(page);

  range.setStart(text, 0);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairCaretAfterModelTextInsert();

  expect(editor.read((state) => state.selection.get())).toEqual({
    anchor: { path: [0, 0], offset: 11 },
    focus: { path: [0, 0], offset: 11 },
  });
  expect(selection?.anchorOffset).toBe(11);
  expect(inputController.state.pendingNativeTextInputRepairOffset).toBe(null);
  expect(inputController.state.pendingNativeTextInputRepairPathKey).toBe(null);

  root.remove();
});

test('native input repair trusts captured coalesced inserts when projected DOM interleaves suffix text', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const originalText = 'This mixed';
  const domText = 'This qmrixed';
  const repairedText = 'This qrmixed';
  const nextOffset = 'This qr'.length;

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: originalText }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode(domText);
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController: {
      preferModelSelectionForInputRef: { current: false },
      state: createEditableInputControllerState(),
    },
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);

  range.setStart(text, 'This qmr'.length);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairDOMInput(
    {
      data: 'r',
      inputType: 'insertText',
      target: {
        insert: { offset: 'This '.length, text: 'qr' },
        path: [0, 0],
        preferCapturedInsert: true,
        selectionOffset: 'This qmr'.length,
        text: domText,
      },
    },
    root,
    1
  );

  expect(editor.read((state) => state.text.string([0]))).toBe(repairedText);
  expect(editor.read((state) => state.selection.get())).toEqual({
    anchor: { path: [0, 0], offset: nextOffset },
    focus: { path: [0, 0], offset: nextOffset },
  });

  root.remove();
});

test('native input repair rebases later captured same-path inserts against repaired model text', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const firstDOMText = 'Xabc';
  const finalDOMText = 'XabcY';

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'abc' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode(finalDOMText);
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController: {
      preferModelSelectionForInputRef: { current: false },
      state: createEditableInputControllerState(),
    },
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);

  range.setStart(text, finalDOMText.length);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairDOMInput(
    {
      data: 'X',
      inputType: 'insertText',
      target: {
        insert: { offset: 0, text: 'X' },
        path: [0, 0],
        selectionOffset: 1,
        text: firstDOMText,
      },
    },
    root,
    1
  );
  queue.repairDOMInput(
    {
      data: 'Y',
      inputType: 'insertText',
      target: {
        insert: { offset: 3, text: 'Y' },
        path: [0, 0],
        selectionOffset: finalDOMText.length,
        text: finalDOMText,
      },
    },
    root,
    2
  );

  expect(editor.read((state) => state.text.string([0]))).toBe(finalDOMText);
  expect(editor.read((state) => state.selection.get())).toEqual({
    anchor: { path: [0, 0], offset: finalDOMText.length },
    focus: { path: [0, 0], offset: finalDOMText.length },
  });

  root.remove();
});

test('native input repair does not repair the caret for stale captured targets', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const prefix = 'This ';
  const capturedBurst = 'abc';
  const liveSuffix = 'def';
  const suffix = ' note';
  const originalText = `${prefix}${suffix}`;
  const capturedText = `${prefix}${capturedBurst}${suffix}`;
  const liveText = `${prefix}${capturedBurst}${liveSuffix}${suffix}`;
  const capturedOffset = prefix.length + capturedBurst.length;
  const liveOffset = prefix.length + capturedBurst.length + liveSuffix.length;
  let scrollCalls = 0;

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: originalText }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: prefix.length },
      focus: { path: [0, 0], offset: prefix.length },
    },
  });

  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode(liveText);
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController: {
      preferModelSelectionForInputRef: { current: false },
      state: createEditableInputControllerState(),
    },
    scrollSelectionIntoView: () => {
      scrollCalls++;
    },
    syncDOMSelectionToEditor: () => {},
  });

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);

  range.setStart(text, liveOffset);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairDOMInput(
    {
      data: capturedBurst.at(-1)!,
      inputType: 'insertText',
      target: {
        insert: { offset: prefix.length, text: capturedBurst },
        path: [0, 0],
        selectionOffset: capturedOffset,
        text: capturedText,
      },
    },
    root,
    1
  );

  expect(editor.read((state) => state.text.string([0]))).toBe(capturedText);
  expect(scrollCalls).toBe(0);

  root.remove();
});

test('native input repair does not move selection for stale coalesced targets', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const prefix = 'This ';
  const capturedBurst = 'abc';
  const suffix = ' note';
  const originalText = `${prefix}${suffix}`;
  const capturedText = `${prefix}${capturedBurst}${suffix}`;
  const clickedText = 'clicked';
  const capturedOffset = prefix.length + capturedBurst.length;
  let scrollCalls = 0;

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: originalText }],
      },
      {
        type: 'paragraph',
        children: [{ text: clickedText }],
      },
    ],
    selection: {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    },
  });

  const targetTextHost = document.createElement('span');
  const targetString = document.createElement('span');
  const targetText = document.createTextNode(capturedText);
  const clickedTextHost = document.createElement('span');
  const clickedString = document.createElement('span');
  const clickedNode = document.createTextNode(clickedText);
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController: {
      preferModelSelectionForInputRef: { current: false },
      state: createEditableInputControllerState(),
    },
    scrollSelectionIntoView: () => {
      scrollCalls++;
    },
    syncDOMSelectionToEditor: () => {},
  });

  targetTextHost.setAttribute('data-plite-node', 'text');
  targetTextHost.setAttribute('data-plite-path', '0,0');
  targetString.setAttribute('data-plite-string', 'true');
  targetString.append(targetText);
  targetTextHost.append(targetString);
  clickedTextHost.setAttribute('data-plite-node', 'text');
  clickedTextHost.setAttribute('data-plite-path', '1,0');
  clickedString.setAttribute('data-plite-string', 'true');
  clickedString.append(clickedNode);
  clickedTextHost.append(clickedString);
  root.append(targetTextHost, clickedTextHost);

  range.setStart(clickedNode, 0);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairDOMInput(
    {
      data: capturedBurst.at(-1)!,
      inputType: 'insertText',
      target: {
        insert: { offset: prefix.length, text: capturedBurst },
        path: [0, 0],
        preferCapturedInsert: true,
        selectionOffset: capturedOffset,
        text: capturedText,
      },
    },
    root,
    1
  );

  expect(editor.read((state) => state.text.string([0]))).toBe(capturedText);
  expect(editor.read((state) => state.selection.get())).toEqual({
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });
  expect(scrollCalls).toBe(0);

  root.remove();
});

test('native input repair replaces expanded model selections and collapses at the DOM caret', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const originalText = 'This is editable plain text';
  const replacementText = 'foo';

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: originalText }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: originalText.length },
    },
  });

  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode(replacementText);
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController: {
      preferModelSelectionForInputRef: { current: true },
      state: createEditableInputControllerState(),
    },
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);

  range.setStart(text, replacementText.length);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairDOMInput(
    { data: replacementText, inputType: 'insertText' },
    root
  );

  expect(editor.read((state) => state.text.string([0]))).toBe(replacementText);
  expect(editor.read((state) => state.selection.get())).toEqual({
    anchor: { path: [0, 0], offset: replacementText.length },
    focus: { path: [0, 0], offset: replacementText.length },
  });

  root.remove();
});

test('text insert caret repair waits until rendered text matches the model', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const inputController = {
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  };
  inputController.state.selectionSource = 'model-owned';
  const originalText = 'This is editable';
  const modelText = `C${originalText}`;
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode(originalText);
  const range = document.createRange();
  const selection = window.getSelection();
  const repairRequestAnimationFrame = vi.fn(() => 1);
  const repairSetTimeout = vi.fn(() => 1);
  const repairQueueMicrotask = vi.fn((callback: () => void) => callback());

  EDITOR_TO_WINDOW.set(editor, {
    queueMicrotask: repairQueueMicrotask,
    requestAnimationFrame: repairRequestAnimationFrame,
    setTimeout: repairSetTimeout,
  } as unknown as Window);

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: modelText }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);

  range.setStart(text, 0);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  const queue = createDOMRepairQueue({
    editor,
    inputController,
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  try {
    queue.repairCaretAfterModelTextInsert();

    expect(selection?.anchorOffset).toBe(0);
    expect(inputController.preferModelSelectionForInputRef.current).toBe(true);
    expect(inputController.state.selectionSource).toBe('model-owned');
    expect(repairQueueMicrotask).toHaveBeenCalled();
    expect(repairRequestAnimationFrame).toHaveBeenCalled();
    expect(repairSetTimeout).toHaveBeenCalled();
  } finally {
    EDITOR_TO_WINDOW.set(editor, window);
    root.remove();
  }
});

test('deferred native input repair still fixes a stale caret after text already synced', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const inputController = {
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  };
  const beforeText = 'Condico uredo ante arca umbra.';
  const insertedText = 'X'.repeat(10);
  const modelText = beforeText.slice(0, 1) + insertedText + beforeText.slice(1);
  const staleDOMOffset =
    modelText.indexOf(insertedText) + insertedText.length - 1;
  const modelOffset = 1 + insertedText.length;
  const virtualRow = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode(modelText);
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController,
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  inputController.state.selectionSource = 'model-owned';

  editorReplace(editor, {
    children: [
      {
        type: 'heading',
        children: [{ text: modelText }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: modelOffset },
      focus: { path: [0, 0], offset: modelOffset },
    },
  });

  virtualRow.setAttribute('data-plite-dom-strategy-virtual-row', 'true');
  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  virtualRow.append(textHost);
  root.append(virtualRow);

  range.setStart(text, staleDOMOffset);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairDOMInput(
    {
      data: insertedText.at(-1)!,
      inputType: 'insertText',
      target: {
        insert: { offset: 1, text: insertedText },
        path: [0, 0],
        preferCapturedInsert: true,
        selectionOffset: modelOffset,
        text: modelText,
      },
    },
    root,
    1
  );

  expect(editor.read((state) => state.text.string([0]))).toBe(modelText);
  expect(editor.read((state) => state.selection.get())).toEqual({
    anchor: { path: [0, 0], offset: modelOffset },
    focus: { path: [0, 0], offset: modelOffset },
  });
  expect(selection?.anchorOffset).toBe(modelOffset);
  expect(inputController.state.selectionSource).toBe('model-owned');

  root.remove();
});

test('virtualized captured input repair moves selection when DOM selection is root-backed', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const inputController = {
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  };
  const beforeText = 'Condico uredo ante arca umbra.';
  const insertedText = 'X'.repeat(10);
  const domText = beforeText.slice(0, 1) + insertedText + beforeText.slice(1);
  const expectedOffset = 1 + insertedText.length;
  const virtualRow = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode(domText);
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController,
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  inputController.state.selectionSource = 'dom-current';

  editorReplace(editor, {
    children: [
      {
        type: 'heading',
        children: [{ text: beforeText }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    },
  });

  virtualRow.setAttribute('data-plite-dom-strategy-virtual-row', 'true');
  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  virtualRow.append(textHost);
  root.append(virtualRow);

  range.setStart(virtualRow, 1);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairDOMInput(
    {
      data: insertedText.at(-1)!,
      inputType: 'insertText',
      target: {
        insert: { offset: 1, text: insertedText },
        path: [0, 0],
        selectionOffset: expectedOffset,
        text: domText,
      },
    },
    root,
    1
  );

  expect(editor.read((state) => state.text.string([0]))).toBe(domText);
  expect(editor.read((state) => state.selection.get())).toEqual({
    anchor: { path: [0, 0], offset: expectedOffset },
    focus: { path: [0, 0], offset: expectedOffset },
  });

  root.remove();
});

test('native input repair prefers live model continuation over stale captured text target', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const inputController = {
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  };
  const modelText = 'oXXXne';
  const domText = 'oXXXXne';
  const virtualRow = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode(domText);
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController,
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  inputController.state.selectionSource = 'dom-current';

  editorReplace(editor, {
    children: [
      {
        type: 'heading',
        children: [{ text: modelText }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  virtualRow.setAttribute('data-plite-dom-strategy-virtual-row', 'true');
  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  virtualRow.append(textHost);
  root.append(virtualRow);

  range.setStart(text, 3);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairDOMInput(
    {
      data: 'X',
      inputType: 'insertText',
      target: {
        insert: { offset: 3, text: 'X' },
        path: [0, 0],
        preferCapturedInsert: true,
        selectionOffset: 4,
        text: domText,
      },
    },
    root,
    1
  );

  expect(editor.read((state) => state.text.string([0]))).toBe(domText);
  expect(editor.read((state) => state.selection.get())).toEqual({
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 5 },
  });

  root.remove();
});

test('deferred native input repair fixes a stale caret after text already synced without a captured target', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const inputController = {
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  };
  const beforeText = 'Condico uredo ante arca umbra.';
  const insertedText = 'X'.repeat(10);
  const modelText = beforeText.slice(0, 1) + insertedText + beforeText.slice(1);
  const staleDOMOffset =
    modelText.indexOf(insertedText) + insertedText.length - 1;
  const modelOffset = 1 + insertedText.length;
  const virtualRow = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode(modelText);
  const range = document.createRange();
  const selection = window.getSelection();
  const queue = createDOMRepairQueue({
    editor,
    inputController,
    scrollSelectionIntoView: () => {},
    syncDOMSelectionToEditor: () => {},
  });

  inputController.state.selectionSource = 'dom-current';

  editorReplace(editor, {
    children: [
      {
        type: 'heading',
        children: [{ text: modelText }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: modelOffset },
      focus: { path: [0, 0], offset: modelOffset },
    },
  });

  virtualRow.setAttribute('data-plite-dom-strategy-virtual-row', 'true');
  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  virtualRow.append(textHost);
  root.append(virtualRow);

  range.setStart(text, staleDOMOffset);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  queue.repairDOMInput(
    { data: insertedText.at(-1)!, inputType: 'insertText' },
    root,
    1
  );

  expect(editor.read((state) => state.text.string([0]))).toBe(modelText);
  expect(selection?.anchorOffset).toBe(modelOffset);

  root.remove();
});

test('deferred native input repair rechecks a virtualized synced caret after initial agreement', () => {
  const editor = createReactEditor();
  const root = mountEditorRoot(editor);
  const inputController = {
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  };
  const modelText = 'aXbc';
  const modelOffset = 2;
  const virtualRow = document.createElement('div');
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode(modelText);
  const range = document.createRange();
  const selection = window.getSelection();
  const setTimeoutSpy = vi
    .spyOn(window, 'setTimeout')
    .mockImplementation(() => 1);

  editorReplace(editor, {
    children: [
      {
        type: 'heading',
        children: [{ text: modelText }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: modelOffset },
      focus: { path: [0, 0], offset: modelOffset },
    },
  });

  virtualRow.setAttribute('data-plite-dom-strategy-virtual-row', 'true');
  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  virtualRow.append(textHost);
  root.append(virtualRow);

  range.setStart(text, modelOffset);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);

  try {
    const queue = createDOMRepairQueue({
      editor,
      inputController,
      scrollSelectionIntoView: () => {},
      syncDOMSelectionToEditor: () => {},
    });

    queue.repairDOMInput(
      {
        data: 'X',
        inputType: 'insertText',
        target: {
          insert: { offset: 1, text: 'X' },
          path: [0, 0],
          preferCapturedInsert: true,
          selectionOffset: modelOffset,
          text: modelText,
        },
      },
      root,
      1
    );

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 25);
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);
  } finally {
    setTimeoutSpy.mockRestore();
    root.remove();
  }
});

test('repair execution is skipped for none policy', () => {
  let calls = 0;

  expect(
    executeEditableRepairPolicy({
      repair: () => {
        calls++;
      },
      repairPolicy: { kind: 'none', reason: 'not-requested' },
    })
  ).toBe(false);
  expect(calls).toBe(0);
});

test('repair execution runs for explicit repair policy', () => {
  let calls = 0;

  expect(
    executeEditableRepairPolicy({
      repair: () => {
        calls++;
      },
      repairPolicy: { kind: 'repair-caret', reason: 'repair-caret' },
    })
  ).toBe(true);
  expect(calls).toBe(1);
});
