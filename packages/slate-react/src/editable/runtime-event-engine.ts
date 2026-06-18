import {
  type ComponentPropsWithRef,
  type FormEvent,
  type InputEvent as ReactInputEvent,
  type RefObject,
  useMemo,
} from 'react';
import type { Range } from '@platejs/slate';
import type {
  EditableDOMBeforeInputHandler,
  EditableDOMStrategyRuntime,
  EditableKeyDownHandler,
} from '../components/editable';
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import type { DOMRepairQueue } from './dom-repair-queue';
import type {
  EditableInputController,
  EditableInputControllerState,
} from './input-state';
import type { DeferredOperation } from './model-input-strategy';
import type { EditableRepairRequest } from './mutation-controller';
import { useRuntimeBeforeInputEvents } from './runtime-before-input-events';
import { useRuntimeBrowserHandle } from './runtime-browser-handle-events';
import { useRuntimeClipboardEvents } from './runtime-clipboard-events';
import { useRuntimeCompositionEvents } from './runtime-composition-events';
import { useRuntimeDragEvents } from './runtime-drag-events';
import type { Editor } from './runtime-editor-api';
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
};

type EditableKernelTraceRuntime = ReturnType<
  typeof useRuntimeKernelTraceEngine
>;

export type EditableEventRuntimeCore = {
  android: {
    managerRef: RefObject<AndroidInputManager | null | undefined>;
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
  androidInputManagerRef,
  applyInputRules,
  browserHandleNextId,
  browserHandleRangeRefs,
  callbacks,
  deferNativeTextInputRepair = false,
  deferredOperations,
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
  repair,
  rootRef,
  selection,
  setComposing,
  setExplicitPartialDOMBackedSelection,
  partialDOMBackedSelection,
  state,
  syncDOMSelectionToEditor,
  trace,
}: {
  androidInputManagerRef: RefObject<AndroidInputManager | null | undefined>;
  applyInputRules: ApplyInputRules;
  browserHandleNextId: RefObject<number>;
  browserHandleRangeRefs: RefObject<
    Map<string, ReturnType<typeof Editor.rangeRef>>
  >;
  callbacks: EditableRootCallbackProps;
  deferNativeTextInputRepair?: boolean;
  deferredOperations: RefObject<DeferredOperation[]>;
  editor: ReactRuntimeEditor;
  handledDOMBeforeInputRef: RefObject<boolean>;
  inputController: EditableInputController;
  isPartialDOMBackedSelection: (selection: Range | null) => boolean;
  domStrategyRuntime: EditableDOMStrategyRuntime | null;
  onDOMBeforeInput?: EditableDOMBeforeInputHandler;
  onKeyDown?: EditableKeyDownHandler;
  onUserInput: () => void;
  processing: RefObject<boolean>;
  readOnly: boolean;
  repair: EditableRepairRuntime;
  rootRef: RefObject<HTMLDivElement | null>;
  selection: RuntimeSelectionImportController;
  setComposing: (nextValue: boolean) => void;
  setExplicitPartialDOMBackedSelection: (nextValue: boolean) => void;
  partialDOMBackedSelection: boolean;
  state: EditableInputControllerState;
  syncDOMSelectionToEditor: (options?: EditableDOMSelectionSyncOptions) => void;
  trace: EditableKernelTraceRuntime;
}): EditableEventRuntime => {
  const runtime = useMemo(
    () =>
      ({
        android: {
          managerRef: androidInputManagerRef,
        },
        composition: {
          setComposing,
        },
        repair,
        selection,
        trace,
      }) satisfies EditableEventRuntimeCore,
    [androidInputManagerRef, repair, selection, setComposing, trace]
  );

  useRuntimeTargetBridge({
    editor,
    inputController,
    syncDOMSelectionToEditor,
  });
  const inputHandlers = useRuntimeInputEvents({
    androidInputManagerRef: runtime.android.managerRef,
    deferNativeTextInputRepair,
    deferredOperations,
    editor,
    handledDOMBeforeInputRef,
    inputController,
    readOnly,
    repair: runtime.repair,
    rootRef,
    syncDOMSelectionToEditor,
    trace: runtime.trace,
    onInput: callbacks.onInput as
      | ((event: ReactInputEvent<HTMLDivElement>) => boolean | void)
      | undefined,
  });
  useRuntimeBrowserHandle({
    applyInputRules,
    browserHandleNextId,
    browserHandleRangeRefs,
    editor,
    flushPendingNativeTextInput: inputHandlers.flushPendingNativeTextInput,
    forceRender: runtime.repair.forceRender,
    inputController,
    isPartialDOMBackedSelection,
    rootRef,
    scrollPathIntoView: domStrategyRuntime?.scrollToPath,
    setExplicitPartialDOMBackedSelection,
  });
  const beforeInputHandlers = useRuntimeBeforeInputEvents({
    androidInputManagerRef: runtime.android.managerRef,
    applyInputRules,
    deferNativeTextInputRepair,
    deferredOperations,
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
    onUserInput,
    processing,
    queuePendingNativeTextInput: inputHandlers.queuePendingNativeTextInput,
    readOnly,
    repair: runtime.repair,
    selection: runtime.selection,
    setComposing: runtime.composition.setComposing,
    trace: runtime.trace,
  });
  const clipboardHandlers = useRuntimeClipboardEvents({
    editor,
    flushPendingNativeTextInput: inputHandlers.flushPendingNativeTextInput,
    inputController,
    onCopy: callbacks.onCopy,
    onCut: callbacks.onCut,
    onPaste: callbacks.onPaste,
    readOnly,
    repair: runtime.repair,
    setExplicitPartialDOMBackedSelection,
    partialDOMBackedSelection,
    trace: runtime.trace,
  });
  const dragHandlers = useRuntimeDragEvents({
    editor,
    inputController,
    onDragEnd: callbacks.onDragEnd,
    onDragOver: callbacks.onDragOver,
    onDragStart: callbacks.onDragStart,
    onDrop: callbacks.onDrop,
    readOnly,
    repair: runtime.repair,
    state,
    trace: runtime.trace,
  });
  const compositionHandlers = useRuntimeCompositionEvents({
    androidInputManagerRef: runtime.android.managerRef,
    editor,
    inputController,
    onCompositionEnd: callbacks.onCompositionEnd,
    onCompositionStart: callbacks.onCompositionStart,
    onCompositionUpdate: callbacks.onCompositionUpdate,
    readOnly,
    setComposing: runtime.composition.setComposing,
    trace: runtime.trace,
  });
  const focusMouseHandlers = useRuntimeFocusMouseEvents({
    editor,
    flushPendingNativeTextInput: inputHandlers.flushPendingNativeTextInput,
    inputController,
    onBlur: callbacks.onBlur,
    onClick: callbacks.onClick,
    onFocus: callbacks.onFocus,
    onMouseDown: callbacks.onMouseDown,
    onMouseUp: callbacks.onMouseUp,
    readOnly,
    selection: runtime.selection,
    state,
    syncDOMSelectionToEditor,
    trace: runtime.trace,
  });
  const keyboardHandlers = useRuntimeKeyboardEvents({
    editor,
    inputController,
    domStrategyRuntime,
    flushPendingNativeTextInput: inputHandlers.flushPendingNativeTextInput,
    onKeyDown,
    readOnly,
    runtime,
    setExplicitPartialDOMBackedSelection,
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
      ...runtime,
      handlers,
    }),
    [handlers, runtime]
  );
};
