import { type KeyboardEvent, useCallback } from 'react';
import type { RuntimeId } from '@platejs/plite';
import type { EditableKeyDownHandler } from '../components/editable';
import type { MountedTopLevelRange } from '../dom-strategy/dom-strategy-commands';
import { useOptionalPliteRuntimeContext } from '../hooks/use-plite-runtime';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { recordPliteReactRender } from '../render-profiler';
import { MAIN_ROOT_KEY } from '../root-key';
import { readPliteViewSelection } from '../view-selection';
import {
  getContentRootNavigationTarget,
  shouldModelOwnContentRootVerticalSelection,
} from './content-root-navigation';
import {
  isMountedPlainVerticalLargeDocumentMovement,
  shouldModelOwnPlainVerticalLargeDocumentExtension,
} from './dom-coverage-vertical-selection';
import { prepareEditableKeyDownKernel } from './editing-kernel';
import { useEditableKeyboardHandler } from './input-router';
import type { EditableInputController } from './input-state';
import { applyEditableKeyDown } from './keyboard-input-strategy';
import { getSnapshot as editorGetSnapshot } from './runtime-editor-api';
import type { EditableEventRuntimeCore } from './runtime-event-engine';

const WHITESPACE_KEY_RE = /\s/;
const MODIFIER_ONLY_KEYS = new Set([
  'Alt',
  'AltGraph',
  'CapsLock',
  'Control',
  'Fn',
  'FnLock',
  'Meta',
  'NumLock',
  'ScrollLock',
  'Shift',
  'Symbol',
  'SymbolLock',
]);

const isProjectedSelectionCaptureKey = (event: KeyboardEvent<HTMLDivElement>) =>
  event.shiftKey &&
  (event.key === 'ArrowUp' ||
    event.key === 'ArrowDown' ||
    event.key === 'ArrowLeft' ||
    event.key === 'ArrowRight');

const isProjectedEditingCaptureKey = (event: KeyboardEvent<HTMLDivElement>) =>
  !event.altKey &&
  !event.ctrlKey &&
  !event.metaKey &&
  (event.key === 'Backspace' ||
    event.key === 'Delete' ||
    event.key === 'Enter');

const measureRuntimeKeyDownPhase = <T>(id: string, run: () => T): T => {
  if (!globalThis.__PLITE_REACT_RENDER_PROFILER__) {
    return run();
  }

  const startedAt = performance.now();

  try {
    return run();
  } finally {
    recordPliteReactRender({
      duration: performance.now() - startedAt,
      id,
      kind: 'runtime-time',
    });
  }
};

export const shouldFlushPendingNativeTextInputForKeyDown = (
  decision: ReturnType<typeof prepareEditableKeyDownKernel>,
  event: KeyboardEvent<HTMLDivElement>
) => {
  const hasCommandModifier = event.altKey || event.ctrlKey || event.metaKey;
  const isTextShortcutBoundary =
    event.key.length === 1 && WHITESPACE_KEY_RE.test(event.key);
  const isModelMutationBoundary =
    decision.intent === 'delete' ||
    decision.intent === 'format' ||
    decision.intent === 'insert-break' ||
    decision.intent === 'model-selection-move';

  if (decision.intent === 'composition') {
    return false;
  }

  if (decision.intent === 'text-insert' && !hasCommandModifier) {
    return isTextShortcutBoundary;
  }

  if (decision.targetOwner === 'internal-control') {
    return decision.intent === 'history';
  }

  return (
    isModelMutationBoundary ||
    decision.shouldForceDOMImport ||
    decision.intent === 'history' ||
    decision.intent === 'native-selection-move' ||
    (hasCommandModifier && decision.targetOwner === 'editor')
  );
};

export const shouldFlushPendingNativeTextInputBeforeKeyDown = (
  inputController: EditableInputController,
  event: KeyboardEvent<HTMLDivElement>
) => {
  if (!inputController.state.pendingNativeTextInputRepairPathKey) {
    return false;
  }

  if (MODIFIER_ONLY_KEYS.has(event.key)) {
    return false;
  }

  const hasCommandModifier = event.altKey || event.ctrlKey || event.metaKey;
  const isPlainTextContinuation =
    event.key.length === 1 &&
    !hasCommandModifier &&
    !WHITESPACE_KEY_RE.test(event.key);

  return !isPlainTextContinuation;
};

