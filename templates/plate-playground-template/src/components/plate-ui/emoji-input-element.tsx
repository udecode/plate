'use client';

import React, { useMemo, useState } from 'react';
import { withRef } from '@udecode/cn';
import { EmojiInlineIndexSearch, insertEmoji } from '@udecode/plate-emoji';

import { useDebounce } from '@/hooks/use-debounce';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';
import { PlateElement } from './plate-element';

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
        ref={ref}
        as="span"
        data-slate-value={element.value}
        {...props}
      >
        <InlineCombobox
          value={value}
          element={element}
          filter={false}
          setValue={setValue}
          trigger=":"
          hideWhenNoValue
        >
          <InlineComboboxInput />

          <InlineComboboxContent>
            {!isPending && (
              <InlineComboboxEmpty>No results</InlineComboboxEmpty>
            )}

            <InlineComboboxGroup>
              {filteredEmojis.map((emoji) => (
                <InlineComboboxItem
                  key={emoji.id}
                  value={emoji.name}
                  onClick={() => insertEmoji(editor, emoji)}
                >
                  {emoji.skins[0].native} {emoji.name}
                </InlineComboboxItem>
              ))}
            </InlineComboboxGroup>
          </InlineComboboxContent>
        </InlineCombobox>

        {children}
      </PlateElement>
    );
  }
);
