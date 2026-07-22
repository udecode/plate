import type { Anchor, Point, Range } from '@platejs/plite';
import {
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';
import {
  EDITOR_TO_PENDING_INSERTION_MARKS,
  EDITOR_TO_USER_MARKS,
  IS_COMPOSING,
} from '@platejs/plite-dom/internal';
import { renderHook } from '@testing-library/react';
import { type CompositionEvent, type ReactNode, StrictMode } from 'react';
import {
  applyEditableCompositionEnd,
  applyEditableCompositionUpdate,
} from '../src/editable/composition-state';
import {
  EditableDOMRuntime,
  subscribeEditableRuntimeFocus,
} from '../src/editable/editable-dom-runtime';
import {
  isDOMSyncMutation,
  markDOMSyncMutationTarget,
} from '../src/editable/dom-sync-mutation-ownership';
import {
  beginEditableCompositionSession,
  markEditableCompositionModelCommitted,
} from '../src/editable/input-state';
import { queuePendingCompositionModelInput } from '../src/editable/runtime-before-input-events';
import { useEditableRootRuntimeState } from '../src/editable/runtime-root-state';
import { ReactEditor } from '../src/plugin/react-editor';
import { createReactEditor } from '../src/plugin/with-react';

vi.mock('@platejs/plite-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@platejs/plite-dom')>();

  return { ...actual, IS_WEBKIT: false };
});

const strictMode = ({ children }: { children: ReactNode }) => (
  <StrictMode>{children}</StrictMode>
);

test('keeps one runtime per mount without render fan-out and tears it down', () => {
  const editor = createReactEditor();
  const mounted = renderHook(
    ({ readOnly }) =>
      useEditableRootRuntimeState({
        domStrategyRuntime: null,
        editor,
        readOnly,
      }),
    {
      initialProps: { readOnly: false },
      wrapper: strictMode,
    }
  );
  const runtime = mounted.result.current.runtime;
  const scheduler = runtime.domPhaseScheduler;

  const scheduled = vi.fn();

  scheduler.schedule('model', 'mounted-root', scheduled, {
    timing: 'immediate',
  });
  expect(scheduled).toHaveBeenCalledTimes(1);

  mounted.rerender({ readOnly: true });

  expect(mounted.result.current.runtime).toBe(runtime);
  expect(mounted.result.current.runtime.domPhaseScheduler).toBe(scheduler);
  expect(mounted.result.current.runtime.readOnly).toBe(true);

  scheduler.schedule('dom-read', 'pending-before-unmount', () => {}, {
    delay: 10_000,
    timing: 'timeout',
  });
  expect(scheduler.pending()).toBe(1);

  mounted.unmount();

  expect(scheduler.pending()).toBe(0);
  scheduler.schedule('model', 'unmounted-root', scheduled);
  expect(scheduler.pending()).toBe(0);

  const remounted = renderHook(
    () =>
      useEditableRootRuntimeState({
        domStrategyRuntime: null,
        editor,
        readOnly: false,
      }),
    { wrapper: strictMode }
  );

  expect(remounted.result.current.runtime).not.toBe(runtime);
  expect(remounted.result.current.runtime.domPhaseScheduler).not.toBe(
    scheduler
  );

  remounted.unmount();
});

test('replaces the mounted runtime when editor ownership changes', () => {
  const firstEditor = createReactEditor();
  const secondEditor = createReactEditor();
  const mounted = renderHook(
    ({ editor }) =>
      useEditableRootRuntimeState({
        domStrategyRuntime: null,
        editor,
        readOnly: false,
      }),
    {
      initialProps: { editor: firstEditor },
      wrapper: strictMode,
    }
  );
  const firstRuntime = mounted.result.current.runtime;

  firstRuntime.domPhaseScheduler.schedule('model', 'old-editor', () => {}, {
    delay: 10_000,
    timing: 'timeout',
  });
  mounted.rerender({ editor: secondEditor });

  expect(mounted.result.current.runtime).not.toBe(firstRuntime);
  expect(mounted.result.current.runtime.editor).toBe(secondEditor);
  expect(firstRuntime.editor).toBe(firstEditor);
  expect(firstRuntime.domPhaseScheduler.pending()).toBe(0);

  mounted.unmount();
});

