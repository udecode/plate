import type { AnyEditor } from '@platejs/plite/internal';

import {
  type DOMRootFactOverrides,
  type DOMRootQuirk,
  type ResolvedDOMRootFacts,
  resolveDOMRootFacts,
} from '../utils/environment';
import {
  classifyDOMBeforeInputIntent,
  DOMInputRuntime,
  isDOMInputDestructiveEditingCommand,
  isDOMInputEditingEpochCommand,
  resolveDOMInputKernelState,
  resolveDOMInputRepairPolicy,
  resolveDOMInputSelectionChangeOwnership,
  resolveDOMInputSelectionPolicy,
  resolveDOMInputTransition,
} from './dom-input-runtime';
import {
  DOMIntegrityObserver,
  type DOMIntegrityDiagnostics,
  type DOMIntegrityMutationOwner,
  type DOMIntegrityObserverOptions,
} from './dom-integrity-observer';
import {
  createDOMPhaseScheduler,
  type DOMPhaseScheduler,
  type DOMPhaseSchedulerDiagnostics,
  installEditorDOMPhaseScheduler,
} from './dom-phase-scheduler';
import { DOMSyncMutationOwnership } from './dom-sync-mutation-ownership';

type MutableCell<T> = { current: T };

type DOMRootRuntimeLifecycle<TRoot extends HTMLElement> = {
  afterRootMount?: (root: TRoot | null) => void;
  beforeRootTeardown?: (root: TRoot | null) => void;
  onDestroy?: () => void;
};

export type DOMRootRuntimeOptions<TRoot extends HTMLElement> = Omit<
  DOMIntegrityObserverOptions,
  'consumeOwnedMutation' | 'schedule'
> &
  DOMRootRuntimeLifecycle<TRoot> & {
    adapter: object;
    editor: AnyEditor;
    testRootFacts?: DOMRootFactOverrides;
  };

const EMPTY_SCHEDULER_DIAGNOSTICS: DOMPhaseSchedulerDiagnostics = Object.freeze(
  {
    flushes: 0,
    lastFlushPhases: Object.freeze([]),
    loopLimitHits: 0,
    loopRestarts: 0,
    maxObservedPasses: 0,
  }
);

const DOM_ROOT_RUNTIME_BY_ROOT = new WeakMap<HTMLElement, DOMRootRuntime>();
const DOM_ROOT_RUNTIMES_BY_EDITOR = new WeakMap<
  AnyEditor,
  Set<DOMRootRuntime>
>();
const ACTIVE_DOM_ROOT_RUNTIME_BY_EDITOR = new WeakMap<
  AnyEditor,
  DOMRootRuntime
>();
const DETACHED_DOM_INPUT_RUNTIME_BY_EDITOR = new WeakMap<
  AnyEditor,
  DOMInputRuntime
>();
const ELEMENT_NODE = 1;

const asElement = (node: Node): Element | null =>
  node.nodeType === ELEMENT_NODE ? (node as Element) : node.parentElement;

const runAllDOMRootRuntimeSteps = (steps: ReadonlyArray<() => void>) => {
  let firstError: unknown;

  for (const step of steps) {
    try {
      step();
    } catch (error) {
      firstError ??= error;
    }
  }

  // oxlint-disable-next-line typescript/only-throw-error -- Teardown must rethrow the first host-owned failure without changing its identity.
  if (firstError) throw firstError;
};

const captureDOMRootRuntimeSteps = (steps: ReadonlyArray<() => void>) => {
  try {
    runAllDOMRootRuntimeSteps(steps);
  } catch (error) {
    return error;
  }

  return null;
};

const activateDOMRootRuntimeSteps = (steps: ReadonlyArray<() => void>) => {
  for (const step of steps) {
    try {
      step();
    } catch (error) {
      return error;
    }
  }

  return null;
};

/** Resolve the private root runtime that owns a DOM interaction target. */
export const findDOMRootRuntime = (node: Node): DOMRootRuntime | null => {
  let element = asElement(node);

  while (element) {
    const runtime = DOM_ROOT_RUNTIME_BY_ROOT.get(element as HTMLElement);

    if (runtime) return runtime;

    const rootNode = element.getRootNode();

    element =
      element.parentElement ??
      ('host' in rootNode ? (rootNode.host as Element) : null);
  }

  return null;
};

