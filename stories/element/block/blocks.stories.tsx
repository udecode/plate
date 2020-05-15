import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { CodeBlock } from '@styled-icons/boxicons-regular/CodeBlock';
import {
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Looks3,
  Looks4,
  Looks5,
  Looks6,
  LooksOne,
  LooksTwo,
} from '@styled-icons/material';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  BLOCKQUOTE,
  BlockquotePlugin,
  CodePlugin,
  EditablePlugins,
  HeadingPlugin,
  HeadingToolbar,
  ListPlugin,
  ParagraphPlugin,
  ToolbarBlock,
  ToolbarCode,
  ToolbarList,
  withBlock,
  withBreakEmptyReset,
  withDeleteStartReset,
  withList,
} from '../../../packages/slate-plugins/src';
import { initialValueElements, nodeTypes } from '../../config/initialValues';

export default {
  title: 'Element/Block/Blocks',
  subcomponents: {
    HeadingPlugin,
    BlockquotePlugin,
    ListPlugin,
    ParagraphPlugin,
    CodePlugin,
  },
};

const resetOptions = {
  ...nodeTypes,
  types: [BLOCKQUOTE],
};

export const Basic = () => {
  const plugins: any[] = [];
  if (boolean('ParagraphPlugin', true))
    plugins.push(ParagraphPlugin(nodeTypes));
  if (boolean('HeadingPlugin', true)) plugins.push(HeadingPlugin(nodeTypes));
  if (boolean('HeadingPlugin', true)) plugins.push(HeadingPlugin(nodeTypes));
  if (boolean('BlockquotePlugin', true))
    plugins.push(BlockquotePlugin(nodeTypes));
  if (boolean('ListPlugin', true)) plugins.push(ListPlugin(nodeTypes));
  if (boolean('CodePlugin', true)) plugins.push(CodePlugin(nodeTypes));

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueElements);

    const editor = useMemo(
      () =>
        withList(nodeTypes)(
          withBreakEmptyReset(resetOptions)(
            withDeleteStartReset(resetOptions)(
              withBlock(nodeTypes)(withHistory(withReact(createEditor())))
            )
          )
        ),
      []
    );

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue)}
      >
        <HeadingToolbar>
          <ToolbarBlock type={nodeTypes.typeH1} icon={<LooksOne />} />
          <ToolbarBlock type={nodeTypes.typeH2} icon={<LooksTwo />} />
          <ToolbarBlock type={nodeTypes.typeH3} icon={<Looks3 />} />
          <ToolbarBlock type={nodeTypes.typeH4} icon={<Looks4 />} />
          <ToolbarBlock type={nodeTypes.typeH5} icon={<Looks5 />} />
          <ToolbarBlock type={nodeTypes.typeH6} icon={<Looks6 />} />
          <ToolbarList
            {...nodeTypes}
            typeList={nodeTypes.typeUl}
            icon={<FormatListBulleted />}
          />
          <ToolbarList
            {...nodeTypes}
            typeList={nodeTypes.typeOl}
            icon={<FormatListNumbered />}
          />
          <ToolbarBlock
            type={nodeTypes.typeBlockquote}
            icon={<FormatQuote />}
          />
          <ToolbarCode {...nodeTypes} icon={<CodeBlock />} />
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
