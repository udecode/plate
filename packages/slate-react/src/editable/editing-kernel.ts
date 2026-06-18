import type {
  ClipboardEvent as ReactClipboardEvent,
  CompositionEvent as ReactCompositionEvent,
  DragEvent as ReactDragEvent,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react';
import {
  type Editor,
  type Operation,
  type Range,
  RangeApi,
  type RootKey,
} from '@platejs/slate';
import { Hotkeys } from '@platejs/slate-dom';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { readSlateViewSelection } from '../view-selection';
import { getInputEventData, isDataTransferInput } from './dom-input-event';
import type { EditableCommand } from './editable-command-types';
import {
  closeEditableEditingEpochAfterTrace,
  getEditableEditingEpochForTrace,
} from './editing-epoch-kernel';
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
  format: defineEditableCommand({
    inputFamilies: ['beforeinput', 'keydown'],
    kind: 'format',
    modelOwned: false,
  }),
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
  'set-block': defineEditableCommand({
    inputFamilies: ['keydown'],
    kind: 'set-block',
    modelOwned: false,
  }),
  'toggle-mark': defineEditableCommand({
    inputFamilies: ['keydown'],
    kind: 'toggle-mark',
    modelOwned: false,
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
  operations: readonly Operation[];
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
  editor: Editor;
  state: EditableKernelState;
};

export type EditableKernelTraceInput = Omit<
  EditableKernelTraceEntry,
  | 'epochId'
  | 'frame'
  | 'frameId'
  | 'commandDefinition'
  | 'movement'
  | 'operations'
  | 'repairPolicy'
  | 'selectionChangeOrigin'
  | 'selectionAfter'
  | 'selectionPolicy'
  | 'transition'
> & {
  operations?: readonly Operation[];
  movement?: EditableMovementOwnershipTrace | null;
  repairPolicy?: EditableRepairPolicy;
  selectionChangeOrigin?: SelectionChangeOrigin;
  selectionAfter?: Range | null;
  selectionPolicy?: EditableSelectionPolicy;
  transition?: EditableKernelTransition;
};

export const EDITABLE_KERNEL_TRACE_LIMIT = 200;

const EDITOR_TO_KERNEL_TRACE = new WeakMap<
  Editor,
  EditableKernelTraceEntry[]
>();
const EDITOR_TO_CURRENT_EVENT_FRAME = new WeakMap<Editor, EditableEventFrame>();
const EDITOR_TO_NEXT_EVENT_FRAME_ID = new WeakMap<Editor, number>();

export const mapSelectionSourceToKernelState = (
  source: SelectionSource
): EditableKernelState => {
  switch (source) {
    case 'app-owned':
      return 'app-owned';
    case 'composition-owned':
      return 'composition';
    case 'dom-current':
      return 'dom-selection';
    case 'internal-control':
      return 'internal-control';
    case 'model-owned':
      return 'model-owned';
    case 'partial-dom-backed':
      return 'partial-dom-backed';
    case 'unknown':
      return 'idle';
  }
};

export const getEditableSelectionChangeOwnership = ({
  selectionChangeOrigin,
  selectionSource,
}: {
  selectionChangeOrigin: SelectionChangeOrigin;
  selectionSource: SelectionSource;
}): EditableOwnership => {
  if (selectionChangeOrigin === 'native-user') {
    return 'native-allowed';
  }

  if (selectionChangeOrigin === 'browser-handle') {
    return 'native-allowed';
  }

  if (
    selectionChangeOrigin === 'programmatic-export' ||
    selectionChangeOrigin === 'repair-induced'
  ) {
    return 'model-owned';
  }

  return selectionSource === 'dom-current' ? 'native-allowed' : 'no-op';
};

export const getEditableKernelTrace = (
  editor: Editor
): readonly EditableKernelTraceEntry[] =>
  EDITOR_TO_KERNEL_TRACE.get(editor) ?? [];

export const clearEditableKernelTrace = (editor: Editor) => {
  EDITOR_TO_KERNEL_TRACE.delete(editor);
};

export const getCurrentEditableEventFrame = (
  editor: Editor
): EditableEventFrame | null =>
  EDITOR_TO_CURRENT_EVENT_FRAME.get(editor) ?? null;

export const beginEditableEventFrame = (
  editor: Editor,
  input: EditableEventFrameInput
): EditableEventFrame => {
  const id = EDITOR_TO_NEXT_EVENT_FRAME_ID.get(editor) ?? 1;
  const frame: EditableEventFrame = {
    active: true,
    commitEpoch: input.commitEpoch ?? null,
    eventFamily: input.eventFamily,
    focusOwner: input.focusOwner ?? 'unknown',
    id,
    inputIntent: input.inputIntent ?? null,
    lifecyclePhase: input.lifecyclePhase ?? 'event',
    modelSelectionBefore:
      input.modelSelectionBefore ?? readLiveSelection(editor),
    root: input.root ?? editor.read((state) => state.view.root()),
    selectionSource: input.selectionSource ?? 'unknown',
    startedAt: input.startedAt ?? Date.now(),
    targetOwner: input.targetOwner ?? 'unknown',
    viewEpoch: input.viewEpoch ?? null,
  };

  EDITOR_TO_CURRENT_EVENT_FRAME.set(editor, frame);
  EDITOR_TO_NEXT_EVENT_FRAME_ID.set(editor, id + 1);

  return frame;
};

export const endEditableEventFrame = (
  editor: Editor
): EditableEventFrame | null => {
  const frame = getCurrentEditableEventFrame(editor);

  if (!frame) {
    return null;
  }

  const inactiveFrame = { ...frame, active: false };
  EDITOR_TO_CURRENT_EVENT_FRAME.set(editor, inactiveFrame);

  return inactiveFrame;
};

export const recordEditableKernelTrace = ({
  editor,
  trace,
}: {
  editor: Editor;
  trace: EditableKernelTraceInput;
}) => {
  const entry = createEditableKernelTraceEntry({ editor, trace });
  const traces = EDITOR_TO_KERNEL_TRACE.get(editor) ?? [];

  traces.push(entry);
  if (traces.length > EDITABLE_KERNEL_TRACE_LIMIT) {
    traces.splice(0, traces.length - EDITABLE_KERNEL_TRACE_LIMIT);
  }
  EDITOR_TO_KERNEL_TRACE.set(editor, traces);
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
}): EditableKernelTransition => {
  if (command && nativeAllowed) {
    return {
      allowed: false,
      reason: 'command cannot be native-owned',
    };
  }

  if (nativeAllowed && ownership !== 'native-allowed') {
    return {
      allowed: false,
      reason: 'nativeAllowed requires native ownership',
    };
  }

  if (nativeAllowed && repairPolicy.kind !== 'none') {
    return {
      allowed: false,
      reason: 'native-owned events cannot schedule model repair',
    };
  }

  if (
    targetOwner === 'internal-control' &&
    ownership === 'model-owned' &&
    command?.kind !== 'history'
  ) {
    return {
      allowed: false,
      reason: 'internal controls cannot dispatch model commands',
    };
  }

  if (eventFamily === 'repair' && stateAfter === 'dom-selection') {
    return {
      allowed: false,
      reason: 'repair cannot hand authority back to stale DOM selection',
    };
  }

  if (eventFamily === 'repair' && selectionPolicy?.kind === 'import-dom') {
    return {
      allowed: false,
      reason: 'repair cannot import DOM selection',
    };
  }

  if (
    selectionPolicy?.kind === 'import-dom' &&
    (!frame || frame.lifecyclePhase !== 'event')
  ) {
    return {
      allowed: false,
      reason: 'selection import requires event lifecycle frame',
    };
  }

  if (
    eventFamily === 'selectionchange' &&
    nativeAllowed &&
    (selectionChangeOrigin === 'programmatic-export' ||
      selectionChangeOrigin === 'repair-induced')
  ) {
    return {
      allowed: false,
      reason: 'programmatic selectionchange cannot re-import as native intent',
    };
  }

  return {
    allowed: true,
    reason: null,
  };
};

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
>): EditableSelectionPolicy => {
  if (targetOwner === 'internal-control') {
    return { kind: 'none', reason: 'internal-control' };
  }

  if (selectionSource === 'partial-dom-backed') {
    return { kind: 'partial-dom', reason: 'partial-dom-backed' };
  }

  if (eventFamily === 'selectionchange' && ownership === 'native-allowed') {
    return { kind: 'import-dom', reason: 'native-selection' };
  }

  if (ownership === 'model-owned') {
    return { kind: 'preserve-model', reason: 'model-owned' };
  }

  return { kind: 'none', reason: 'not-requested' };
};

