import { readFileSync } from 'node:fs';

import {
  createDOMPhaseScheduler,
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from '@platejs/plite-dom/internal';
import {
  getSelection as editorGetSelection,
  insertText as editorInsertText,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';
import { render, renderHook } from '@testing-library/react';
import {
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
} from 'react';

import { createDOMRepairQueue } from '../src/editable/dom-repair-queue';
import { EditableDOMRuntime } from '../src/editable/editable-dom-runtime';
import {
  createEditableInputController,
  createEditableInputControllerState,
} from '../src/editable/input-controller';
import {
  getDOMInputRepairTarget,
  repairPendingNativeTextInputModelSelection,
  useEditableDOMInputHandler as useRuntimeOwnedDOMInputHandler,
  useEditableRootRef,
} from '../src/editable/input-router';
import { beginEditableCompositionSession } from '../src/editable/input-state';
import { applyEditableInput } from '../src/editable/model-input-strategy';
import { useRuntimeClipboardEvents } from '../src/editable/runtime-clipboard-events';
import { useRuntimeFocusMouseEvents } from '../src/editable/runtime-focus-mouse-events';
import { useRuntimeInputEvents } from '../src/editable/runtime-input-events';
import {
  shouldApplyKeyDownSelectionPolicy,
  shouldFlushPendingNativeTextInputBeforeKeyDown,
  shouldFlushPendingNativeTextInputForKeyDown,
} from '../src/editable/runtime-keyboard-events';
import { useEditableRootRuntimeState } from '../src/editable/runtime-root-state';
import { createReactEditor } from '../src/plugin/with-react';

const DEFERRED_NATIVE_TEXT_INPUT_REPAIR_IDLE_MS = 1;

const useEditableDOMInputHandler = (
  options: Omit<
    Parameters<typeof useRuntimeOwnedDOMInputHandler>[0],
    'domPhaseScheduler'
  >
) => {
  const domPhaseScheduler = useMemo(() => createDOMPhaseScheduler(), []);

  useEffect(
    () => () => {
      domPhaseScheduler.destroy();
    },
    [domPhaseScheduler]
  );

  return useRuntimeOwnedDOMInputHandler({ ...options, domPhaseScheduler });
};

const useTestRuntimeFocusMouseEvents = (
  options: Omit<
    Parameters<typeof useRuntimeFocusMouseEvents>[0],
    'clearVerticalGoal' | 'domPhaseScheduler' | 'publishFocusState'
  >
) => {
  const domPhaseScheduler = useMemo(() => createDOMPhaseScheduler(), []);

  useEffect(
    () => () => {
      domPhaseScheduler.destroy();
    },
    [domPhaseScheduler]
  );

  return useRuntimeFocusMouseEvents({
    ...options,
    clearVerticalGoal: () => {},
    domPhaseScheduler,
    publishFocusState: () => {},
  });
};

test('DOM input trace keeps an outer event handler duration bucket', () => {
  const source = readFileSync('src/editable/input-router.ts', 'utf-8');

  expect(source).toContain("profileDOMInputDuration('dom-input-total'");
});

const RootRefProbe = ({
  onDOMBeforeInput,
}: {
  onDOMBeforeInput: (event: InputEvent) => void;
}) => {
  const editor = useMemo(() => createReactEditor(), []);
  const { runtime } = useEditableRootRuntimeState({
    domStrategyRuntime: null,
    editor,
    readOnly: false,
  });
  const lifecycle = useMemo(() => ({ cancel: () => {} }), []);
  const ref = useEditableRootRef({
    onDOMBeforeInput,
    onDOMInput: () => {},
    onDOMSelectionChange: lifecycle,
    runtime,
    scheduleOnDOMSelectionChange: lifecycle,
  });

  return <div data-testid="root" ref={ref} />;
};

test('native input listeners attach once while reading the latest beforeinput handler', () => {
  const firstHandler = jest.fn();
  const secondHandler = jest.fn();
  const addEventListener = jest.spyOn(
    HTMLElement.prototype,
    'addEventListener'
  );
  const removeEventListener = jest.spyOn(
    HTMLElement.prototype,
    'removeEventListener'
  );

  try {
    const rendered = render(<RootRefProbe onDOMBeforeInput={firstHandler} />);
    rendered.rerender(<RootRefProbe onDOMBeforeInput={secondHandler} />);

    rendered.getByTestId('root').dispatchEvent(
      new Event('beforeinput', {
        bubbles: true,
        cancelable: true,
      })
    );

    expect(
      addEventListener.mock.calls.filter(([type]) => type === 'beforeinput')
    ).toHaveLength(1);
    expect(
      removeEventListener.mock.calls.filter(([type]) => type === 'beforeinput')
    ).toHaveLength(0);
    expect(firstHandler).not.toHaveBeenCalled();
    expect(secondHandler).toHaveBeenCalledTimes(1);
  } finally {
    addEventListener.mockRestore();
    removeEventListener.mockRestore();
  }
});

test('read-only native input repairs leaked DOM mutations', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  root.innerHTML =
    '<span data-plite-node="text" data-plite-path="0,0"><span data-plite-string="true">axbc</span></span>';
  const repairDOMInput = vi.fn();
  const onReadOnlyDOMInput = vi.fn();
  const event = new Event('input', {
    bubbles: true,
    cancelable: true,
  }) as InputEvent;

  Object.defineProperties(event, {
    data: { value: 'x' },
    inputType: { value: 'insertText' },
  });
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abc' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  const stopImmediatePropagation = vi.spyOn(event, 'stopImmediatePropagation');

  const { result } = renderHook(() =>
    useEditableDOMInputHandler({
      editor,
      onReadOnlyDOMInput,
      readOnly: true,
      repairDOMInput,
      rootRef: { current: root },
    })
  );

  result.current.onDOMInput(event);

  expect(event.defaultPrevented).toBe(true);
  expect(stopImmediatePropagation).toHaveBeenCalled();
  expect(repairDOMInput).not.toHaveBeenCalled();
  expect(root.textContent).toBe('abc');
  expect(onReadOnlyDOMInput).toHaveBeenCalledTimes(1);
});

test('read-only native input repairs split decorated text strings', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  root.innerHTML =
    '<span data-plite-node="text" data-plite-path="0,0"><span data-plite-string="true">axb</span><span data-plite-string="true">c</span></span>';
  const repairDOMInput = vi.fn();
  const event = new Event('input', {
    bubbles: true,
    cancelable: true,
  }) as InputEvent;

  Object.defineProperties(event, {
    data: { value: 'x' },
    inputType: { value: 'insertText' },
  });
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abc' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  const { result } = renderHook(() =>
    useEditableDOMInputHandler({
      editor,
      readOnly: true,
      repairDOMInput,
      rootRef: { current: root },
    })
  );

  result.current.onDOMInput(event);

  const strings = root.querySelectorAll('[data-plite-string="true"]');
  expect(repairDOMInput).not.toHaveBeenCalled();
  expect(strings[0]).toHaveTextContent('ab');
  expect(strings[1]).toHaveTextContent('c');
  expect(root.textContent).toBe('abc');
});

const createNativeInsertTextEvent = (data: string) => {
  const event = new Event('input', {
    bubbles: true,
    cancelable: true,
  }) as InputEvent;

  Object.defineProperties(event, {
    data: { value: data },
    inputType: { value: 'insertText' },
  });

  return event;
};

const appendTextHost = (root: HTMLElement, path: string) => {
  const textHost = document.createElement('span');
  const string = document.createElement('span');
  const text = document.createTextNode('');

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', path);
  string.setAttribute('data-plite-string', 'true');
  string.append(text);
  textHost.append(string);
  root.append(textHost);

  return text;
};

const selectTextOffset = (text: Text, offset: number) => {
  const range = document.createRange();
  const selection = document.getSelection();

  range.setStart(text, offset);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);
};

test('deferred native text input repair ignores echoes while model owns text input', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  const text = appendTextHost(root, '0,0');

  inputController.state.selectionSource = 'model-owned';
  inputController.state.modelSelectionPreference = {
    preferModelSelection: true,
    reason: 'repair-induced',
    selectionSource: 'model-owned',
  };
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'aThis' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        inputController,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    text.nodeValue = 'XaThis';
    selectTextOffset(text, 0);
    result.current.onDOMInput(createNativeInsertTextEvent('X'));

    expect(repairDOMInput).not.toHaveBeenCalled();
    expect(root.textContent).toBe('aThis');
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    expect(inputController.state.pendingNativeTextInputRepairOffset).toBeNull();
    expect(
      inputController.state.pendingNativeTextInputRepairPathKey
    ).toBeNull();
  } finally {
    root.remove();
  }
});

test('native text input repair uses runtime target while model owns text input without defer', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  const text = appendTextHost(root, '0,0');

  inputController.state.activeIntent = 'text-insert';
  inputController.state.selectionSource = 'model-owned';
  inputController.state.modelOwnedTextInputGuard = 0;
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'aThis' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        editor,
        inputController,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    text.nodeValue = 'XaThis';
    selectTextOffset(text, 0);
    result.current.onDOMInput(createNativeInsertTextEvent('X'));

    expect(repairDOMInput).toHaveBeenCalledWith(
      {
        data: 'X',
        inputType: 'insertText',
        target: {
          insert: { offset: 1, text: 'X' },
          path: [0, 0],
          preferCapturedInsert: true,
          selectionOffset: 2,
          text: 'aXThis',
        },
      },
      root
    );
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
  } finally {
    root.remove();
  }
});

