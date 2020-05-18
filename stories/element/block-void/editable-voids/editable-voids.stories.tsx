import React, { useMemo, useState } from 'react';
import { boolean, text } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  EditablePlugins,
  ParagraphPlugin,
  pipe,
  withVoid,
} from '../../../../packages/slate-plugins/src';
import { initialValueVoids, nodeTypes } from '../../../config/initialValues';
import { EditableVoidPlugin } from './EditableVoidPlugin';
import { EDITABLE_VOID } from './types';

export default {
  title: 'Element/Block Void/Editable Voids',
};

const plugins = [ParagraphPlugin(nodeTypes), EditableVoidPlugin()];

const withPlugins = [
  withReact,
  withHistory,
  withVoid([EDITABLE_VOID]),
] as const;

export const Example = () => {
  const [value, setValue] = useState(initialValueVoids);

  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => setValue(newValue)}
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
