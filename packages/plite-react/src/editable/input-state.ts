import type { RefObject } from 'react';
import { type Editor, type Path, type Range, RangeApi } from '@platejs/plite';
import type { DOMElement } from '@platejs/plite-dom';
import {
  DOMRootRuntime,
  type DOMPhaseScheduler,
  EDITOR_TO_PENDING_INSERTION_MARKS,
  EDITOR_TO_USER_MARKS,
} from '@platejs/plite-dom/internal';
import { setEditorMarks } from './runtime-editor-api';

type DOMInputRuntime = DOMRootRuntime<HTMLElement>['domInputRuntime'];

const EDITABLE_INPUT_RUNTIME = Symbol('editable-input-runtime');

export type InputIntent =
  | 'clipboard'
  | 'composition'
  | 'delete'
  | 'history'
  | 'insert-break'
  | 'internal-control'
  | 'model-selection-move'
  | 'native-selection-move'
  | 'partial-dom-selection'
  | 'text-insert';

export type SelectionSource =
  | 'app-owned'
  | 'composition-owned'
  | 'dom-current'
  | 'internal-control'
  | 'model-owned'
  | 'partial-dom-backed'
  | 'unknown';

export type SelectionChangeOrigin =
  | 'browser-handle'
  | 'native-user'
  | 'programmatic-export'
  | 'repair-induced'
  | 'unknown';

export type ModelSelectionPreferenceReason =
  | 'browser-handle'
  | 'composition'
  | 'internal-control'
  | 'model-command'
  | 'native-selection'
  | 'projection-refresh'
  | 'programmatic-export'
  | 'repair-induced'
  | 'partial-dom-backed'
  | 'unknown';

export type ModelSelectionPreference = {
  preferModelSelection: boolean;
  reason: ModelSelectionPreferenceReason;
  selectionSource: SelectionSource;
};

export type EditableSelectionSourceTransition = {
  preferModelSelection: boolean;
  reason:
    | 'internal-control'
    | 'model-command'
    | 'native-selection-move'
    | 'projection-refresh'
    | 'repair-induced'
    | 'unknown-selection';
  selectionSource: SelectionSource;
};

export type PendingCompositionInput = Readonly<{
  commit: (
    fallbackSelection: Range | null,
    options: Readonly<{ publish: boolean }>
  ) => boolean;
  complete: () => void;
  data: string;
  discard: () => void;
  inputType: 'insertFromComposition' | 'insertText';
}>;

export type PendingCompositionEnd =
  | Readonly<{
      cancel: () => void;
      ownership: 'external';
      phase: 'end-pending';
    }>
  | Readonly<{
      cancel: () => void;
      flush: (options?: Readonly<{ publish?: boolean }>) => boolean;
      ownership: 'plite';
      phase: 'end-pending' | 'input-claimed';
      replaceWithInput: (input: PendingCompositionInput) => boolean;
    }>
  | Readonly<{
      cancel: () => void;
      data: string;
      inputTypes: readonly ('insertFromComposition' | 'insertText')[];
      ownership: 'settled';
      phase: 'settled';
    }>;

export type EditableInputControllerState = {
  activeIntent: InputIntent | null;
  compositionSession: { modelCommitted: boolean; text: string | null } | null;
  draggedBlock: boolean;
  draggedRange: Range | null;
  isComposing: boolean;
  isDraggingInternally: boolean;
  isUpdatingSelection: boolean;
  latestElement: DOMElement | null;
  modelSelectionPreference?: ModelSelectionPreference | null;
  modelOwnedTextInputGuard?: number;
  outsideFocusBoundarySettleUntil: number;
  pendingDOMSelectionImport: boolean;
  pendingCompositionEnd: PendingCompositionEnd | null;
  pendingRootDOMInput?: {
    data: string | null;
    handled: boolean;
    inputType: string;
    target: DOMInputRepairTarget | null;
  } | null;
  pendingNativeTextInputRepairSuppressedDOMSelection?: boolean;
  pendingNativeTextInputRepairOffset?: number | null;
  pendingNativeTextInputRepairPathKey?: string | null;
  recentTextInputRepairEcho?: {
    expiresAt: number;
    pathKey: string;
    selectionOffset: number;
    text: string;
  } | null;
  repairInducedSelectionOriginVersion?: number;
  selectionChangeOrigin: SelectionChangeOrigin | null;
  selectionSource: SelectionSource;
};

export type DOMInputRepairTarget = {
  insert?: {
    offset: number;
    text: string;
  };
  path: Path;
  preferCapturedInsert?: boolean;
  selectionOffset: number;
  text: string;
};

