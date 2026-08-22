import type { DOMPhaseScheduler } from '@platejs/plite-dom/internal';
import {
  type InputEvent as ReactInputEvent,
  type RefObject,
  useCallback,
  useRef,
} from 'react';

import type { ReactRuntimeEditor } from '../plugin/react-editor';
import type { EditableDOMRuntime } from './editable-dom-runtime';
import { prepareEditableInputKernel } from './editing-kernel';
import { isSelectionInEditorView } from './input-controller';
import {
  useEditableDOMInputHandler,
  useEditableInputHandler,
} from './input-router';
import {
  type RepairDOMInput,
  type EditableInputController,
  runTrackedEditableCompositionMutation,
} from './input-state';
import {
  applyEditableInput,
  type DeferredMutation,
} from './model-input-strategy';
import type { EditableEventRuntime } from './runtime-event-engine';
import { readRuntimeSelection } from './runtime-selection-state';
import { armModelOwnedTextInputGuard } from './selection-controller';

type InputHandler = (event: ReactInputEvent<HTMLDivElement>) => boolean | void;

const syncModelOwnedTextInputSelectionToDOM = ({
  domPhaseScheduler,
  syncDOMSelectionToEditor,
}: {
  domPhaseScheduler: DOMPhaseScheduler;
  syncDOMSelectionToEditor: () => void;
}) => {
  const sync = () => {
    syncDOMSelectionToEditor();
  };

  sync();
  domPhaseScheduler.schedule(
    'selection-repair',
    'input-selection-sync-microtask',
    sync,
    { timing: 'microtask' }
  );
  domPhaseScheduler.schedule(
    'selection-repair',
    'input-selection-sync-frame',
    sync,
    { timing: 'animation-frame' }
  );
};

