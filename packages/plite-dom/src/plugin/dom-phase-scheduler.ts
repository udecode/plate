import type { AnyEditor as Editor } from '@platejs/plite/internal';

import {
  EDITOR_TO_DOM_ROOT,
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
} from '../utils/weak-maps';

export type DOMPhase = 'model' | 'dom-read' | 'dom-write' | 'selection-repair';

export type DOMPhaseTiming =
  | 'animation-frame'
  | 'immediate'
  | 'microtask'
  | 'timeout';

export type DOMPhaseSchedulerDiagnostic = Readonly<{
  kind: 'loop-limit';
  labels: readonly string[];
  passes: number;
}>;

export type DOMPhaseSchedulerDiagnostics = Readonly<{
  flushes: number;
  lastFlushPhases: readonly DOMPhase[];
  loopLimitHits: number;
  loopRestarts: number;
  maxObservedPasses: number;
}>;

export type DOMPhaseScheduleOptions = Readonly<{
  delay?: number;
  key?: string;
  timing?: DOMPhaseTiming;
}>;

export type DOMPhaseScheduler = {
  destroy: () => void;
  diagnostics: () => DOMPhaseSchedulerDiagnostics;
  flush: () => void;
  pending: () => number;
  schedule: (
    phase: DOMPhase,
    label: string,
    callback: (frameTime?: number) => void,
    options?: DOMPhaseScheduleOptions
  ) => () => void;
};

type SchedulerWindow = Pick<
  Window,
  | 'cancelAnimationFrame'
  | 'clearTimeout'
  | 'queueMicrotask'
  | 'requestAnimationFrame'
  | 'setTimeout'
>;

type ScheduledDOMPhaseTask = {
  callback: (frameTime?: number) => void;
  cancelled: boolean;
  delay: number;
  id: number;
  key?: string;
  label: string;
  phase: DOMPhase;
  ready: boolean;
  timeoutHandle: number | null;
  timeoutWindow: SchedulerWindow | null;
  timing: DOMPhaseTiming;
};

type DOMPhaseSchedulerRegistration = Readonly<{
  editor: Editor;
  root: HTMLElement;
  scheduler: DOMPhaseScheduler;
}>;

const PHASE_ORDER: Record<DOMPhase, number> = {
  model: 0,
  'dom-read': 1,
  'dom-write': 2,
  'selection-repair': 3,
};

const ROOT_TO_DOM_PHASE_SCHEDULERS = new WeakMap<
  HTMLElement,
  DOMPhaseSchedulerRegistration[]
>();
const EDITOR_TO_FALLBACK_DOM_PHASE_SCHEDULERS = new WeakMap<
  Editor,
  Set<DOMPhaseScheduler>
>();
const EDITOR_TO_ROOT_FALLBACK_DOM_PHASE_SCHEDULERS = new WeakMap<
  Editor,
  WeakMap<HTMLElement, DOMPhaseScheduler>
>();
const EDITOR_TO_ROOTLESS_FALLBACK_DOM_PHASE_SCHEDULER = new WeakMap<
  Editor,
  DOMPhaseScheduler
>();

const resolveEditorDOMRoot = (editor: Editor) =>
  EDITOR_TO_ELEMENT.get(editor) ?? EDITOR_TO_DOM_ROOT.get(editor) ?? null;

const getGlobalWindow = (): SchedulerWindow | null =>
  typeof window === 'undefined' ? null : window;

