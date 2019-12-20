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
  withBlock,
  withList,
} from 'slate-plugins';
import { StyledToolbar } from 'slate-plugins/common/components/Toolbar';
import { Slate, withReact } from 'slate-react';
import { initialValueRichText } from '../config/initialValues';

export default {
  title: 'Plugins/Blocks',
};

export const BlockPlugins = () => {
  const plugins: any[] = [];
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
          <BlockButton format="heading-one" icon={<LooksOne />} />
          <BlockButton format="heading-two" icon={<LooksTwo />} />
          <BlockButton format="block-quote" icon={<FormatQuote />} />
          <ListButton format="bulleted-list" icon={<FormatListBulleted />} />
          <ListButton format="numbered-list" icon={<FormatListNumbered />} />
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
