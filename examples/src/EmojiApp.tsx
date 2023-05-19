import React from 'react';
import { EmojiEmotions } from '@styled-icons/material/EmojiEmotions';
import {
  createComboboxPlugin,
  createEmojiPlugin,
  EmojiToolbarDropdown,
  KEY_EMOJI,
  Plate,
  PlateProvider,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { emojiPlugin } from './emoji/emojiPlugin';
import { emojiValue } from './emoji/emojiValue';
import { Toolbar } from './toolbar/Toolbar';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

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
      <Toolbar>
        <EmojiToolbarDropdown pluginKey={KEY_EMOJI} icon={<EmojiEmotions />} />
      </Toolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
