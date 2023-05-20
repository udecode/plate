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
import {
  createMyPlugins,
  MyEditor,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { preFormat } from './autoformat/autoformatUtils';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { horizontalRuleValue } from './horizontal-rule/horizontalRuleValue';

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
