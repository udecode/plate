import {
  type Anchor,
  type EditorCommit,
  type NodeKey,
  type Path,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  type Value,
} from '../..';
import { getInstalledPlugin } from '../../core/plugin';
import {
  readEditorHistoryReplayReceipt,
  withUpdateTagContext,
} from '../../core/public-state';
import type { DOMRange } from '../../dom';
import {
  DOMRootRuntime,
  type DOMRootRuntimeOptions,
  type DOMPhaseScheduler,
  type DOMIntegrityMutationOwner,
  type DOMIntegrityRepairEvidence,
  findDOMRootRuntime,
  findEditorDOMRootRuntime,
  IS_COMPOSING,
  IS_NODE_MAP_DIRTY,
  resolveDOMTextFlowEntry,
  resolveDOMTextFlowRecordDOMText,
} from '../../dom/internal';
import type { EditableViewportRuntime } from '../components/editable';
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager';
import {
  getPliteNodePathFromDOMElement,
  isPliteNodeFlowRootBound,
} from '../hooks/use-plite-node-ref';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { PLITE_REACT_PRESERVE_SELECTION_TAGS } from '../update-policy';
import {
  readPliteViewSelection,
  readPliteViewSelectionHistoryGroup,
  writePliteViewSelection,
} from '../view-selection';
import { isSelectionViewportBacked } from '../viewport-commands';
import { isRangeAcrossContentRootOwners } from './content-root-owners';
import type { DOMRepairQueue } from './dom-repair-queue';
import { ExternalTextRuntime } from './external-text-runtime';
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
import { getEditableInteractionOwner } from './interaction-owner';
import type { DeferredMutation } from './model-input-strategy';
import {
  getEditorRuntimeOwner,
  setEditorComposing,
} from './runtime-editor-api';
import { readRuntimeText } from './runtime-live-state';
import { attachEditableSelectionChangeListener } from './selection-change-listener';

type MutableCell<T> = { current: T };

/** Focus behavior after mounted undo or redo applies a history batch. */
export type EditorHistoryFocusPolicy = 'none' | 'preserve' | 'restore-root';

type ModelHistoryResult =
  | Readonly<{ status: 'applied' | 'empty' }>
  | Readonly<{ conflicts: readonly string[]; status: 'blocked' }>
  | Readonly<{ reason: string; status: 'blocked' }>;

export type EditableHistoryReplayResult =
  | ModelHistoryResult
  | Readonly<{
      reason: 'composing' | 'not-installed' | 'unmounted';
      status: 'unavailable';
    }>;

type CancelableCallback = {
  cancel: () => void;
};

const ELEMENT_NODE = 1;

const EDITABLE_RUNTIMES_BY_EDITOR_OWNER = new WeakMap<
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
  viewportRuntime,
  editor,
  selection,
}: {
  viewportRuntime: EditableViewportRuntime | null;
  editor: ReactRuntimeEditor;
  selection: Range | null;
}) => {
  const viewportSelection =
    viewportRuntime?.type === 'virtualized'
      ? isSelectionViewportBacked(
          selection,
          viewportRuntime.mountedTopLevelNodeKeys,
          viewportRuntime.mountedTopLevelRanges ?? null
        )
      : false;

  return viewportSelection || isRangeAcrossContentRootOwners(editor, selection);
};

/** Resolve the mounted root runtime that owns a DOM interaction target. */
export const findMountedEditableDOMRuntime = (
  node: Node
): EditableDOMRuntime | null => {
  const adapter = findDOMRootRuntime(node)?.adapter;

  return adapter instanceof EditableDOMRuntime ? adapter : null;
};

export const isDOMTargetInAnotherSelectionView = (
  editor: ReactRuntimeEditor,
  element: HTMLElement,
  target: Node | null
): boolean => {
  const runtime = target ? findMountedEditableDOMRuntime(target) : null;

  return (
    !!runtime &&
    runtime.rootRef.current !== element &&
    getEditorRuntimeOwner(runtime.editor) === getEditorRuntimeOwner(editor) &&
    runtime.editor.read.view.root() === editor.read.view.root()
  );
};

/** Resolve the connected runtime for a mounted React editor view. */
export const getMountedEditableDOMRuntimes = <
  V extends Value,
  TPlugins extends readonly unknown[],
