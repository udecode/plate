import {
  type Anchor,
  type EditorCommit,
  type HistoryApi,
  type HistoryOutcome,
  type NodeKey,
  type Path,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  type TransferOutcome,
  type Value,
} from '../..';
import { reportEditorLifecycleError } from '../../core/lifecycle-error';
import { getInstalledPlugin } from '../../core/plugin';
import {
  readEditorHistoryReplayReceipt,
  withUpdateTagContext,
} from '../../core/public-state';
import { watchFirstPlacement } from '../../core/view-carets';
import type { DataTransferDiagnostic, DOMRange } from '../../dom';
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
  observeDataTransferInsertion,
  resolveDOMReach,
  resolveDOMTargetView,
  resolveDOMTextFlowEntry,
  resolveDOMTextFlowRecordDOMText,
} from '../../dom/internal';
import { isDOMNode } from '../../dom/utils/dom';
import type { EditableViewportRuntime } from '../components/editable';
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager';
import { supersedeEditableFocusRequests } from '../hooks/focus-plite-editable';
import {
  getPliteNodePathFromDOMElement,
  isPliteNodeFlowRootBound,
} from '../hooks/use-plite-node-ref';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { PLITE_REACT_PRESERVE_SELECTION_TAGS } from '../update-policy';
import {
  readPliteViewSelectionHistoryGroup,
  writePliteViewSelection,
} from '../view-selection';
import { isSelectionViewportBacked } from '../viewport-commands';
import {
  type AndroidCompositionEndReason,
  finishAndroidComposition,
} from './android-composition';
import { CompositionLease } from './composition-lease';
import { isRangeAcrossContentRootOwners } from './content-root-owners';
import type { DOMRepairQueue } from './dom-repair-queue';
import { ExternalTextRuntime } from './external-text-runtime';
import {
  createEditableInputController,
  createEditableInputControllerState,
  setEditableComposingState,
} from './input-controller';
import {
  cancelCompositionReceipt,
  captureEditableCompositionRuntimeMarks,
  clearEditableCompositionRuntimeState,
  type EditableInputController,
  restoreEditableCompositionRuntimeMarks,
} from './input-state';
import { getEditableInteractionOwner } from './interaction-owner';
import type { DeferredMutation } from './model-input-strategy';
import { RenderContractMonitor } from './render-contract-monitor';
import {
  getEditorRuntimeOwner,
  setEditorComposing,
} from './runtime-editor-api';
import { readRuntimeText } from './runtime-live-state';
import { importUnreadPressCaret } from './runtime-selection-engine';
import { attachEditableSelectionChangeListener } from './selection-change-listener';
import { SelectionClaims } from './selection-claim';
import { setEditableModelSelectionPreference } from './selection-controller';
import { UnreadPress } from './unread-press';
import {
  activateViewCaret,
  clampCaretAtRegistration,
} from './view-caret-restore';

type MutableCell<T> = { current: T };

/** Focus behavior after mounted undo or redo applies a history batch. */
export type EditorHistoryFocusPolicy = 'none' | 'preserve' | 'restore-root';

export type EditableHistoryReplayResult =
  | HistoryOutcome
  | Readonly<{
      reason: 'composing' | 'not-installed' | 'unmounted';
      status: 'unavailable';
    }>;

export type EditableHistoryReplayEvent = Readonly<{
  direction: 'redo' | 'undo';
  result: EditableHistoryReplayResult;
}>;

/** Outcome of one paste that an editable's built-in insertion handled. */
export type EditablePasteResult = Readonly<{
  /**
   * Format reports for the inserted payload, plus loss from payloads that
   * could not be used. `impact: 'lossy'` means pasted content was left out.
   */
  diagnostics: readonly DataTransferDiagnostic[];
  /** Whether the paste committed content. */
  inserted: boolean;
}>;

/** What one drop the Editable settled did. */
export type EditableDropResult =
  | Readonly<{
      kind: 'data';
      /** Format reports for external data inserted on the paste path. */
      diagnostics: readonly DataTransferDiagnostic[];
      inserted: boolean;
    }>
  | Readonly<{ kind: 'transfer'; outcome: TransferOutcome }>;

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

