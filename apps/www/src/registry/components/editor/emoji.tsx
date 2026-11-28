'use client';

import { BaseCodeBlockPlugin } from 'platejs';
import {
  type EditableSiblingProps,
  type Editor,
  definePlugin,
} from 'platejs/react';

import { useEmojiSearch } from '@/registry/lib/emoji-data';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxItem,
  useInlineComboboxQuery,
} from './inline-combobox';

const EMOJI_QUERY_PATTERN = /^[\p{L}\p{N}_+\-:]$/u;

const isNotInCodeBlock = (editor: Editor) => {
  const codeBlock = editor.plugin(BaseCodeBlockPlugin);

  return (
    !codeBlock.installed ||
    !editor.read.nodes.some({ type: codeBlock.schema.type })
  );
};

export function EmojiCombobox({ editableRef }: EditableSiblingProps) {
  const { status } = useEmojiSearch(null);

  return (
    <InlineCombobox
      editableRef={editableRef}
      hideWhenNoValue
      loading={status === 'loading'}
      queryPattern={EMOJI_QUERY_PATTERN}
      trigger=":"
      triggerQuery={isNotInCodeBlock}
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
});

export const EmojiKit = [
  EmojiPlugin.configure({ slots: { afterEditable: EmojiCombobox } }),
];
