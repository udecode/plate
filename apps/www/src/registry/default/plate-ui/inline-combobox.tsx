import React, { ReactNode, startTransition, useMemo, useState } from 'react';
import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  ComboboxProvider,
  Portal,
} from '@ariakit/react';
import {
  BaseComboboxItemWithEditor,
  matchWords,
  useComboboxInput,
  useHTMLInputCursorState,
} from '@udecode/plate-combobox';
import { insertText, moveSelection, useEditorRef } from '@udecode/plate-common';
import { cva } from 'class-variance-authority';

const comboboxItemVariants = cva(
  'relative flex h-9 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
  {
    variants: {
      interactive: {
        true: 'cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground data-[active-item=true]:bg-accent data-[active-item=true]:text-accent-foreground',
        false: '',
      },
    },
    defaultVariants: {
      interactive: true,
    },
  }
);

const defaultMatchItem = (
  { label, keywords = [] }: BaseComboboxItemWithEditor,
  query: string
) => [label, ...keywords].some((keyword) => matchWords(keyword, query));

interface InlineComboboxProps<TItem extends BaseComboboxItemWithEditor> {
  trigger: string;
  items: TItem[];
  matchItem?: (item: TItem, query: string) => boolean;
  renderItem?: (item: TItem) => ReactNode;
  renderEmpty?: ReactNode;
  onSelectItem?: (item: TItem) => void;
}

export const InlineCombobox = <TItem extends BaseComboboxItemWithEditor>({
  trigger,
  items,
  matchItem = defaultMatchItem,
  renderItem = ({ label }) => label,
  renderEmpty,
  onSelectItem,
}: InlineComboboxProps<TItem>) => {
  const editor = useEditorRef();
  const [value, setValue] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cursorState = useHTMLInputCursorState(inputRef);

  const filteredItems = useMemo(
    () => items.filter((item) => matchItem(item, value)),
    [items, matchItem, value]
  );

  const { removeInput, props: inputProps } = useComboboxInput({
    ref: inputRef,
    cursorState,
    onCancelInput: (cause) => {
      if (cause !== 'backspace') {
        insertText(editor, trigger + value);
      }

      if (cause === 'arrowLeft' || cause === 'arrowRight') {
        moveSelection(editor, {
          distance: 1,
          reverse: cause === 'arrowLeft',
        });
      }
    },
  });

  /**
   * To create an auto-resizing input, we render a visually hidden span
   * containing the input value and position the input element on top of it.
   * This works well for all cases except when input exceeds the width of the
   * container.
   */

  return (
    <span contentEditable={false}>
      {trigger}

      <ComboboxProvider
        open={filteredItems.length > 0 || renderEmpty !== undefined}
        setValue={(newValue) => startTransition(() => setValue(newValue))}
      >
        <span className="relative">
          <span
            aria-hidden="true"
            className="invisible overflow-hidden text-nowrap"
          >
            {value}
          </span>

          <Combobox
            ref={inputRef}
            autoSelect
            value={value}
            className="absolute left-0 top-0 size-full bg-transparent outline-none"
            {...inputProps}
          />
        </span>

        {/* Portal prevents CSS from leaking into popover */}
        <Portal>
          <ComboboxPopover className="z-[500] max-h-[288px] w-[300px] overflow-y-auto rounded-md bg-popover shadow-md">
            {filteredItems.map((item) => (
              <ComboboxItem
                key={item.value}
                className={comboboxItemVariants()}
                onClick={() => {
                  removeInput(true);
                  item.onSelect?.(editor);
                  onSelectItem?.(item);
                }}
              >
                {renderItem(item)}
              </ComboboxItem>
            ))}

            {filteredItems.length === 0 && renderEmpty && (
              <div className={comboboxItemVariants({ interactive: false })}>
                {renderEmpty}
              </div>
            )}
          </ComboboxPopover>
        </Portal>
      </ComboboxProvider>
    </span>
  );
};
