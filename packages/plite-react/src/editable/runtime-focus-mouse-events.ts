import { type FocusEvent, type MouseEvent, useCallback, useRef } from 'react';
import { SelectionApi } from '@platejs/plite';
import { isDOMNode } from '@platejs/plite-dom';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import type { DOMPhaseScheduler } from '@platejs/plite-dom/internal';
import { prepareEditableFocusMouseKernel } from './editing-kernel';
import {
  getNestedEditableDOMSelectionRoot,
  isInteractiveInternalTarget,
  isNativeDraggableTarget,
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
  selectEditableKeyboardSelectableTarget,
  selectEditableVoidTarget,
} from './selection-reconciler';

type FocusHandler = (event: FocusEvent<HTMLDivElement>) => boolean | void;
type MouseHandler = (event: MouseEvent<HTMLDivElement>) => boolean | void;

export const useRuntimeFocusMouseEvents = ({
  clearVerticalGoal,
  domPhaseScheduler,
  editor,
  flushPendingNativeTextInput,
  inputController,
  onBlur,
  onClick,
  onFocus,
  onMouseDown,
  onMouseUp,
  publishFocusState,
  readOnly,
  selection,
  state,
  syncDOMSelectionToEditor,
  trace,
}: {
  clearVerticalGoal: () => void;
  domPhaseScheduler: DOMPhaseScheduler;
  editor: ReactRuntimeEditor;
  flushPendingNativeTextInput?: () => void;
  inputController: EditableInputController;
  onBlur?: FocusHandler;
  onClick?: MouseHandler;
  onFocus?: FocusHandler;
  onMouseDown?: MouseHandler;
  onMouseUp?: MouseHandler;
  publishFocusState: () => void;
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
      domPhaseScheduler.schedule(
        'model',
        'clear-native-pointer-focus',
        () => {
          nativePointerFocusRef.current = false;
        },
        { timing: 'timeout' }
      );
    },
    [domPhaseScheduler, editor]
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
      publishFocusState();

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
      publishFocusState,
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
        publishFocusState();
        return;
      }

      if (
        nativeInternalFocusRef.current &&
        !nativePointerFocusRef.current &&
        isInteractiveInternalTarget(editor, event.target)
      ) {
        nativeInternalFocusRef.current = false;
        syncDOMSelectionToEditor();
        publishFocusState();
        return;
      }

      const editorElement = ReactEditor.assertDOMNode(editor, editor);
      if (
        event.target === editorElement &&
        getNestedEditableDOMSelectionRoot(editorElement)
      ) {
        nativeInternalFocusRef.current = false;
        publishFocusState();
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
        domPhaseScheduler.schedule(
          'selection-repair',
          'programmatic-focus-selection-microtask',
          syncProgrammaticFocusSelection,
          { timing: 'microtask' }
        );
        domPhaseScheduler.schedule(
          'selection-repair',
          'programmatic-focus-selection-timeout',
          syncProgrammaticFocusSelection,
          { timing: 'timeout' }
        );
      }
      publishFocusState();
    },
    [
      editor,
      domPhaseScheduler,
      inputController,
      onFocus,
      publishFocusState,
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
        domPhaseScheduler,
        editor,
        event,
        inputController,
        onClick,
        readOnly,
      });
      if (SelectionApi.isNode(editor.read((state) => state.selection()))) {
        syncDOMSelectionToEditor();
      }
    },
    [
      domPhaseScheduler,
      editor,
      inputController,
      onClick,
      readOnly,
      syncDOMSelectionToEditor,
      trace,
    ]
  );
  const onRuntimeClick = useEditableMouseHandler({ handleMouse: handleClick });

  const handleMouseDownCapture = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      clearVerticalGoal();
      markNativePointerFocus(event);

      if (readOnly || isNativeDraggableTarget(editor, event.target)) {
        return;
      }

      const selectedPath =
        selectEditableKeyboardSelectableTarget({
          editor,
          inputController,
          target: event.target,
        }) ??
        selectEditableVoidTarget({
          editor,
          inputController,
          target: event.target,
        });

      if (selectedPath) {
        event.preventDefault();
      }
    },
    [
      clearVerticalGoal,
      editor,
      inputController,
      markNativePointerFocus,
      readOnly,
    ]
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

      if (SelectionApi.isNode(editor.read((state) => state.selection()))) {
        syncDOMSelectionToEditor();
        return;
      }

      if (!handled) {
        selection.syncDOMSelectionFromRuntime();
      }
    },
    [editor, onMouseUp, selection, syncDOMSelectionToEditor]
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
