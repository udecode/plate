import { expect, mock, test } from 'bun:test';
import type { Editor } from '@platejs/plite';

import {
  createDOMPhaseScheduler,
  destroyEditorDOMPhaseSchedulerFallback,
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  installEditorDOMPhaseScheduler,
  scheduleEditorDOMPhase,
  setEditorDOMRootElement,
  type DOMPhaseScheduler,
} from '../src/internal';

const createSchedulerWindow = () => {
  const animationFrames: Array<() => void> = [];
  const microtasks: Array<() => void> = [];
  const timeouts = new Map<number, () => void>();
  let nextHandle = 1;

  return {
    animationFrames,
    flushAnimationFrame() {
      for (const callback of animationFrames.splice(0)) callback();
    },
    flushMicrotasks() {
      for (const callback of microtasks.splice(0)) callback();
    },
    schedulerWindow: {
      cancelAnimationFrame: (handle: number) => {
        animationFrames.splice(handle - 1, 1);
      },
      clearTimeout: (handle: number) => {
        timeouts.delete(handle);
      },
      queueMicrotask: (callback: () => void) => {
        microtasks.push(callback);
      },
      requestAnimationFrame: (callback: () => void) => {
        animationFrames.push(callback);
        return animationFrames.length;
      },
      setTimeout: (callback: () => void) => {
        const handle = nextHandle++;

        timeouts.set(handle, callback);
        return handle;
      },
    } as unknown as Window,
    timeouts,
  };
};

test('DOM phase scheduler orders one frame by model, read, write, repair', () => {
  const fake = createSchedulerWindow();
  const scheduler = createDOMPhaseScheduler({
    getWindow: () => fake.schedulerWindow,
  });
  const order: string[] = [];

  scheduler.schedule('selection-repair', 'selection', () =>
    order.push('selection')
  );
  scheduler.schedule('dom-write', 'write', () => order.push('write'));
  scheduler.schedule('model', 'model', () => order.push('model'));
  scheduler.schedule('dom-read', 'read', () => order.push('read'));

  expect(fake.animationFrames).toHaveLength(1);
  fake.flushAnimationFrame();
  expect(order).toEqual(['model', 'read', 'write', 'selection']);
  expect(scheduler.diagnostics().lastFlushPhases).toEqual([
    'model',
    'dom-read',
    'dom-write',
    'selection-repair',
  ]);
});

test('DOM phase scheduler coalesces keyed work and cancels stale tasks', () => {
  const fake = createSchedulerWindow();
  const scheduler = createDOMPhaseScheduler({
    getWindow: () => fake.schedulerWindow,
  });
  const calls: string[] = [];

  scheduler.schedule('dom-write', 'stale', () => calls.push('stale'), {
    key: 'render',
  });
  scheduler.schedule('dom-write', 'latest', () => calls.push('latest'), {
    key: 'render',
  });
  const cancel = scheduler.schedule('selection-repair', 'cancelled', () =>
    calls.push('cancelled')
  );

  cancel();
  fake.flushAnimationFrame();
  expect(calls).toEqual(['latest']);
  expect(scheduler.pending()).toBe(0);
});

test('DOM phase scheduler skips ready work cancelled by an earlier phase', () => {
  const fake = createSchedulerWindow();
  const scheduler = createDOMPhaseScheduler({
    getWindow: () => fake.schedulerWindow,
  });
  const calls: string[] = [];
  const cancelWrite = scheduler.schedule('dom-write', 'write', () =>
    calls.push('write')
  );

  scheduler.schedule('model', 'model', () => {
    calls.push('model');
    cancelWrite();
  });

  fake.flushAnimationFrame();
  expect(calls).toEqual(['model']);
  expect(scheduler.pending()).toBe(0);
});

test('DOM phase scheduler bounds recursive flush loops and reports them', () => {
  const fake = createSchedulerWindow();
  const diagnostics: string[][] = [];
  const scheduler = createDOMPhaseScheduler({
    getWindow: () => fake.schedulerWindow,
    maxPasses: 3,
    onDiagnostic: (diagnostic) => {
      diagnostics.push([...diagnostic.labels]);
    },
  });
  let calls = 0;
  const reschedule = () => {
    calls += 1;
    scheduler.schedule('model', `loop-${calls}`, reschedule, {
      timing: 'immediate',
    });
  };

  scheduler.schedule('model', 'loop-0', reschedule, { timing: 'immediate' });

  expect(calls).toBe(3);
  expect(diagnostics).toEqual([['loop-3']]);
  expect(scheduler.diagnostics()).toMatchObject({
    loopLimitHits: 1,
    loopRestarts: 2,
    maxObservedPasses: 3,
  });
  expect(fake.animationFrames).toHaveLength(1);
  scheduler.destroy();
  expect(scheduler.pending()).toBe(0);
});

test('DOM phase scheduler cancels timing handles through their original window', () => {
  const first = createSchedulerWindow();
  const second = createSchedulerWindow();
  let currentWindow = first.schedulerWindow;
  const scheduler = createDOMPhaseScheduler({
    getWindow: () => currentWindow,
  });
  const cancelTimeout = scheduler.schedule('model', 'timeout', () => {}, {
    timing: 'timeout',
  });

  expect(first.timeouts.size).toBe(1);
  currentWindow = second.schedulerWindow;
  cancelTimeout();
  expect(first.timeouts.size).toBe(0);
  expect(second.timeouts.size).toBe(0);

  currentWindow = first.schedulerWindow;
  const cancelFrame = scheduler.schedule('dom-write', 'frame', () => {});

  expect(first.animationFrames).toHaveLength(1);
  currentWindow = second.schedulerWindow;
  cancelFrame();
  expect(first.animationFrames).toHaveLength(0);
  expect(second.animationFrames).toHaveLength(0);
});