test('native text input repair keeps a model-exported DOM-current caret', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  const text = appendTextHost(root, '0,0');

  inputController.state.modelSelectionPreference = {
    preferModelSelection: false,
    reason: 'native-selection',
    selectionSource: 'dom-current',
  };
  inputController.state.selectionChangeOrigin = 'programmatic-export';
  inputController.state.selectionSource = 'dom-current';
  text.nodeValue = 'aDThis';
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'aThis' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        editor,
        inputController,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    selectTextOffset(text, 3);
    result.current.onDOMInput(createNativeInsertTextEvent('D'));

    expect(repairDOMInput).toHaveBeenCalledWith(
      {
        data: 'D',
        inputType: 'insertText',
        target: {
          insert: { offset: 1, text: 'D' },
          path: [0, 0],
          preferCapturedInsert: true,
          selectionOffset: 2,
          text: 'aDThis',
        },
      },
      root
    );
  } finally {
    root.remove();
  }
});

test('immediate native text input repair ignores a model-owned beforeinput echo', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  const text = appendTextHost(root, '0,0');

  inputController.state.selectionSource = 'model-owned';
  inputController.state.modelOwnedTextInputGuard = 1;
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'aThis' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        editor,
        inputController,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    text.nodeValue = 'aaThis';
    selectTextOffset(text, 2);
    result.current.onDOMInput(createNativeInsertTextEvent('a'));

    expect(repairDOMInput).not.toHaveBeenCalled();
    expect(root.textContent).toBe('aThis');
    expect(inputController.state.pendingRootDOMInput).toMatchObject({
      data: 'a',
      handled: true,
      inputType: 'insertText',
    });
  } finally {
    root.remove();
  }
});

const mountEditableRoot = (editor: ReturnType<typeof createReactEditor>) => {
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

const unmountEditableRoot = (
  editor: ReturnType<typeof createReactEditor>,
  root: HTMLElement
) => {
  EDITOR_TO_ELEMENT.delete(editor);
  EDITOR_TO_WINDOW.delete(editor);
  ELEMENT_TO_NODE.delete(root);
  NODE_TO_ELEMENT.delete(editor);
  root.remove();
};

class FakeClipboardData {
  files = [];

  private readonly data = new Map<string, string>();

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

const createRuntimeClipboardEvent = (
  target: EventTarget,
  clipboardData: FakeClipboardData
) =>
  ({
    clipboardData,
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    nativeEvent: { clipboardData },
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target,
  }) as unknown as ClipboardEvent<HTMLDivElement>;

const flushAnimationFrame = (
  readFrame: () => FrameRequestCallback | null,
  timestamp: number
) => {
  const frame = readFrame();

  frame?.(timestamp);
};

test('deferred native text input repair coalesces burst input for the same text target after frame idle', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  let nowMs = 0;
  let pendingFrame: FrameRequestCallback | null = null;
  let pendingTimeout: TimerHandler | null = null;
  const performanceNowSpy = vi
    .spyOn(performance, 'now')
    .mockImplementation(() => nowMs);
  const requestAnimationFrameSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      pendingFrame = callback;

      return 1;
    });
  const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');
  const setTimeoutSpy = vi
    .spyOn(window, 'setTimeout')
    .mockImplementation((callback) => {
      pendingTimeout = callback;

      return 1;
    });
  const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
  const text = appendTextHost(root, '0,0');

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
    selection: null,
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    text.nodeValue = 'x';
    selectTextOffset(text, 1);
    result.current.onDOMInput(createNativeInsertTextEvent('x'));

    nowMs = 1;
    text.nodeValue = 'xy';
    selectTextOffset(text, 2);
    result.current.onDOMInput(createNativeInsertTextEvent('y'));

    expect(cancelAnimationFrameSpy).not.toHaveBeenCalled();
    expect(setTimeoutSpy).toHaveBeenCalledWith(
      expect.any(Function),
      DEFERRED_NATIVE_TEXT_INPUT_REPAIR_IDLE_MS
    );
    expect(pendingTimeout).toBeTypeOf('function');
    expect(repairDOMInput).not.toHaveBeenCalled();

    flushAnimationFrame(() => pendingFrame, 12);

    expect(repairDOMInput).toHaveBeenCalledWith(
      {
        data: 'y',
        inputType: 'insertText',
        target: {
          insert: { offset: 0, text: 'xy' },
          path: [0, 0],
          preferCapturedInsert: true,
          selectionOffset: 2,
          text: 'xy',
        },
      },
      root
    );
    expect(repairDOMInput).toHaveBeenCalledTimes(1);
    expect(clearTimeoutSpy).toHaveBeenCalledWith(1);
  } finally {
    performanceNowSpy.mockRestore();
    requestAnimationFrameSpy.mockRestore();
    cancelAnimationFrameSpy.mockRestore();
    setTimeoutSpy.mockRestore();
    clearTimeoutSpy.mockRestore();
    root.remove();
  }
});

test('pending native text input repair corrects model selection before boundary input', () => {
  const editor = createReactEditor();
  const inputController = {
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  };

  inputController.state.pendingNativeTextInputRepairOffset = 4;
  inputController.state.pendingNativeTextInputRepairPathKey = '0,0';

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'Cabcondico' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
  });

  expect(
    repairPendingNativeTextInputModelSelection({ editor, inputController })
  ).toBe(true);
  expect(editor.read((state) => state.selection())).toEqual({
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 4 },
  });
  expect(inputController.state.modelOwnedTextInputGuard).toBeGreaterThan(0);
});

test('pending native text input repair does not move selection when expected text is stale', () => {
  const editor = createReactEditor();
  const inputController = {
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  };

  inputController.state.pendingNativeTextInputRepairOffset = 4;
  inputController.state.pendingNativeTextInputRepairPathKey = '0,0';

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'Cabcondico' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
  });

  expect(
    repairPendingNativeTextInputModelSelection({
      editor,
      expectedTarget: {
        path: [0, 0],
        selectionOffset: 4,
        text: 'Cabbcondico',
      },
      inputController,
    })
  ).toBe(false);
  expect(editor.read((state) => state.selection())).toEqual({
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 3 },
  });
});

test('deferred native text input repair clears pending selection when root disconnects before flush', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  let pendingFrame: FrameRequestCallback | null = null;
  const requestAnimationFrameSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      pendingFrame = callback;

      return 1;
    });
  const setTimeoutSpy = vi
    .spyOn(window, 'setTimeout')
    .mockImplementation(() => 1);
  const text = appendTextHost(root, '0,0', 'abc');

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abc' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        inputController,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    expect(
      result.current.queuePendingNativeTextInput({
        data: 'X',
        inputType: 'insertText',
        rootElement: root,
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
      })
    ).toBe(true);
    expect(inputController.state.pendingNativeTextInputRepairOffset).toBe(2);

    text.nodeValue = 'aXbc';
    root.remove();
    flushAnimationFrame(() => pendingFrame, performance.now() + 48);

    expect(repairDOMInput).not.toHaveBeenCalled();
    expect(inputController.state.pendingNativeTextInputRepairOffset).toBeNull();
    expect(
      inputController.state.pendingNativeTextInputRepairPathKey
    ).toBeNull();
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
  } finally {
    requestAnimationFrameSpy.mockRestore();
    setTimeoutSpy.mockRestore();
    root.remove();
  }
});

test('deferred native text input repair clears pending state when selection repair is rejected', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const repairDOMInput = vi.fn(({ target }) => {
    if (target?.insert) {
      editor.update((tx) => {
        tx.text.insert(target.insert.text, {
          at: { offset: target.insert.offset, path: target.path },
        });
      });
    }
  });
  let pendingFrame: FrameRequestCallback | null = null;
  const requestAnimationFrameSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      pendingFrame = callback;

      return 1;
    });
  const setTimeoutSpy = vi
    .spyOn(window, 'setTimeout')
    .mockImplementation(() => 1);
  const text = appendTextHost(root, '0,0', 'abc');

  editorReplace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'abc' }] },
      { type: 'paragraph', children: [{ text: 'outside' }] },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        inputController,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    expect(
      result.current.queuePendingNativeTextInput({
        data: 'X',
        inputType: 'insertText',
        rootElement: root,
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
      })
    ).toBe(true);

    editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
    });
    text.nodeValue = 'aXbc';
    flushAnimationFrame(() => pendingFrame, performance.now() + 48);

    expect(repairDOMInput).toHaveBeenCalledTimes(1);
    expect(editor.read((state) => state.text.string([0]))).toBe('aXbc');
    expect(inputController.state.pendingNativeTextInputRepairOffset).toBeNull();
    expect(
      inputController.state.pendingNativeTextInputRepairPathKey
    ).toBeNull();
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
  } finally {
    requestAnimationFrameSpy.mockRestore();
    setTimeoutSpy.mockRestore();
    root.remove();
  }
});