test('destroy releases listeners, anchors, disposables, and scheduler work', () => {
  const editor = createReactEditor();
  const runtime = new EditableDOMRuntime({ editor });
  const root = document.createElement('div');
  const addEventListener = vi.spyOn(root, 'addEventListener');
  const removeEventListener = vi.spyOn(root, 'removeEventListener');
  const firstBeforeInput = vi.fn();
  const latestBeforeInput = vi.fn();
  const onInput = vi.fn();
  const releaseAnchor = vi.fn();
  const disposeObserver = vi.fn();

  runtime.updateNativeInputHandlers({
    onDOMBeforeInput: firstBeforeInput,
    onDOMInput: onInput,
  });
  runtime.setRoot(root);
  runtime.browserHandleRangeAnchors.current.set('range', {
    release: releaseAnchor,
  } as unknown as Anchor<Range>);
  runtime.installDisposable('observer', disposeObserver);
  runtime.connect();
  runtime.connect();

  expect(
    addEventListener.mock.calls.filter(([type]) => type === 'beforeinput')
  ).toHaveLength(1);
  expect(
    addEventListener.mock.calls.filter(([type]) => type === 'input')
  ).toHaveLength(1);

  runtime.updateNativeInputHandlers({
    onDOMBeforeInput: latestBeforeInput,
    onDOMInput: onInput,
  });
  root.dispatchEvent(new InputEvent('beforeinput'));
  root.dispatchEvent(new InputEvent('input'));

  expect(firstBeforeInput).not.toHaveBeenCalled();
  expect(latestBeforeInput).toHaveBeenCalledTimes(1);
  expect(onInput).toHaveBeenCalledTimes(1);

  runtime.domPhaseScheduler.schedule('dom-write', 'pending-repair', () => {}, {
    delay: 10_000,
    timing: 'timeout',
  });
  runtime.onUserInput();
  expect(runtime.domPhaseScheduler.pending()).toBe(2);
  expect(runtime.receivedUserInput.current).toBe(true);

  runtime.destroy();

  expect(disposeObserver).toHaveBeenCalledTimes(1);
  expect(releaseAnchor).toHaveBeenCalledTimes(1);
  expect(runtime.browserHandleRangeAnchors.current.size).toBe(0);
  expect(runtime.domPhaseScheduler.pending()).toBe(0);
  expect(runtime.receivedUserInput.current).toBe(false);
  expect(
    removeEventListener.mock.calls.filter(([type]) => type === 'beforeinput')
  ).toHaveLength(1);
  expect(
    removeEventListener.mock.calls.filter(([type]) => type === 'input')
  ).toHaveLength(1);
  runtime.domPhaseScheduler.schedule('model', 'destroyed-root', () => {});
  expect(runtime.domPhaseScheduler.pending()).toBe(0);

  root.dispatchEvent(new InputEvent('beforeinput'));
  expect(latestBeforeInput).toHaveBeenCalledTimes(1);
});

test('changing roots cancels old-root work before registering the new root', () => {
  const runtime = new EditableDOMRuntime({ editor: createReactEditor() });
  const firstRoot = document.createElement('div');
  const secondRoot = document.createElement('div');
  const callback = vi.fn();
  const prepareDOMTeardown = vi.fn();

  runtime.setRoot(firstRoot);
  runtime.connect();
  runtime.androidInputManagerRef.current = {
    prepareDOMTeardown,
  } as never;
  runtime.domPhaseScheduler.schedule('dom-write', 'old-root', callback, {
    delay: 10_000,
    timing: 'timeout',
  });
  runtime.onUserInput();
  runtime.inputController.state.modelOwnedTextInputGuard = 1;
  expect(runtime.receivedUserInput.current).toBe(true);
  expect(runtime.domPhaseScheduler.pending()).toBe(2);

  runtime.setRoot(secondRoot);

  expect(prepareDOMTeardown).toHaveBeenCalledTimes(1);
  expect(runtime.receivedUserInput.current).toBe(false);
  expect(runtime.inputController.state.modelOwnedTextInputGuard).toBe(0);
  expect(runtime.domPhaseScheduler.pending()).toBe(0);
  runtime.domPhaseScheduler.schedule('dom-write', 'new-root', callback, {
    timing: 'immediate',
  });
  expect(callback).toHaveBeenCalledTimes(1);

  runtime.destroy();
  expect(prepareDOMTeardown).toHaveBeenCalledTimes(2);
});

