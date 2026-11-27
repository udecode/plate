import type { RefObject } from 'react';

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
  type RootKey,
  type TransferOutcome,
  type Value,
} from '../..';
import { reportEditorLifecycleError } from '../../core/lifecycle-error';
import { getInstalledPlugin } from '../../core/plugin';
import {
  type EditorHistoryReplayReceipt,
  getMutationVersion,
  readEditorHistoryReplayReceipt,
  withUpdateTagContext,
} from '../../core/public-state';
import {
  markRootViewUsed,
  readLatestShownWritableRootView,
  readRootContentTarget,
} from '../../core/root-target';
import {
  getPlacementGeneration,
  placedSince,
  setSelectionAsView,
  watchFirstPlacement,
} from '../../core/view-carets';
import {
  containsShadowAware,
  type DataTransferDiagnostic,
  type DOMRange,
  getSelection,
} from '../../dom';
import {
  clearAfterInsertCaret,
  isSoftLineTextStale,
  noteAfterInsertCaret,
} from '../../dom/dom-soft-line-end';
import {
  DOMRootRuntime,
  type DOMRootRuntimeOptions,
  type DOMRootSelectionExportOptions,
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
import {
  focusEditableElement,
  watchFocusSuperseded,
} from '../../dom/plugin/dom-editor';
import {
  focusedElementOnPage,
  isElementFocused,
} from '../../dom/plugin/dom-root-runtime';
import { isDOMNode } from '../../dom/utils/dom';
import type {
  EditableHandlerContext,
  EditableViewportRuntime,
} from '../components/editable';
import { readHistoryStepUndoRange } from '../history-step-views';
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager';
import {
  focusSelectionTarget,
  hasExpandedViewSelection,
  supersedeEditableFocusRequests,
} from '../hooks/focus-plite-editable';
import {
  getPliteNodePathFromDOMElement,
  isPliteNodeFlowRootBound,
} from '../hooks/use-plite-node-ref';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { toPublicRootOption } from '../root-key';
import { PLITE_REACT_PRESERVE_SELECTION_TAGS } from '../update-policy';
import {
  readPliteViewSelection,
  writePliteViewSelection,
} from '../view-selection';
import { isSelectionViewportBacked } from '../viewport-commands';
import {
  type AndroidCompositionEndReason,
  finishAndroidComposition,
} from './android-composition';
import { isElementDrawn } from './caret-engine';
import { CompositionLease } from './composition-lease';
import { isRangeAcrossContentRootOwners } from './content-root-owners';
import type { DOMRepairQueue } from './dom-repair-queue';
import { ExternalTextRuntime } from './external-text-runtime';
import {
  createEditableInputController,
  createEditableInputControllerState,
  isInteractiveInternalTarget,
  setEditableComposingState,
} from './input-controller';
import {
  armNativeMoveHold,
  beginEditableNativeSelectionImport,
  cancelCompositionReceipt,
  captureEditableCompositionRuntimeMarks,
  clearEditableCompositionRuntimeState,
  endEditableSelectionUpdate,
  endHiddenAnchorPress,
  endSelectionImport,
  type EditableInputController,
  exportEditableDOMSelection,
  isSelectionHeldForPendingImport,
  restoreEditableCompositionRuntimeMarks,
} from './input-state';
import { getEditableInteractionOwner } from './interaction-owner';
import type { DeferredMutation } from './model-input-strategy';
import {
  type HistoryGateScope,
  readHistoryGate,
  shouldForceRenderAfterModelOwnedHistory,
} from './mutation-history';
import { PressFence } from './press-fence';
import { RenderContractMonitor } from './render-contract-monitor';
import {
  getEditorRuntimeOwner,
  setEditorComposing,
  toInternalRoot,
} from './runtime-editor-api';
import { readRuntimeText } from './runtime-live-state';
import { importUnreadPressCaret } from './runtime-selection-engine';
import {
  readRuntimeSelection,
  readRuntimeSelectionRange,
} from './runtime-selection-state';
import { attachEditableSelectionChangeListener } from './selection-change-listener';
import { SelectionClaims } from './selection-claim';
import { setEditableModelSelectionPreference } from './selection-controller';
import { UnreadPress } from './unread-press';
import {
  activateViewCaret,
  clampCaretAtRegistration,
  readNodeSelectionFocus,
} from './view-caret-restore';

type MutableCell<T> = { current: T };

export type EditorHistoryFocusPolicy = 'none' | 'preserve' | 'restore-root';

export type HistoryRootCheck = 'check' | 'skip';

export type NodeSelectionFocus = RefObject<HTMLElement | null>;

export type HistoryReplayOrigin = 'control' | 'view';

export type EditableHistoryReplay = Readonly<{
  changes: EditorCommit['changes'] | null;
  commit: EditorCommit | null;
  direction: 'redo' | 'undo';
  focusPolicy: EditorHistoryFocusPolicy;
  focusedView: EditableDOMRuntime;
  origin: HistoryReplayOrigin;
  receipt: EditorHistoryReplayReceipt;
  runtime: EditableDOMRuntime;
}>;

export type EditableHistoryReplayResult =
  | HistoryOutcome
  | Readonly<{
      reason: 'composing' | 'not-installed' | 'unmounted';
      status: 'unavailable';
    }>
  | Readonly<{
      /** No shown `Editable` of the presentation can edit `root`. */
      reason: 'hidden' | 'read-only';
      /** The root the replay would change, `undefined` for the primary document. */
      root: RootKey | undefined;
      status: 'unavailable';
    }>;

export type EditableHistoryReplayEvent = Readonly<{
  direction: 'redo' | 'undo';
  result: EditableHistoryReplayResult;
}>;

/** Hears the final range of a mouse selection made in an Editable's own text. */
export type EditablePointerSelectionEndHandler = (
  selection: Range,
  context: EditableHandlerContext
) => void;

/** Outcome of one paste that an editable's built-in insertion handled. */
export type EditablePasteResult = Readonly<{
  /**
   * Reports from the format that inserted or claimed the payload, plus loss
   * from payloads that could not be used. `impact: 'lossy'` means pasted
   * content was left out.
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
const ACTIVE_HISTORY_REPLAYS = new WeakMap<object, number>();

export const isHistoryReplayInFlight = (editor: ReactRuntimeEditor) =>
  (ACTIVE_HISTORY_REPLAYS.get(getEditorRuntimeOwner(editor)) ?? 0) > 0;
const MODEL_SELECTION_DOM_PREFERENCE_TTL_MS = 5000;
const MODIFIER_KEYS: ReadonlySet<string> = new Set([
  'Alt',
  'Control',
  'Meta',
  'Shift',
]);

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

  return root ?? null;
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

const isRuntimeShown = (element: HTMLElement) =>
  !element.closest('[hidden], [inert]') &&
  (typeof element.checkVisibility !== 'function' ||
    element.checkVisibility()) &&
  isElementDrawn(element);

const watchReplay = (editor: ReactRuntimeEditor, targetDocument: Document) => {
  const stopPlacements = watchFirstPlacement(editor);
  const snapshotCommits = new Map<number, EditorCommit>();
  let interacted = false;
  const interact = () => {
    interacted = true;
  };
  const stopCommits = editor.subscribeCommit((commit) => {
    if (commit.changed.hasAny('snapshot')) {
      snapshotCommits.set(commit.version, commit);
    }
  });

  targetDocument.addEventListener('focusin', interact, true);
  targetDocument.addEventListener('pointerdown', interact, true);

  return () => {
    const placedAt = stopPlacements();

    stopCommits();
    targetDocument.removeEventListener('focusin', interact, true);
    targetDocument.removeEventListener('pointerdown', interact, true);

    return {
      changes: (receipt: EditorHistoryReplayReceipt) =>
        snapshotCommits.get(receipt.version)?.changes ?? null,
      commit: (receipt: EditorHistoryReplayReceipt) =>
        snapshotCommits.get(receipt.version) ?? null,
      interrupted: (receipt: EditorHistoryReplayReceipt) =>
        interacted ||
        [...snapshotCommits.keys()].some(
          (version) =>
            version !== receipt.version && version !== receipt.claimVersion
        ),
      placedAt,
    };
  };
};

type EditableDOMRuntimeUpdate = {
  viewportRuntime: EditableViewportRuntime | null;
  nodeSelectionFocus: NodeSelectionFocus | undefined;
  onComposingChange: (nextValue: boolean) => void;
  onHistoryReplay: (event: EditableHistoryReplayEvent) => void;
  onDropResult: (result: EditableDropResult) => void;
  onPasteResult: (result: EditablePasteResult) => void;
  onPointerSelectionEnd: EditablePointerSelectionEndHandler | undefined;
  onViewportBackedSelectionChange: (nextValue: boolean) => void;
  readOnly: boolean;
};

/** Private imperative owner for one mounted editable root. */
export class EditableDOMRuntime {
  readonly externalText = new ExternalTextRuntime(this);
  readonly historyStepPage = Symbol('history step page');
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

  private nodeSelectionFocus: NodeSelectionFocus | undefined;

  private readonly editorValue: ReactRuntimeEditor;

  readonly unreadPress: UnreadPress;

  readonly pressFence: PressFence;

  private integrityRepairHandler: (
    evidence: DOMIntegrityRepairEvidence
  ) => void = () => {};

  private selectionExportAfterDOMCommitHandler: () => void = () => {};
  private selectionExportHandler:
    | ((options?: DOMRootSelectionExportOptions) => boolean)
    | null = null;
  readonly compositionLease = new CompositionLease();

  private readonly deferredCompositionDOMWrites = new Map<
    globalThis.Node,
    () => void
  >();

  private providerHistoryFocus:
    | ((replay: EditableHistoryReplay) => void)
    | null = null;

  private historySettleHandler: () => void = () => {};

  historyScope: HistoryGateScope | null = null;

  private historyReplayHandler: (event: EditableHistoryReplayEvent) => void =
    () => {};

  private pasteResultHandler: (result: EditablePasteResult) => void = () => {};
  private dropResultHandler: (result: EditableDropResult) => void = () => {};
  private pointerSelectionEndHandler:
    | EditablePointerSelectionEndHandler
    | undefined;

  private externalMouseGesture = false;
  private nextClickSelected = false;
  private ownedPressClick = false;
  private ownedPressMouseDown = false;
  private cancelPressTask: (() => void) | null = null;
  private inEditableMouseUp = false;
  private nonMousePressHeld = false;

  private readonly nativeInputHandlers: {
    beforeInput: ((event: InputEvent) => void) | null;
    input: ((event: Event) => void) | null;
    reenterCompositionLine: (() => void) | null;
  } = {
    beforeInput: null,
    input: null,
    reenterCompositionLine: null,
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

  private selectionExportAfterDOMCommitReceipt = 0;

  private verticalGoalFocus: Point | null = null;

  private verticalGoalOwner: object | null = null;

  private verticalGoalX: number | null = null;

  constructor({
    viewportRuntime = null,
    nodeSelectionFocus,
    editor,
    onComposingChange = () => {},
    onHistoryReplay = () => {},
    onDropResult = () => {},
    onPasteResult = () => {},
    onPointerSelectionEnd,
    onViewportBackedSelectionChange = () => {},
    readOnly = false,
    testRootFacts,
  }: Partial<EditableDOMRuntimeUpdate> & {
    editor: ReactRuntimeEditor;
    testRootFacts?: DOMRootRuntimeOptions<HTMLDivElement>['testRootFacts'];
  }) {
    this.viewportRuntimeValue = viewportRuntime;
    this.nodeSelectionFocus = nodeSelectionFocus;
    this.editorValue = editor;
    this.onComposingChange = onComposingChange;
    this.historyReplayHandler = onHistoryReplay;
    this.pasteResultHandler = onPasteResult;
    this.dropResultHandler = onDropResult;
    this.pointerSelectionEndHandler = onPointerSelectionEnd;
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
      compositionLine: {
        holds: (node) => this.compositionLease.holdsLine(editor, node),
        restored: () => this.compositionLease.markLineRestored(),
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
      nodeSelectionFocus: () => this.nodeSelectionFocus?.current ?? null,
      exportSelection: (options) => this.selectionExportHandler?.(options),
      focusSelection: (root) => focusSelectionTarget(this.editorValue, root),
      isComposing: () => this.state.isComposing,
      isSelectionHeld: () =>
        hasExpandedViewSelection(this.editorValue) ||
        isSelectionHeldForPendingImport(
          this.inputController,
          this.editorValue,
          this.rootRef.current
        ),
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
          () => this.pressFence.cancel(),
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
    this.pressFence = new PressFence(
      this.domPhaseScheduler.schedule,
      () => readRuntimeSelection(editor),
      () => this.publishPointerSelectionEnd()
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

  focusNodeSelectionElement() {
    const element = this.nodeSelectionFocus?.current;
    const editor = this.editorValue;

    if (!element?.isConnected || !readNodeSelectionFocus(editor)) return false;

    const before = focusedElementOnPage(element);
    const superseded = watchFocusSuperseded(editor, element);
    const receipt = getPlacementGeneration(editor);
    let receivedFocus = false;
    const onFocus = () => {
      receivedFocus = true;
    };

    element.addEventListener('focus', onFocus, true);
    try {
      element.focus({ preventScroll: true });
    } finally {
      element.removeEventListener('focus', onFocus, true);
    }

    const after = focusedElementOnPage(element);

    if (superseded() || placedSince(editor, receipt)) return true;
    if (!isElementFocused(element)) return receivedFocus || after !== before;

    const target = readNodeSelectionFocus(editor);

    if (!target) return true;

    const root = this.rootElement;

    // Chrome and Firefox keep the editable's caret after focus leaves it.
    if (root) {
      const { state } = this.inputController;

      exportEditableDOMSelection(state, root, null, {
        editor,
        onExport: (version) =>
          this.domPhaseScheduler.schedule(
            'selection-repair',
            'clear-node-selection-focus-update',
            () => {
              endEditableSelectionUpdate(state, version);
            },
            { timing: 'timeout' }
          ),
      });
    }
    if (target.parked) setSelectionAsView(editor, target.parked);

    return true;
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
      !editorElement.contains(preference.focus.node) ||
      [selection.anchor, selection.focus].some((point) =>
        isSoftLineTextStale(this.editorValue, point, editorElement)
      )
    ) {
      this.clearModelSelectionDOMPreference();
      return null;
    }

    try {
      const domRange = editorElement.ownerDocument.createRange();
      const [start, end] = RangeApi.isBackward(selection)
        ? [preference.focus, preference.anchor]
        : [preference.anchor, preference.focus];

      domRange.setStart(start.node, start.offset);
      domRange.setEnd(end.node, end.offset);
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
    if (!point || !RangeApi.isCollapsed(selection)) {
      this.clearModelSelectionDOMPreference();
      return;
    }
    this.writeModelSelectionDOMPreference(selection, point, point);
  }

  writeModelSelectionDOMPreference(
    selection: Range,
    anchor: ModelSelectionDOMPoint,
    focus: ModelSelectionDOMPoint
  ) {
    this.clearModelSelectionDOMPreference();

    const preference: ModelSelectionDOMPreference = {
      anchor,
      cancelDelete: null,
      expiresAt: getTimestamp() + MODEL_SELECTION_DOM_PREFERENCE_TTL_MS,
      focus,
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
      epoch?.phase !== 'committing'
    );
  }

  isCompositionDOMNodeProtected(node: globalThis.Node) {
    if (this.compositionLease.defersWrite(node)) return true;
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

  // React must not remove a line WebKit already removed, so the integrity
  // observer puts it back before the line's binding goes.
  readonly restorePrunedLineBeforeUnbind = () => {
    if (this.compositionLease.held) {
      this.rootRuntime.domIntegrityObserver.restorePrunedCompositionLine();
    }
  };

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

  markNextClickSelected() {
    this.nextClickSelected = true;
  }

  clearNextClickSelected() {
    this.nextClickSelected = false;
  }

  takeNextClickSelected() {
    const selected = this.nextClickSelected;

    this.nextClickSelected = false;
    return selected;
  }

  markOwnedPressGesture() {
    this.ownedPressClick = true;
    this.ownedPressMouseDown = true;
  }

  clearOwnedPressGesture() {
    this.ownedPressClick = false;
    this.ownedPressMouseDown = false;
  }

  takeOwnedPressClick() {
    const owned = this.ownedPressClick;

    this.ownedPressClick = false;
    return owned;
  }

  takeOwnedPressMouseDown() {
    const owned = this.ownedPressMouseDown;

    this.ownedPressMouseDown = false;
    return owned;
  }

  /**
   * Whether a focus belongs to a press in this Editable, whose own placement
   * wins over the view's activation.
   */
  get mousePressActive() {
    return this.cancelPressTask !== null || this.inEditableMouseUp;
  }

  /**
   * Chrome on Android focuses the editor at the long-press timeout, while the
   * touch is still down, with the word already selected and no mousedown, so
   * that focus belongs to the press.
   */
  get longPressSelected() {
    const root = this.rootElement;

    if (!this.nonMousePressHeld || !root) return false;
    const selection = getSelection(root.getRootNode() as Document | ShadowRoot);

    return (
      !!selection &&
      !selection.isCollapsed &&
      containsShadowAware(root, selection.anchorNode) &&
      containsShadowAware(root, selection.focusNode)
    );
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
    this.selectionExportAfterDOMCommitReceipt = getPlacementGeneration(
      this.editorValue
    );
    if (!this.cancelSelectionExportMicrotask) {
      this.cancelSelectionExportMicrotask = this.domPhaseScheduler.schedule(
        'selection-repair',
        'node-bind-selection-export-microtask',
        () => {
          this.cancelSelectionExportMicrotask = null;
          if (
            placedSince(
              this.editorValue,
              this.selectionExportAfterDOMCommitReceipt
            )
          ) {
            return;
          }
          this.cancelSelectionExportFrameTask?.();
          this.cancelSelectionExportFrameTask = this.domPhaseScheduler.schedule(
            'selection-repair',
            'node-bind-selection-export-frame',
            () => {
              this.cancelSelectionExportFrameTask = null;
              if (
                placedSince(
                  this.editorValue,
                  this.selectionExportAfterDOMCommitReceipt
                )
              ) {
                return;
              }
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

  updateSelectionExportHandler(
    handler: ((options?: DOMRootSelectionExportOptions) => boolean) | null
  ) {
    this.selectionExportHandler = handler;
  }

  get isHistoryReplayInFlight() {
    return isHistoryReplayInFlight(this.editorValue);
  }

  get presentation() {
    return this.historyScope?.presentation ?? null;
  }

  resolveRootRuntime(targetRoot: RootKey): EditableDOMRuntime | null {
    if (!this.connected) return null;

    const currentRoot = toInternalRoot(
      this.editorValue.read((state) => state.view.root())
    );

    if (
      currentRoot === targetRoot &&
      !this.readOnly &&
      !this.editorValue.read.view.isReadOnly() &&
      !!this.rootElement &&
      isRuntimeShown(this.rootElement)
    ) {
      return this;
    }

    const scope = this.historyScope;

    if (scope) {
      const pickShownRuntime = (
        view: ReactRuntimeEditor | null | undefined
      ) => {
        if (!view || view.read.view.isReadOnly()) return null;

        return (
          getMountedEditableDOMRuntimes(view).find(
            (item) =>
              Object.is(item.editor, view) &&
              item.connected &&
              !item.readOnly &&
              !!item.rootElement &&
              isRuntimeShown(item.rootElement)
          ) ?? null
        );
      };
      const candidate = readRootContentTarget(
        scope.owner,
        scope.presentation,
        targetRoot
      )?.view as ReactRuntimeEditor | undefined;
      const latest = readLatestShownWritableRootView(
        scope.owner,
        scope.presentation,
        targetRoot
      ) as ReactRuntimeEditor | null;
      const shown =
        pickShownRuntime(candidate) ??
        pickShownRuntime(latest) ??
        getMountedEditableDOMRuntimes(scope.owner as ReactRuntimeEditor).find(
          (item) =>
            item.connected &&
            !item.readOnly &&
            !item.editor.read.view.isReadOnly() &&
            (!item.presentation || item.presentation === scope.presentation) &&
            toInternalRoot(item.editor.read((state) => state.view.root())) ===
              targetRoot &&
            !!item.rootElement &&
            isRuntimeShown(item.rootElement)
        ) ??
        null;

      if (shown) return shown;

      const fallbackView =
        (candidate && !candidate.read.view.isReadOnly() ? candidate : null) ??
        latest;
      const fallback = fallbackView
        ? (getMountedEditableDOMRuntimes(fallbackView).find(
            (item) =>
              Object.is(item.editor, fallbackView) &&
              item.connected &&
              !item.readOnly
          ) ?? null)
        : null;

      if (fallback) return fallback;
    }

    return !this.readOnly &&
      !this.editorValue.read.view.isReadOnly() &&
      !!this.rootElement &&
      isRuntimeShown(this.rootElement)
      ? this
      : null;
  }

  focusTarget(): boolean {
    if (!this.connected) return false;

    const root = this.rootElement;

    if (!root) return false;

    const before = focusedElementOnPage(root);
    const owner = getEditorRuntimeOwner(this.editorValue);
    const version = getMutationVersion(owner);

    if (this.focusNodeSelectionElement()) {
      const nodeElement = this.nodeSelectionFocus?.current;

      if (nodeElement && isElementFocused(nodeElement)) {
        markRootViewUsed(this.editorValue);
      }
      return true;
    }

    const preserveExpandedViewSelection =
      hasExpandedViewSelection(this.editorValue) &&
      !shouldForceRenderAfterModelOwnedHistory(this.editorValue);

    if (!preserveExpandedViewSelection) {
      if (this.externalText.focusSelection()) {
        markRootViewUsed(this.editorValue);
        return true;
      }
      if (focusedElementOnPage(root) !== before) {
        return true;
      }
    }

    let receivedFocus = false;

    if (before !== root) {
      const onFocus = () => {
        receivedFocus = true;
      };

      root.addEventListener('focus', onFocus, true);
      try {
        focusEditableElement(this.editorValue, root);
      } finally {
        root.removeEventListener('focus', onFocus, true);
      }
    }

    const focused = focusedElementOnPage(root);

    if (focused !== root) {
      return receivedFocus || focused !== before;
    }

    markRootViewUsed(this.editorValue);

    if (getMutationVersion(owner) !== version) {
      return true;
    }
    if (!preserveExpandedViewSelection && this.externalText.focusSelection()) {
      return true;
    }
    if (!preserveExpandedViewSelection && focusedElementOnPage(root) !== root) {
      return true;
    }

    if (!preserveExpandedViewSelection) {
      this.requestSelectionExportAfterDOMCommit();
    }

    return true;
  }

  updateProviderHistoryFocus(
    handler: ((replay: EditableHistoryReplay) => void) | null
  ) {
    this.providerHistoryFocus = handler;
  }

  updateHistorySettleHandler(handler: () => void) {
    this.historySettleHandler = handler;
  }

  updateHistoryScope(scope: HistoryGateScope | null) {
    this.historyScope = scope;
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
    focusPolicy: EditorHistoryFocusPolicy,
    rootCheck: HistoryRootCheck,
    origin: HistoryReplayOrigin
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

    const active = focusedElementOnPage(root);
    const focusedView =
      (active &&
        containsShadowAware(root, active) &&
        findMountedEditableDOMRuntime(active)) ||
      this;
    const replaysFocusedView =
      origin === 'view' &&
      focusPolicy === 'restore-root' &&
      getEditorRuntimeOwner(focusedView.editorValue) ===
        getEditorRuntimeOwner(this.editorValue);
    const replayEditor = replaysFocusedView
      ? focusedView.editorValue
      : this.editorValue;
    const { history } = replayEditor.api as { history?: HistoryApi };

    if (!history) {
      return { reason: 'not-installed', status: 'unavailable' };
    }

    const gate =
      rootCheck === 'check' && this.historyScope
        ? readHistoryGate(this.historyScope, direction, this.editorValue)
        : null;

    if (gate?.status === 'refused') {
      return {
        reason: gate.reason,
        root: toPublicRootOption(gate.root),
        status: 'unavailable',
      };
    }

    const owner = getEditorRuntimeOwner(this.editorValue);
    const run = () => history[direction]();
    const finishWatch = watchReplay(this.editorValue, root.ownerDocument);
    let watched: ReturnType<typeof finishWatch>;
    let result: HistoryOutcome;

    ACTIVE_HISTORY_REPLAYS.set(
      owner,
      (ACTIVE_HISTORY_REPLAYS.get(owner) ?? 0) + 1
    );

    try {
      const replayed =
        focusPolicy === 'preserve'
          ? withUpdateTagContext(
              owner,
              PLITE_REACT_PRESERVE_SELECTION_TAGS,
              run
            )
          : run();

      // A settled result also waits one microtask, so focus repair has one timing for every replay.
      result = await (replayed.status === 'pending'
        ? replayed.settled
        : Promise.resolve(replayed));
    } finally {
      const remaining = (ACTIVE_HISTORY_REPLAYS.get(owner) ?? 1) - 1;

      if (remaining > 0) {
        ACTIVE_HISTORY_REPLAYS.set(owner, remaining);
      } else {
        ACTIVE_HISTORY_REPLAYS.delete(owner);
      }
      watched = finishWatch();
    }

    if (result.status !== 'applied') return result;

    const receipt = readEditorHistoryReplayReceipt(result);

    if (!receipt || watched.interrupted(receipt)) return result;

    const shown = this.connected && this.rootElement === root;

    if (shown) {
      this.observeHistoryReplay(direction, () =>
        writePliteViewSelection(
          this.editorValue,
          direction === 'undo' && replayEditor === this.editorValue
            ? readHistoryStepUndoRange(receipt.group)
            : null,
          { placedAt: watched.placedAt }
        )
      );
    }

    const viewport = this.viewportRuntime;
    const restored = readRuntimeSelectionRange(this.editorValue);
    const restoredOutsideMountedBlocks =
      shown &&
      viewport &&
      restored &&
      RangeApi.isExpanded(restored) &&
      isSelectionViewportBacked(
        restored,
        viewport.mountedTopLevelNodeKeys,
        viewport.mountedTopLevelRanges ?? null
      );

    if (restoredOutsideMountedBlocks) {
      this.observeHistoryReplay(direction, () =>
        viewport.scrollToPath?.(RangeApi.start(restored).path, 'auto')
      );
    }

    const replay: EditableHistoryReplay = {
      changes: watched.changes(receipt),
      commit: watched.commit(receipt),
      direction,
      focusPolicy,
      focusedView,
      origin,
      receipt,
      runtime: this,
    };

    this.observeHistoryReplay(direction, () => {
      if (this.providerHistoryFocus) {
        this.providerHistoryFocus(replay);
      } else if (focusPolicy === 'restore-root') {
        const externalHolder =
          origin === 'control'
            ? (getMountedEditableDOMRuntimes(owner as ReactRuntimeEditor).find(
                (item) =>
                  item.connected &&
                  (!this.presentation ||
                    !item.presentation ||
                    item.presentation === this.presentation) &&
                  item.externalText.holdsFocus()
              ) ?? null)
            : null;

        if (externalHolder) {
          externalHolder.externalText.focusSelection({ allowFocus: false });
        } else {
          this.focusTarget();
        }
      }
    });
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
    onOutcome?: (result: EditableHistoryReplayResult) => void,
    rootCheck: HistoryRootCheck = 'check',
    origin: HistoryReplayOrigin = 'view'
  ): void {
    const deliver = (result: EditableHistoryReplayResult) => {
      this.observeHistoryReplay(direction, () =>
        this.historyReplayHandler({ direction, result })
      );
      this.observeHistoryReplay(direction, () => onOutcome?.(result));
    };

    void this.replayHistory(direction, focusPolicy, rootCheck, origin).then(
      deliver,
      (error: unknown) => {
        this.reportHistoryReplayError(direction, 'replay', error);
        deliver({ status: 'failed' });
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

  private publishPointerSelectionEnd() {
    const editor = this.editorValue;
    const selection = readRuntimeSelection(editor);

    if (
      !this.connected ||
      !this.pointerSelectionEndHandler ||
      selection?.kind !== 'text' ||
      readPliteViewSelection(editor)
    ) {
      return;
    }
    this.pointerSelectionEndHandler(
      Object.freeze({ anchor: selection.anchor, focus: selection.focus }),
      { editor }
    );
  }

  update(update: EditableDOMRuntimeUpdate) {
    const readOnlyChanged = this.readOnlyValue !== update.readOnly;
    this.viewportRuntimeValue = update.viewportRuntime;
    this.nodeSelectionFocus = update.nodeSelectionFocus;
    this.onComposingChange = update.onComposingChange;
    this.historyReplayHandler = update.onHistoryReplay;
    this.pasteResultHandler = update.onPasteResult;
    this.dropResultHandler = update.onDropResult;
    this.pointerSelectionEndHandler = update.onPointerSelectionEnd;
    if (!update.onPointerSelectionEnd) this.pressFence.cancel();
    this.onViewportBackedSelectionChange =
      update.onViewportBackedSelectionChange;
    this.readOnlyValue = update.readOnly;
    if (readOnlyChanged) this.externalText.refreshAll();
  }

  updateNativeInputHandlers({
    onDOMBeforeInput,
    onDOMInput,
    reenterCompositionLine,
  }: {
    onDOMBeforeInput: (event: InputEvent) => void;
    onDOMInput: (event: Event) => void;
    reenterCompositionLine: () => void;
  }) {
    this.nativeInputHandlers.beforeInput = onDOMBeforeInput;
    this.nativeInputHandlers.input = onDOMInput;
    this.nativeInputHandlers.reenterCompositionLine = reenterCompositionLine;
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
    endSelectionImport(this.inputController);
  }

  prepareNativeShiftSelection(holdExport: boolean) {
    const { inputController } = this;

    this.cancelSelectionChangeHandlers();
    inputController.state.outsideFocusBoundarySettleUntil = 0;
    if (
      inputController.state.activeIntent === 'model-selection-move' ||
      inputController.state.activeIntent === 'native-selection-move'
    ) {
      inputController.state.activeIntent = null;
    }
    inputController.state.modelOwnedTextInputGuard = 0;
    if (!holdExport) {
      return;
    }
    setEditableModelSelectionPreference({
      inputController,
      preferModelSelection: false,
      selectionSource: 'dom-current',
    });
    beginEditableNativeSelectionImport(inputController);
    armNativeMoveHold(inputController, this.editorValue);
    endHiddenAnchorPress(inputController);
    this.scheduleOnDOMSelectionChange?.();
  }

  private attachNativeInputListeners() {
    const node = this.rootRef.current;

    if (!this.connected || !node || this.nativeInputListenersCleanup) return;

    const takesViewCaret = (
      owner: ReturnType<typeof getEditableInteractionOwner>
    ) =>
      owner !== 'nested-editor' &&
      !this.webKitProbeActive.current &&
      activateViewCaret(this.editorValue);
    let compositionTookViewCaret = false;
    // A composition takes the view's caret before the input method writes,
    // because moving the caret after it writes reverts its text.
    const handleCompositionStart = (event: CompositionEvent) => {
      const owner = getEditableInteractionOwner(node, event.target);

      this.pressFence.cancel();
      compositionTookViewCaret =
        owner !== 'external-text' && takesViewCaret(owner);
    };
    const handleBeforeInput = (event: InputEvent) => {
      const owner = getEditableInteractionOwner(node, event.target);

      if (owner === 'external-text') return;
      if (
        this.state.isComposing
          ? compositionTookViewCaret
          : takesViewCaret(owner)
      ) {
        setEditableModelSelectionPreference({
          inputController: this.inputController,
          preferModelSelection: true,
          reason: 'model-command',
          selectionSource: 'model-owned',
        });
      }
      compositionTookViewCaret = false;
      this.nativeInputHandlers.beforeInput?.(event);
    };
    const handleInput = (event: Event) => {
      if (getEditableInteractionOwner(node, event.target) === 'external-text') {
        return;
      }
      if (
        this.compositionLease.held &&
        (event as InputEvent).inputType === 'deleteCompositionText'
      ) {
        this.rootRuntime.domIntegrityObserver.flushRecords();
        this.nativeInputHandlers.reenterCompositionLine?.();
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
      if (
        this.pointerSelectionEndHandler &&
        event.pointerType === 'mouse' &&
        event.button === 0 &&
        getEditableInteractionOwner(node, event.target) === 'editor' &&
        !isInteractiveInternalTarget(this.editorValue, event.target)
      ) {
        this.pressFence.open();
      } else {
        this.pressFence.cancel();
      }
      this.nonMousePressHeld =
        event.pointerType !== 'mouse' &&
        inRoot &&
        !isInteractiveInternalTarget(this.editorValue, event.target);
    };
    const endPress = () => {
      this.nonMousePressHeld = false;
    };
    const releasePress = () => this.pressFence.release();
    const cancelPress = () => this.pressFence.cancel();
    const cancelPressOnKey = (event: KeyboardEvent) => {
      if (!MODIFIER_KEYS.has(event.key)) cancelPress();
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
        editor: this.editorValue,
        root: node,
        scheduleOnDOMSelectionChange: () => {
          claims.observeSelection();
          this.scheduleOnDOMSelectionChange?.();
        },
        state: this.inputController.state,
      }
    );
    const clearCaret = () => clearAfterInsertCaret(this.editorValue);
    const releaseCommits = this.editorValue.subscribeCommit((commit) =>
      noteAfterInsertCaret(this.editorValue, commit)
    );

    node.addEventListener('compositionstart', handleCompositionStart);
    node.addEventListener('beforeinput', handleBeforeInput);
    node.addEventListener('input', handleInput);
    node.addEventListener('pointerdown', clearCaret, true);
    node.addEventListener('keydown', cancelPressOnKey, true);
    node.addEventListener('dragstart', cancelPress, true);
    node.addEventListener('blur', cancelPress);
    ownerWindow?.addEventListener('pointerdown', notePointerPress, true);
    ownerWindow?.addEventListener('pointerup', endPress, true);
    ownerWindow?.addEventListener('pointercancel', endPress, true);
    ownerWindow?.addEventListener('pointercancel', cancelPress, true);
    ownerWindow?.addEventListener('mouseup', releasePress, true);
    ownerWindow?.addEventListener('blur', cancelPress);
    this.nativeInputListenersCleanup = () => {
      releaseCommits();
      node.removeEventListener('pointerdown', clearCaret, true);
      node.removeEventListener('keydown', cancelPressOnKey, true);
      node.removeEventListener('dragstart', cancelPress, true);
      node.removeEventListener('blur', cancelPress);
      claims.destroy();
      this.selectionClaimsValue = null;
      detachSelectionChangeListener();
      node.removeEventListener('compositionstart', handleCompositionStart);
      node.removeEventListener('beforeinput', handleBeforeInput);
      node.removeEventListener('input', handleInput);
      ownerWindow?.removeEventListener('pointerdown', notePointerPress, true);
      ownerWindow?.removeEventListener('pointerup', endPress, true);
      ownerWindow?.removeEventListener('pointercancel', endPress, true);
      ownerWindow?.removeEventListener('pointercancel', cancelPress, true);
      ownerWindow?.removeEventListener('mouseup', releasePress, true);
      ownerWindow?.removeEventListener('blur', cancelPress);
      this.pressFence.cancel();
      this.nonMousePressHeld = false;
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
        this.inputController.domInputRuntime.endComposition();
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