export const createDOMPhaseScheduler = ({
  getWindow = getGlobalWindow,
  maxPasses = 5,
  onDiagnostic,
}: {
  getWindow?: () => SchedulerWindow | null | undefined;
  maxPasses?: number;
  onDiagnostic?: (diagnostic: DOMPhaseSchedulerDiagnostic) => void;
} = {}): DOMPhaseScheduler => {
  if (!Number.isInteger(maxPasses) || maxPasses < 1) {
    throw new RangeError('DOM phase scheduler maxPasses must be at least 1.');
  }

  const tasks: ScheduledDOMPhaseTask[] = [];
  const keyedTasks = new Map<string, ScheduledDOMPhaseTask>();
  let animationFrameHandle: number | null = null;
  let animationFrameUsesTimeout = false;
  let animationFrameWindow: SchedulerWindow | null = null;
  let destroyed = false;
  let flushing = false;
  let microtaskScheduled = false;
  let nextTaskId = 1;
  const mutableDiagnostics = {
    flushes: 0,
    lastFlushPhases: [] as DOMPhase[],
    loopLimitHits: 0,
    loopRestarts: 0,
    maxObservedPasses: 0,
  };

  const removeTask = (task: ScheduledDOMPhaseTask) => {
    const index = tasks.indexOf(task);

    if (index >= 0) tasks.splice(index, 1);
    if (task.key && keyedTasks.get(task.key) === task) {
      keyedTasks.delete(task.key);
    }
  };

  const clearTaskTimeout = (task: ScheduledDOMPhaseTask) => {
    if (task.timeoutHandle === null) return;

    if (task.timeoutWindow) {
      task.timeoutWindow.clearTimeout(task.timeoutHandle);
    } else globalThis.clearTimeout(task.timeoutHandle);
    task.timeoutHandle = null;
    task.timeoutWindow = null;
  };

  const cancelTask = (task: ScheduledDOMPhaseTask) => {
    if (task.cancelled) return;

    task.cancelled = true;
    clearTaskTimeout(task);
    removeTask(task);
    if (
      animationFrameHandle !== null &&
      !tasks.some(
        (candidate) =>
          !candidate.cancelled && candidate.timing === 'animation-frame'
      )
    ) {
      if (animationFrameUsesTimeout) {
        globalThis.clearTimeout(animationFrameHandle);
      } else {
        animationFrameWindow?.cancelAnimationFrame(animationFrameHandle);
      }
      animationFrameHandle = null;
      animationFrameUsesTimeout = false;
      animationFrameWindow = null;
    }
  };

  const markTimingReady = (timing: DOMPhaseTiming) => {
    for (const task of tasks) {
      if (!task.cancelled && task.timing === timing) task.ready = true;
    }
  };

  let flushReady = (_force = false, _frameTime?: number) => {};

  const scheduleMicrotaskFlush = () => {
    if (microtaskScheduled || destroyed) return;

    microtaskScheduled = true;
    const run = () => {
      microtaskScheduled = false;
      markTimingReady('microtask');
      flushReady();
    };
    const schedulerWindow = getWindow();

    if (schedulerWindow?.queueMicrotask) schedulerWindow.queueMicrotask(run);
    else if (typeof globalThis.queueMicrotask === 'function') {
      globalThis.queueMicrotask(run);
    } else {
      void Promise.resolve().then(run);
    }
  };

  const scheduleAnimationFrameFlush = () => {
    if (animationFrameHandle !== null || destroyed) return;

    const run = (frameTime: number) => {
      animationFrameHandle = null;
      animationFrameUsesTimeout = false;
      animationFrameWindow = null;
      markTimingReady('animation-frame');
      flushReady(false, frameTime);
    };
    const schedulerWindow = getWindow();

    if (schedulerWindow?.requestAnimationFrame) {
      animationFrameWindow = schedulerWindow;
      animationFrameHandle = schedulerWindow.requestAnimationFrame(run);
    } else {
      animationFrameUsesTimeout = true;
      animationFrameHandle = globalThis.setTimeout(
        run,
        16
      ) as unknown as number;
    }
  };

  const armTask = (task: ScheduledDOMPhaseTask) => {
    if (task.timing === 'immediate') {
      task.ready = true;
      if (!flushing) flushReady();
      return;
    }
    if (task.timing === 'microtask') {
      scheduleMicrotaskFlush();
      return;
    }
    if (task.timing === 'animation-frame') {
      scheduleAnimationFrameFlush();
      return;
    }

    const schedulerWindow = getWindow();
    const run = () => {
      task.timeoutHandle = null;
      task.timeoutWindow = null;
      if (task.cancelled) return;

      task.ready = true;
      flushReady();
    };

    task.timeoutHandle = schedulerWindow
      ? schedulerWindow.setTimeout(run, task.delay)
      : (globalThis.setTimeout(run, task.delay) as unknown as number);
    task.timeoutWindow = schedulerWindow ?? null;
  };

  flushReady = (force = false, frameTime?: number) => {
    if (destroyed || flushing) return;
    if (force) {
      for (const task of tasks) task.ready = !task.cancelled;
    }

    flushing = true;
    let firstError: unknown;
    let passes = 0;
    const executedPhases: DOMPhase[] = [];

    try {
      while (passes < maxPasses) {
        const ready = tasks
          .filter((task) => task.ready && !task.cancelled)
          .sort(
            (left, right) =>
              PHASE_ORDER[left.phase] - PHASE_ORDER[right.phase] ||
              left.id - right.id
          );

        if (ready.length === 0) break;

        passes += 1;
        for (const task of ready) {
          if (task.cancelled) continue;

          clearTaskTimeout(task);
          removeTask(task);
          executedPhases.push(task.phase);

          try {
            task.callback(frameTime);
          } catch (error) {
            firstError ??= error;
          }
        }
      }

      const stillReady = tasks.filter((task) => task.ready && !task.cancelled);

      if (stillReady.length > 0) {
        mutableDiagnostics.loopLimitHits += 1;
        const diagnostic = {
          kind: 'loop-limit',
          labels: Object.freeze(stillReady.map((task) => task.label)),
          passes,
        } as const;

        onDiagnostic?.(diagnostic);
        for (const task of stillReady) {
          task.ready = false;
          task.timing = 'animation-frame';
        }
        scheduleAnimationFrameFlush();
      }
    } finally {
      flushing = false;
      mutableDiagnostics.flushes += 1;
      mutableDiagnostics.lastFlushPhases = executedPhases;
      mutableDiagnostics.loopRestarts += Math.max(0, passes - 1);
      mutableDiagnostics.maxObservedPasses = Math.max(
        mutableDiagnostics.maxObservedPasses,
        passes
      );
    }

    if (firstError) throw firstError;
  };

  return {
    destroy() {
      if (destroyed) return;

      destroyed = true;
      if (animationFrameHandle !== null) {
        if (animationFrameUsesTimeout) {
          globalThis.clearTimeout(animationFrameHandle);
        } else {
          animationFrameWindow?.cancelAnimationFrame(animationFrameHandle);
        }
        animationFrameHandle = null;
        animationFrameUsesTimeout = false;
        animationFrameWindow = null;
      }
      for (const task of [...tasks]) cancelTask(task);
      keyedTasks.clear();
    },
    diagnostics: () =>
      Object.freeze({
        ...mutableDiagnostics,
        lastFlushPhases: Object.freeze([...mutableDiagnostics.lastFlushPhases]),
      }),
    flush: () => flushReady(true),
    pending: () => tasks.length,
    schedule(phase, label, callback, options = {}) {
      if (destroyed) return () => {};

      const existing = options.key ? keyedTasks.get(options.key) : undefined;

      if (existing) cancelTask(existing);

      const task: ScheduledDOMPhaseTask = {
        callback,
        cancelled: false,
        delay: options.delay ?? 0,
        id: nextTaskId++,
        ...(options.key ? { key: options.key } : {}),
        label,
        phase,
        ready: false,
        timeoutHandle: null,
        timeoutWindow: null,
        timing: options.timing ?? 'animation-frame',
      };

      tasks.push(task);
      if (task.key) keyedTasks.set(task.key, task);
      armTask(task);

      return () => cancelTask(task);
    },
  };
};