test.each([
  ['destroy', 'end-pending'],
  ['destroy', 'input-claimed'],
  ['setRoot', 'end-pending'],
  ['setRoot', 'input-claimed'],
] as const)('%s flushes Plite %s composition work without publishing stale React work', (lifecycle, phase) => {
  const editor = createReactEditor();
  const runtime = new EditableDOMRuntime({ editor });
  const firstRoot = document.createElement('div');

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abcd' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    },
  });
  const compositionSelection = editor.read((state) => state.selection());
  const event = {
    currentTarget: firstRoot,
    data: '文',
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    nativeEvent: { data: '文', isTrusted: true },
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target: {},
  } as unknown as CompositionEvent<HTMLDivElement>;
  const hasSelectableTarget = vi
    .spyOn(ReactEditor, 'hasSelectableTarget')
    .mockReturnValue(true);

  runtime.setRoot(firstRoot);
  runtime.connect();
  runtime.inputController.state.activeIntent = 'composition';
  beginEditableCompositionSession(runtime.inputController);
  runtime.setComposing(true);

  try {
    applyEditableCompositionEnd({
      androidInputManagerRef: { current: null },
      editor,
      event,
      inputController: runtime.inputController,
      runOwnedDOMMutation: (callback) =>
        runtime.runOwnedDOMMutation('composition', callback),
      scheduleTask: runtime.domPhaseScheduler.schedule,
      setComposing: runtime.setComposing,
    });

    if (phase === 'input-claimed') {
      if (!compositionSelection) {
        throw new Error('expected composition selection');
      }
      queuePendingCompositionModelInput({
        command: {
          inputType: 'insertFromComposition',
          kind: 'insert-text',
          text: '文',
        },
        data: '文',
        editor,
        inputController: runtime.inputController,
        inputType: 'insertFromComposition',
        repair: { requestEditableRepair: vi.fn() },
        selection: compositionSelection,
        setComposing: runtime.setComposing,
      });
    }

    expect(runtime.inputController.state.pendingCompositionEnd).toMatchObject({
      ownership: 'plite',
      phase,
    });

    if (lifecycle === 'destroy') {
      runtime.destroy();
    } else {
      runtime.setRoot(document.createElement('div'));
    }

    expect(editorString(editor, [])).toBe('a文d');
    expect(runtime.inputController.state).toMatchObject({
      activeIntent: null,
      compositionSession: null,
      isComposing: false,
      pendingCompositionEnd: null,
      selectionSource: 'unknown',
    });
  } finally {
    hasSelectableTarget.mockRestore();
    if (lifecycle === 'setRoot') runtime.destroy();
  }
});

