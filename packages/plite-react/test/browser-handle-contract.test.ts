import { history } from '@platejs/plite-history';

import {
  attachPliteBrowserHandle,
  type PliteBrowserHandleElement,
} from '../src/editable/browser-handle';
import {
  createEditableInputController,
  createEditableInputControllerState,
} from '../src/editable/input-controller';
import { createReactEditor } from '../src/plugin/with-react';

const createInputController = () =>
  createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });

test('browser handle undo and redo no-op when history is disabled', () => {
  const editor = createReactEditor({
    extensions: [history({ enabled: false })],
  });
  const element = document.createElement('div') as PliteBrowserHandleElement;
  const forceRender = vi.fn();

  attachPliteBrowserHandle({
    browserHandleNextId: { current: 0 },
    browserHandleRangeRefs: { current: new Map() },
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
    browserHandleRangeRefs: { current: new Map() },
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
    browserHandleRangeRefs: { current: new Map() },
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
    browserHandleRangeRefs: { current: new Map() },
    editor,
    element,
    flushPendingNativeTextInput,
    forceRender: vi.fn(),
    inputController,
    isPartialDOMBackedSelection: () => false,
    setExplicitPartialDOMBackedSelection: vi.fn(),
  });

  element.__pliteBrowserHandle?.selectRange({
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
    browserHandleRangeRefs: { current: new Map() },
    editor,
    element,
    forceRender: vi.fn(),
    inputController: createInputController(),
    isPartialDOMBackedSelection: () => false,
    setExplicitPartialDOMBackedSelection: vi.fn(),
  });

  element.__pliteBrowserHandle?.setViewSelection({
    anchor: { point: { offset: 1, path: [0, 0] } },
    focus: { point: { offset: 1, path: [1, 0] } },
    graph: [
      { path: [0], root: 'main' },
      { path: [1], root: 'main' },
    ],
  });

  expect(element.__pliteBrowserHandle?.getViewSelection()).not.toBeNull();

  element.__pliteBrowserHandle?.selectRange({
    anchor: { offset: 1, path: [1, 0] },
    focus: { offset: 1, path: [1, 0] },
  });

  expect(element.__pliteBrowserHandle?.getViewSelection()).toBeNull();
  expect(element.__pliteBrowserHandle?.getSelection()).toEqual({
    anchor: { offset: 1, path: [1, 0] },
    focus: { offset: 1, path: [1, 0] },
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
    browserHandleRangeRefs: { current: new Map() },
    editor,
    element,
    forceRender: vi.fn(),
    inputController: createInputController(),
    isPartialDOMBackedSelection: () => false,
    setExplicitPartialDOMBackedSelection: vi.fn(),
  });

  element.__pliteBrowserHandle?.setViewSelection({
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
    browserHandleRangeRefs: { current: new Map() },
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
});