const getFallbackDOMPhaseScheduler = (
  editor: Editor,
  root: HTMLElement | null
) => {
  const rootSchedulers = root
    ? (EDITOR_TO_ROOT_FALLBACK_DOM_PHASE_SCHEDULERS.get(editor) ??
      new WeakMap())
    : null;
  const existing = root
    ? rootSchedulers?.get(root)
    : EDITOR_TO_ROOTLESS_FALLBACK_DOM_PHASE_SCHEDULER.get(editor);

  if (existing) return existing;

  const scheduler = createDOMPhaseScheduler({
    getWindow: () =>
      resolveEditorDOMRoot(editor)?.ownerDocument.defaultView ??
      EDITOR_TO_WINDOW.get(editor) ??
      getGlobalWindow(),
  });

  if (root) {
    rootSchedulers?.set(root, scheduler);
    if (rootSchedulers) {
      EDITOR_TO_ROOT_FALLBACK_DOM_PHASE_SCHEDULERS.set(editor, rootSchedulers);
    }
  } else {
    EDITOR_TO_ROOTLESS_FALLBACK_DOM_PHASE_SCHEDULER.set(editor, scheduler);
  }
  const schedulers =
    EDITOR_TO_FALLBACK_DOM_PHASE_SCHEDULERS.get(editor) ?? new Set();

  schedulers.add(scheduler);
  EDITOR_TO_FALLBACK_DOM_PHASE_SCHEDULERS.set(editor, schedulers);

  return scheduler;
};