export type RepairDOMInput = (
  nativeInput: {
    data: string | null;
    inputType: string;
    target?: DOMInputRepairTarget | null;
  },
  rootElement: HTMLElement
) => void;

export type EditableInputController = {
  domInputRuntime: DOMInputRuntime;
  preferModelSelectionForInputRef: RefObject<boolean>;
  scheduleTask?: DOMPhaseScheduler['schedule'];
  state: EditableInputControllerState;
};

type EditableInputControllerInput = Omit<
  EditableInputController,
  'domInputRuntime'
> & {
  domInputRuntime?: DOMInputRuntime;
};

type RuntimeBackedEditableInputControllerState =
  EditableInputControllerState & {
    [EDITABLE_INPUT_RUNTIME]?: DOMInputRuntime;
  };

const bindEditableInputRuntimeState = (
  state: EditableInputControllerState,
  domInputRuntime: DOMInputRuntime
) => {
  const runtimeState = state as RuntimeBackedEditableInputControllerState;

  if (runtimeState[EDITABLE_INPUT_RUNTIME] === domInputRuntime) return state;

  domInputRuntime.setCompositionSession(state.compositionSession);
  domInputRuntime.setPendingCompositionEnd(state.pendingCompositionEnd);
  domInputRuntime.nativeInputState.pendingInput =
    state.pendingRootDOMInput ?? null;
  domInputRuntime.nativeInputState.pendingRepairOffset =
    state.pendingNativeTextInputRepairOffset ?? null;
  domInputRuntime.nativeInputState.pendingRepairPathKey =
    state.pendingNativeTextInputRepairPathKey ?? null;
  domInputRuntime.nativeInputState.recentRepairEcho =
    state.recentTextInputRepairEcho ?? null;
  domInputRuntime.nativeInputState.suppressedDOMSelection =
    state.pendingNativeTextInputRepairSuppressedDOMSelection ?? false;

  Object.defineProperties(state, {
    [EDITABLE_INPUT_RUNTIME]: {
      configurable: true,
      value: domInputRuntime,
    },
    compositionSession: {
      configurable: true,
      enumerable: true,
      get: () => domInputRuntime.compositionSession,
      set: (session) => domInputRuntime.setCompositionSession(session),
    },
    pendingCompositionEnd: {
      configurable: true,
      enumerable: true,
      get: () =>
        domInputRuntime.getPendingCompositionEnd<PendingCompositionEnd>(),
      set: (pending) => domInputRuntime.setPendingCompositionEnd(pending),
    },
    pendingNativeTextInputRepairOffset: {
      configurable: true,
      enumerable: true,
      get: () => domInputRuntime.nativeInputState.pendingRepairOffset,
      set: (offset) => {
        domInputRuntime.nativeInputState.pendingRepairOffset = offset;
      },
    },
    pendingNativeTextInputRepairPathKey: {
      configurable: true,
      enumerable: true,
      get: () => domInputRuntime.nativeInputState.pendingRepairPathKey,
      set: (pathKey) => {
        domInputRuntime.nativeInputState.pendingRepairPathKey = pathKey;
      },
    },
    pendingNativeTextInputRepairSuppressedDOMSelection: {
      configurable: true,
      enumerable: true,
      get: () => domInputRuntime.nativeInputState.suppressedDOMSelection,
      set: (suppressed) => {
        domInputRuntime.nativeInputState.suppressedDOMSelection =
          suppressed ?? false;
      },
    },
    pendingRootDOMInput: {
      configurable: true,
      enumerable: true,
      get: () =>
        domInputRuntime.nativeInputState
          .pendingInput as EditableInputControllerState['pendingRootDOMInput'],
      set: (pending) => {
        domInputRuntime.nativeInputState.pendingInput = pending ?? null;
      },
    },
    recentTextInputRepairEcho: {
      configurable: true,
      enumerable: true,
      get: () => domInputRuntime.nativeInputState.recentRepairEcho,
      set: (echo) => {
        domInputRuntime.nativeInputState.recentRepairEcho = echo ?? null;
      },
    },
  });

  return state;
};

export const createEditableInputControllerState = (
  domInputRuntime: DOMInputRuntime = DOMRootRuntime.createDetachedInputRuntime()
): EditableInputControllerState =>
  bindEditableInputRuntimeState(
    {
      activeIntent: null,
      compositionSession: null,
      draggedBlock: false,
      draggedRange: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      modelSelectionPreference: null,
      modelOwnedTextInputGuard: 0,
      outsideFocusBoundarySettleUntil: 0,
      pendingDOMSelectionImport: false,
      pendingCompositionEnd: null,
      pendingRootDOMInput: null,
      pendingNativeTextInputRepairSuppressedDOMSelection: false,
      pendingNativeTextInputRepairOffset: null,
      pendingNativeTextInputRepairPathKey: null,
      recentTextInputRepairEcho: null,
      repairInducedSelectionOriginVersion: 0,
      selectionChangeOrigin: null,
      selectionSource: 'unknown',
    },
    domInputRuntime
  );

