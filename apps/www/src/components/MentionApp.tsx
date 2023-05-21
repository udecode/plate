import React from 'react';
import {
  createComboboxPlugin,
  createMentionPlugin,
  getBlockAbove,
  isStartPoint,
  Plate,
} from '@udecode/plate';

import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { MENTIONABLES } from '@/plate/mention/mentionables';
import { MentionCombobox } from '@/plate/mention/MentionCombobox';
import { MentionElement } from '@/plate/mention/MentionElement';
import { mentionValue } from '@/plate/mention/mentionValue';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

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
