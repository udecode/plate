import { DocumentChange } from '@platejs/plite';
import {
  createDOMPhaseScheduler,
  EDITOR_TO_ELEMENT,
} from '@platejs/plite-dom/internal';
import { history } from '@platejs/plite-history';

import {
  attachPliteBrowserHandle as attachRuntimeBrowserHandle,
  type PliteBrowserHandleElement,
} from '../src/editable/browser-handle';
import {
  createEditableInputController,
  createEditableInputControllerState,
} from '../src/editable/input-controller';
import { createReactEditor } from '../src/plugin/with-react';

const testSchedulers = new Set<ReturnType<typeof createDOMPhaseScheduler>>();
const attachPliteBrowserHandle = (
  options: Omit<
    Parameters<typeof attachRuntimeBrowserHandle>[0],
    'domPhaseScheduler'
  >
) => {
  const domPhaseScheduler = createDOMPhaseScheduler();

  testSchedulers.add(domPhaseScheduler);

  return attachRuntimeBrowserHandle({ ...options, domPhaseScheduler });
};

afterEach(() => {
  for (const scheduler of testSchedulers) scheduler.destroy();
  testSchedulers.clear();
});

const createInputController = () =>
  createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });

test('browser handle applies direct text writes and canonical document changes', () => {
  const editor = createReactEditor({
    extensions: [history()],
    initialValue: [{ type: 'paragraph', children: [{ text: 'one' }] }],
  });
  const element = document.createElement('div') as PliteBrowserHandleElement;
  const forceRender = vi.fn();

  attachPliteBrowserHandle({
    browserHandleNextId: { current: 0 },
    browserHandleRangeAnchors: { current: new Map() },
    editor,
    element,
    forceRender,
    inputController: createInputController(),
    isPartialDOMBackedSelection: () => false,
    setExplicitPartialDOMBackedSelection: vi.fn(),
  });

  element.__pliteBrowserHandle?.insertTextAt('!', {
    offset: 3,
    path: [0, 0],
  });
  expect(editor.read((state) => state.children())).toEqual([
    { type: 'paragraph', children: [{ text: 'one!' }] },
  ]);

  element.__pliteBrowserHandle?.deleteTextAt({
    kind: 'text',
    anchor: { offset: 3, path: [0, 0] },
    focus: { offset: 4, path: [0, 0] },
  });
  expect(editor.read((state) => state.children())).toEqual([
    { type: 'paragraph', children: [{ text: 'one' }] },
  ]);

  const before = editor.read((state) => state.value());
  const after = {
    children: [{ type: 'paragraph', children: [{ text: 'remote' }] }],
  };

  element.__pliteBrowserHandle?.applyChange(
    DocumentChange.between(before, after).toJSON(),
    { history: 'skip', tags: 'remote-change' }
  );
  expect(editor.read((state) => state.value())).toEqual(after);
  expect(element.__pliteBrowserHandle?.getLastCommit()).toMatchObject({
    change: { version: 3 },
    changedRoots: [null],
    classifications: [{ root: null, text: true }],
    tags: ['remote-change', 'history-skip'],
  });

  element.__pliteBrowserHandle?.applyValueChange(
    {
      children: [{ type: 'paragraph', children: [{ text: 'value diff' }] }],
    },
    { history: 'skip', tags: 'value-change' }
  );
  expect(editor.read((state) => state.children())).toEqual([
    { type: 'paragraph', children: [{ text: 'value diff' }] },
  ]);
  expect(element.__pliteBrowserHandle?.getLastCommit()).toMatchObject({
    change: { version: 3 },
    changedRoots: [null],
    tags: ['value-change', 'history-skip'],
  });
  expect(forceRender).toHaveBeenCalledTimes(4);
});

test('browser handle focuses its attached root when one runtime has multiple roots', () => {
  const editor = createReactEditor({
    initialValue: [{ type: 'paragraph', children: [{ text: 'one' }] }],
  });
  const element = document.createElement('div') as PliteBrowserHandleElement;
  const otherRoot = document.createElement('div');

  element.tabIndex = 0;
  otherRoot.tabIndex = 0;
  document.body.append(element, otherRoot);
  EDITOR_TO_ELEMENT.set(editor, otherRoot);

  attachPliteBrowserHandle({
    browserHandleNextId: { current: 0 },
    browserHandleRangeAnchors: { current: new Map() },
    editor,
    element,
    forceRender: vi.fn(),
    inputController: createInputController(),
    isPartialDOMBackedSelection: () => false,
    setExplicitPartialDOMBackedSelection: vi.fn(),
  });

  element.__pliteBrowserHandle?.focus();

  expect(document.activeElement).toBe(element);
  element.remove();
  otherRoot.remove();
});

