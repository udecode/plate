import {
  type Range,
  RangeApi,
  type RootKey,
  SelectionApi,
} from '@platejs/plite';
import { Hotkeys } from '@platejs/plite-dom';
import { DOMRootRuntime } from '@platejs/plite-dom/internal';
import type {
  ClipboardEvent as ReactClipboardEvent,
  CompositionEvent as ReactCompositionEvent,
  DragEvent as ReactDragEvent,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react';

import { isSelectAllHotkey } from '../dom-strategy/dom-strategy-commands';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { readPliteViewSelection } from '../view-selection';
import { getInputEventData, isDataTransferInput } from './dom-input-event';
import type { EditableCommand } from './editable-command-types';
import {
  closeEditableEditingEpochAfterTrace,
  getEditableEditingEpochForTrace,
} from './editing-epoch-adapter';
import { getHistoryDirectionFromNativeEvent } from './history-keyboard';
import {
  classifyBeforeInputIntent,
  classifyClipboardIntent,
  classifyCompositionIntent,
  classifyKeyboardIntent,
  getDocumentBoundaryKeyboardMove,
  isInteractiveInternalTarget,
} from './input-controller';
import type {
  EditableInputController,
  EditableSelectionSourceTransition,
  InputIntent,
  SelectionChangeOrigin,
  SelectionSource,
} from './input-state';
import type { EditableRepairRequest } from './mutation-controller';
import { type AnyEditor, toInternalRoot } from './runtime-editor-api';
import {
  readLiveSelection,
  readRuntimeSelection,
} from './runtime-selection-state';

export type EditableBrowserEventFamily =
  | 'beforeinput'
  | 'blur'
  | 'click'
  | 'compositionend'
  | 'compositionstart'
  | 'compositionupdate'
  | 'copy'
  | 'cut'
  | 'dragend'
  | 'dragover'
  | 'dragstart'
  | 'drop'
  | 'focus'
  | 'input'
  | 'keydown'
  | 'mousedown'
  | 'paste'
  | 'repair'
  | 'selectionchange';

export type EditableKernelState =
  | 'app-owned'
  | 'clipboard'
  | 'composition'
  | 'dom-selection'
  | 'dragging'
  | 'idle'
  | 'internal-control'
  | 'model-owned'
  | 'repairing'
  | 'partial-dom-backed';

export type EditableEventTargetOwner =
  | 'app-owned'
  | 'editor'
  | 'internal-control'
  | 'outside-editor'
  | 'partial-dom'
  | 'unknown';

export type EditableOwnership =
  | 'app-owned'
  | 'deferred'
  | 'model-owned'
  | 'native-allowed'
  | 'native-denied'
  | 'no-op';

export type { EditableCommand } from './editable-command-types';

export type EditableCommandKind = EditableCommand['kind'];

export type EditableCommandDefinition<
  TKind extends EditableCommandKind = EditableCommandKind,
> = Readonly<{
  inputFamilies: readonly EditableBrowserEventFamily[];
  kind: TKind;
  modelOwned: boolean;
}>;

const defineEditableCommand = <TKind extends EditableCommandKind>(
  definition: EditableCommandDefinition<TKind>
) => Object.freeze(definition);

export const EDITABLE_COMMAND_DEFINITIONS = {
  delete: defineEditableCommand({
    inputFamilies: ['beforeinput', 'keydown'],
    kind: 'delete',
    modelOwned: true,
  }),
  'delete-both': defineEditableCommand({
    inputFamilies: ['beforeinput'],
    kind: 'delete-both',
    modelOwned: true,
  }),
  'delete-fragment': defineEditableCommand({
    inputFamilies: ['beforeinput', 'copy', 'cut', 'keydown'],
    kind: 'delete-fragment',
    modelOwned: true,
  }),
  history: defineEditableCommand({
    inputFamilies: ['beforeinput', 'keydown'],
    kind: 'history',
    modelOwned: true,
  }),
  'insert-break': defineEditableCommand({
    inputFamilies: ['beforeinput', 'keydown'],
    kind: 'insert-break',
    modelOwned: true,
  }),
  'insert-data': defineEditableCommand({
    inputFamilies: ['beforeinput', 'drop', 'paste'],
    kind: 'insert-data',
    modelOwned: true,
  }),
  'insert-text': defineEditableCommand({
    inputFamilies: ['beforeinput', 'input'],
    kind: 'insert-text',
    modelOwned: true,
  }),
  'transpose-character': defineEditableCommand({
    inputFamilies: ['beforeinput', 'keydown'],
    kind: 'transpose-character',
    modelOwned: true,
  }),
  'move-selection': defineEditableCommand({
    inputFamilies: ['keydown'],
    kind: 'move-selection',
    modelOwned: true,
  }),
  select: defineEditableCommand({
    inputFamilies: ['copy', 'cut', 'drop', 'paste'],
    kind: 'select',
    modelOwned: true,
  }),
  'select-all': defineEditableCommand({
    inputFamilies: ['keydown'],
    kind: 'select-all',
    modelOwned: true,
  }),
} satisfies {
  [K in EditableCommandKind]: EditableCommandDefinition<K>;
};

export function getEditableCommandDefinition<TCommand extends EditableCommand>(
  command: TCommand
): EditableCommandDefinition<TCommand['kind']>;
export function getEditableCommandDefinition(command: null): null;
export function getEditableCommandDefinition(
  command: EditableCommand | null
): EditableCommandDefinition | null;
export function getEditableCommandDefinition(command: EditableCommand | null) {
  return command ? EDITABLE_COMMAND_DEFINITIONS[command.kind] : null;
}

export type EditableMovementAxis =
  | 'document'
  | 'horizontal'
  | 'line'
  | 'unknown'
  | 'vertical'
  | 'word';

export type EditableMovementOwnershipReason =
  | 'model-document-boundary'
  | 'model-horizontal-inline-void'
  | 'model-line-browser'
  | 'model-word-boundary'
  | 'native-selection-key'
  | 'native-vertical-layout';

export type EditableMovementOwnershipTrace = {
  axis: EditableMovementAxis;
  extend: boolean;
  key: string;
  ownership: Extract<EditableOwnership, 'model-owned' | 'native-allowed'>;
  reason: EditableMovementOwnershipReason;
  reverse: boolean | null;
};

export type EditableBrowserEvent = {
  family: EditableBrowserEventFamily;
  nativeEvent: Event;
  target: EventTarget | null;
};

export type EditableReactLifecyclePhase =
  | 'commit'
  | 'event'
  | 'external'
  | 'layout-effect';

export type EditableEventFrame = {
  active: boolean;
  commitEpoch: number | null;
  eventFamily: EditableBrowserEventFamily;
  focusOwner: EditableEventTargetOwner;
  id: number;
  inputIntent: InputIntent | null;
  lifecyclePhase: EditableReactLifecyclePhase;
  modelSelectionBefore: Range | null;
  root: RootKey;
  selectionSource: SelectionSource;
  startedAt: number;
  targetOwner: EditableEventTargetOwner;
  viewEpoch: number | null;
};

export type EditableEventFrameInput = {
  commitEpoch?: number | null;
  eventFamily: EditableBrowserEventFamily;
  focusOwner?: EditableEventTargetOwner;
  inputIntent?: InputIntent | null;
  lifecyclePhase?: EditableReactLifecyclePhase;
  modelSelectionBefore?: Range | null;
  root?: RootKey;
  selectionSource?: SelectionSource;
  startedAt?: number;
  targetOwner?: EditableEventTargetOwner;
  viewEpoch?: number | null;
};

export type EditableKernelTraceEntry = {
  command: EditableCommand | null;
  commandDefinition: EditableCommandDefinition | null;
  epochId: number | null;
  eventFamily: EditableBrowserEventFamily;
  frame: EditableEventFrame | null;
  frameId: number | null;
  intent: InputIntent | null;
  movement: EditableMovementOwnershipTrace | null;
  nativeAllowed: boolean;
  ownership: EditableOwnership;
  repair: EditableRepairRequest | null;
  repairPolicy: EditableRepairPolicy;
  selectionChangeOrigin: SelectionChangeOrigin;
  selectionAfter: Range | null;
  selectionBefore: Range | null;
  selectionPolicy: EditableSelectionPolicy;
  selectionSource: SelectionSource;
  stateAfter: EditableKernelState;
  stateBefore: EditableKernelState;
  targetOwner: EditableEventTargetOwner;
  transition: EditableKernelTransition;
};

export type EditableSelectionPolicy = {
  kind:
    | 'clear'
    | 'export-model'
    | 'import-dom'
    | 'none'
    | 'preserve-model'
    | 'partial-dom';
  reason:
    | 'internal-control'
    | 'model-owned'
    | 'native-selection'
    | 'not-requested'
    | 'selection-clear'
    | 'partial-dom-backed'
    | 'unknown-selection';
};

export type EditableRepairPolicy = {
  kind:
    | 'force-render'
    | 'none'
    | 'repair-caret'
    | 'repair-text'
    | 'sync-selection';
  reason:
    | 'force-render'
    | 'not-requested'
    | 'repair-caret'
    | 'repair-caret-after-text-insert'
    | 'repair-text'
    | 'sync-selection';
};

export type EditableKernelTransition = {
  allowed: boolean;
  reason: string | null;
};

export type EditableKernelResult = {
  command: EditableCommand | null;
  handled: boolean;
  intent: InputIntent | null;
  nativeAllowed: boolean;
  ownership: EditableOwnership;
  repair: EditableRepairRequest | null;
  repairPolicy: EditableRepairPolicy;
  selectionPolicy: EditableSelectionPolicy;
  selectionSource: SelectionSource;
  trace: EditableKernelTraceEntry;
};

export type EditableKernelContext = {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
};

export type EditableKeyDownKernelDecision = {
  command: EditableCommand | null;
  intent: InputIntent | null;
  internalTarget: boolean;
  nativeAllowed: boolean;
  ownership: EditableOwnership;
  selectionBefore: Range | null;
  selectionPolicy: EditableSelectionPolicy;
  selectionSourceTransition: EditableSelectionSourceTransition | null;
  shouldForceDOMImport: boolean;
  stateBefore: EditableKernelState;
  targetOwner: EditableEventTargetOwner;
};

export type EditableBeforeInputKernelDecision = {
  command: EditableCommand | null;
  intent: InputIntent | null;
  internalTarget: boolean;
  nativeAllowed: boolean;
  ownership: EditableOwnership;
  selectionBefore: Range | null;
  selectionPolicy: EditableSelectionPolicy;
  selectionSourceTransition: EditableSelectionSourceTransition | null;
  stateBefore: EditableKernelState;
  targetOwner: EditableEventTargetOwner;
};

export type EditableClipboardKernelDecision = {
  intent: InputIntent;
  internalTarget: boolean;
  nativeAllowed: boolean;
  ownership: EditableOwnership;
  selectionBefore: Range | null;
  stateBefore: EditableKernelState;
  targetOwner: EditableEventTargetOwner;
};

export type EditableCompositionKernelDecision = {
  intent: InputIntent;
  internalTarget: boolean;
  nativeAllowed: boolean;
  ownership: EditableOwnership;
  repairPolicy: EditableRepairPolicy;
  selectionBefore: Range | null;
  selectionPolicy: EditableSelectionPolicy;
  stateBefore: EditableKernelState;
  targetOwner: EditableEventTargetOwner;
};

export type EditableFocusMouseKernelDecision = {
  intent: null;
  internalTarget: boolean;
  nativeAllowed: boolean;
  ownership: EditableOwnership;
  selectionBefore: Range | null;
  stateBefore: EditableKernelState;
  targetOwner: EditableEventTargetOwner;
};

export type EditableInputKernelDecision = {
  intent: InputIntent | null;
  internalTarget: boolean;
  nativeAllowed: boolean;
  ownership: EditableOwnership;
  selectionBefore: Range | null;
  stateBefore: EditableKernelState;
  targetOwner: EditableEventTargetOwner;
};

export type EditableEditingKernel = {
  dispatchBrowserEvent: (event: EditableBrowserEvent) => EditableKernelResult;
  editor: AnyEditor;
  state: EditableKernelState;
};

export type EditableKernelTraceInput = Omit<
  EditableKernelTraceEntry,
  | 'epochId'
  | 'frame'
  | 'frameId'
  | 'commandDefinition'
  | 'movement'
  | 'repairPolicy'
  | 'selectionChangeOrigin'
  | 'selectionAfter'
  | 'selectionPolicy'
  | 'transition'
> & {
  movement?: EditableMovementOwnershipTrace | null;
  repairPolicy?: EditableRepairPolicy;
  selectionChangeOrigin?: SelectionChangeOrigin;
  selectionAfter?: Range | null;
  selectionPolicy?: EditableSelectionPolicy;
  transition?: EditableKernelTransition;
};

export const EDITABLE_KERNEL_TRACE_LIMIT = 200;

export const mapSelectionSourceToKernelState = (
  source: SelectionSource
): EditableKernelState => DOMRootRuntime.resolveInputKernelState(source);

export const getEditableSelectionChangeOwnership = ({
  selectionChangeOrigin,
  selectionSource,
}: {
  selectionChangeOrigin: SelectionChangeOrigin;
  selectionSource: SelectionSource;
}): EditableOwnership =>
  DOMRootRuntime.resolveInputSelectionChangeOwnership({
    selectionChangeOrigin,
    selectionSource,
  });

export const getEditableKernelTrace = (
  editor: AnyEditor
): readonly EditableKernelTraceEntry[] =>
  DOMRootRuntime.resolveInputRuntime(
    editor
  ).getTrace<EditableKernelTraceEntry>();

export const clearEditableKernelTrace = (editor: AnyEditor) => {
  DOMRootRuntime.resolveInputRuntime(editor).clearTrace();
};

export const getCurrentEditableEventFrame = (
  editor: AnyEditor
): EditableEventFrame | null =>
  DOMRootRuntime.resolveInputRuntime(editor).currentFrame<
    InputIntent,
    Range | null
  >();

export const beginEditableEventFrame = (
  editor: AnyEditor,
  input: EditableEventFrameInput
): EditableEventFrame => {
  const inputRuntime = DOMRootRuntime.resolveInputRuntime(editor);

  return inputRuntime.beginFrame({
    commitEpoch: input.commitEpoch ?? null,
    eventFamily: input.eventFamily,
    focusOwner: input.focusOwner ?? 'unknown',
    inputIntent: input.inputIntent ?? null,
    lifecyclePhase: input.lifecyclePhase ?? 'event',
    modelSelectionBefore:
      input.modelSelectionBefore ?? readLiveSelection(editor),
    root:
      input.root ?? toInternalRoot(editor.read((state) => state.view.root())),
    selectionSource: input.selectionSource ?? 'unknown',
    startedAt: input.startedAt ?? Date.now(),
    targetOwner: input.targetOwner ?? 'unknown',
    viewEpoch: input.viewEpoch ?? null,
  });
};

export const endEditableEventFrame = (
  editor: AnyEditor
): EditableEventFrame | null =>
  DOMRootRuntime.resolveInputRuntime(editor).endFrame<
    InputIntent,
    Range | null
  >();

export const recordEditableKernelTrace = ({
  editor,
  trace,
}: {
  editor: AnyEditor;
  trace: EditableKernelTraceInput;
}) => {
  const entry = createEditableKernelTraceEntry({ editor, trace });
  DOMRootRuntime.resolveInputRuntime(editor).recordTrace(entry);
  closeEditableEditingEpochAfterTrace(editor, {
    command: entry.command,
    epochId: entry.epochId,
    eventFamily: entry.eventFamily,
    ownership: entry.ownership,
    selectionChangeOrigin: entry.selectionChangeOrigin,
  });

  return entry;
};

export const getEditableKernelTransition = ({
  command,
  eventFamily,
  frame,
  nativeAllowed,
  ownership,
  repairPolicy,
  selectionChangeOrigin,
  selectionPolicy,
  stateAfter,
  targetOwner,
}: Pick<
  EditableKernelTraceEntry,
  | 'command'
  | 'eventFamily'
  | 'frame'
  | 'nativeAllowed'
  | 'ownership'
  | 'repairPolicy'
  | 'stateAfter'
  | 'targetOwner'
> & {
  selectionChangeOrigin?: SelectionChangeOrigin;
  selectionPolicy?: EditableSelectionPolicy;
}): EditableKernelTransition =>
  DOMRootRuntime.resolveInputTransition({
    commandKind: command?.kind ?? null,
    commandPresent: command !== null,
    eventFamily,
    frameLifecyclePhase: frame?.lifecyclePhase ?? null,
    nativeAllowed,
    ownership,
    repairPolicy,
    selectionChangeOrigin,
    selectionPolicy,
    stateAfter,
    targetOwner,
  });

const shouldAssertEditableKernelTransitions = () =>
  (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
    ?.NODE_ENV !== 'production';

const assertEditableKernelTransition = (entry: EditableKernelTraceEntry) => {
  if (entry.transition.allowed || !shouldAssertEditableKernelTransitions()) {
    return;
  }

  throw new Error(
    `Illegal Editable kernel transition: ${entry.transition.reason ?? 'unknown'}`
  );
};

const hasProgrammaticSelectionOrigin = (
  selectionChangeOrigin: SelectionChangeOrigin | null
) =>
  selectionChangeOrigin === 'browser-handle' ||
  selectionChangeOrigin === 'programmatic-export' ||
  selectionChangeOrigin === 'repair-induced';

const hasAuthoritativeModelSelection = ({
  inputController,
}: {
  inputController: EditableInputController;
}) =>
  (inputController.state.selectionSource === 'model-owned' ||
    inputController.state.selectionSource === 'partial-dom-backed') &&
  (inputController.preferModelSelectionForInputRef.current ||
    hasProgrammaticSelectionOrigin(
      inputController.state.selectionChangeOrigin
    ));

export const getEditableSelectionPolicy = ({
  eventFamily,
  ownership,
  selectionSource,
  targetOwner,
}: Pick<
  EditableKernelTraceEntry,
  'eventFamily' | 'ownership' | 'selectionSource' | 'targetOwner'
>): EditableSelectionPolicy =>
  DOMRootRuntime.resolveInputSelectionPolicy({
    eventFamily,
    ownership,
    selectionSource,
    targetOwner,
  });

export const getEditableRepairPolicy = ({
  repair,
}: Pick<EditableKernelTraceEntry, 'repair'>): EditableRepairPolicy =>
  DOMRootRuntime.resolveInputRepairPolicy(repair?.kind ?? null);

export const createEditableKernelTraceEntry = ({
  editor,
  trace,
}: {
  editor: AnyEditor;
  trace: EditableKernelTraceInput;
}): EditableKernelTraceEntry => {
  const frame = getCurrentEditableEventFrame(editor);
  const epoch = getEditableEditingEpochForTrace(editor, {
    command: trace.command,
    eventFamily: trace.eventFamily,
    ownership: trace.ownership,
    selectionChangeOrigin: trace.selectionChangeOrigin,
  });
  const entry = {
    ...trace,
    commandDefinition: getEditableCommandDefinition(trace.command),
    epochId: epoch?.id ?? null,
    frame,
    frameId: frame?.id ?? null,
    movement: trace.movement ?? null,
    repairPolicy:
      trace.repairPolicy ??
      getEditableRepairPolicy({
        repair: trace.repair,
      }),
    selectionChangeOrigin: trace.selectionChangeOrigin ?? 'unknown',
    selectionAfter: trace.selectionAfter ?? readRuntimeSelection(editor),
    selectionPolicy:
      trace.selectionPolicy ??
      getEditableSelectionPolicy({
        eventFamily: trace.eventFamily,
        ownership: trace.ownership,
        selectionSource: trace.selectionSource,
        targetOwner: trace.targetOwner,
      }),
  };
  const traceEntry = {
    ...entry,
    transition:
      trace.transition ??
      getEditableKernelTransition({
        command: entry.command,
        eventFamily: entry.eventFamily,
        frame: entry.frame,
        nativeAllowed: entry.nativeAllowed,
        ownership: entry.ownership,
        repairPolicy: entry.repairPolicy,
        selectionChangeOrigin: entry.selectionChangeOrigin,
        selectionPolicy: entry.selectionPolicy,
        stateAfter: entry.stateAfter,
        targetOwner: entry.targetOwner,
      }),
  };

  assertEditableKernelTransition(traceEntry);

  return traceEntry;
};

export const createEditableKernelResult = ({
  editor,
  handled,
  trace,
}: {
  editor: AnyEditor;
  handled: boolean;
  trace: EditableKernelTraceInput;
}): EditableKernelResult => {
  const entry = createEditableKernelTraceEntry({ editor, trace });

  return {
    command: entry.command,
    handled,
    intent: entry.intent,
    nativeAllowed: entry.nativeAllowed,
    ownership: entry.ownership,
    repair: entry.repair,
    repairPolicy: entry.repairPolicy,
    selectionPolicy: entry.selectionPolicy,
    selectionSource: entry.selectionSource,
    trace: entry,
  };
};

const deleteFragmentOrCommand = ({
  direction,
  selection,
  unit,
}: {
  direction: 'backward' | 'forward';
  selection: Range | null;
  unit?: 'block' | 'line' | 'word';
}): EditableCommand =>
  selection && RangeApi.isExpanded(selection)
    ? { direction, kind: 'delete-fragment', selection }
    : { direction, kind: 'delete', unit };

const getBeforeInputDeleteCommand = ({
  inputType,
  selection,
}: {
  inputType: string;
  selection: Range | null;
}): EditableCommand | null => {
  if (
    selection &&
    RangeApi.isExpanded(selection) &&
    inputType.startsWith('delete')
  ) {
    return {
      direction: inputType.endsWith('Backward') ? 'backward' : 'forward',
      kind: 'delete-fragment',
      selection,
    };
  }

  switch (inputType) {
    case 'deleteByComposition':
    case 'deleteByCut':
    case 'deleteByDrag':
      return { kind: 'delete-fragment', selection };
    case 'deleteContent':
    case 'deleteContentForward':
      return { direction: 'forward', kind: 'delete' };
    case 'deleteContentBackward':
      return { direction: 'backward', kind: 'delete' };
    case 'deleteEntireSoftLine':
      return { kind: 'delete-both', unit: 'line' };
    case 'deleteHardLineBackward':
      return { direction: 'backward', kind: 'delete', unit: 'block' };
    case 'deleteSoftLineBackward':
      return { direction: 'backward', kind: 'delete', unit: 'line' };
    case 'deleteHardLineForward':
      return { direction: 'forward', kind: 'delete', unit: 'block' };
    case 'deleteSoftLineForward':
      return { direction: 'forward', kind: 'delete', unit: 'line' };
    case 'deleteWordBackward':
      return { direction: 'backward', kind: 'delete', unit: 'word' };
    case 'deleteWordForward':
      return { direction: 'forward', kind: 'delete', unit: 'word' };
    default:
      return null;
  }
};

export const getEditableCommandFromBeforeInputType = ({
  data,
  inputType,
  selection,
}: {
  data: unknown;
  inputType: string;
  selection: Range | null;
}): EditableCommand | null => {
  if (inputType === 'historyUndo') {
    return { direction: 'undo', kind: 'history' };
  }
  if (inputType === 'historyRedo') {
    return { direction: 'redo', kind: 'history' };
  }
  if (inputType.startsWith('format')) return null;
  if (inputType.startsWith('delete')) {
    return getBeforeInputDeleteCommand({ inputType, selection });
  }
  if (inputType === 'insertLineBreak') {
    return { kind: 'insert-break', variant: 'soft' };
  }
  if (inputType === 'insertParagraph') {
    return { kind: 'insert-break', variant: 'paragraph' };
  }
  if (inputType === 'insertTranspose') {
    return { kind: 'transpose-character' };
  }
  if (
    (inputType === 'insertText' || inputType === 'insertReplacementText') &&
    typeof data === 'string'
  ) {
    return { inputType, kind: 'insert-text', text: data };
  }
  if (
    (inputType === 'insertFromDrop' ||
      inputType === 'insertFromPaste' ||
      inputType === 'insertFromYank') &&
    isDataTransferInput(data)
  ) {
    return { data, kind: 'insert-data' };
  }

  return null;
};

export const getEditableCommandFromBeforeInput = ({
  event,
  selection,
}: {
  event: InputEvent;
  selection: Range | null;
}): EditableCommand | null =>
  getEditableCommandFromBeforeInputType({
    data: getInputEventData(event),
    inputType: event.inputType,
    selection,
  });

export const getEditableCommandFromKeyDown = ({
  event,
  selection,
}: {
  event: ReactKeyboardEvent<HTMLDivElement>;
  selection: Range | null;
}): EditableCommand | null => {
  const { nativeEvent } = event;
  const historyDirection = getHistoryDirectionFromNativeEvent(nativeEvent);

  if (historyDirection) {
    return { direction: historyDirection, kind: 'history' };
  }
  if (isSelectAllHotkey(nativeEvent)) {
    return { kind: 'select-all' };
  }
  if (Hotkeys.isSoftBreak(nativeEvent)) {
    return { kind: 'insert-break', variant: 'soft' };
  }
  if (Hotkeys.isOpenLine(nativeEvent)) {
    return { kind: 'insert-break', variant: 'open-line' };
  }
  if (Hotkeys.isSplitBlock(nativeEvent)) {
    return { kind: 'insert-break', variant: 'paragraph' };
  }
  if (Hotkeys.isDeleteBackward(nativeEvent)) {
    return deleteFragmentOrCommand({ direction: 'backward', selection });
  }
  if (Hotkeys.isDeleteForward(nativeEvent)) {
    return deleteFragmentOrCommand({ direction: 'forward', selection });
  }
  if (Hotkeys.isDeleteLineBackward(nativeEvent)) {
    return deleteFragmentOrCommand({
      direction: 'backward',
      selection,
      unit: 'line',
    });
  }
  if (Hotkeys.isDeleteLineForward(nativeEvent)) {
    return deleteFragmentOrCommand({
      direction: 'forward',
      selection,
      unit: 'line',
    });
  }
  if (Hotkeys.isDeleteWordBackward(nativeEvent)) {
    return deleteFragmentOrCommand({
      direction: 'backward',
      selection,
      unit: 'word',
    });
  }
  if (Hotkeys.isDeleteWordForward(nativeEvent)) {
    return deleteFragmentOrCommand({
      direction: 'forward',
      selection,
      unit: 'word',
    });
  }
  const documentBoundaryMove = getDocumentBoundaryKeyboardMove(nativeEvent);
  if (documentBoundaryMove) {
    return {
      axis: 'document',
      extend: documentBoundaryMove.extend || undefined,
      kind: 'move-selection',
      reverse: documentBoundaryMove.reverse || undefined,
    };
  }
  if (Hotkeys.isMoveLineBackward(nativeEvent)) {
    return { axis: 'line', kind: 'move-selection', reverse: true };
  }
  if (Hotkeys.isMoveLineForward(nativeEvent)) {
    return { axis: 'line', kind: 'move-selection' };
  }
  if (Hotkeys.isExtendLineBackward(nativeEvent)) {
    return {
      axis: 'line',
      extend: true,
      kind: 'move-selection',
      reverse: true,
    };
  }
  if (Hotkeys.isExtendLineForward(nativeEvent)) {
    return { axis: 'line', extend: true, kind: 'move-selection' };
  }
  if (Hotkeys.isExtendBackward(nativeEvent)) {
    return {
      axis: 'horizontal',
      extend: true,
      kind: 'move-selection',
      reverse: true,
    };
  }
  if (Hotkeys.isExtendForward(nativeEvent)) {
    return { axis: 'horizontal', extend: true, kind: 'move-selection' };
  }
  if (Hotkeys.isExtendWordBackward(nativeEvent)) {
    return {
      axis: 'word',
      extend: true,
      kind: 'move-selection',
      reverse: true,
    };
  }
  if (Hotkeys.isExtendWordForward(nativeEvent)) {
    return { axis: 'word', extend: true, kind: 'move-selection' };
  }
  if (Hotkeys.isMoveWordBackward(nativeEvent)) {
    return { axis: 'word', kind: 'move-selection', reverse: true };
  }
  if (Hotkeys.isMoveWordForward(nativeEvent)) {
    return { axis: 'word', kind: 'move-selection' };
  }
  if (Hotkeys.isMoveBackward(nativeEvent)) {
    return { axis: 'horizontal', kind: 'move-selection', reverse: true };
  }
  if (Hotkeys.isMoveForward(nativeEvent)) {
    return { axis: 'horizontal', kind: 'move-selection' };
  }

  return null;
};

export const getEditableMovementOwnershipTrace = ({
  command,
  intent,
  key,
  ownership,
}: {
  command: EditableCommand | null;
  intent: InputIntent | null;
  key: string;
  ownership: EditableOwnership;
}): EditableMovementOwnershipTrace | null => {
  if (command?.kind === 'move-selection' && ownership === 'model-owned') {
    const reason: EditableMovementOwnershipReason =
      command.axis === 'document'
        ? 'model-document-boundary'
        : command.axis === 'line'
          ? 'model-line-browser'
          : command.axis === 'word'
            ? 'model-word-boundary'
            : 'model-horizontal-inline-void';

    return {
      axis: command.axis,
      extend: Boolean(command.extend),
      key,
      ownership,
      reason,
      reverse: typeof command.reverse === 'boolean' ? command.reverse : null,
    };
  }

  if (intent === 'native-selection-move' && ownership === 'native-allowed') {
    const vertical = key === 'ArrowUp' || key === 'ArrowDown';

    return {
      axis: vertical ? 'vertical' : 'unknown',
      extend: false,
      key,
      ownership,
      reason: vertical ? 'native-vertical-layout' : 'native-selection-key',
      reverse: key === 'ArrowUp' ? true : key === 'ArrowDown' ? false : null,
    };
  }

  return null;
};

export const prepareEditableKeyDownKernel = ({
  editor,
  event,
  inputController,
  domStrategyRuntime,
}: {
  editor: ReactRuntimeEditor;
  event: ReactKeyboardEvent<HTMLDivElement>;
  inputController: EditableInputController;
  domStrategyRuntime: unknown;
}): EditableKeyDownKernelDecision => {
  const intent = classifyKeyboardIntent({
    editor,
    event,
    isComposing: inputController.state.isComposing,
    domStrategyRuntime,
  });
  const selectionBefore = readRuntimeSelection(editor);
  const internalTarget = isInteractiveInternalTarget(editor, event.target);
  const command =
    (internalTarget && intent !== 'history') || intent === 'composition'
      ? null
      : getEditableCommandFromKeyDown({
          event,
          selection: selectionBefore,
        });
  const targetOwner: EditableEventTargetOwner = internalTarget
    ? 'internal-control'
    : ReactEditor.hasEditableTarget(editor, event.target)
      ? 'editor'
      : 'unknown';
  const hasModelOnlySelection = SelectionApi.isNode(selectionBefore);

  return DOMRootRuntime.resolveInputRuntime(editor).prepareKeyDownDecision({
    authoritativeModelSelection: hasAuthoritativeModelSelection({
      inputController,
    }),
    command,
    hasModelOnlySelection,
    hasProjectedViewSelection: readPliteViewSelection(editor) !== null,
    intent,
    internalTarget,
    selectionBefore,
    selectionSource: inputController.state.selectionSource,
    targetOwner,
  });
};

export const prepareEditableBeforeInputKernel = ({
  editor,
  event,
  inputController,
}: {
  editor: ReactRuntimeEditor;
  event: InputEvent;
  inputController: EditableInputController;
}): EditableBeforeInputKernelDecision => {
  const internalTarget = isInteractiveInternalTarget(editor, event.target);
  const intent = classifyBeforeInputIntent({
    editor,
    event,
    internalTarget,
  });
  const selectionBefore = readRuntimeSelection(editor);
  const targetOwner: EditableEventTargetOwner = internalTarget
    ? 'internal-control'
    : ReactEditor.hasEditableTarget(editor, event.target)
      ? 'editor'
      : 'unknown';

  return DOMRootRuntime.resolveInputRuntime(editor).prepareBeforeInputDecision({
    authoritativeModelSelection: hasAuthoritativeModelSelection({
      inputController,
    }),
    command: getEditableCommandFromBeforeInput({
      event,
      selection: selectionBefore,
    }),
    formatInput: event.inputType.startsWith('format'),
    hasProjectedViewSelection: readPliteViewSelection(editor) !== null,
    intent,
    internalTarget,
    selectionBefore,
    selectionSource: inputController.state.selectionSource,
    targetOwner,
  });
};

export const prepareEditableClipboardKernel = ({
  editor,
  event,
  inputController,
}: {
  editor: ReactRuntimeEditor;
  event: ReactClipboardEvent<HTMLDivElement> | ReactDragEvent<HTMLDivElement>;
  inputController: EditableInputController;
}): EditableClipboardKernelDecision => {
  const intent = classifyClipboardIntent({
    editor,
    event,
  });
  const internalTarget = isInteractiveInternalTarget(editor, event.target);
  const targetOwner: EditableEventTargetOwner = internalTarget
    ? 'internal-control'
    : ReactEditor.hasEditableTarget(editor, event.target)
      ? 'editor'
      : 'unknown';

  return DOMRootRuntime.resolveInputRuntime(editor).prepareClipboardDecision({
    intent,
    internalTarget,
    selectionBefore: readLiveSelection(editor),
    selectionSource: inputController.state.selectionSource,
    targetOwner,
  });
};

export const prepareEditableCompositionKernel = ({
  editor,
  event,
  inputController,
}: {
  editor: ReactRuntimeEditor;
  event: ReactCompositionEvent<HTMLDivElement>;
  inputController: EditableInputController;
}): EditableCompositionKernelDecision => {
  const intent = classifyCompositionIntent({
    editor,
    event,
  });
  const internalTarget = isInteractiveInternalTarget(editor, event.target);
  const targetOwner: EditableEventTargetOwner = internalTarget
    ? 'internal-control'
    : ReactEditor.hasEditableTarget(editor, event.target)
      ? 'editor'
      : 'unknown';

  return DOMRootRuntime.resolveInputRuntime(editor).prepareCompositionDecision({
    intent,
    internalTarget,
    selectionBefore: readLiveSelection(editor),
    selectionSource: inputController.state.selectionSource,
    targetOwner,
  });
};

export const prepareEditableFocusMouseKernel = ({
  editor,
  event,
  inputController,
}: {
  editor: ReactRuntimeEditor;
  event: ReactFocusEvent<HTMLDivElement> | ReactMouseEvent<HTMLDivElement>;
  inputController: EditableInputController;
}): EditableFocusMouseKernelDecision => {
  const internalTarget = isInteractiveInternalTarget(editor, event.target);
  const targetOwner: EditableEventTargetOwner = internalTarget
    ? 'internal-control'
    : ReactEditor.hasEditableTarget(editor, event.target)
      ? 'editor'
      : ReactEditor.hasTarget(editor, event.target)
        ? 'app-owned'
        : 'unknown';

  return DOMRootRuntime.resolveInputRuntime(editor).prepareFocusMouseDecision({
    internalTarget,
    selectionBefore: readLiveSelection(editor),
    selectionSource: inputController.state.selectionSource,
    targetOwner,
  });
};

export const prepareEditableInputKernel = ({
  editor,
  event,
  inputController,
}: {
  editor: ReactRuntimeEditor;
  event: React.FormEvent<HTMLDivElement>;
  inputController: EditableInputController;
}): EditableInputKernelDecision => {
  const internalTarget = isInteractiveInternalTarget(editor, event.target);
  const intent = internalTarget
    ? 'internal-control'
    : inputController.state.activeIntent;
  const targetOwner: EditableEventTargetOwner = internalTarget
    ? 'internal-control'
    : ReactEditor.hasEditableTarget(editor, event.target)
      ? 'editor'
      : 'unknown';

  return DOMRootRuntime.resolveInputRuntime(editor).prepareInputDecision({
    intent,
    internalTarget,
    selectionBefore: readLiveSelection(editor),
    selectionSource: inputController.state.selectionSource,
    targetOwner,
  });
};