>(
  editor: ReactRuntimeEditor<V, TPlugins>
): readonly EditableDOMRuntime[] =>
  [
    ...(EDITABLE_RUNTIMES_BY_EDITOR_OWNER.get(getEditorRuntimeOwner(editor)) ??
      []),
  ].filter((runtime) => runtime.connected && runtime.rootRef.current !== null);

/** Resolve one connected runtime for a mounted React editor view. */
export const getMountedEditableDOMRuntime = <
  V extends Value,
  TPlugins extends readonly unknown[],
>(
  editor: ReactRuntimeEditor<V, TPlugins>,
  root?: Node
): EditableDOMRuntime | null => {
  const owner = root
    ? findDOMRootRuntime(root)
    : findEditorDOMRootRuntime(editor);
  if (
    owner?.adapter instanceof EditableDOMRuntime &&
    Object.is(owner.editor, editor)
  ) {
    return owner.adapter;
  }

  const exact = getMountedEditableDOMRuntimes(editor).filter((runtime) =>
    Object.is(runtime.editor, editor)
  );

  if (exact.length === 1) return exact[0] ?? null;

  const viewRoot = editor.read.view.root();
  const sameRoot = getMountedEditableDOMRuntimes(editor).filter(
    (runtime) => runtime.editor.read.view.root() === viewRoot
  );

  const focused = sameRoot.filter((runtime) => {
    const element = runtime.rootRef.current;
    const activeElement = element?.ownerDocument.activeElement;

    return !!element && !!activeElement && element.contains(activeElement);
  });

  if (focused.length === 1) return focused[0] ?? null;

  return sameRoot.length === 1 ? (sameRoot[0] ?? null) : null;
};

export const hasMountedEditableCompositionOwner = (
  editor: ReactRuntimeEditor,
  excludedInputController: EditableInputController
) =>
  [
    ...(EDITABLE_RUNTIMES_BY_EDITOR_OWNER.get(getEditorRuntimeOwner(editor)) ??
      []),
  ].some(
    (runtime) =>
      runtime.connected &&
      runtime.inputController !== excludedInputController &&
      runtime.inputController.state.isComposing
  );

/** Subscribe to focus changes published by any mounted root of one runtime. */
export const subscribeEditableRuntimeFocus = <
  V extends Value,
  TPlugins extends readonly unknown[],
>(
  editor: ReactRuntimeEditor<V, TPlugins>,
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
  viewportRuntime: EditableViewportRuntime | null;
  onComposingChange: (nextValue: boolean) => void;
  onViewportBackedSelectionChange: (nextValue: boolean) => void;
  readOnly: boolean;
};

/** Private imperative owner for one mounted editable root. */
export class EditableDOMRuntime {
  readonly externalText = new ExternalTextRuntime(this);
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

  private viewportRuntimeValue: EditableViewportRuntime | null;

  private readonly editorValue: ReactRuntimeEditor;

  private integrityRepairHandler: (
    evidence: DOMIntegrityRepairEvidence
  ) => void = () => {};

  private selectionExportAfterDOMCommitHandler: () => void = () => {};
  private historyFocusHandler: (policy: EditorHistoryFocusPolicy) => void =
    () => {};

  private historySettleHandler: () => void = () => {};

  private externalMouseGesture = false;

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

  private compositionPathValue: Path | null = null;

  private didAutoFocus = false;

  private onComposingChange: (nextValue: boolean) => void;

  private onDOMSelectionChange: CancelableCallback | null = null;

  private onViewportBackedSelectionChange: (nextValue: boolean) => void;

  private readOnlyValue: boolean;

  private scheduleOnDOMSelectionChange:
    | (CancelableCallback & (() => void))
    | null = null;

  private readonly rootRuntime: DOMRootRuntime<HTMLDivElement>;

  private cancelUserInputFrameTask: (() => void) | null = null;

  private cancelSelectionExportFrameTask: (() => void) | null = null;

  private cancelSelectionExportMicrotask: (() => void) | null = null;

  private verticalGoalFocus: Point | null = null;

  private verticalGoalOwner: object | null = null;

  private verticalGoalX: number | null = null;

