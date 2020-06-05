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
import { Slate, withReact } from 'slate-react';
import {
  BlockquotePlugin,
  CodeBlockPlugin,
  EditablePlugins,
  ExitBreakPlugin,
  HeadingPlugin,
  HeadingToolbar,
  ParagraphPlugin,
  pipe,
  SlateDocument,
  SlatePlugin,
  SoftBreakPlugin,
  ToolbarElement,
  withResetBlockType,
  withToggleType,
} from '../../packages/slate-plugins/src';
import {
  headingTypes,
  initialValueBasicElements,
  nodeTypes,
} from '../config/initialValues';

export default {
  title: 'Elements/Basic Elements',
  subcomponents: {
    BlockquotePlugin,
    CodeBlockPlugin,
    HeadingPlugin,
    ParagraphPlugin,
  },
};

const withPlugins = [
  withReact,
  withHistory,
  withToggleType({ defaultType: nodeTypes.typeP }),
  withResetBlockType({
    types: [nodeTypes.typeBlockquote, nodeTypes.typeCodeBlock],
    defaultType: nodeTypes.typeP,
  }),
] as const;

export const Example = () => {
  const plugins: SlatePlugin[] = [];
  if (boolean('ParagraphPlugin', true))
    plugins.push(ParagraphPlugin(nodeTypes));
  if (boolean('BlockquotePlugin', true))
    plugins.push(BlockquotePlugin(nodeTypes));
  if (boolean('CodePlugin', true)) plugins.push(CodeBlockPlugin(nodeTypes));
  if (boolean('HeadingPlugin', true)) plugins.push(HeadingPlugin(nodeTypes));
  if (boolean('SoftBreakPlugin', true))
    plugins.push(
      SoftBreakPlugin({
        rules: [
          { hotkey: 'shift+enter' },
          {
            hotkey: 'enter',
            query: {
              allow: [nodeTypes.typeCodeBlock, nodeTypes.typeBlockquote],
            },
          },
        ],
      })
    );
  if (boolean('ExitBreakPlugin', true))
    plugins.push(
      ExitBreakPlugin({
        rules: [
          {
            hotkey: 'mod+enter',
          },
          {
            hotkey: 'mod+shift+enter',
            before: true,
          },
          {
            hotkey: 'enter',
            query: {
              start: true,
              end: true,
              allow: headingTypes,
            },
          },
        ],
      })
    );

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueBasicElements);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue as SlateDocument)}
      >
        <HeadingToolbar>
          <ToolbarElement type={nodeTypes.typeH1} icon={<LooksOne />} />
          <ToolbarElement type={nodeTypes.typeH2} icon={<LooksTwo />} />
          <ToolbarElement type={nodeTypes.typeH3} icon={<Looks3 />} />
          <ToolbarElement type={nodeTypes.typeH4} icon={<Looks4 />} />
          <ToolbarElement type={nodeTypes.typeH5} icon={<Looks5 />} />
          <ToolbarElement type={nodeTypes.typeH6} icon={<Looks6 />} />
          <ToolbarElement
            type={nodeTypes.typeBlockquote}
            icon={<FormatQuote />}
          />
          <ToolbarElement type={nodeTypes.typeCodeBlock} icon={<CodeBlock />} />
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
