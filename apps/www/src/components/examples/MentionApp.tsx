import React from 'react';
import { createComboboxPlugin } from '@udecode/plate-combobox';
import { Plate } from '@udecode/plate-common';
import { createMentionPlugin } from '@udecode/plate-mention';
import { isStartPoint } from '@udecode/slate';
import { getBlockAbove } from '@udecode/slate-utils';

import { MentionCombobox } from '@/components/plate-ui/mention-combobox';
import { MentionElement } from '@/components/plate-ui/mention-element';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { MENTIONABLES } from '@/plate/demo/values/mentionables';
import { mentionValue } from '@/plate/demo/values/mentionValue';
import { createMyPlugins, MyValue } from '@/plate/plate.types';

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
