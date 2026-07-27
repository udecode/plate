import {
  type HTMLAttributes,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Hotkeys, isHotkey } from '@platejs/core';
import { useEditor, useElement, useElementSelected } from '@platejs/core/react';

export type CancelComboboxInputCause =
  | 'arrowLeft'
  | 'arrowRight'
  | 'backspace'
  | 'blur'
  | 'deselect'
  | 'escape'
  | 'manual';

export type ComboboxInputCursorState = {
  atEnd: boolean;
  atStart: boolean;
};

export type UseComboboxInputOptions = {
  ref: RefObject<HTMLElement | null>;
  autoFocus?: boolean;
  cancelInputOnArrowLeftRight?: boolean;
  cancelInputOnBackspace?: boolean;
  cancelInputOnBlur?: boolean;
  cancelInputOnDeselect?: boolean;
  cancelInputOnEscape?: boolean;
  cursorState?: ComboboxInputCursorState;
  forwardUndoRedoToEditor?: boolean;
  onCancelInput?: (cause: CancelComboboxInputCause) => void;
};

export type UseComboboxInputResult = {
  props: Required<Pick<HTMLAttributes<HTMLElement>, 'onBlur' | 'onKeyDown'>>;
  cancelInput: (
    cause?: CancelComboboxInputCause,
    focusEditor?: boolean
  ) => void;
  removeInput: (focusEditor?: boolean) => void;
};

export const useComboboxInput = ({
  autoFocus = true,
  cancelInputOnArrowLeftRight = true,
  cancelInputOnBackspace = true,
  cancelInputOnBlur = true,
  cancelInputOnDeselect = true,
  cancelInputOnEscape = true,
  cursorState,
  forwardUndoRedoToEditor = true,
  ref,
  onCancelInput,
}: UseComboboxInputOptions): UseComboboxInputResult => {
  const editor = useEditor();
  const element = useElement();
  const selected = useElementSelected();

  const cursorAtStart = cursorState?.atStart ?? false;
  const cursorAtEnd = cursorState?.atEnd ?? false;

  const removeInput = useCallback(
    (shouldFocusEditor = false) => {
      editor.update.nodes.remove({ at: element });

      if (shouldFocusEditor) {
        editor.api.dom.focus();
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
        if (cancelInputOnEscape && isHotkey('escape')(event)) {
          cancelInput('escape', true);
        }
        if (
          cancelInputOnBackspace &&
          cursorAtStart &&
          isHotkey('backspace')(event)
        ) {
          cancelInput('backspace', true);
        }
        if (
          cancelInputOnArrowLeftRight &&
          cursorAtStart &&
          isHotkey('arrowleft')(event)
        ) {
          cancelInput('arrowLeft', true);
        }
        if (
          cancelInputOnArrowLeftRight &&
          cursorAtEnd &&
          isHotkey('arrowright')(event)
        ) {
          cancelInput('arrowRight', true);
        }

        const isUndo =
          Hotkeys.isUndo(event) && editor.read.history.undos().length > 0;
        const isRedo =
          Hotkeys.isRedo(event) && editor.read.history.redos().length > 0;

        if (forwardUndoRedoToEditor && (isUndo || isRedo)) {
          event.preventDefault();
          editor.update.history[isUndo ? 'undo' : 'redo']();
          editor.api.dom.focus();
        }
      },
    },
    removeInput,
  };
};

export const useHTMLInputCursorState = (
  ref: RefObject<HTMLInputElement | null>
): ComboboxInputCursorState => {
  const [atStart, setAtStart] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  const recomputeCursorState = useCallback(() => {
    // Wait for the browser to finish updating the selection.
    setTimeout(() => {
      if (!ref.current) return;

      const { selectionEnd, selectionStart, value } = ref.current;
      setAtStart(selectionStart === 0);
      setAtEnd(selectionEnd === value.length);
    });
  }, [ref]);

  useEffect(() => {
    recomputeCursorState();

    const input = ref.current;

    if (!input) return;

    input.addEventListener('input', recomputeCursorState);
    input.addEventListener('selectionchange', recomputeCursorState);

    // Most browsers do not fire selectionchange on inputs, so pointer and
    // keyboard events keep the cursor state current.
    input.addEventListener('keydown', recomputeCursorState);
    input.addEventListener('pointerdown', recomputeCursorState);
    input.addEventListener('pointerup', recomputeCursorState);

    return () => {
      input.removeEventListener('input', recomputeCursorState);
      input.removeEventListener('selectionchange', recomputeCursorState);
      input.removeEventListener('keydown', recomputeCursorState);
      input.removeEventListener('pointerdown', recomputeCursorState);
      input.removeEventListener('pointerup', recomputeCursorState);
    };
  }, [recomputeCursorState, ref]);

  return useMemo(
    () => ({
      atEnd,
      atStart,
    }),
    [atStart, atEnd]
  );
};
