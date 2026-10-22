import {
  getEditorRuntimeOwner,
  getEditorRuntimeRoot,
  hasEditorRuntime,
} from '../../core/editor-runtime';
import { subscribeSource } from '../../core/listener-state';
import { toInternalRoot } from '../../core/public-root';
import { getBaseCallRoot, setEditorFocused } from '../../core/public-state';
import { getCaretOwner, subscribeCaretOwner } from '../../core/view-carets';
import type { ViewPresentation } from '../../core/view-presentation';
import { getOwnViewPresentation } from '../../editor-runtime-view';
import type { AnyEditor, Editor, RootKey } from '../../interfaces/editor';
import {
  type DOMRootFactOverrides,
  type DOMRootQuirk,
  type ResolvedDOMRootFacts,
  resolveDOMRootFacts,
} from '../utils/environment';
import { EDITOR_TO_DOM_SCOPE_LISTENERS, IS_FOCUSED } from '../utils/weak-maps';
import {
  createDOMCoverageSession,
  type DOMCoverageBoundary,
  type DOMCoverageSession,
} from './dom-coverage';
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
  'consumeOwnedMutation' | 'onDOMChange' | 'schedule'
> &
  DOMRootRuntimeLifecycle<TRoot> & {
    adapter: object;
    editor: AnyEditor;
    onRegisterBoundary?: (boundary: DOMCoverageBoundary) => void;
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

type MountedViews = {
  readonly topDocuments: Map<Document, Set<DOMRootRuntime>>;
  readonly views: Set<AnyEditor>;
};

const DOM_ROOT_RUNTIME_BY_ROOT = new WeakMap<HTMLElement, DOMRootRuntime>();
const DOM_ROOT_RUNTIMES_BY_EDITOR = new WeakMap<object, Set<DOMRootRuntime>>();
const ACTIVE_DOM_ROOT_RUNTIME_BY_EDITOR = new WeakMap<object, DOMRootRuntime>();
const MOUNTED_VIEWS_BY_DOCUMENT = new WeakMap<object, MountedViews>();
// A closed shadow root is reachable only from inside it, so registration
// records each shadow root above a view.
const SHADOW_ROOT_BY_HOST = new WeakMap<Element, ShadowRoot>();
const DOCUMENT_DOM_SCOPE_LISTENERS = new WeakMap<object, Set<() => void>>();
const DETACHED_DOM_INPUT_RUNTIME_BY_EDITOR = new WeakMap<
  AnyEditor,
  DOMInputRuntime
>();
const ELEMENT_NODE = 1;

const documentOf = (editor: object): object =>
  hasEditorRuntime(editor) ? getEditorRuntimeOwner(editor) : editor;

export const notifyEditorDOMScopeListeners = (editor: object) => {
  EDITOR_TO_DOM_SCOPE_LISTENERS.get(editor)?.forEach((listener) => {
    listener();
  });
  DOCUMENT_DOM_SCOPE_LISTENERS.get(documentOf(editor))?.forEach((listener) => {
    listener();
  });
};

export const subscribeDOMReach = (handle: object, listener: () => void) => {
  const documentEditor = documentOf(handle);
  const reached = () => {
    if (!hasMountedDOMRoot(handle)) listener();
  };
  const listeners =
    DOCUMENT_DOM_SCOPE_LISTENERS.get(documentEditor) ?? new Set();

  listeners.add(reached);
  DOCUMENT_DOM_SCOPE_LISTENERS.set(documentEditor, listeners);

  if (handle !== documentEditor || !hasEditorRuntime(handle)) {
    return () => {
      listeners.delete(reached);
    };
  }

  let root = getBaseCallRoot(handle);
  const stopCaret = subscribeCaretOwner(handle, reached);
  const stopSelection = subscribeSource(handle, 'selection', () => {
    const next = getBaseCallRoot(handle);

    if (next === root) return;
    root = next;
    reached();
  });

  return () => {
    listeners.delete(reached);
    stopCaret();
    stopSelection();
  };
};

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

export const hasMountedDOMRoot = (editor: object): editor is AnyEditor =>
  DOM_ROOT_RUNTIMES_BY_EDITOR.has(editor);

export const hasMountedDocumentView = (editor: object) =>
  MOUNTED_VIEWS_BY_DOCUMENT.has(documentOf(editor));

const onlyView = (
  views: ReadonlySet<AnyEditor>,
  matches: (view: AnyEditor) => boolean
) => {
  let found: AnyEditor | null = null;

  for (const view of views) {
    if (!matches(view)) continue;
    if (found) return null;
    found = view;
  }

  return found;
};

const registerTreesAbove = (element: Element) => {
  let node = element;

  for (;;) {
    const tree = node.getRootNode();

    if ('host' in tree) {
      const shadowRoot = tree as ShadowRoot;

      SHADOW_ROOT_BY_HOST.set(shadowRoot.host, shadowRoot);
      node = shadowRoot.host;
    } else {
      const frame = node.ownerDocument.defaultView?.frameElement;

      if (!frame) return node.ownerDocument;
      node = frame;
    }
  }
};

const shadowRootOf = (host: Element) =>
  host.shadowRoot ?? SHADOW_ROOT_BY_HOST.get(host);

export const resolveInnermostElementAtPoint = (
  document: Document,
  x: number,
  y: number
) => {
  let element = document.elementFromPoint(x, y);

  for (
    let inner = element && shadowRootOf(element)?.elementFromPoint(x, y);
    inner && inner !== element;
    inner = shadowRootOf(element)?.elementFromPoint(x, y)
  ) {
    element = inner;
  }

  return element;
};

// A shadow host or a frame is its tree's focused element while focus sits
// inside it, so only the chain down from the top document reaches the element
// that holds focus.
const focusedElementOf = (top: Document) => {
  let element = top.activeElement;

  while (element) {
    const inner =
      shadowRootOf(element)?.activeElement ??
      (element as Partial<HTMLIFrameElement>).contentDocument?.activeElement;

    if (!inner) return element;
    element = inner;
  }

  return null;
};

const outerElementOf = (element: Element) => {
  if (element.parentElement) return element.parentElement;

  const parent = element.parentNode;

  return parent && 'host' in parent
    ? (parent as ShadowRoot).host
    : (element.ownerDocument.defaultView?.frameElement ?? null);
};

const focusedView = (
  mounted: MountedViews,
  matches: (view: AnyEditor) => boolean
) => {
  let found: AnyEditor | null = null;

  for (const top of mounted.topDocuments.keys()) {
    for (
      let element = focusedElementOf(top);
      element;
      element = outerElementOf(element)
    ) {
      const view = DOM_ROOT_RUNTIME_BY_ROOT.get(element as HTMLElement)?.editor;

      if (!view || !mounted.views.has(view) || !matches(view)) continue;
      if (found && found !== view) return null;
      found = view;
      break;
    }
  }

  return found;
};

const pickView = (
  mounted: MountedViews,
  matches: (view: AnyEditor) => boolean
) => onlyView(mounted.views, matches) ?? focusedView(mounted, matches);

export type DOMReachRequest = Readonly<{
  root?: RootKey;
}>;

const reachOwnView = (
  mounted: MountedViews,
  handle: Editor,
  presentation: ViewPresentation,
  request: DOMReachRequest
) => {
  const root = getEditorRuntimeRoot(handle);

  if (request.root !== undefined && request.root !== root) return null;

  return pickView(
    mounted,
    (view) =>
      getOwnViewPresentation(view) === presentation &&
      getEditorRuntimeRoot(view) === root
  );
};

const reachDocumentView = (
  mounted: MountedViews,
  handle: Editor,
  request: DOMReachRequest
) => {
  const root = request.root ?? getBaseCallRoot(handle);
  const caret = getCaretOwner(handle);
  const atRoot = (view: AnyEditor) => getEditorRuntimeRoot(view) === root;

  return caret && toInternalRoot(caret.root) === root
    ? pickView(
        mounted,
        (view) =>
          atRoot(view) && getOwnViewPresentation(view) === caret.presentation
      )
    : pickView(mounted, atRoot);
};

export const resolveDOMReach = (
  handle: object,
  request: DOMReachRequest = {}
): AnyEditor | null => {
  if (hasMountedDOMRoot(handle)) {
    return request.root === undefined ||
      request.root === getEditorRuntimeRoot(handle)
      ? handle
      : null;
  }

  const owner = documentOf(handle);
  const mounted = MOUNTED_VIEWS_BY_DOCUMENT.get(owner);

  if (!mounted || !hasEditorRuntime(handle)) return null;

  const presentation = getOwnViewPresentation(handle);

  if (presentation) return reachOwnView(mounted, handle, presentation, request);

  return handle === owner ? reachDocumentView(mounted, handle, request) : null;
};

export const resolveDOMTargetView = (
  handle: object,
  node: Node | null
): AnyEditor | null => {
  if (hasMountedDOMRoot(handle)) return handle;

  const view = node ? findDOMRootRuntime(node)?.editor : null;

  if (!view || !hasEditorRuntime(handle)) return null;

  const presentation = getOwnViewPresentation(handle);

  if (presentation) {
    return getOwnViewPresentation(view) === presentation &&
      getEditorRuntimeRoot(view) === getEditorRuntimeRoot(handle)
      ? view
      : null;
  }

  return handle === documentOf(handle) &&
    MOUNTED_VIEWS_BY_DOCUMENT.get(handle)?.views.has(view)
    ? view
    : null;
};

/** Resolve the focused private root runtime for an editor. */
export const findEditorDOMRootRuntime = (
  editor: object
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

/** Resolve the mounted DOM root that currently represents an editor. */
export const getEditorDOMRoot = (editor: object): HTMLElement | null =>
  findEditorDOMRootRuntime(editor)?.rootRef.current ?? null;

/** Undefined permits direct DOM setup; null means mounted roots are ambiguous. */
export const resolveMountedEditorDOMRoot = (
  editor: object
): HTMLElement | null | undefined =>
  DOM_ROOT_RUNTIMES_BY_EDITOR.has(editor)
    ? getEditorDOMRoot(editor)
    : undefined;

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

  readonly domCoverage: DOMCoverageSession;

  readonly domIntegrityObserver: DOMIntegrityObserver;

  readonly domInputRuntime: DOMInputRuntime;

  readonly domPhaseScheduler: DOMPhaseScheduler;

  readonly domSyncMutationOwnership: DOMSyncMutationOwnership;

  readonly rootRef: MutableCell<TRoot | null> = { current: null };

  connected = false;

  readonly isComposing: () => boolean;

  generation = 0;

  private facts: ResolvedDOMRootFacts | null = null;

  private readonly factListeners = new Set<() => void>();

  private readonly layoutListeners = new Set<() => void>();

  private readonly disposables = new Map<string, () => void>();

  readonly editor: AnyEditor;

  private readonly lifecycle: DOMRootRuntimeLifecycle<TRoot>;

  private readonly testRootFacts: DOMRootFactOverrides | undefined;

  private destroyed = false;

  private schedulerImplementation: DOMPhaseScheduler | null;

  private registeredTopDocument: Document | null = null;

  private rootInputActivationCleanup: (() => void) | null = null;

  private uninstallDOMPhaseScheduler: (() => void) | null = null;

  constructor(options: DOMRootRuntimeOptions<TRoot>) {
    this.isComposing = options.isComposing;
    this.adapter = options.adapter;
    this.editor = options.editor;
    this.domCoverage = createDOMCoverageSession(
      options.editor,
      () => this.rootRef.current,
      options.onRegisterBoundary
    );
    this.lifecycle = {
      afterRootMount: options.afterRootMount,
      beforeRootTeardown: options.beforeRootTeardown,
      onDestroy: options.onDestroy,
    };
    this.domInputRuntime = new DOMInputRuntime({
      getGeneration: () => this.generation,
      getRoot: () =>
        this.rootRef.current?.getAttribute('data-editor-root') ?? 'main',
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
      onDOMChange: this.publishLayout,
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
      () => this.domCoverage.destroy(),
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

  readonly subscribeLayout = (listener: () => void) => {
    this.layoutListeners.add(listener);

    return () => {
      this.layoutListeners.delete(listener);
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

  runUnobservedDOMMutation<T>(callback: () => T): T {
    return this.domSyncMutationOwnership.runUnmarked(() =>
      this.domIntegrityObserver.runUnobserved(callback)
    );
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
      const documentEditor = documentOf(this.editor);
      const mounted = MOUNTED_VIEWS_BY_DOCUMENT.get(documentEditor) ?? {
        topDocuments: new Map(),
        views: new Set(),
      };
      const top = registerTreesAbove(root);
      const topRuntimes = mounted.topDocuments.get(top) ?? new Set();

      mounted.views.add(this.editor);
      topRuntimes.add(runtime);
      mounted.topDocuments.set(top, topRuntimes);
      MOUNTED_VIEWS_BY_DOCUMENT.set(documentEditor, mounted);
      this.registeredTopDocument = top;
      DETACHED_DOM_INPUT_RUNTIME_BY_EDITOR.delete(this.editor);
      const markInputRuntimeActive = () => {
        ACTIVE_DOM_ROOT_RUNTIME_BY_EDITOR.set(this.editor, runtime);
        notifyEditorDOMScopeListeners(this.editor);
      };
      const publishRootFocus = () => notifyEditorDOMScopeListeners(this.editor);

      root.addEventListener('focusin', markInputRuntimeActive);
      root.addEventListener('focusout', publishRootFocus);
      root.addEventListener('pointerdown', markInputRuntimeActive);
      this.rootInputActivationCleanup = () => {
        root.removeEventListener('focusin', markInputRuntimeActive);
        root.removeEventListener('focusout', publishRootFocus);
        root.removeEventListener('pointerdown', markInputRuntimeActive);
      };
      if (isRuntimeRootActive(runtime)) {
        IS_FOCUSED.set(this.editor, true);
        setEditorFocused(this.editor, true);
        markInputRuntimeActive();
      } else notifyEditorDOMScopeListeners(this.editor);
    }
  }

  private unregisterRootOwner() {
    this.rootInputActivationCleanup?.();
    this.rootInputActivationCleanup = null;
    const runtime = this as unknown as DOMRootRuntime;
    const root = this.rootRef.current;
    const activeElement = (
      root?.getRootNode() as Document | ShadowRoot | undefined
    )?.activeElement;
    const focusedRuntime = activeElement
      ? findDOMRootRuntime(activeElement)
      : null;
    const otherFocusedView =
      focusedRuntime &&
      focusedRuntime.editor === this.editor &&
      focusedRuntime !== runtime;

    if (root && DOM_ROOT_RUNTIME_BY_ROOT.get(root) === runtime) {
      DOM_ROOT_RUNTIME_BY_ROOT.delete(root);
    }

    const editorRuntimes = DOM_ROOT_RUNTIMES_BY_EDITOR.get(this.editor);

    editorRuntimes?.delete(runtime);
    const wasActive =
      ACTIVE_DOM_ROOT_RUNTIME_BY_EDITOR.get(this.editor) === runtime;
    if (wasActive) {
      if (otherFocusedView) {
        ACTIVE_DOM_ROOT_RUNTIME_BY_EDITOR.set(this.editor, focusedRuntime);
      } else {
        ACTIVE_DOM_ROOT_RUNTIME_BY_EDITOR.delete(this.editor);
      }
    }
    const documentEditor = documentOf(this.editor);
    const mounted = MOUNTED_VIEWS_BY_DOCUMENT.get(documentEditor);
    const top = this.registeredTopDocument;
    const topRuntimes = top ? mounted?.topDocuments.get(top) : undefined;

    this.registeredTopDocument = null;
    topRuntimes?.delete(runtime);
    if (top && topRuntimes?.size === 0) mounted?.topDocuments.delete(top);
    if (editorRuntimes?.size === 0) {
      DOM_ROOT_RUNTIMES_BY_EDITOR.delete(this.editor);
      mounted?.views.delete(this.editor);
      if (mounted?.views.size === 0) {
        MOUNTED_VIEWS_BY_DOCUMENT.delete(documentEditor);
      }
    }
    if (!otherFocusedView && (wasActive || editorRuntimes?.size === 0)) {
      IS_FOCUSED.delete(this.editor);
      setEditorFocused(this.editor, false);
    }
    notifyEditorDOMScopeListeners(this.editor);
  }

  private publishHostFacts() {
    for (const listener of this.factListeners) {
      listener();
    }
  }

  private readonly publishLayout = () => {
    if (!this.connected) return;

    for (const listener of this.layoutListeners) {
      listener();
    }
  };
}