test('deferred native text input repair coalesces stale in-range DOM input selections', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  let pendingFrame: FrameRequestCallback | null = null;
  let pendingTimeout: TimerHandler | null = null;
  const requestAnimationFrameSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      pendingFrame = callback;

      return 1;
    });
  const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');
  const setTimeoutSpy = vi
    .spyOn(window, 'setTimeout')
    .mockImplementation((callback) => {
      pendingTimeout = callback;

      return 1;
    });
  const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
  const text = appendTextHost(root, '0,0');

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
    selection: null,
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    text.nodeValue = 'x';
    selectTextOffset(text, 1);
    result.current.onDOMInput(createNativeInsertTextEvent('x'));

    text.nodeValue = 'xy';
    selectTextOffset(text, 2);
    result.current.onDOMInput(createNativeInsertTextEvent('y'));

    text.nodeValue = 'xyz';
    selectTextOffset(text, 1);
    result.current.onDOMInput(createNativeInsertTextEvent('z'));

    expect(cancelAnimationFrameSpy).not.toHaveBeenCalled();
    expect(setTimeoutSpy).toHaveBeenCalledWith(
      expect.any(Function),
      DEFERRED_NATIVE_TEXT_INPUT_REPAIR_IDLE_MS
    );
    expect(pendingTimeout).toBeTypeOf('function');
    expect(repairDOMInput).not.toHaveBeenCalled();

    flushAnimationFrame(() => pendingFrame, performance.now() + 48);

    expect(repairDOMInput).toHaveBeenCalledWith(
      {
        data: 'z',
        inputType: 'insertText',
        target: {
          insert: { offset: 0, text: 'xyz' },
          path: [0, 0],
          preferCapturedInsert: true,
          selectionOffset: 3,
          text: 'xyz',
        },
      },
      root
    );
    expect(repairDOMInput).toHaveBeenCalledTimes(1);
    expect(clearTimeoutSpy).toHaveBeenCalledWith(1);
  } finally {
    requestAnimationFrameSpy.mockRestore();
    cancelAnimationFrameSpy.mockRestore();
    setTimeoutSpy.mockRestore();
    clearTimeoutSpy.mockRestore();
    root.remove();
  }
});

test('deferred native text input repair prefers the repaired runtime caret when native selection lags', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  let pendingFrame: FrameRequestCallback | null = null;
  const requestAnimationFrameSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      pendingFrame = callback;

      return 1;
    });
  const setTimeoutSpy = vi
    .spyOn(window, 'setTimeout')
    .mockImplementation(() => 1);
  const text = appendTextHost(root, '0,0');

  text.nodeValue = 'fAThis';
  inputController.state.recentTextInputRepairEcho = {
    expiresAt: performance.now() + 1000,
    pathKey: '0,0',
    selectionOffset: 1,
    text: 'AThis',
  };
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'AThis' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        inputController,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    selectTextOffset(text, 1);
    result.current.onDOMInput(createNativeInsertTextEvent('f'));
    flushAnimationFrame(() => pendingFrame, performance.now() + 48);

    expect(repairDOMInput).toHaveBeenCalledWith(
      {
        data: 'f',
        inputType: 'insertText',
        target: {
          insert: { offset: 1, text: 'f' },
          path: [0, 0],
          preferCapturedInsert: true,
          selectionOffset: 2,
          text: 'AfThis',
        },
      },
      root
    );
  } finally {
    requestAnimationFrameSpy.mockRestore();
    setTimeoutSpy.mockRestore();
    root.remove();
  }
});

test('deferred native text input repair keeps a same-node native user caret over a live repair echo', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  let pendingFrame: FrameRequestCallback | null = null;
  const requestAnimationFrameSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      pendingFrame = callback;

      return 1;
    });
  const setTimeoutSpy = vi
    .spyOn(window, 'setTimeout')
    .mockImplementation(() => 1);
  const text = appendTextHost(root, '0,0');

  text.nodeValue = 'Bxeta!';
  inputController.state.recentTextInputRepairEcho = {
    expiresAt: performance.now() + 1000,
    pathKey: '0,0',
    selectionOffset: 5,
    text: 'Beta!',
  };
  inputController.state.selectionSource = 'dom-current';
  inputController.state.selectionChangeOrigin = 'native-user';
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'Beta!' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    },
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        inputController,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    selectTextOffset(text, 2);
    result.current.onDOMInput(createNativeInsertTextEvent('x'));
    flushAnimationFrame(() => pendingFrame, performance.now() + 48);

    expect(repairDOMInput).toHaveBeenCalledWith(
      {
        data: 'x',
        inputType: 'insertText',
        target: {
          insert: { offset: 1, text: 'x' },
          path: [0, 0],
          selectionOffset: 2,
          text: 'Bxeta!',
        },
      },
      root
    );
  } finally {
    requestAnimationFrameSpy.mockRestore();
    setTimeoutSpy.mockRestore();
    root.remove();
  }
});

test('deferred native text input repair keeps a beforeinput-only burst character', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  let nowMs = 0;
  let pendingFrame: FrameRequestCallback | null = null;
  const performanceNowSpy = vi
    .spyOn(performance, 'now')
    .mockImplementation(() => nowMs);
  const requestAnimationFrameSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      pendingFrame = callback;

      return 1;
    });
  const setTimeoutSpy = vi
    .spyOn(window, 'setTimeout')
    .mockImplementation(() => 1);
  const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
  const text = appendTextHost(root, '0,0');
  const baseText = 'Condico uredo ante arca umbra.';

  text.nodeValue = baseText;
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: baseText }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        inputController,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    for (let index = 1; index <= 10; index++) {
      nowMs = index;
      result.current.queuePendingNativeTextInput({
        data: 'X',
        inputType: 'insertText',
        rootElement: root,
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
      });

      if (index < 10) {
        text.nodeValue = `C${'X'.repeat(index)}${baseText.slice(1)}`;
        selectTextOffset(text, 1 + index);
        result.current.onDOMInput(createNativeInsertTextEvent('X'));
      }
    }

    flushAnimationFrame(() => pendingFrame, 48);

    expect(repairDOMInput).toHaveBeenCalledWith(
      {
        data: 'X',
        inputType: 'insertText',
        target: {
          insert: { offset: 1, text: 'XXXXXXXXXX' },
          path: [0, 0],
          preferCapturedInsert: true,
          selectionOffset: 11,
          text: `C${'X'.repeat(10)}${baseText.slice(1)}`,
        },
      },
      root
    );
    expect(repairDOMInput).toHaveBeenCalledTimes(1);
    expect(inputController.state.pendingNativeTextInputRepairOffset).toBeNull();
    expect(
      inputController.state.pendingNativeTextInputRepairPathKey
    ).toBeNull();
  } finally {
    performanceNowSpy.mockRestore();
    requestAnimationFrameSpy.mockRestore();
    setTimeoutSpy.mockRestore();
    clearTimeoutSpy.mockRestore();
    root.remove();
  }
});

test('deferred native text input treats a queued beforeinput echo as confirmation', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  const text = appendTextHost(root, '0,0');
  const baseText = 'Condico uredo ante arca umbra.';

  text.nodeValue = baseText;
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: baseText }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        inputController,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    result.current.queuePendingNativeTextInput({
      data: 'X',
      inputType: 'insertText',
      rootElement: root,
      selection: editor.read((state) => state.selection()),
    });
    result.current.queuePendingNativeTextInput({
      data: 'X',
      inputType: 'insertText',
      rootElement: root,
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      },
    });

    editor.update((tx) => {
      tx.selection.set({
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });
    });
    text.nodeValue = `CXX${baseText.slice(1)}`;
    selectTextOffset(text, 3);
    result.current.onDOMInput(createNativeInsertTextEvent('X'));
    result.current.flushPendingNativeTextInput();

    expect(repairDOMInput).toHaveBeenCalledTimes(1);
    expect(repairDOMInput).toHaveBeenCalledWith(
      {
        data: 'X',
        inputType: 'insertText',
        target: {
          insert: { offset: 1, text: 'XX' },
          path: [0, 0],
          preferCapturedInsert: true,
          selectionOffset: 3,
          text: `CXX${baseText.slice(1)}`,
        },
      },
      root
    );
  } finally {
    root.remove();
  }
});

test('deferred native text input repair coalesces stale in-range burst selections', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  let pendingFrame: FrameRequestCallback | null = null;
  const requestAnimationFrameSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      pendingFrame = callback;

      return 1;
    });
  const setTimeoutSpy = vi
    .spyOn(window, 'setTimeout')
    .mockImplementation(() => 1);
  const text = appendTextHost(root, '0,0');
  const baseText = 'Condico uredo ante arca umbra.';

  text.nodeValue = baseText;
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: baseText }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        inputController,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    [1, 2, 3, 3].forEach((offset) => {
      result.current.queuePendingNativeTextInput({
        data: 'X',
        inputType: 'insertText',
        rootElement: root,
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset },
          focus: { path: [0, 0], offset },
        },
      });
    });

    expect(inputController.state.pendingNativeTextInputRepairOffset).toBe(5);
    expect(inputController.state.pendingNativeTextInputRepairPathKey).toBe(
      '0,0'
    );

    flushAnimationFrame(() => pendingFrame, performance.now() + 48);

    expect(repairDOMInput).toHaveBeenCalledWith(
      {
        data: 'X',
        inputType: 'insertText',
        target: {
          insert: { offset: 1, text: 'XXXX' },
          path: [0, 0],
          preferCapturedInsert: true,
          selectionOffset: 5,
          text: `CXXXX${baseText.slice(1)}`,
        },
      },
      root
    );
    expect(repairDOMInput).toHaveBeenCalledTimes(1);
    expect(inputController.state.pendingNativeTextInputRepairOffset).toBeNull();
    expect(
      inputController.state.pendingNativeTextInputRepairPathKey
    ).toBeNull();
  } finally {
    requestAnimationFrameSpy.mockRestore();
    setTimeoutSpy.mockRestore();
    root.remove();
  }
});

