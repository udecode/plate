import { type CompositionEvent, useCallback } from 'react';

import type { ReactRuntimeEditor } from '../plugin/react-editor';
import {
  applyEditableCompositionEnd,
  applyEditableCompositionStart,
  applyEditableCompositionUpdate,
} from './composition-state';
import type { EditableDOMRuntime } from './editable-dom-runtime';
import { prepareEditableCompositionKernel } from './editing-kernel';
import { useEditableCompositionHandler } from './input-router';
import {
  type EditableInputController,
  recordEditableInputIntent,
} from './input-state';
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
  requestModelSelectionExportAfterRender,
  runtime,
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
  requestModelSelectionExportAfterRender: () => void;
  runtime: EditableDOMRuntime;
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
      recordEditableInputIntent(inputController, decision.intent);
      trace.recordKernelEventTrace({
        family: 'compositionend',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      runtime.runOwnedDOMMutation('composition', () => {
        applyEditableCompositionEnd({
          androidInputManagerRef,
          editor,
          event,
          inputController,
          onCompositionEnd,
          readOnly,
          requestModelSelectionExportAfterRender,
          runOwnedDOMMutation: (callback) => {
            runtime.runOwnedDOMMutation('composition', callback);
          },
          scheduleTask: runtime.domPhaseScheduler.schedule,
          setComposing,
        });
      });
    },
    [
      androidInputManagerRef,
      editor,
      inputController,
      onCompositionEnd,
      readOnly,
      requestModelSelectionExportAfterRender,
      runtime,
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
      if (decision.intent !== 'composition') {
        recordEditableInputIntent(inputController, decision.intent);
      }
      trace.recordKernelEventTrace({
        family: 'compositionstart',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      runtime.runOwnedDOMMutation('composition', () => {
        applyEditableCompositionStart({
          androidInputManagerRef,
          editor,
          event,
          inputController,
          onCompositionStart,
          readOnly,
          setComposing,
        });
      });
    },
    [
      androidInputManagerRef,
      editor,
      inputController,
      onCompositionStart,
      readOnly,
      runtime,
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
      if (decision.intent !== 'composition') {
        recordEditableInputIntent(inputController, decision.intent);
      }
      trace.recordKernelEventTrace({
        family: 'compositionupdate',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      runtime.runOwnedDOMMutation('composition', () => {
        applyEditableCompositionUpdate({
          editor,
          event,
          inputController,
          onCompositionUpdate,
          readOnly,
          setComposing,
        });
      });
    },
    [
      editor,
      inputController,
      onCompositionUpdate,
      readOnly,
      runtime,
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
