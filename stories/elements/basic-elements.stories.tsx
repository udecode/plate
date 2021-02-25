import 'prismjs/themes/prism.css';
import React from 'react';
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
import {
  BlockquotePlugin,
  CodeBlockPlugin,
  EditablePlugins,
  ExitBreakPlugin,
  HeadingPlugin,
  ParagraphPlugin,
  ResetBlockTypePlugin,
  SlatePlugin,
  SlatePlugins,
  SoftBreakPlugin,

} from '@udecode/slate-plugins';
import {
  HeadingToolbar,
  ToolbarElement,
  ToolbarCodeBlock,
} from '@udecode/slate-plugins-components';
import {
  headingTypes,
  initialValueBasicElements,
  options,
  optionsResetBlockTypes,
} from '../config/initialValues';

const id = 'Elements/Basic Elements';

export default {
  title: id,
  subcomponents: {
    BlockquotePlugin,
    CodeBlockPlugin,
    HeadingPlugin,
    ParagraphPlugin,
  },
};

export const Example = () => {
  const plugins: SlatePlugin[] = [];
  if (boolean('ParagraphPlugin', true)) plugins.push(ParagraphPlugin(options));
  if (boolean('BlockquotePlugin', true))
    plugins.push(BlockquotePlugin(options));
  if (boolean('CodePlugin', true)) plugins.push(CodeBlockPlugin(options));
  if (boolean('HeadingPlugin', true)) plugins.push(HeadingPlugin(options));
  if (boolean('ResetBlockTypePlugin', true))
    plugins.push(ResetBlockTypePlugin(optionsResetBlockTypes));
  if (boolean('SoftBreakPlugin', true))
    plugins.push(
      SoftBreakPlugin({
        rules: [
          { hotkey: 'shift+enter' },
          {
            hotkey: 'enter',
            query: {
              allow: [options.code_block.type, options.blockquote.type],
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
    return (
      <SlatePlugins id={id} initialValue={initialValueBasicElements}>
        <HeadingToolbar>
          <ToolbarElement type={options.h1.type} icon={<LooksOne />} />
          <ToolbarElement type={options.h2.type} icon={<LooksTwo />} />
          <ToolbarElement type={options.h3.type} icon={<Looks3 />} />
          <ToolbarElement type={options.h4.type} icon={<Looks4 />} />
          <ToolbarElement type={options.h5.type} icon={<Looks5 />} />
          <ToolbarElement type={options.h6.type} icon={<Looks6 />} />
          <ToolbarElement
            type={options.blockquote.type}
            icon={<FormatQuote />}
          />
          <ToolbarCodeBlock
            type={options.code_block.type}
            icon={<CodeBlock />}
            options={options}
          />
        </HeadingToolbar>
        <EditablePlugins
          id={id}
          plugins={plugins}
          placeholder="Enter some rich text…"
          spellCheck
          autoFocus
        />
      </SlatePlugins>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
