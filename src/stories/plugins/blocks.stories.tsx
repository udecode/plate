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
  BlockquotePlugin,
  EditablePlugins,
  HeadingPlugin,
  ListButton,
  ListPlugin,
  ListType,
  withBlock,
  withList,
} from 'slate-plugins';
import { StyledToolbar } from 'slate-plugins/common/components/Toolbar';
import { BLOCKQUOTE } from 'slate-plugins/elements/blockquote/types';
import { HeadingType } from 'slate-plugins/elements/heading/types';
import { ParagraphPlugin } from 'slate-plugins/elements/paragraph/ParagraphPlugin';
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
        <StyledToolbar height={18}>
          <BlockButton format={HeadingType.H1} icon={<LooksOne />} />
          <BlockButton format={HeadingType.H2} icon={<LooksTwo />} />
          <ListButton format={ListType.UL_LIST} icon={<FormatListBulleted />} />
          <ListButton format={ListType.OL_LIST} icon={<FormatListNumbered />} />
          <BlockButton format={BLOCKQUOTE} icon={<FormatQuote />} />
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
