import React from 'react';
import {
  createComboboxPlugin,
  createMentionPlugin,
  getBlockAbove,
  isStartPoint,
  MentionCombobox,
  MentionElement,
  Plate,
} from '@udecode/plate';
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { MENTIONABLES } from './mention/mentionables';
import { mentionValue } from './mention/mentionValue';

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