export const focusPressedView = (target: EventTarget | null | undefined) => {
  const runtime = isDOMNode(target) ? findDOMRootRuntime(target) : null;
  const root = runtime?.rootRef.current;

  if (root && !runtime.holdsFocus()) root.focus({ preventScroll: true });
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

  const view = root
    ? resolveDOMTargetView(editor, root)
    : resolveDOMReach(editor);
  const reached = getMountedEditableDOMRuntimes(editor).filter((runtime) =>
    Object.is(runtime.editor, view)
  );

  if (reached.length <= 1) return reached[0] ?? null;

  return reached.find((runtime) => runtime.lastActive) ?? null;
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
  onHistoryReplay: (event: EditableHistoryReplayEvent) => void;
  onDropResult: (result: EditableDropResult) => void;
  onPasteResult: (result: EditablePasteResult) => void;
  onViewportBackedSelectionChange: (nextValue: boolean) => void;
  readOnly: boolean;
};

/** Private imperative owner for one mounted editable root. */
export class EditableDOMRuntime {
  readonly externalText = new ExternalTextRuntime(this);
  readonly renderContract = new RenderContractMonitor(this);
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

  readonly webKitProbeActive: MutableCell<boolean> = { current: false };

  readonly receivedUserInput: MutableCell<boolean> = { current: false };

  readonly rootRef: MutableCell<HTMLDivElement | null>;

  private viewportRuntimeValue: EditableViewportRuntime | null;

  private readonly editorValue: ReactRuntimeEditor;

  readonly unreadPress: UnreadPress;

  private integrityRepairHandler: (
    evidence: DOMIntegrityRepairEvidence
  ) => void = () => {};

  private selectionExportAfterDOMCommitHandler: () => void = () => {};
  readonly compositionLease = new CompositionLease();

  private readonly deferredCompositionDOMWrites = new Map<
    globalThis.Node,
    () => void
  >();
  private historyFocusHandler: (policy: EditorHistoryFocusPolicy) => void =
    () => {};

  private historySettleHandler: () => void = () => {};

  private historyReplayHandler: (event: EditableHistoryReplayEvent) => void =
    () => {};

  private pasteResultHandler: (result: EditablePasteResult) => void = () => {};
  private dropResultHandler: (result: EditableDropResult) => void = () => {};

  private externalMouseGesture = false;
  private cancelPressTask: (() => void) | null = null;
  private inEditableMouseUp = false;

  private readonly nativeInputHandlers: {
    beforeInput: ((event: InputEvent) => void) | null;
    input: ((event: Event) => void) | null;
  } = {
    beforeInput: null,
    input: null,
  };

  private nativeInputListenersCleanup: (() => void) | null = null;

  private selectionClaimsValue: SelectionClaims | null = null;