export const getEditableRepairPolicy = ({
  repair,
}: Pick<EditableKernelTraceEntry, 'repair'>): EditableRepairPolicy => {
  if (!repair || repair.kind === 'none' || repair.kind === 'skip-dom-sync') {
    return { kind: 'none', reason: 'not-requested' };
  }

  if (repair.kind === 'force-render') {
    return { kind: 'force-render', reason: 'force-render' };
  }

  if (repair.kind === 'sync-selection') {
    return { kind: 'sync-selection', reason: 'sync-selection' };
  }

  if (repair.kind === 'repair-caret-after-text-insert') {
    return {
      kind: 'repair-caret',
      reason: 'repair-caret-after-text-insert',
    };
  }

  return { kind: 'repair-caret', reason: 'repair-caret' };
};

export const createEditableKernelTraceEntry = ({
  editor,
  trace,
}: {
  editor: Editor;
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
    operations:
      trace.operations ?? editor.read((state) => [...state.value.operations()]),
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
  editor: Editor;
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

const getBeforeInputFormatCommand = (
  inputType: string
): EditableCommand | null => {
  switch (inputType) {
    case 'formatBold':
      return { format: 'bold', kind: 'format' };
    case 'formatItalic':
      return { format: 'italic', kind: 'format' };
    case 'formatUnderline':
      return { format: 'underline', kind: 'format' };
    case 'formatStrikeThrough':
      return { format: 'strikethrough', kind: 'format' };
    default:
      return inputType.startsWith('format')
        ? {
            format:
              inputType.charAt('format'.length).toLowerCase() +
              inputType.slice('format'.length + 1),
            kind: 'format',
          }
        : null;
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
  if (inputType.startsWith('format')) {
    return getBeforeInputFormatCommand(inputType);
  }
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
  if (Hotkeys.isBold(nativeEvent)) {
    return { format: 'bold', kind: 'format' };
  }
  if (Hotkeys.isItalic(nativeEvent)) {
    return { format: 'italic', kind: 'format' };
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
  const shouldPreserveProjectedViewSelection =
    !internalTarget &&
    intent !== 'composition' &&
    readSlateViewSelection(editor) !== null;
  const ownership: EditableOwnership =
    intent === 'internal-control'
      ? 'app-owned'
      : intent === 'composition'
        ? 'native-allowed'
        : intent === 'native-selection-move'
          ? 'native-allowed'
          : intent
            ? 'model-owned'
            : 'no-op';

  const shouldForceDOMImport =
    intent === 'delete' ||
    intent === 'format' ||
    intent === 'insert-break' ||
    intent === 'model-selection-move';
  const authoritativeModelSelection = hasAuthoritativeModelSelection({
    inputController,
  });
  const shouldPreserveModelSelection =
    intent === 'history' ||
    (authoritativeModelSelection &&
      (ownership === 'model-owned' ||
        intent === 'text-insert' ||
        intent === null));
  const shouldApplyForcedDOMImport =
    shouldForceDOMImport && !shouldPreserveModelSelection;

  return {
    command,
    intent,
    internalTarget,
    nativeAllowed: ownership === 'native-allowed',
    ownership,
    selectionBefore,
    selectionPolicy: internalTarget
      ? { kind: 'none', reason: 'internal-control' }
      : intent === 'composition'
        ? { kind: 'none', reason: 'not-requested' }
        : shouldPreserveProjectedViewSelection || shouldPreserveModelSelection
          ? { kind: 'preserve-model', reason: 'model-owned' }
          : {
              kind: 'import-dom',
              reason: shouldApplyForcedDOMImport
                ? 'unknown-selection'
                : 'native-selection',
            },
    selectionSourceTransition:
      intent === 'native-selection-move' &&
      !shouldPreserveProjectedViewSelection
        ? {
            preferModelSelection: false,
            reason: 'native-selection-move',
            selectionSource: 'dom-current',
          }
        : intent === 'history' && shouldPreserveModelSelection
          ? {
              preferModelSelection: true,
              reason: 'model-command',
              selectionSource: 'model-owned',
            }
          : null,
    shouldForceDOMImport: shouldApplyForcedDOMImport,
    stateBefore: mapSelectionSourceToKernelState(
      inputController.state.selectionSource
    ),
    targetOwner,
  };
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
  const ownership: EditableOwnership =
    intent === 'internal-control'
      ? 'app-owned'
      : intent === 'native-selection-move'
        ? 'native-allowed'
        : intent
          ? 'model-owned'
          : 'no-op';
  const shouldPreserveProjectedViewSelection =
    targetOwner !== 'internal-control' &&
    ownership === 'model-owned' &&
    readSlateViewSelection(editor) !== null;
  const shouldPreserveModelSelection =
    ownership === 'model-owned' &&
    hasAuthoritativeModelSelection({ inputController });

  return {
    command: getEditableCommandFromBeforeInput({
      event,
      selection: selectionBefore,
    }),
    intent,
    internalTarget,
    nativeAllowed: ownership === 'native-allowed',
    ownership,
    selectionBefore,
    selectionPolicy:
      targetOwner === 'internal-control'
        ? { kind: 'none', reason: 'internal-control' }
        : shouldPreserveProjectedViewSelection || shouldPreserveModelSelection
          ? { kind: 'preserve-model', reason: 'model-owned' }
          : ownership === 'model-owned'
            ? { kind: 'import-dom', reason: 'unknown-selection' }
            : { kind: 'none', reason: 'not-requested' },
    selectionSourceTransition: null,
    stateBefore: mapSelectionSourceToKernelState(
      inputController.state.selectionSource
    ),
    targetOwner,
  };
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
  const ownership: EditableOwnership =
    intent === 'internal-control' ? 'app-owned' : 'model-owned';

  return {
    intent,
    internalTarget,
    nativeAllowed: false,
    ownership,
    selectionBefore: readLiveSelection(editor),
    stateBefore: mapSelectionSourceToKernelState(
      inputController.state.selectionSource
    ),
    targetOwner,
  };
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
  const ownership: EditableOwnership =
    intent === 'internal-control' ? 'app-owned' : 'native-allowed';

  return {
    intent,
    internalTarget,
    nativeAllowed: ownership === 'native-allowed',
    ownership,
    repairPolicy: { kind: 'none', reason: 'not-requested' },
    selectionBefore: readLiveSelection(editor),
    selectionPolicy: internalTarget
      ? { kind: 'none', reason: 'internal-control' }
      : { kind: 'none', reason: 'not-requested' },
    stateBefore: mapSelectionSourceToKernelState(
      inputController.state.selectionSource
    ),
    targetOwner,
  };
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
  const ownership: EditableOwnership = internalTarget
    ? 'app-owned'
    : targetOwner === 'editor'
      ? 'native-allowed'
      : 'no-op';

  return {
    intent: null,
    internalTarget,
    nativeAllowed: ownership === 'native-allowed',
    ownership,
    selectionBefore: readLiveSelection(editor),
    stateBefore: mapSelectionSourceToKernelState(
      inputController.state.selectionSource
    ),
    targetOwner,
  };
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
  const ownership: EditableOwnership =
    intent === 'internal-control'
      ? 'app-owned'
      : intent
        ? 'model-owned'
        : 'deferred';

  return {
    intent,
    internalTarget,
    nativeAllowed: false,
    ownership,
    selectionBefore: readLiveSelection(editor),
    stateBefore: mapSelectionSourceToKernelState(
      inputController.state.selectionSource
    ),
    targetOwner,
  };
};
