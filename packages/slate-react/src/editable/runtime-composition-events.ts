import { type CompositionEvent, useCallback } from 'react';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import {
  applyEditableCompositionEnd,
  applyEditableCompositionStart,
  applyEditableCompositionUpdate,
} from './composition-state';
import { prepareEditableCompositionKernel } from './editing-kernel';
import { useEditableCompositionHandler } from './input-router';
import type { EditableInputController } from './input-state';
import type { EditableEventRuntime } from './runtime-event-engine';

type CompositionHandler = (
  event: CompositionEvent<HTMLDivElement>
) => boolean | void;

export const useRuntimeCompositionEvents = ({
  androidInputManagerRef,
  editor,
  inputController,
  onCompositionEnd,
  onCompositionStart,
  onCompositionUpdate,
  readOnly,
  setComposing,
  trace,
}: {
  androidInputManagerRef: EditableEventRuntime['android']['managerRef'];
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  onCompositionEnd?: CompositionHandler;
  onCompositionStart?: CompositionHandler;
  onCompositionUpdate?: CompositionHandler;
  readOnly: boolean;
  setComposing: EditableEventRuntime['composition']['setComposing'];
  trace: EditableEventRuntime['trace'];
}) => {
  const handleCompositionEnd = useCallback(
    (event: CompositionEvent<HTMLDivElement>) => {
      const decision = prepareEditableCompositionKernel({
        editor,
        event,
        inputController,
      });
      inputController.state.activeIntent = decision.intent;
      trace.recordKernelEventTrace({
        family: 'compositionend',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      applyEditableCompositionEnd({
        androidInputManagerRef,
        editor,
        event,
        inputController,
        onCompositionEnd,
        readOnly,
        setComposing,
      });
    },
    [
      androidInputManagerRef,
      editor,
      inputController,
      onCompositionEnd,
      readOnly,
      setComposing,
      trace,
    ]
  );
  const onRuntimeCompositionEnd = useEditableCompositionHandler({
    handleComposition: handleCompositionEnd,
  });

  const handleCompositionStart = useCallback(
    (event: CompositionEvent<HTMLDivElement>) => {
      const decision = prepareEditableCompositionKernel({
        editor,
        event,
        inputController,
      });
      inputController.state.activeIntent = decision.intent;
      trace.recordKernelEventTrace({
        family: 'compositionstart',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      applyEditableCompositionStart({
        androidInputManagerRef,
        editor,
        event,
        onCompositionStart,
        readOnly,
        setComposing,
      });
    },
    [
      androidInputManagerRef,
      editor,
      inputController,
      onCompositionStart,
      readOnly,
      setComposing,
      trace,
    ]
  );
  const onRuntimeCompositionStart = useEditableCompositionHandler({
    handleComposition: handleCompositionStart,
  });

  const handleCompositionUpdate = useCallback(
    (event: CompositionEvent<HTMLDivElement>) => {
      const decision = prepareEditableCompositionKernel({
        editor,
        event,
        inputController,
      });
      inputController.state.activeIntent = decision.intent;
      trace.recordKernelEventTrace({
        family: 'compositionupdate',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      applyEditableCompositionUpdate({
        editor,
        event,
        onCompositionUpdate,
        readOnly,
        setComposing,
      });
    },
    [
      editor,
      inputController,
      onCompositionUpdate,
      readOnly,
      setComposing,
      trace,
    ]
  );
  const onRuntimeCompositionUpdate = useEditableCompositionHandler({
    handleComposition: handleCompositionUpdate,
  });

  return {
    onCompositionEnd: onRuntimeCompositionEnd,
    onCompositionStart: onRuntimeCompositionStart,
    onCompositionUpdate: onRuntimeCompositionUpdate,
  };
};
