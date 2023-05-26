import React from 'react';
import {
  createComboboxPlugin,
  createEmojiPlugin,
  KEY_EMOJI,
  Plate,
  PlateProvider,
} from '@udecode/plate';

import { Icons } from '@/components/icons';
import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { EmojiDropdownMenu } from '@/plate/emoji/EmojiDropdownMenu';
import { emojiPlugin } from '@/plate/emoji/emojiPlugin';
import { emojiValue } from '@/plate/emoji/emojiValue';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createComboboxPlugin(),
    createEmojiPlugin(emojiPlugin),
  ],
  {
    components: plateUI,
  }
);

export default function EmojiApp() {
  return (
    <PlateProvider<MyValue>
      plugins={plugins}
      initialValue={emojiValue}
      onChange={(e) => console.info(e)}
    >
      <HeadingToolbar>
        <EmojiDropdownMenu pluginKey={KEY_EMOJI}>
          <Icons.emoji />
        </EmojiDropdownMenu>
      </HeadingToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
