import React from 'react';
import {
  createComboboxPlugin,
  createEmojiPlugin,
  EmojiCombobox,
  Plate,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { emojiValue } from './emoji/emojiValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createComboboxPlugin(), createEmojiPlugin()],
  {
    components: plateUI,
  }
);

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    plugins={plugins}
    initialValue={emojiValue}
    onChange={(e) => console.info(e)}
  />
);