test.each([
  'destroy',
  'setRoot',
] as const)('%s completes teardown after a claimed composition commit throws', (lifecycle) => {
  const editor = createReactEditor();
  const runtime = new EditableDOMRuntime({ editor });
  const firstRoot = document.createElement('div');
  const secondRoot = document.createElement('div');
  const modelFailure = new Error('composition model commit failed');
  const cleanupFailure = new Error('later cleanup failed');
  const dispose = vi.fn(() => {
    if (lifecycle === 'destroy') throw cleanupFailure;
  });
  const lateDispose = vi.fn();
  const releaseAnchor = vi.fn();
  const onInput = vi.fn();

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abcd' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    },
  });
  const compositionSelection = editor.read((state) => state.selection());
  const event = {
    currentTarget: firstRoot,
    data: '文',
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    nativeEvent: { data: '文', isTrusted: true },
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target: {},
  } as unknown as CompositionEvent<HTMLDivElement>;
  const hasSelectableTarget = vi
    .spyOn(ReactEditor, 'hasSelectableTarget')
    .mockReturnValue(true);

  runtime.updateNativeInputHandlers({
    onDOMBeforeInput: vi.fn(),
    onDOMInput: onInput,
  });
  runtime.setRoot(firstRoot);
  runtime.connect();
  runtime.installDisposable('throwing-flush-proof', dispose);
  runtime.installDisposable('late-cleanup-proof', lateDispose);
  runtime.browserHandleRangeAnchors.current.set('throwing-flush-proof', {
    release: releaseAnchor,
  } as unknown as Anchor<Range>);
  runtime.inputController.state.activeIntent = 'composition';
  beginEditableCompositionSession(runtime.inputController);
  runtime.setComposing(true);

  try {
    applyEditableCompositionEnd({
      androidInputManagerRef: { current: null },
      editor,
      event,
      inputController: runtime.inputController,
      runOwnedDOMMutation: (callback) =>
        runtime.runOwnedDOMMutation('composition', callback),
      scheduleTask: runtime.domPhaseScheduler.schedule,
      setComposing: runtime.setComposing,
    });
    const pendingCompositionEnd =
      runtime.inputController.state.pendingCompositionEnd;

    if (pendingCompositionEnd?.ownership !== 'plite' || !compositionSelection) {
      throw new Error('expected claimed Plite composition work');
    }
    pendingCompositionEnd.replaceWithInput({
      commit: (fallbackSelection) => {
        if (!fallbackSelection) return false;

        editor.update((tx) => {
          tx.text.insert('文', { at: fallbackSelection });
        });
        markEditableCompositionModelCommitted(runtime.inputController);
        throw modelFailure;
      },
      complete: vi.fn(),
      data: '文',
      discard: vi.fn(),
      inputType: 'insertFromComposition',
    });

    let thrown: unknown;

    try {
      if (lifecycle === 'destroy') {
        runtime.destroy();
      } else {
        runtime.setRoot(secondRoot);
      }
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBe(modelFailure);
    expect(editorString(editor, [])).toBe('a文d');
    expect(runtime.inputController.state).toMatchObject({
      activeIntent: null,
      compositionSession: null,
      isComposing: false,
      pendingCompositionEnd: null,
      selectionSource: 'unknown',
    });
    expect(IS_COMPOSING.get(editor)).toBe(false);
    expect(ReactEditor.isComposing(editor)).toBe(false);
    expect(runtime.domPhaseScheduler.pending()).toBe(0);

    firstRoot.dispatchEvent(new InputEvent('input'));
    expect(onInput).not.toHaveBeenCalled();

    if (lifecycle === 'destroy') {
      expect(dispose).toHaveBeenCalledOnce();
      expect(lateDispose).toHaveBeenCalledOnce();
      expect(releaseAnchor).toHaveBeenCalledOnce();
      expect(runtime.browserHandleRangeAnchors.current.size).toBe(0);
    } else {
      expect(runtime.rootRef.current).toBe(secondRoot);
      secondRoot.dispatchEvent(new InputEvent('input'));
      expect(onInput).toHaveBeenCalledOnce();
    }
  } finally {
    hasSelectableTarget.mockRestore();
    if (lifecycle === 'setRoot') runtime.destroy();
  }
});

