import {
  type ComponentPropsWithRef,
  type ForwardedRef,
  useEffect,
  useMemo,
} from 'react';

import type { DOMRange } from '../../dom';
import { IS_READ_ONLY } from '../../dom/internal';
import type {
  EditableDOMBeforeInputHandler,
  EditableDOMStrategyRuntime,
  EditableKeyDownHandler,
} from '../components/editable';
import { useFlushDeferredSelectorsOnRender } from '../hooks/use-editor-selector';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { usePendingInsertionMarksEffect } from './composition-state';
import { getMountedEditableDOMRuntimes } from './editable-dom-runtime';
import { useEditableRootRef } from './input-router';
import {
  beginEditableNativeSelectionImport,
  finishEditableModelSelectionProjection,
  prepareEditableModelSelection,
} from './input-state';
import { useProjectionDOMRepairBridge } from './projection-repair-bridge';
import { useEditableRootCommitWakeup } from './root-selector-sources';
import { useRuntimeAndroidEngine } from './runtime-android-engine';
import { setEditorReadOnly } from './runtime-editor-api';
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
    readOnly,
  });
  const {
    isComposing,
    isPartialDOMBackedSelection,
    partialDOMBackedSelection,
    runtime,
  } = rootRuntimeState;
  const { domPhaseScheduler, inputController, rootRef } = runtime;

  useIsomorphicLayoutEffect(() => {
    IS_READ_ONLY.set(editor, readOnly);
    setEditorReadOnly(editor, readOnly);
  }, [editor, readOnly]);

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
  runtime.updateSelectionExportAfterDOMCommitHandler(() => {
    if (!ReactEditor.isFocused(editor)) return;

    syncDOMSelectionToEditor({
      forceModelExport: true,
      preserveScroll: true,
    });
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
  runtime.publishDOMRepairQueue(repairRuntime.domRepairQueue);
  const traceRuntime = useRuntimeKernelTraceEngine({
    domPhaseScheduler,
    domRepairQueue: repairRuntime.domRepairQueue,
    editor,
    inputController,
  });
  const rootInteractionSelectionBridge = useMemo(() => {
    const prepareModelSelection = (projectedDrag: boolean) => {
      const mountedRuntimes = new Set([
        runtime,
        ...getMountedEditableDOMRuntimes(editor),
      ]);

      for (const mountedRuntime of mountedRuntimes) {
        mountedRuntime.cancelSelectionChangeHandlers();
        prepareEditableModelSelection(mountedRuntime.inputController, {
          projecting: projectedDrag,
        });
        setEditableModelSelectionPreference({
          inputController: mountedRuntime.inputController,
          preferModelSelection: true,
          reason: 'programmatic-export',
          selectionSource: 'model-owned',
        });
      }
    };

    return {
      beginProjectedDrag: () => {
        prepareModelSelection(true);
      },
      beforeModelSelection: () => {
        prepareModelSelection(false);
      },
      finishProjectedDrag: () => {
        const mountedRuntimes = new Set([
          runtime,
          ...getMountedEditableDOMRuntimes(editor),
        ]);

        for (const mountedRuntime of mountedRuntimes) {
          mountedRuntime.cancelSelectionChangeHandlers();
          finishEditableModelSelectionProjection(
            mountedRuntime.inputController
          );
        }
      },
      importDOMSelection: () => {
        setEditableModelSelectionPreference({
          inputController,
          preferModelSelection: false,
          selectionSource: 'dom-current',
        });
        beginEditableNativeSelectionImport(inputController);
        selectionImportController.syncDOMSelectionFromRuntime();
        selectionImportController.flushSelectionChange();
      },
      isPartialDOMBackedSelection,
      syncDOMSelectionToEditor,
    };
  }, [
    editor,
    inputController,
    isPartialDOMBackedSelection,
    runtime,
    selectionImportController,
    syncDOMSelectionToEditor,
  ]);
  const eventRuntime = useEditableEventRuntime({
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
  const { handlers: eventHandlers } = eventRuntime;
  const editableEventBindings = useMemo(
    () =>
      ({
        onBeforeInput: eventHandlers.onReactBeforeInput,
        onBlur: eventHandlers.onBlur,
        onClick: eventHandlers.onClick,
        onCompositionEnd: eventHandlers.onCompositionEnd,
        onCompositionStart: eventHandlers.onCompositionStart,
        onCompositionUpdate: eventHandlers.onCompositionUpdate,
        onCopy: eventHandlers.onCopy,
        onCut: eventHandlers.onCut,
        onDragEnd: eventHandlers.onDragEnd,
        onDragOver: eventHandlers.onDragOver,
        onDragStart: eventHandlers.onDragStart,
        onDrop: eventHandlers.onDrop,
        onFocus: eventHandlers.onFocus,
        onInput: eventHandlers.onInput,
        onInputCapture: eventHandlers.onInputCapture,
        onKeyDown: eventHandlers.onKeyDown,
        onKeyDownCapture: eventHandlers.onKeyDownCapture,
        onMouseDown: eventHandlers.onMouseDown,
        onMouseDownCapture: eventHandlers.onMouseDownCapture,
        onMouseUp: eventHandlers.onMouseUp,
        onPaste: eventHandlers.onPaste,
        ref: callbackRef,
      }) satisfies EditableRootEventBindings,
    [callbackRef, eventHandlers]
  );

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
