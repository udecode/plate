import type { InputEvent as ReactInputEvent, RefObject } from 'react';
import { type Range, RangeApi } from '@platejs/plite';
import { getSelection, isDOMElement, isDOMText } from '@platejs/plite-dom';
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager';
import { getPliteNodePathFromDOMElement } from '../hooks/use-plite-node-ref';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { commitInsertFromComposition } from './composition-state';
import { isDataTransferInput } from './dom-input-event';
import {
  type EditableCommand,
  getEditableCommandFromBeforeInputType,
} from './editing-kernel';
import type {
  EditableCompositionStateSetter,
  EditableRepairRequest,
} from './input-controller';
import {
  applyEditableCommand,
  applyModelOwnedDataTransferInput,
  applyModelOwnedNativeHistoryEvent,
  applyModelOwnedTextInput,
} from './mutation-controller';
import { readRuntimeText } from './runtime-live-state';

export {
  applyModelOwnedHistoryIntent,
  applyModelOwnedNativeHistoryEvent,
  shouldForceRenderAfterModelOwnedHistory,
} from './mutation-controller';

type RefBox<T> = {
  current: T;
};

export type DeferredOperation = () => void;

type EditableInputHandler = (
  event: ReactInputEvent<HTMLDivElement>
) => boolean | void;

export type EditableInputResult = {
  repairs: EditableRepairRequest[];
};

const inputResult = (repairs: EditableRepairRequest[] = []) => ({ repairs });

const isInputEventHandled = ({
  event,
  handler,
}: {
  event: ReactInputEvent<HTMLDivElement>;
  handler?: EditableInputHandler;
}) => {
  if (!handler) {
    return false;
  }

  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event);

  if (shouldTreatEventAsHandled != null) {
    return shouldTreatEventAsHandled;
  }

  return event.isDefaultPrevented() || event.isPropagationStopped();
};

export const applyEditableInput = ({
  androidInputManagerRef,
  deferredOperations,
  editor,
  event,
  handledDOMBeforeInputRef,
  inputController,
  onInput,
  readOnly = false,
  skipNativeTextInputRepair = false,
}: {
  androidInputManagerRef: RefObject<AndroidInputManager | null | undefined>;
  deferredOperations: RefBox<DeferredOperation[]>;
  editor: ReactRuntimeEditor;
  event: ReactInputEvent<HTMLDivElement>;
  handledDOMBeforeInputRef: RefBox<boolean>;
  inputController: import('./input-controller').EditableInputController;
  onInput?: EditableInputHandler;
  readOnly?: boolean;
  skipNativeTextInputRepair?: boolean;
}): EditableInputResult => {
  if (isInputEventHandled({ event, handler: onInput })) {
    return inputResult();
  }

  if (androidInputManagerRef.current) {
    androidInputManagerRef.current.handleInput();
    return inputResult();
  }

  if (
    skipNativeTextInputRepair &&
    !readOnly &&
    deferredOperations.current.length === 0
  ) {
    handledDOMBeforeInputRef.current = false;
    return inputResult();
  }

  const repairs: EditableRepairRequest[] = [];
  const modelText = editor.read((state) => state.text.string([]));
  const domText =
    event.currentTarget.textContent?.replace(/\uFEFF/g, '') ?? modelText;

  if (readOnly) {
    handledDOMBeforeInputRef.current = false;

    return inputResult(
      domText === modelText ? [] : [{ forceRender: true, kind: 'force-render' }]
    );
  }

  // Flush native operations, as native events will have propogated
  // and we can correctly compare DOM text values in components
  // to stop rendering, so that browser functions like autocorrect
  // and spellcheck work as expected.
  const hadDeferredOperations = deferredOperations.current.length > 0;
  for (const operation of deferredOperations.current) {
    operation();
  }
  deferredOperations.current = [];
  if (hadDeferredOperations) {
    repairs.push({
      focus: true,
      kind: 'repair-caret',
      selectionSourceTransition: {
        preferModelSelection: true,
        reason: 'model-command',
        selectionSource: 'model-owned',
      },
    });
  }

  const nativeInput = event.nativeEvent as InputEvent;
  const isModelOwnedTextInputGuardActive =
    (inputController.state.modelOwnedTextInputGuard ?? 0) > 0;
  const modelOwnsTextInput =
    isModelOwnedTextInputGuardActive ||
    (inputController.preferModelSelectionForInputRef.current &&
      inputController.state.selectionSource === 'model-owned');

  if (
    !skipNativeTextInputRepair &&
    !hadDeferredOperations &&
    !modelOwnsTextInput &&
    nativeInput.inputType === 'insertText' &&
    typeof nativeInput.data === 'string' &&
    nativeInput.data.length > 0 &&
    domText !== modelText
  ) {
    const root = ReactEditor.findDocumentOrShadowRoot(editor);
    const domSelection = getSelection(root);
    const anchorNode = domSelection?.anchorNode ?? null;
    const anchorOffset = domSelection?.anchorOffset ?? null;
    const textHost = isDOMText(anchorNode)
      ? anchorNode.parentElement?.closest('[data-plite-node="text"]')
      : isDOMElement(anchorNode)
        ? anchorNode.closest('[data-plite-node="text"]')
        : null;
    const path = textHost ? getPliteNodePathFromDOMElement(textHost) : null;
    const pliteNode = path ? readRuntimeText(editor, path) : null;

    if (pliteNode && anchorOffset != null && path) {
      const offset = Math.max(
        0,
        Math.min(pliteNode.text.length, anchorOffset - nativeInput.data.length)
      );

      applyEditableCommand({
        command: {
          kind: 'select',
          selection: {
            anchor: { path, offset },
            focus: { path, offset },
          },
        },
        editor,
      });
    }

    applyEditableCommand({
      command: {
        inputType: nativeInput.inputType,
        kind: 'insert-text',
        text: nativeInput.data,
      },
      editor,
    });
    repairs.push({
      focus: true,
      kind: 'repair-caret',
      selectionSourceTransition: {
        preferModelSelection: true,
        reason: 'model-command',
        selectionSource: 'model-owned',
      },
    });
  }

  handledDOMBeforeInputRef.current = false;

  // COMPAT: Since `beforeinput` doesn't fully `preventDefault`,
  // there's a chance that content might be placed in the browser's undo stack.
  // This means undo can be triggered even when the div is not focused,
  // and it only triggers the input event for the node. (2024/10/09)
  if (
    !ReactEditor.isFocused(editor) &&
    applyModelOwnedNativeHistoryEvent({
      editor,
      event: event.nativeEvent as InputEvent,
      readOnly,
    })
  ) {
    repairs.push({ forceRender: true, kind: 'force-render' });
  }

  return inputResult(repairs);
};