test('deferred native text input repair splits deeply stale DOM input selections', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  let pendingFrame: FrameRequestCallback | null = null;
  const requestAnimationFrameSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      pendingFrame = callback;

      return 1;
    });
  const setTimeoutSpy = vi
    .spyOn(window, 'setTimeout')
    .mockImplementation(() => 1);
  const text = appendTextHost(root, '0,0');

  text.nodeValue = 'after';
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'after' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    },
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        inputController,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    expect(
      result.current.queuePendingNativeTextInput({
        data: ' ',
        inputType: 'insertText',
        rootElement: root,
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 5 },
          focus: { path: [0, 0], offset: 5 },
        },
      })
    ).toBe(true);
    expect(
      result.current.queuePendingNativeTextInput({
        data: 'v',
        inputType: 'insertText',
        rootElement: root,
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 6 },
          focus: { path: [0, 0], offset: 6 },
        },
      })
    ).toBe(true);
    expect(inputController.state.pendingNativeTextInputRepairOffset).toBe(7);

    text.nodeValue = 'after vi';
    selectTextOffset(text, 5);
    result.current.onDOMInput(createNativeInsertTextEvent('i'));

    flushAnimationFrame(() => pendingFrame, performance.now() + 48);

    expect(repairDOMInput).toHaveBeenNthCalledWith(
      1,
      {
        data: 'v',
        inputType: 'insertText',
        target: {
          insert: { offset: 5, text: ' v' },
          path: [0, 0],
          preferCapturedInsert: true,
          selectionOffset: 7,
          text: 'after v',
        },
      },
      root
    );
    expect(repairDOMInput).toHaveBeenCalledTimes(2);
    expect(repairDOMInput.mock.calls[1]![0].target?.insert?.text).not.toBe(
      ' vi'
    );
    expect(inputController.state.pendingNativeTextInputRepairOffset).toBeNull();
    expect(
      inputController.state.pendingNativeTextInputRepairPathKey
    ).toBeNull();
  } finally {
    requestAnimationFrameSpy.mockRestore();
    setTimeoutSpy.mockRestore();
    root.remove();
  }
});

test('deferred native text input repair retargets from repaired runtime caret after flushing a stale burst', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const repairDOMInput = vi.fn(({ target }) => {
    if (target?.insert) {
      editor.update((tx) => {
        tx.text.insert(target.insert.text, {
          at: { offset: target.insert.offset, path: target.path },
        });
      });
    }
  });
  let pendingFrame: FrameRequestCallback | null = null;
  const requestAnimationFrameSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      pendingFrame = callback;

      return 1;
    });
  const setTimeoutSpy = vi
    .spyOn(window, 'setTimeout')
    .mockImplementation(() => 1);
  const text = appendTextHost(root, '0,0');

  text.nodeValue = 'abc';
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abc' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        inputController,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    expect(
      result.current.queuePendingNativeTextInput({
        data: 'X',
        inputType: 'insertText',
        rootElement: root,
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
      })
    ).toBe(true);
    expect(inputController.state.pendingNativeTextInputRepairOffset).toBe(2);

    text.nodeValue = 'aYXbc';
    selectTextOffset(text, 2);
    result.current.onDOMInput(createNativeInsertTextEvent('Y'));
    flushAnimationFrame(() => pendingFrame, performance.now() + 48);

    expect(repairDOMInput).toHaveBeenNthCalledWith(
      1,
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
      root
    );
    expect(repairDOMInput).toHaveBeenNthCalledWith(
      2,
      {
        data: 'Y',
        inputType: 'insertText',
        target: {
          insert: { offset: 2, text: 'Y' },
          path: [0, 0],
          preferCapturedInsert: true,
          selectionOffset: 3,
          text: 'aXYbc',
        },
      },
      root
    );
    expect(repairDOMInput).toHaveBeenCalledTimes(2);
  } finally {
    requestAnimationFrameSpy.mockRestore();
    setTimeoutSpy.mockRestore();
    root.remove();
  }
});

test('deferred native text input repair splits same-path bursts after an explicit caret move', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  let nowMs = 0;
  let pendingFrame: FrameRequestCallback | null = null;
  const performanceNowSpy = vi
    .spyOn(performance, 'now')
    .mockImplementation(() => nowMs);
  const requestAnimationFrameSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      pendingFrame = callback;

      return 1;
    });
  const setTimeoutSpy = vi
    .spyOn(window, 'setTimeout')
    .mockImplementation(() => 1);
  const text = appendTextHost(root, '0,0');

  text.nodeValue = 'abc';
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abc' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        inputController,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    result.current.queuePendingNativeTextInput({
      data: 'X',
      inputType: 'insertText',
      rootElement: root,
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      },
    });
    expect(inputController.state.pendingNativeTextInputRepairOffset).toBe(4);
    text.nodeValue = 'abcX';
    selectTextOffset(text, 4);
    result.current.onDOMInput(createNativeInsertTextEvent('X'));

    nowMs = 1;
    result.current.queuePendingNativeTextInput({
      data: 'Y',
      inputType: 'insertText',
      rootElement: root,
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      },
    });
    expect(inputController.state.pendingNativeTextInputRepairOffset).toBe(2);
    text.nodeValue = 'aYbcX';
    selectTextOffset(text, 2);
    result.current.onDOMInput(createNativeInsertTextEvent('Y'));

    flushAnimationFrame(() => pendingFrame, 48);

    expect(repairDOMInput).toHaveBeenNthCalledWith(
      1,
      {
        data: 'X',
        inputType: 'insertText',
        target: {
          insert: { offset: 3, text: 'X' },
          path: [0, 0],
          selectionOffset: 4,
          text: 'abcX',
        },
      },
      root
    );
    expect(repairDOMInput).toHaveBeenNthCalledWith(
      2,
      {
        data: 'Y',
        inputType: 'insertText',
        target: {
          insert: { offset: 1, text: 'Y' },
          path: [0, 0],
          selectionOffset: 2,
          text: 'aYbcX',
        },
      },
      root
    );
    expect(repairDOMInput).toHaveBeenCalledTimes(2);
    expect(inputController.state.pendingNativeTextInputRepairOffset).toBeNull();
    expect(
      inputController.state.pendingNativeTextInputRepairPathKey
    ).toBeNull();
  } finally {
    performanceNowSpy.mockRestore();
    requestAnimationFrameSpy.mockRestore();
    setTimeoutSpy.mockRestore();
    root.remove();
  }
});

test('deferred native text input repair coalesces projected boundary bursts', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  let pendingFrame: FrameRequestCallback | null = null;
  const requestAnimationFrameSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      pendingFrame = callback;

      return 1;
    });
  const setTimeoutSpy = vi
    .spyOn(window, 'setTimeout')
    .mockImplementation(() => 1);
  const textHost = document.createElement('span');
  const firstString = document.createElement('span');
  const secondString = document.createElement('span');
  const firstText = document.createTextNode('This ');
  const secondText = document.createTextNode('mixed');

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  firstString.setAttribute('data-plite-string', 'true');
  secondString.setAttribute('data-plite-string', 'true');
  firstString.append(firstText);
  secondString.append(secondText);
  textHost.append(firstString, secondString);
  root.append(textHost);

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'This mixed' }] }],
    selection: null,
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    firstText.nodeValue = 'This q';
    selectTextOffset(firstText, 6);
    result.current.onDOMInput(createNativeInsertTextEvent('q'));

    secondText.nodeValue = 'mrixed';
    selectTextOffset(secondText, 2);
    result.current.onDOMInput(createNativeInsertTextEvent('r'));

    flushAnimationFrame(() => pendingFrame, performance.now() + 48);

    expect(repairDOMInput).toHaveBeenCalledWith(
      {
        data: 'r',
        inputType: 'insertText',
        target: {
          insert: { offset: 5, text: 'qr' },
          path: [0, 0],
          preferCapturedInsert: true,
          selectionOffset: 8,
          text: 'This qmrixed',
        },
      },
      root
    );
    expect(repairDOMInput).toHaveBeenCalledTimes(1);
  } finally {
    requestAnimationFrameSpy.mockRestore();
    setTimeoutSpy.mockRestore();
    root.remove();
  }
});