export const shouldApplyKeyDownSelectionPolicy = (
  decision: ReturnType<typeof prepareEditableKeyDownKernel>,
  event: KeyboardEvent<HTMLDivElement>,
  inputController: EditableInputController
) => {
  const hasCommandModifier = event.altKey || event.ctrlKey || event.metaKey;
  const isTextShortcutBoundary =
    event.key.length === 1 && WHITESPACE_KEY_RE.test(event.key);

  if (decision.intent === null && MODIFIER_ONLY_KEYS.has(event.key)) {
    return false;
  }

  if (
    decision.intent === 'text-insert' &&
    inputController.state.selectionSource === 'model-owned' &&
    event.key.length === 1 &&
    !hasCommandModifier &&
    !isTextShortcutBoundary
  ) {
    return false;
  }

  if (
    decision.intent !== 'text-insert' ||
    (!inputController.state.pendingNativeTextInputRepairPathKey &&
      (inputController.state.modelOwnedTextInputGuard ?? 0) === 0)
  ) {
    return true;
  }

  return hasCommandModifier || isTextShortcutBoundary || event.key.length !== 1;
};

export const isNativeVerticalKeyFastPathFullyMounted = ({
  domStrategyRuntime,
  editor,
}: {
  domStrategyRuntime: {
    mountedTopLevelRuntimeIds: ReadonlySet<RuntimeId> | null;
    mountedTopLevelRanges?: readonly MountedTopLevelRange[];
  } | null;
  editor: ReactRuntimeEditor;
}) => {
  if (!domStrategyRuntime) {
    return true;
  }

  if (!domStrategyRuntime.mountedTopLevelRuntimeIds) {
    return true;
  }

  const mountedRanges = domStrategyRuntime.mountedTopLevelRanges;

  if (!mountedRanges || mountedRanges.length === 0) {
    return false;
  }

  const topLevelCount = editorGetSnapshot(editor).children.length;

  if (topLevelCount === 0) {
    return true;
  }

  let coveredUntil = 0;

  for (const range of [...mountedRanges].sort(
    (left, right) => left.startIndex - right.startIndex
  )) {
    if (range.endIndex < coveredUntil) {
      continue;
    }

    if (range.startIndex > coveredUntil) {
      return false;
    }

    coveredUntil = range.endIndex + 1;

    if (coveredUntil >= topLevelCount) {
      return true;
    }
  }

  return false;
};