/** Retire standalone work owned by one replaced DOM root. */
export const destroyEditorDOMPhaseSchedulerFallbackForRoot = (
  editor: Editor,
  root: HTMLElement | null
) => {
  const scheduler = root
    ? EDITOR_TO_ROOT_FALLBACK_DOM_PHASE_SCHEDULERS.get(editor)?.get(root)
    : EDITOR_TO_ROOTLESS_FALLBACK_DOM_PHASE_SCHEDULER.get(editor);

  if (!scheduler) return;

  scheduler.destroy();
  EDITOR_TO_FALLBACK_DOM_PHASE_SCHEDULERS.get(editor)?.delete(scheduler);
  if (root) {
    EDITOR_TO_ROOT_FALLBACK_DOM_PHASE_SCHEDULERS.get(editor)?.delete(root);
  } else {
    EDITOR_TO_ROOTLESS_FALLBACK_DOM_PHASE_SCHEDULER.delete(editor);
  }
  if (EDITOR_TO_FALLBACK_DOM_PHASE_SCHEDULERS.get(editor)?.size === 0) {
    EDITOR_TO_FALLBACK_DOM_PHASE_SCHEDULERS.delete(editor);
    EDITOR_TO_ROOT_FALLBACK_DOM_PHASE_SCHEDULERS.delete(editor);
    EDITOR_TO_ROOTLESS_FALLBACK_DOM_PHASE_SCHEDULER.delete(editor);
  }
};

/** Install the mounted root scheduler used by Plite DOM internals. */
export const installEditorDOMPhaseScheduler = (
  editor: Editor,
  root: HTMLElement,
  scheduler: DOMPhaseScheduler
) => {
  destroyEditorDOMPhaseSchedulerFallbackForRoot(editor, root);
  destroyEditorDOMPhaseSchedulerFallbackForRoot(editor, null);

  const registration = { editor, root, scheduler };
  const registrations = ROOT_TO_DOM_PHASE_SCHEDULERS.get(root) ?? [];

  registrations.push(registration);
  ROOT_TO_DOM_PHASE_SCHEDULERS.set(root, registrations);

  let active = true;

  return () => {
    if (!active) return;

    active = false;
    const current = ROOT_TO_DOM_PHASE_SCHEDULERS.get(root);
    const index = current?.indexOf(registration) ?? -1;

    if (index >= 0) current!.splice(index, 1);
    if (current?.length === 0) {
      ROOT_TO_DOM_PHASE_SCHEDULERS.delete(root);
    }
  };
};

/** Schedule DOM work through the mounted root or a disposable host fallback. */
export const scheduleEditorDOMPhase = (
  editor: Editor,
  phase: DOMPhase,
  label: string,
  callback: (frameTime?: number) => void,
  options?: DOMPhaseScheduleOptions
) => {
  const root = resolveEditorDOMRoot(editor);
  const registrations = root
    ? ROOT_TO_DOM_PHASE_SCHEDULERS.get(root)
    : undefined;
  const scheduler = registrations?.findLast(
    (registration) => registration.editor === editor
  )?.scheduler;

  if (scheduler) {
    return scheduler.schedule(phase, label, callback, options);
  }

  const fallbackScheduler = getFallbackDOMPhaseScheduler(editor, root);

  return fallbackScheduler.schedule(
    phase,
    label,
    (frameTime) => {
      if (resolveEditorDOMRoot(editor) !== root) return;

      callback(frameTime);
    },
    options
  );
};

/** Destroy only the standalone fallback owned by the DOM extension. */
export const destroyEditorDOMPhaseSchedulerFallback = (editor: Editor) => {
  EDITOR_TO_FALLBACK_DOM_PHASE_SCHEDULERS.get(editor)?.forEach((scheduler) => {
    scheduler.destroy();
  });
  EDITOR_TO_FALLBACK_DOM_PHASE_SCHEDULERS.delete(editor);
  EDITOR_TO_ROOT_FALLBACK_DOM_PHASE_SCHEDULERS.delete(editor);
  EDITOR_TO_ROOTLESS_FALLBACK_DOM_PHASE_SCHEDULER.delete(editor);
};