test('deferred native text input repair preserves inserts across text targets after frame idle', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  let pendingFrame: FrameRequestCallback | null = null;
  let pendingTimeout: TimerHandler | null = null;
  const requestAnimationFrameSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      pendingFrame = callback;

      return 1;
    });
  const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');
  const setTimeoutSpy = vi
    .spyOn(window, 'setTimeout')
    .mockImplementation((callback) => {
      pendingTimeout = callback;

      return 1;
    });
  const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
  const firstText = appendTextHost(root, '0,0');
  const secondText = appendTextHost(root, '1,0');

  editorReplace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: '' }] },
    ],
    selection: null,
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    firstText.nodeValue = 'x';
    selectTextOffset(firstText, 1);
    result.current.onDOMInput(createNativeInsertTextEvent('x'));

    secondText.nodeValue = 'y';
    selectTextOffset(secondText, 1);
    result.current.onDOMInput(createNativeInsertTextEvent('y'));

    expect(cancelAnimationFrameSpy).not.toHaveBeenCalled();
    expect(setTimeoutSpy).toHaveBeenCalledWith(
      expect.any(Function),
      DEFERRED_NATIVE_TEXT_INPUT_REPAIR_IDLE_MS
    );
    expect(pendingTimeout).toBeTypeOf('function');
    expect(repairDOMInput).not.toHaveBeenCalled();

    flushAnimationFrame(() => pendingFrame, performance.now() + 48);

    expect(repairDOMInput).toHaveBeenNthCalledWith(
      1,
      {
        data: 'x',
        inputType: 'insertText',
        target: {
          insert: { offset: 0, text: 'x' },
          path: [0, 0],
          selectionOffset: 1,
          text: 'x',
        },
      },
      root
    );
    expect(repairDOMInput).toHaveBeenNthCalledWith(
      2,
      {
        data: 'y',
        inputType: 'insertText',
        target: {
          insert: { offset: 0, text: 'y' },
          path: [1, 0],
          selectionOffset: 1,
          text: 'y',
        },
      },
      root
    );
  } finally {
    requestAnimationFrameSpy.mockRestore();
    cancelAnimationFrameSpy.mockRestore();
    setTimeoutSpy.mockRestore();
    clearTimeoutSpy.mockRestore();
    root.remove();
  }
});

test('deferred native text input repair preserves same-path inserts after the caret moves', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  let pendingFrame: FrameRequestCallback | null = null;
  const requestAnimationFrameSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      pendingFrame = callback;

      return 1;
    });
  const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');
  const setTimeoutSpy = vi
    .spyOn(window, 'setTimeout')
    .mockImplementation(() => 1);
  const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
  const text = appendTextHost(root, '0,0', 'abc');

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abc' }] }],
    selection: null,
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    text.nodeValue = 'abcX';
    selectTextOffset(text, 4);
    result.current.onDOMInput(createNativeInsertTextEvent('X'));

    text.nodeValue = 'aYbcX';
    selectTextOffset(text, 2);
    result.current.onDOMInput(createNativeInsertTextEvent('Y'));

    flushAnimationFrame(() => pendingFrame, performance.now() + 48);

    expect(repairDOMInput).toHaveBeenNthCalledWith(
      1,
      {
        data: 'X',
        inputType: 'insertText',
        target: {
          insert: { offset: 3, text: 'X' },
          path: [0, 0],
          selectionOffset: 4,
          text: 'abcX',
        },
      },
      root
    );
    expect(repairDOMInput).toHaveBeenNthCalledWith(
      2,
      {
        data: 'Y',
        inputType: 'insertText',
        target: {
          insert: { offset: 1, text: 'Y' },
          path: [0, 0],
          selectionOffset: 2,
          text: 'aYbcX',
        },
      },
      root
    );
  } finally {
    requestAnimationFrameSpy.mockRestore();
    cancelAnimationFrameSpy.mockRestore();
    setTimeoutSpy.mockRestore();
    clearTimeoutSpy.mockRestore();
    root.remove();
  }
});

test('deferred native text input repair preserves later same-path inserts before input idle', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  let pendingFrame: FrameRequestCallback | null = null;
  const requestAnimationFrameSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      pendingFrame = callback;

      return 1;
    });
  const setTimeoutSpy = vi
    .spyOn(window, 'setTimeout')
    .mockImplementation(() => 1);
  const text = appendTextHost(root, '0,0', 'abc');

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abc' }] }],
    selection: null,
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    text.nodeValue = 'Xabc';
    selectTextOffset(text, 1);
    result.current.onDOMInput(createNativeInsertTextEvent('X'));

    text.nodeValue = 'XabcY';
    selectTextOffset(text, 5);
    result.current.onDOMInput(createNativeInsertTextEvent('Y'));

    flushAnimationFrame(() => pendingFrame, performance.now() + 48);

    expect(repairDOMInput).toHaveBeenNthCalledWith(
      1,
      {
        data: 'X',
        inputType: 'insertText',
        target: {
          insert: { offset: 0, text: 'X' },
          path: [0, 0],
          selectionOffset: 1,
          text: 'Xabc',
        },
      },
      root
    );
    expect(repairDOMInput).toHaveBeenNthCalledWith(
      2,
      {
        data: 'Y',
        inputType: 'insertText',
        target: {
          insert: { offset: 3, text: 'Y' },
          path: [0, 0],
          selectionOffset: 5,
          text: 'XabcY',
        },
      },
      root
    );
    expect(repairDOMInput).toHaveBeenCalledTimes(2);
  } finally {
    requestAnimationFrameSpy.mockRestore();
    setTimeoutSpy.mockRestore();
    root.remove();
  }
});

test('deferred native text input repair has a timer-backed idle flush', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  let pendingTimeout: TimerHandler | null = null;
  const requestAnimationFrameSpy = vi
    .spyOn(window, 'requestAnimationFrame')
    .mockImplementation(() => 1);
  const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');
  const setTimeoutSpy = vi
    .spyOn(window, 'setTimeout')
    .mockImplementation((callback) => {
      pendingTimeout = callback;

      return 1;
    });
  const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
  const text = appendTextHost(root, '0,0');

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
    selection: null,
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    text.nodeValue = 'x';
    selectTextOffset(text, 1);
    result.current.onDOMInput(createNativeInsertTextEvent('x'));

    expect(repairDOMInput).not.toHaveBeenCalled();
    expect(setTimeoutSpy).toHaveBeenCalledWith(
      expect.any(Function),
      DEFERRED_NATIVE_TEXT_INPUT_REPAIR_IDLE_MS
    );

    if (typeof pendingTimeout === 'function') {
      pendingTimeout();
    }

    expect(repairDOMInput).toHaveBeenCalledWith(
      {
        data: 'x',
        inputType: 'insertText',
        target: {
          insert: { offset: 0, text: 'x' },
          path: [0, 0],
          selectionOffset: 1,
          text: 'x',
        },
      },
      root
    );
    expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(1);
  } finally {
    requestAnimationFrameSpy.mockRestore();
    cancelAnimationFrameSpy.mockRestore();
    setTimeoutSpy.mockRestore();
    clearTimeoutSpy.mockRestore();
    root.remove();
  }
});

test('deferred native text input queue reports whether repair work was queued', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const repairDOMInput = vi.fn();
  const text = appendTextHost(root, '0,0', 'abc');

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abc' }] }],
    selection: null,
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useEditableDOMInputHandler({
        deferNativeTextInputRepair: true,
        editor,
        readOnly: false,
        repairDOMInput,
        rootRef: { current: root },
      })
    );

    expect(
      result.current.queuePendingNativeTextInput({
        data: 'x',
        inputType: 'insertText',
        rootElement: root,
        selection: null,
      })
    ).toBe(false);

    expect(
      result.current.queuePendingNativeTextInput({
        data: 'x',
        inputType: 'insertText',
        rootElement: root,
        selection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
      })
    ).toBe(true);

    text.nodeValue = 'abc';
  } finally {
    root.remove();
  }
});

const createKeyDownDecision = (
  overrides: Partial<
    Parameters<typeof shouldFlushPendingNativeTextInputForKeyDown>[0]
  >
): Parameters<typeof shouldFlushPendingNativeTextInputForKeyDown>[0] =>
  ({
    command: null,
    intent: null,
    internalTarget: false,
    nativeAllowed: false,
    ownership: 'no-op',
    selectionBefore: null,
    selectionPolicy: { kind: 'none', reason: 'not-requested' },
    selectionSourceTransition: null,
    shouldForceDOMImport: false,
    stateBefore: 'dom-current',
    targetOwner: 'editor',
    ...overrides,
  }) as Parameters<typeof shouldFlushPendingNativeTextInputForKeyDown>[0];

const createKeyDownEvent = (
  overrides: Partial<KeyboardEvent<HTMLDivElement>>
): KeyboardEvent<HTMLDivElement> =>
  ({
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    ...overrides,
  }) as KeyboardEvent<HTMLDivElement>;

test('plain text keydown does not flush deferred native text repair between characters', () => {
  expect(
    shouldFlushPendingNativeTextInputForKeyDown(
      createKeyDownDecision({
        intent: 'text-insert',
        ownership: 'model-owned',
      }),
      createKeyDownEvent({ key: 'b' })
    )
  ).toBe(false);
});

test('pending native text repair pre-flushes before keydown boundaries', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });

  expect(
    shouldFlushPendingNativeTextInputBeforeKeyDown(
      inputController,
      createKeyDownEvent({ key: 'ArrowLeft' })
    )
  ).toBe(false);

  inputController.state.pendingNativeTextInputRepairPathKey = '0,0';

  expect(
    shouldFlushPendingNativeTextInputBeforeKeyDown(
      inputController,
      createKeyDownEvent({ key: 'b' })
    )
  ).toBe(false);
  expect(
    shouldFlushPendingNativeTextInputBeforeKeyDown(
      inputController,
      createKeyDownEvent({ key: ' ' })
    )
  ).toBe(true);
  expect(
    shouldFlushPendingNativeTextInputBeforeKeyDown(
      inputController,
      createKeyDownEvent({ key: 'ArrowLeft' })
    )
  ).toBe(true);
  expect(
    shouldFlushPendingNativeTextInputBeforeKeyDown(
      inputController,
      createKeyDownEvent({ key: 'z', metaKey: true })
    )
  ).toBe(true);
  expect(
    shouldFlushPendingNativeTextInputBeforeKeyDown(
      inputController,
      createKeyDownEvent({ key: 'Shift' })
    )
  ).toBe(false);
});

