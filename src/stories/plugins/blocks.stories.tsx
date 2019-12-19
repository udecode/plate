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
  ListButton,
  ListPlugin,
  useCreateEditor,
} from 'slate-plugins';
import { StyledToolbar } from 'slate-plugins/common/components/Toolbar';
import { BlockPlugin } from 'slate-plugins/elements/BlockPlugin';
import { Slate, withReact } from 'slate-react';
import { initialValueRichText } from '../config/initialValues';

export default {
  title: 'Plugins/Blocks',
};

export const BlockPlugins = () => {
  const plugins = [];
  if (boolean('HeadingPlugin', true)) plugins.push(HeadingPlugin());
  if (boolean('BlockquotePlugin', true)) plugins.push(BlockquotePlugin());
  if (boolean('BlockPlugin', true)) plugins.push(BlockPlugin());
  if (boolean('ListPlugin', true)) plugins.push(ListPlugin());

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
        <ListButton format="numbered-list" icon={<FormatListNumbered />} />
        <ListButton format="bulleted-list" icon={<FormatListBulleted />} />
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
