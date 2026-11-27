import { type Path, PathApi, RangeApi } from '../..';
import { hasNonWritableAt } from '../../core/non-writable';
import {
  capturePlacement,
  getPlacementGeneration,
  placedSince,
} from '../../core/view-carets';
import {
  type DOMRange,
  getSelection,
  isDOMElement,
  isDOMText,
} from '../../dom';
import { isSoftLineTextStale } from '../../dom/dom-soft-line-end';
import {
  type DOMPhaseScheduler,
  resolveDOMTextFlowEntry,
} from '../../dom/internal';
import {
  isSelectableDOMSelection,
  resolveDOMPointInRoot,
} from '../../dom/plugin/dom-editor';
import {
  getPliteTextHostBounds,
  getPliteTextHostStrings,
} from '../../dom/plugin/dom-geometry';
import {
  isElementFocused,
  readEditableDOMSelectionPoints,
  writeEditableDOMSelection,
} from '../../dom/plugin/dom-root-runtime';
import {
  type DOMSelectionPoints,
  readDOMSelectionRange,
  sameDOMSelectionPoints,
} from '../../dom/utils/selection-writes';
import {
  getPliteNodeElementByPath,
  getPliteNodePathFromDOMElement,
} from '../hooks/use-plite-node-ref';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { recordPliteReactRender } from '../render-profiler';
import {
  applyTextInsert,
  getDOMTextRepairInsert,
  getTextHostSelectionOffset,
  isInsideVirtualizedDOM,
} from './dom-repair-text';
import type { EditableRepairPolicy } from './editing-kernel';
import {
  getCurrentEditableEventFrame,
  recordEditableKernelTrace,
} from './editing-kernel';
import { updateNativeTextInput } from './input-history';
import {
  clearEditablePendingNativeTextInputRepair,
  type EditableInputController,
  getDeferredSelectionWriteStatus,
  getEditableNativeGroupingInput,
} from './input-state';
import { getUserTextLanding } from './mutation-controller';
import { readRuntimeText } from './runtime-live-state';
import {
  readRuntimeSelection,
  readRuntimeSelectionRange,
} from './runtime-selection-state';
import {
  armModelOwnedTextInputGuard,
  setEditableModelSelectionPreference,
} from './selection-controller';
import { shouldSkipSelectionScroll } from './selection-side-effect-policy';
import { withTypedTextIntent } from './typed-text';
import { claimPageSelection } from './unread-press';

export type DOMInputRepair = {
  data: string | null;
  inputType: string;
  target?: {
    insert?: {
      offset: number;
      text: string;
    };
    path: Path;
    preferCapturedInsert?: boolean;
    selectionOffset: number;
    text: string;
  } | null;
};

export type DOMRepairQueue = {
  beginFrame: (frameId: number) => void;
  cancelBefore: (frameId: number) => void;
  repairDOMInput: (
    nativeInput: DOMInputRepair,
    rootElement: HTMLElement,
    frameId?: number | null
  ) => void;
  repair: (
    repairPolicy: EditableRepairPolicy,
    options?: DOMCaretRepairOptions
  ) => void;
  repairCaretAfterModelIntent: (
    kind?: 'repair-caret' | 'repair-caret-after-text-insert',
    options?: DOMCaretRepairOptions
  ) => void;
  repairCaretAfterModelTextInsert: (options?: DOMCaretRepairOptions) => void;
};

export type DOMCaretRepairOptions = Readonly<{
  afterSeq?: number;
  ownedRepair?: Readonly<{ offset: number; pathKey: string }> | null;
  receipt?: number;
  /**
   * The page's selection when the model selection collapsed. The caret then
   * takes its point's default side, not the side the live focus shows across
   * a soft line end, and the repair writes nothing once the page no longer
   * holds that selection.
   */
  replacing?: DOMSelectionPoints;
}>;

const REPAIR_INDUCED_SELECTION_ORIGIN_GUARD_MS = 150;
const TEXT_INPUT_REPAIR_ECHO_GUARD_MS = 120;

export type DOMRepairFrameState = {
  cancelledBeforeFrameId: number;
  currentFrameId: number | null;
};

const now = () => globalThis.performance?.now?.() ?? Date.now();

export const getDOMRepairProfilerTime = () => now();

export const profileDOMRepairDuration = <T>(
  kind: string,
  callback: () => T
): T => {
  if (!globalThis.__EDITOR_REACT_RENDER_PROFILER__) {
    return callback();
  }

  const start = now();

  try {
    return callback();
  } finally {
    recordPliteReactRender({
      duration: now() - start,
      id: `dom-repair:${kind}`,
      kind: 'runtime-time',
    });
  }
};

export const createDOMRepairFrameState = (): DOMRepairFrameState => ({
  cancelledBeforeFrameId: 0,
  currentFrameId: null,
});

export const beginDOMRepairFrame = (
  state: DOMRepairFrameState,
  frameId: number
) => {
  if (frameId < state.cancelledBeforeFrameId) {
    return;
  }

  state.currentFrameId = frameId;
};

export const cancelDOMRepairBefore = (
  state: DOMRepairFrameState,
  frameId: number
) => {
  state.cancelledBeforeFrameId = Math.max(
    state.cancelledBeforeFrameId,
    frameId
  );
};

