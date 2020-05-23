import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { CodeBlock } from '@styled-icons/boxicons-regular/CodeBlock';
import {
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
import {
  BlockquotePlugin,
  CodeBlockPlugin,
  EditablePlugins,
  HeadingPlugin,
  HeadingToolbar,
  ParagraphPlugin,
  pipe,
  ToolbarBlock,
  ToolbarCodeBlock,
  withBreakEmptyReset,
  withDeleteStartReset,
  withToggleType,
} from 'slate-plugins-next/src';
import { Slate, withReact } from 'slate-react';
import { initialValueBasicElements, nodeTypes } from '../config/initialValues';

export default {
  title: 'Element/Basic Elements',
  // component: BasicElementPlugins,
  subcomponents: {
    BlockquotePlugin,
    CodeBlockPlugin,
    HeadingPlugin,
    ParagraphPlugin,
  },
};

const resetOptions = {
  ...nodeTypes,
  types: [nodeTypes.typeBlockquote],
};

const withPlugins = [
  withReact,
  withHistory,
  withToggleType(nodeTypes),
  withDeleteStartReset(resetOptions),
  withBreakEmptyReset(resetOptions),
] as const;

export const Example = () => {
  const plugins: any[] = [];
  if (boolean('ParagraphPlugin', true))
    plugins.push(ParagraphPlugin(nodeTypes));
  if (boolean('BlockquotePlugin', true))
    plugins.push(BlockquotePlugin(nodeTypes));
  if (boolean('CodePlugin', true)) plugins.push(CodeBlockPlugin(nodeTypes));
  if (boolean('HeadingPlugin', true)) plugins.push(HeadingPlugin(nodeTypes));

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueBasicElements);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

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
          <ToolbarBlock
            type={nodeTypes.typeBlockquote}
            icon={<FormatQuote />}
          />
          <ToolbarCodeBlock {...nodeTypes} icon={<CodeBlock />} />
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
