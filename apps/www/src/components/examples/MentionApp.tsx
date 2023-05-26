import React from 'react';
import {
  createComboboxPlugin,
  createMentionPlugin,
  getBlockAbove,
  isStartPoint,
  Plate,
} from '@udecode/plate';

import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { MENTIONABLES } from '@/plate/demo/values/mentionables';
import { mentionValue } from '@/plate/demo/values/mentionValue';
import { MentionCombobox } from '@/plate/mention/MentionCombobox';
import { MentionElement } from '@/plate/mention/MentionElement';

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
      options: {
        trigger: '/',
        query: (editor) => {
          const blockPath = getBlockAbove(editor)?.[1];
          return (
            !!editor.selection &&
            !!blockPath &&
            isStartPoint(editor, editor.selection.anchor, blockPath)
          );
        },
      },
    }),
  ],
  {
    components: plateUI,
  }
);

export default function MentionApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={mentionValue}
      onChange={(e) => console.info(e)}
    >
      <MentionCombobox items={MENTIONABLES} />
      <MentionCombobox items={MENTIONABLES} pluginKey="#" />
      <MentionCombobox
        items={[MENTIONABLES[0], MENTIONABLES[1]]}
        pluginKey="/"
      />
    </Plate>
  );
}
