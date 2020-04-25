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
  HeadingType,
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
import { initialValueSoftBreak } from '../config/initialValues';

export default {
  title: 'Plugins/Soft Break',
  component: SoftBreakPlugin,
};

const resetOptions = {
  types: [BLOCKQUOTE],
};

export const BlockPlugins = () => {
  const plugins: any[] = [
    SoftBreakPlugin(),
    InlineCodePlugin(),
    ParagraphPlugin(),
    HeadingPlugin(),
    BlockquotePlugin(),
    CodePlugin(),
  ];

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueSoftBreak);

    const editor = useMemo(
      () =>
        withList(
          withBreakEmptyReset(resetOptions)(
            withDeleteStartReset(resetOptions)(
              withBlock(withHistory(withReact(createEditor())))
            )
          )
        ),
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
          <ToolbarBlock format={BLOCKQUOTE} icon={<FormatQuote />} />
          <ToolbarCode icon={<Code />} />
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
