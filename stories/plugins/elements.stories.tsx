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
import { Slate, withReact } from 'slate-react';
import {
  BLOCKQUOTE,
  BlockquotePlugin,
  EditablePlugins,
  HeadingPlugin,
  HeadingToolbar,
  HeadingType,
  ListPlugin,
  ListType,
  ParagraphPlugin,
  ToolbarBlock,
  ToolbarList,
  withBlock,
  withList,
} from '../../packages/slate-plugins/src';
import { initialValueRichText } from '../config/initialValues';

export default {
  title: 'Plugins/Elements',
  subcomponents: {
    HeadingPlugin,
    BlockquotePlugin,
    ListPlugin,
    ParagraphPlugin,
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
        <HeadingToolbar>
          <ToolbarBlock format={HeadingType.H1} icon={<LooksOne />} />
          <ToolbarBlock format={HeadingType.H2} icon={<LooksTwo />} />
          <ToolbarList
            format={ListType.UL_LIST}
            icon={<FormatListBulleted />}
          />
          <ToolbarList
            format={ListType.OL_LIST}
            icon={<FormatListNumbered />}
          />
          <ToolbarBlock format={BLOCKQUOTE} icon={<FormatQuote />} />
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
