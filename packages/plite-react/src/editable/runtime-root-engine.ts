import {
  type ComponentPropsWithRef,
  type ForwardedRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import type { DOMRange } from '@platejs/plite-dom';
import { IS_READ_ONLY } from '@platejs/plite-dom/internal';
import type {
  EditableDOMBeforeInputHandler,
  EditableDOMStrategyRuntime,
  EditableKeyDownHandler,
} from '../components/editable';
import { useFlushDeferredSelectorsOnRender } from '../hooks/use-editor-selector';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { usePendingInsertionMarksEffect } from './composition-state';
import { useEditableRootRef } from './input-router';
import { useProjectionDOMRepairBridge } from './projection-repair-bridge';
import { useEditableRootCommitWakeup } from './root-selector-sources';
import { useRuntimeAndroidEngine } from './runtime-android-engine';
import { useEditableEventRuntime } from './runtime-event-engine';
import { useRuntimeKernelTraceEngine } from './runtime-kernel-trace';
import { useRuntimeRepairEngine } from './runtime-repair-engine';
import { setEditorReadOnly } from './runtime-editor-api';
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
    readOnly,
  });
  const {
    isComposing,
    isPartialDOMBackedSelection,
    partialDOMBackedSelection,
    runtime,
  } = rootRuntimeState;
  const { domPhaseScheduler, inputController, rootRef } = runtime;

  IS_READ_ONLY.set(editor, readOnly);
  setEditorReadOnly(editor, readOnly);

  useEffect(() => {
    if (rootRef.current && autoFocus) {
      rootRef.current.focus();
    }
  }, [autoFocus, rootRef]);

  const {
    onDOMSelectionChange,
    scheduleOnDOMSelectionChange,
    selectionImportController,
  } = useEditableRootSelectionImport({
    runtime,
  });

  useRuntimeAndroidEngine({
    onDOMSelectionChange,
    runtime,
    scheduleOnDOMSelectionChange,
  });

  const { syncDOMSelectionToEditor } = useEditableSelectionReconciler({
    partialDOMBackedSelection,
    runtime,
    scrollSelectionIntoView,
  });
  useEditableRootSelectionExport({
    runtime,
    syncDOMSelectionToEditor,
  });

  const repairRuntime = useRuntimeRepairEngine({
    runtime,
    scrollSelectionIntoView,
    syncDOMSelectionToEditor,
  });
  useProjectionDOMRepairBridge({
    inputController,
    requestEditableRepair: repairRuntime.requestEditableRepair,
  });
  runtime.domRepairQueueRef.current = repairRuntime.domRepairQueue;
  const traceRuntime = useRuntimeKernelTraceEngine({
    domPhaseScheduler,
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
    applyInputRules,
    callbacks,
    deferNativeTextInputRepair,
    onDOMBeforeInput,
    onKeyDown,
    partialDOMBackedSelection,
    repair: repairRuntime,
    runtime,
    selection: selectionImportController,
    syncDOMSelectionToEditor,
    trace: traceRuntime,
  });

  const callbackRef = useEditableRootRef({
    forwardedRef,
    onDOMBeforeInput: eventRuntime.handlers.onDOMBeforeInput,
    onDOMInput: eventRuntime.handlers.onDOMInput,
    onDOMSelectionChange,
    runtime,
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
    runtime,
    scheduleOnDOMSelectionChange,
  });

  const marks = editor.read((state) => state.marks());
  usePendingInsertionMarksEffect({ editor, marks });

  return {
    domPhaseScheduler,
    editableEventBindings,
    isComposing,
    rootRef,
    rootInteractionSelectionBridge,
    partialDOMBackedSelection,
    runtime,
  };
};