export const beginEditableCompositionSession = (
  inputController: EditableInputController
) => {
  inputController.domInputRuntime.beginComposition();
};

export const markEditableCompositionModelCommitted = (
  inputController: EditableInputController
) => {
  inputController.domInputRuntime.markCompositionModelCommitted();
};

export const runTrackedEditableCompositionMutation = <T>({
  callback,
  editor,
  inputController,
}: {
  callback: () => T;
  editor: Editor;
  inputController: EditableInputController;
}) => {
  if (!inputController.state.compositionSession) {
    return { committed: false, result: callback() };
  }

  const childrenBefore = editor.read((state) => state.children());
  const recordCommit = () => {
    const committed =
      editor.read((state) => state.children()) !== childrenBefore;

    if (committed) markEditableCompositionModelCommitted(inputController);

    return committed;
  };

  try {
    const result = callback();

    return { committed: recordCommit(), result };
  } catch (error) {
    recordCommit();
    throw error;
  }
};

export const recordEditableCompositionText = (
  inputController: EditableInputController,
  text: string
) => {
  inputController.domInputRuntime.recordCompositionText(text);
};

export const captureEditableCompositionRuntimeMarks = (editor: Editor) => ({
  hadPendingInsertionMarks: EDITOR_TO_PENDING_INSERTION_MARKS.has(editor),
  hadUserMarks: EDITOR_TO_USER_MARKS.has(editor),
  pendingInsertionMarks: EDITOR_TO_PENDING_INSERTION_MARKS.get(editor),
  userMarks: EDITOR_TO_USER_MARKS.get(editor),
});

export const restoreEditableCompositionRuntimeMarks = (
  editor: Editor,
  snapshot: ReturnType<typeof captureEditableCompositionRuntimeMarks>
) => {
  if (
    snapshot.hadPendingInsertionMarks &&
    snapshot.pendingInsertionMarks !== undefined
  ) {
    EDITOR_TO_PENDING_INSERTION_MARKS.set(
      editor,
      snapshot.pendingInsertionMarks
    );
  } else {
    EDITOR_TO_PENDING_INSERTION_MARKS.delete(editor);
  }
  if (snapshot.hadUserMarks && snapshot.userMarks !== undefined) {
    EDITOR_TO_USER_MARKS.set(editor, snapshot.userMarks);
  } else {
    EDITOR_TO_USER_MARKS.delete(editor);
  }
};

export const clearEditableCompositionRuntimeState = (editor: Editor) => {
  EDITOR_TO_PENDING_INSERTION_MARKS.delete(editor);
  const userMarks = EDITOR_TO_USER_MARKS.get(editor);

  EDITOR_TO_USER_MARKS.delete(editor);
  if (userMarks === undefined) return;

  const selection = editor.read((state) => state.selection());

  setEditorMarks(
    editor,
    userMarks === null || (selection && RangeApi.isCollapsed(selection))
      ? userMarks
      : null
  );
};

export const getEditableInputTimestamp = () =>
  globalThis.performance?.now?.() ?? Date.now();

export const clearExpiredTextInputRepairEcho = (
  inputController: EditableInputController,
  timestamp = getEditableInputTimestamp()
) => {
  const recentEcho = inputController.state.recentTextInputRepairEcho;

  if (recentEcho && timestamp > recentEcho.expiresAt) {
    inputController.state.recentTextInputRepairEcho = null;
  }
};

export const isEditableOutsideFocusBoundarySettling = (
  state: Pick<EditableInputControllerState, 'outsideFocusBoundarySettleUntil'>
) => state.outsideFocusBoundarySettleUntil > getEditableInputTimestamp();

export const createEditableInputController = ({
  domInputRuntime = DOMRootRuntime.createDetachedInputRuntime(),
  preferModelSelectionForInputRef,
  scheduleTask,
  state,
}: EditableInputControllerInput): EditableInputController => {
  const boundRuntime =
    (state as RuntimeBackedEditableInputControllerState)[
      EDITABLE_INPUT_RUNTIME
    ] ?? domInputRuntime;

  return {
    domInputRuntime: boundRuntime,
    preferModelSelectionForInputRef,
    scheduleTask,
    state: bindEditableInputRuntimeState(state, boundRuntime),
  };
};
