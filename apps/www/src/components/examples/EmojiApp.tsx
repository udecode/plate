import React from 'react';
import { createComboboxPlugin } from '@udecode/plate-combobox';
import { Plate, PlateProvider } from '@udecode/plate-common';
import { createEmojiPlugin } from '@udecode/plate-emoji';

import { EmojiDropdownMenu } from '@/components/plate-ui/emoji-dropdown-menu';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { emojiPlugin } from '@/plate/demo/plugins/emojiPlugin';
import { emojiValue } from '@/plate/demo/values/emojiValue';
import { createMyPlugins, MyValue } from '@/plate/plate.types';

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
      <FixedToolbar>
        <EmojiDropdownMenu />
      </FixedToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
