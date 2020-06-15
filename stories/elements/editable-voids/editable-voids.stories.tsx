import React, { useMemo, useState } from 'react';
import { boolean, text } from '@storybook/addon-knobs';
import { createEditor, Node } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  EditablePlugins,
  ParagraphPlugin,
  pipe,
  SlateDocument,
  withInlineVoid,
} from '../../../packages/slate-plugins/src';
import { nodeTypes } from '../../config/initialValues';
import { EditableVoidPlugin } from './EditableVoidPlugin';
import { EDITABLE_VOID } from './types';

export default {
  title: 'Elements/Editable Voids',
};

const initialValueVoids: Node[] = [
  {
    children: [
      {
        type: nodeTypes.typeP,
        children: [
          {
            text:
              'In addition to nodes that contain editable text, you can insert void nodes, which can also contain editable elements, inputs, or an entire other Slate editor.',
          },
        ],
      },
      {
        type: EDITABLE_VOID,
        children: [{ text: '' }],
      },
      {
        type: nodeTypes.typeP,
        children: [
          {
            text: '',
          },
        ],
      },
    ],
  },
];

const plugins = [ParagraphPlugin(nodeTypes), EditableVoidPlugin()];

const withPlugins = [
  withReact,
  withHistory,
  withInlineVoid({ plugins }),
] as const;

export const Example = () => {
  const [value, setValue] = useState(initialValueVoids);

  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => setValue(newValue as SlateDocument)}
    >
      <EditablePlugins
        readOnly={boolean('readOnly', false)}
        plugins={plugins}
        placeholder={text('placeholder', 'Enter some text...')}
        spellCheck={boolean('spellCheck', true)}
        autoFocus
      />
    </Slate>
  );
};