const isRuntimeRootActive = (runtime: DOMRootRuntime) => {
  const root = runtime.rootRef.current;

  if (!root) return false;

  const rootNode = root.getRootNode() as Document | ShadowRoot;
  const activeElement =
    'activeElement' in rootNode
      ? rootNode.activeElement
      : root.ownerDocument.activeElement;

  return (
    activeElement === root || (!!activeElement && root.contains(activeElement))
  );
};

/** Resolve the focused private root runtime for an editor. */
export const findEditorDOMRootRuntime = (
  editor: AnyEditor
): DOMRootRuntime | null => {
  const activeRuntime = ACTIVE_DOM_ROOT_RUNTIME_BY_EDITOR.get(editor);

  if (
    activeRuntime?.connected &&
    activeRuntime.rootRef.current &&
    isRuntimeRootActive(activeRuntime)
  ) {
    return activeRuntime;
  }

  ACTIVE_DOM_ROOT_RUNTIME_BY_EDITOR.delete(editor);
  const runtimes = DOM_ROOT_RUNTIMES_BY_EDITOR.get(editor);

  if (runtimes?.size !== 1) return null;

  const runtime = runtimes.values().next().value;

  return runtime?.connected && runtime.rootRef.current ? runtime : null;
};

/**
 * Renderer-neutral lifecycle owner for one mounted DOM root.
 *
 * This type is available only through the package's internal entrypoint.
 */
export class DOMRootRuntime<TRoot extends HTMLElement = HTMLElement> {
  static readonly classifyBeforeInputIntent = classifyDOMBeforeInputIntent;

  static readonly isDestructiveInputCommand =
    isDOMInputDestructiveEditingCommand;

  static readonly isInputEditingEpochCommand = isDOMInputEditingEpochCommand;

  static readonly createDetachedInputRuntime = () =>
    new DOMInputRuntime({
      getGeneration: () => 0,
      getRoot: () => 'main',
    });

  static readonly resolveInputRuntime = (editor: AnyEditor) => {
    const mountedRuntime = findEditorDOMRootRuntime(editor);

    if (mountedRuntime) return mountedRuntime.domInputRuntime;

    const detachedRuntime =
      DETACHED_DOM_INPUT_RUNTIME_BY_EDITOR.get(editor) ??
      DOMRootRuntime.createDetachedInputRuntime();

    DETACHED_DOM_INPUT_RUNTIME_BY_EDITOR.set(editor, detachedRuntime);

    return detachedRuntime;
  };

  static readonly resolveInputRepairPolicy = resolveDOMInputRepairPolicy;

  static readonly resolveInputKernelState = resolveDOMInputKernelState;

  static readonly resolveInputSelectionChangeOwnership =
    resolveDOMInputSelectionChangeOwnership;

  static readonly resolveInputSelectionPolicy = resolveDOMInputSelectionPolicy;

  static readonly resolveInputTransition = resolveDOMInputTransition;

  readonly adapter: object;

  readonly domIntegrityObserver: DOMIntegrityObserver;

  readonly domInputRuntime: DOMInputRuntime;

  readonly domPhaseScheduler: DOMPhaseScheduler;

  readonly domSyncMutationOwnership: DOMSyncMutationOwnership;

  readonly rootRef: MutableCell<TRoot | null> = { current: null };

  connected = false;

  generation = 0;

  private facts: ResolvedDOMRootFacts | null = null;

  private readonly factListeners = new Set<() => void>();

  private readonly disposables = new Map<string, () => void>();

  private readonly editor: AnyEditor;

  private readonly lifecycle: DOMRootRuntimeLifecycle<TRoot>;

  private readonly testRootFacts: DOMRootFactOverrides | undefined;

  private destroyed = false;

  private schedulerImplementation: DOMPhaseScheduler | null;

  private rootInputActivationCleanup: (() => void) | null = null;

  private uninstallDOMPhaseScheduler: (() => void) | null = null;

