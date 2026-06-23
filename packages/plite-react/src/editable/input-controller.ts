import type {
  ClipboardEvent as ReactClipboardEvent,
  CompositionEvent as ReactCompositionEvent,
  DragEvent as ReactDragEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import type { Editor } from '@platejs/plite';
import { Hotkeys, isDOMElement, isDOMText } from '@platejs/plite-dom';
import { IS_COMPOSING } from '@platejs/plite-dom/internal';

import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import {
  shouldModelOwnPlainVerticalDOMCoverageExtension,
  shouldModelOwnPlainVerticalLargeDocumentExtension,
} from './dom-coverage-vertical-selection';
import type { EditableInputController, InputIntent } from './input-state';

export type {
  EditableInputController,
  EditableInputControllerState,
  InputIntent,
  SelectionChangeOrigin,
  SelectionSource,
} from './input-state';
export {
  createEditableInputController,
  createEditableInputControllerState,
  getEditableInputTimestamp,
  isEditableOutsideFocusBoundarySettling,
} from './input-state';
export {
  applyEditableRepairRequest,
  applyModelOwnedDataTransferInput,
  applyModelOwnedDeleteIntent,
  applyModelOwnedExpandedDelete,
  applyModelOwnedHistoryIntent,
  applyModelOwnedLineBreak,
  applyModelOwnedNativeHistoryEvent,
  applyModelOwnedTextInput,
  type EditableRepairRequest,
} from './mutation-controller';
export {
  applyEditableDOMSelectionChange,
  armModelOwnedTextInputGuard,
  completeEditableSelectionChangeImport,
  type EditableDOMSelectionSyncOptions,
  type EditableSelectionController,
  executeEditableSelectionExport,
  executeEditableSelectionImport,
  isEditableModelSelectionPreferred,
  isEditableModelSelectionPreferredForInput,
  isSelectionInEditorView,
  prepareEditableSelectionChangeImport,
  resolveEditableImplicitTarget,
  setEditableModelSelectionPreference,
  shouldForceModelOwnedTextInput,
  syncEditableDOMSelectionToEditor,
  syncEditorSelectionFromDOM,
} from './selection-controller';

type DocumentBoundaryKeyboardEvent = Pick<
  KeyboardEvent,
  'altKey' | 'ctrlKey' | 'key' | 'metaKey' | 'shiftKey'
>;

export const getDocumentBoundaryKeyboardMove = (
  event: DocumentBoundaryKeyboardEvent
): { extend: boolean; reverse: boolean } | null => {
  if (event.altKey) {
    return null;
  }

  if (event.ctrlKey && !event.metaKey) {
    if (event.key === 'Home') {
      return { extend: event.shiftKey, reverse: true };
    }

    if (event.key === 'End') {
      return { extend: event.shiftKey, reverse: false };
    }
  }

  if (event.metaKey && !event.ctrlKey) {
    if (event.key === 'ArrowUp') {
      return { extend: event.shiftKey, reverse: true };
    }

    if (event.key === 'ArrowDown') {
      return { extend: event.shiftKey, reverse: false };
    }
  }

  return null;
};

export const isNestedEditableDOMTarget = (
  editorElement: HTMLElement,
  target: EventTarget | null
) => {
  const targetElement = isDOMElement(target)
    ? target
    : isDOMText(target)
      ? target.parentElement
      : null;
  const targetEditor = targetElement?.closest('[data-plite-editor="true"]');

  return Boolean(
    targetEditor &&
      targetEditor !== editorElement &&
      editorElement.contains(targetEditor)
  );
};

export const getNestedEditableDOMSelectionRoot = (
  editorElement: HTMLElement
) => {
  const rootNode = editorElement.getRootNode() as Document | ShadowRoot;
  const selection =
    'getSelection' in rootNode
      ? rootNode.getSelection()
      : editorElement.ownerDocument.getSelection();
  const anchorElement = isDOMElement(selection?.anchorNode)
    ? selection.anchorNode
    : isDOMText(selection?.anchorNode)
      ? selection.anchorNode.parentElement
      : null;
  const focusElement = isDOMElement(selection?.focusNode)
    ? selection.focusNode
    : isDOMText(selection?.focusNode)
      ? selection.focusNode.parentElement
      : null;
  const anchorEditor = anchorElement?.closest('[data-plite-editor="true"]');
  const focusEditor = focusElement?.closest('[data-plite-editor="true"]');

  if (
    anchorEditor &&
    anchorEditor === focusEditor &&
    anchorEditor !== editorElement &&
    editorElement.contains(anchorEditor)
  ) {
    return anchorEditor.getAttribute('data-plite-root');
  }

  return null;
};

const getEditorDOMElement = (editor: ReactRuntimeEditor) => {
  try {
    const node = ReactEditor.assertDOMNode(editor, editor);

    return node instanceof HTMLElement ? node : null;
  } catch {
    return null;
  }
};

export const isInteractiveInternalTarget = (
  editor: ReactRuntimeEditor,
  target: EventTarget | null
) => {
  const editorElement = getEditorDOMElement(editor);

  if (!editorElement) {
    return false;
  }

  if (isNestedEditableDOMTarget(editorElement, target)) {
    return true;
  }

  const element = isDOMElement(target)
    ? target
    : isDOMText(target)
      ? target.parentElement
      : null;

  if (!element) {
    return false;
  }

  const control = element.closest(
    'input, textarea, select, button, [role="button"], [data-plite-editor="true"]'
  );

  return (
    control instanceof HTMLElement &&
    control !== editorElement &&
    ReactEditor.hasDOMNode(editor, control) &&
    !ReactEditor.hasEditableTarget(editor, control)
  );
};

export const isNativeInternalControlTarget = (
  editor: ReactRuntimeEditor,
  target: EventTarget | null
) => {
  const editorElement = getEditorDOMElement(editor);
  const element = isDOMElement(target)
    ? target
    : isDOMText(target)
      ? target.parentElement
      : null;

  if (!editorElement || !element) {
    return false;
  }

  const control = element.closest(
    'input, textarea, select, button, [role="button"]'
  );

  return (
    control instanceof HTMLElement &&
    control !== editorElement &&
    ReactEditor.hasDOMNode(editor, control) &&
    !ReactEditor.hasEditableTarget(editor, control)
  );
};

const isPlainTextKeyboardIntent = (event: KeyboardEvent) =>
  event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey;

const MODIFIER_ONLY_KEYS = new Set([
  'Alt',
  'AltGraph',
  'CapsLock',
  'Control',
  'Fn',
  'FnLock',
  'Meta',
  'NumLock',
  'ScrollLock',
  'Shift',
  'Symbol',
  'SymbolLock',
]);

const isModifierOnlyKeyboardIntent = (event: KeyboardEvent) =>
  MODIFIER_ONLY_KEYS.has(event.key);

const isClipboardKeyboardIntent = (event: KeyboardEvent) =>
  !event.altKey &&
  (event.ctrlKey || event.metaKey) &&
  (event.key.toLowerCase() === 'c' ||
    event.key.toLowerCase() === 'v' ||
    event.key.toLowerCase() === 'x');

export const classifyKeyboardIntent = ({
  editor,
  event,
  isComposing = false,
  domStrategyRuntime,
}: {
  editor: ReactRuntimeEditor;
  event: ReactKeyboardEvent<HTMLDivElement>;
  isComposing?: boolean;
  domStrategyRuntime: unknown;
}): InputIntent | null => {
  const { nativeEvent } = event;

  if (isComposing || nativeEvent.isComposing) {
    return 'composition';
  }

  if (Hotkeys.isUndo(nativeEvent) || Hotkeys.isRedo(nativeEvent)) {
    return 'history';
  }

  if (isInteractiveInternalTarget(editor, event.target)) {
    return 'internal-control';
  }

  if (isClipboardKeyboardIntent(nativeEvent)) {
    return 'clipboard';
  }

  if (
    Hotkeys.isSoftBreak(nativeEvent) ||
    Hotkeys.isSplitBlock(nativeEvent) ||
    Hotkeys.isOpenLine(nativeEvent)
  ) {
    return 'insert-break';
  }

  if (
    Hotkeys.isMoveLineBackward(nativeEvent) ||
    Hotkeys.isMoveLineForward(nativeEvent) ||
    Hotkeys.isExtendLineBackward(nativeEvent) ||
    Hotkeys.isExtendLineForward(nativeEvent) ||
    getDocumentBoundaryKeyboardMove(nativeEvent) ||
    shouldModelOwnPlainVerticalLargeDocumentExtension({
      domStrategyRuntime,
      editor,
      event: nativeEvent,
    }) ||
    shouldModelOwnPlainVerticalDOMCoverageExtension({
      editor,
      event: nativeEvent,
    }) ||
    Hotkeys.isExtendBackward(nativeEvent) ||
    Hotkeys.isExtendForward(nativeEvent) ||
    Hotkeys.isMoveBackward(nativeEvent) ||
    Hotkeys.isMoveForward(nativeEvent) ||
    Hotkeys.isExtendWordBackward(nativeEvent) ||
    Hotkeys.isExtendWordForward(nativeEvent) ||
    Hotkeys.isMoveWordBackward(nativeEvent) ||
    Hotkeys.isMoveWordForward(nativeEvent)
  ) {
    return 'model-selection-move';
  }

  if (
    Hotkeys.isDeleteBackward(nativeEvent) ||
    Hotkeys.isDeleteForward(nativeEvent) ||
    Hotkeys.isDeleteLineBackward(nativeEvent) ||
    Hotkeys.isDeleteLineForward(nativeEvent) ||
    Hotkeys.isDeleteWordBackward(nativeEvent) ||
    Hotkeys.isDeleteWordForward(nativeEvent)
  ) {
    return 'delete';
  }

  if (Hotkeys.isBold(nativeEvent) || Hotkeys.isItalic(nativeEvent)) {
    return 'format';
  }

  if (isPlainTextKeyboardIntent(nativeEvent)) {
    return 'text-insert';
  }

  if (isModifierOnlyKeyboardIntent(nativeEvent)) {
    return null;
  }

  return 'native-selection-move';
};

export const classifyBeforeInputIntent = ({
  editor,
  event,
  internalTarget = isInteractiveInternalTarget(editor, event.target),
}: {
  editor: ReactRuntimeEditor;
  event: InputEvent;
  internalTarget?: boolean;
}): InputIntent | null => {
  const { inputType } = event;

  if (inputType === 'historyUndo' || inputType === 'historyRedo') {
    return 'history';
  }

  if (internalTarget) {
    return 'internal-control';
  }

  if (inputType.startsWith('format')) {
    return 'format';
  }

  if (inputType.includes('Composition')) {
    return 'composition';
  }

  if (inputType.includes('Paste') || inputType.includes('Drop')) {
    return 'clipboard';
  }

  if (inputType.startsWith('delete')) {
    return 'delete';
  }

  if (inputType === 'insertLineBreak' || inputType === 'insertParagraph') {
    return 'insert-break';
  }

  if (inputType.startsWith('insert')) {
    return 'text-insert';
  }

  return null;
};

export const classifyClipboardIntent = ({
  editor,
  event,
}: {
  editor: ReactRuntimeEditor;
  event: ReactClipboardEvent<HTMLDivElement> | ReactDragEvent<HTMLDivElement>;
}): InputIntent => {
  if (isInteractiveInternalTarget(editor, event.target)) {
    return 'internal-control';
  }

  return 'clipboard';
};

export const classifyCompositionIntent = ({
  editor,
  event,
}: {
  editor: ReactRuntimeEditor;
  event: ReactCompositionEvent<HTMLDivElement>;
}): InputIntent => {
  if (isInteractiveInternalTarget(editor, event.target)) {
    return 'internal-control';
  }

  return 'composition';
};

export type EditableCompositionStateSetter = (nextValue: boolean) => void;

export const setEditableComposingState = ({
  editor,
  inputController,
  nextValue,
  setIsComposing,
}: {
  editor: ReactRuntimeEditor | Editor;
  inputController: EditableInputController;
  nextValue: boolean;
  setIsComposing: (nextValue: boolean) => void;
}) => {
  inputController.state.isComposing = nextValue;
  if (nextValue) {
    inputController.state.selectionSource = 'composition-owned';
  } else if (inputController.state.selectionSource === 'composition-owned') {
    inputController.state.selectionSource = 'unknown';
  }
  setIsComposing(nextValue);
  IS_COMPOSING.set(editor, nextValue);
};