test('browser handle undo and redo no-op when history is disabled', () => {
  const editor = createReactEditor({
    extensions: [history({ enabled: false })],
  });
  const element = document.createElement('div') as PliteBrowserHandleElement;
  const forceRender = vi.fn();

  attachPliteBrowserHandle({
    browserHandleNextId: { current: 0 },
    browserHandleRangeAnchors: { current: new Map() },
    editor,
    element,
    forceRender,
    inputController: createInputController(),
    isPartialDOMBackedSelection: () => false,
    setExplicitPartialDOMBackedSelection: vi.fn(),
  });

  expect(() => element.__pliteBrowserHandle?.undo()).not.toThrow();
  expect(() => element.__pliteBrowserHandle?.redo()).not.toThrow();
  expect(forceRender).not.toHaveBeenCalled();
});

test('browser handle leaves text-only multi-root history to direct DOM sync', () => {
  const before = {
    children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
    roots: {
      shared: [{ type: 'paragraph', children: [{ text: 'alpha' }] }],
    },
  };
  const after = {
    children: [{ type: 'paragraph', children: [{ text: 'two' }] }],
    roots: {
      shared: [{ type: 'paragraph', children: [{ text: 'beta' }] }],
    },
  };
  const editor = createReactEditor({
    extensions: [history()],
    initialValue: before,
  });
  const element = document.createElement('div') as PliteBrowserHandleElement;
  const forceRender = vi.fn();

  attachPliteBrowserHandle({
    browserHandleNextId: { current: 0 },
    browserHandleRangeAnchors: { current: new Map() },
    editor,
    element,
    forceRender,
    inputController: createInputController(),
    isPartialDOMBackedSelection: () => false,
    setExplicitPartialDOMBackedSelection: vi.fn(),
  });

  element.__pliteBrowserHandle?.applyValueChange(after);
  forceRender.mockClear();

  element.__pliteBrowserHandle?.undo();

  expect(editor.read((state) => state.value())).toEqual(before);
  expect(forceRender).not.toHaveBeenCalled();

  element.__pliteBrowserHandle?.redo();

  expect(editor.read((state) => state.value())).toEqual(after);
  expect(forceRender).not.toHaveBeenCalled();
});

test('browser handle selectAll selects the whole editor', () => {
  const editor = createReactEditor({
    initialValue: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
  });
  const element = document.createElement('div') as PliteBrowserHandleElement;

  attachPliteBrowserHandle({
    browserHandleNextId: { current: 0 },
    browserHandleRangeAnchors: { current: new Map() },
    editor,
    element,
    forceRender: vi.fn(),
    inputController: createInputController(),
    isPartialDOMBackedSelection: () => false,
    setExplicitPartialDOMBackedSelection: vi.fn(),
  });

  element.__pliteBrowserHandle?.selectAll();

  expect(element.__pliteBrowserHandle?.getSelection()).toEqual({
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 3, path: [1, 0] },
    kind: 'text',
  });
});

test('browser handle exposes model block texts independently of rendered DOM', () => {
  const editor = createReactEditor({
    initialValue: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
  });
  const element = document.createElement('div') as PliteBrowserHandleElement;

  attachPliteBrowserHandle({
    browserHandleNextId: { current: 0 },
    browserHandleRangeAnchors: { current: new Map() },
    editor,
    element,
    forceRender: vi.fn(),
    inputController: createInputController(),
    isPartialDOMBackedSelection: () => false,
    setExplicitPartialDOMBackedSelection: vi.fn(),
  });

  expect(element.__pliteBrowserHandle?.getBlockTexts()).toEqual(['one', 'two']);
  expect(element.__pliteBrowserHandle?.getBlockText(1)).toBe('two');
  expect(element.__pliteBrowserHandle?.getBlockText(2)).toBeNull();
});

test('browser handle selectRange flushes pending native text repair first', () => {
  const editor = createReactEditor({
    initialValue: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
  });
  const element = document.createElement('div') as PliteBrowserHandleElement;
  const inputController = createInputController();
  const flushPendingNativeTextInput = vi.fn(() => {
    inputController.state.pendingNativeTextInputRepairOffset = null;
    inputController.state.pendingNativeTextInputRepairPathKey = null;
  });

  inputController.state.pendingNativeTextInputRepairOffset = 2;
  inputController.state.pendingNativeTextInputRepairPathKey = '0,0';

  attachPliteBrowserHandle({
    browserHandleNextId: { current: 0 },
    browserHandleRangeAnchors: { current: new Map() },
    editor,
    element,
    flushPendingNativeTextInput,
    forceRender: vi.fn(),
    inputController,
    isPartialDOMBackedSelection: () => false,
    setExplicitPartialDOMBackedSelection: vi.fn(),
  });

  element.__pliteBrowserHandle?.selectRange({
    kind: 'text',
    anchor: { offset: 1, path: [1, 0] },
    focus: { offset: 1, path: [1, 0] },
  });

  expect(flushPendingNativeTextInput).toHaveBeenCalledTimes(1);
  expect(element.__pliteBrowserHandle?.getInputState()).toMatchObject({
    pendingNativeTextInputRepairPathKey: null,
  });
  expect(element.__pliteBrowserHandle?.getSelection()).toEqual({
    anchor: { offset: 1, path: [1, 0] },
    focus: { offset: 1, path: [1, 0] },
    kind: 'text',
  });
});