test('tearing down one composing root preserves a sibling composition owner', () => {
  const editor = createReactEditor();
  const firstRuntime = new EditableDOMRuntime({ editor });
  const secondRuntime = new EditableDOMRuntime({ editor });

  firstRuntime.setRoot(document.createElement('div'));
  secondRuntime.setRoot(document.createElement('div'));
  firstRuntime.connect();
  secondRuntime.connect();
  firstRuntime.setComposing(true);
  secondRuntime.setComposing(true);
  EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, { bold: true });
  EDITOR_TO_USER_MARKS.set(editor, { italic: true });

  firstRuntime.setComposing(false);
  expect(IS_COMPOSING.get(editor)).toBe(true);
  expect(ReactEditor.isComposing(editor)).toBe(true);
  firstRuntime.setComposing(true);

  firstRuntime.destroy();

  expect(firstRuntime.inputController.state.isComposing).toBe(false);
  expect(secondRuntime.inputController.state.isComposing).toBe(true);
  expect(IS_COMPOSING.get(editor)).toBe(true);
  expect(ReactEditor.isComposing(editor)).toBe(true);
  expect(EDITOR_TO_PENDING_INSERTION_MARKS.has(editor)).toBe(true);
  expect(EDITOR_TO_USER_MARKS.has(editor)).toBe(true);

  secondRuntime.destroy();

  expect(IS_COMPOSING.get(editor)).toBe(false);
  expect(ReactEditor.isComposing(editor)).toBe(false);
  expect(EDITOR_TO_PENDING_INSERTION_MARKS.has(editor)).toBe(false);
  expect(EDITOR_TO_USER_MARKS.has(editor)).toBe(false);
  expect(editor.read((state) => state.marks())).toBeNull();
});

test.each([
  'destroy',
  'setRoot',
] as const)('%s flushes pending composition without clearing sibling-root marks', (lifecycle) => {
  const editor = createReactEditor();
  const firstRuntime = new EditableDOMRuntime({ editor });
  const secondRuntime = new EditableDOMRuntime({ editor });
  const firstRoot = document.createElement('div');
  const pendingMarks = { bold: true };
  const userMarks = { italic: true };
  const hasSelectableTarget = vi
    .spyOn(ReactEditor, 'hasSelectableTarget')
    .mockReturnValue(true);

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abcd' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  firstRoot.textContent = 'a文bcd';
  firstRuntime.setRoot(firstRoot);
  secondRuntime.setRoot(document.createElement('div'));
  firstRuntime.connect();
  secondRuntime.connect();
  beginEditableCompositionSession(firstRuntime.inputController);
  beginEditableCompositionSession(secondRuntime.inputController);
  firstRuntime.setComposing(true);
  secondRuntime.setComposing(true);
  EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, pendingMarks);
  EDITOR_TO_USER_MARKS.set(editor, userMarks);

  try {
    applyEditableCompositionEnd({
      androidInputManagerRef: { current: null },
      editor,
      event: {
        currentTarget: firstRoot,
        data: '文',
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        nativeEvent: { data: '文', isTrusted: true },
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        target: {},
      } as unknown as CompositionEvent<HTMLDivElement>,
      inputController: firstRuntime.inputController,
      runOwnedDOMMutation: (callback) => callback(),
      scheduleTask: firstRuntime.domPhaseScheduler.schedule,
      setComposing: firstRuntime.setComposing,
    });
    expect(
      firstRuntime.inputController.state.pendingCompositionEnd
    ).toMatchObject({
      ownership: 'plite',
      phase: 'end-pending',
    });

    if (lifecycle === 'destroy') {
      firstRuntime.destroy();
    } else {
      firstRuntime.setRoot(document.createElement('div'));
    }

    expect(editorString(editor, [])).toBe('a文bcd');
    expect(firstRuntime.inputController.state).toMatchObject({
      compositionSession: null,
      isComposing: false,
      pendingCompositionEnd: null,
    });
    expect(secondRuntime.inputController.state.isComposing).toBe(true);
    expect(ReactEditor.isComposing(editor)).toBe(true);
    expect(EDITOR_TO_PENDING_INSERTION_MARKS.get(editor)).toBe(pendingMarks);
    expect(EDITOR_TO_USER_MARKS.get(editor)).toBe(userMarks);
  } finally {
    hasSelectableTarget.mockRestore();
    if (lifecycle === 'setRoot') firstRuntime.destroy();
    secondRuntime.destroy();
  }
});

