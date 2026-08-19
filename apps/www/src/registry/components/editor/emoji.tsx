'use client';

import * as React from 'react';
import emojiMartData, { type EmojiMartData } from '@emoji-mart/data';
import {
  type PlateElementProps,
  PlateElement,
  usePluginStore,
} from 'platejs/react';
import { EmojiInlineIndexSearch } from '@platejs/emoji';
import { EmojiInputPlugin, EmojiPlugin } from '@platejs/emoji/react';
import { useDebounce } from '@/registry/hooks/use-debounce';
import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';

const TRAILING_COLON_REGEX = /:$/;

export const emojiPlugin = EmojiPlugin.extend({
  initialState: {
    data: emojiMartData as unknown as EmojiMartData,
  },
});

export function EmojiInputElement(
  props: PlateElementProps<typeof EmojiInputPlugin>
) {
  const { children, editor, element } = props;
  const data = usePluginStore(emojiPlugin, 'data');
  const [value, setValue] = React.useState('');
  const debouncedValue = useDebounce(value, 100);
  const isPending = value !== debouncedValue;

  const filteredEmojis = React.useMemo(() => {
    if (debouncedValue.trim().length === 0) return [];

    return EmojiInlineIndexSearch.getInstance(data)
      .search(debouncedValue.replace(TRAILING_COLON_REGEX, ''))
      .get();
  }, [data, debouncedValue]);

  return (
    <PlateElement as="span" {...props}>
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
          {!isPending && <InlineComboboxEmpty>No results</InlineComboboxEmpty>}

          <InlineComboboxGroup>
            {filteredEmojis.map((emoji) => (
              <InlineComboboxItem
                key={emoji.id}
                value={emoji.name}
                onClick={() => editor.plugin(emojiPlugin).update.insert(emoji)}
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

export const EmojiKit = [
  emojiPlugin,
  EmojiInputPlugin.configure({ component: EmojiInputElement }),
];