export const applyModelOwnedBeforeInputOperation = ({
  command: preparedCommand,
  data,
  deferredOperations,
  editor,
  inputType: type,
  native,
  selection,
  setComposing,
}: {
  command?: EditableCommand | null;
  data: unknown;
  deferredOperations: RefBox<DeferredOperation[]>;
  editor: ReactRuntimeEditor;
  inputType: string;
  native: boolean;
  selection: Range | null;
  setComposing: EditableCompositionStateSetter;
}): EditableRepairRequest | null => {
  const parsedCommand = () =>
    getEditableCommandFromBeforeInputType({
      data,
      inputType: type,
      selection,
    });
  const command =
    preparedCommand === undefined || type.startsWith('delete')
      ? (parsedCommand() ?? preparedCommand ?? null)
      : preparedCommand;

  switch (type) {
    case 'deleteByComposition':
    case 'deleteByCut':
    case 'deleteByDrag':
    case 'deleteContent':
    case 'deleteContentForward':
    case 'deleteContentBackward':
    case 'deleteEntireSoftLine':
    case 'deleteHardLineBackward':
    case 'deleteSoftLineBackward':
    case 'deleteHardLineForward':
    case 'deleteSoftLineForward':
    case 'deleteWordBackward':
    case 'deleteWordForward': {
      if (command) {
        applyEditableCommand({ command, editor });
      }
      return {
        focus: true,
        forceRender: true,
        kind: 'repair-caret',
        selectionSourceTransition: {
          preferModelSelection: true,
          reason: 'model-command',
          selectionSource: 'model-owned',
        },
      };
    }

    case 'insertLineBreak':
    case 'insertParagraph': {
      if (command) {
        applyEditableCommand({ command, editor });
      }
      return {
        focus: true,
        forceRender: true,
        kind: 'repair-caret',
        selectionSourceTransition: {
          preferModelSelection: true,
          reason: 'model-command',
          selectionSource: 'model-owned',
        },
      };
    }

    case 'insertTranspose': {
      if (
        command?.kind === 'transpose-character' &&
        applyEditableCommand({ command, editor })
      ) {
        return {
          focus: true,
          kind: 'repair-caret',
          selectionSourceTransition: {
            preferModelSelection: true,
            reason: 'model-command',
            selectionSource: 'model-owned',
          },
        };
      }
      break;
    }

    case 'insertFromComposition':
    case 'insertFromDrop':
    case 'insertFromPaste':
    case 'insertFromYank':
    case 'insertReplacementText':
    case 'insertText': {
      if (type === 'insertFromComposition' && ReactEditor.isComposing(editor)) {
        commitInsertFromComposition({
          setComposing,
        });
      }

      // use a weak comparison instead of 'instanceof' to allow
      // programmatic access of paste events coming from external windows
      // like cypress where cy.window does not work realibly
      if (command?.kind === 'insert-data') {
        applyModelOwnedDataTransferInput({ data: command.data, editor });
        return { kind: 'repair-caret' };
      }
      if (isDataTransferInput(data)) {
        applyModelOwnedDataTransferInput({ data, editor });
        return { kind: 'repair-caret' };
      }
      const textCommand =
        command?.kind === 'insert-text'
          ? command
          : typeof data === 'string'
            ? ({ inputType: type, kind: 'insert-text', text: data } as const)
            : null;

      if (textCommand) {
        // Native ownership is limited to insertText. Single-character deletes
        // need their own browser contract before joining this path.
        if (native && (!selection || !RangeApi.isExpanded(selection))) {
          return null;
        }
        return applyModelOwnedTextInput({
          data: textCommand.text,
          editor,
          inputType: textCommand.inputType ?? type,
          selection,
        });
      }
    }
  }

  return null;
};
