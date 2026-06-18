import type { Editor, Range } from '@platejs/slate';

import type {
  EditableBrowserEventFamily,
  EditableCommand,
  EditableEventTargetOwner,
  EditableOwnership,
} from './editing-kernel';
import type {
  InputIntent,
  SelectionChangeOrigin,
  SelectionSource,
} from './input-state';

export type EditableEditingEpochKind = 'destructive' | 'model-command';

export type EditableEditingEpoch = {
  active: boolean;
  command: EditableCommand | null;
  handledCommand: EditableCommand | null;
  id: number;
  kind: EditableEditingEpochKind;
  modelSelectionBefore: Range | null;
  ownership: EditableOwnership;
  rootEventFamily: EditableBrowserEventFamily;
  rootIntent: InputIntent | null;
  selectionSource: SelectionSource;
  startedAt: number;
  targetOwner: EditableEventTargetOwner;
};

export type EditableEditingEpochInput = {
  command: EditableCommand | null;
  modelSelectionBefore?: Range | null;
  ownership: EditableOwnership;
  rootEventFamily: EditableBrowserEventFamily;
  rootIntent?: InputIntent | null;
  selectionSource: SelectionSource;
  startedAt?: number;
  targetOwner: EditableEventTargetOwner;
};

export type EditableEditingEpochTraceInput = {
  command: EditableCommand | null;
  eventFamily: EditableBrowserEventFamily;
  ownership: EditableOwnership;
  selectionChangeOrigin?: SelectionChangeOrigin;
};

type DestructiveEditableCommand = Extract<
  EditableCommand,
  { kind: 'delete' } | { kind: 'delete-both' } | { kind: 'delete-fragment' }
>;

type EditableEditingEpochCommand = Extract<
  EditableCommand,
  DestructiveEditableCommand | { kind: 'insert-break' }
>;

const EDITOR_TO_CURRENT_EDITING_EPOCH = new WeakMap<
  Editor,
  EditableEditingEpoch
>();
const EDITOR_TO_NEXT_EDITING_EPOCH_ID = new WeakMap<Editor, number>();

export const isDestructiveEditableCommand = (
  command: EditableCommand | null
): command is DestructiveEditableCommand => {
  if (!command) {
    return false;
  }

  return (
    command.kind === 'delete' ||
    command.kind === 'delete-both' ||
    command.kind === 'delete-fragment'
  );
};

export const isEditableEditingEpochCommand = (
  command: EditableCommand | null
): command is EditableEditingEpochCommand =>
  isDestructiveEditableCommand(command) || command?.kind === 'insert-break';

const getEditableEditingEpochKind = (
  command: EditableCommand | null
): EditableEditingEpochKind =>
  isDestructiveEditableCommand(command) ? 'destructive' : 'model-command';

const nextEditingEpochId = (editor: Editor) => {
  const id = EDITOR_TO_NEXT_EDITING_EPOCH_ID.get(editor) ?? 1;

  EDITOR_TO_NEXT_EDITING_EPOCH_ID.set(editor, id + 1);

  return id;
};

export const getCurrentEditableEditingEpoch = (
  editor: Editor
): EditableEditingEpoch | null =>
  EDITOR_TO_CURRENT_EDITING_EPOCH.get(editor) ?? null;

export const beginEditableEditingEpoch = (
  editor: Editor,
  input: EditableEditingEpochInput
): EditableEditingEpoch => {
  const epoch: EditableEditingEpoch = {
    active: true,
    command: input.command,
    handledCommand: null,
    id: nextEditingEpochId(editor),
    kind: getEditableEditingEpochKind(input.command),
    modelSelectionBefore: input.modelSelectionBefore ?? null,
    ownership: input.ownership,
    rootEventFamily: input.rootEventFamily,
    rootIntent: input.rootIntent ?? null,
    selectionSource: input.selectionSource,
    startedAt: input.startedAt ?? Date.now(),
    targetOwner: input.targetOwner,
  };

  EDITOR_TO_CURRENT_EDITING_EPOCH.set(editor, epoch);

  return epoch;
};

export const endEditableEditingEpoch = (
  editor: Editor
): EditableEditingEpoch | null => {
  const epoch = getCurrentEditableEditingEpoch(editor);

  if (!epoch) {
    return null;
  }

  const inactiveEpoch = { ...epoch, active: false };
  EDITOR_TO_CURRENT_EDITING_EPOCH.set(editor, inactiveEpoch);

  return inactiveEpoch;
};

