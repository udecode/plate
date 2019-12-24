import React, { useMemo, useState } from 'react';
import {
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  LooksOne,
  LooksTwo,
} from '@material-ui/icons';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  BlockButton,
  BLOCKQUOTE,
  BlockquotePlugin,
  EditablePlugins,
  HeadingPlugin,
  HeadingType,
  ListButton,
  ListPlugin,
  ListType,
  ParagraphPlugin,
  ToolbarHeader,
  withBlock,
  withList,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueRichText } from '../config/initialValues';

export default {
  title: 'Plugins/Blocks',
  subcomponents: {
    HeadingPlugin,
    BlockquotePlugin,
    ListPlugin,
  },
};

export const BlockPlugins = () => {
  const plugins: any[] = [];
  if (boolean('ParagraphPlugin', true)) plugins.push(ParagraphPlugin());
  if (boolean('HeadingPlugin', true)) plugins.push(HeadingPlugin());
  if (boolean('HeadingPlugin', true)) plugins.push(HeadingPlugin());
  if (boolean('BlockquotePlugin', true)) plugins.push(BlockquotePlugin());
  if (boolean('ListPlugin', true)) plugins.push(ListPlugin());

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueRichText);

    const editor = useMemo(
      () => withList(withBlock(withHistory(withReact(createEditor())))),
      []
    );

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => setValue(newValue)}
      >
        <ToolbarHeader height={18}>
          <BlockButton format={HeadingType.H1} icon={<LooksOne />} />
          <BlockButton format={HeadingType.H2} icon={<LooksTwo />} />
          <ListButton format={ListType.UL_LIST} icon={<FormatListBulleted />} />
          <ListButton format={ListType.OL_LIST} icon={<FormatListNumbered />} />
          <BlockButton format={BLOCKQUOTE} icon={<FormatQuote />} />
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
