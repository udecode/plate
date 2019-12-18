import React, { useState } from 'react';
import {
  Code,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
} from '@material-ui/icons';
import { boolean } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import {
  BoldPlugin,
  EditablePlugins,
  InlineCodePlugin,
  ItalicPlugin,
  MarkButton,
  UnderlinePlugin,
  useCreateEditor,
} from 'slate-plugins';
import { StyledToolbar } from 'slate-plugins/common/components/Toolbar';
import { Slate, withReact } from 'slate-react';
import { initialValueMark } from '../config/initialValues';

export default {
  title: 'Plugins/Marks',
  subcomponents: { UnderlinePlugin },
};

export const MarkPlugins = () => {
  const plugins = [];
  if (boolean('BoldPlugin', true)) plugins.push(BoldPlugin());
  if (boolean('InlineCodePlugin', true)) plugins.push(InlineCodePlugin());
  if (boolean('ItalicPlugin', true)) plugins.push(ItalicPlugin());
  if (boolean('UnderlinePlugin', true)) plugins.push(UnderlinePlugin());

  const [value, setValue] = useState(initialValueMark);

  const editor = useCreateEditor([withReact, withHistory], plugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <StyledToolbar height={18}>
        <MarkButton format="bold" icon={<FormatBold />} />
        <MarkButton format="italic" icon={<FormatItalic />} />
        <MarkButton format="underline" icon={<FormatUnderlined />} />
        <MarkButton format="code" icon={<Code />} />
      </StyledToolbar>
      <EditablePlugins
        plugins={plugins}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
      />
    </Slate>
  );
};
