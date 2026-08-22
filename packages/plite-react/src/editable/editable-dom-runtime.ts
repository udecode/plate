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
  DOMRootRuntime,
  type DOMRootRuntimeOptions,
  type DOMPhaseScheduler,
  type DOMIntegrityMutationOwner,
  type DOMIntegrityRepairEvidence,
  findDOMRootRuntime,
  IS_COMPOSING,
  IS_NODE_MAP_DIRTY,
} from '@platejs/plite-dom/internal';

import type { EditableDOMStrategyRuntime } from '../components/editable';
import { isSelectionPartialDOMBacked } from '../dom-strategy/dom-strategy-commands';
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager';
import { getPliteNodePathFromDOMElement } from '../hooks/use-plite-node-ref';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { isRangeAcrossContentRootOwners } from './content-root-owners';
import type { DOMRepairQueue } from './dom-repair-queue';
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
const EDITABLE_FOCUS_SUBSCRIBERS_BY_RUNTIME = new WeakMap<
  object,
  Set<() => void>
>();
const MODEL_SELECTION_DOM_PREFERENCE_TTL_MS = 5000;

const runAllRuntimeSteps = (steps: ReadonlyArray<() => void>) => {
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
          domStrategyRuntime.mountedTopLevelNodeKeys,
          domStrategyRuntime.mountedTopLevelRanges ?? null
        )
      : false;

  return (
    partialDOMStrategySelection ||
    isRangeAcrossContentRootOwners(editor, selection)
  );
};

/** Resolve the mounted root runtime that owns a DOM interaction target. */
export const findMountedEditableDOMRuntime = (
  node: Node
): EditableDOMRuntime | null => {
  const adapter = findDOMRootRuntime(node)?.adapter;

  return adapter instanceof EditableDOMRuntime ? adapter : null;
};

/** Resolve the connected runtime for a mounted React editor view. */
export const getMountedEditableDOMRuntimes = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: ReactRuntimeEditor<V, TExtensions>
): readonly EditableDOMRuntime[] =>
  [...(EDITABLE_RUNTIMES_BY_EDITOR_API.get(editor.api) ?? [])].filter(
    (runtime) => runtime.connected && runtime.rootRef.current !== null
  );

