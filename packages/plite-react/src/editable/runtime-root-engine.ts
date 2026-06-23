import {
  type ComponentPropsWithRef,
  type ForwardedRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { DOMRange } from '@platejs/plite-dom';
import { IS_READ_ONLY } from '@platejs/plite-dom/internal';
import type {
  EditableDOMBeforeInputHandler,
  EditableDOMStrategyRuntime,
  EditableKeyDownHandler,
} from '../components/editable';
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager';
import { useFlushDeferredSelectorsOnRender } from '../hooks/use-editor-selector';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { usePendingInsertionMarksEffect } from './composition-state';
import { createEditableInputController } from './input-controller';
import { useEditableRootRef } from './input-router';
import { useProjectionDOMRepairBridge } from './projection-repair-bridge';
import { useEditableRootCommitWakeup } from './root-selector-sources';
import { useRuntimeAndroidEngine } from './runtime-android-engine';
import { useRuntimeCompositionEngine } from './runtime-composition-engine';
import { useEditableEventRuntime } from './runtime-event-engine';
import { useRuntimeKernelTraceEngine } from './runtime-kernel-trace';
import { useRuntimeRepairEngine } from './runtime-repair-engine';
import { useEditableRootGlobalLifecycle } from './runtime-root-lifecycle';
import { useEditableRootSelectionExport } from './runtime-root-selection-export';
import { useEditableRootSelectionImport } from './runtime-root-selection-import';
import { useEditableRootRuntimeState } from './runtime-root-state';
import { setEditableModelSelectionPreference } from './selection-controller';
import { useEditableSelectionReconciler } from './selection-reconciler';

type EditableRootCallbackProps = Pick<
  ComponentPropsWithRef<'div'>,
  | 'onBeforeInput'
  | 'onBlur'
  | 'onClick'
  | 'onCompositionEnd'
  | 'onCompositionStart'
  | 'onCompositionUpdate'
  | 'onCopy'
  | 'onCut'
  | 'onDragEnd'
  | 'onDragOver'
  | 'onDragStart'
  | 'onDrop'
  | 'onFocus'
  | 'onInput'
  | 'onMouseDown'
  | 'onMouseUp'
  | 'onPaste'
>;

type EditableRootEventBindings = Pick<
  ComponentPropsWithRef<'div'>,
  | 'onBeforeInput'
  | 'onBlur'
  | 'onClick'
  | 'onCompositionEnd'
  | 'onCompositionStart'
  | 'onCompositionUpdate'
  | 'onCopy'
  | 'onCut'
  | 'onDragEnd'
  | 'onDragOver'
  | 'onDragStart'
  | 'onDrop'
  | 'onFocus'
  | 'onInput'
  | 'onInputCapture'
  | 'onKeyDown'
  | 'onKeyDownCapture'
  | 'onMouseDown'
  | 'onMouseDownCapture'
  | 'onMouseUp'
  | 'onPaste'
  | 'ref'
>;

export const useEditableRootRuntime = ({
  autoFocus,
  callbacks,
  deferNativeTextInputRepair,
  editor,
  forwardedRef,
  domStrategyRuntime,
  onDOMBeforeInput,
  onKeyDown,
  readOnly,
  scrollSelectionIntoView,
}: {
  autoFocus?: boolean;
  callbacks: EditableRootCallbackProps;
  deferNativeTextInputRepair?: boolean;
  editor: ReactRuntimeEditor;
  forwardedRef?: ForwardedRef<HTMLDivElement>;
  domStrategyRuntime: EditableDOMStrategyRuntime | null;
  onDOMBeforeInput?: EditableDOMBeforeInputHandler;
  onKeyDown?: EditableKeyDownHandler;
  readOnly: boolean;
  scrollSelectionIntoView: (
    editor: ReactRuntimeEditor,
    domRange: DOMRange
  ) => void;
}) => {
  useEditableRootCommitWakeup();
  useFlushDeferredSelectorsOnRender();

  const rootRuntimeState = useEditableRootRuntimeState({
    domStrategyRuntime,
    editor,
  });
  const {
    browserHandleNextId,
    browserHandleRangeRefs,
    controllerState,
    deferredOperations,
    detachNativeInputListenersRef,
    domRepairQueueRef,
    handledDOMBeforeInputRef,
    isComposing,
    isPartialDOMBackedSelection,
    onUserInput,
    partialDOMBackedSelection,
    preferModelSelectionForInputRef,
    processing,
    receivedUserInput,
    rootRef,
    setExplicitPartialDOMBackedSelection,
    setIsComposing,
  } = rootRuntimeState;

  IS_READ_ONLY.set(editor, readOnly);
  const inputController = useMemo(
    () =>
      createEditableInputController({
        preferModelSelectionForInputRef,
        state: controllerState,
      }),
    [controllerState, preferModelSelectionForInputRef]
  );
  const state = inputController.state;

  const runtimeSetComposing = useRuntimeCompositionEngine({
    editor,
    inputController,
    setIsComposing,
  });

  useEffect(() => {
    if (rootRef.current && autoFocus) {
      rootRef.current.focus();
    }
  }, [autoFocus, rootRef]);

  const [androidInputManagerRef] = useState<{
    current: AndroidInputManager | null | undefined;
  }>(() => ({ current: undefined }));
  const {
    onDOMSelectionChange,
    scheduleOnDOMSelectionChange,
    selectionImportController,
  } = useEditableRootSelectionImport({
    androidInputManagerRef,
    domRepairQueueRef,
    editor,
    inputController,
    processing,
    readOnly,
  });

  androidInputManagerRef.current = useRuntimeAndroidEngine({
    inputController,
    node: rootRef,
    onDOMSelectionChange,
    receivedUserInput,
    scheduleOnDOMSelectionChange,
  });

  const { syncDOMSelectionToEditor } = useEditableSelectionReconciler({
    androidInputManagerRef,
    editor,
    inputController,
    rootRef,
    scrollSelectionIntoView,
    partialDOMBackedSelection,
    state,
  });
  useEditableRootSelectionExport({
    editor,
    inputController,
    isPartialDOMBackedSelection,
    syncDOMSelectionToEditor,
  });

  const repairRuntime = useRuntimeRepairEngine({
    editor,
    inputController,
    scrollSelectionIntoView,
    syncDOMSelectionToEditor,
  });
  useProjectionDOMRepairBridge({
    inputController,
    requestEditableRepair: repairRuntime.requestEditableRepair,
  });
  domRepairQueueRef.current = repairRuntime.domRepairQueue;
  const traceRuntime = useRuntimeKernelTraceEngine({
    domRepairQueue: repairRuntime.domRepairQueue,
    editor,
    inputController,
  });
  const rootInteractionSelectionBridge = useMemo(
    () => ({
      beforeModelSelection: () => {
        setEditableModelSelectionPreference({
          inputController,
          preferModelSelection: true,
          reason: 'programmatic-export',
          selectionSource: 'model-owned',
        });
        inputController.state.selectionChangeOrigin = 'programmatic-export';
      },
      importDOMSelection: () => {
        setEditableModelSelectionPreference({
          inputController,
          preferModelSelection: false,
          selectionSource: 'dom-current',
        });
        inputController.state.selectionChangeOrigin = 'native-user';
        selectionImportController.syncDOMSelectionFromRuntime();
        selectionImportController.flushSelectionChange();
      },
      isPartialDOMBackedSelection,
      syncDOMSelectionToEditor,
    }),
    [
      inputController,
      isPartialDOMBackedSelection,
      selectionImportController,
      syncDOMSelectionToEditor,
    ]
  );
  const applyInputRules = useCallback(() => false, []);

  const eventRuntime = useEditableEventRuntime({
    androidInputManagerRef,
    applyInputRules,
    browserHandleNextId,
    browserHandleRangeRefs,
    callbacks,
    deferredOperations,
    deferNativeTextInputRepair,
    editor,
    handledDOMBeforeInputRef,
    inputController,
    isPartialDOMBackedSelection,
    domStrategyRuntime,
    onDOMBeforeInput,
    onKeyDown,
    onUserInput,
    processing,
    readOnly,
    repair: repairRuntime,
    rootRef,
    selection: selectionImportController,
    setComposing: runtimeSetComposing,
    setExplicitPartialDOMBackedSelection,
    partialDOMBackedSelection,
    state,
    syncDOMSelectionToEditor,
    trace: traceRuntime,
  });

  const callbackRef = useEditableRootRef({
    detachNativeInputListenersRef,
    editor,
    forwardedRef,
    onDOMBeforeInput: eventRuntime.handlers.onDOMBeforeInput,
    onDOMInput: eventRuntime.handlers.onDOMInput,
    onDOMSelectionChange,
    rootRef,
    scheduleOnDOMSelectionChange,
  });
  const editableEventBindings = useMemo(() => {
    const handlers = eventRuntime.handlers;

    return {
      onBeforeInput: handlers.onReactBeforeInput,
      onBlur: handlers.onBlur,
      onClick: handlers.onClick,
      onCompositionEnd: handlers.onCompositionEnd,
      onCompositionStart: handlers.onCompositionStart,
      onCompositionUpdate: handlers.onCompositionUpdate,
      onCopy: handlers.onCopy,
      onCut: handlers.onCut,
      onDragEnd: handlers.onDragEnd,
      onDragOver: handlers.onDragOver,
      onDragStart: handlers.onDragStart,
      onDrop: handlers.onDrop,
      onFocus: handlers.onFocus,
      onInput: handlers.onInput,
      onInputCapture: handlers.onInputCapture,
      onKeyDown: handlers.onKeyDown,
      onKeyDownCapture: handlers.onKeyDownCapture,
      onMouseDown: handlers.onMouseDown,
      onMouseDownCapture: handlers.onMouseDownCapture,
      onMouseUp: handlers.onMouseUp,
      onPaste: handlers.onPaste,
      ref: callbackRef,
    } satisfies EditableRootEventBindings;
  }, [callbackRef, eventRuntime.handlers]);

  useEditableRootGlobalLifecycle({
    editor,
    readOnly,
    rootRef,
    scheduleOnDOMSelectionChange,
    state,
  });

  const marks = editor.read((state) => state.marks.get());
  usePendingInsertionMarksEffect({ editor, marks });

  return {
    editableEventBindings,
    isComposing,
    receivedUserInput,
    rootRef,
    rootInteractionSelectionBridge,
    partialDOMBackedSelection,
  };
};