  constructor({
    viewportRuntime = null,
    editor,
    onComposingChange = () => {},
    onViewportBackedSelectionChange = () => {},
    readOnly = false,
    testRootFacts,
  }: Partial<EditableDOMRuntimeUpdate> & {
    editor: ReactRuntimeEditor;
    testRootFacts?: DOMRootRuntimeOptions<HTMLDivElement>['testRootFacts'];
  }) {
    this.viewportRuntimeValue = viewportRuntime;
    this.editorValue = editor;
    this.onComposingChange = onComposingChange;
    this.onViewportBackedSelectionChange = onViewportBackedSelectionChange;
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
          '[data-editor-node="text"]'
        );
        const zeroWidth = targetElement?.closest<HTMLElement>(
          '[data-editor-zero-width]'
        );
        const flowEntry = resolveDOMTextFlowEntry(mutation.target, 0);
        const path = flowEntry
          ? ([...flowEntry.path] as Path)
          : textHost
            ? getPliteNodePathFromDOMElement(textHost)
            : null;

        if (
          textHost?.hasAttribute('data-editor-text-flow-host') &&
          this.receivedUserInput.current &&
          this.inputController.state.activeIntent === 'text-insert'
        ) {
          return true;
        }

        const modelText = path
          ? readRuntimeText(this.editorValue, path)?.text
          : null;

        if (zeroWidth) {
          return modelText !== null && mutation.target.nodeValue === '\uFEFF';
        }

        if (flowEntry && modelText !== null) {
          return (
            resolveDOMTextFlowRecordDOMText(
              flowEntry.host,
              flowEntry.nodeKey
            ) === modelText
          );
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
          () => this.externalText.destroy(),
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
          '[data-editor-node], [data-editor-path]'
        );
        const flowEntry = resolveDOMTextFlowEntry(mutation.target, 0);
        const path = flowEntry
          ? ([...flowEntry.path] as Path)
          : pliteElement
            ? getPliteNodePathFromDOMElement(pliteElement)
            : null;

