import React, { useState } from 'react';
import {
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  LooksOne,
  LooksTwo,
} from '@material-ui/icons';
import { boolean } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import {
  BlockButton,
  BlockquotePlugin,
  EditablePlugins,
  HeadingPlugin,
  ListPlugin,
  useCreateEditor,
} from 'slate-plugins';
import { StyledToolbar } from 'slate-plugins/common/components/Toolbar';
import { Slate, withReact } from 'slate-react';
import { initialValueRichText } from '../config/initialValues';

export default {
  title: 'Plugins|Blocks',
};

export const BlockPlugins = () => {
  const plugins = [];
  if (boolean('HeadingPlugin', true, 'plugins')) plugins.push(HeadingPlugin());
  if (boolean('BlockquotePlugin', true, 'plugins'))
    plugins.push(BlockquotePlugin());
  if (boolean('ListPlugin', true, 'plugins')) plugins.push(ListPlugin());

  const [value, setValue] = useState(initialValueRichText);

  const editor = useCreateEditor([withReact, withHistory], plugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <StyledToolbar height={18}>
        <BlockButton format="heading-one" icon={<LooksOne />} />
        <BlockButton format="heading-two" icon={<LooksTwo />} />
        <BlockButton format="block-quote" icon={<FormatQuote />} />
        <BlockButton format="numbered-list" icon={<FormatListNumbered />} />
        <BlockButton format="bulleted-list" icon={<FormatListBulleted />} />
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
