import {
  type Anchor,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  type Value,
} from '@platejs/plite';
import type { DOMRange } from '@platejs/plite-dom';
import {
  createDOMPhaseScheduler,
  type DOMPhaseScheduler,
  type DOMPhaseSchedulerDiagnostics,
  installEditorDOMPhaseScheduler,
  IS_COMPOSING,
} from '@platejs/plite-dom/internal';
import type { EditableDOMStrategyRuntime } from '../components/editable';
import { isSelectionPartialDOMBacked } from '../dom-strategy/dom-strategy-commands';
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager';
import { getPliteNodePathFromDOMElement } from '../hooks/use-plite-node-ref';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { isRangeAcrossContentRootOwners } from './content-root-owners';
import {
  DOMIntegrityObserver,
  type DOMIntegrityMutationOwner,
  type DOMIntegrityRepairEvidence,
} from './dom-integrity-observer';
import type { DOMRepairQueue } from './dom-repair-queue';
import { DOMSyncMutationOwnership } from './dom-sync-mutation-ownership';
import {
  createEditableInputController,
  createEditableInputControllerState,
  setEditableComposingState,
} from './input-controller';
import {
  captureEditableCompositionRuntimeMarks,
  clearEditableCompositionRuntimeState,
  type EditableInputController,
  restoreEditableCompositionRuntimeMarks,
} from './input-state';
import type { DeferredMutation } from './model-input-strategy';
import {
  getEditorRuntimeOwner,
  setEditorComposing,
} from './runtime-editor-api';
import { readRuntimeText } from './runtime-live-state';

type MutableCell<T> = { current: T };

type CancelableCallback = {
  cancel: () => void;
};

const ELEMENT_NODE = 1;

const EDITABLE_RUNTIMES_BY_EDITOR_API = new WeakMap<
  object,
  Set<EditableDOMRuntime>
>();
const EDITABLE_RUNTIME_BY_ROOT = new WeakMap<HTMLElement, EditableDOMRuntime>();
const EDITABLE_FOCUS_SUBSCRIBERS_BY_RUNTIME = new WeakMap<
  object,
  Set<() => void>
>();
const MODEL_SELECTION_DOM_PREFERENCE_TTL_MS = 5000;

const runAllRuntimeSteps = (steps: readonly (() => void)[]) => {
  let firstError: unknown;
  let hasError = false;

  for (const step of steps) {
    try {
      step();
    } catch (error) {
      if (!hasError) {
        firstError = error;
        hasError = true;
      }
    }
  }

  if (hasError) throw firstError;
};

type ModelSelectionDOMPoint = {
  node: globalThis.Node;
  offset: number;
};

type ModelSelectionDOMPreference = {
  anchor: ModelSelectionDOMPoint;
  cancelDelete: (() => void) | null;
  expiresAt: number;
  focus: ModelSelectionDOMPoint;
  selection: Range;
};

const getTimestamp = () => globalThis.performance?.now?.() ?? Date.now();

export const isEditableDOMSelectionPartial = ({
  domStrategyRuntime,
  editor,
  selection,
}: {
  domStrategyRuntime: EditableDOMStrategyRuntime | null;
  editor: ReactRuntimeEditor;
  selection: Range | null;
}) => {
  const partialDOMStrategySelection =
    domStrategyRuntime?.type === 'partial-dom' ||
    domStrategyRuntime?.type === 'staged' ||
    domStrategyRuntime?.type === 'virtualized'
      ? isSelectionPartialDOMBacked(
          selection,
          domStrategyRuntime.mountedTopLevelRuntimeIds,
          domStrategyRuntime.mountedTopLevelRanges ?? null
        )
      : false;

  return (
    partialDOMStrategySelection ||
    isRangeAcrossContentRootOwners(editor, selection)
  );
};

const asElement = (node: Node): Element | null =>
  node.nodeType === ELEMENT_NODE ? (node as Element) : node.parentElement;

