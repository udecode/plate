import { history } from '@platejs/slate-history';

import {
  attachSlateBrowserHandle,
  type SlateBrowserHandleElement,
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
  const element = document.createElement('div') as SlateBrowserHandleElement;
  const forceRender = vi.fn();

  attachSlateBrowserHandle({
    browserHandleNextId: { current: 0 },
    browserHandleRangeRefs: { current: new Map() },
    editor,
    element,
    forceRender,
    inputController: createInputController(),
    isPartialDOMBackedSelection: () => false,
    setExplicitPartialDOMBackedSelection: vi.fn(),
  });

  expect(() => element.__slateBrowserHandle?.undo()).not.toThrow();
  expect(() => element.__slateBrowserHandle?.redo()).not.toThrow();
  expect(forceRender).not.toHaveBeenCalled();
});

test('browser handle selectAll selects the whole editor', () => {
  const editor = createReactEditor({
    initialValue: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
  });
  const element = document.createElement('div') as SlateBrowserHandleElement;

  attachSlateBrowserHandle({
    browserHandleNextId: { current: 0 },
    browserHandleRangeRefs: { current: new Map() },
    editor,
    element,
    forceRender: vi.fn(),
    inputController: createInputController(),
    isPartialDOMBackedSelection: () => false,
    setExplicitPartialDOMBackedSelection: vi.fn(),
  });

  element.__slateBrowserHandle?.selectAll();

  expect(element.__slateBrowserHandle?.getSelection()).toEqual({
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
  const element = document.createElement('div') as SlateBrowserHandleElement;

  attachSlateBrowserHandle({
    browserHandleNextId: { current: 0 },
    browserHandleRangeRefs: { current: new Map() },
    editor,
    element,
    forceRender: vi.fn(),
    inputController: createInputController(),
    isPartialDOMBackedSelection: () => false,
    setExplicitPartialDOMBackedSelection: vi.fn(),
  });

  expect(element.__slateBrowserHandle?.getBlockTexts()).toEqual(['one', 'two']);
  expect(element.__slateBrowserHandle?.getBlockText(1)).toBe('two');
  expect(element.__slateBrowserHandle?.getBlockText(2)).toBeNull();
});

test('browser handle selectRange flushes pending native text repair first', () => {
  const editor = createReactEditor({
    initialValue: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
  });
  const element = document.createElement('div') as SlateBrowserHandleElement;
  const inputController = createInputController();
  const flushPendingNativeTextInput = vi.fn(() => {
    inputController.state.pendingNativeTextInputRepairOffset = null;
    inputController.state.pendingNativeTextInputRepairPathKey = null;
  });

  inputController.state.pendingNativeTextInputRepairOffset = 2;
  inputController.state.pendingNativeTextInputRepairPathKey = '0,0';

  attachSlateBrowserHandle({
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

  element.__slateBrowserHandle?.selectRange({
    anchor: { offset: 1, path: [1, 0] },
    focus: { offset: 1, path: [1, 0] },
  });

  expect(flushPendingNativeTextInput).toHaveBeenCalledTimes(1);
  expect(element.__slateBrowserHandle?.getInputState()).toMatchObject({
    pendingNativeTextInputRepairPathKey: null,
  });
  expect(element.__slateBrowserHandle?.getSelection()).toEqual({
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
  const element = document.createElement('div') as SlateBrowserHandleElement;

  attachSlateBrowserHandle({
    browserHandleNextId: { current: 0 },
    browserHandleRangeRefs: { current: new Map() },
    editor,
    element,
    forceRender: vi.fn(),
    inputController: createInputController(),
    isPartialDOMBackedSelection: () => false,
    setExplicitPartialDOMBackedSelection: vi.fn(),
  });

  element.__slateBrowserHandle?.setViewSelection({
    anchor: { point: { offset: 1, path: [0, 0] } },
    focus: { point: { offset: 1, path: [1, 0] } },
    graph: [
      { path: [0], root: 'main' },
      { path: [1], root: 'main' },
    ],
  });

  expect(element.__slateBrowserHandle?.getViewSelection()).not.toBeNull();

  element.__slateBrowserHandle?.selectRange({
    anchor: { offset: 1, path: [1, 0] },
    focus: { offset: 1, path: [1, 0] },
  });

  expect(element.__slateBrowserHandle?.getViewSelection()).toBeNull();
  expect(element.__slateBrowserHandle?.getSelection()).toEqual({
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
  const element = document.createElement('div') as SlateBrowserHandleElement;

  attachSlateBrowserHandle({
    browserHandleNextId: { current: 0 },
    browserHandleRangeRefs: { current: new Map() },
    editor,
    element,
    forceRender: vi.fn(),
    inputController: createInputController(),
    isPartialDOMBackedSelection: () => false,
    setExplicitPartialDOMBackedSelection: vi.fn(),
  });

  element.__slateBrowserHandle?.setViewSelection({
    anchor: { point: { offset: 1, path: [0, 0] } },
    focus: { point: { offset: 1, path: [1, 0] } },
    graph: [
      { path: [0], root: 'main' },
      { path: [1], root: 'main' },
    ],
  });

  expect(element.__slateBrowserHandle?.getViewSelection()).not.toBeNull();

  expect(() => element.__slateBrowserHandle?.importDOMSelection()).toThrow(
    /Cannot resolve a DOM node/
  );

  expect(element.__slateBrowserHandle?.getViewSelection()).toBeNull();
});

test('browser handle selectAll marks partial-DOM-backed selections', () => {
  const editor = createReactEditor({
    initialValue: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
  });
  const element = document.createElement('div') as SlateBrowserHandleElement;
  const setExplicitPartialDOMBackedSelection = vi.fn();

  attachSlateBrowserHandle({
    browserHandleNextId: { current: 0 },
    browserHandleRangeRefs: { current: new Map() },
    editor,
    element,
    forceRender: vi.fn(),
    inputController: createInputController(),
    isPartialDOMBackedSelection: () => true,
    setExplicitPartialDOMBackedSelection,
  });

  element.__slateBrowserHandle?.selectAll();

  expect(setExplicitPartialDOMBackedSelection).toHaveBeenCalledWith(true);
  expect(element.__slateBrowserHandle?.getInputState()).toMatchObject({
    modelSelectionPreference: {
      reason: 'partial-dom-backed',
      selectionSource: 'partial-dom-backed',
    },
    selectionSource: 'partial-dom-backed',
  });
});
