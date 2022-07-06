import React from 'react';
import {
  createComboboxPlugin,
  createMentionPlugin,
  MentionCombobox,
  MentionElement,
  Plate,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { MENTIONABLES } from './mention/mentionables';
import { mentionValue } from './mention/mentionValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createComboboxPlugin(),
    createMentionPlugin(),
    createMentionPlugin({
      key: '#',
      component: MentionElement,
      options: {
        trigger: '#',
        inputCreation: { key: 'creationId', value: 'main' },
      },
    }),
    createMentionPlugin({
      key: '/',
      component: MentionElement,
      options: { trigger: '/' },
    }),
  ],
  {
    components: plateUI,
  }
);

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    plugins={plugins}
    initialValue={mentionValue}
    onChange={(e) => console.info(e)}
  >
    <MentionCombobox items={MENTIONABLES} />
    <MentionCombobox items={MENTIONABLES} pluginKey="#" />
    <MentionCombobox items={[MENTIONABLES[0], MENTIONABLES[1]]} pluginKey="/" />
  </Plate>
);
