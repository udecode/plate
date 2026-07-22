import {
  type ComponentPropsWithRef,
  type FormEvent,
  type InputEvent as ReactInputEvent,
  useMemo,
} from 'react';
import type { Range } from '@platejs/plite';
import type {
  EditableDOMBeforeInputHandler,
  EditableKeyDownHandler,
} from '../components/editable';
import type { DOMRepairQueue } from './dom-repair-queue';
import type { EditableDOMRuntime } from './editable-dom-runtime';
import type { EditableRepairRequest } from './mutation-controller';
import { useRuntimeBeforeInputEvents } from './runtime-before-input-events';
import { useRuntimeBrowserHandle } from './runtime-browser-handle-events';
import { useRuntimeClipboardEvents } from './runtime-clipboard-events';
import { useRuntimeCompositionEvents } from './runtime-composition-events';
import { useRuntimeDragEvents } from './runtime-drag-events';
import { useRuntimeFocusMouseEvents } from './runtime-focus-mouse-events';
import { useRuntimeInputEvents } from './runtime-input-events';
import type { useRuntimeKernelTraceEngine } from './runtime-kernel-trace';
import { useRuntimeKeyboardEvents } from './runtime-keyboard-events';
import type { RuntimeSelectionImportController } from './runtime-selection-engine';
import { useRuntimeTargetBridge } from './runtime-target-bridge';
import type { EditableDOMSelectionSyncOptions } from './selection-controller';

type ApplyInputRules = ({
  data,
  event,
  inputType,
  selection,
}: {
  data: unknown;
  event?: InputEvent;
  inputType: string;
  selection: Range | null;
}) => boolean;

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

type EditableRootEventHandlers = ReturnType<
  typeof useRuntimeBeforeInputEvents
> &
  ReturnType<typeof useRuntimeInputEvents> &
  ReturnType<typeof useRuntimeClipboardEvents> &
  ReturnType<typeof useRuntimeDragEvents> &
  ReturnType<typeof useRuntimeCompositionEvents> &
  ReturnType<typeof useRuntimeFocusMouseEvents> &
  ReturnType<typeof useRuntimeKeyboardEvents>;

type EditableRepairRuntime = {
  domRepairQueue: DOMRepairQueue;
  forceRender: () => void;
  requestEditableRepair: (request: EditableRepairRequest) => void;
  requestModelSelectionExportAfterRender: () => void;
};

type EditableKernelTraceRuntime = ReturnType<
  typeof useRuntimeKernelTraceEngine
>;

export type EditableEventRuntimeCore = {
  android: {
    managerRef: EditableDOMRuntime['androidInputManagerRef'];
  };
  composition: {
    setComposing: (nextValue: boolean) => void;
  };
  repair: EditableRepairRuntime;
  selection: RuntimeSelectionImportController;
  trace: EditableKernelTraceRuntime;
};

export type EditableEventRuntime = EditableEventRuntimeCore & {
  handlers: EditableRootEventHandlers;
};