/** Resolve the mounted root runtime that owns a DOM interaction target. */
export const findMountedEditableDOMRuntime = (
  node: Node
): EditableDOMRuntime | null => {
  let element = asElement(node);

  while (element) {
    const runtime = EDITABLE_RUNTIME_BY_ROOT.get(element as HTMLElement);

    if (runtime) return runtime;

    const rootNode = element.getRootNode();

    element =
      element.parentElement ??
      ('host' in rootNode ? (rootNode.host as Element) : null);
  }

  return null;
};

/** Resolve the connected runtime for a mounted React editor view. */
export const getMountedEditableDOMRuntime = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: ReactRuntimeEditor<V, TExtensions>
): EditableDOMRuntime | null =>
  [...(EDITABLE_RUNTIMES_BY_EDITOR_API.get(editor.api) ?? [])].find(
    (runtime) => runtime.connected && runtime.rootRef.current !== null
  ) ?? null;

export const hasMountedEditableCompositionOwner = (
  editor: ReactRuntimeEditor,
  excludedInputController: EditableInputController
) =>
  [...(EDITABLE_RUNTIMES_BY_EDITOR_API.get(editor.api) ?? [])].some(
    (runtime) =>
      runtime.connected &&
      runtime.inputController !== excludedInputController &&
      runtime.inputController.state.isComposing
  );

/** Subscribe to focus changes published by any mounted root of one runtime. */
export const subscribeEditableRuntimeFocus = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: ReactRuntimeEditor<V, TExtensions>,
  listener: () => void
) => {
  const owner = getEditorRuntimeOwner(editor);
  const listeners =
    EDITABLE_FOCUS_SUBSCRIBERS_BY_RUNTIME.get(owner) ?? new Set<() => void>();

  listeners.add(listener);
  EDITABLE_FOCUS_SUBSCRIBERS_BY_RUNTIME.set(owner, listeners);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      EDITABLE_FOCUS_SUBSCRIBERS_BY_RUNTIME.delete(owner);
    }
  };
};

