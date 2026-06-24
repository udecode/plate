import type { RefObject } from 'react';
import type { Range } from '@platejs/plite';
import type { DOMElement } from '@platejs/plite-dom';

export type InputIntent =
  | 'clipboard'
  | 'composition'
  | 'delete'
  | 'format'
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

export type EditableInputControllerState = {
  activeIntent: InputIntent | null;
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

export type EditableInputController = {
  preferModelSelectionForInputRef: RefObject<boolean>;
  state: EditableInputControllerState;
};

export const createEditableInputControllerState =
  (): EditableInputControllerState => ({
    activeIntent: null,
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
    pendingNativeTextInputRepairSuppressedDOMSelection: false,
    pendingNativeTextInputRepairOffset: null,
    pendingNativeTextInputRepairPathKey: null,
    recentTextInputRepairEcho: null,
    repairInducedSelectionOriginVersion: 0,
    selectionChangeOrigin: null,
    selectionSource: 'unknown',
  });

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
  preferModelSelectionForInputRef,
  state,
}: EditableInputController): EditableInputController => ({
  preferModelSelectionForInputRef,
  state,
});
