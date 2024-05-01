import React, {
  HTMLAttributes,
  RefObject,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  ComboboxProvider,
} from '@ariakit/react';
import { withRef } from '@udecode/cn';
import {
  findNodePath,
  focusEditor,
  insertText,
  isHotkey,
  moveSelection,
  PlateEditor,
  PlateElement,
  removeNodes,
  TElement,
  useEditorRef,
  useElement,
} from '@udecode/plate-common';
import { useSelected } from 'slate-react';

const removeComboboxInput = (editor: PlateEditor, element: TElement) => {
  const path = findNodePath(editor, element);
  if (!path) return;
  removeNodes(editor, { at: path });
};

type ComboboxInputCursorState = {
  atStart: boolean;
  atEnd: boolean;
};

const useHTMLInputCursorState = (
  ref: RefObject<HTMLInputElement>
): ComboboxInputCursorState => {
  const [cursorState, setCursorState] = useState<ComboboxInputCursorState>({
    atStart: false,
    atEnd: false,
  });

  const recomputeCursorState = useCallback(() => {
    if (!ref.current) return;

    const { selectionStart, selectionEnd, value } = ref.current;

    setCursorState({
      atStart: selectionStart === 0,
      atEnd: selectionEnd === value.length,
    });
  }, [ref]);

  useEffect(() => {
    recomputeCursorState();

    const input = ref.current;
    if (!input) return;

    input.addEventListener('input', recomputeCursorState);
    input.addEventListener('selectionchange', recomputeCursorState);

    return () => {
      input.removeEventListener('input', recomputeCursorState);
      input.removeEventListener('selectionchange', recomputeCursorState);
    };
  }, [recomputeCursorState, ref]);

  return cursorState;
};

type CancelComboboxInputCause =
  | 'manual'
  | 'escape'
  | 'backspace'
  | 'arrowLeft'
  | 'arrowRight'
  | 'deselect'
  | 'blur';

interface UseComboboxInputOptions {
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

interface UseComboboxInputResult {
  removeInput: (focusEditor?: boolean) => void;
  cancelInput: (
    cause?: CancelComboboxInputCause,
    focusEditor?: boolean
  ) => void;
  props: Required<Pick<HTMLAttributes<HTMLElement>, 'onKeyDown' | 'onBlur'>>;
}

const useComboboxInput = ({
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
      removeComboboxInput(editor, element);

      if (shouldFocusEditor) {
        setTimeout(() => focusEditor(editor));
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

export const SlashInputElement = withRef<typeof PlateElement>(
  ({ className, ...props }, ref) => {
    const { children, element, editor } = props;
    const inputRef = React.useRef<HTMLInputElement>(null);

    const cursorState = useHTMLInputCursorState(inputRef);

    const [value, setValue] = useState('');

    const { removeInput, props: inputProps } = useComboboxInput({
      ref: inputRef,
      cursorState,
      cancelInputOnBlur: false,
      onCancelInput: (cause) => {
        if (cause !== 'backspace') {
          insertText(editor, '/' + value);
        }

        if (cause === 'arrowLeft' || cause === 'arrowRight') {
          moveSelection(editor, {
            distance: 1,
            reverse: cause === 'arrowLeft',
          });
        }
      },
    });

    return (
      <PlateElement
        as="span"
        ref={ref}
        /**
         * TODO: Check why data-slate-value is present on mention input elements
         * and mention and slash elements.
         */
        data-slate-value={element.value}
        {...props}
      >
        <span contentEditable={false}>
          /
          <ComboboxProvider
            open
            setValue={setValue}
            setSelectedValue={(selectedValue) => {
              removeInput(true);
              insertText(editor, 'You selected: ' + selectedValue);
            }}
          >
            <span className="relative">
              {/**
              To create an auto-resizing input, we render a visually hidden span
              containing the input value and position the input element on top of
              it. This works well for all cases except when input exceeds the
              width of the container.
            */}
              <span
                aria-hidden="true"
                className="invisible overflow-hidden text-nowrap"
              >
                {value}
              </span>

              <Combobox
                ref={inputRef}
                value={value}
                className="absolute left-0 top-0 size-full bg-transparent outline-none"
                {...inputProps}
              />
            </span>

            <ComboboxPopover>
              <ComboboxItem value="Apple">Apple</ComboboxItem>

              <ComboboxItem value="Banana">Banana</ComboboxItem>

              <ComboboxItem value="Cherry">Cherry</ComboboxItem>
            </ComboboxPopover>
          </ComboboxProvider>
        </span>
        {children}
      </PlateElement>
    );
  }
);
