import 'tippy.js/dist/tippy.css';
import React from 'react';
import {
  AutoformatPlugin,
  createAutoformatPlugin,
  createHorizontalRulePlugin,
  createPlateUI,
  createSelectOnBackspacePlugin,
  Plate,
} from '@udecode/plate';
import {
  ELEMENT_DEFAULT,
  insertNodes,
  setNodes,
} from '@udecode/plate-core/src/index';
import { ELEMENT_HR } from '@udecode/plate-horizontal-rule/src/index';
import { preFormat } from './autoformat/autoformatUtils';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { horizontalRuleValue } from './horizontal-rule/horizontalRuleValue';
import { createMyPlugins, MyEditor, MyValue } from './typescript/plateTypes';

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
    components: createPlateUI(),
  }
);

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    plugins={plugins}
    initialValue={horizontalRuleValue}
  />
);