const canTraceJoinEditableEditingEpoch = (
  epoch: EditableEditingEpoch,
  trace: EditableEditingEpochTraceInput
): boolean => {
  if (!epoch.active) {
    return false;
  }

  if (!isEditableEditingEpochCommand(epoch.command)) {
    return false;
  }

  if (trace.eventFamily === epoch.rootEventFamily) {
    return true;
  }

  if (
    trace.eventFamily === 'beforeinput' &&
    areEditableEditingEpochCommandsEquivalent(epoch.command, trace.command)
  ) {
    return true;
  }

  if (trace.eventFamily === 'input' && trace.ownership === 'model-owned') {
    return true;
  }

  if (trace.eventFamily === 'repair' && trace.ownership === 'model-owned') {
    return true;
  }

  return (
    trace.eventFamily === 'selectionchange' &&
    (trace.selectionChangeOrigin === 'repair-induced' ||
      trace.selectionChangeOrigin === 'programmatic-export')
  );
};

const areEditableEditingEpochCommandsEquivalent = (
  left: EditableCommand | null,
  right: EditableCommand | null
) => {
  if (
    !isEditableEditingEpochCommand(left) ||
    !isEditableEditingEpochCommand(right)
  ) {
    return false;
  }

  if (left.kind !== right.kind) {
    return false;
  }

  if (left.kind === 'insert-break' && right.kind === 'insert-break') {
    return left.variant === right.variant;
  }

  if (left.kind === 'delete' && right.kind === 'delete') {
    return left.direction === right.direction && left.unit === right.unit;
  }

  if (left.kind === 'delete-fragment' && right.kind === 'delete-fragment') {
    return left.direction === right.direction;
  }

  return left.kind === 'delete-both' && right.kind === 'delete-both'
    ? left.unit === right.unit
    : true;
};

export const markEditableEditingEpochCommandHandled = (
  editor: Editor,
  command: EditableCommand | null
) => {
  if (!isEditableEditingEpochCommand(command)) {
    return;
  }

  const epoch = getCurrentEditableEditingEpoch(editor);

  if (
    !epoch?.active ||
    !canTraceJoinEditableEditingEpoch(epoch, {
      command,
      eventFamily: epoch.rootEventFamily,
      ownership: 'model-owned',
    })
  ) {
    return;
  }

  EDITOR_TO_CURRENT_EDITING_EPOCH.set(editor, {
    ...epoch,
    handledCommand: command,
  });
};

export const shouldSkipDuplicateEditableEditingEpochCommand = (
  editor: Editor,
  command: EditableCommand | null
) => {
  const epoch = getCurrentEditableEditingEpoch(editor);

  return Boolean(
    epoch?.active &&
      areEditableEditingEpochCommandsEquivalent(epoch.handledCommand, command)
  );
};

export const completeDuplicateEditableEditingEpochCommand = (
  editor: Editor,
  command: EditableCommand | null
) => {
  if (!shouldSkipDuplicateEditableEditingEpochCommand(editor, command)) {
    return false;
  }

  endEditableEditingEpoch(editor);

  return true;
};

export const beginOrJoinEditableEditingEpoch = (
  editor: Editor,
  input: EditableEditingEpochInput
): EditableEditingEpoch | null => {
  if (!isEditableEditingEpochCommand(input.command)) {
    return null;
  }

  const current = getCurrentEditableEditingEpoch(editor);

  if (
    current &&
    canTraceJoinEditableEditingEpoch(current, {
      command: input.command,
      eventFamily: input.rootEventFamily,
      ownership: input.ownership,
    })
  ) {
    return current;
  }

  return beginEditableEditingEpoch(editor, input);
};

export const getEditableEditingEpochForTrace = (
  editor: Editor,
  trace: EditableEditingEpochTraceInput
): EditableEditingEpoch | null => {
  const epoch = getCurrentEditableEditingEpoch(editor);

  if (!epoch || !canTraceJoinEditableEditingEpoch(epoch, trace)) {
    return null;
  }

  return epoch;
};

export const closeEditableEditingEpochAfterTrace = (
  editor: Editor,
  trace: EditableEditingEpochTraceInput & { epochId: number | null }
) => {
  if (
    trace.epochId === null ||
    trace.eventFamily !== 'selectionchange' ||
    (trace.selectionChangeOrigin !== 'repair-induced' &&
      trace.selectionChangeOrigin !== 'programmatic-export')
  ) {
    return;
  }

  endEditableEditingEpoch(editor);
};
