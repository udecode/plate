import {
  type InputEvent as ReactInputEvent,
  type RefObject,
  useCallback,
  useRef,
} from 'react';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { prepareEditableInputKernel } from './editing-kernel';
import { isSelectionInEditorView } from './input-controller';
import {
  getDOMInputRepairTarget,
  useEditableDOMInputHandler,
  useEditableInputHandler,
} from './input-router';
import type { EditableInputController } from './input-state';
import {
  applyEditableInput,
  type DeferredOperation,
} from './model-input-strategy';
import type { EditableEventRuntime } from './runtime-event-engine';
import { readRuntimeSelection } from './runtime-selection-state';
import { armModelOwnedTextInputGuard } from './selection-controller';

type InputHandler = (event: ReactInputEvent<HTMLDivElement>) => boolean | void;

const syncModelOwnedTextInputSelectionToDOM = ({
  rootElement,
  syncDOMSelectionToEditor,
}: {
  rootElement: HTMLDivElement;
  syncDOMSelectionToEditor: () => void;
}) => {
  const sync = () => {
    syncDOMSelectionToEditor();
  };
  const window = rootElement.ownerDocument.defaultView;

  sync();
  window?.queueMicrotask(sync);
  window?.requestAnimationFrame(sync);
};

export const useRuntimeInputEvents = ({
  androidInputManagerRef,
  deferNativeTextInputRepair = false,
  deferredOperations,
  editor,
  handledDOMBeforeInputRef,
  inputController,
  onInput,
  readOnly,
  repair,
  rootRef,
  syncDOMSelectionToEditor,
  trace,
}: {
  androidInputManagerRef: EditableEventRuntime['android']['managerRef'];
  deferNativeTextInputRepair?: boolean;
  deferredOperations: RefObject<DeferredOperation[]>;
  editor: ReactRuntimeEditor;
  handledDOMBeforeInputRef: RefObject<boolean>;
  inputController: EditableInputController;
  onInput?: InputHandler;
  readOnly: boolean;
  repair: EditableEventRuntime['repair'];
  rootRef: RefObject<HTMLDivElement | null>;
  syncDOMSelectionToEditor: () => void;
  trace: EditableEventRuntime['trace'];
}) => {
  const handledDOMInputEventsRef = useRef<WeakSet<Event>>(new WeakSet());
  const markHandledDOMInput = useCallback((event: Event) => {
    handledDOMInputEventsRef.current.add(event);
  }, []);
  const domInput = useEditableDOMInputHandler({
    deferNativeTextInputRepair,
    editor,
    inputController,
    onHandledDOMInput: markHandledDOMInput,
    onReadOnlyDOMInput: repair.forceRender,
    repairDOMInput: trace.repairDOMInputWithTrace,
    readOnly,
    rootRef,
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

      const skipNativeTextInputRepair = handledDOMInputEventsRef.current.has(
        event.nativeEvent
      );
      trace.recordKernelEventTrace({
        family: 'input',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      const inputResult = applyEditableInput({
        androidInputManagerRef,
        deferredOperations,
        editor,
        event,
        handledDOMBeforeInputRef,
        inputController,
        onInput,
        readOnly,
        skipNativeTextInputRepair,
      });
      if (
        decision.intent === 'composition' &&
        (decision.ownership === 'model-owned' ||
          inputController.state.selectionSource === 'model-owned')
      ) {
        armModelOwnedTextInputGuard({ inputController });
        syncModelOwnedTextInputSelectionToDOM({
          rootElement: event.currentTarget,
          syncDOMSelectionToEditor,
        });
      }
      for (const request of inputResult.repairs) {
        repair.requestEditableRepair(request);
      }
    },
    [
      androidInputManagerRef,
      deferredOperations,
      editor,
      handledDOMBeforeInputRef,
      inputController,
      onInput,
      readOnly,
      repair,
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

      const rootElement = event.currentTarget;
      const { data, inputType } = event.nativeEvent as InputEvent;
      const frameId = trace.getCurrentKernelFrameId();

      if (readOnly) {
        return;
      }

      if (
        deferNativeTextInputRepair &&
        inputType === 'insertText' &&
        typeof data === 'string' &&
        data.length > 0
      ) {
        return;
      }

      const target =
        inputType === 'insertText'
          ? getDOMInputRepairTarget(
              editor,
              rootElement,
              { data, inputType },
              {
                preferRuntimeSelection:
                  (inputController.state.modelOwnedTextInputGuard ?? 0) > 0 ||
                  (inputController.preferModelSelectionForInputRef.current &&
                    inputController.state.selectionSource === 'model-owned'),
              }
            )
          : null;

      markHandledDOMInput(event.nativeEvent);
      trace.repairDOMInputAfterFrame(
        { data, inputType, target },
        rootElement,
        frameId
      );
    },
    [
      deferNativeTextInputRepair,
      editor,
      inputController,
      markHandledDOMInput,
      readOnly,
      trace,
    ]
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
