import React, { useMemo, useState } from 'react';
import { Code, FormatQuote, LooksOne, LooksTwo } from '@styled-icons/material';
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
  InlineCodePlugin,
  ParagraphPlugin,
  SoftBreakPlugin,
  ToolbarBlock,
  ToolbarCode,
  withBlock,
  withBreakEmptyReset,
  withDeleteStartReset,
  withList,
} from '../../packages/slate-plugins/src';
import { initialValueSoftBreak, nodeTypes } from '../config/initialValues';

export default {
  title: 'Plugins/Soft Break',
  component: SoftBreakPlugin,
};

const resetOptions = {
  ...nodeTypes,
  types: [BLOCKQUOTE],
};

export const BlockPlugins = () => {
  const plugins: any[] = [
    ParagraphPlugin(nodeTypes),
    HeadingPlugin(nodeTypes),
    BlockquotePlugin(nodeTypes),
    CodePlugin(nodeTypes),
    InlineCodePlugin(nodeTypes),
    SoftBreakPlugin(),
  ];

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueSoftBreak);

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
          <ToolbarBlock
            type={nodeTypes.typeBlockquote}
            icon={<FormatQuote />}
          />
          <ToolbarCode {...nodeTypes} icon={<Code />} />
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
