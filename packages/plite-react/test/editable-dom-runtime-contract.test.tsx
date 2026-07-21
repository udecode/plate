import type { Anchor, Point, Range } from '@platejs/plite';
import { renderHook } from '@testing-library/react';
import { type ReactNode, StrictMode } from 'react';
import {
  EditableDOMRuntime,
  subscribeEditableRuntimeFocus,
} from '../src/editable/editable-dom-runtime';
import {
  isDOMSyncMutation,
  markDOMSyncMutationTarget,
} from '../src/editable/dom-sync-mutation-ownership';
import { useEditableRootRuntimeState } from '../src/editable/runtime-root-state';
import { createReactEditor } from '../src/plugin/with-react';

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