test('plain text keydown does not import selection while native text repair is pending', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });

  inputController.state.pendingNativeTextInputRepairPathKey = '0,0';

  expect(
    shouldApplyKeyDownSelectionPolicy(
      createKeyDownDecision({
        intent: 'text-insert',
        ownership: 'model-owned',
      }),
      createKeyDownEvent({ key: 'b' }),
      inputController
    )
  ).toBe(false);
  expect(
    shouldApplyKeyDownSelectionPolicy(
      createKeyDownDecision({
        intent: 'text-insert',
        ownership: 'model-owned',
      }),
      createKeyDownEvent({ key: ' ' }),
      inputController
    )
  ).toBe(true);

  inputController.state.pendingNativeTextInputRepairPathKey = null;
  inputController.state.modelOwnedTextInputGuard = 1;

  expect(
    shouldApplyKeyDownSelectionPolicy(
      createKeyDownDecision({
        intent: 'text-insert',
        ownership: 'model-owned',
      }),
      createKeyDownEvent({ key: 'b' }),
      inputController
    )
  ).toBe(false);
});

test('plain text keydown does not import selection while model owns text input', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });

  inputController.state.selectionSource = 'model-owned';

  expect(
    shouldApplyKeyDownSelectionPolicy(
      createKeyDownDecision({
        intent: 'text-insert',
        ownership: 'model-owned',
      }),
      createKeyDownEvent({ key: 'b' }),
      inputController
    )
  ).toBe(false);
  expect(
    shouldApplyKeyDownSelectionPolicy(
      createKeyDownDecision({
        intent: 'text-insert',
        ownership: 'model-owned',
      }),
      createKeyDownEvent({ key: ' ' }),
      inputController
    )
  ).toBe(true);
});

test('modifier-only keydown does not import selection for no-op editor input', () => {
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });

  expect(
    shouldApplyKeyDownSelectionPolicy(
      createKeyDownDecision({
        intent: null,
        ownership: 'no-op',
      }),
      createKeyDownEvent({ key: 'Shift' }),
      inputController
    )
  ).toBe(false);
});

test('plain text shortcut boundary keydown flushes deferred native text repair', () => {
  expect(
    shouldFlushPendingNativeTextInputForKeyDown(
      createKeyDownDecision({
        intent: 'text-insert',
        ownership: 'model-owned',
      }),
      createKeyDownEvent({ key: ' ' })
    )
  ).toBe(true);
});

test('native selection movement keydown flushes deferred native text repair', () => {
  expect(
    shouldFlushPendingNativeTextInputForKeyDown(
      createKeyDownDecision({
        intent: 'native-selection-move',
        nativeAllowed: true,
        ownership: 'native-allowed',
      }),
      createKeyDownEvent({ key: 'ArrowLeft' })
    )
  ).toBe(true);
});

test('model-owned keydown boundaries flush deferred native text repair', () => {
  expect(
    shouldFlushPendingNativeTextInputForKeyDown(
      createKeyDownDecision({
        intent: 'insert-break',
        ownership: 'model-owned',
        shouldForceDOMImport: true,
      }),
      createKeyDownEvent({ key: 'Enter' })
    )
  ).toBe(true);
  expect(
    shouldFlushPendingNativeTextInputForKeyDown(
      createKeyDownDecision({
        intent: 'insert-break',
        ownership: 'model-owned',
        shouldForceDOMImport: false,
      }),
      createKeyDownEvent({ key: 'Enter' })
    )
  ).toBe(true);
  expect(
    shouldFlushPendingNativeTextInputForKeyDown(
      createKeyDownDecision({
        intent: 'delete',
        ownership: 'model-owned',
        shouldForceDOMImport: false,
      }),
      createKeyDownEvent({ key: 'Backspace' })
    )
  ).toBe(true);
  expect(
    shouldFlushPendingNativeTextInputForKeyDown(
      createKeyDownDecision({
        intent: 'native-selection-move',
        nativeAllowed: true,
        ownership: 'native-allowed',
      }),
      createKeyDownEvent({ key: '1', metaKey: true })
    )
  ).toBe(true);
});

test('editable blur flushes pending native text before app blur callbacks', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = mountEditableRoot(editor);
  const order: string[] = [];
  const relatedTarget = document.createElement('button');
  const { result } = renderHook(() =>
    useTestRuntimeFocusMouseEvents({
      editor,
      flushPendingNativeTextInput: () => {
        order.push('flush');
      },
      inputController,
      onBlur: () => {
        order.push('blur');
      },
      readOnly: false,
      selection: { syncDOMSelectionFromRuntime: vi.fn() } as any,
      state: inputController.state,
      syncDOMSelectionToEditor: vi.fn(),
      trace: { recordKernelEventTrace: vi.fn() } as any,
    })
  );

  try {
    result.current.onBlur({
      currentTarget: root,
      isDefaultPrevented: () => false,
      isPropagationStopped: () => false,
      relatedTarget,
      target: root,
    } as any);

    expect(order).toEqual(['flush', 'blur']);
  } finally {
    unmountEditableRoot(editor, root);
  }
});

test('editable mouse down flushes pending native text before app mouse callbacks', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = mountEditableRoot(editor);
  const order: string[] = [];
  const { result } = renderHook(() =>
    useTestRuntimeFocusMouseEvents({
      editor,
      flushPendingNativeTextInput: () => {
        order.push('flush');
      },
      inputController,
      onMouseDown: () => {
        order.push('mouse');
      },
      readOnly: false,
      selection: { syncDOMSelectionFromRuntime: vi.fn() } as any,
      state: inputController.state,
      syncDOMSelectionToEditor: vi.fn(),
      trace: { recordKernelEventTrace: vi.fn() } as any,
    })
  );

  try {
    result.current.onMouseDown({
      currentTarget: root,
      target: root,
    } as any);

    expect(order).toEqual(['flush', 'mouse']);
  } finally {
    unmountEditableRoot(editor, root);
  }
});

test('an externally canceled mouse gesture never imports editor selection', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = mountEditableRoot(editor);
  const flushPendingNativeTextInput = vi.fn();
  const onClick = vi.fn();
  const onMouseDown = vi.fn();
  const onMouseUp = vi.fn();
  const syncDOMSelectionFromRuntime = vi.fn();
  const syncDOMSelectionToEditor = vi.fn();
  const trace = { recordKernelEventTrace: vi.fn() } as any;
  const { result } = renderHook(() =>
    useTestRuntimeFocusMouseEvents({
      editor,
      flushPendingNativeTextInput,
      inputController,
      onClick,
      onMouseDown,
      onMouseUp,
      readOnly: false,
      selection: { syncDOMSelectionFromRuntime } as any,
      state: inputController.state,
      syncDOMSelectionToEditor,
      trace,
    })
  );
  const canceledEvent = {
    currentTarget: root,
    defaultPrevented: true,
    isDefaultPrevented: () => true,
    isPropagationStopped: () => false,
    target: root,
  } as any;

  try {
    result.current.onMouseDownCapture(canceledEvent);
    result.current.onMouseDown(canceledEvent);
    result.current.onMouseUp({
      ...canceledEvent,
      defaultPrevented: false,
      isDefaultPrevented: () => false,
    });
    result.current.onClick({
      ...canceledEvent,
      defaultPrevented: false,
      isDefaultPrevented: () => false,
    });

    expect(onMouseDown).toHaveBeenCalledTimes(1);
    expect(onMouseUp).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(flushPendingNativeTextInput).not.toHaveBeenCalled();
    expect(syncDOMSelectionFromRuntime).not.toHaveBeenCalled();
    expect(syncDOMSelectionToEditor).not.toHaveBeenCalled();
    expect(trace.recordKernelEventTrace).not.toHaveBeenCalled();
  } finally {
    unmountEditableRoot(editor, root);
  }
});

test('editable paste flushes pending native text before app paste callbacks', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = mountEditableRoot(editor);
  const clipboardData = new FakeClipboardData();
  const order: string[] = [];

  clipboardData.setData('text/plain', ' pasted');
  inputController.state.pendingNativeTextInputRepairOffset = 3;
  inputController.state.pendingNativeTextInputRepairPathKey = '0,0';
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
  });

  const { result } = renderHook(() =>
    useRuntimeClipboardEvents({
      editor,
      flushPendingNativeTextInput: () => {
        order.push('flush');
        inputController.state.pendingNativeTextInputRepairOffset = null;
        inputController.state.pendingNativeTextInputRepairPathKey = null;
      },
      inputController,
      onPaste: () => {
        order.push(
          inputController.state.pendingNativeTextInputRepairPathKey === null
            ? 'paste:flushed'
            : 'paste:stale'
        );
        return true;
      },
      partialDOMBackedSelection: false,
      readOnly: false,
      repair: {
        forceRender: vi.fn(),
        requestEditableRepair: vi.fn(),
      } as any,
      rootRef: { current: root },
      setExplicitPartialDOMBackedSelection: vi.fn(),
      trace: {
        beginKernelEventFrame: vi.fn(),
        recordKernelEventTrace: vi.fn(),
      } as any,
    })
  );

  try {
    result.current.onPaste(createRuntimeClipboardEvent(root, clipboardData));

    expect(order).toEqual(['flush', 'paste:flushed']);
    expect(editorString(editor, [])).toBe('one');
  } finally {
    unmountEditableRoot(editor, root);
  }
});

