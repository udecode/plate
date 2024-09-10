import React, { useMemo, useState } from 'react';
import { withRef } from '@udecode/cn';
import { PlateElement } from '@udecode/plate-common/react';
import { EmojiInlineIndexSearch, insertEmoji } from '@udecode/plate-emoji';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';

export const EmojiInputElement = withRef<typeof PlateElement>(
  ({ className, ...props }, ref) => {
    const { children, editor, element } = props;
    const [value, setValue] = useState('');
    const debouncedValue = useDebounce(value, 100);
    const isPending = value !== debouncedValue;

    const filteredEmojis = useMemo(() => {
      if (debouncedValue.trim().length === 0) return [];

      return EmojiInlineIndexSearch.getInstance()
        .search(debouncedValue.replace(/:$/, ''))
        .get();
    }, [debouncedValue]);

    return (
      <PlateElement
        as="span"
        data-slate-value={element.value}
        ref={ref}
        {...props}
      >
        <InlineCombobox
          element={element}
          filter={false}
          hideWhenNoValue
          setValue={setValue}
          trigger=":"
          value={value}
        >
          <InlineComboboxInput />

          <InlineComboboxContent>
            {!isPending && (
              <InlineComboboxEmpty>No matching emoji found</InlineComboboxEmpty>
            )}

            {filteredEmojis.map((emoji) => (
              <InlineComboboxItem
                key={emoji.id}
                onClick={() => insertEmoji(editor, emoji)}
                value={emoji.name}
              >
                {emoji.skins[0].native} {emoji.name}
              </InlineComboboxItem>
            ))}
          </InlineComboboxContent>
        </InlineCombobox>

        {children}
      </PlateElement>
    );
  }
);

const useDebounce = (value: any, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler: NodeJS.Timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