  constructor(options: DOMRootRuntimeOptions<TRoot>) {
    this.adapter = options.adapter;
    this.editor = options.editor;
    this.lifecycle = {
      afterRootMount: options.afterRootMount,
      beforeRootTeardown: options.beforeRootTeardown,
      onDestroy: options.onDestroy,
    };
    this.domInputRuntime = new DOMInputRuntime({
      getGeneration: () => this.generation,
      getRoot: () =>
        this.rootRef.current?.getAttribute('data-plite-root') ?? 'main',
    });
    this.testRootFacts = options.testRootFacts;
    this.schedulerImplementation = this.createScheduler();
    this.domSyncMutationOwnership = new DOMSyncMutationOwnership(
      (phase, label, callback, scheduleOptions) =>
        this.schedulerImplementation?.schedule(
          phase,
          label,
          callback,
          scheduleOptions
        ) ?? (() => {})
    );
    this.domIntegrityObserver = new DOMIntegrityObserver({
      getAndroidMutationHandler: options.getAndroidMutationHandler,
      isAndroidMutationOwned: options.isAndroidMutationOwned,
      isCanonicalTextMutation: options.isCanonicalTextMutation,
      isComposing: options.isComposing,
      ...(options.maxRepairPassesPerFrame === undefined
        ? {}
        : { maxRepairPassesPerFrame: options.maxRepairPassesPerFrame }),
      consumeOwnedMutation: (mutation) =>
        this.domSyncMutationOwnership.consume(mutation),
      onRepair: options.onRepair,
      resolvePath: options.resolvePath,
      schedule: (callback, scheduleOptions) =>
        this.schedulerImplementation?.schedule(
          'dom-write',
          'dom-integrity-repair',
          callback,
          scheduleOptions
        ) ?? (() => {}),
    });
    this.domPhaseScheduler = {
      destroy: () => {
        this.destroyScheduler();
      },
      diagnostics: () =>
        this.schedulerImplementation?.diagnostics() ??
        EMPTY_SCHEDULER_DIAGNOSTICS,
      flush: () => this.schedulerImplementation?.flush(),
      pending: () => this.schedulerImplementation?.pending() ?? 0,
      schedule: (phase, label, callback, scheduleOptions) => {
        const { generation } = this;
        const scheduledCallback = (frameTime?: number) => {
          if (generation !== this.generation) return;

          if (phase === 'dom-write') {
            this.domIntegrityObserver.runOwned('scheduler', () => {
              callback(frameTime);
            });
          } else {
            callback(frameTime);
          }
        };

        return (
          this.schedulerImplementation?.schedule(
            phase,
            label,
            scheduledCallback,
            scheduleOptions
          ) ?? (() => {})
        );
      },
    };
  }

  connect() {
    if (this.connected) return;

    this.destroyed = false;
    if (!this.schedulerImplementation) {
      this.schedulerImplementation = this.createScheduler();
    }

    this.connected = true;
    const activationError = activateDOMRootRuntimeSteps([
      () => {
        this.installDOMPhaseScheduler();
      },
      () => {
        this.registerRootOwner();
      },
      () => {
        this.domSyncMutationOwnership.connect(this.rootRef.current);
      },
      () => {
        this.domIntegrityObserver.connect(this.rootRef.current);
      },
      () => this.lifecycle.afterRootMount?.(this.rootRef.current),
    ]);

    if (!activationError) return;

    this.connected = false;
    this.generation += 1;
    captureDOMRootRuntimeSteps([
      () => this.lifecycle.beforeRootTeardown?.(this.rootRef.current),
      () => {
        this.unregisterRootOwner();
      },
      () => {
        this.domInputRuntime.reset();
      },
      () => {
        this.domIntegrityObserver.destroy();
      },
      () => {
        this.domSyncMutationOwnership.destroy();
      },
      () => {
        this.destroyScheduler();
      },
    ]);
    // oxlint-disable-next-line typescript/only-throw-error -- Activation rollback must preserve the host-owned failure value unchanged.
    throw activationError;
  }