test('read-only composition exit preserves sibling-root composition marks', () => {
  const editor = createReactEditor();
  const firstRuntime = new EditableDOMRuntime({ editor });
  const secondRuntime = new EditableDOMRuntime({ editor });
  const firstRoot = document.createElement('div');
  const pendingMarks = { bold: true };
  const userMarks = { italic: true };
  const hasSelectableTarget = vi
    .spyOn(ReactEditor, 'hasSelectableTarget')
    .mockReturnValue(true);
  const hasEditableTarget = vi
    .spyOn(ReactEditor, 'hasEditableTarget')
    .mockReturnValue(true);

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abcd' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  firstRoot.textContent = 'a文bcd';
  firstRuntime.setRoot(firstRoot);
  secondRuntime.setRoot(document.createElement('div'));
  firstRuntime.connect();
  secondRuntime.connect();
  beginEditableCompositionSession(firstRuntime.inputController);
  beginEditableCompositionSession(secondRuntime.inputController);
  firstRuntime.setComposing(true);
  secondRuntime.setComposing(true);
  EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, pendingMarks);
  EDITOR_TO_USER_MARKS.set(editor, userMarks);

  try {
    applyEditableCompositionEnd({
      androidInputManagerRef: { current: null },
      editor,
      event: {
        currentTarget: firstRoot,
        data: '文',
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        nativeEvent: { data: '文', isTrusted: true },
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        target: {},
      } as unknown as CompositionEvent<HTMLDivElement>,
      inputController: firstRuntime.inputController,
      runOwnedDOMMutation: (callback) => callback(),
      scheduleTask: firstRuntime.domPhaseScheduler.schedule,
      setComposing: firstRuntime.setComposing,
    });
    applyEditableCompositionUpdate({
      editor,
      event: {
        currentTarget: firstRoot,
        data: '文',
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        nativeEvent: { data: '文', isTrusted: true },
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        target: {},
      } as unknown as CompositionEvent<HTMLDivElement>,
      inputController: firstRuntime.inputController,
      readOnly: true,
      setComposing: firstRuntime.setComposing,
    });

    expect(firstRuntime.inputController.state).toMatchObject({
      compositionSession: null,
      isComposing: false,
      pendingCompositionEnd: null,
    });
    expect(secondRuntime.inputController.state.isComposing).toBe(true);
    expect(ReactEditor.isComposing(editor)).toBe(true);
    expect(EDITOR_TO_PENDING_INSERTION_MARKS.get(editor)).toBe(pendingMarks);
    expect(EDITOR_TO_USER_MARKS.get(editor)).toBe(userMarks);
  } finally {
    hasEditableTarget.mockRestore();
    hasSelectableTarget.mockRestore();
    firstRuntime.destroy();
    secondRuntime.destroy();
  }
});

test('teardown clears Safari composition state after final beforeinput ended local composing', () => {
  const editor = createReactEditor();
  const runtime = new EditableDOMRuntime({ editor });

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'abcd' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  editor.update((tx) => tx.marks.set({ italic: true }));
  runtime.setRoot(document.createElement('div'));
  runtime.connect();
  beginEditableCompositionSession(runtime.inputController);
  runtime.setComposing(true);
  editor.update((tx) => tx.marks.set({ bold: true }));
  EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, { bold: true });
  EDITOR_TO_USER_MARKS.set(editor, { italic: true });

  runtime.setComposing(false);
  expect(runtime.inputController.state.compositionSession).not.toBeNull();
  runtime.destroy();

  expect(EDITOR_TO_PENDING_INSERTION_MARKS.has(editor)).toBe(false);
  expect(EDITOR_TO_USER_MARKS.has(editor)).toBe(false);
  expect(editor.read((state) => state.marks())).toEqual({ italic: true });
});

test('focus publication is owned once per logical runtime', () => {
  const editor = createReactEditor();
  const mainRuntime = new EditableDOMRuntime({ editor });
  const childRuntime = new EditableDOMRuntime({ editor });
  const listener = vi.fn();
  const unsubscribe = subscribeEditableRuntimeFocus(editor, listener);

  mainRuntime.publishFocusState();
  childRuntime.publishFocusState();
  expect(listener).toHaveBeenCalledTimes(2);

  unsubscribe();
  mainRuntime.publishFocusState();
  expect(listener).toHaveBeenCalledTimes(2);

  mainRuntime.destroy();
  childRuntime.destroy();
});

