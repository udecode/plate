import React, { useMemo, useState } from 'react';
import {
  Code,
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
  FormatUnderlined,
  ArrowUpward,
  ArrowDownward,
} from '@material-ui/icons';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  BoldPlugin,
  EditablePlugins,
  HeadingToolbar,
  InlineCodePlugin,
  ItalicPlugin,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  MARK_UNDERLINE,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  ToolbarMark,
  UnderlinePlugin,
} from '../../packages/slate-plugins/src';
import { initialValueMark } from '../config/initialValues';

export default {
  title: 'Plugins/Marks',
  subcomponents: {
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    StrikethroughPlugin,
    SubscriptPlugin,
    SuperscriptPlugin,
    InlineCodePlugin,
    MarkButton: ToolbarMark,
  },
};

export const MarkPlugins = () => {
  const plugins: any[] = [];
  if (boolean('BoldPlugin', true)) plugins.push(BoldPlugin());
  if (boolean('ItalicPlugin', true)) plugins.push(ItalicPlugin());
  if (boolean('UnderlinePlugin', true)) plugins.push(UnderlinePlugin());
  if (boolean('StrikethroughPlugin', true)) plugins.push(StrikethroughPlugin());
  if (boolean('SubscriptPlugin', true)) plugins.push(SubscriptPlugin());
  if (boolean('SuperscriptPlugin', true)) plugins.push(SuperscriptPlugin());
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
        <HeadingToolbar>
          <ToolbarMark format={MARK_BOLD} icon={<FormatBold />} />
          <ToolbarMark format={MARK_ITALIC} icon={<FormatItalic />} />
          <ToolbarMark format={MARK_UNDERLINE} icon={<FormatUnderlined />} />
          <ToolbarMark
            format={MARK_STRIKETHROUGH}
            icon={<FormatStrikethrough />}
          />
          <ToolbarMark format={MARK_SUPERSCRIPT} icon={<ArrowUpward />} />
          <ToolbarMark format={MARK_SUBSCRIPT} icon={<ArrowDownward />} />
          <ToolbarMark format={MARK_CODE} icon={<Code />} />
        </HeadingToolbar>
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
