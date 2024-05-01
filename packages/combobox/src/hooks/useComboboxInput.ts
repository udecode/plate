import { HTMLAttributes, RefObject, useCallback, useEffect } from 'react';
import {
  findNodePath,
  focusEditor,
  isHotkey,
  removeNodes,
  useEditorRef,
  useElement,
} from '@udecode/plate-common';
import { useSelected } from 'slate-react';

import { CancelComboboxInputCause, ComboboxInputCursorState } from '../types';

export interface UseComboboxInputOptions {
  ref: RefObject<HTMLElement>;
  cursorState?: ComboboxInputCursorState;
  autoFocus?: boolean;
  cancelInputOnEscape?: boolean;
  cancelInputOnBackspace?: boolean;
  cancelInputOnArrowLeftRight?: boolean;
  cancelInputOnDeselect?: boolean;
  cancelInputOnBlur?: boolean;
  onCancelInput?: (cause: CancelComboboxInputCause) => void;
}

export interface UseComboboxInputResult {
  removeInput: (focusEditor?: boolean) => void;
  cancelInput: (
    cause?: CancelComboboxInputCause,
    focusEditor?: boolean
  ) => void;
  props: Required<Pick<HTMLAttributes<HTMLElement>, 'onKeyDown' | 'onBlur'>>;
}

export const useComboboxInput = ({
  ref,
  cursorState,
  autoFocus = true,
  cancelInputOnEscape = true,
  cancelInputOnBackspace = true,
  cancelInputOnArrowLeftRight = true,
  cancelInputOnDeselect = true,
  cancelInputOnBlur = true,
  onCancelInput,
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
   * Using autoFocus on the input element causes an error:
   * Cannot resolve a Slate node from DOM node: [object HTMLSpanElement]
   */
  useEffect(() => {
    if (autoFocus) {
      ref.current?.focus();
    }
  }, [autoFocus, ref]);

  useEffect(() => {
    if (!selected && cancelInputOnDeselect) {
      cancelInput('deselect');
    }
  }, [selected, cancelInputOnDeselect, cancelInput]);

  return {
    removeInput,
    cancelInput,
    props: {
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
      },
      onBlur: () => {
        if (cancelInputOnBlur) {
          cancelInput('blur');
        }
      },
    },
  };
};