test('DOM sync mutation ownership expires with its mounted root runtime', () => {
  const runtime = new EditableDOMRuntime({ editor: createReactEditor() });
  const root = document.createElement('div');
  const target = document.createElement('span');
  const mutation = {
    attributeName: 'data-plite-path',
    target,
    type: 'attributes',
  } as MutationRecord;

  root.append(target);
  runtime.setRoot(root);
  runtime.connect();
  markDOMSyncMutationTarget(target, 'attributes', 'data-plite-path');

  expect(isDOMSyncMutation(mutation)).toBe(true);
  expect(runtime.domPhaseScheduler.pending()).toBe(1);

  runtime.destroy();

  expect(isDOMSyncMutation(mutation)).toBe(false);
  expect(runtime.domPhaseScheduler.pending()).toBe(0);
});

test('destroy cancels model selection DOM preference expiry', () => {
  const runtime = new EditableDOMRuntime({ editor: createReactEditor() });
  const root = document.createElement('div');
  const text = document.createTextNode('text');
  const selection = {
    kind: 'text',
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  } as const;

  root.append(text);
  document.body.append(root);
  runtime.setRoot(root);
  runtime.connect();
  runtime.writeCollapsedModelSelectionDOMPreference(selection, {
    node: text,
    offset: 0,
  });

  expect(runtime.domPhaseScheduler.pending()).toBe(1);

  runtime.destroy();

  expect(runtime.domPhaseScheduler.pending()).toBe(0);
  expect(
    runtime.readModelSelectionDOMPreference({ editorElement: root, selection })
  ).toBeNull();
  root.remove();
});

test('keeps one physical vertical goal across root runtimes until navigation changes', () => {
  const editor = createReactEditor();
  const mainRuntime = new EditableDOMRuntime({ editor });
  const childRuntime = new EditableDOMRuntime({ editor });
  const mainFocus = { path: [1, 0], offset: 4 } satisfies Point;
  const childFocus = {
    path: [0, 0],
    offset: 2,
    root: 'card:body',
  } satisfies Point;

  mainRuntime.connect();
  childRuntime.connect();
  mainRuntime.setVerticalGoalX(84, mainFocus);
  expect(childRuntime.readVerticalGoalX(mainFocus)).toBe(84);

  childRuntime.setVerticalGoalX(84, childFocus);
  expect(mainRuntime.readVerticalGoalX(childFocus)).toBe(84);

  expect(mainRuntime.readVerticalGoalX(mainFocus)).toBeNull();
  expect(childRuntime.readVerticalGoalX(childFocus)).toBeNull();

  mainRuntime.setVerticalGoalX(91, mainFocus);
  childRuntime.onUserInput();
  expect(mainRuntime.readVerticalGoalX(mainFocus)).toBeNull();

  mainRuntime.destroy();
  childRuntime.destroy();
});

test('reconnects the stable scheduler facade without duplicating root listeners', () => {
  const editor = createReactEditor();
  const runtime = new EditableDOMRuntime({ editor });
  const root = document.createElement('div');
  const addEventListener = vi.spyOn(root, 'addEventListener');
  const removeEventListener = vi.spyOn(root, 'removeEventListener');
  const scheduler = runtime.domPhaseScheduler;
  const scheduled = vi.fn();

  runtime.updateNativeInputHandlers({
    onDOMBeforeInput: () => {},
    onDOMInput: () => {},
  });
  runtime.setRoot(root);
  runtime.connect();
  runtime.connect();
  scheduler.schedule('model', 'first-connection', scheduled, {
    timing: 'immediate',
  });

  expect(scheduled).toHaveBeenCalledTimes(1);
  expect(scheduler.diagnostics().flushes).toBeGreaterThan(0);

  runtime.destroy();
  runtime.connect();

  expect(runtime.domPhaseScheduler).toBe(scheduler);
  scheduler.schedule('model', 'reconnected-root', scheduled, {
    timing: 'immediate',
  });
  expect(scheduled).toHaveBeenCalledTimes(2);
  expect(
    addEventListener.mock.calls.filter(([type]) => type === 'beforeinput')
  ).toHaveLength(2);
  expect(
    removeEventListener.mock.calls.filter(([type]) => type === 'beforeinput')
  ).toHaveLength(1);

  runtime.destroy();
});