export const useRuntimeInputEvents = ({
  androidInputManagerRef,
  deferNativeTextInputRepair = false,
  deferredMutations,
  editor,
  handledDOMBeforeInputRef,
  inputController,
  onInput,
  readOnly,
  repair,
  rootRef,
  runtime,
  syncDOMSelectionToEditor,
  trace,
}: {
  androidInputManagerRef: EditableEventRuntime['android']['managerRef'];
  deferNativeTextInputRepair?: boolean;
  deferredMutations: RefObject<DeferredMutation[]>;
  editor: ReactRuntimeEditor;
  handledDOMBeforeInputRef: RefObject<boolean>;
  inputController: EditableInputController;
  onInput?: InputHandler;
  readOnly: boolean;
  repair: EditableEventRuntime['repair'];
  rootRef: RefObject<HTMLDivElement | null>;
  runtime: EditableDOMRuntime;
  syncDOMSelectionToEditor: () => void;
  trace: EditableEventRuntime['trace'];
}) => {
  const { domPhaseScheduler } = runtime;
  const handledDOMInputEventsRef = useRef<WeakSet<Event>>(new WeakSet());
  const claimDOMInput = useCallback((event: Event) => {
    const claimed = handledDOMInputEventsRef.current.has(event);

    handledDOMInputEventsRef.current.add(event);
    return claimed;
  }, []);
  const runOwnedDOMMutation = useCallback(
    (callback: () => void) => {
      runtime.runOwnedDOMMutation('scheduler', callback);
    },
    [runtime]
  );
  const repairDOMInput = useCallback<RepairDOMInput>(
    (nativeInput, rootElement) =>
      runTrackedEditableCompositionMutation({
        callback: () => {
          trace.repairDOMInputWithTrace(nativeInput, rootElement);
        },
        editor,
        inputController,
      }).result,
    [editor, inputController, trace]
  );
  const domInput = useEditableDOMInputHandler({
    claimDOMInput,
    deferNativeTextInputRepair,
    domPhaseScheduler,
    editor,
    inputController,
    onReadOnlyDOMInput: repair.forceRender,
    preferRuntimeDOMInputTarget: () =>
      androidInputManagerRef.current ? true : undefined,
    repairDOMInput,
    readOnly,
    rootRef,
    runOwnedDOMMutation,
    shouldRepairDOMInput: () => !androidInputManagerRef.current,
  });

  const handleInput = useCallback(
    (event: ReactInputEvent<HTMLDivElement>) => {
      const decision = prepareEditableInputKernel({
        editor,
        event,
        inputController,
      });
      if (decision.internalTarget) {
        trace.recordKernelEventTrace({
          family: 'input',
          intent: decision.intent,
          ownership: decision.ownership,
          target: event.target,
        });
        event.stopPropagation();
        return;
      }
      if (!isSelectionInEditorView(editor, readRuntimeSelection(editor))) {
        return;
      }

      const nativeInput = event.nativeEvent;
      const { pendingCompositionEnd } = inputController.state;
      const settledCompositionInputMatches =
        pendingCompositionEnd?.ownership === 'settled' &&
        pendingCompositionEnd.data === nativeInput.data &&
        (nativeInput.inputType === 'insertFromComposition' ||
          nativeInput.inputType === 'insertText') &&
        pendingCompositionEnd.inputTypes.includes(nativeInput.inputType);

      if (pendingCompositionEnd?.ownership === 'settled') {
        pendingCompositionEnd.cancel();
      }
      const compositionEndPending =
        pendingCompositionEnd?.ownership === 'external' ||
        pendingCompositionEnd?.ownership === 'plite' ||
        settledCompositionInputMatches;
      const { pendingRootDOMInput } = inputController.state;
      const rootDOMInputMatches =
        !!pendingRootDOMInput &&
        pendingRootDOMInput.inputType === nativeInput.inputType &&
        pendingRootDOMInput.data === nativeInput.data;
      const rootHandledDOMInput =
        rootDOMInputMatches && pendingRootDOMInput.handled;
      const capturedDOMInputRepair =
        !compositionEndPending &&
        rootDOMInputMatches &&
        !pendingRootDOMInput.handled &&
        rootRef.current
          ? {
              repairDOMInput: trace.repairDOMInputWithTrace,
              rootElement: rootRef.current,
              target: pendingRootDOMInput.target,
            }
          : null;

      if (pendingRootDOMInput) {
        inputController.state.pendingRootDOMInput = null;
      }
      const skipNativeTextInputRepair =
        compositionEndPending || rootHandledDOMInput;
      trace.recordKernelEventTrace({
        family: 'input',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      const inputResult = runTrackedEditableCompositionMutation({
        callback: () =>
          applyEditableInput({
            androidInputManagerRef,
            capturedDOMInputRepair,
            deferredMutations,
            editor,
            event,
            handledDOMBeforeInputRef,
            inputController,
            onInput,
            readOnly,
            skipNativeTextInputRepair,
          }),
        editor,
        inputController,
      }).result;
      if (
        !compositionEndPending &&
        decision.intent === 'composition' &&
        (decision.ownership === 'model-owned' ||
          inputController.state.selectionSource === 'model-owned')
      ) {
        armModelOwnedTextInputGuard({ inputController });
        syncModelOwnedTextInputSelectionToDOM({
          domPhaseScheduler,
          syncDOMSelectionToEditor,
        });
      }
      for (const request of inputResult.repairs) {
        repair.requestEditableRepair(request);
      }
    },
    [
      androidInputManagerRef,
      deferredMutations,
      domPhaseScheduler,
      editor,
      handledDOMBeforeInputRef,
      inputController,
      onInput,
      readOnly,
      repair,
      rootRef,
      trace,
      syncDOMSelectionToEditor,
    ]
  );
  const onRuntimeInput = useEditableInputHandler({ handleInput });

  const handleInputCapture = useCallback(
    (event: ReactInputEvent<HTMLDivElement>) => {
      const decision = prepareEditableInputKernel({
        editor,
        event,
        inputController,
      });
      if (decision.internalTarget) {
        trace.recordKernelEventTrace({
          family: 'input',
          intent: decision.intent,
          ownership: decision.ownership,
          target: event.target,
        });
        event.stopPropagation();
        return;
      }
      if (!isSelectionInEditorView(editor, readRuntimeSelection(editor))) {
        return;
      }

      trace.recordKernelEventTrace({
        family: 'input',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
    },
    [editor, inputController, trace]
  );
  const onRuntimeInputCapture = useEditableInputHandler({
    handleInput: handleInputCapture,
  });

  return {
    flushPendingNativeTextInput: domInput.flushPendingNativeTextInput,
    onDOMInput: domInput.onDOMInput,
    onInput: onRuntimeInput,
    onInputCapture: onRuntimeInputCapture,
    queuePendingNativeTextInput: domInput.queuePendingNativeTextInput,
  };
};
