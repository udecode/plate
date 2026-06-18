import { type Path, PathApi, RangeApi } from '@platejs/slate';
import {
  type DOMRange,
  getSelection,
  isDOMElement,
  isDOMText,
} from '@platejs/slate-dom';
import { EDITOR_TO_WINDOW } from '@platejs/slate-dom/internal';
import {
  getSlateNodeElementByPath,
  getSlateNodePathFromDOMElement,
} from '../hooks/use-slate-node-ref';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { recordSlateReactRender } from '../render-profiler';
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
import { getNativeTextInputHistoryMetadata } from './input-history';
import type { EditableInputController } from './input-state';
import { readRuntimeText } from './runtime-live-state';
import { readRuntimeSelection } from './runtime-selection-state';
import {
  armModelOwnedTextInputGuard,
  setEditableModelSelectionPreference,
} from './selection-controller';
import { shouldSkipSelectionScroll } from './selection-side-effect-policy';

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
  repair: (repairPolicy: EditableRepairPolicy) => void;
  repairCaretAfterModelOperation: (
    kind?: 'repair-caret' | 'repair-caret-after-text-insert'
  ) => void;
  repairCaretAfterModelTextInsert: () => void;
};

const REPAIR_INDUCED_SELECTION_ORIGIN_GUARD_MS = 150;
const TEXT_INPUT_REPAIR_ECHO_GUARD_MS = 120;

export type DOMRepairFrameState = {
  cancelledBeforeFrameId: number;
  currentFrameId: number | null;
};

type DOMRepairSchedulerWindow =
  | Pick<Window, 'queueMicrotask' | 'requestAnimationFrame' | 'setTimeout'>
  | null
  | undefined;

const now = () => globalThis.performance?.now?.() ?? Date.now();

export const getDOMRepairProfilerTime = () => now();