type EditableDOMRuntimeUpdate = {
  domStrategyRuntime: EditableDOMStrategyRuntime | null;
  onComposingChange: (nextValue: boolean) => void;
  onPartialDOMBackedSelectionChange: (nextValue: boolean) => void;
  readOnly: boolean;
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

/** Private imperative owner for one mounted editable root. */
export class EditableDOMRuntime {
  readonly androidInputManagerRef: MutableCell<
    AndroidInputManager | null | undefined
  > = { current: undefined };

  readonly browserHandleNextId: MutableCell<number> = { current: 0 };

  readonly browserHandleRangeAnchors: MutableCell<Map<string, Anchor<Range>>> =
    { current: new Map() };

  readonly deferredMutations: MutableCell<DeferredMutation[]> = { current: [] };

  readonly domPhaseScheduler: DOMPhaseScheduler;

  readonly domIntegrityObserver: DOMIntegrityObserver;

  readonly domRepairQueueRef: MutableCell<DOMRepairQueue | null> = {
    current: null,
  };

  readonly domSyncMutationOwnership: DOMSyncMutationOwnership;

  readonly handledDOMBeforeInputRef: MutableCell<boolean> = { current: false };

  readonly inputController: ReturnType<typeof createEditableInputController>;

  readonly processing: MutableCell<boolean> = { current: false };

  readonly receivedUserInput: MutableCell<boolean> = { current: false };

  readonly rootRef: MutableCell<HTMLDivElement | null> = { current: null };

  connected = false;

  private readonly disposables = new Map<string, () => void>();

  private domStrategyRuntimeValue: EditableDOMStrategyRuntime | null;

  private readonly editorValue: ReactRuntimeEditor;

  private integrityRepairHandler: (
    evidence: DOMIntegrityRepairEvidence
  ) => void = () => {};

  private readonly nativeInputHandlers: {
    beforeInput: ((event: InputEvent) => void) | null;
    input: ((event: Event) => void) | null;
  } = {
    beforeInput: null,
    input: null,
  };

  private nativeInputListenersCleanup: (() => void) | null = null;

  private modelSelectionDOMPreference: ModelSelectionDOMPreference | null =
    null;

  private onComposingChange: (nextValue: boolean) => void;

  private onDOMSelectionChange: CancelableCallback | null = null;

  private onPartialDOMBackedSelectionChange: (nextValue: boolean) => void;

  private readOnlyValue: boolean;

  private scheduleOnDOMSelectionChange: CancelableCallback | null = null;

  private schedulerImplementation: DOMPhaseScheduler | null;

  private uninstallDOMPhaseScheduler: (() => void) | null = null;

  private cancelUserInputFrameTask: (() => void) | null = null;

  private verticalGoalFocus: Point | null = null;

  private verticalGoalOwner: object | null = null;

  private verticalGoalX: number | null = null;

  constructor({
    domStrategyRuntime = null,
    editor,
    onComposingChange = () => {},
    onPartialDOMBackedSelectionChange = () => {},
    readOnly = false,
  }: Partial<EditableDOMRuntimeUpdate> & { editor: ReactRuntimeEditor }) {
    this.domStrategyRuntimeValue = domStrategyRuntime;
    this.editorValue = editor;
    this.onComposingChange = onComposingChange;
    this.onPartialDOMBackedSelectionChange = onPartialDOMBackedSelectionChange;
    this.readOnlyValue = readOnly;
    this.schedulerImplementation = this.createScheduler();
    this.domSyncMutationOwnership = new DOMSyncMutationOwnership(
      (phase, label, callback, options) =>
        this.schedulerImplementation?.schedule(
          phase,
          label,
          callback,
          options
        ) ?? (() => {})
    );
    this.domIntegrityObserver = new DOMIntegrityObserver({
      consumeOwnedMutation: (mutation) =>
        this.domSyncMutationOwnership.consume(mutation),
      getAndroidMutationHandler: () =>
        this.androidInputManagerRef.current?.handleDomMutations ?? null,
      isAndroidMutationOwned: () => {
        const manager = this.androidInputManagerRef.current;

        return !!(
          manager &&
          (manager.hasPendingChanges() || manager.isFlushing())
        );
      },
      isCanonicalTextMutation: (mutation) => {
        const targetElement =
          mutation.target.nodeType === ELEMENT_NODE
            ? (mutation.target as Element)
            : mutation.target.parentElement;
        const textHost = targetElement?.closest<HTMLElement>(
          '[data-plite-node="text"]'
        );
        const zeroWidth = targetElement?.closest<HTMLElement>(
          '[data-plite-zero-width]'
        );
        const path = textHost ? getPliteNodePathFromDOMElement(textHost) : null;
        const modelText = path
          ? readRuntimeText(this.editorValue, path)?.text
          : null;

        if (zeroWidth) {
          return modelText !== null && mutation.target.nodeValue === '\uFEFF';
        }

        return (
          modelText !== null &&
          textHost?.textContent?.replaceAll('\uFEFF', '') === modelText
        );
      },
      isComposing: () => this.state.isComposing,
      onRepair: (evidence) => this.integrityRepairHandler(evidence),
      resolvePath: (mutation) => {
        const targetElement =
          mutation.target.nodeType === ELEMENT_NODE
            ? (mutation.target as Element)
            : mutation.target.parentElement;
        const pliteElement = targetElement?.closest<HTMLElement>(
          '[data-plite-node], [data-plite-path]'
        );
        const path = pliteElement
          ? getPliteNodePathFromDOMElement(pliteElement)
          : null;

        if (path) return path.join(',');

        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-plite-path'
        ) {
          return mutation.oldValue;
        }

        return pliteElement?.getAttribute('data-plite-path') ?? null;
      },
      schedule: (callback, options) =>
        this.schedulerImplementation?.schedule(
          'dom-write',
          'dom-integrity-repair',
          callback,
          options
        ) ?? (() => {}),
    });
    this.domPhaseScheduler = {
      destroy: () => this.destroyScheduler(),
      diagnostics: () =>
        this.schedulerImplementation?.diagnostics() ??
        EMPTY_SCHEDULER_DIAGNOSTICS,
      flush: () => this.schedulerImplementation?.flush(),
      pending: () => this.schedulerImplementation?.pending() ?? 0,
      schedule: (phase, label, callback, options) => {
        const scheduledCallback =
          phase === 'dom-write'
            ? (frameTime?: number) =>
                this.domIntegrityObserver.runOwned('scheduler', () =>
                  callback(frameTime)
                )
            : callback;

        return (
          this.schedulerImplementation?.schedule(
            phase,
            label,
            scheduledCallback,
            options
          ) ?? (() => {})
        );
      },
    };
    this.inputController = createEditableInputController({
      preferModelSelectionForInputRef: { current: false },
      scheduleTask: this.domPhaseScheduler.schedule,
      state: createEditableInputControllerState(),
    });
  }

  get domStrategyRuntime() {
    return this.domStrategyRuntimeValue;
  }

  get editor() {
    return this.editorValue;
  }

  get readOnly() {
    return this.readOnlyValue;
  }

  get state() {
    return this.inputController.state;
  }

  domIntegrityDiagnostics() {
    return this.domIntegrityObserver.diagnostics();
  }

  readonly isPartialDOMBackedSelection = (selection: Range | null) =>
    isEditableDOMSelectionPartial({
      domStrategyRuntime: this.domStrategyRuntimeValue,
      editor: this.editorValue,
      selection,
    });

  readonly onUserInput = () => {
    this.clearVerticalGoal();
    if (this.receivedUserInput.current) return;

    const targetWindow =
      this.rootRef.current?.ownerDocument.defaultView ?? null;

    this.cancelUserInputFrame();
    this.receivedUserInput.current = true;
    if (!targetWindow) {
      this.receivedUserInput.current = false;
      return;
    }

    this.cancelUserInputFrameTask = this.domPhaseScheduler.schedule(
      'model',
      'clear-user-input-frame',
      () => {
        this.receivedUserInput.current = false;
        this.cancelUserInputFrameTask = null;
      },
      { timing: 'animation-frame' }
    );
  };

  readonly publishFocusState = () => {
    const owner = getEditorRuntimeOwner(this.editorValue);

    for (const listener of EDITABLE_FOCUS_SUBSCRIBERS_BY_RUNTIME.get(owner) ??
      []) {
      listener();
    }
  };

  clearModelSelectionDOMPreference() {
    const preference = this.modelSelectionDOMPreference;

    this.modelSelectionDOMPreference = null;
    preference?.cancelDelete?.();
  }

  readModelSelectionDOMPreference({
    editorElement,
    selection,
  }: {
    editorElement: HTMLElement;
    selection: Range;
  }): DOMRange | null {
    const preference = this.modelSelectionDOMPreference;

    if (!preference) return null;

    if (
      preference.expiresAt < getTimestamp() ||
      !RangeApi.equals(preference.selection, selection)
    ) {
      this.clearModelSelectionDOMPreference();
      return null;
    }

    if (
      !preference.anchor.node.isConnected ||
      !editorElement.contains(preference.anchor.node) ||
      !preference.focus.node.isConnected ||
      !editorElement.contains(preference.focus.node)
    ) {
      this.clearModelSelectionDOMPreference();
      return null;
    }

    try {
      const domRange = editorElement.ownerDocument.createRange();

      domRange.setStart(preference.anchor.node, preference.anchor.offset);
      domRange.setEnd(preference.focus.node, preference.focus.offset);
      this.scheduleModelSelectionDOMPreferenceDelete(preference, 0);

      return domRange;
    } catch {
      this.clearModelSelectionDOMPreference();
      return null;
    }
  }

  writeCollapsedModelSelectionDOMPreference(
    selection: Range,
    point: ModelSelectionDOMPoint | null
  ) {
    this.clearModelSelectionDOMPreference();
    if (!point || !RangeApi.isCollapsed(selection)) return;

    const preference: ModelSelectionDOMPreference = {
      anchor: point,
      cancelDelete: null,
      expiresAt: getTimestamp() + MODEL_SELECTION_DOM_PREFERENCE_TTL_MS,
      focus: point,
      selection,
    };

    this.modelSelectionDOMPreference = preference;
    this.scheduleModelSelectionDOMPreferenceDelete(
      preference,
      MODEL_SELECTION_DOM_PREFERENCE_TTL_MS
    );
  }

  readonly setComposing = (nextValue: boolean) => {
    setEditableComposingState({
      editor: this.editorValue,
      inputController: this.inputController,
      nextValue,
      preserveEditorComposing: !nextValue && this.hasSiblingCompositionOwner(),
      setIsComposing: this.onComposingChange,
    });
  };

  readonly setExplicitPartialDOMBackedSelection = (nextValue: boolean) => {
    this.onPartialDOMBackedSelectionChange(nextValue);
  };

  readonly clearVerticalGoal = () => {
    this.writeVerticalGoal(null, null);
  };

  readonly readVerticalGoalX = (focus: Point) => {
    if (
      this.verticalGoalX === null ||
      !this.verticalGoalFocus ||
      !PointApi.equals(this.verticalGoalFocus, focus)
    ) {
      this.clearVerticalGoal();

      return null;
    }

    return this.verticalGoalX;
  };

  readonly setVerticalGoalX = (x: number, focus: Point) => {
    this.writeVerticalGoal(x, {
      ...focus,
      path: [...focus.path],
    });
  };

  connect() {
    this.connectVerticalGoalOwner();
    if (!this.schedulerImplementation) {
      this.schedulerImplementation = this.createScheduler();
    }

    this.connected = true;
    this.installDOMPhaseScheduler();
    this.registerRootOwner();
    this.domSyncMutationOwnership.connect(this.rootRef.current);
    this.attachNativeInputListeners();
    this.domIntegrityObserver.connect(this.rootRef.current);

    return () => this.destroy();
  }

  destroy() {
    const disposables = [...this.disposables];
    const rangeAnchors = [...this.browserHandleRangeAnchors.current.values()];

    this.connected = false;
    this.disposables.clear();
    this.browserHandleRangeAnchors.current.clear();
    runAllRuntimeSteps([
      () => this.androidInputManagerRef.current?.prepareDOMTeardown(),
      () => this.unregisterRootOwner(),
      () => this.detachNativeInputListeners(),
      () => this.resetSchedulerBackedInputState(),
      () => this.clearModelSelectionDOMPreference(),
      () => this.domIntegrityObserver.destroy(),
      () => this.domSyncMutationOwnership.destroy(),
      () => runAllRuntimeSteps(disposables.map(([, dispose]) => dispose)),
      () =>
        runAllRuntimeSteps(
          rangeAnchors.map((rangeAnchor) => () => rangeAnchor.release())
        ),
      () => this.clearVerticalGoal(),
      () => this.disconnectVerticalGoalOwner(),
      () => this.destroyScheduler(),
    ]);
  }

  installDisposable(key: string, dispose: () => void) {
    this.releaseDisposable(key);
    this.disposables.set(key, dispose);

    return () => {
      if (this.disposables.get(key) !== dispose) return;

      this.disposables.delete(key);
      dispose();
    };
  }

  prepareReactCommit() {
    this.domIntegrityObserver.pauseForReactCommit();
  }

  completeReactCommit() {
    this.domIntegrityObserver.resumeAfterReactCommit();
  }

  claimReactCommit() {
    this.domIntegrityObserver.discardPending('react');
  }

  runOwnedDOMMutation<T>(
    owner: DOMIntegrityMutationOwner,
    callback: () => T
  ): T {
    return this.domIntegrityObserver.runOwned(owner, callback);
  }

  releaseDisposable(key: string) {
    const dispose = this.disposables.get(key);

    if (!dispose) return;

    this.disposables.delete(key);
    dispose();
  }

  setRoot(node: HTMLDivElement | null) {
    if (this.rootRef.current === node) return;

    runAllRuntimeSteps([
      () => this.androidInputManagerRef.current?.prepareDOMTeardown(),
      () => this.unregisterRootOwner(),
      () => this.resetSchedulerBackedInputState(),
      () => this.destroyScheduler(),
      () => this.detachNativeInputListeners(),
      () => this.clearModelSelectionDOMPreference(),
      () => {
        this.rootRef.current = node;
      },
      () => this.installDOMPhaseScheduler(),
      () => this.registerRootOwner(),
      () => this.domSyncMutationOwnership.setRoot(node),
      () => this.domIntegrityObserver.setRoot(node),
      () => this.attachNativeInputListeners(),
    ]);
  }

  updateDOMIntegrityRepairHandler(
    handler: (evidence: DOMIntegrityRepairEvidence) => void
  ) {
    this.integrityRepairHandler = handler;
  }

  update(update: EditableDOMRuntimeUpdate) {
    this.domStrategyRuntimeValue = update.domStrategyRuntime;
    this.onComposingChange = update.onComposingChange;
    this.onPartialDOMBackedSelectionChange =
      update.onPartialDOMBackedSelectionChange;
    this.readOnlyValue = update.readOnly;
  }

  updateNativeInputHandlers({
    onDOMBeforeInput,
    onDOMInput,
  }: {
    onDOMBeforeInput: (event: InputEvent) => void;
    onDOMInput: (event: Event) => void;
  }) {
    this.nativeInputHandlers.beforeInput = onDOMBeforeInput;
    this.nativeInputHandlers.input = onDOMInput;
  }

  updateSelectionChangeHandlers({
    onDOMSelectionChange,
    scheduleOnDOMSelectionChange,
  }: {
    onDOMSelectionChange: CancelableCallback;
    scheduleOnDOMSelectionChange: CancelableCallback;
  }) {
    this.onDOMSelectionChange = onDOMSelectionChange;
    this.scheduleOnDOMSelectionChange = scheduleOnDOMSelectionChange;
  }

  cancelSelectionChangeHandlers() {
    this.onDOMSelectionChange?.cancel();
    this.scheduleOnDOMSelectionChange?.cancel();
  }

  private attachNativeInputListeners() {
    const node = this.rootRef.current;

    if (!this.connected || !node || this.nativeInputListenersCleanup) return;

    const handleBeforeInput = (event: InputEvent) => {
      this.nativeInputHandlers.beforeInput?.(event);
    };
    const handleInput = (event: Event) => {
      this.nativeInputHandlers.input?.(event);
    };

    node.addEventListener('beforeinput', handleBeforeInput);
    node.addEventListener('input', handleInput);
    this.nativeInputListenersCleanup = () => {
      node.removeEventListener('beforeinput', handleBeforeInput);
      node.removeEventListener('input', handleInput);
    };
  }

  private connectVerticalGoalOwner() {
    const owner = this.editorValue.api;

    if (this.verticalGoalOwner === owner) return;

    this.disconnectVerticalGoalOwner();
    const runtimes = EDITABLE_RUNTIMES_BY_EDITOR_API.get(owner) ?? new Set();

    runtimes.add(this);
    EDITABLE_RUNTIMES_BY_EDITOR_API.set(owner, runtimes);
    this.verticalGoalOwner = owner;
    const sibling = [...runtimes].find(
      (runtime) => runtime !== this && runtime.verticalGoalX !== null
    );

    if (sibling) {
      this.verticalGoalFocus = sibling.verticalGoalFocus;
      this.verticalGoalX = sibling.verticalGoalX;
    } else {
      this.verticalGoalFocus = null;
      this.verticalGoalX = null;
    }
  }

  private cancelUserInputFrame() {
    const cancel = this.cancelUserInputFrameTask;

    this.cancelUserInputFrameTask = null;
    this.receivedUserInput.current = false;
    cancel?.();
  }

  private resetSchedulerBackedInputState() {
    const pendingCompositionEnd =
      this.inputController.state.pendingCompositionEnd;
    const ownedComposition =
      this.inputController.state.isComposing ||
      this.inputController.state.compositionSession !== null ||
      (pendingCompositionEnd !== null &&
        pendingCompositionEnd.ownership !== 'settled');

    const siblingOwnsComposition = this.hasSiblingCompositionOwner();
    const runtimeMarks = captureEditableCompositionRuntimeMarks(
      this.editorValue
    );

    runAllRuntimeSteps([
      () => this.cancelUserInputFrame(),
      () => {
        if (pendingCompositionEnd?.ownership === 'plite') {
          pendingCompositionEnd.flush({ publish: false });
        } else {
          pendingCompositionEnd?.cancel();
        }
      },
      () => this.inputController.state.pendingCompositionEnd?.cancel(),
      () => {
        this.inputController.state.pendingCompositionEnd = null;
        this.inputController.state.compositionSession = null;
        this.inputController.state.isComposing = false;
        if (this.inputController.state.activeIntent === 'composition') {
          this.inputController.state.activeIntent = null;
        }
        if (
          this.inputController.state.selectionSource === 'composition-owned'
        ) {
          this.inputController.state.selectionSource = 'unknown';
        }
        this.inputController.state.modelOwnedTextInputGuard = 0;
      },
      ...(siblingOwnsComposition
        ? [
            () =>
              restoreEditableCompositionRuntimeMarks(
                this.editorValue,
                runtimeMarks
              ),
          ]
        : !ownedComposition
          ? []
          : [
              () => clearEditableCompositionRuntimeState(this.editorValue),
              () => IS_COMPOSING.set(this.editorValue, false),
              () => setEditorComposing(this.editorValue, false),
            ]),
    ]);
  }

  private createScheduler() {
    return createDOMPhaseScheduler({
      getWindow: () => this.rootRef.current?.ownerDocument.defaultView,
    });
  }

  private hasSiblingCompositionOwner() {
    return [
      ...(EDITABLE_RUNTIMES_BY_EDITOR_API.get(this.editorValue.api) ?? []),
    ].some(
      (runtime) =>
        runtime !== this &&
        runtime.connected &&
        runtime.inputController.state.isComposing
    );
  }

  private installDOMPhaseScheduler() {
    const root = this.rootRef.current;

    if (!this.connected || !root) return;
    if (!this.schedulerImplementation) {
      this.schedulerImplementation = this.createScheduler();
    }

    this.uninstallDOMPhaseScheduler?.();
    this.uninstallDOMPhaseScheduler = installEditorDOMPhaseScheduler(
      this.editorValue,
      root,
      this.domPhaseScheduler
    );
  }

  private registerRootOwner() {
    const root = this.rootRef.current;

    if (this.connected && root) EDITABLE_RUNTIME_BY_ROOT.set(root, this);
  }

  private scheduleModelSelectionDOMPreferenceDelete(
    preference: ModelSelectionDOMPreference,
    delay: number
  ) {
    preference.cancelDelete?.();
    preference.cancelDelete = this.domPhaseScheduler.schedule(
      'model',
      'delete-model-selection-dom-preference',
      () => {
        preference.cancelDelete = null;
        if (this.modelSelectionDOMPreference === preference) {
          this.modelSelectionDOMPreference = null;
        }
      },
      { delay, timing: 'timeout' }
    );
  }

  private unregisterRootOwner() {
    const root = this.rootRef.current;

    if (root && EDITABLE_RUNTIME_BY_ROOT.get(root) === this) {
      EDITABLE_RUNTIME_BY_ROOT.delete(root);
    }
  }

  private disconnectVerticalGoalOwner() {
    const owner = this.verticalGoalOwner;

    if (!owner) return;

    const runtimes = EDITABLE_RUNTIMES_BY_EDITOR_API.get(owner);

    runtimes?.delete(this);
    if (runtimes?.size === 0) {
      EDITABLE_RUNTIMES_BY_EDITOR_API.delete(owner);
    }
    this.verticalGoalOwner = null;
  }

  private destroyScheduler() {
    const uninstall = this.uninstallDOMPhaseScheduler;
    const scheduler = this.schedulerImplementation;

    this.uninstallDOMPhaseScheduler = null;
    this.schedulerImplementation = null;
    runAllRuntimeSteps([() => uninstall?.(), () => scheduler?.destroy()]);
  }

  private detachNativeInputListeners() {
    const cleanup = this.nativeInputListenersCleanup;

    this.nativeInputListenersCleanup = null;
    cleanup?.();
  }

  private writeVerticalGoal(x: number | null, focus: Point | null) {
    const runtimes = this.verticalGoalOwner
      ? EDITABLE_RUNTIMES_BY_EDITOR_API.get(this.verticalGoalOwner)
      : null;

    for (const runtime of runtimes ?? [this]) {
      runtime.verticalGoalFocus = focus;
      runtime.verticalGoalX = x;
    }
  }
}