test('native input repair prefers a valid DOM text target over stale runtime selection', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const firstText = appendTextHost(root, '0,0');
  const secondText = appendTextHost(root, '1,0');

  firstText.nodeValue = 'xa';
  secondText.nodeValue = 'b';
  editorReplace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'a' }] },
      { type: 'paragraph', children: [{ text: 'b' }] },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    },
  });
  document.body.append(root);

  try {
    selectTextOffset(firstText, 1);

    expect(
      getDOMInputRepairTarget(editor, root, {
        data: 'x',
        inputType: 'insertText',
      })
    ).toEqual({
      insert: { offset: 0, text: 'x' },
      path: [0, 0],
      selectionOffset: 1,
      text: 'xa',
    });
  } finally {
    root.remove();
  }
});

test('native input repair uses preferred runtime selection over stale DOM paths', () => {
  const editor = createReactEditor();
  const root = document.createElement('div');
  const firstText = appendTextHost(root, '0,0');
  const secondText = appendTextHost(root, '1,0');

  firstText.nodeValue = 'a';
  secondText.nodeValue = 'yb';
  editorReplace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'a' }] },
      { type: 'paragraph', children: [{ text: 'b' }] },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  document.body.append(root);

  try {
    selectTextOffset(secondText, 1);

    expect(
      getDOMInputRepairTarget(
        editor,
        root,
        {
          data: 'y',
          inputType: 'insertText',
        },
        { preferRuntimeSelection: true }
      )
    ).toEqual({
      insert: { offset: 1, text: 'y' },
      path: [0, 0],
      preferCapturedInsert: true,
      selectionOffset: 2,
      text: 'ay',
    });
  } finally {
    root.remove();
  }
});

test('read-only input capture does not schedule model-owning DOM input repair', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const repairDOMInputAfterFrame = vi.fn();

  const { result } = renderHook(() =>
    useRuntimeInputEvents({
      androidInputManagerRef: { current: null },
      deferredMutations: { current: [] },
      editor,
      handledDOMBeforeInputRef: { current: false },
      inputController,
      readOnly: true,
      repair: {
        forceRender: vi.fn(),
        requestEditableRepair: vi.fn(),
      } as any,
      rootRef: { current: root },
      runtime: new EditableDOMRuntime({ editor }),
      syncDOMSelectionToEditor: vi.fn(),
      trace: {
        getCurrentKernelFrameId: () => 1,
        recordKernelEventTrace: vi.fn(),
        repairDOMInputAfterFrame,
      } as any,
    })
  );

  result.current.onInputCapture({
    currentTarget: root,
    nativeEvent: { data: 'x', inputType: 'insertText' },
    stopPropagation: vi.fn(),
    target: null,
  } as any);

  expect(repairDOMInputAfterFrame).not.toHaveBeenCalled();
});

test('deferred runtime input capture leaves native text repair to DOM input handler', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = mountEditableRoot(editor);
  const text = appendTextHost(root, '0,0');
  const repairDOMInputAfterFrame = vi.fn();

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  try {
    const { result } = renderHook(() =>
      useRuntimeInputEvents({
        androidInputManagerRef: { current: null },
        deferNativeTextInputRepair: true,
        deferredMutations: { current: [] },
        editor,
        handledDOMBeforeInputRef: { current: false },
        inputController,
        readOnly: false,
        repair: {
          forceRender: vi.fn(),
          requestEditableRepair: vi.fn(),
        } as any,
        rootRef: { current: root },
        runtime: new EditableDOMRuntime({ editor }),
        syncDOMSelectionToEditor: vi.fn(),
        trace: {
          getCurrentKernelFrameId: () => 1,
          recordKernelEventTrace: vi.fn(),
          repairDOMInputAfterFrame,
        } as any,
      })
    );

    text.nodeValue = 'x';
    selectTextOffset(text, 1);
    result.current.onInputCapture({
      currentTarget: root,
      nativeEvent: { data: 'x', inputType: 'insertText' },
      stopPropagation: vi.fn(),
      target: null,
    } as any);

    expect(repairDOMInputAfterFrame).not.toHaveBeenCalled();
  } finally {
    unmountEditableRoot(editor, root);
  }
});

test('runtime input capture leaves runtime-targeted repair to the root listener', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  });
  const root = mountEditableRoot(editor);
  const text = appendTextHost(root, '0,0');
  const repairDOMInputAfterFrame = vi.fn();
  const domPhaseScheduler = createDOMPhaseScheduler();
  const domRepairQueue = createDOMRepairQueue({
    domPhaseScheduler,
    editor,
    inputController,
    scrollSelectionIntoView: vi.fn(),
    syncDOMSelectionToEditor: vi.fn(),
  });
  const repairDOMInputWithTrace = vi.fn(domRepairQueue.repairDOMInput);
  const requestEditableRepair = vi.fn();
  const nativeEvent = { data: 'x', inputType: 'insertText' };

  inputController.state.activeIntent = 'text-insert';
  inputController.state.selectionSource = 'model-owned';
  inputController.state.modelOwnedTextInputGuard = 0;
  beginEditableCompositionSession(inputController);
  text.nodeValue = 'xabc';
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abc' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  try {
    const { result } = renderHook(() =>
      useRuntimeInputEvents({
        androidInputManagerRef: { current: null },
        deferredMutations: { current: [] },
        editor,
        handledDOMBeforeInputRef: { current: false },
        inputController,
        readOnly: false,
        repair: {
          forceRender: vi.fn(),
          requestEditableRepair,
        } as any,
        rootRef: { current: root },
        runtime: new EditableDOMRuntime({ editor }),
        syncDOMSelectionToEditor: vi.fn(),
        trace: {
          getCurrentKernelFrameId: () => 1,
          recordKernelEventTrace: vi.fn(),
          repairDOMInputAfterFrame,
          repairDOMInputWithTrace,
        } as any,
      })
    );

    selectTextOffset(text, 1);
    result.current.onInputCapture({
      currentTarget: root,
      nativeEvent,
      stopPropagation: vi.fn(),
      target: null,
    } as any);
    result.current.onDOMInput(nativeEvent as any);
    result.current.onInput({
      currentTarget: root,
      isDefaultPrevented: () => false,
      isPropagationStopped: () => false,
      nativeEvent: { data: 'x', inputType: 'insertText' },
      stopPropagation: vi.fn(),
      target: null,
    } as any);

    expect(repairDOMInputAfterFrame).not.toHaveBeenCalled();
    expect(repairDOMInputWithTrace).toHaveBeenCalledWith(
      {
        data: 'x',
        inputType: 'insertText',
        target: {
          insert: { offset: 1, text: 'x' },
          path: [0, 0],
          preferCapturedInsert: true,
          selectionOffset: 2,
          text: 'axbc',
        },
      },
      root
    );
    expect(requestEditableRepair).not.toHaveBeenCalled();
    expect(editorString(editor, [0])).toBe('axbc');
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });
    expect(inputController.state.compositionSession?.modelCommitted).toBe(true);
  } finally {
    domPhaseScheduler.destroy();
    unmountEditableRoot(editor, root);
  }
});

test('root input repair prevents duplicate bubble repair for the same native input', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const text = appendTextHost(root, '0,0');
  const repairDOMInputAfterFrame = vi.fn();
  const repairDOMInputWithTrace = vi.fn();
  const requestEditableRepair = vi.fn();
  const nativeEvent = { data: 'x', inputType: 'insertText' };

  text.nodeValue = 'x';
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useRuntimeInputEvents({
        androidInputManagerRef: { current: null },
        deferredMutations: { current: [] },
        editor,
        handledDOMBeforeInputRef: { current: false },
        inputController,
        readOnly: false,
        repair: {
          forceRender: vi.fn(),
          requestEditableRepair,
        } as any,
        rootRef: { current: root },
        runtime: new EditableDOMRuntime({ editor }),
        syncDOMSelectionToEditor: vi.fn(),
        trace: {
          getCurrentKernelFrameId: () => 1,
          recordKernelEventTrace: vi.fn(),
          repairDOMInputAfterFrame,
          repairDOMInputWithTrace,
        } as any,
      })
    );

    selectTextOffset(text, 1);
    result.current.onInputCapture({
      currentTarget: root,
      nativeEvent,
      stopPropagation: vi.fn(),
      target: null,
    } as any);
    result.current.onDOMInput(nativeEvent as any);
    result.current.onInput({
      currentTarget: root,
      isDefaultPrevented: () => false,
      isPropagationStopped: () => false,
      nativeEvent,
      stopPropagation: vi.fn(),
      target: null,
    } as any);

    expect(repairDOMInputAfterFrame).not.toHaveBeenCalled();
    expect(repairDOMInputWithTrace).toHaveBeenCalledTimes(1);
    expect(requestEditableRepair).not.toHaveBeenCalled();
    expect(inputController.state.pendingRootDOMInput).toBeNull();
  } finally {
    root.remove();
  }
});