test('browser handle selectRange clears projected view selection', () => {
  const editor = createReactEditor({
    initialValue: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
  });
  const element = document.createElement('div') as PliteBrowserHandleElement;

  attachPliteBrowserHandle({
    browserHandleNextId: { current: 0 },
    browserHandleRangeAnchors: { current: new Map() },
    editor,
    element,
    forceRender: vi.fn(),
    inputController: createInputController(),
    isPartialDOMBackedSelection: () => false,
    setExplicitPartialDOMBackedSelection: vi.fn(),
  });

  element.__pliteBrowserHandle?.setViewSelection({
    kind: 'text',
    anchor: { point: { offset: 1, path: [0, 0] } },
    focus: { point: { offset: 1, path: [1, 0] } },
    graph: [
      { path: [0], root: 'main' },
      { path: [1], root: 'main' },
    ],
  });

  expect(element.__pliteBrowserHandle?.getViewSelection()).not.toBeNull();

  element.__pliteBrowserHandle?.selectRange({
    kind: 'text',
    anchor: { offset: 1, path: [1, 0] },
    focus: { offset: 1, path: [1, 0] },
  });

  expect(element.__pliteBrowserHandle?.getViewSelection()).toBeNull();
  expect(element.__pliteBrowserHandle?.getSelection()).toEqual({
    anchor: { offset: 1, path: [1, 0] },
    focus: { offset: 1, path: [1, 0] },
    kind: 'text',
  });
});

test('browser handle importDOMSelection clears projected view selection', () => {
  const editor = createReactEditor({
    initialValue: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
  });
  const element = document.createElement('div') as PliteBrowserHandleElement;

  attachPliteBrowserHandle({
    browserHandleNextId: { current: 0 },
    browserHandleRangeAnchors: { current: new Map() },
    editor,
    element,
    forceRender: vi.fn(),
    inputController: createInputController(),
    isPartialDOMBackedSelection: () => false,
    setExplicitPartialDOMBackedSelection: vi.fn(),
  });

  element.__pliteBrowserHandle?.setViewSelection({
    kind: 'text',
    anchor: { point: { offset: 1, path: [0, 0] } },
    focus: { point: { offset: 1, path: [1, 0] } },
    graph: [
      { path: [0], root: 'main' },
      { path: [1], root: 'main' },
    ],
  });

  expect(element.__pliteBrowserHandle?.getViewSelection()).not.toBeNull();

  expect(() => element.__pliteBrowserHandle?.importDOMSelection()).toThrow(
    /Cannot resolve a DOM node/
  );

  expect(element.__pliteBrowserHandle?.getViewSelection()).toBeNull();
});

test('browser handle selectAll marks partial-DOM-backed selections', () => {
  const editor = createReactEditor({
    initialValue: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
  });
  const element = document.createElement('div') as PliteBrowserHandleElement;
  const setExplicitPartialDOMBackedSelection = vi.fn();

  attachPliteBrowserHandle({
    browserHandleNextId: { current: 0 },
    browserHandleRangeAnchors: { current: new Map() },
    editor,
    element,
    forceRender: vi.fn(),
    inputController: createInputController(),
    isPartialDOMBackedSelection: () => true,
    setExplicitPartialDOMBackedSelection,
  });

  element.__pliteBrowserHandle?.selectAll();

  expect(setExplicitPartialDOMBackedSelection).toHaveBeenCalledWith(true);
  expect(element.__pliteBrowserHandle?.getInputState()).toMatchObject({
    modelSelectionPreference: {
      reason: 'partial-dom-backed',
      selectionSource: 'partial-dom-backed',
    },
    selectionSource: 'partial-dom-backed',
  });
  const trace = element.__pliteBrowserHandle?.getKernelTrace().at(-1);

  expect(trace).toMatchObject({
    command: { kind: 'select-all' },
    commandDefinition: { kind: 'select-all', modelOwned: true },
    selectionPolicy: {
      kind: 'partial-dom',
      reason: 'partial-dom-backed',
    },
    selectionSource: 'partial-dom-backed',
  });
  expect(Object.hasOwn(trace ?? {}, 'intents')).toBe(false);
});