  private modelSelectionDOMPreference: ModelSelectionDOMPreference | null =
    null;

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
    onHistoryReplay = () => {},
    onDropResult = () => {},
    onPasteResult = () => {},
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
    this.historyReplayHandler = onHistoryReplay;
    this.pasteResultHandler = onPasteResult;
    this.dropResultHandler = onDropResult;
    this.onViewportBackedSelectionChange = onViewportBackedSelectionChange;
    this.readOnlyValue = readOnly;
    this.rootRuntime = new DOMRootRuntime({
      adapter: this,
      afterRootMount: () => {
        this.attachNativeInputListeners();
        this.renderContract.afterRootMount();
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
      isCompositionLeasedMutation: (mutation) =>
        this.compositionLease.protectsMutation(mutation),
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
      onRegisterBoundary: (boundary) =>
        clampCaretAtRegistration(this.editorValue, boundary),
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
          () => this.unreadPress.markRead(),
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
    this.unreadPress = new UnreadPress(
      editor,
      () => this.rootRef.current,
      this.domPhaseScheduler.schedule
    );
    this.inputController = createEditableInputController({
      domInputRuntime: this.domInputRuntime,
      preferModelSelectionForInputRef: { current: false },
      scheduleTask: this.domPhaseScheduler.schedule,
      state: createEditableInputControllerState(this.domInputRuntime),
    });
  }

  get selectionClaims() {
    return this.selectionClaimsValue;
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

  get lastActive() {
    return this.rootRuntime.lastActive;
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
    setEditableComposingState({
      editor: this.editorValue,
      inputController: this.inputController,
      nextValue,
      preserveEditorComposing: !nextValue && this.hasSiblingCompositionOwner(),
      setIsComposing: this.onComposingChange,
    });
    if (!nextValue && this.deferredCompositionDOMWrites.size > 0) {
      this.domPhaseScheduler.schedule(
        'dom-write',
        'composition-deferred-dom-write',
        () => {
          const writes = [...this.deferredCompositionDOMWrites.values()];

          this.deferredCompositionDOMWrites.clear();
          runAllRuntimeSteps(writes);
        },
        { key: 'composition-deferred-dom-write' }
      );
    }
  };

  finishAndroidComposition(reason: AndroidCompositionEndReason) {
    finishAndroidComposition({
      editor: this.editorValue,
      inputController: this.inputController,
      reason,
      setComposing: this.setComposing,
    });
  }

  shouldDeferCompositionSelectionExport() {
    const epoch = this.inputController.domInputRuntime.compositionEpoch;
    const anchors = Array.isArray(epoch?.anchor)
      ? epoch.anchor
      : [epoch?.anchor];

    return !!(
      this.state.isComposing &&
      anchors.some(
        (anchor) => isDOMNode(anchor) && this.rootElement?.contains(anchor)
      ) &&
      epoch?.phase !== 'committing' &&
      epoch?.phase !== 'repairing'
    );
  }

  isCompositionDOMNodeProtected(node: globalThis.Node) {
    if (this.compositionLease.protects(node)) return true;
    const epoch = this.inputController.domInputRuntime.compositionEpoch;
    const anchors = Array.isArray(epoch?.anchor)
      ? epoch.anchor
      : [epoch?.anchor];

    if (!this.state.isComposing || !this.rootElement) return false;
    if (
      !anchors.some(
        (anchor) => isDOMNode(anchor) && this.rootElement?.contains(anchor)
      )
    ) {
      return false;
    }

    return anchors.some(
      (anchor) =>
        isDOMNode(anchor) && (node.contains(anchor) || anchor.contains(node))
    );
  }

  hasPendingInputWork() {
    const { pendingCompositionEnd } = this.state;

    return (
      this.state.isComposing ||
      (pendingCompositionEnd !== null &&
        pendingCompositionEnd.ownership !== 'settled') ||
      this.deferredCompositionDOMWrites.size > 0 ||
      this.compositionLease.held ||
      !!this.androidInputManagerRef.current?.hasPendingAction()
    );
  }

  deferCompositionDOMWrite(node: globalThis.Node, write: () => void) {
    if (this.compositionLease.queue(node, write)) return true;
    if (!this.isCompositionDOMNodeProtected(node)) return false;

    this.deferredCompositionDOMWrites.set(node, write);
    return true;
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
    this.importUnreadPressCaret();
    this.rootRuntime.prepareHostCommit();
  }

  readonly importUnreadPressBeforeUnmount = (node: Node | null) => {
    if (!node && this.importUnreadPressCaret()) {
      this.requestSelectionExportAfterDOMCommit();
    }
  };

  private importUnreadPressCaret() {
    return importUnreadPressCaret({
      editor: this.editorValue,
      inputController: this.inputController,
      unreadPress: this.unreadPress,
    });
  }

  completeReactCommit() {
    this.compositionLease.completeRender();
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

  /**
   * Whether a focus belongs to a press in this Editable, whose own placement
   * wins over the view's activation.
   */
  get mousePressActive() {
    return this.cancelPressTask !== null || this.inEditableMouseUp;
  }

  /**
   * The browser's focus and selection for a press land within one task of its
   * mousedown, so the press window closes at the next zero-delay timeout.
   */
  beginMousePress() {
    supersedeEditableFocusRequests(this.editorValue);
    this.cancelPressTask?.();

    const cancel = this.domPhaseScheduler.schedule(
      'model',
      'mouse-press-window',
      () => {
        this.cancelPressTask = null;
      },
      { timing: 'timeout' }
    );

    this.cancelPressTask = () => {
      cancel();
      this.cancelPressTask = null;
    };
  }

  beginCaretKey() {
    supersedeEditableFocusRequests(this.editorValue);
    this.selectionClaimsValue?.openKeyGesture();
  }

  duringEditableMouseUp(handler: () => void) {
    this.inEditableMouseUp = true;
    try {
      handler();
    } finally {
      this.inEditableMouseUp = false;
    }
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
    const imported = this.importUnreadPressCaret();
    const result = this.rootRuntime.runOwnedDOMMutation(owner, callback);

    if (imported) this.requestSelectionExportAfterDOMCommit();

    return result;
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

  settleInput(): boolean {
    const root = this.rootElement;

    const { pendingCompositionEnd } = this.state;

    if (!this.connected || !root) return false;
    // Unlike a desktop IME, an Android run can be ended from script: it
    // commits the composed text and settles like the manager's pending input.
    this.finishAndroidComposition('settle');
    if (this.state.isComposing && !pendingCompositionEnd) return false;

    if (pendingCompositionEnd?.ownership === 'editor') {
      pendingCompositionEnd.flush();
    } else {
      pendingCompositionEnd?.cancel();
    }
    this.state.pendingCompositionEnd?.cancel();
    this.state.pendingCompositionEnd = null;
    this.androidInputManagerRef.current?.flush();
    this.historySettleHandler();

    return (
      this.connected && this.rootElement === root && !this.state.isComposing
    );
  }

  private async replayHistory(
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
    this.finishAndroidComposition('settle');
    if (this.state.isComposing) {
      return { reason: 'composing', status: 'unavailable' };
    }
    if (!this.settleInput()) {
      return this.connected && this.rootElement === root
        ? { reason: 'composing', status: 'unavailable' }
        : { reason: 'unmounted', status: 'unavailable' };
    }

    const { history } = this.editorValue.api as { history?: HistoryApi };

    if (!history) {
      return { reason: 'not-installed', status: 'unavailable' };
    }

    const targetDocument = root.ownerDocument;
    let presentationInvalidated = false;
    const invalidatePresentation = () => {
      presentationInvalidated = true;
    };
    const version =
      this.editorValue.read((state) => state.lastCommit()?.version) ?? 0;
    const run = () => history[direction]();
    // The replay places first; a placement made while it settles is newer.
    const stopPlacements = watchFirstPlacement(this.editorValue);
    let placedAt: number;

    targetDocument.addEventListener('focusin', invalidatePresentation, true);
    targetDocument.addEventListener(
      'pointerdown',
      invalidatePresentation,
      true
    );

    let result: HistoryOutcome;

    try {
      const replayed =
        focusPolicy === 'preserve'
          ? withUpdateTagContext(
              this.editorValue,
              PLITE_REACT_PRESERVE_SELECTION_TAGS,
              run
            )
          : run();

      // A settled result also waits one microtask, so focus repair has one timing for every replay.
      result = await (replayed.status === 'pending'
        ? replayed.settled
        : Promise.resolve(replayed));
    } finally {
      placedAt = stopPlacements();
      targetDocument.removeEventListener(
        'focusin',
        invalidatePresentation,
        true
      );
      targetDocument.removeEventListener(
        'pointerdown',
        invalidatePresentation,
        true
      );
    }

    if (result.status !== 'applied') return result;

    const receipt = readEditorHistoryReplayReceipt(result);

    if (
      !receipt ||
      !this.connected ||
      this.rootElement !== root ||
      presentationInvalidated ||
      receipt.version !== (receipt.claimVersion ?? version) + 1 ||
      this.editorValue.read((state) => state.lastCommit()?.version) !==
        receipt.version
    ) {
      return result;
    }

    this.observeHistoryReplay(direction, () =>
      writePliteViewSelection(
        this.editorValue,
        readPliteViewSelectionHistoryGroup(receipt.group, direction) ?? null,
        { placedAt }
      )
    );
    this.observeHistoryReplay(direction, () =>
      this.historyFocusHandler(focusPolicy)
    );
    return result;
  }

  private reportHistoryReplayError(
    direction: 'redo' | 'undo',
    phase: 'observer' | 'replay',
    cause: unknown
  ) {
    reportEditorLifecycleError({
      cause,
      direction,
      editor: this.editorValue,
      phase,
      source: 'history',
    });
  }

  private observeHistoryReplay(direction: 'redo' | 'undo', step: () => void) {
    try {
      step();
    } catch (error) {
      this.reportHistoryReplayError(direction, 'observer', error);
    }
  }

  dispatchHistory(
    direction: 'redo' | 'undo',
    focusPolicy: EditorHistoryFocusPolicy = 'restore-root',
    onFulfilled?: (result: EditableHistoryReplayResult) => void
  ): void {
    void this.replayHistory(direction, focusPolicy).then(
      (result) => {
        this.observeHistoryReplay(direction, () =>
          this.historyReplayHandler({ direction, result })
        );
        this.observeHistoryReplay(direction, () => onFulfilled?.(result));
      },
      (error: unknown) => {
        this.reportHistoryReplayError(direction, 'replay', error);
      }
    );
  }

  /**
   * Run one user paste in this view. Its built-in insertion outcome reaches
   * this view's current `onPasteResult` once, and only while it is mounted.
   */
  readonly runPaste = <T>(paste: () => T): T =>
    observeDataTransferInsertion(
      this.editorValue,
      (inserted, diagnostics) => {
        if (!this.connected) return;

        this.pasteResultHandler(Object.freeze({ diagnostics, inserted }));
      },
      paste
    );

  readonly reportDrop = (outcome: TransferOutcome) => {
    if (this.connected) {
      this.dropResultHandler(Object.freeze({ kind: 'transfer', outcome }));
    }
  };

  readonly runDrop = <T>(drop: () => T): T =>
    observeDataTransferInsertion(
      this.editorValue,
      (inserted, diagnostics) => {
        if (!this.connected) return;

        this.dropResultHandler(
          Object.freeze({ diagnostics, inserted, kind: 'data' })
        );
      },
      drop
    );

  update(update: EditableDOMRuntimeUpdate) {
    const readOnlyChanged = this.readOnlyValue !== update.readOnly;
    this.viewportRuntimeValue = update.viewportRuntime;
    this.onComposingChange = update.onComposingChange;
    this.historyReplayHandler = update.onHistoryReplay;
    this.pasteResultHandler = update.onPasteResult;
    this.dropResultHandler = update.onDropResult;
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
      const owner = getEditableInteractionOwner(node, event.target);

      if (owner === 'external-text') return;
      if (
        owner !== 'nested-editor' &&
        !this.webKitProbeActive.current &&
        activateViewCaret(this.editorValue)
      ) {
        setEditableModelSelectionPreference({
          inputController: this.inputController,
          preferModelSelection: true,
          reason: 'model-command',
          selectionSource: 'model-owned',
        });
      }
      this.nativeInputHandlers.beforeInput?.(event);
    };
    const handleInput = (event: Event) => {
      if (getEditableInteractionOwner(node, event.target) === 'external-text') {
        return;
      }
      this.nativeInputHandlers.input?.(event);
    };

    // A page's document-capture pointerdown can focus the Editable and prevent
    // the mousedown, so the press opens here, before any document listener.
    const notePointerPress = (event: PointerEvent) => {
      const inRoot = event.composedPath().includes(node);

      this.unreadPress.pointerDown(
        inRoot &&
          this.readOnlyValue &&
          getEditableInteractionOwner(node, event.target) === 'editor'
      );
      if (inRoot) this.beginMousePress();
    };
    const ownerWindow = node.ownerDocument.defaultView;
    const claims = new SelectionClaims(
      this.editorValue,
      node,
      this.domPhaseScheduler.schedule,
      () => {
        if (!this.state.isComposing) {
          this.selectionExportAfterDOMCommitHandler();
        }
      }
    );

    this.selectionClaimsValue = claims;
    const detachSelectionChangeListener = attachEditableSelectionChangeListener(
      {
        root: node,
        scheduleOnDOMSelectionChange: () => {
          claims.observeSelection();
          this.scheduleOnDOMSelectionChange?.();
        },
        state: this.inputController.state,
      }
    );
    node.addEventListener('beforeinput', handleBeforeInput);
    node.addEventListener('input', handleInput);
    ownerWindow?.addEventListener('pointerdown', notePointerPress, true);
    this.nativeInputListenersCleanup = () => {
      claims.destroy();
      this.selectionClaimsValue = null;
      detachSelectionChangeListener();
      node.removeEventListener('beforeinput', handleBeforeInput);
      node.removeEventListener('input', handleInput);
      ownerWindow?.removeEventListener('pointerdown', notePointerPress, true);
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
        this.cancelPressTask?.();
        this.deferredCompositionDOMWrites.clear();
        this.compositionLease.release();
      },
      () => this.renderContract.beforeRootTeardown(),
      () => {
        const cancelMicrotask = this.cancelSelectionExportMicrotask;
        const cancelFrame = this.cancelSelectionExportFrameTask;

        this.cancelSelectionExportMicrotask = null;
        this.cancelSelectionExportFrameTask = null;
        cancelMicrotask?.();
        cancelFrame?.();
      },
      () => {
        if (pendingCompositionEnd?.ownership === 'editor') {
          pendingCompositionEnd.flush({ publish: false });
        } else {
          pendingCompositionEnd?.cancel();
        }
      },
      () => this.inputController.state.pendingCompositionEnd?.cancel(),
      () => cancelCompositionReceipt(this.inputController),
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
