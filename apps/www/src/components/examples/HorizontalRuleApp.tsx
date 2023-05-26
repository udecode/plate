import React from 'react';
import {
  AutoformatPlugin,
  createAutoformatPlugin,
  createHorizontalRulePlugin,
  createSelectOnBackspacePlugin,
  ELEMENT_DEFAULT,
  ELEMENT_HR,
  insertNodes,
  Plate,
  setNodes,
} from '@udecode/plate';

import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyEditor, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { preFormat } from '@/plate/demo/plugins/autoformatUtils';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { horizontalRuleValue } from '@/plate/demo/values/horizontalRuleValue';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createHorizontalRulePlugin(),
    createSelectOnBackspacePlugin({
      options: { query: { allow: [ELEMENT_HR] } },
    }),
    createAutoformatPlugin<AutoformatPlugin<MyValue, MyEditor>, MyValue>({
      options: {
        rules: [
          {
            mode: 'block',
            type: ELEMENT_HR,
            match: ['---', '—-', '___ '],
            preFormat,
            format: (editor) => {
              setNodes(editor, { type: ELEMENT_HR });
              insertNodes(editor, {
                type: ELEMENT_DEFAULT,
                children: [{ text: '' }],
              });
            },
          },
        ],
      },
    }),
  ],
  {
    components: plateUI,
  }
);

export default function HorizontalRuleApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={horizontalRuleValue}
    />
  );
}
