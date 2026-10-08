'use client';

import { BaseCodeBlockPlugin } from 'platejs';
import type { ComboboxState } from 'platejs/combobox';
import { definePlugin } from 'platejs/react';
import type * as React from 'react';

import { useEmojiSearch } from '@/registry/lib/emoji-data';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxItem,
  useInlineComboboxQuery,
} from './inline-combobox';

export function EmojiCombobox({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { status } = useEmojiSearch(null);

  return (
    <InlineCombobox
      editableRef={editableRef}
      filter={false}
      plugin={EmojiPlugin}
      hideWhenNoValue
      loading={status === 'loading'}
    >
      <EmojiComboboxContent />
    </InlineCombobox>
  );
}

function EmojiComboboxContent() {
  const query = useInlineComboboxQuery();
  const { results, status } = useEmojiSearch(query || null);

  return (
    <InlineComboboxContent>
      <InlineComboboxEmpty role={status === 'loading' ? 'status' : undefined}>
        {status === 'loading'
          ? 'Loading emoji…'
          : status === 'failed'
            ? 'Emoji unavailable'
            : 'No results'}
      </InlineComboboxEmpty>

      <InlineComboboxGroup>
        {results.map((emoji) => (
          <InlineComboboxItem
            key={emoji.emoji}
            value={emoji.label}
            onSelect={(tx) => {
              tx.text.insert(emoji.emoji);
            }}
          >
            {emoji.emoji} {emoji.label}
          </InlineComboboxItem>
        ))}
      </InlineComboboxGroup>
    </InlineComboboxContent>
  );
}

export const EmojiPlugin = definePlugin('emoji', {
  editOnly: true,
  initialState: (): ComboboxState => ({
    maxQueryLength: 75,
    queryPattern: /^[\p{L}\p{N}_+\-:]$/u,
    trigger: ':',
    triggerPreviousCharPattern: /^\s?$/,
    triggerQuery: (editor) => {
      const codeBlock = editor.plugin(BaseCodeBlockPlugin);

      return (
        !codeBlock.installed ||
        !editor.read.nodes.some({ type: codeBlock.schema.type })
      );
    },
  }),
});

export const EmojiKit = [
  EmojiPlugin.configure({ slots: { afterEditable: EmojiCombobox } }),
];
