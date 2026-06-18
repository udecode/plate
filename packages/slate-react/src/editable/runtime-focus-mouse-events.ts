import { type FocusEvent, type MouseEvent, useCallback, useRef } from 'react';
import { isDOMNode } from '@platejs/slate-dom';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { prepareEditableFocusMouseKernel } from './editing-kernel';
import {
  getNestedEditableDOMSelectionRoot,
  isInteractiveInternalTarget,
  isNativeInternalControlTarget,
  setEditableModelSelectionPreference,
} from './input-controller';
import {
  useEditableFocusHandler,
  useEditableMouseHandler,
} from './input-router';
import type { EditableInputController } from './input-state';
import type { EditableEventRuntime } from './runtime-event-engine';
import {
  applyEditableBlur,
  applyEditableClick,
  applyEditableFocus,
  applyEditableMouseDown,
  type EditableSelectionReconcilerState,
  selectEditableVoidTarget,
} from './selection-reconciler';

type FocusHandler = (event: FocusEvent<HTMLDivElement>) => boolean | void;
type MouseHandler = (event: MouseEvent<HTMLDivElement>) => boolean | void;

export const useRuntimeFocusMouseEvents = ({
  editor,
  flushPendingNativeTextInput,
  inputController,
  onBlur,
  onClick,
  onFocus,
  onMouseDown,
  onMouseUp,
  readOnly,
  selection,
  state,
  syncDOMSelectionToEditor,
  trace,
}: {
  editor: ReactRuntimeEditor;
  flushPendingNativeTextInput?: () => void;
  inputController: EditableInputController;
  onBlur?: FocusHandler;
  onClick?: MouseHandler;
  onFocus?: FocusHandler;
  onMouseDown?: MouseHandler;
  onMouseUp?: MouseHandler;
  readOnly: boolean;
  selection: EditableEventRuntime['selection'];
  state: EditableSelectionReconcilerState;
  syncDOMSelectionToEditor: () => void;
  trace: EditableEventRuntime['trace'];
}) => {
  const nativeInternalFocusRef = useRef(false);
  const nativePointerFocusRef = useRef(false);

  const markNativePointerFocus = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      nativePointerFocusRef.current = !isInteractiveInternalTarget(
        editor,
        event.target
      );
      setTimeout(() => {
        nativePointerFocusRef.current = false;
      });
    },
    [editor]
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      flushPendingNativeTextInput?.();
      const decision = prepareEditableFocusMouseKernel({
        editor,
        event,
        inputController,
      });
      trace.recordKernelEventTrace({
        family: 'blur',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      if (
        isNativeInternalControlTarget(editor, event.target) &&
        !nativePointerFocusRef.current
      ) {
        nativeInternalFocusRef.current = false;
        syncDOMSelectionToEditor();
      }

      applyEditableBlur({
        editor,
        event,
        onBlur,
        readOnly,
        state,
      });

      const relatedTarget = event.relatedTarget;
      const movingWithinEditor =
        relatedTarget != null &&
        isDOMNode(relatedTarget) &&
        ReactEditor.hasDOMNode(editor, relatedTarget);

      if (
        !readOnly &&
        ReactEditor.hasEditableTarget(editor, event.target) &&
        !movingWithinEditor
      ) {
        setEditableModelSelectionPreference({
          inputController,
          preferModelSelection: true,
          reason: 'model-command',
          selectionSource: 'model-owned',
        });
      }
    },
    [
      editor,
      flushPendingNativeTextInput,
      inputController,
      onBlur,
      readOnly,
      state,
      syncDOMSelectionToEditor,
      trace,
    ]
  );
  const onRuntimeBlur = useEditableFocusHandler({ handleFocus: handleBlur });

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      const decision = prepareEditableFocusMouseKernel({
        editor,
        event,
        inputController,
      });
      trace.recordKernelEventTrace({
        family: 'focus',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      if (isNativeInternalControlTarget(editor, event.target)) {
        setEditableModelSelectionPreference({
          inputController,
          preferModelSelection: true,
          selectionSource: 'internal-control',
        });
        nativeInternalFocusRef.current = true;
        return;
      }

      if (
        nativeInternalFocusRef.current &&
        !nativePointerFocusRef.current &&
        isInteractiveInternalTarget(editor, event.target)
      ) {
        nativeInternalFocusRef.current = false;
        syncDOMSelectionToEditor();
        return;
      }

      const editorElement = ReactEditor.assertDOMNode(editor, editor);
      if (
        event.target === editorElement &&
        getNestedEditableDOMSelectionRoot(editorElement)
      ) {
        nativeInternalFocusRef.current = false;
        return;
      }

      const handled = applyEditableFocus({
        editor,
        event,
        onFocus,
        readOnly,
        state,
      });

      if (
        handled &&
        event.target === editorElement &&
        !nativePointerFocusRef.current
      ) {
        const syncProgrammaticFocusSelection = () => syncDOMSelectionToEditor();

        nativeInternalFocusRef.current = false;
        syncProgrammaticFocusSelection();
        queueMicrotask(syncProgrammaticFocusSelection);
        setTimeout(syncProgrammaticFocusSelection);
      }
    },
    [
      editor,
      inputController,
      onFocus,
      readOnly,
      state,
      syncDOMSelectionToEditor,
      trace,
    ]
  );
  const onRuntimeFocus = useEditableFocusHandler({ handleFocus });

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const decision = prepareEditableFocusMouseKernel({
        editor,
        event,
        inputController,
      });
      trace.recordKernelEventTrace({
        family: 'click',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      applyEditableClick({
        editor,
        event,
        inputController,
        onClick,
        readOnly,
      });
    },
    [editor, inputController, onClick, readOnly, trace]
  );
  const onRuntimeClick = useEditableMouseHandler({ handleMouse: handleClick });

  const handleMouseDownCapture = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      markNativePointerFocus(event);

      if (readOnly) {
        return;
      }

      const selectedVoidPath = selectEditableVoidTarget({
        editor,
        inputController,
        target: event.target,
      });

      if (selectedVoidPath) {
        event.preventDefault();
      }
    },
    [editor, inputController, markNativePointerFocus, readOnly]
  );
  const onRuntimeMouseDownCapture = useEditableMouseHandler({
    handleMouse: handleMouseDownCapture,
  });

  const handleMouseDown = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      flushPendingNativeTextInput?.();
      const decision = prepareEditableFocusMouseKernel({
        editor,
        event,
        inputController,
      });
      markNativePointerFocus(event);
      trace.recordKernelEventTrace({
        family: 'mousedown',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      applyEditableMouseDown({
        editor,
        event,
        inputController,
        onMouseDown,
      });
    },
    [
      editor,
      flushPendingNativeTextInput,
      inputController,
      markNativePointerFocus,
      onMouseDown,
      trace,
    ]
  );
  const onRuntimeMouseDown = useEditableMouseHandler({
    handleMouse: handleMouseDown,
  });

  const handleMouseUp = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (isInteractiveInternalTarget(editor, event.target)) {
        onMouseUp?.(event);
        return;
      }

      const handled =
        (onMouseUp?.(event) as boolean | void) ?? event.defaultPrevented;

      if (!handled) {
        selection.syncDOMSelectionFromRuntime();
      }
    },
    [editor, onMouseUp, selection]
  );
  const onRuntimeMouseUp = useEditableMouseHandler({
    handleMouse: handleMouseUp,
  });

  return {
    onBlur: onRuntimeBlur,
    onClick: onRuntimeClick,
    onFocus: onRuntimeFocus,
    onMouseDownCapture: onRuntimeMouseDownCapture,
    onMouseDown: onRuntimeMouseDown,
    onMouseUp: onRuntimeMouseUp,
  };
};
