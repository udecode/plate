import React from 'react';
import {
  createComboboxPlugin,
  createEmojiPlugin,
  EmojiToolbarDropdown,
  KEY_EMOJI,
  Plate,
  PlateProvider,
} from '@udecode/plate';
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { Icons } from './common/icons';
import { plateUI } from './common/plateUI';
import { emojiPlugin } from './emoji/emojiPlugin';
import { emojiValue } from './emoji/emojiValue';
import { Toolbar } from './toolbar/Toolbar';

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
        <EmojiToolbarDropdown pluginKey={KEY_EMOJI} icon={<Icons.emoji />} />
      </Toolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
