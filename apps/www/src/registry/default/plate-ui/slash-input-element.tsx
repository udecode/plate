import React, { ReactNode, startTransition, useMemo, useState } from 'react';
import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  ComboboxProvider,
} from '@ariakit/react';
import { cn, withRef } from '@udecode/cn';
import {
  useComboboxInput,
  useHTMLInputCursorState,
} from '@udecode/plate-combobox';
import {
  insertText,
  moveSelection,
  PlateElement,
  useEditorRef,
} from '@udecode/plate-common';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';

type InlineComboboxItem = {
  value: string;
  label: string;
  aliases?: string[];
  onSelect?: () => void;
};

// Smart filter by words, using prefix matching on last word only
export const filterPredicate = (haystack: string, needle: string): boolean => {
  const haystackWords = haystack.trim().split(/\s+/);
  const needleWords = needle.trim().split(/\s+/);

  return needleWords.every((needleWord, i) => {
    const allowPrefix = i === needleWords.length - 1;

    return haystackWords.some((unslicedHaystackWord) => {
      const haystackWord = allowPrefix
        ? unslicedHaystackWord.slice(0, needleWord.length)
        : unslicedHaystackWord;

      return (
        haystackWord.localeCompare(needleWord, undefined, {
          usage: 'search',
          sensitivity: 'base',
        }) === 0
      );
    });
  });
};

const comboboxItemClassName =
  'relative flex h-9 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none';
const comboboxItemInteractiveClassName =
  'cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground data-[active-item=true]:bg-accent data-[active-item=true]:text-accent-foreground';

interface InlineComboboxProps<TItem extends InlineComboboxItem> {
  trigger: string;
  items: TItem[];
  renderItem?: (item: TItem) => ReactNode;
  renderEmpty?: ReactNode;
  onSelectItem?: (item: TItem) => void;
}

const InlineCombobox = <TItem extends InlineComboboxItem>({
  trigger,
  items,
  renderItem,
  renderEmpty,
  onSelectItem,
}: InlineComboboxProps<TItem>) => {
  const editor = useEditorRef();
  const [value, setValue] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cursorState = useHTMLInputCursorState(inputRef);

  const filteredItems = useMemo(
    () =>
      items.filter(({ label, aliases = [] }) =>
        [label, ...aliases].some((alias) => filterPredicate(alias, value))
      ),
    [items, value]
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

        <ComboboxPopover className="z-[500] max-h-[288px] w-[300px] overflow-y-auto rounded-md bg-popover shadow-md">
          {filteredItems.map((item) => (
            <ComboboxItem
              key={item.value}
              className={cn(
                comboboxItemClassName,
                comboboxItemInteractiveClassName
              )}
              onClick={() => {
                removeInput(true);
                item.onSelect?.();
                onSelectItem?.(item);
              }}
            >
              {renderItem ? renderItem(item) : item.label}
            </ComboboxItem>
          ))}

          {filteredItems.length === 0 && renderEmpty && (
            <div className={comboboxItemClassName}>{renderEmpty}</div>
          )}
        </ComboboxPopover>
      </ComboboxProvider>
    </span>
  );
};

type SlashCommandRule = InlineComboboxItem & {
  icon: ReactNode;
};

const rules: SlashCommandRule[] = [
  {
    value: 'apple',
    label: 'Apple',
    icon: '🍎',
  },
  {
    value: 'banana',
    label: 'Banana',
    icon: '🍌',
  },
  {
    value: 'cherry',
    label: 'Cherry',
    icon: '🍒',
  },
  {
    value: ELEMENT_H1,
    label: 'Heading 1',
    icon: 'H1',
  },
  {
    value: ELEMENT_H2,
    label: 'Heading 2',
    icon: 'H2',
  },
  {
    value: ELEMENT_H3,
    label: 'Heading 3',
    icon: 'H3',
  },
  {
    value: ELEMENT_H4,
    label: 'Heading 4',
    icon: 'H4',
  },
  {
    value: ELEMENT_H5,
    label: 'Heading 5',
    icon: 'H5',
  },
  {
    value: ELEMENT_H6,
    label: 'Heading 6',
    icon: 'H6',
  },
];

export const SlashInputElement = withRef<typeof PlateElement>(
  ({ className, ...props }, ref) => {
    const { children, element, editor } = props;

    return (
      <PlateElement
        as="span"
        ref={ref}
        data-slate-value={element.value}
        {...props}
      >
        <InlineCombobox
          trigger="/"
          items={rules}
          renderItem={({ icon, label }) => (
            <>
              <span className="mr-2">{icon}</span>
              {label}
            </>
          )}
          renderEmpty="No matching commands found"
          onSelectItem={({ label }) => {
            insertText(editor, 'Selected ' + label);
          }}
        />

        {children}
      </PlateElement>
    );
  }
);
