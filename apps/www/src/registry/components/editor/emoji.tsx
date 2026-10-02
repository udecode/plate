'use client';

import emojiMartData, { type EmojiMartData } from '@emoji-mart/data';
import { createEmojiSearch } from 'platejs/emoji';
import { EmojiPlugin } from 'platejs/emoji/react';
import { usePluginStore } from 'platejs/react';
import * as React from 'react';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxItem,
  useInlineComboboxQuery,
} from './inline-combobox';

const TRAILING_COLON_REGEX = /:$/;

export function EmojiCombobox({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <InlineCombobox
      editableRef={editableRef}
      filter={false}
      plugin={emojiPlugin}
      hideWhenNoValue
    >
      <EmojiComboboxContent />
    </InlineCombobox>
  );
}

function EmojiComboboxContent() {
  const data = usePluginStore(emojiPlugin, 'data');
  const query = useInlineComboboxQuery();
  const search = React.useMemo(() => createEmojiSearch(data), [data]);
  const filteredEmojis = React.useMemo(
    () =>
      query.trim().length === 0
        ? []
        : search(query.replace(TRAILING_COLON_REGEX, ''), { limit: 60 }),
    [query, search]
  );

  return (
    <InlineComboboxContent>
      <InlineComboboxEmpty>No results</InlineComboboxEmpty>

      <InlineComboboxGroup>
        {filteredEmojis.map((emoji) => (
          <InlineComboboxItem
            key={emoji.id}
            value={emoji.name}
            onSelect={(tx) => {
              tx.plugin(emojiPlugin).insert(emoji);
            }}
          >
            {emoji.skins[0].native} {emoji.name}
          </InlineComboboxItem>
        ))}
      </InlineComboboxGroup>
    </InlineComboboxContent>
  );
}

export const emojiPlugin = EmojiPlugin.extend({
  initialState: {
    data: emojiMartData as unknown as EmojiMartData,
  },
});

export const EmojiKit = [
  emojiPlugin.configure({ slots: { afterEditable: EmojiCombobox } }),
];