        if (path) return path.join(',');

        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-editor-path'
        ) {
          return mutation.oldValue;
        }

        return pliteElement?.getAttribute('data-editor-path') ?? null;
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

  get viewportRuntime() {
    return this.viewportRuntimeValue;
  }

  get domCoverage() {
    return this.rootRuntime.domCoverage;
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

  get rootElement() {
    return this.rootRef.current;
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

  claimAutoFocus() {
    if (this.didAutoFocus) return false;

    this.didAutoFocus = true;

    return true;
  }

  hasHostQuirk(quirk: Parameters<DOMRootRuntime['hasHostQuirk']>[0]) {
    return this.rootRuntime.hasHostQuirk(quirk);
  }

  readonly subscribeHostFacts = (listener: () => void) =>
    this.rootRuntime.subscribeHostFacts(listener);

  domIntegrityDiagnostics() {
    return this.rootRuntime.diagnostics();
  }

  readonly isViewportBackedSelection = (selection: Range | null) =>
    isEditableDOMSelectionPartial({
      viewportRuntime: this.viewportRuntimeValue,
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
    this.compositionPathValue = nextValue
      ? (() => {
          const selection = this.editorValue.read((state) => state.selection());

          return selection ? [...RangeApi.edges(selection)[0].path] : null;
        })()
      : null;
    setEditableComposingState({
      editor: this.editorValue,
      inputController: this.inputController,
      nextValue,
      preserveEditorComposing: !nextValue && this.hasSiblingCompositionOwner(),
      setIsComposing: this.onComposingChange,
    });
  };

  get compositionPath() {
    return this.compositionPathValue;
  }

  readonly setExplicitViewportBackedSelection = (nextValue: boolean) => {
    this.onViewportBackedSelectionChange(nextValue);
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

  retainsEveryTextFlowNodeKey(nodeKeys: readonly NodeKey[]) {
    return (
      nodeKeys.length > 0 &&
      nodeKeys.every(
        (nodeKey) =>
          this.externalText.retains(nodeKey) ||
          isPliteNodeFlowRootBound(this.editorValue, nodeKey, this.rootElement)
      )
    );
  }

  requiresReactCommit(commit: EditorCommit) {
    const textNodeKeys = commit.changed.nodeKeysAll('text');

    return !(
      this.retainsEveryTextFlowNodeKey(textNodeKeys) &&
      !commit.changed.hasAny('structure') &&
      !commit.changed.hasAny('properties') &&
      !commit.changed.hasAny('root-order') &&
      !commit.changed.hasAny('replace') &&
      !commit.changed.hasAny('marks') &&
      !commit.changed.hasAny('state')
    );
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

  get externalMouseGestureActive() {
    return this.externalMouseGesture;
  }

  setExternalMouseGesture(active: boolean) {
    this.externalMouseGesture = active;
  }

  requestSelectionExportAfterDOMCommit() {
    if (!this.cancelSelectionExportMicrotask) {
      this.cancelSelectionExportMicrotask = this.domPhaseScheduler.schedule(
        'selection-repair',
        'node-bind-selection-export-microtask',
        () => {
          this.cancelSelectionExportMicrotask = null;
          this.cancelSelectionExportFrameTask?.();
          this.cancelSelectionExportFrameTask = this.domPhaseScheduler.schedule(
            'selection-repair',
            'node-bind-selection-export-frame',
            () => {
              this.cancelSelectionExportFrameTask = null;
              this.selectionExportAfterDOMCommitHandler();
            },
            {
              key: 'node-bind-selection-export-frame',
              timing: 'animation-frame',
            }
          );
          this.selectionExportAfterDOMCommitHandler();
        },
        {
          key: 'node-bind-selection-export-microtask',
          timing: 'microtask',
        }
      );
    }
  }

  runOwnedDOMMutation<T>(
    owner: DOMIntegrityMutationOwner,
    callback: () => T
  ): T {
    return this.rootRuntime.runOwnedDOMMutation(owner, callback);
  }

  runUnobservedDOMMutation<T>(callback: () => T): T {
    return this.rootRuntime.runUnobservedDOMMutation(callback);
  }

  releaseDisposable(key: string) {
    this.rootRuntime.releaseDisposable(key);
  }

  setRoot(node: HTMLDivElement | null) {
    this.rootRuntime.setRoot(node);
  }

  publishAndroidInputManager(inputManager: AndroidInputManager | null) {
    this.androidInputManagerRef.current = inputManager;
  }

  clearAndroidInputManager(inputManager: AndroidInputManager | null) {
    if (this.androidInputManagerRef.current === inputManager) {
      this.androidInputManagerRef.current = null;
    }
  }

  publishDOMRepairQueue(queue: DOMRepairQueue) {
    this.domRepairQueueRef.current = queue;
  }

  updateDOMIntegrityRepairHandler(
    handler: (evidence: DOMIntegrityRepairEvidence) => void
  ) {
    this.integrityRepairHandler = handler;
  }

  updateSelectionExportAfterDOMCommitHandler(handler: () => void) {
    this.selectionExportAfterDOMCommitHandler = handler;
  }

  updateHistoryFocusHandler(
    handler: (policy: EditorHistoryFocusPolicy) => void
  ) {
    this.historyFocusHandler = handler;
  }

  updateHistorySettleHandler(handler: () => void) {
    this.historySettleHandler = handler;
  }

  async replayHistory(
    direction: 'redo' | 'undo',
    focusPolicy: EditorHistoryFocusPolicy = 'restore-root'
  ): Promise<EditableHistoryReplayResult> {
    const root = this.rootElement;

    if (!this.connected || !root) {
      return { reason: 'unmounted', status: 'unavailable' };
    }
    if (!getInstalledPlugin(this.editorValue, 'history')) {
      return { reason: 'not-installed', status: 'unavailable' };
    }
    if (this.state.isComposing) {
      return { reason: 'composing', status: 'unavailable' };
    }

    const { pendingCompositionEnd } = this.state;

    if (pendingCompositionEnd?.ownership === 'plite') {
      pendingCompositionEnd.flush();
    } else {
      pendingCompositionEnd?.cancel();
    }
    this.state.pendingCompositionEnd?.cancel();
    this.state.pendingCompositionEnd = null;
    this.androidInputManagerRef.current?.flush();
    this.historySettleHandler();

    if (!this.connected || this.rootElement !== root) {
      return { reason: 'unmounted', status: 'unavailable' };
    }
    if (this.state.isComposing) {
      return { reason: 'composing', status: 'unavailable' };
    }

    const { history } = this.editorValue.api as unknown as {
      history?: {
        redo: () => Promise<ModelHistoryResult>;
        undo: () => Promise<ModelHistoryResult>;
      };
    };

    if (!history) {
      return { reason: 'not-installed', status: 'unavailable' };
    }

    const previousViewSelection = readPliteViewSelection(this.editorValue);
    const run = () => history[direction]();

    writePliteViewSelection(this.editorValue, null);
    try {
      const result = await (focusPolicy === 'preserve'
        ? withUpdateTagContext(
            this.editorValue,
            PLITE_REACT_PRESERVE_SELECTION_TAGS,
            run
          )
        : run());

      if (result.status !== 'applied') {
        writePliteViewSelection(this.editorValue, previousViewSelection);
        return result;
      }

      const receipt = readEditorHistoryReplayReceipt(result);

      if (
        !receipt ||
        this.editorValue.read((state) => state.lastCommit()?.version) !==
          receipt.version
      ) {
        return result;
      }

      writePliteViewSelection(
        this.editorValue,
        readPliteViewSelectionHistoryGroup(receipt.group, direction) ?? null
      );
      this.historyFocusHandler(focusPolicy);
      return result;
    } catch (error) {
      writePliteViewSelection(this.editorValue, previousViewSelection);
      throw error;
    }
  }

  update(update: EditableDOMRuntimeUpdate) {
    const readOnlyChanged = this.readOnlyValue !== update.readOnly;
    this.viewportRuntimeValue = update.viewportRuntime;
    this.onComposingChange = update.onComposingChange;
    this.onViewportBackedSelectionChange =
      update.onViewportBackedSelectionChange;
    this.readOnlyValue = update.readOnly;
    if (readOnlyChanged) this.externalText.refreshAll();
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
    scheduleOnDOMSelectionChange: CancelableCallback & (() => void);
  }) {
    this.onDOMSelectionChange = onDOMSelectionChange;
    this.scheduleOnDOMSelectionChange = scheduleOnDOMSelectionChange;
  }

  cancelSelectionChangeHandlers() {
    this.onDOMSelectionChange?.cancel();
    this.scheduleOnDOMSelectionChange?.cancel();
    this.inputController.state.pendingDOMSelectionImport = false;
  }

  private attachNativeInputListeners() {
    const node = this.rootRef.current;

    if (!this.connected || !node || this.nativeInputListenersCleanup) return;

    const handleBeforeInput = (event: InputEvent) => {
      if (getEditableInteractionOwner(node, event.target) === 'external-text') {
        return;
      }
      this.nativeInputHandlers.beforeInput?.(event);
    };
    const handleInput = (event: Event) => {
      if (getEditableInteractionOwner(node, event.target) === 'external-text') {
        return;
      }
      this.nativeInputHandlers.input?.(event);
    };

    const detachSelectionChangeListener = attachEditableSelectionChangeListener(
      {
        root: node,
        scheduleOnDOMSelectionChange: () =>
          this.scheduleOnDOMSelectionChange?.(),
        state: this.inputController.state,
      }
    );
    node.addEventListener('beforeinput', handleBeforeInput);
    node.addEventListener('input', handleInput);
    this.nativeInputListenersCleanup = () => {
      detachSelectionChangeListener();
      node.removeEventListener('beforeinput', handleBeforeInput);
      node.removeEventListener('input', handleInput);
    };
  }

  private connectVerticalGoalOwner() {
    const owner = getEditorRuntimeOwner(this.editorValue);

    if (this.verticalGoalOwner === owner) return;

    this.disconnectVerticalGoalOwner();
    const runtimes = EDITABLE_RUNTIMES_BY_EDITOR_OWNER.get(owner) ?? new Set();

    runtimes.add(this);
    EDITABLE_RUNTIMES_BY_EDITOR_OWNER.set(owner, runtimes);
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
        this.externalMouseGesture = false;
      },
      () => {
        const cancelMicrotask = this.cancelSelectionExportMicrotask;
        const cancelFrame = this.cancelSelectionExportFrameTask;

        this.cancelSelectionExportMicrotask = null;
        this.cancelSelectionExportFrameTask = null;
        cancelMicrotask?.();
        cancelFrame?.();
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
        this.compositionPathValue = null;
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
      ...(EDITABLE_RUNTIMES_BY_EDITOR_OWNER.get(
        getEditorRuntimeOwner(this.editorValue)
      ) ?? []),
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

    const runtimes = EDITABLE_RUNTIMES_BY_EDITOR_OWNER.get(owner);

    runtimes?.delete(this);
    if (runtimes?.size === 0) {
      EDITABLE_RUNTIMES_BY_EDITOR_OWNER.delete(owner);
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
      ? EDITABLE_RUNTIMES_BY_EDITOR_OWNER.get(this.verticalGoalOwner)
      : null;

    for (const runtime of runtimes ?? [this]) {
      runtime.verticalGoalFocus = focus;
      runtime.verticalGoalX = x;
    }
  }
}