export const profileDOMRepairDuration = <T>(
  kind: string,
  callback: () => T
): T => {
  if (!globalThis.__SLATE_REACT_RENDER_PROFILER__) {
    return callback();
  }

  const start = now();

  try {
    return callback();
  } finally {
    recordSlateReactRender({
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

const createDOMRepairScheduler = (
  getRepairWindow: () => DOMRepairSchedulerWindow
) => {
  const scheduleRepairTimeout = (callback: () => void, delay = 0) => {
    const repairWindow = getRepairWindow();

    if (typeof repairWindow?.setTimeout === 'function') {
      repairWindow.setTimeout(callback, delay);
      return;
    }

    setTimeout(callback, delay);
  };

  const scheduleRepairMicrotask = (callback: () => void) => {
    const repairWindow = getRepairWindow();

    if (typeof repairWindow?.queueMicrotask === 'function') {
      repairWindow.queueMicrotask(callback);
      return;
    }

    queueMicrotask(callback);
  };

  const scheduleRepairAnimationFrame = (callback: () => void) => {
    const repairWindow = getRepairWindow();

    if (typeof repairWindow?.requestAnimationFrame === 'function') {
      repairWindow.requestAnimationFrame(callback);
      return;
    }

    scheduleRepairTimeout(callback, 16);
  };

  return {
    scheduleRepairAnimationFrame,
    scheduleRepairMicrotask,
    scheduleRepairTimeout,
  };
};

export const createDOMRepairQueue = ({
  editor,
  inputController,
  scrollSelectionIntoView,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  scrollSelectionIntoView: (
    editor: ReactRuntimeEditor,
    domRange: DOMRange
  ) => void;
  syncDOMSelectionToEditor: () => void;
}): DOMRepairQueue => {
  const frameState = createDOMRepairFrameState();
  let queue: DOMRepairQueue;

  const getRepairWindow = () => {
    const mappedWindow = EDITOR_TO_WINDOW.get(editor);

    if (mappedWindow) {
      return mappedWindow;
    }

    const root = ReactEditor.findDocumentOrShadowRoot(editor);

    return 'defaultView' in root
      ? root.defaultView
      : root.ownerDocument.defaultView;
  };
  const {
    scheduleRepairAnimationFrame,
    scheduleRepairMicrotask,
    scheduleRepairTimeout,
  } = createDOMRepairScheduler(getRepairWindow);

  const scheduleTextInsertCaretRepair = ({
    delays = [],
    immediate = true,
  }: {
    delays?: number[];
    immediate?: boolean;
  } = {}) => {
    const repair = () => queue.repairCaretAfterModelTextInsert();

    if (immediate) {
      repair();
    }

    for (const delay of delays) {
      scheduleRepairTimeout(repair, delay);
    }
  };

  const armRepairInducedSelectionOriginGuard = () => {
    const repairOriginVersion =
      (inputController.state.repairInducedSelectionOriginVersion ?? 0) + 1;

    inputController.state.repairInducedSelectionOriginVersion =
      repairOriginVersion;
    inputController.state.selectionChangeOrigin = 'repair-induced';
    setTimeout(() => {
      if (
        inputController.state.repairInducedSelectionOriginVersion ===
          repairOriginVersion &&
        inputController.state.selectionChangeOrigin === 'repair-induced'
      ) {
        inputController.state.selectionChangeOrigin = null;
      }
    }, REPAIR_INDUCED_SELECTION_ORIGIN_GUARD_MS);
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

      if (frameId !== null && !isDOMRepairFrameCurrent(frameState, frameId)) {
        return;
      }

      const inputText = nativeInput.data;
      const root = ReactEditor.findDocumentOrShadowRoot(editor);
      const domSelection = getSelection(root);
      const anchorNode = domSelection?.anchorNode ?? null;
      const anchorOffset = domSelection?.anchorOffset ?? null;
      let textHost = isDOMText(anchorNode)
        ? anchorNode.parentElement?.closest('[data-slate-node="text"]')
        : isDOMElement(anchorNode)
          ? anchorNode.closest('[data-slate-node="text"]')
          : null;
      let path = textHost ? getSlateNodePathFromDOMElement(textHost) : null;
      let slateNode = path ? readRuntimeText(editor, path) : null;
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
        path = nativeInput.target.path;
        const liveDOMTextHostMatchesTarget =
          liveDOMPath && PathApi.equals(liveDOMPath, path)
            ? true
            : liveDOMTextHost?.getAttribute('data-slate-path') ===
              path.join(',');
        slateNode = readRuntimeText(editor, path);
        textHost =
          getSlateNodeElementByPath(editor, path) ??
          (liveDOMTextHostMatchesTarget ? liveDOMTextHost : null) ??
          rootElement.querySelector<HTMLElement>(
            `[data-slate-node="text"][data-slate-path="${path.join(',')}"]`
          );
        selectionOffset = nativeInput.target.selectionOffset;
        textHostText = nativeInput.target.text;
      }

      if (
        !slateNode ||
        !path ||
        selectionOffset == null ||
        textHostText == null
      ) {
        const selection = readRuntimeSelection(editor);

        if (selection && RangeApi.isCollapsed(selection)) {
          const fallbackPath = selection.anchor.path;
          const fallbackTextHost = getSlateNodeElementByPath(
            editor,
            fallbackPath
          );
          const fallbackSlateNode = readRuntimeText(editor, fallbackPath);

          if (fallbackTextHost && fallbackSlateNode) {
            path = fallbackPath;
            slateNode = fallbackSlateNode;
            textHost = fallbackTextHost;
            selectionOffset = selection.anchor.offset + inputText.length;
            textHostText =
              fallbackTextHost.textContent?.replace(/\uFEFF/g, '') ?? null;
          }
        }
      }

      if (
        slateNode &&
        path &&
        selectionOffset != null &&
        textHostText != null
      ) {
        if (textHostText === slateNode.text) {
          const currentSelection = readRuntimeSelection(editor);
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

        const currentSelection = readRuntimeSelection(editor);
        const targetInsert = nativeInput.target?.insert;
        const shouldPreferCurrentModelInsert =
          !!nativeInput.target?.preferCapturedInsert &&
          !!targetInsert &&
          currentSelection &&
          RangeApi.isCollapsed(currentSelection) &&
          PathApi.equals(currentSelection.anchor.path, path) &&
          targetInsert.offset < currentSelection.anchor.offset &&
          applyTextInsert(slateNode.text, {
            offset: currentSelection.anchor.offset,
            text: inputText,
          }) === textHostText;
        const insert = getDOMTextRepairInsert({
          inputText,
          preferCapturedInsert: nativeInput.target?.preferCapturedInsert,
          selectionOffset,
          slateText: slateNode.text,
          targetInsert: shouldPreferCurrentModelInsert
            ? { offset: currentSelection.anchor.offset, text: inputText }
            : targetInsert,
          textHostText,
        });

        if (insert.text.length === 0) {
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
            slateNode.text.slice(0, expandedReplacementStart.offset) +
              insert.text +
              slateNode.text.slice(expandedReplacementEnd.offset);
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
          liveDOMTextHost.getAttribute('data-slate-path') ===
            nativeInput.target.path.join(',');
        const targetVirtualizedRow = textHost?.closest(
          '[data-slate-dom-strategy-virtual-row]'
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
            if (targetStillOwnsDOMSelection) {
              setEditableModelSelectionPreference({
                inputController,
                preferModelSelection: false,
                reason: 'native-selection',
                selectionSource: 'dom-current',
              });
            } else {
              setEditableModelSelectionPreference({
                inputController,
                preferModelSelection: true,
                reason: 'repair-induced',
                selectionSource: 'model-owned',
              });
              armModelOwnedTextInputGuard({ inputController });
            }
          }
        }
        editor.update(
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
          { metadata: getNativeTextInputHistoryMetadata(editor) }
        );

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

    repair(repairPolicy) {
      if (repairPolicy.kind === 'repair-caret') {
        this.repairCaretAfterModelOperation(
          repairPolicy.reason === 'repair-caret-after-text-insert'
            ? 'repair-caret-after-text-insert'
            : 'repair-caret'
        );
      }
    },

    repairCaretAfterModelOperation(
      kind: 'repair-caret' | 'repair-caret-after-text-insert' = 'repair-caret'
    ) {
      const currentFrameId = profileDOMRepairDuration(
        'read-current-frame',
        () => getCurrentEditableEventFrame(editor)?.id ?? null
      );
      const hasPendingTextInsertRepair =
        inputController.state.pendingNativeTextInputRepairPathKey != null &&
        inputController.state.pendingNativeTextInputRepairOffset != null;
      const frameId =
        kind === 'repair-caret-after-text-insert' && hasPendingTextInsertRepair
          ? null
          : currentFrameId;

      if (frameId !== null) {
        beginDOMRepairFrame(frameState, frameId);
      }

      const isCurrentRepairFrame = () =>
        frameId === null || isDOMRepairFrameCurrent(frameState, frameId);
      let textInsertRepairCompleted = false;
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
            operations: [],
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
            let root: Document | ShadowRoot;

            try {
              root = ReactEditor.findDocumentOrShadowRoot(editor);
            } catch {
              return false;
            }

            const domSelection = getSelection(root);
            const anchorNode = domSelection?.anchorNode ?? null;
            const focusNode = domSelection?.focusNode ?? null;

            if (
              !domSelection ||
              domSelection.rangeCount === 0 ||
              !ReactEditor.hasSelectableTarget(editor, anchorNode) ||
              !ReactEditor.hasSelectableTarget(editor, focusNode)
            ) {
              return false;
            }

            if (!shouldSkipSelectionScroll(editor)) {
              profileDOMRepairDuration('scroll-current-selection', () => {
                scrollSelectionIntoView(editor, domSelection.getRangeAt(0));
              });
            }
            return true;
          };

          const selection = readRuntimeSelection(editor);

          if (!selection || !RangeApi.isCollapsed(selection)) {
            return scrollCurrentDOMSelectionIntoView();
          }

          const { path } = selection.anchor;
          let slateOffset = selection.anchor.offset;
          const pendingTextInputRepairPathKey =
            inputController.state.pendingNativeTextInputRepairPathKey;
          const pendingTextInputRepairOffset =
            inputController.state.pendingNativeTextInputRepairOffset;
          const pendingTextInsertRepairTargetsSelection =
            kind === 'repair-caret-after-text-insert' &&
            pendingTextInputRepairPathKey === path.join(',') &&
            pendingTextInputRepairOffset != null;

          if (pendingTextInsertRepairTargetsSelection) {
            slateOffset = pendingTextInputRepairOffset;

            if (selection.anchor.offset !== slateOffset) {
              editor.update((tx) => {
                tx.selection.set({
                  anchor: { path, offset: slateOffset },
                  focus: { path, offset: slateOffset },
                });
              });
            }
          }

          let textHost = profileDOMRepairDuration('lookup-text-host', () =>
            getSlateNodeElementByPath(editor, path)
          );

          if (!textHost) {
            let root: Document | ShadowRoot;

            try {
              root = ReactEditor.findDocumentOrShadowRoot(editor);
            } catch {
              return false;
            }

            const domSelection = getSelection(root);
            const anchorNode = domSelection?.anchorNode ?? null;
            const anchorElement = isDOMText(anchorNode)
              ? anchorNode.parentElement
              : isDOMElement(anchorNode)
                ? anchorNode
                : null;
            const selectedTextHost = anchorElement?.closest(
              '[data-slate-node="text"]'
            );

            if (
              isDOMElement(selectedTextHost) &&
              selectedTextHost.getAttribute('data-slate-path') ===
                path.join(',')
            ) {
              textHost = selectedTextHost as HTMLElement;
            }
          }

          if (!textHost) {
            if (kind === 'repair-caret-after-text-insert') {
              return false;
            }

            return scrollCurrentDOMSelectionIntoView();
          }

          if (kind === 'repair-caret-after-text-insert') {
            const slateText = readRuntimeText(editor, path)?.text;
            const textHostText = textHost.textContent?.replace(/\uFEFF/g, '');

            if (slateText != null && textHostText !== slateText) {
              return false;
            }
          }

          const isProjectedTextHost =
            textHost.getAttribute('data-slate-dom-sync-reason') ===
            'projection';
          const isProjectedDOMSyncTextHost =
            textHost.getAttribute('data-slate-projected-dom-sync') === 'true';
          const isVirtualizedTextHost = isInsideVirtualizedDOM(textHost);
          const shouldRetainModelOwnedTextInsert =
            kind === 'repair-caret-after-text-insert' &&
            (inputController.preferModelSelectionForInputRef.current ||
              inputController.state.selectionSource === 'model-owned');
          const isModelOwnedTextInsertRepair =
            kind === 'repair-caret-after-text-insert' &&
            (isVirtualizedTextHost ||
              isProjectedTextHost ||
              isProjectedDOMSyncTextHost ||
              shouldRetainModelOwnedTextInsert);
          const pendingTextInsertRepairMatches =
            pendingTextInputRepairPathKey === path.join(',') &&
            pendingTextInputRepairOffset === slateOffset;

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
            !isProjectedTextHost &&
            !isProjectedDOMSyncTextHost &&
            !shouldRetainModelOwnedTextInsert;
          let root: Document | ShadowRoot;

          try {
            root = ReactEditor.findDocumentOrShadowRoot(editor);
          } catch {
            return false;
          }

          const domSelection = getSelection(root);

          if (!domSelection) {
            return false;
          }

          const strings = Array.from(
            textHost.querySelectorAll(
              '[data-slate-string], [data-slate-zero-width]'
            )
          );
          let offset = 0;

          for (const string of strings) {
            const textNode = Array.from(string.childNodes).find(isDOMText);
            const lengthAttribute = string.getAttribute('data-slate-length');
            const length =
              lengthAttribute == null
                ? (textNode?.textContent?.length ??
                  string.textContent?.length ??
                  0)
                : Number.parseInt(lengthAttribute, 10);
            const nextOffset = offset + (Number.isFinite(length) ? length : 0);

            if (slateOffset <= nextOffset) {
              const zeroWidthOffset =
                textNode?.textContent?.startsWith('\uFEFF') ||
                string.textContent === '\uFEFF'
                  ? 1
                  : 0;
              const domOffset = string.hasAttribute('data-slate-zero-width')
                ? zeroWidthOffset
                : Math.max(0, Math.min(slateOffset - offset, length));

              const domNode = textNode ?? string;
              const domRange = domNode.ownerDocument.createRange();

              domRange.setStart(domNode, domOffset);
              domRange.setEnd(domNode, domOffset);

              armRepairInducedSelectionOriginGuard();
              if (isModelOwnedTextInsertRepair) {
                setEditableModelSelectionPreference({
                  inputController,
                  preferModelSelection: true,
                  reason: 'repair-induced',
                  selectionSource: 'model-owned',
                });
                armModelOwnedTextInputGuard({ inputController });
              }
              profileDOMRepairDuration('set-dom-selection', () => {
                domSelection.setBaseAndExtent(
                  domNode,
                  domOffset,
                  domNode,
                  domOffset
                );
              });
              if (
                domSelection.rangeCount === 0 ||
                domSelection.anchorNode !== domNode ||
                domSelection.anchorOffset !== domOffset ||
                domSelection.focusNode !== domNode ||
                domSelection.focusOffset !== domOffset
              ) {
                domSelection.removeAllRanges();
                domSelection.addRange(domRange);
              }
              if (
                kind === 'repair-caret-after-text-insert' &&
                pendingTextInsertRepairMatches &&
                domSelection.anchorNode === domNode &&
                domSelection.anchorOffset === domOffset &&
                domSelection.focusNode === domNode &&
                domSelection.focusOffset === domOffset
              ) {
                inputController.state.pendingNativeTextInputRepairOffset = null;
                inputController.state.pendingNativeTextInputRepairPathKey =
                  null;
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
                const repairedText =
                  readRuntimeText(editor, path)?.text ?? null;

                if (repairedText != null) {
                  inputController.state.recentTextInputRepairEcho = {
                    expiresAt:
                      getDOMRepairProfilerTime() +
                      TEXT_INPUT_REPAIR_ECHO_GUARD_MS,
                    pathKey: path.join(','),
                    selectionOffset: slateOffset,
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
            }

            offset = nextOffset;
          }

          if (kind === 'repair-caret-after-text-insert') {
            return false;
          }

          return scrollCurrentDOMSelectionIntoView();
        });

      const retry = (remainingRetries: number) => {
        scheduleRepairAnimationFrame(() => {
          if (!isCurrentRepairFrame()) {
            return;
          }

          const repaired = repairCollapsedSelectionByPath();
          if (
            kind === 'repair-caret-after-text-insert' &&
            repaired &&
            textInsertRepairCompleted
          ) {
            return;
          }

          if (remainingRetries > 0) {
            scheduleRepairTimeout(() => retry(remainingRetries - 1), 25);
          }
        });
      };

      const repaired = repairCollapsedSelectionByPath();
      if (
        kind === 'repair-caret-after-text-insert' &&
        repaired &&
        textInsertRepairCompleted
      ) {
        return;
      }

      scheduleRepairMicrotask(() => {
        const repaired = repairCollapsedSelectionByPath();
        if (
          kind === 'repair-caret-after-text-insert' &&
          repaired &&
          textInsertRepairCompleted
        ) {
          return;
        }
      });
      scheduleRepairTimeout(() => {
        repairCollapsedSelectionByPath();
      });
      retry(kind === 'repair-caret-after-text-insert' ? 40 : 8);
    },

    repairCaretAfterModelTextInsert() {
      this.repair({
        kind: 'repair-caret',
        reason: 'repair-caret-after-text-insert',
      });
    },
  };

  return queue;
};