export const isDOMRepairFrameCurrent = (
  state: DOMRepairFrameState,
  frameId: number
) =>
  state.currentFrameId === frameId && frameId >= state.cancelledBeforeFrameId;

export const createDOMRepairQueue = ({
  domPhaseScheduler,
  editor,
  inputController,
  rootRef,
  scrollSelectionIntoView,
}: {
  domPhaseScheduler: DOMPhaseScheduler;
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  rootRef: { readonly current: HTMLElement | null };
  scrollSelectionIntoView: (
    editor: ReactRuntimeEditor,
    domRange: DOMRange
  ) => void;
  syncDOMSelectionToEditor: () => void;
}): DOMRepairQueue => {
  const frameState = createDOMRepairFrameState();
  let queue: DOMRepairQueue;
  const scheduler = domPhaseScheduler;
  const scheduleRepairAnimationFrame = (callback: () => void) =>
    scheduler.schedule('selection-repair', 'dom-repair-frame', callback, {
      timing: 'animation-frame',
    });
  const scheduleRepairMicrotask = (callback: () => void) =>
    scheduler.schedule('selection-repair', 'dom-repair-microtask', callback, {
      timing: 'microtask',
    });
  const scheduleRepairTimeout = (callback: () => void, delay = 0) =>
    scheduler.schedule('selection-repair', 'dom-repair-timeout', callback, {
      delay,
      timing: 'timeout',
    });

  const capturePendingNativeTextInputRepair = () =>
    inputController.state.pendingNativeTextInputRepairPathKey != null &&
    inputController.state.pendingNativeTextInputRepairOffset != null
      ? {
          offset: inputController.state.pendingNativeTextInputRepairOffset,
          pathKey: inputController.state.pendingNativeTextInputRepairPathKey,
        }
      : null;

  const clearOwnedPendingNativeTextInputRepair = (
    owned: Readonly<{ offset: number; pathKey: string }> | null
  ) => {
    if (
      owned &&
      inputController.state.pendingNativeTextInputRepairPathKey ===
        owned.pathKey &&
      inputController.state.pendingNativeTextInputRepairOffset === owned.offset
    ) {
      clearEditablePendingNativeTextInputRepair(inputController);
    }
  };

  const scheduleTextInsertCaretRepair = ({
    delays = [],
    immediate = true,
  }: {
    delays?: number[];
    immediate?: boolean;
  } = {}) => {
    const scheduledReceipt = getPlacementGeneration(editor);
    const scheduledSeq = inputController.state.selectionChangeSeq;
    const ownedRepair = capturePendingNativeTextInputRepair();
    const repair = () => {
      if (placedSince(editor, scheduledReceipt)) {
        clearOwnedPendingNativeTextInputRepair(ownedRepair);
        return;
      }
      queue.repairCaretAfterModelTextInsert({
        afterSeq: scheduledSeq,
        ownedRepair,
        receipt: scheduledReceipt,
      });
    };

    if (immediate) {
      repair();
    }

    for (const delay of delays) {
      scheduleRepairTimeout(repair, delay);
    }
  };

  // The browser already typed the refused text, and the integrity observer
  // accepts typing in a text-flow host, so nothing else takes it back.
  const giveBackRefusedTextInsert = ({
    editorText,
    insert,
    path,
    restoreFullText = false,
    textHost,
  }: {
    editorText?: string;
    insert: { offset: number; text: string };
    path: Path;
    restoreFullText?: boolean;
    textHost: Element | null | undefined;
  }) => {
    clearEditablePendingNativeTextInputRepair(inputController);

    const root = ReactEditor.resolveDocumentOrShadowRoot(editor);
    const domSelection = root ? getSelection(root) : null;
    const node = domSelection?.anchorNode;
    const end = domSelection?.anchorOffset ?? 0;
    const start = end - insert.text.length;

    if (
      !restoreFullText &&
      textHost &&
      isDOMText(node) &&
      textHost.contains(node) &&
      start >= 0 &&
      node.data.slice(start, end) === insert.text
    ) {
      const flowEntry = resolveDOMTextFlowEntry(node, start);
      const offset = flowEntry
        ? PathApi.equals(flowEntry.path, path)
          ? flowEntry.offset
          : null
        : getTextHostSelectionOffset({
            anchorNode: node,
            anchorOffset: start,
            textHost,
          });

      if (offset === insert.offset) {
        node.deleteData(start, insert.text.length);
        return;
      }
    }

    if (textHost && editorText !== undefined) {
      const currentText = textHost.textContent?.replace(/\uFEFF/g, '') ?? '';

      if (currentText !== editorText) {
        if (isDOMText(node) && textHost.contains(node)) {
          node.data = editorText === '' ? '\uFEFF' : editorText;
        } else {
          const textNode = textHost.querySelector(
            '[data-editor-string="true"]'
          );
          const firstChild = textNode?.firstChild;

          if (isDOMText(firstChild)) {
            firstChild.data = editorText === '' ? '\uFEFF' : editorText;
          } else if (textNode) {
            textNode.textContent = editorText === '' ? '\uFEFF' : editorText;
          }
        }
      }
    }
  };

  const armRepairInducedSelectionOriginGuard = () => {
    const repairOriginVersion =
      (inputController.state.repairInducedSelectionOriginVersion ?? 0) + 1;

    inputController.state.repairInducedSelectionOriginVersion =
      repairOriginVersion;
    inputController.state.selectionChangeOrigin = 'repair-induced';
    scheduler.schedule(
      'selection-repair',
      'clear-repair-induced-selection-origin',
      () => {
        if (
          inputController.state.repairInducedSelectionOriginVersion ===
            repairOriginVersion &&
          inputController.state.selectionChangeOrigin === 'repair-induced'
        ) {
          inputController.state.selectionChangeOrigin = null;
        }
      },
      {
        delay: REPAIR_INDUCED_SELECTION_ORIGIN_GUARD_MS,
        timing: 'timeout',
      }
    );
  };

  const applyCapturedModelTextInsert = (
    nativeInput: DOMInputRepair,
    rootElement: HTMLElement
  ) => {
    const { target } = nativeInput;
    const insert = target?.insert;

    if (!target?.preferCapturedInsert || !insert) {
      return false;
    }

    const selection = profileDOMRepairDuration('captured-read-selection', () =>
      readRuntimeSelectionRange(editor)
    );

    if (
      !selection ||
      !RangeApi.isCollapsed(selection) ||
      !PathApi.equals(selection.anchor.path, target.path) ||
      selection.anchor.offset !== insert.offset ||
      hasNonWritableAt(editor, selection)
    ) {
      return false;
    }

    const editorNode = profileDOMRepairDuration('captured-read-text', () =>
      readRuntimeText(editor, target.path)
    );
    const textHost = profileDOMRepairDuration('captured-find-text-host', () =>
      getPliteNodeElementByPath(editor, target.path)
    );

    if (
      !editorNode ||
      !textHost ||
      !rootElement.contains(textHost) ||
      applyTextInsert(editorNode.text, insert) !== target.text
    ) {
      return false;
    }

    const root = profileDOMRepairDuration('captured-find-root', () =>
      ReactEditor.resolveDocumentOrShadowRoot(editor)
    );
    const domSelection = profileDOMRepairDuration(
      'captured-read-dom-selection',
      () => (root ? getSelection(root) : null)
    );
    const anchorNode = domSelection?.anchorNode ?? null;
    const anchorOffset = domSelection?.anchorOffset ?? null;

    if (
      anchorNode == null ||
      anchorOffset == null ||
      !textHost.contains(anchorNode)
    ) {
      return false;
    }

    const domOffset = profileDOMRepairDuration('captured-read-dom-offset', () =>
      getTextHostSelectionOffset({
        anchorNode,
        anchorOffset,
        textHost,
      })
    );

    if (domOffset !== insert.offset) return false;

    if (isInsideVirtualizedDOM(textHost)) {
      setEditableModelSelectionPreference({
        inputController,
        preferModelSelection: true,
        reason: 'repair-induced',
        selectionSource: 'model-owned',
      });
      armModelOwnedTextInputGuard({ inputController });
    }

    const nextOffset = insert.offset + insert.text.length;
    const at = { path: target.path, offset: insert.offset };
    const insertsAtSelection =
      getUserTextLanding(editor, {
        composed: false,
        inputType: 'insertText',
        replayed: false,
        target: selection,
      }) !== 'pinned';

    armRepairInducedSelectionOriginGuard();
    const committed = profileDOMRepairDuration('captured-update-model', () =>
      withTypedTextIntent(
        editor,
        inputController,
        { inputType: 'insertText', text: insert.text },
        () =>
          updateNativeTextInput(
            editor,
            (tx) => {
              if (insertsAtSelection) {
                tx.text.insert(insert.text);
                return;
              }

              tx.text.insert(insert.text, { at });
              const selectionAfter = tx.selection();

              if (
                !selectionAfter ||
                !RangeApi.isCollapsed(selectionAfter) ||
                !PathApi.equals(selectionAfter.anchor.path, target.path) ||
                selectionAfter.anchor.offset !== nextOffset
              ) {
                tx.selection.set({
                  anchor: { path: target.path, offset: nextOffset },
                  focus: { path: target.path, offset: nextOffset },
                });
              }
            },
            getEditableNativeGroupingInput(inputController)
          )
      )
    );
    if (!committed) {
      giveBackRefusedTextInsert({ insert, path: target.path, textHost });
    }
    if (!isInsideVirtualizedDOM(textHost)) {
      setEditableModelSelectionPreference({
        inputController,
        preferModelSelection: false,
        reason: 'native-selection',
        selectionSource: 'dom-current',
      });
    }
    profileDOMRepairDuration('captured-repair-caret', () => {
      scheduleTextInsertCaretRepair();
    });

    return true;
  };

  queue = {
    beginFrame(frameId) {
      beginDOMRepairFrame(frameState, frameId);
    },

    cancelBefore(frameId) {
      cancelDOMRepairBefore(frameState, frameId);
    },

    repairDOMInput(nativeInput, rootElement, repairFrameId) {
      const frameId =
        repairFrameId ?? getCurrentEditableEventFrame(editor)?.id ?? null;

      if (frameId !== null) {
        beginDOMRepairFrame(frameState, frameId);
      }

      if (frameId !== null && !isDOMRepairFrameCurrent(frameState, frameId)) {
        return;
      }

      if (
        nativeInput.inputType !== 'insertText' ||
        typeof nativeInput.data !== 'string' ||
        nativeInput.data.length === 0
      ) {
        return;
      }

      if (applyCapturedModelTextInsert(nativeInput, rootElement)) {
        return;
      }

      if (frameId !== null && !isDOMRepairFrameCurrent(frameState, frameId)) {
        return;
      }

      const inputText = nativeInput.data;
      const root = ReactEditor.resolveDocumentOrShadowRoot(editor);
      const domSelection = root ? getSelection(root) : null;
      const anchorNode = domSelection?.anchorNode ?? null;
      const anchorOffset = domSelection?.anchorOffset ?? null;
      let textHost = isDOMText(anchorNode)
        ? anchorNode.parentElement?.closest('[data-editor-node="text"]')
        : isDOMElement(anchorNode)
          ? anchorNode.closest('[data-editor-node="text"]')
          : null;
      let path = textHost ? getPliteNodePathFromDOMElement(textHost) : null;
      let editorNode = path ? readRuntimeText(editor, path) : null;
      let selectionOffset =
        textHost && anchorOffset != null
          ? getTextHostSelectionOffset({ anchorNode, anchorOffset, textHost })
          : null;
      let textHostText = textHost?.textContent?.replace(/\uFEFF/g, '') ?? null;
      const liveDOMTextHost = textHost;
      const liveDOMPath = path;
      const liveDOMSelectionOffset = selectionOffset;
      const liveDOMTextHostText = textHostText;

      if (nativeInput.target) {
        ({ path } = nativeInput.target);
        const liveDOMTextHostMatchesTarget =
          liveDOMPath && PathApi.equals(liveDOMPath, path)
            ? true
            : liveDOMTextHost?.getAttribute('data-editor-path') ===
              path.join(',');
        editorNode = readRuntimeText(editor, path);
        textHost =
          getPliteNodeElementByPath(editor, path) ??
          (liveDOMTextHostMatchesTarget ? liveDOMTextHost : null) ??
          rootElement.querySelector<HTMLElement>(
            `[data-editor-node="text"][data-editor-path="${path.join(',')}"]`
          );
        ({ selectionOffset } = nativeInput.target);
        textHostText = nativeInput.target.text;
      }

      if (
        !editorNode ||
        !path ||
        selectionOffset == null ||
        textHostText == null
      ) {
        const selection = readRuntimeSelectionRange(editor);

        if (selection && RangeApi.isCollapsed(selection)) {
          const fallbackPath = selection.anchor.path;
          const fallbackTextHost = getPliteNodeElementByPath(
            editor,
            fallbackPath
          );
          const fallbackPliteNode = readRuntimeText(editor, fallbackPath);

          if (fallbackTextHost && fallbackPliteNode) {
            path = fallbackPath;
            editorNode = fallbackPliteNode;
            textHost = fallbackTextHost;
            selectionOffset = selection.anchor.offset + inputText.length;
            textHostText =
              fallbackTextHost.textContent?.replace(/\uFEFF/g, '') ?? null;
          }
        }
      }

      if (
        editorNode &&
        path &&
        selectionOffset != null &&
        textHostText != null
      ) {
        if (textHostText === editorNode.text) {
          const currentSelection = readRuntimeSelectionRange(editor);
          const liveDOMSelectionBelongsToRepairPath = nativeInput.target
            ? textHost === liveDOMTextHost ||
              (!!liveDOMPath &&
                PathApi.equals(liveDOMPath, nativeInput.target.path))
            : textHost === liveDOMTextHost;
          const shouldRepairSyncedTextCaret =
            liveDOMSelectionBelongsToRepairPath &&
            currentSelection &&
            RangeApi.isCollapsed(currentSelection) &&
            PathApi.equals(currentSelection.anchor.path, path) &&
            liveDOMSelectionOffset !== currentSelection.anchor.offset;
          const shouldArmVirtualizedSyncedTextCaretRepair =
            liveDOMSelectionBelongsToRepairPath &&
            textHost &&
            isInsideVirtualizedDOM(textHost) &&
            currentSelection &&
            RangeApi.isCollapsed(currentSelection) &&
            PathApi.equals(currentSelection.anchor.path, path);

          if (
            shouldRepairSyncedTextCaret ||
            shouldArmVirtualizedSyncedTextCaretRepair
          ) {
            if (shouldArmVirtualizedSyncedTextCaretRepair) {
              setEditableModelSelectionPreference({
                inputController,
                preferModelSelection: true,
                reason: 'repair-induced',
                selectionSource: 'model-owned',
              });
              armModelOwnedTextInputGuard({ inputController });
            }
            scheduleTextInsertCaretRepair({
              delays: shouldArmVirtualizedSyncedTextCaretRepair
                ? [25, 100]
                : [],
            });
          }
          return;
        }

        const currentSelection = readRuntimeSelectionRange(editor);
        const targetInsert = nativeInput.target?.insert;
        const shouldPreferCurrentModelInsert =
          !!nativeInput.target?.preferCapturedInsert &&
          !!targetInsert &&
          currentSelection &&
          RangeApi.isCollapsed(currentSelection) &&
          PathApi.equals(currentSelection.anchor.path, path) &&
          targetInsert.offset < currentSelection.anchor.offset &&
          applyTextInsert(editorNode.text, {
            offset: currentSelection.anchor.offset,
            text: inputText,
          }) === textHostText;
        const insert = getDOMTextRepairInsert({
          inputText,
          preferCapturedInsert: nativeInput.target?.preferCapturedInsert,
          selectionOffset,
          editorText: editorNode.text,
          targetInsert: shouldPreferCurrentModelInsert
            ? { offset: currentSelection.anchor.offset, text: inputText }
            : targetInsert,
          textHostText,
        });

        if (insert.text.length === 0) {
          return;
        }
        if (
          hasNonWritableAt(
            editor,
            currentSelection ?? { path, offset: insert.offset }
          )
        ) {
          giveBackRefusedTextInsert({
            editorText: editorNode.text,
            insert,
            path,
            restoreFullText: Boolean(
              currentSelection && RangeApi.isExpanded(currentSelection)
            ),
            textHost,
          });
          return;
        }
        const nextOffset = insert.offset + insert.text.length;
        const expandedReplacementRange =
          currentSelection &&
          RangeApi.isExpanded(currentSelection) &&
          PathApi.equals(currentSelection.anchor.path, path) &&
          PathApi.equals(currentSelection.focus.path, path)
            ? currentSelection
            : null;
        const expandedReplacementEdges = expandedReplacementRange
          ? RangeApi.edges(expandedReplacementRange)
          : null;
        const expandedReplacementStart = expandedReplacementEdges?.[0] ?? null;
        const expandedReplacementEnd = expandedReplacementEdges?.[1] ?? null;
        const shouldReplaceExpandedSelection =
          !!expandedReplacementRange &&
          !!expandedReplacementStart &&
          !!expandedReplacementEnd &&
          insert.offset === expandedReplacementStart.offset &&
          textHostText ===
            editorNode.text.slice(0, expandedReplacementStart.offset) +
              insert.text +
              editorNode.text.slice(expandedReplacementEnd.offset);
        const targetStillOwnsDOMSelection =
          !!nativeInput.target &&
          !!liveDOMPath &&
          PathApi.equals(liveDOMPath, nativeInput.target.path) &&
          liveDOMSelectionOffset === nativeInput.target.selectionOffset;
        const targetPathStillOwnsDOMSelection =
          !!nativeInput.target &&
          !!liveDOMPath &&
          PathApi.equals(liveDOMPath, nativeInput.target.path);
        const capturedInsertStillOwnsDOMTarget =
          !!nativeInput.target?.preferCapturedInsert &&
          targetPathStillOwnsDOMSelection;
        const targetTextHostStillOwnsPathlessDOMSelection =
          !!nativeInput.target &&
          !!liveDOMTextHost &&
          liveDOMTextHost.getAttribute('data-editor-path') ===
            nativeInput.target.path.join(',');
        const targetVirtualizedRow = textHost?.closest(
          '[data-editor-virtualized-row]'
        );
        const targetVirtualizedRowStillOwnsPathlessDOMSelection =
          !!nativeInput.target &&
          !liveDOMPath &&
          !!targetVirtualizedRow &&
          !!anchorNode &&
          (anchorNode === targetVirtualizedRow ||
            targetVirtualizedRow.contains(anchorNode));
        const targetPathlessDOMSelectionBelongsToTarget =
          targetTextHostStillOwnsPathlessDOMSelection ||
          targetVirtualizedRowStillOwnsPathlessDOMSelection;
        const targetInsertStillOwnsSamePathDOMSelection =
          !!nativeInput.target?.insert &&
          targetPathStillOwnsDOMSelection &&
          liveDOMTextHostText === nativeInput.target.text;
        const capturedInsertStillOwnsDOMSelection =
          !!nativeInput.target?.preferCapturedInsert &&
          targetStillOwnsDOMSelection;
        const targetInsertStillOwnsPathlessEditorSelection =
          !!nativeInput.target?.insert &&
          !liveDOMPath &&
          targetPathlessDOMSelectionBelongsToTarget;
        const capturedInsertStillOwnsVirtualizedPath =
          !!nativeInput.target?.preferCapturedInsert &&
          !!textHost &&
          isInsideVirtualizedDOM(textHost) &&
          (targetPathStillOwnsDOMSelection ||
            (!liveDOMPath && targetPathlessDOMSelectionBelongsToTarget));
        const shouldMoveSelection =
          shouldReplaceExpandedSelection ||
          targetInsertStillOwnsSamePathDOMSelection ||
          capturedInsertStillOwnsDOMSelection ||
          capturedInsertStillOwnsDOMTarget ||
          targetInsertStillOwnsPathlessEditorSelection ||
          capturedInsertStillOwnsVirtualizedPath ||
          !nativeInput.target ||
          targetStillOwnsDOMSelection;
        const shouldRepairCaretAfterTextInsert =
          shouldMoveSelection &&
          !(
            textHost &&
            isInsideVirtualizedDOM(textHost) &&
            targetStillOwnsDOMSelection
          );
        const shouldArmVirtualizedTextInsertCaretRepair =
          shouldMoveSelection && !!textHost && isInsideVirtualizedDOM(textHost);

        if (shouldMoveSelection) {
          armRepairInducedSelectionOriginGuard();
          if (textHost && isInsideVirtualizedDOM(textHost)) {
            setEditableModelSelectionPreference({
              inputController,
              preferModelSelection: true,
              reason: 'repair-induced',
              selectionSource: 'model-owned',
            });
            armModelOwnedTextInputGuard({ inputController });
          }
        }
        // A repair that leaves the caret elsewhere is not typing at the caret.
        const committed = withTypedTextIntent(
          editor,
          inputController,
          {
            inputType: shouldMoveSelection ? 'insertText' : undefined,
            text: insert.text,
          },
          () =>
            updateNativeTextInput(
              editor,
              (tx) => {
                tx.text.insert(insert.text, {
                  at: shouldReplaceExpandedSelection
                    ? expandedReplacementRange
                    : { path, offset: insert.offset },
                });

                if (shouldMoveSelection) {
                  tx.selection.set({
                    anchor: { path, offset: nextOffset },
                    focus: { path, offset: nextOffset },
                  });
                }
              },
              getEditableNativeGroupingInput(inputController)
            )
        );
        if (!committed) {
          giveBackRefusedTextInsert({
            editorText: editorNode.text,
            insert,
            path,
            restoreFullText: shouldReplaceExpandedSelection,
            textHost,
          });
        }
        if (textHost && !isInsideVirtualizedDOM(textHost)) {
          setEditableModelSelectionPreference({
            inputController,
            preferModelSelection: false,
            reason: 'native-selection',
            selectionSource: 'dom-current',
          });
        }
        if (shouldRepairCaretAfterTextInsert) {
          scheduleTextInsertCaretRepair();
        } else if (shouldArmVirtualizedTextInsertCaretRepair) {
          scheduleTextInsertCaretRepair({
            delays: [25, 100],
            immediate: false,
          });
        }
      }
    },

    repair(repairPolicy, options) {
      if (repairPolicy.kind === 'repair-caret') {
        this.repairCaretAfterModelIntent(
          repairPolicy.reason === 'repair-caret-after-text-insert'
            ? 'repair-caret-after-text-insert'
            : 'repair-caret',
          options
        );
      }
    },

    repairCaretAfterModelIntent(
      kind: 'repair-caret' | 'repair-caret-after-text-insert' = 'repair-caret',
      {
        afterSeq,
        ownedRepair: initialOwnedRepair,
        receipt: initialReceipt,
        replacing,
      }: DOMCaretRepairOptions = {}
    ) {
      const currentFrameId = profileDOMRepairDuration(
        'read-current-frame',
        () => getCurrentEditableEventFrame(editor)?.id ?? null
      );
      const ownedRepair =
        initialOwnedRepair !== undefined
          ? initialOwnedRepair
          : kind === 'repair-caret-after-text-insert'
            ? capturePendingNativeTextInputRepair()
            : null;
      const hasPendingTextInsertRepair =
        inputController.state.pendingNativeTextInputRepairPathKey != null &&
        inputController.state.pendingNativeTextInputRepairOffset != null;
      const frameId =
        kind === 'repair-caret-after-text-insert' ? null : currentFrameId;

      if (frameId !== null) {
        beginDOMRepairFrame(frameState, frameId);
      }

      const isCurrentRepairFrame = () =>
        frameId === null || isDOMRepairFrameCurrent(frameState, frameId);
      let textInsertRepairCompleted = false;
      let receipt = initialReceipt ?? getPlacementGeneration(editor);
      const repairAfterSeq =
        afterSeq ??
        (kind === 'repair-caret-after-text-insert'
          ? inputController.state.selectionChangeSeq
          : undefined);
      const selectionBefore = profileDOMRepairDuration(
        'read-runtime-selection',
        () => readRuntimeSelection(editor)
      );
      profileDOMRepairDuration('record-kernel-trace', () => {
        recordEditableKernelTrace({
          editor,
          trace: {
            command: null,
            eventFamily: 'repair',
            intent: null,
            nativeAllowed: false,
            ownership: 'model-owned',
            repair: { kind },
            selectionChangeOrigin: 'repair-induced',
            selectionAfter: selectionBefore,
            selectionBefore,
            selectionSource: 'model-owned',
            stateAfter: 'repairing',
            stateBefore: 'model-owned',
            targetOwner: 'editor',
          },
        });
      });
      const repairCollapsedSelectionByPath = () =>
        profileDOMRepairDuration('collapsed-selection', () => {
          if (
            kind === 'repair-caret-after-text-insert' &&
            textInsertRepairCompleted
          ) {
            return true;
          }

          if (!isCurrentRepairFrame()) {
            return false;
          }

          const scrollCurrentDOMSelectionIntoView = () => {
            const root = ReactEditor.resolveDocumentOrShadowRoot(editor);

            if (!root) return false;
            const domSelection = getSelection(root);

            if (!isSelectableDOMSelection(editor, domSelection)) {
              return false;
            }

            if (!shouldSkipSelectionScroll(editor)) {
              profileDOMRepairDuration('scroll-current-selection', () => {
                scrollSelectionIntoView(
                  editor,
                  readDOMSelectionRange(domSelection)
                );
              });
            }
            return true;
          };

          const selection = readRuntimeSelectionRange(editor);

          if (!selection || !RangeApi.isCollapsed(selection)) {
            const editable = rootRef.current;

            if (!editable || !isElementFocused(editable)) {
              textInsertRepairCompleted = true;
              return true;
            }
            return scrollCurrentDOMSelectionIntoView();
          }

          const { path } = selection.anchor;
          let pliteOffset = selection.anchor.offset;
          const pendingTextInputRepairPathKey =
            inputController.state.pendingNativeTextInputRepairPathKey;
          const pendingTextInputRepairOffset =
            inputController.state.pendingNativeTextInputRepairOffset;
          const pendingTextInsertRepairTargetsSelection =
            kind === 'repair-caret-after-text-insert' &&
            pendingTextInputRepairPathKey === path.join(',') &&
            pendingTextInputRepairOffset != null;

          if (pendingTextInsertRepairTargetsSelection) {
            pliteOffset = pendingTextInputRepairOffset;

            if (selection.anchor.offset !== pliteOffset) {
              receipt = capturePlacement(
                editor,
                () => {
                  editor.update((tx) => {
                    tx.selection.set({
                      anchor: { path, offset: pliteOffset },
                      focus: { path, offset: pliteOffset },
                    });
                  });
                },
                receipt
              );
              if (placedSince(editor, receipt)) {
                clearOwnedPendingNativeTextInputRepair(ownedRepair);
                return false;
              }
            }
          }

          const editable = rootRef.current;

          if (!editable || !isElementFocused(editable)) {
            if (
              kind === 'repair-caret-after-text-insert' &&
              inputController.state.pendingNativeTextInputRepairPathKey ===
                path.join(',') &&
              inputController.state.pendingNativeTextInputRepairOffset ===
                pliteOffset
            ) {
              inputController.state.pendingNativeTextInputRepairOffset = null;
              inputController.state.pendingNativeTextInputRepairPathKey = null;
            }
            textInsertRepairCompleted = true;
            return true;
          }

          const domPoint = profileDOMRepairDuration('lookup-text-host', () =>
            resolveDOMPointInRoot(
              editor,
              { path, offset: pliteOffset },
              rootRef.current ?? undefined,
              undefined,
              { liveSide: () => !replacing, rejectStaleText: true }
            )
          );
          const targetElement = domPoint
            ? isDOMText(domPoint[0])
              ? domPoint[0].parentElement
              : isDOMElement(domPoint[0])
                ? domPoint[0]
                : null
            : null;
          const textHost = targetElement?.closest<HTMLElement>(
            '[data-editor-node="text"]'
          );

          if (!domPoint || !textHost) {
            if (kind === 'repair-caret-after-text-insert') {
              return false;
            }
            const root = rootRef.current;

            if (
              root &&
              isSoftLineTextStale(editor, { path, offset: pliteOffset }, root)
            ) {
              return false;
            }

            return scrollCurrentDOMSelectionIntoView();
          }

          if (kind === 'repair-caret-after-text-insert') {
            const editorText = readRuntimeText(editor, path)?.text;
            const strings = getPliteTextHostStrings(textHost);
            const textHostText = (
              strings.length
                ? strings.map((string) => string.textContent ?? '').join('')
                : (textHost.textContent ?? '')
            ).replaceAll('\uFEFF', '');
            const bounds = getPliteTextHostBounds(textHost);

            if (
              editorText != null &&
              textHostText !== editorText.slice(bounds.start, bounds.end)
            ) {
              return false;
            }
          }

          const isDecoratedTextHost =
            textHost.getAttribute('data-editor-dom-sync-reason') ===
            'decoration';
          const isVirtualizedTextHost = isInsideVirtualizedDOM(textHost);
          const shouldRetainModelOwnedTextInsert =
            kind === 'repair-caret-after-text-insert' &&
            inputController.state.textInputOwnership === 'model';
          const isModelOwnedTextInsertRepair =
            kind === 'repair-caret-after-text-insert' &&
            (isVirtualizedTextHost ||
              isDecoratedTextHost ||
              shouldRetainModelOwnedTextInsert);
          const pendingTextInsertRepairMatches =
            pendingTextInputRepairPathKey === path.join(',') &&
            pendingTextInputRepairOffset === pliteOffset;

          if (
            isModelOwnedTextInsertRepair &&
            hasPendingTextInsertRepair &&
            !pendingTextInsertRepairMatches
          ) {
            return false;
          }

          const shouldScrollTextHost =
            kind !== 'repair-caret-after-text-insert' || !isVirtualizedTextHost;
          const shouldReleaseTextInsertSelectionToDOM =
            !isVirtualizedTextHost &&
            !isDecoratedTextHost &&
            !shouldRetainModelOwnedTextInsert;
          const root = ReactEditor.resolveDocumentOrShadowRoot(editor);

          if (!root) return false;
          const domSelection = getSelection(root);

          if (!domSelection) {
            return false;
          }

          const repairDOMPoint = (
            domNode: globalThis.Node,
            domOffset: number
          ) => {
            const domRange = textHost.ownerDocument.createRange();

            domRange.setStart(domNode, domOffset);
            domRange.setEnd(domNode, domOffset);
            const selectionMatches =
              domSelection.rangeCount > 0 &&
              domSelection.anchorNode === domNode &&
              domSelection.anchorOffset === domOffset &&
              domSelection.focusNode === domNode &&
              domSelection.focusOffset === domOffset;

            if (isModelOwnedTextInsertRepair) {
              setEditableModelSelectionPreference({
                inputController,
                preferModelSelection: true,
                reason: 'repair-induced',
                selectionSource: 'model-owned',
              });
              armModelOwnedTextInputGuard({ inputController });
            }
            if (!selectionMatches) {
              armRepairInducedSelectionOriginGuard();
              profileDOMRepairDuration('set-dom-selection', () => {
                writeEditableDOMSelection(
                  editable,
                  {
                    anchor: [domNode, domOffset],
                    focus: [domNode, domOffset],
                  },
                  { editor, policy: 'focused' }
                );
              });
            }
            if (
              kind === 'repair-caret-after-text-insert' &&
              (pendingTextInsertRepairMatches ||
                (isModelOwnedTextInsertRepair &&
                  !hasPendingTextInsertRepair)) &&
              domSelection.anchorNode === domNode &&
              domSelection.anchorOffset === domOffset &&
              domSelection.focusNode === domNode &&
              domSelection.focusOffset === domOffset
            ) {
              inputController.state.pendingNativeTextInputRepairOffset = null;
              inputController.state.pendingNativeTextInputRepairPathKey = null;
              textInsertRepairCompleted = true;
            }
            if (shouldScrollTextHost && !shouldSkipSelectionScroll(editor)) {
              profileDOMRepairDuration('scroll-text-host', () => {
                scrollSelectionIntoView(editor, domRange);
              });
            }
            if (
              kind === 'repair-caret-after-text-insert' &&
              shouldReleaseTextInsertSelectionToDOM
            ) {
              const repairedText = readRuntimeText(editor, path)?.text ?? null;

              if (repairedText != null) {
                inputController.state.recentTextInputRepairEcho = {
                  expiresAt:
                    getDOMRepairProfilerTime() +
                    TEXT_INPUT_REPAIR_ECHO_GUARD_MS,
                  pathKey: path.join(','),
                  selectionOffset: pliteOffset,
                  text: repairedText,
                };
              }
              setEditableModelSelectionPreference({
                inputController,
                preferModelSelection: false,
                selectionSource: 'dom-current',
              });
              textInsertRepairCompleted = true;
            }

            return true;
          };
          const domOffset =
            targetElement?.getAttribute('data-editor-zero-width') &&
            domPoint[1] === 0
              ? Math.min(
                  1,
                  isDOMText(domPoint[0])
                    ? (domPoint[0].textContent?.length ?? 0)
                    : domPoint[0].childNodes.length
                )
              : domPoint[1];

          return repairDOMPoint(domPoint[0], domOffset);
        });

      const readPageSelection = () => {
        const editable = rootRef.current;
        const tree = editable?.getRootNode() as
          | Document
          | ShadowRoot
          | undefined;
        const selection = tree ? getSelection(tree) : null;

        return editable
          ? readEditableDOMSelectionPoints(editable, selection)
          : null;
      };
      let repairCompleted = false;
      const attemptRepair = () => {
        if (repairCompleted) {
          return true;
        }
        if (
          replacing &&
          !sameDOMSelectionPoints(replacing, readPageSelection())
        ) {
          repairCompleted = true;

          return true;
        }
        if (!claimPageSelection()) {
          repairCompleted = true;

          return true;
        }
        if (placedSince(editor, receipt)) {
          if (kind === 'repair-caret-after-text-insert') {
            clearOwnedPendingNativeTextInputRepair(ownedRepair);
          }
          repairCompleted = true;

          return true;
        }
        if (!rootRef.current || !isElementFocused(rootRef.current)) {
          if (kind === 'repair-caret-after-text-insert') {
            repairCollapsedSelectionByPath();
          }
          repairCompleted = true;

          return true;
        }
        if (
          getDeferredSelectionWriteStatus({
            afterSeq: repairAfterSeq,
            editable: rootRef.current,
            editor,
            inputController,
            receipt,
          }) === 'hold'
        ) {
          return false;
        }

        const repaired = repairCollapsedSelectionByPath();

        if (placedSince(editor, receipt)) {
          if (kind === 'repair-caret-after-text-insert') {
            clearOwnedPendingNativeTextInputRepair(ownedRepair);
          }
          repairCompleted = true;

          return true;
        }

        repairCompleted =
          repaired && (kind === 'repair-caret' || textInsertRepairCompleted);

        return repairCompleted;
      };
      const retry = (remainingRetries: number) => {
        scheduleRepairAnimationFrame(() => {
          if (!isCurrentRepairFrame()) {
            return;
          }

          if (attemptRepair()) {
            return;
          }

          if (remainingRetries > 0) {
            scheduleRepairTimeout(() => {
              retry(remainingRetries - 1);
            }, 25);
          }
        });
      };

      if (attemptRepair()) {
        return;
      }

      scheduleRepairMicrotask(() => {
        attemptRepair();
      });
      scheduleRepairTimeout(() => {
        attemptRepair();
      });
      retry(kind === 'repair-caret-after-text-insert' ? 40 : 8);
    },

    repairCaretAfterModelTextInsert(options) {
      this.repair(
        {
          kind: 'repair-caret',
          reason: 'repair-caret-after-text-insert',
        },
        options
      );
    },
  };

  return queue;
};
