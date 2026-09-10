import {
  type ComponentPropsWithRef,
  type ForwardedRef,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
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
import { useOptionalPliteRuntimeContext } from '../hooks/use-plite-runtime';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { usePendingInsertionMarksEffect } from './composition-state';
import { useDecorationDOMRepairBridge } from './decoration-repair-bridge';
import { getMountedEditableDOMRuntimes } from './editable-dom-runtime';
import { getModelOwnedHistoryFocusRepair } from './history-focus';
import { useEditableRootRef } from './input-router';
import {
  beginEditableNativeSelectionImport,
  finishEditableModelSelectionProjection,
  prepareEditableModelSelection,
} from './input-state';
import { useEditableRootCommitWakeup } from './root-selector-sources';
import { useRuntimeAndroidEngine } from './runtime-android-engine';
import {
  setEditorReadOnly,
  subscribeEditorViewState,
} from './runtime-editor-api';
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
  readOnly: readOnlyProp,
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
  const pliteRuntimeContext = useOptionalPliteRuntimeContext();
  useEditableRootCommitWakeup();
  useFlushDeferredSelectorsOnRender();

  const viewReadOnly = useSyncExternalStore(
    useCallback(
      (listener) => subscribeEditorViewState(editor, listener),
      [editor]
    ),
    () => editor.read.view.isReadOnly(),
    () => readOnlyProp
  );
  const readOnly = readOnlyProp || viewReadOnly;

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
    setEditorReadOnly(editor, readOnlyProp);
  }, [editor, readOnlyProp]);

  useIsomorphicLayoutEffect(() => {
    IS_READ_ONLY.set(editor, readOnly);
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
    readOnly,
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
    const root = runtime.rootElement;
    const activeElement = root?.ownerDocument.activeElement;

    if (
      !root ||
      (!ReactEditor.isFocused(editor) &&
        activeElement !== root &&
        !(activeElement && root.contains(activeElement)))
    ) {
      return;
    }

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
  runtime.updateHistoryFocusHandler(() => {
    const next = getModelOwnedHistoryFocusRepair({
      editor,
      getActiveContentRootOwner: pliteRuntimeContext?.getActiveContentRootOwner,
      getContentRootOwnerViewEditor:
        pliteRuntimeContext?.getContentRootOwnerViewEditor,
      getMountedViewEditor: pliteRuntimeContext?.getMountedViewEditor,
    });
    if (!next.repair) return;
    if (next.focusEditor) {
      repairRuntime.requestEditableRepair(next.repair, {
        focusEditor: next.focusEditor,
      });
    } else if (!runtime.externalText.focusSelection()) {
      runtime.rootElement?.focus({ preventScroll: true });
      runtime.requestSelectionExportAfterDOMCommit();
    }
  });
  useDecorationDOMRepairBridge({
    requestEditableRepair: repairRuntime.requestEditableRepair,
    runtime,
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
    domStrategyRuntime,
    onDOMBeforeInput,
    onKeyDown,
    partialDOMBackedSelection,
    readOnly,
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
    readOnly,
    runtime,
  });

  const marks = editor.read((state) => state.marks());
  usePendingInsertionMarksEffect({ editor, marks });

  return {
    readOnly,
    domPhaseScheduler,
    editableEventBindings,
    isComposing,
    rootRef,
    rootInteractionSelectionBridge,
    partialDOMBackedSelection,
    runtime,
  };
};