  destroy() {
    if (this.destroyed) return;

    const disposables = [...this.disposables.values()];

    this.destroyed = true;
    this.connected = false;
    this.generation += 1;
    this.disposables.clear();
    runAllDOMRootRuntimeSteps([
      () => this.lifecycle.beforeRootTeardown?.(this.rootRef.current),
      () => {
        this.unregisterRootOwner();
      },
      () => {
        this.domInputRuntime.reset();
      },
      () => {
        this.domIntegrityObserver.destroy();
      },
      () => {
        this.domSyncMutationOwnership.destroy();
      },
      () => {
        runAllDOMRootRuntimeSteps(disposables);
      },
      () => this.lifecycle.onDestroy?.(),
      () => {
        this.destroyScheduler();
      },
    ]);
  }

  diagnostics(): DOMIntegrityDiagnostics {
    return this.domIntegrityObserver.diagnostics();
  }

  get hostLanguage() {
    return this.facts?.language ?? '';
  }

  get isAndroidHost() {
    return this.facts?.platform === 'android';
  }

  get isAppleHost() {
    return this.facts?.platform === 'apple';
  }

  get isBlinkHost() {
    return this.facts?.engine === 'blink';
  }

  get isGeckoHost() {
    return this.facts?.engine === 'gecko';
  }

  get isWebKitHost() {
    return this.facts?.engine === 'webkit';
  }

  get supportsBeforeInput() {
    return this.facts?.beforeInput ?? false;
  }

  hasHostQuirk(quirk: DOMRootQuirk) {
    return this.facts?.quirks.has(quirk) ?? false;
  }

  readonly subscribeHostFacts = (listener: () => void) => {
    this.factListeners.add(listener);

    return () => {
      this.factListeners.delete(listener);
    };
  };

  installDisposable(key: string, dispose: () => void) {
    this.releaseDisposable(key);
    this.disposables.set(key, dispose);

    return () => {
      if (this.disposables.get(key) !== dispose) return;

      this.disposables.delete(key);
      dispose();
    };
  }

  prepareHostCommit() {
    this.domIntegrityObserver.pauseForHostCommit();
  }

  completeHostCommit() {
    this.domIntegrityObserver.resumeAfterHostCommit();
  }

  claimHostCommit() {
    this.domIntegrityObserver.discardPending('host');
  }

  releaseDisposable(key: string) {
    const dispose = this.disposables.get(key);

    if (!dispose) return;

    this.disposables.delete(key);
    dispose();
  }

  runOwnedDOMMutation<T>(
    owner: DOMIntegrityMutationOwner,
    callback: () => T
  ): T {
    return this.domIntegrityObserver.runOwned(owner, callback);
  }

  setRoot(root: TRoot | null) {
    if (this.rootRef.current === root) return;

    const previousRoot = this.rootRef.current;
    const previousFacts = this.facts;

    this.generation += 1;
    const teardownError = captureDOMRootRuntimeSteps([
      () => this.lifecycle.beforeRootTeardown?.(this.rootRef.current),
      () => {
        this.domInputRuntime.reset();
      },
      () => {
        this.unregisterRootOwner();
      },
      () => {
        this.destroyScheduler();
      },
      () => {
        this.rootRef.current = root;
        this.facts = root
          ? resolveDOMRootFacts(
              root.getRootNode() as Document | ShadowRoot,
              this.testRootFacts
            )
          : null;
      },
    ]);
    const activationError = activateDOMRootRuntimeSteps([
      () => {
        this.installDOMPhaseScheduler();
      },
      () => {
        this.registerRootOwner();
      },
      () => {
        this.domSyncMutationOwnership.setRoot(root);
      },
      () => {
        this.domIntegrityObserver.setRoot(root);
      },
      () => this.lifecycle.afterRootMount?.(root),
      () => {
        this.publishHostFacts();
      },
    ]);

    if (activationError) {
      captureDOMRootRuntimeSteps([
        () => this.lifecycle.beforeRootTeardown?.(root),
        () => {
          this.unregisterRootOwner();
        },
        () => {
          this.domIntegrityObserver.setRoot(null);
        },
        () => {
          this.domSyncMutationOwnership.setRoot(null);
        },
        () => {
          this.destroyScheduler();
        },
        () => {
          this.rootRef.current = previousRoot;
          this.facts = previousFacts;
        },
        () => {
          this.installDOMPhaseScheduler();
        },
        () => {
          this.registerRootOwner();
        },
        () => {
          this.domSyncMutationOwnership.setRoot(previousRoot);
        },
        () => {
          this.domIntegrityObserver.setRoot(previousRoot);
        },
        () => this.lifecycle.afterRootMount?.(previousRoot),
        () => {
          this.publishHostFacts();
        },
      ]);
    }

    // oxlint-disable-next-line typescript/only-throw-error -- Root replacement must preserve the captured teardown failure unchanged.
    if (teardownError) throw teardownError;
    // oxlint-disable-next-line typescript/only-throw-error -- Root replacement must preserve the captured activation failure unchanged.
    if (activationError) throw activationError;
  }

