import type { Range } from '@platejs/plite';
import { DOMRootRuntime } from '@platejs/plite-dom/internal';

// React only adapts canonical editor commands to the private per-root epoch.
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
import type { AnyEditor } from './runtime-editor-api';

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

export const isDestructiveEditableCommand = (
  command: EditableCommand | null
): command is DestructiveEditableCommand =>
  DOMRootRuntime.isDestructiveInputCommand(command);

export const isEditableEditingEpochCommand = (
  command: EditableCommand | null
): command is EditableEditingEpochCommand =>
  DOMRootRuntime.isInputEditingEpochCommand(command);

const getInputRuntime = (editor: AnyEditor) =>
  DOMRootRuntime.resolveInputRuntime(editor);

export const getCurrentEditableEditingEpoch = (
  editor: AnyEditor
): EditableEditingEpoch | null =>
  getInputRuntime(editor).currentEditingEpoch() as EditableEditingEpoch | null;

export const beginEditableEditingEpoch = (
  editor: AnyEditor,
  input: EditableEditingEpochInput
): EditableEditingEpoch =>
  getInputRuntime(editor).beginCommandEditingEpoch({
    command: input.command,
    modelSelectionBefore: input.modelSelectionBefore ?? null,
    ownership: input.ownership,
    rootEventFamily: input.rootEventFamily,
    rootIntent: input.rootIntent ?? null,
    selectionSource: input.selectionSource,
    startedAt: input.startedAt,
    targetOwner: input.targetOwner,
  });

export const endEditableEditingEpoch = (
  editor: AnyEditor
): EditableEditingEpoch | null =>
  getInputRuntime(editor).endEditingEpoch() as EditableEditingEpoch | null;

export const markEditableEditingEpochCommandHandled = (
  editor: AnyEditor,
  command: EditableCommand | null
) => {
  if (command) {
    getInputRuntime(editor).markCommandEditingEpochHandled(command);
  }
};

export const shouldSkipDuplicateEditableEditingEpochCommand = (
  editor: AnyEditor,
  command: EditableCommand | null
) => getInputRuntime(editor).shouldSkipCommandEditingEpoch(command);

export const completeDuplicateEditableEditingEpochCommand = (
  editor: AnyEditor,
  command: EditableCommand | null
) => getInputRuntime(editor).completeDuplicateCommandEditingEpoch(command);

export const beginOrJoinEditableEditingEpoch = (
  editor: AnyEditor,
  input: EditableEditingEpochInput
): EditableEditingEpoch | null =>
  getInputRuntime(editor).beginOrJoinCommandEditingEpoch({
    command: input.command,
    modelSelectionBefore: input.modelSelectionBefore ?? null,
    ownership: input.ownership,
    rootEventFamily: input.rootEventFamily,
    rootIntent: input.rootIntent ?? null,
    selectionSource: input.selectionSource,
    startedAt: input.startedAt,
    targetOwner: input.targetOwner,
  });

export const getEditableEditingEpochForTrace = (
  editor: AnyEditor,
  trace: EditableEditingEpochTraceInput
): EditableEditingEpoch | null =>
  getInputRuntime(editor).editingEpochForCommandTrace({
    command: trace.command,
    eventFamily: trace.eventFamily,
    ownership: trace.ownership,
    selectionChangeOrigin: trace.selectionChangeOrigin,
  }) as EditableEditingEpoch | null;

export const closeEditableEditingEpochAfterTrace = (
  editor: AnyEditor,
  trace: EditableEditingEpochTraceInput & { epochId: number | null }
) => {
  getInputRuntime(editor).closeCommandEditingEpochAfterTrace({
    command: trace.command,
    epochId: trace.epochId,
    eventFamily: trace.eventFamily,
    ownership: trace.ownership,
    selectionChangeOrigin: trace.selectionChangeOrigin,
  });
};