/** Resolve one connected runtime for a mounted React editor view. */
export const getMountedEditableDOMRuntime = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: ReactRuntimeEditor<V, TExtensions>
): EditableDOMRuntime | null =>
  getMountedEditableDOMRuntimes(editor)[0] ?? null;

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

  readonly domInputRuntime: DOMRootRuntime<HTMLDivElement>['domInputRuntime'];

  readonly domRepairQueueRef: MutableCell<DOMRepairQueue | null> = {
    current: null,
  };

  readonly handledDOMBeforeInputRef: MutableCell<boolean> = { current: false };

  readonly inputController: ReturnType<typeof createEditableInputController>;

  readonly processing: MutableCell<boolean> = { current: false };

  readonly receivedUserInput: MutableCell<boolean> = { current: false };

  readonly rootRef: MutableCell<HTMLDivElement | null>;

  private domStrategyRuntimeValue: EditableDOMStrategyRuntime | null;

  private readonly editorValue: ReactRuntimeEditor;

  private integrityRepairHandler: (
    evidence: DOMIntegrityRepairEvidence
  ) => void = () => {};

  private selectionExportAfterDOMCommitHandler: () => void = () => {};

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

  private readonly rootRuntime: DOMRootRuntime<HTMLDivElement>;

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
    testRootFacts,
  }: Partial<EditableDOMRuntimeUpdate> & {
    editor: ReactRuntimeEditor;
    testRootFacts?: DOMRootRuntimeOptions<HTMLDivElement>['testRootFacts'];
  }) {
    this.domStrategyRuntimeValue = domStrategyRuntime;
    this.editorValue = editor;
    this.onComposingChange = onComposingChange;
    this.onPartialDOMBackedSelectionChange = onPartialDOMBackedSelectionChange;
    this.readOnlyValue = readOnly;
    this.rootRuntime = new DOMRootRuntime({
      adapter: this,
      afterRootMount: () => {
        this.attachNativeInputListeners();
      },
      beforeRootTeardown: () => {
        runAllRuntimeSteps([
          () => this.androidInputManagerRef.current?.prepareDOMTeardown(),
          () => this.resetSchedulerBackedInputState(),
          () => this.detachNativeInputListeners(),
          () => this.clearModelSelectionDOMPreference(),
        ]);
      },
      editor,
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
      onDestroy: () => {
        const rangeAnchors = [
          ...this.browserHandleRangeAnchors.current.values(),
        ];

        this.browserHandleRangeAnchors.current.clear();
        runAllRuntimeSteps([
          () => {
            runAllRuntimeSteps(
              rangeAnchors.map((rangeAnchor) => () => rangeAnchor.release())
            );
          },
          () => {
            this.clearVerticalGoal();
          },
          () => {
            this.disconnectVerticalGoalOwner();
          },
        ]);
      },
      onRepair: (evidence) => {
        this.integrityRepairHandler(evidence);
      },
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
      testRootFacts,
    });
    this.rootRef = this.rootRuntime.rootRef;
    this.domInputRuntime = this.rootRuntime.domInputRuntime;
    this.domPhaseScheduler = this.rootRuntime.domPhaseScheduler;
    this.inputController = createEditableInputController({
      domInputRuntime: this.domInputRuntime,
      preferModelSelectionForInputRef: { current: false },
      scheduleTask: this.domPhaseScheduler.schedule,
      state: createEditableInputControllerState(this.domInputRuntime),
    });
  }

  get domStrategyRuntime() {
    return this.domStrategyRuntimeValue;
  }

  get connected() {
    return this.rootRuntime.connected;
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

  get hostLanguage() {
    return this.rootRuntime.hostLanguage;
  }

  get isAndroidHost() {
    return this.rootRuntime.isAndroidHost;
  }

  get isAppleHost() {
    return this.rootRuntime.isAppleHost;
  }

  get isBlinkHost() {
    return this.rootRuntime.isBlinkHost;
  }

  get isGeckoHost() {
    return this.rootRuntime.isGeckoHost;
  }

  get isWebKitHost() {
    return this.rootRuntime.isWebKitHost;
  }

  get supportsBeforeInput() {
    return this.rootRuntime.supportsBeforeInput;
  }

  hasHostQuirk(quirk: Parameters<DOMRootRuntime['hasHostQuirk']>[0]) {
    return this.rootRuntime.hasHostQuirk(quirk);
  }

  readonly subscribeHostFacts = (listener: () => void) =>
    this.rootRuntime.subscribeHostFacts(listener);

  domIntegrityDiagnostics() {
    return this.rootRuntime.diagnostics();
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
    try {
      this.rootRuntime.connect();
    } catch (error) {
      this.disconnectVerticalGoalOwner();
      throw error;
    }

    return () => {
      this.destroy();
    };
  }

  destroy() {
    this.rootRuntime.destroy();
  }

  installDisposable(key: string, dispose: () => void) {
    return this.rootRuntime.installDisposable(key, dispose);
  }

  prepareReactCommit() {
    this.rootRuntime.prepareHostCommit();
  }

  completeReactCommit() {
    this.rootRuntime.completeHostCommit();
    IS_NODE_MAP_DIRTY.set(this.editorValue, false);
  }

  claimReactCommit() {
    this.rootRuntime.claimHostCommit();
  }

  requestSelectionExportAfterDOMCommit() {
    const exportSelection = () => {
      this.selectionExportAfterDOMCommitHandler();
    };

    this.domPhaseScheduler.schedule(
      'selection-repair',
      'node-bind-selection-export-microtask',
      exportSelection,
      {
        key: 'node-bind-selection-export-microtask',
        timing: 'microtask',
      }
    );
    this.domPhaseScheduler.schedule(
      'selection-repair',
      'node-bind-selection-export-frame',
      exportSelection,
      {
        key: 'node-bind-selection-export-frame',
        timing: 'animation-frame',
      }
    );
  }

  runOwnedDOMMutation<T>(
    owner: DOMIntegrityMutationOwner,
    callback: () => T
  ): T {
    return this.rootRuntime.runOwnedDOMMutation(owner, callback);
  }

  releaseDisposable(key: string) {
    this.rootRuntime.releaseDisposable(key);
  }

  setRoot(node: HTMLDivElement | null) {
    this.rootRuntime.setRoot(node);
  }

  updateDOMIntegrityRepairHandler(
    handler: (evidence: DOMIntegrityRepairEvidence) => void
  ) {
    this.integrityRepairHandler = handler;
  }

  updateSelectionExportAfterDOMCommitHandler(handler: () => void) {
    this.selectionExportAfterDOMCommitHandler = handler;
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
    const { pendingCompositionEnd } = this.inputController.state;
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
      () => {
        this.cancelUserInputFrame();
      },
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
            () => {
              restoreEditableCompositionRuntimeMarks(
                this.editorValue,
                runtimeMarks
              );
            },
          ]
        : !ownedComposition
          ? []
          : [
              () => {
                clearEditableCompositionRuntimeState(this.editorValue);
              },
              () => IS_COMPOSING.set(this.editorValue, false),
              () => {
                setEditorComposing(this.editorValue, false);
              },
            ]),
    ]);
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
