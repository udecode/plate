import {
  type ComponentPropsWithRef,
  type ForwardedRef,
  useCallback,
  useInsertionEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';

import { getLastCommit } from '../../core/public-state';
import { containsShadowAware, type DOMRange, getSelection } from '../../dom';
import {
  focusedElementOnPage,
  IS_READ_ONLY,
  readEditableDOMSelectionPoints,
} from '../../dom/internal';
import type {
  EditableDOMBeforeInputHandler,
  EditableViewportRuntime,
  EditableKeyDownHandler,
} from '../components/editable';
import { useFlushDeferredSelectorsOnRender } from '../hooks/use-editor-selector';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { useOptionalPliteRuntimeContext } from '../hooks/use-plite-runtime';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { usePendingInsertionMarksEffect } from './composition-state';
import { useDecorationDOMRepairBridge } from './decoration-repair-bridge';
import {
  getMountedEditableDOMRuntimes,
  isHistoryReplayInFlight,
} from './editable-dom-runtime';
import type {
  EditableHistoryReplayEvent,
  EditableDropResult,
  EditablePasteResult,
  EditablePointerSelectionEndHandler,
  NodeSelectionFocus,
} from './editable-dom-runtime';
import { useEditableRootRef } from './input-router';
import {
  beginEditableNativeSelectionImport,
  finishEditableModelSelectionProjection,
  prepareEditableModelSelection,
} from './input-state';
import { useEditableRootCommitWakeup } from './root-selector-sources';
import { useRuntimeAndroidEngine } from './runtime-android-engine';
import {
  getEditorRuntimeOwner,
  getInternalDocumentChangeRootKeys,
  registerEditorSurface,
  subscribeSharedEditorViewState,
  toInternalRoot,
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
import { shouldSkipDOMSelection } from './selection-side-effect-policy';

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
  viewportRuntime,
  nodeSelectionFocus,
  onDOMBeforeInput,
  onHistoryReplay,
  onDropResult,
  onKeyDown,
  onPasteResult,
  onPointerSelectionEnd,
  readOnly: readOnlyProp,
  scrollSelectionIntoView,
}: {
  autoFocus?: boolean;
  callbacks: EditableRootCallbackProps;
  deferNativeTextInputRepair?: boolean;
  editor: ReactRuntimeEditor;
  forwardedRef?: ForwardedRef<HTMLDivElement>;
  viewportRuntime: EditableViewportRuntime | null;
  nodeSelectionFocus?: NodeSelectionFocus;
  onDOMBeforeInput?: EditableDOMBeforeInputHandler;
  onHistoryReplay?: (event: EditableHistoryReplayEvent) => void;
  onDropResult?: (result: EditableDropResult) => void;
  onKeyDown?: EditableKeyDownHandler;
  onPasteResult?: (result: EditablePasteResult) => void;
  onPointerSelectionEnd?: EditablePointerSelectionEndHandler;
  readOnly: boolean;
  scrollSelectionIntoView: (
    editor: ReactRuntimeEditor,
    domRange: DOMRange
  ) => void;
}) => {
  const pliteRuntimeContext = useOptionalPliteRuntimeContext();
  useEditableRootCommitWakeup();
  useFlushDeferredSelectorsOnRender();

  const readOnlyPropRef = useRef(readOnlyProp);
  const committedReadOnlyRef = useRef(
    readOnlyProp || editor.read.view.isReadOnly()
  );
  const readReadOnly = () => readOnlyProp || editor.read.view.isReadOnly();
  const readOnly = useSyncExternalStore(
    useCallback(
      (listener) =>
        subscribeSharedEditorViewState(editor, 'readOnly', () => {
          const nextReadOnly =
            readOnlyPropRef.current || editor.read.view.isReadOnly();

          if (nextReadOnly === committedReadOnlyRef.current) return;

          listener();
        }),
      [editor]
    ),
    readReadOnly,
    readReadOnly
  );

  // React updates useSyncExternalStore's snapshot cache in passive effects,
  // after EditorRuntimeView's layout flush delivers the lock notice for the
  // same render. Tracking the committed prop/result skips a redundant render.
  useInsertionEffect(() => {
    readOnlyPropRef.current = readOnlyProp;
    committedReadOnlyRef.current = readOnly;
  }, [readOnly, readOnlyProp]);

  const rootRuntimeState = useEditableRootRuntimeState({
    viewportRuntime,
    editor,
    nodeSelectionFocus,
    onDropResult,
    onHistoryReplay,
    onPasteResult,
    onPointerSelectionEnd,
    readOnly,
  });
  const {
    isComposing,
    isViewportBackedSelection,
    viewportBackedSelection,
    runtime,
  } = rootRuntimeState;
  const { domPhaseScheduler, inputController, rootRef } = runtime;
  runtime.updateProviderHistoryFocus(
    pliteRuntimeContext?.completeHistoryReplay ?? null
  );

  // A layout effect cleans up when an Activity hides the editable, so a hidden
  // editable does not count.
  useIsomorphicLayoutEffect(
    () => registerEditorSurface(editor, readOnlyProp),
    [editor, readOnlyProp]
  );

  useIsomorphicLayoutEffect(() => {
    IS_READ_ONLY.set(editor, readOnly);
  }, [editor, readOnly]);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;

    if (!root || !autoFocus || (!readOnlyProp && readOnly)) return;
    const lastCommit = getLastCommit(getEditorRuntimeOwner(editor));
    const viewRoot = toInternalRoot(editor.read((state) => state.view.root()));
    const changedRoots = lastCommit
      ? getInternalDocumentChangeRootKeys(lastCommit.changes)
      : [];
    const replayCausedMount =
      !!lastCommit &&
      lastCommit.tags.includes('historic') &&
      (changedRoots.length === 0 || changedRoots.includes(viewRoot));

    if (!runtime.claimAutoFocus()) return;
    if (replayCausedMount) return;

    if (readOnlyProp) {
      root.focus();
      return;
    }

    editor.api.dom.focus();
  }, [autoFocus, editor, readOnlyProp, rootRef, runtime, readOnly]);

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
    viewportBackedSelection,
    runtime,
    scrollSelectionIntoView,
  });
  runtime.updateSelectionExportHandler(syncDOMSelectionToEditor);
  runtime.updateSelectionExportAfterDOMCommitHandler(() => {
    const root = runtime.rootElement;

    if (!root) return;

    const activeElement = focusedElementOnPage(root);

    if (
      !ReactEditor.isFocused(editor) &&
      activeElement !== root &&
      !containsShadowAware(root, activeElement)
    ) {
      if (isHistoryReplayInFlight(editor) || shouldSkipDOMSelection(editor)) {
        return;
      }

      // A read-only root takes no focus unless given a tabIndex, so its
      // pointer selection is the only sign it owns the page selection. Its
      // root is not contenteditable, so writing that selection back cannot
      // focus it.
      const selection = readOnly
        ? getSelection(root.getRootNode() as Document | ShadowRoot)
        : null;
      const selectionPoints = readEditableDOMSelectionPoints(root, selection);

      if (
        !selectionPoints ||
        !containsShadowAware(root, selectionPoints.anchor[0]) ||
        !containsShadowAware(root, selectionPoints.focus[0])
      ) {
        return;
      }
    }

    syncDOMSelectionToEditor({
      forceModelExport: true,
      preserveScroll: true,
    });
    runtime.renderContract.nominateSelection();
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
      isViewportBackedSelection,
      syncDOMSelectionToEditor,
    };
  }, [
    editor,
    inputController,
    isViewportBackedSelection,
    runtime,
    selectionImportController,
    syncDOMSelectionToEditor,
  ]);
  const eventRuntime = useEditableEventRuntime({
    callbacks,
    deferNativeTextInputRepair,
    viewportRuntime,
    onDOMBeforeInput,
    onKeyDown,
    viewportBackedSelection,
    readOnly,
    repair: repairRuntime,
    runtime,
    selection: selectionImportController,
    syncDOMSelectionToEditor,
    trace: traceRuntime,
  });
  runtime.updateHistorySettleHandler(
    eventRuntime.flushPendingNativeTextInput ?? (() => {})
  );
  runtime.updateHistoryScope(pliteRuntimeContext?.historyScope ?? null);

  const callbackRef = useEditableRootRef({
    forwardedRef,
    onDOMBeforeInput: eventRuntime.handlers.onDOMBeforeInput,
    onDOMInput: eventRuntime.handlers.onDOMInput,
    onDOMSelectionChange,
    reenterCompositionLine: eventRuntime.composition.lease.reenterLine,
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
    viewportBackedSelection,
    runtime,
  };
};
