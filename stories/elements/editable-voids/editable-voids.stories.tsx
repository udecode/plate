import React from 'react';
import { boolean, text } from '@storybook/addon-knobs';
import {
  EditablePlugins,
  ParagraphPlugin,
  SlatePlugins,
  withInlineVoid,
} from '@udecode/slate-plugins';
import { Node } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { options } from '../../config/initialValues';
import { EditableVoidPlugin } from './EditableVoidPlugin';
import { EDITABLE_VOID } from './types';

const id = 'Elements/Editable Voids';

export default {
  title: id,
};

const initialValueVoids: Node[] = [
  {
    children: [
      {
        type: options.p.type,
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
        type: options.p.type,
        children: [
          {
            text: '',
          },
        ],
      },
    ],
  },
];

const plugins = [ParagraphPlugin(options), EditableVoidPlugin()];

const withPlugins = [
  withReact,
  withHistory,
  withInlineVoid({ plugins }),
] as const;

export const Example = () => {
  return (
    <SlatePlugins
      id={id}
      initialValue={initialValueVoids}
      withPlugins={withPlugins}
    >
      <EditablePlugins
        id={id}
        readOnly={boolean('readOnly', false)}
        plugins={plugins}
        placeholder={text('placeholder', 'Enter some text...')}
        spellCheck={boolean('spellCheck', true)}
        autoFocus
      />
    </SlatePlugins>
  );
};
