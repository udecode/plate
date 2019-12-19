import React, { useState } from 'react';
import {
  Code,
  FormatBold,
  FormatItalic,
  FormatStrikethrough,
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
  StrikethroughPlugin,
  UnderlinePlugin,
} from 'slate-plugins';
import { StyledToolbar } from 'slate-plugins/common/components/Toolbar';
import { MARK_STRIKETHROUGH } from 'slate-plugins/marks/strikethrough/types';
import { Slate, SlatePlugin, withReact } from 'slate-react';
import { initialValueMark } from '../config/initialValues';

export default {
  title: 'Plugins/Marks',
  subcomponents: {
    BoldPlugin,
    ItalicPlugin,
    UnderlinePlugin,
    StrikethroughPlugin,
    InlineCodePlugin,
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
          <MarkButton
            format={MARK_STRIKETHROUGH}
            icon={<FormatStrikethrough />}
          />
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

  const Editor = createReactEditor();

  return <Editor />;
};