  private createScheduler() {
    return createDOMPhaseScheduler({
      getWindow: () => this.rootRef.current?.ownerDocument.defaultView,
    });
  }

  private destroyScheduler() {
    const uninstall = this.uninstallDOMPhaseScheduler;
    const scheduler = this.schedulerImplementation;

    this.uninstallDOMPhaseScheduler = null;
    this.schedulerImplementation = null;
    runAllDOMRootRuntimeSteps([
      () => uninstall?.(),
      () => scheduler?.destroy(),
    ]);
  }

  private installDOMPhaseScheduler() {
    const root = this.rootRef.current;

    if (!this.connected || !root) return;
    if (!this.schedulerImplementation) {
      this.schedulerImplementation = this.createScheduler();
    }

    this.uninstallDOMPhaseScheduler?.();
    this.uninstallDOMPhaseScheduler = installEditorDOMPhaseScheduler(
      this.editor,
      root,
      this.domPhaseScheduler
    );
  }

  private registerRootOwner() {
    const root = this.rootRef.current;

    if (this.connected && root) {
      const runtime = this as unknown as DOMRootRuntime;
      const currentOwner = DOM_ROOT_RUNTIME_BY_ROOT.get(root);

      if (currentOwner && currentOwner !== runtime) {
        throw new Error('A DOM root cannot have more than one active runtime.');
      }

      DOM_ROOT_RUNTIME_BY_ROOT.set(root, runtime);
      const editorRuntimes =
        DOM_ROOT_RUNTIMES_BY_EDITOR.get(this.editor) ?? new Set();

      editorRuntimes.add(runtime);
      DOM_ROOT_RUNTIMES_BY_EDITOR.set(this.editor, editorRuntimes);
      DETACHED_DOM_INPUT_RUNTIME_BY_EDITOR.delete(this.editor);
      const markInputRuntimeActive = () => {
        ACTIVE_DOM_ROOT_RUNTIME_BY_EDITOR.set(this.editor, runtime);
      };

      root.addEventListener('focusin', markInputRuntimeActive);
      root.addEventListener('pointerdown', markInputRuntimeActive);
      this.rootInputActivationCleanup = () => {
        root.removeEventListener('focusin', markInputRuntimeActive);
        root.removeEventListener('pointerdown', markInputRuntimeActive);
      };
      if (isRuntimeRootActive(runtime)) markInputRuntimeActive();
    }
  }

  private unregisterRootOwner() {
    this.rootInputActivationCleanup?.();
    this.rootInputActivationCleanup = null;
    const root = this.rootRef.current;

    if (
      root &&
      DOM_ROOT_RUNTIME_BY_ROOT.get(root) === (this as unknown as DOMRootRuntime)
    ) {
      DOM_ROOT_RUNTIME_BY_ROOT.delete(root);
    }

    const editorRuntimes = DOM_ROOT_RUNTIMES_BY_EDITOR.get(this.editor);

    editorRuntimes?.delete(this as unknown as DOMRootRuntime);
    if (
      ACTIVE_DOM_ROOT_RUNTIME_BY_EDITOR.get(this.editor) ===
      (this as unknown as DOMRootRuntime)
    ) {
      ACTIVE_DOM_ROOT_RUNTIME_BY_EDITOR.delete(this.editor);
    }
    if (editorRuntimes?.size === 0) {
      DOM_ROOT_RUNTIMES_BY_EDITOR.delete(this.editor);
    }
  }

  private publishHostFacts() {
    for (const listener of this.factListeners) {
      listener();
    }
  }
}
