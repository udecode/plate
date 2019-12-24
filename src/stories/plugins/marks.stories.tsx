import React, { useMemo, useState } from 'react';
import {
  Code,
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
  FormatUnderlined,
} from '@material-ui/icons';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  BoldPlugin,
  EditablePlugins,
  InlineCodePlugin,
  ItalicPlugin,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
  MarkButton,
  StrikethroughPlugin,
  ToolbarHeader,
  UnderlinePlugin,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueMark } from '../config/initialValues';

export default {
  title: 'Plugins/Marks',
  subcomponents: {
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    StrikethroughPlugin,
    InlineCodePlugin,
    MarkButton,
  },
};

export const MarkPlugins = () => {
  const plugins: any[] = [];
  if (boolean('BoldPlugin', true)) plugins.push(BoldPlugin());
  if (boolean('ItalicPlugin', true)) plugins.push(ItalicPlugin());
  if (boolean('UnderlinePlugin', true)) plugins.push(UnderlinePlugin());
  if (boolean('StrikethroughPlugin', true)) plugins.push(StrikethroughPlugin());
  if (boolean('InlineCodePlugin', true)) plugins.push(InlineCodePlugin());

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueMark);

    const editor = useMemo(() => withHistory(withReact(createEditor())), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => setValue(newValue)}
      >
        <ToolbarHeader height={18}>
          <MarkButton format={MARK_BOLD} icon={<FormatBold />} />
          <MarkButton format={MARK_ITALIC} icon={<FormatItalic />} />
          <MarkButton format={MARK_UNDERLINE} icon={<FormatUnderlined />} />
          <MarkButton
            format={MARK_STRIKETHROUGH}
            icon={<FormatStrikethrough />}
          />
          <MarkButton format={MARK_CODE} icon={<Code />} />
        </ToolbarHeader>
        <EditablePlugins
          plugins={plugins}
          placeholder="Enter some rich text…"
          spellCheck
          autoFocus
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