test('react input repair ignores stale native insert while model preference owns text input', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const text = appendTextHost(root, '0,0');
  const modelText = 'This abcdefghijklmnomixed block';
  const offset = 'This abcdefghijklmno'.length;
  const handledDOMBeforeInputRef = { current: false };

  inputController.state.activeIntent = 'text-insert';
  inputController.state.selectionSource = 'model-owned';
  inputController.state.modelOwnedTextInputGuard = 0;
  text.nodeValue = `p${modelText}`;
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: modelText }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset },
      focus: { path: [0, 0], offset },
    },
  });
  document.body.append(root);

  try {
    selectTextOffset(text, 1);

    const result = applyEditableInput({
      androidInputManagerRef: { current: null },
      deferredMutations: { current: [] },
      editor,
      event: {
        currentTarget: root,
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        nativeEvent: { data: 'p', inputType: 'insertText' },
      } as any,
      handledDOMBeforeInputRef,
      inputController,
      readOnly: false,
    });

    expect(result.repairs).toEqual([]);
    expect(editorString(editor, [0])).toBe(modelText);
    expect(editorGetSelection(editor)).toEqual({
      kind: 'text',
      anchor: { path: [0, 0], offset },
      focus: { path: [0, 0], offset },
    });
  } finally {
    root.remove();
  }
});

test('root-owned input skips Android input replay', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const handleInput = vi.fn();
  const handledDOMBeforeInputRef = { current: true };

  const result = applyEditableInput({
    androidInputManagerRef: { current: { handleInput } as any },
    deferredMutations: { current: [] },
    editor,
    event: {
      currentTarget: document.createElement('div'),
      isDefaultPrevented: () => false,
      isPropagationStopped: () => false,
      nativeEvent: { data: 'x', inputType: 'insertText' },
    } as any,
    handledDOMBeforeInputRef,
    inputController,
    readOnly: false,
    skipNativeTextInputRepair: true,
  });

  expect(handleInput).not.toHaveBeenCalled();
  expect(result.repairs).toEqual([]);
  expect(handledDOMBeforeInputRef.current).toBe(false);
});

test('Android input bypasses root repair and flushes through the Android manager', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const text = appendTextHost(root, '0,0');
  const handleInput = vi.fn(() => true);
  const repairDOMInputWithTrace = vi.fn();
  const nativeEvent = { data: 'x', inputType: 'insertText' };

  text.nodeValue = 'x';
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useRuntimeInputEvents({
        androidInputManagerRef: { current: { handleInput } as any },
        deferredMutations: { current: [] },
        editor,
        handledDOMBeforeInputRef: { current: false },
        inputController,
        readOnly: false,
        repair: {
          forceRender: vi.fn(),
          requestEditableRepair: vi.fn(),
        } as any,
        rootRef: { current: root },
        runtime: new EditableDOMRuntime({ editor }),
        syncDOMSelectionToEditor: vi.fn(),
        trace: {
          getCurrentKernelFrameId: () => 1,
          recordKernelEventTrace: vi.fn(),
          repairDOMInputAfterFrame: vi.fn(),
          repairDOMInputWithTrace,
        } as any,
      })
    );

    selectTextOffset(text, 1);
    result.current.onDOMInput(nativeEvent as any);
    result.current.onInput({
      currentTarget: root,
      isDefaultPrevented: () => false,
      isPropagationStopped: () => false,
      nativeEvent,
      stopPropagation: vi.fn(),
      target: null,
    } as any);

    expect(repairDOMInputWithTrace).not.toHaveBeenCalled();
    expect(handleInput).toHaveBeenCalledTimes(1);
    expect(inputController.state.pendingRootDOMInput).toBeNull();
  } finally {
    root.remove();
  }
});

test('declined Android input repairs from the root-captured DOM target', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const text = appendTextHost(root, '0,0');
  const handleInput = vi.fn(() => false);
  const repairDOMInputWithTrace = vi.fn();
  const nativeEvent = { data: 'D', inputType: 'insertText' };

  inputController.state.selectionChangeOrigin = 'native-user';
  inputController.state.selectionSource = 'dom-current';
  text.nodeValue = 'aDThis';
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'aThis' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  document.body.append(root);

  try {
    const { result } = renderHook(() =>
      useRuntimeInputEvents({
        androidInputManagerRef: { current: { handleInput } as any },
        deferredMutations: { current: [] },
        editor,
        handledDOMBeforeInputRef: { current: false },
        inputController,
        readOnly: false,
        repair: {
          forceRender: vi.fn(),
          requestEditableRepair: vi.fn(),
        } as any,
        rootRef: { current: root },
        runtime: new EditableDOMRuntime({ editor }),
        syncDOMSelectionToEditor: vi.fn(),
        trace: {
          getCurrentKernelFrameId: () => 1,
          recordKernelEventTrace: vi.fn(),
          repairDOMInputAfterFrame: vi.fn(),
          repairDOMInputWithTrace,
        } as any,
      })
    );

    selectTextOffset(text, 2);
    result.current.onDOMInput(nativeEvent as any);
    result.current.onInput({
      currentTarget: root,
      isDefaultPrevented: () => false,
      isPropagationStopped: () => false,
      nativeEvent,
      stopPropagation: vi.fn(),
      target: null,
    } as any);

    expect(handleInput).toHaveBeenCalledTimes(1);
    expect(repairDOMInputWithTrace).toHaveBeenCalledWith(
      {
        data: 'D',
        inputType: 'insertText',
        target: {
          insert: { offset: 1, text: 'D' },
          path: [0, 0],
          preferCapturedInsert: true,
          selectionOffset: 2,
          text: 'aDThis',
        },
      },
      root
    );
    expect(inputController.state.pendingRootDOMInput).toBeNull();
  } finally {
    root.remove();
  }
});

test('declined Android input falls back to canonical React input repair', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = mountEditableRoot(editor);
  const text = appendTextHost(root, '0,0');
  const handleInput = vi.fn(() => false);
  const handledDOMBeforeInputRef = { current: false };

  inputController.preferModelSelectionForInputRef.current = true;
  inputController.state.selectionSource = 'model-owned';
  text.nodeValue = 'afThis';
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'aThis' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  try {
    selectTextOffset(text, 1);
    const result = applyEditableInput({
      androidInputManagerRef: { current: { handleInput } as any },
      deferredMutations: { current: [] },
      editor,
      event: {
        currentTarget: root,
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        nativeEvent: { data: 'f', inputType: 'insertText' },
      } as any,
      handledDOMBeforeInputRef,
      inputController,
      readOnly: false,
    });

    expect(handleInput).toHaveBeenCalledTimes(1);
    expect(editorString(editor, [0])).toBe('afThis');
    expect(result.repairs).toMatchObject([{ kind: 'repair-caret' }]);
  } finally {
    unmountEditableRoot(editor, root);
  }
});

test('declined Android input preserves a native DOM caret', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = mountEditableRoot(editor);
  const text = appendTextHost(root, '0,0');
  const handleInput = vi.fn(() => {
    inputController.preferModelSelectionForInputRef.current = true;
    inputController.state.selectionSource = 'model-owned';
    return false;
  });

  inputController.state.selectionSource = 'dom-current';
  text.nodeValue = 'aDThis';
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'aThis' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
  });

  try {
    selectTextOffset(text, 2);
    applyEditableInput({
      androidInputManagerRef: { current: { handleInput } as any },
      deferredMutations: { current: [] },
      editor,
      event: {
        currentTarget: root,
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        nativeEvent: { data: 'D', inputType: 'insertText' },
      } as any,
      handledDOMBeforeInputRef: { current: false },
      inputController,
      readOnly: false,
    });

    expect(handleInput).toHaveBeenCalledTimes(1);
    expect(editorString(editor, [0])).toBe('aDThis');
  } finally {
    unmountEditableRoot(editor, root);
  }
});

test('react input repair does not replay text after flushing deferred beforeinput intents', () => {
  const editor = createReactEditor();
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });
  const root = document.createElement('div');
  const text = appendTextHost(root, '0,0');
  const handledDOMBeforeInputRef = { current: false };

  text.nodeValue = 'x';
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });
  document.body.append(root);

  try {
    selectTextOffset(text, 1);
    const result = applyEditableInput({
      androidInputManagerRef: { current: null },
      deferredMutations: {
        current: [
          () => {
            editorInsertText(editor, 'x', { at: { path: [0, 0], offset: 0 } });
          },
        ],
      },
      editor,
      event: {
        currentTarget: root,
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        nativeEvent: { data: 'x', inputType: 'insertText' },
      } as any,
      handledDOMBeforeInputRef,
      inputController,
      readOnly: false,
    });

    expect(result.repairs).toEqual([
      {
        focus: true,
        kind: 'repair-caret',
        selectionSourceTransition: {
          preferModelSelection: true,
          reason: 'model-command',
          selectionSource: 'model-owned',
        },
      },
    ]);
    expect(editorString(editor, [0])).toBe('x');
  } finally {
    root.remove();
  }
});