export const useEditableEventRuntime = ({
  applyInputRules,
  callbacks,
  deferNativeTextInputRepair = false,
  onDOMBeforeInput,
  onKeyDown,
  partialDOMBackedSelection,
  repair,
  runtime,
  selection,
  syncDOMSelectionToEditor,
  trace,
}: {
  applyInputRules: ApplyInputRules;
  callbacks: EditableRootCallbackProps;
  deferNativeTextInputRepair?: boolean;
  onDOMBeforeInput?: EditableDOMBeforeInputHandler;
  onKeyDown?: EditableKeyDownHandler;
  partialDOMBackedSelection: boolean;
  repair: EditableRepairRuntime;
  runtime: EditableDOMRuntime;
  selection: RuntimeSelectionImportController;
  syncDOMSelectionToEditor: (options?: EditableDOMSelectionSyncOptions) => void;
  trace: EditableKernelTraceRuntime;
}): EditableEventRuntime => {
  const {
    androidInputManagerRef,
    browserHandleNextId,
    browserHandleRangeAnchors,
    deferredMutations,
    domPhaseScheduler,
    domStrategyRuntime,
    editor,
    handledDOMBeforeInputRef,
    inputController,
    processing,
    readOnly,
    rootRef,
    state,
  } = runtime;
  const eventCore = useMemo(
    () =>
      ({
        android: {
          managerRef: androidInputManagerRef,
        },
        composition: {
          setComposing: runtime.setComposing,
        },
        repair,
        selection,
        trace,
      }) satisfies EditableEventRuntimeCore,
    [androidInputManagerRef, repair, runtime.setComposing, selection, trace]
  );

  useRuntimeTargetBridge({
    domPhaseScheduler: runtime.domPhaseScheduler,
    editor,
    inputController,
    syncDOMSelectionToEditor,
  });
  const inputHandlers = useRuntimeInputEvents({
    androidInputManagerRef: eventCore.android.managerRef,
    deferNativeTextInputRepair,
    deferredMutations,
    editor,
    handledDOMBeforeInputRef,
    inputController,
    readOnly,
    repair: eventCore.repair,
    rootRef,
    runtime,
    syncDOMSelectionToEditor,
    trace: eventCore.trace,
    onInput: callbacks.onInput as
      | ((event: ReactInputEvent<HTMLDivElement>) => boolean | void)
      | undefined,
  });
  useRuntimeBrowserHandle({
    applyInputRules,
    browserHandleNextId,
    browserHandleRangeAnchors,
    domPhaseScheduler,
    editor,
    flushPendingNativeTextInput: inputHandlers.flushPendingNativeTextInput,
    forceRender: eventCore.repair.forceRender,
    inputController,
    isPartialDOMBackedSelection: runtime.isPartialDOMBackedSelection,
    rootRef,
    scrollPathIntoView: domStrategyRuntime?.scrollToPath,
    setExplicitPartialDOMBackedSelection:
      runtime.setExplicitPartialDOMBackedSelection,
  });
  const beforeInputHandlers = useRuntimeBeforeInputEvents({
    androidInputManagerRef: eventCore.android.managerRef,
    applyInputRules,
    deferNativeTextInputRepair,
    deferredMutations,
    editor,
    flushPendingNativeTextInput: inputHandlers.flushPendingNativeTextInput,
    handledDOMBeforeInputRef,
    inputController,
    onBeforeInput: callbacks.onBeforeInput as
      | ((event: FormEvent<HTMLDivElement>) => boolean | void)
      | undefined,
    onDOMBeforeInput,
    onInput: callbacks.onInput as
      | ((event: ReactInputEvent<HTMLDivElement>) => boolean | void)
      | undefined,
    onUserInput: runtime.onUserInput,
    processing,
    queuePendingNativeTextInput: inputHandlers.queuePendingNativeTextInput,
    readOnly,
    repair: eventCore.repair,
    selection: eventCore.selection,
    setComposing: eventCore.composition.setComposing,
    trace: eventCore.trace,
  });
  const clipboardHandlers = useRuntimeClipboardEvents({
    editor,
    flushPendingNativeTextInput: inputHandlers.flushPendingNativeTextInput,
    inputController,
    onCopy: callbacks.onCopy,
    onCut: callbacks.onCut,
    onPaste: callbacks.onPaste,
    readOnly,
    repair: eventCore.repair,
    setExplicitPartialDOMBackedSelection:
      runtime.setExplicitPartialDOMBackedSelection,
    partialDOMBackedSelection,
    trace: eventCore.trace,
  });
  const dragHandlers = useRuntimeDragEvents({
    editor,
    inputController,
    onDragEnd: callbacks.onDragEnd,
    onDragOver: callbacks.onDragOver,
    onDragStart: callbacks.onDragStart,
    onDrop: callbacks.onDrop,
    readOnly,
    repair: eventCore.repair,
    state,
    trace: eventCore.trace,
  });
  const compositionHandlers = useRuntimeCompositionEvents({
    androidInputManagerRef: eventCore.android.managerRef,
    editor,
    inputController,
    onCompositionEnd: callbacks.onCompositionEnd,
    onCompositionStart: callbacks.onCompositionStart,
    onCompositionUpdate: callbacks.onCompositionUpdate,
    readOnly,
    requestModelSelectionExportAfterRender:
      eventCore.repair.requestModelSelectionExportAfterRender,
    runtime,
    setComposing: eventCore.composition.setComposing,
    trace: eventCore.trace,
  });
  const focusMouseHandlers = useRuntimeFocusMouseEvents({
    clearVerticalGoal: runtime.clearVerticalGoal,
    domPhaseScheduler,
    editor,
    flushPendingNativeTextInput: inputHandlers.flushPendingNativeTextInput,
    inputController,
    onBlur: callbacks.onBlur,
    onClick: callbacks.onClick,
    onFocus: callbacks.onFocus,
    onMouseDown: callbacks.onMouseDown,
    onMouseUp: callbacks.onMouseUp,
    publishFocusState: runtime.publishFocusState,
    readOnly,
    selection: eventCore.selection,
    state,
    syncDOMSelectionToEditor,
    trace: eventCore.trace,
  });
  const keyboardHandlers = useRuntimeKeyboardEvents({
    domPhaseScheduler,
    editor,
    inputController,
    domStrategyRuntime,
    flushPendingNativeTextInput: inputHandlers.flushPendingNativeTextInput,
    onKeyDown,
    readOnly,
    runtime: eventCore,
    setExplicitPartialDOMBackedSelection:
      runtime.setExplicitPartialDOMBackedSelection,
    verticalNavigation: runtime,
    partialDOMBackedSelection,
  });
  const handlers = useMemo(
    () => ({
      ...beforeInputHandlers,
      ...inputHandlers,
      ...clipboardHandlers,
      ...dragHandlers,
      ...compositionHandlers,
      ...focusMouseHandlers,
      ...keyboardHandlers,
    }),
    [
      beforeInputHandlers,
      clipboardHandlers,
      compositionHandlers,
      dragHandlers,
      focusMouseHandlers,
      inputHandlers,
      keyboardHandlers,
    ]
  );

  return useMemo(
    () => ({
      ...eventCore,
      handlers,
    }),
    [eventCore, handlers]
  );
};