test('mounted schedulers route by root and teardown cannot remove a sibling root', () => {
  const editor = {} as Editor;
  const firstRoot = document.createElement('div');
  const secondRoot = document.createElement('div');
  const firstSchedule = mock(() => () => {});
  const secondSchedule = mock(() => () => {});
  const createRecordingScheduler = (
    schedule: typeof firstSchedule
  ): DOMPhaseScheduler => ({
    destroy: () => {},
    diagnostics: () => ({
      flushes: 0,
      lastFlushPhases: [],
      loopLimitHits: 0,
      loopRestarts: 0,
      maxObservedPasses: 0,
    }),
    flush: () => {},
    pending: () => 0,
    schedule,
  });
  const uninstallFirst = installEditorDOMPhaseScheduler(
    editor,
    firstRoot,
    createRecordingScheduler(firstSchedule)
  );
  const uninstallSecond = installEditorDOMPhaseScheduler(
    editor,
    secondRoot,
    createRecordingScheduler(secondSchedule)
  );

  EDITOR_TO_ELEMENT.set(editor, firstRoot);
  scheduleEditorDOMPhase(editor, 'dom-write', 'first-root', () => {});
  expect(firstSchedule).toHaveBeenCalledTimes(1);
  expect(secondSchedule).not.toHaveBeenCalled();

  EDITOR_TO_ELEMENT.set(editor, secondRoot);
  scheduleEditorDOMPhase(editor, 'dom-write', 'second-root', () => {});
  expect(secondSchedule).toHaveBeenCalledTimes(1);

  uninstallFirst();
  scheduleEditorDOMPhase(editor, 'dom-write', 'surviving-root', () => {});
  expect(secondSchedule).toHaveBeenCalledTimes(2);

  uninstallSecond();
  EDITOR_TO_ELEMENT.delete(editor);
});

test('destroying the standalone fallback cancels its queued host work', () => {
  const editor = {} as Editor;
  const fake = createSchedulerWindow();
  const callback = mock();

  EDITOR_TO_WINDOW.set(editor, fake.schedulerWindow as Window);
  scheduleEditorDOMPhase(editor, 'dom-write', 'fallback', callback);
  expect(fake.animationFrames).toHaveLength(1);

  destroyEditorDOMPhaseSchedulerFallback(editor);
  fake.flushAnimationFrame();
  expect(callback).not.toHaveBeenCalled();
});

test('mounting one root does not cancel a sibling root fallback queue', async () => {
  const editor = {} as Editor;
  const fallbackRoot = document.createElement('div');
  const mountedRoot = document.createElement('div');
  const callback = mock();
  const mountedSchedule = mock(() => () => {});
  const mountedScheduler: DOMPhaseScheduler = {
    destroy: () => {},
    diagnostics: () => ({
      flushes: 0,
      lastFlushPhases: [],
      loopLimitHits: 0,
      loopRestarts: 0,
      maxObservedPasses: 0,
    }),
    flush: () => {},
    pending: () => 0,
    schedule: mountedSchedule,
  };

  EDITOR_TO_ELEMENT.set(editor, fallbackRoot);
  scheduleEditorDOMPhase(editor, 'dom-write', 'fallback-root', callback, {
    timing: 'microtask',
  });

  const uninstall = installEditorDOMPhaseScheduler(
    editor,
    mountedRoot,
    mountedScheduler
  );

  await new Promise<void>((resolve) => window.queueMicrotask(resolve));

  expect(callback).toHaveBeenCalledTimes(1);
  expect(mountedSchedule).not.toHaveBeenCalled();

  uninstall();
  destroyEditorDOMPhaseSchedulerFallback(editor);
  EDITOR_TO_ELEMENT.delete(editor);
});

test('standalone root replacement retires queued work from the old root', async () => {
  const editor = {} as Editor;
  const firstRoot = document.createElement('div');
  const secondRoot = document.createElement('div');
  const oldRootCallback = mock();
  const newRootCallback = mock();

  setEditorDOMRootElement(editor, firstRoot);
  scheduleEditorDOMPhase(editor, 'dom-write', 'old-root', oldRootCallback, {
    timing: 'microtask',
  });
  setEditorDOMRootElement(editor, secondRoot);

  await new Promise<void>((resolve) => window.queueMicrotask(resolve));
  expect(oldRootCallback).not.toHaveBeenCalled();

  scheduleEditorDOMPhase(editor, 'dom-write', 'new-root', newRootCallback, {
    timing: 'microtask',
  });
  await new Promise<void>((resolve) => window.queueMicrotask(resolve));
  expect(newRootCallback).toHaveBeenCalledTimes(1);

  setEditorDOMRootElement(editor, null);
});

test('fallback callbacks fail closed when the editor root changes directly', async () => {
  const editor = {} as Editor;
  const firstRoot = document.createElement('div');
  const secondRoot = document.createElement('div');
  const callback = mock();

  EDITOR_TO_ELEMENT.set(editor, firstRoot);
  scheduleEditorDOMPhase(editor, 'dom-write', 'stale-root', callback, {
    timing: 'microtask',
  });
  EDITOR_TO_ELEMENT.set(editor, secondRoot);

  await new Promise<void>((resolve) => window.queueMicrotask(resolve));
  expect(callback).not.toHaveBeenCalled();

  destroyEditorDOMPhaseSchedulerFallback(editor);
  EDITOR_TO_ELEMENT.delete(editor);
});
