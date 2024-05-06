import {
  type HTMLAttributes,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {
  Hotkeys,
  findNodePath,
  focusEditor,
  isHotkey,
  removeNodes,
  useEditorRef,
  useElement,
} from '@udecode/plate-common';
import { useSelected } from 'slate-react';

import type {
  CancelComboboxInputCause,
  ComboboxInputCursorState,
} from '../types';

export interface UseComboboxInputOptions {
  ref: RefObject<HTMLElement>;
  autoFocus?: boolean;
  cancelInputOnArrowLeftRight?: boolean;
  cancelInputOnBackspace?: boolean;
  cancelInputOnBlur?: boolean;
  cancelInputOnDeselect?: boolean;
  cancelInputOnEscape?: boolean;
  cursorState?: ComboboxInputCursorState;
  forwardUndoRedoToEditor?: boolean;
  onCancelInput?: (cause: CancelComboboxInputCause) => void;
}

export interface UseComboboxInputResult {
  cancelInput: (
    cause?: CancelComboboxInputCause,
    focusEditor?: boolean
  ) => void;
  props: Required<Pick<HTMLAttributes<HTMLElement>, 'onBlur' | 'onKeyDown'>>;
  removeInput: (focusEditor?: boolean) => void;
}

export const useComboboxInput = ({
  autoFocus = true,
  cancelInputOnArrowLeftRight = true,
  cancelInputOnBackspace = true,
  cancelInputOnBlur = true,
  cancelInputOnDeselect = true,
  cancelInputOnEscape = true,
  cursorState,
  forwardUndoRedoToEditor = true,
  onCancelInput,
  ref,
}: UseComboboxInputOptions): UseComboboxInputResult => {
  const editor = useEditorRef();
  const element = useElement();
  const selected = useSelected();

  const cursorAtStart = cursorState?.atStart ?? false;
  const cursorAtEnd = cursorState?.atEnd ?? false;

  const removeInput = useCallback(
    (shouldFocusEditor = false) => {
      const path = findNodePath(editor, element);

      if (!path) return;

      removeNodes(editor, { at: path });

      if (shouldFocusEditor) {
        focusEditor(editor);
      }
    },
    [editor, element]
  );

  const cancelInput = useCallback(
    (cause: CancelComboboxInputCause = 'manual', shouldFocusEditor = false) => {
      removeInput(shouldFocusEditor);
      onCancelInput?.(cause);
    },
    [onCancelInput, removeInput]
  );

  /**
   * Using autoFocus on the input element causes an error: Cannot resolve a
   * Slate node from DOM node: [object HTMLSpanElement]
   */
  useEffect(() => {
    if (autoFocus) {
      ref.current?.focus();
    }
  }, [autoFocus, ref]);

  /**
   * Storing the previous selection lets us determine whether the input has been
   * actively deselected. When undoing or redoing causes a combobox input to be
   * inserted, selected can be temporarily false. Removing the input at this
   * point is incorrect and crashes the editor.
   */
  const previousSelected = useRef(selected);

  useEffect(() => {
    if (previousSelected.current && !selected && cancelInputOnDeselect) {
      cancelInput('deselect');
    }

    previousSelected.current = selected;
  }, [selected, cancelInputOnDeselect, cancelInput]);

  return {
    cancelInput,
    props: {
      onBlur: () => {
        if (cancelInputOnBlur) {
          cancelInput('blur');
        }
      },
      onKeyDown: (event) => {
        if (cancelInputOnEscape && isHotkey('escape', event)) {
          cancelInput('escape', true);
        }
        if (
          cancelInputOnBackspace &&
          cursorAtStart &&
          isHotkey('backspace', event)
        ) {
          cancelInput('backspace', true);
        }
        if (
          cancelInputOnArrowLeftRight &&
          cursorAtStart &&
          isHotkey('arrowleft', event)
        ) {
          cancelInput('arrowLeft', true);
        }
        if (
          cancelInputOnArrowLeftRight &&
          cursorAtEnd &&
          isHotkey('arrowright', event)
        ) {
          cancelInput('arrowRight', true);
        }

        const isUndo = Hotkeys.isUndo(event) && editor.history.undos.length > 0;
        const isRedo = Hotkeys.isRedo(event) && editor.history.redos.length > 0;

        if (forwardUndoRedoToEditor && (isUndo || isRedo)) {
          event.preventDefault();
          editor[isUndo ? 'undo' : 'redo']();
          focusEditor(editor);
        }
      },
    },
    removeInput,
  };
};