export const useRuntimeKeyboardEvents = ({
  editor,
  inputController,
  domStrategyRuntime,
  flushPendingNativeTextInput,
  onKeyDown,
  readOnly,
  runtime,
  setExplicitPartialDOMBackedSelection,
  partialDOMBackedSelection,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  domStrategyRuntime: {
    type: 'staged' | 'partial-dom' | 'virtualized';
    mountedTopLevelRuntimeIds: ReadonlySet<RuntimeId> | null;
    mountedTopLevelRanges?: readonly MountedTopLevelRange[];
  } | null;
  flushPendingNativeTextInput?: () => void;
  onKeyDown?: EditableKeyDownHandler;
  readOnly: boolean;
  runtime: EditableEventRuntimeCore;
  setExplicitPartialDOMBackedSelection: (nextValue: boolean) => void;
  partialDOMBackedSelection: boolean;
}) => {
  const pliteRuntimeContext = useOptionalPliteRuntimeContext();
  const runKeyDownEvent = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (
        shouldFlushPendingNativeTextInputBeforeKeyDown(inputController, event)
      ) {
        flushPendingNativeTextInput?.();
      }

      const isVerticalArrowKey =
        event.key === 'ArrowUp' || event.key === 'ArrowDown';
      const snapshotSelection = measureRuntimeKeyDownPhase(
        'keydown.snapshot-selection',
        () => editorGetSnapshot(editor).selection
      );
      const modelOwnsVerticalShift = measureRuntimeKeyDownPhase(
        'keydown.model-owns-vertical-shift',
        () =>
          event.shiftKey &&
          isVerticalArrowKey &&
          shouldModelOwnPlainVerticalLargeDocumentExtension({
            domStrategyRuntime,
            editor,
            event,
          })
      );
      const nativeMountedVerticalShift = measureRuntimeKeyDownPhase(
        'keydown.native-mounted-vertical-shift',
        () =>
          event.shiftKey &&
          isVerticalArrowKey &&
          isMountedPlainVerticalLargeDocumentMovement({
            domStrategyRuntime,
            editor,
            event,
            selection: snapshotSelection,
          })
      );
      const modelOwnsContentRootVerticalShift = measureRuntimeKeyDownPhase(
        'keydown.model-owns-content-root-vertical-shift',
        () =>
          shouldModelOwnContentRootVerticalSelection({
            editor,
            event,
            getActiveContentRootOwner:
              pliteRuntimeContext?.getActiveContentRootOwner,
            selection: snapshotSelection,
          })
      );
      const modelOwnsContentRootVerticalMove = measureRuntimeKeyDownPhase(
        'keydown.model-owns-content-root-vertical-move',
        () =>
          isVerticalArrowKey &&
          !event.shiftKey &&
          Boolean(
            getContentRootNavigationTarget({
              editor,
              event,
              getActiveContentRootOwner:
                pliteRuntimeContext?.getActiveContentRootOwner,
              getContentRootOwnerViewEditor:
                pliteRuntimeContext?.getContentRootOwnerViewEditor,
              getMountedViewEditor: pliteRuntimeContext?.getMountedViewEditor,
              isRTL: false,
              selection: snapshotSelection,
            })
          )
      );

      if (
        !readOnly &&
        !onKeyDown &&
        inputController.state.selectionSource === 'dom-current' &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !modelOwnsVerticalShift &&
        !modelOwnsContentRootVerticalShift &&
        !modelOwnsContentRootVerticalMove &&
        (nativeMountedVerticalShift ||
          isNativeVerticalKeyFastPathFullyMounted({
            domStrategyRuntime,
            editor,
          })) &&
        isVerticalArrowKey
      ) {
        flushPendingNativeTextInput?.();
        return;
      }

      const decision = measureRuntimeKeyDownPhase(
        'keydown.prepare-kernel',
        () =>
          prepareEditableKeyDownKernel({
            editor,
            event,
            inputController,
            domStrategyRuntime,
          })
      );

      if (shouldFlushPendingNativeTextInputForKeyDown(decision, event)) {
        flushPendingNativeTextInput?.();
      }

      inputController.state.activeIntent = decision.intent;
      if (shouldApplyKeyDownSelectionPolicy(decision, event, inputController)) {
        measureRuntimeKeyDownPhase('keydown.apply-selection-policy', () => {
          runtime.selection.applyKeyDownSelectionPolicy(decision);
        });
      }

      measureRuntimeKeyDownPhase('keydown.trace-begin-frame', () => {
        runtime.trace.beginKeyDownEventFrame(decision);
      });

      const keyDownWorkerResult = measureRuntimeKeyDownPhase(
        'keydown.apply-editable-keydown',
        () =>
          applyEditableKeyDown({
            androidInputManagerRef: runtime.android.managerRef,
            editor,
            event,
            forceRender: runtime.repair.forceRender,
            inputController,
            domStrategyRuntime,
            getActiveContentRootOwner:
              pliteRuntimeContext?.getActiveContentRootOwner,
            getContentRootOwnerViewEditor:
              pliteRuntimeContext?.getContentRootOwnerViewEditor,
            getMountedViewEditor: pliteRuntimeContext?.getMountedViewEditor,
            onKeyDown,
            readOnly,
            setExplicitPartialDOMBackedSelection,
            setComposing: runtime.composition.setComposing,
            partialDOMBackedSelection,
          })
      );

      if (keyDownWorkerResult.repair) {
        const repair = keyDownWorkerResult.repair;

        measureRuntimeKeyDownPhase('keydown.request-repair', () => {
          runtime.repair.requestEditableRepair(repair);
        });
      }

      if (
        !readOnly &&
        !keyDownWorkerResult.handled &&
        decision.intent === 'native-selection-move' &&
        (event.key === 'ArrowUp' || event.key === 'ArrowDown')
      ) {
        setTimeout(() => {
          runtime.selection.syncDOMSelectionFromRuntime();
        });
      }
      measureRuntimeKeyDownPhase('keydown.trace-record', () => {
        runtime.trace.recordKeyDownTrace({
          decision,
          eventKey: event.key,
          handled: keyDownWorkerResult.handled,
        });
      });
    },
    [
      editor,
      flushPendingNativeTextInput,
      inputController,
      domStrategyRuntime,
      onKeyDown,
      readOnly,
      runtime,
      pliteRuntimeContext,
      setExplicitPartialDOMBackedSelection,
      partialDOMBackedSelection,
    ]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      runKeyDownEvent(event);
    },
    [runKeyDownEvent]
  );

  const handleKeyDownCapture = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const decision = prepareEditableKeyDownKernel({
        editor,
        event,
        inputController,
        domStrategyRuntime,
      });

      const shouldCaptureProjectedSelection =
        decision.targetOwner === 'internal-control' &&
        isProjectedSelectionCaptureKey(event) &&
        (() => {
          const selection = editorGetSnapshot(editor).selection;

          if (!selection) {
            return false;
          }

          const viewRoot = editor.read((state) => state.view.root());
          const anchorRoot = selection.anchor.root ?? MAIN_ROOT_KEY;
          const focusRoot = selection.focus.root ?? MAIN_ROOT_KEY;

          return anchorRoot !== viewRoot || focusRoot !== viewRoot;
        })();
      const shouldCaptureProjectedEditing =
        decision.targetOwner === 'internal-control' &&
        isProjectedEditingCaptureKey(event) &&
        readPliteViewSelection(editor) !== null;
      const shouldCapture =
        decision.targetOwner === 'internal-control' &&
        (decision.intent === 'history' ||
          shouldCaptureProjectedSelection ||
          shouldCaptureProjectedEditing);

      if (!shouldCapture) {
        return;
      }

      if (decision.intent === 'history') {
        flushPendingNativeTextInput?.();
        runtime.selection.applyKeyDownSelectionPolicy(decision);
      }
      runtime.trace.beginKeyDownEventFrame(decision);
      const keyDownWorkerResult = applyEditableKeyDown({
        androidInputManagerRef: runtime.android.managerRef,
        editor,
        event,
        forceRender: runtime.repair.forceRender,
        inputController,
        domStrategyRuntime,
        getActiveContentRootOwner:
          pliteRuntimeContext?.getActiveContentRootOwner,
        getContentRootOwnerViewEditor:
          pliteRuntimeContext?.getContentRootOwnerViewEditor,
        getMountedViewEditor: pliteRuntimeContext?.getMountedViewEditor,
        onKeyDown,
        readOnly,
        setExplicitPartialDOMBackedSelection,
        setComposing: runtime.composition.setComposing,
        partialDOMBackedSelection,
      });

      if (!keyDownWorkerResult.handled) {
        runtime.trace.recordKeyDownTrace({
          decision,
          eventKey: event.key,
          handled: false,
        });
        return;
      }

      event.stopPropagation();
      if (keyDownWorkerResult.repair) {
        runtime.repair.requestEditableRepair(keyDownWorkerResult.repair);
      }
      runtime.trace.recordKeyDownTrace({
        decision,
        eventKey: event.key,
        handled: keyDownWorkerResult.handled,
      });
    },
    [
      editor,
      flushPendingNativeTextInput,
      inputController,
      domStrategyRuntime,
      onKeyDown,
      readOnly,
      runtime,
      pliteRuntimeContext,
      setExplicitPartialDOMBackedSelection,
      partialDOMBackedSelection,
    ]
  );

  return {
    onKeyDownCapture: useEditableKeyboardHandler({
      handleKeyboard: handleKeyDownCapture,
    }),
    onKeyDown: useEditableKeyboardHandler({
      handleKeyboard: handleKeyDown,
    }),
  };
};
