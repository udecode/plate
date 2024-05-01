import React, { useState } from 'react';
import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  ComboboxProvider,
} from '@ariakit/react';
import { withRef } from '@udecode/cn';
import {
  useComboboxInput,
  useHTMLInputCursorState,
} from '@udecode/plate-combobox';
import { insertText, moveSelection, PlateElement } from '@udecode/plate-common';

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
