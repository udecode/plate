import React from 'react';
import {
  AutoformatPlugin,
  createAutoformatPlugin,
} from '@udecode/plate-autoformat';
import {
  ELEMENT_DEFAULT,
  insertNodes,
  Plate,
  setNodes,
} from '@udecode/plate-common';
import {
  createHorizontalRulePlugin,
  ELEMENT_HR,
} from '@udecode/plate-horizontal-rule';
import { createSelectOnBackspacePlugin } from '@udecode/plate-select';

import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { preFormat } from '@/plate/demo/plugins/autoformatUtils';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { horizontalRuleValue } from '@/plate/demo/values/horizontalRuleValue';
import { createMyPlugins, MyEditor, MyValue } from '@/plate/plate.types';

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
