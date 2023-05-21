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

import { preFormat } from '@/plate/autoformat/autoformatUtils';
import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { horizontalRuleValue } from '@/plate/horizontal-rule/horizontalRuleValue';
import {
  createMyPlugins,
  MyEditor,
  MyValue,
} from '@/plate/typescript/plateTypes';

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
