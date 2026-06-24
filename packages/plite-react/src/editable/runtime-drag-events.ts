import { type DragEvent, useCallback } from 'react';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import {
  applyEditableDragEnd,
  applyEditableDragOver,
  applyEditableDragStart,
  applyEditableDrop,
} from './clipboard-input-strategy';
import { prepareEditableClipboardKernel } from './editing-kernel';
import { useEditableDragHandler } from './input-router';
import type {
  EditableInputController,
  EditableInputControllerState,
} from './input-state';
import type { EditableEventRuntime } from './runtime-event-engine';

type DragHandler = (event: DragEvent<HTMLDivElement>) => boolean | void;

export const useRuntimeDragEvents = ({
  editor,
  inputController,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  readOnly,
  repair,
  state,
  trace,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  onDragEnd?: DragHandler;
  onDragOver?: DragHandler;
  onDragStart?: DragHandler;
  onDrop?: DragHandler;
  readOnly: boolean;
  repair: EditableEventRuntime['repair'];
  state: EditableInputControllerState;
  trace: EditableEventRuntime['trace'];
}) => {
  const handleDragEnd = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      const decision = prepareEditableClipboardKernel({
        editor,
        event,
        inputController,
      });
      inputController.state.activeIntent = decision.intent;
      trace.recordKernelEventTrace({
        family: 'dragend',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      applyEditableDragEnd({
        editor,
        event,
        onDragEnd,
        readOnly,
        state,
      });
    },
    [editor, inputController, onDragEnd, readOnly, state, trace]
  );
  const onRuntimeDragEnd = useEditableDragHandler({
    handleDrag: handleDragEnd,
  });

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      const decision = prepareEditableClipboardKernel({
        editor,
        event,
        inputController,
      });
      inputController.state.activeIntent = decision.intent;
      trace.recordKernelEventTrace({
        family: 'dragover',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      applyEditableDragOver({
        editor,
        event,
        onDragOver,
        state,
      });
    },
    [editor, inputController, onDragOver, state, trace]
  );
  const onRuntimeDragOver = useEditableDragHandler({
    handleDrag: handleDragOver,
  });

  const handleDragStart = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      const decision = prepareEditableClipboardKernel({
        editor,
        event,
        inputController,
      });
      inputController.state.activeIntent = decision.intent;
      trace.recordKernelEventTrace({
        family: 'dragstart',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      applyEditableDragStart({
        editor,
        event,
        onDragStart,
        readOnly,
        state,
      });
    },
    [editor, inputController, onDragStart, readOnly, state, trace]
  );
  const onRuntimeDragStart = useEditableDragHandler({
    handleDrag: handleDragStart,
  });

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      const decision = prepareEditableClipboardKernel({
        editor,
        event,
        inputController,
      });
      inputController.state.activeIntent = decision.intent;
      trace.beginKernelEventFrame({
        family: 'drop',
        intent: decision.intent,
        target: event.target,
      });
      const dropResult = applyEditableDrop({
        editor,
        event,
        onDrop,
        readOnly,
        state,
      });
      if (dropResult.repair) {
        repair.requestEditableRepair(dropResult.repair);
      }
      trace.recordKernelEventTrace({
        command: dropResult.command,
        family: 'drop',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
    },
    [editor, inputController, onDrop, readOnly, repair, state, trace]
  );
  const onRuntimeDrop = useEditableDragHandler({ handleDrag: handleDrop });

  return {
    onDragEnd: onRuntimeDragEnd,
    onDragOver: onRuntimeDragOver,
    onDragStart: onRuntimeDragStart,
    onDrop: onRuntimeDrop,
  };
};
