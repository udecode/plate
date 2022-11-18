export const emojiAppCode = `import React from 'react';
import {
  createComboboxPlugin,
  createEmojiPlugin,
  // MentionCombobox,
  // MentionElement,
  Plate,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { emojiValue } from './emoji/emojiValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createComboboxPlugin(),
    createEmojiPlugin(),
    // createMentionPlugin({
    //   key: '#',
    //   component: MentionElement,
    //   options: {
    //     trigger: '#',
    //     inputCreation: { key: 'creationId', value: 'main' },
    //   },
    // }),
    // createMentionPlugin({
    //   key: '/',
    //   component: MentionElement,
    //   options: { trigger: '/' },
    // }),
  ],
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
  >
    {/* <MentionCombobox items={MENTIONABLES} />
    <MentionCombobox items={MENTIONABLES} pluginKey="#" />
    <MentionCombobox items={[MENTIONABLES[0], MENTIONABLES[1]]} pluginKey="/" /> */}
  </Plate>
);
`;

export const emojiAppFile = {
  '/EmojiApp.tsx': emojiAppCode,
};
